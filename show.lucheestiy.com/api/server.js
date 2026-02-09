#!/usr/bin/env node
/**
 * show.lucheestiy.com — Devloop Reports API
 *
 * Zero-dependency Node server that exposes read-only endpoints for
 * /home/mlweb/<project>/devloop/runs/<run> artifacts.
 */

const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { Pool } = require("pg");

const PORT = Number(process.env.PORT || 3000);
const MLWEB_ROOT = process.env.MLWEB_ROOT || "/data/mlweb";
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 2_000_000);
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 5_000);
const AI_CHATS_DATABASE_URL =
  String(process.env.AI_CHATS_DATABASE_URL || "").trim() ||
  String(process.env.SHOW_DATABASE_URL || "").trim() ||
  "";
const AI_CHAT_STITCH_WINDOW_MINUTES = Math.max(
  1,
  Math.min(30, Number.parseInt(String(process.env.AI_CHAT_STITCH_WINDOW_MINUTES || "10"), 10) || 10),
);
const AI_CHAT_STITCH_MAX_SESSIONS = Math.max(
  2,
  Math.min(40, Number.parseInt(String(process.env.AI_CHAT_STITCH_MAX_SESSIONS || "18"), 10) || 18),
);

const PROJECT_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,120}$/;
const RUN_RE = /^\d{8}T\d{6}Z$/;
const FILE_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,200}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let aiChatsPool = null;

function getAiChatsPool() {
  if (!AI_CHATS_DATABASE_URL) return null;
  if (aiChatsPool) return aiChatsPool;
  aiChatsPool = new Pool({
    connectionString: AI_CHATS_DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  return aiChatsPool;
}

function isUndefinedTableError(error) {
  return Boolean(error && typeof error === "object" && error.code === "42P01");
}

function normalizeUuid(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  if (!UUID_RE.test(value)) return null;
  return value.toLowerCase();
}

function normalizeComparableText(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function readTurnSourceMessage(requestMeta) {
  if (!requestMeta || typeof requestMeta !== "object") return "";
  const ctx = requestMeta.vendorLookupContext;
  if (!ctx || typeof ctx !== "object") return "";
  return normalizeComparableText(ctx.sourceMessage || "");
}

async function detectStitchedSessionIds(pool, session, turns) {
  const defaultResult = { ids: [session.id], stitched: false, reason: null };
  if (!session || !session.id) return defaultResult;
  if (!Array.isArray(turns) || turns.length !== 1) return defaultResult;

  const sourceMessage = readTurnSourceMessage(turns[0].request_meta);
  if (!sourceMessage) return defaultResult;

  const nearbyRes = await pool.query(
    `
      SELECT
        s.id,
        s.last_message_at::text AS last_message_at,
        COALESCE(tc.turn_count, 0)::int AS turn_count,
        lt.user_message,
        lt.request_meta
      FROM ai_assistant_sessions s
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS turn_count
        FROM ai_assistant_turns t
        WHERE t.session_id = s.id
      ) tc ON true
      LEFT JOIN LATERAL (
        SELECT t.user_message, t.request_meta
        FROM ai_assistant_turns t
        WHERE t.session_id = s.id
        ORDER BY t.turn_index DESC
        LIMIT 1
      ) lt ON true
      WHERE s.user_id = $1
        AND (($2::text IS NULL AND s.source IS NULL) OR s.source = $2)
        AND s.last_message_at BETWEEN ($3::timestamptz - (($4::text || ' minutes')::interval))
                                 AND ($3::timestamptz + (($4::text || ' minutes')::interval))
      ORDER BY ABS(EXTRACT(EPOCH FROM (s.last_message_at - $3::timestamptz))) ASC, s.last_message_at ASC
      LIMIT $5
    `,
    [
      session.user_id,
      session.source || null,
      session.last_message_at,
      String(AI_CHAT_STITCH_WINDOW_MINUTES),
      Math.max(AI_CHAT_STITCH_MAX_SESSIONS * 6, AI_CHAT_STITCH_MAX_SESSIONS),
    ],
  );

  const matches = [];
  for (const row of nearbyRes.rows || []) {
    if (!row?.id) continue;
    const turnCount = Number(row.turn_count || 0);
    if (turnCount !== 1) continue;

    const turnSourceMessage = readTurnSourceMessage(row.request_meta);
    const turnUserMessage = normalizeComparableText(row.user_message || "");
    const isMatch = turnSourceMessage === sourceMessage || turnUserMessage === sourceMessage;
    if (!isMatch) continue;

    matches.push({
      id: row.id,
      lastMessageAt: row.last_message_at,
    });
  }

  if (!matches.find((m) => m.id === session.id)) {
    matches.push({ id: session.id, lastMessageAt: session.last_message_at });
  }

  matches.sort((a, b) => String(a.lastMessageAt).localeCompare(String(b.lastMessageAt)));
  const ids = [];
  for (const row of matches) {
    if (ids.includes(row.id)) continue;
    ids.push(row.id);
  }

  if (ids.length <= 1) return defaultResult;
  return { ids, stitched: true, reason: "source_message_chain" };
}

function setCommonHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj, null, 2);
  setCommonHeaders(res);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendText(res, status, body, contentType = "text/plain; charset=utf-8") {
  const buf = Buffer.from(String(body ?? ""), "utf8");
  setCommonHeaders(res);
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": buf.length,
  });
  res.end(buf);
}

function sendError(res, status, message) {
  sendJson(res, status, { ok: false, error: message });
}

function isSafeSegment(value, re) {
  if (!value || typeof value !== "string") return false;
  return re.test(value);
}

function safeDecode(seg) {
  try {
    return decodeURIComponent(seg);
  } catch {
    return null;
  }
}

async function statOrNull(p) {
  try {
    return await fsp.stat(p);
  } catch {
    return null;
  }
}

async function listProjects() {
  const now = Date.now();
  if (cache.projects && now - cache.projects.ts < CACHE_TTL_MS) return cache.projects.value;

  const entries = await fsp.readdir(MLWEB_ROOT, { withFileTypes: true });
  const projects = [];

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const id = ent.name;
    if (!isSafeSegment(id, PROJECT_RE)) continue;

    const runsDir = path.join(MLWEB_ROOT, id, "devloop", "runs");
    const st = await statOrNull(runsDir);
    if (!st || !st.isDirectory()) continue;

    const latest = await getLatestRunId(id).catch(() => null);
    projects.push({ id, latest });
  }

  projects.sort((a, b) => a.id.localeCompare(b.id));
  cache.projects = { ts: now, value: projects };
  return projects;
}

async function getLatestRunId(projectId) {
  const latestLink = path.join(MLWEB_ROOT, projectId, "devloop", "latest");
  try {
    const target = await fsp.readlink(latestLink);
    const runId = path.basename(target);
    if (RUN_RE.test(runId)) return runId;
  } catch {
    // ignore
  }

  // Fallback: infer from directory listing
  const runsDir = path.join(MLWEB_ROOT, projectId, "devloop", "runs");
  const entries = await fsp.readdir(runsDir, { withFileTypes: true });
  const runIds = entries
    .filter((e) => e.isDirectory() && RUN_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));
  return runIds[0] || null;
}

function parseSummaryMarkdown(md, runId) {
  const lines = String(md || "").split(/\r?\n/);
  const meta = {};
  let title = "";
  const links = {};

  if (lines[0] && lines[0].startsWith("# ")) {
    title = lines[0].slice(2).trim();
  }

  let section = "";
  for (const line of lines.slice(0, 200)) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) {
      section = h[1].trim().toLowerCase();
      continue;
    }

    const kv = /^-\s+([^:]+?):\s*(.+)\s*$/.exec(line);
    if (!kv) continue;

    const key = kv[1].trim();
    const value = kv[2].trim();
    meta[key] = value;

    if (section === "links") {
      links[key] = value;
    }
  }

  function to01(v) {
    const n = Number.parseInt(String(v ?? ""), 10);
    if (!Number.isFinite(n)) return null;
    return n ? 1 : 0;
  }

  return {
    id: runId,
    title: title || null,
    timeUtc: meta["Time (UTC)"] || runId,
    branch: meta["Branch"] || null,
    commit: meta["Commit"] || null,
    changed: to01(meta["Changed"]),
    buildOk: to01(meta["Build ok"]),
    pushOk: to01(meta["Push ok"]),
    deployOk: to01(meta["Deploy ok"]),
    codexOk: to01(meta["Codex ok"]),
    codexAttempts: meta["Codex attempts"] ? Number.parseInt(meta["Codex attempts"], 10) : null,
    codexSession: meta["Codex session"] || null,
    geminiOk: to01(meta["Gemini advice ok"]),
    kimiOk: to01(meta["Kimi advice ok"]),
    links,
  };
}

async function listRuns(projectId, limit) {
  const cacheKey = `${projectId}:${limit}`;
  const now = Date.now();
  const cached = cache.runs.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) return cached.value;

  const runsDir = path.join(MLWEB_ROOT, projectId, "devloop", "runs");
  const st = await statOrNull(runsDir);
  if (!st || !st.isDirectory()) throw new Error("runs directory not found");

  const entries = await fsp.readdir(runsDir, { withFileTypes: true });
  const runIds = entries
    .filter((e) => e.isDirectory() && RUN_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));

  const slice = runIds.slice(0, limit);
  const runs = await Promise.all(
    slice.map(async (runId) => {
      const summaryPath = path.join(runsDir, runId, "SUMMARY.md");
      const stSum = await statOrNull(summaryPath);
      if (!stSum || !stSum.isFile()) return { id: runId, hasSummary: 0 };
      const md = await fsp.readFile(summaryPath, "utf8");
      const parsed = parseSummaryMarkdown(md, runId);
      return { ...parsed, hasSummary: 1 };
    })
  );

  const latest = await getLatestRunId(projectId).catch(() => null);

  const value = { latest, runs };
  cache.runs.set(cacheKey, { ts: now, value });
  return value;
}

function contentTypeForFilename(name) {
  const lower = String(name).toLowerCase();
  if (lower.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (lower.endsWith(".json") || lower.endsWith(".jsonl")) return "application/json; charset=utf-8";
  if (lower.endsWith(".txt") || lower.endsWith(".log")) return "text/plain; charset=utf-8";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

async function listRunFiles(projectId, runId) {
  const runDir = path.join(MLWEB_ROOT, projectId, "devloop", "runs", runId);
  const st = await statOrNull(runDir);
  if (!st || !st.isDirectory()) throw new Error("run directory not found");

  const entries = await fsp.readdir(runDir, { withFileTypes: true });
  const files = [];

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const name = ent.name;
    if (!isSafeSegment(name, FILE_RE)) continue;
    const p = path.join(runDir, name);
    const stF = await statOrNull(p);
    if (!stF || !stF.isFile()) continue;
    files.push({
      name,
      size: stF.size,
      mtimeMs: stF.mtimeMs,
    });
  }

  files.sort((a, b) => a.name.localeCompare(b.name));
  return files;
}

async function streamFile(res, filePath, filename, opts = {}) {
  const st = await fsp.stat(filePath);
  if (!st.isFile()) throw new Error("not a file");

  setCommonHeaders(res);
  res.writeHead(200, {
    "Content-Type": contentTypeForFilename(filename),
    "Content-Length": st.size,
    ...(opts.download
      ? { "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}` }
      : {}),
  });

  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error("stream error", err);
    if (!res.headersSent) sendError(res, 500, "stream failed");
    else res.destroy(err);
  });
  stream.pipe(res);
}

async function listAiChatSessions(limit, queryText) {
  const pool = getAiChatsPool();
  if (!pool) {
    const err = new Error("AI_CHATS_DATABASE_URL is not configured");
    err.status = 503;
    throw err;
  }

  const safeLimit = Math.max(1, Math.min(300, Number.parseInt(String(limit || "120"), 10) || 120));
  const q = String(queryText || "").trim().toLowerCase();

  let sql = `
    SELECT
      s.id,
      s.source,
      s.created_at::text,
      s.updated_at::text,
      s.last_message_at::text,
      COALESCE(tc.turn_count, 0)::int AS turn_count,
      lt.user_message AS last_user_message,
      lt.assistant_message AS last_assistant_message,
      s.user_id::text AS user_id,
      s.user_email,
      s.user_name
    FROM ai_assistant_sessions s
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS turn_count
      FROM ai_assistant_turns t
      WHERE t.session_id = s.id
    ) tc ON true
    LEFT JOIN LATERAL (
      SELECT t.user_message, t.assistant_message
      FROM ai_assistant_turns t
      WHERE t.session_id = s.id
      ORDER BY t.turn_index DESC
      LIMIT 1
    ) lt ON true
  `;

  const args = [];
  if (q) {
    args.push(`%${q}%`);
    sql += `
      WHERE (
        LOWER(COALESCE(s.user_email, '')) LIKE $1 OR
        LOWER(COALESCE(s.user_name, '')) LIKE $1 OR
        LOWER(COALESCE(lt.user_message, '')) LIKE $1 OR
        LOWER(COALESCE(lt.assistant_message, '')) LIKE $1 OR
        LOWER(s.id::text) LIKE $1
      )
    `;
  }
  args.push(safeLimit);
  const limitArgIndex = args.length;
  sql += ` ORDER BY s.last_message_at DESC LIMIT $${limitArgIndex}`;

  try {
    const res = await pool.query(sql, args);
    return res.rows.map((row) => ({
      id: row.id,
      source: row.source || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
      turnCount: Number(row.turn_count || 0),
      lastUserMessage: row.last_user_message || null,
      lastAssistantMessage: row.last_assistant_message || null,
      user: {
        id: row.user_id || "",
        email: row.user_email || "",
        name: row.user_name || null,
      },
    }));
  } catch (error) {
    if (isUndefinedTableError(error)) return [];
    throw error;
  }
}

async function getAiChatSessionById(sessionIdRaw) {
  const sessionId = normalizeUuid(sessionIdRaw);
  if (!sessionId) {
    const err = new Error("invalid session id");
    err.status = 400;
    throw err;
  }

  const pool = getAiChatsPool();
  if (!pool) {
    const err = new Error("AI_CHATS_DATABASE_URL is not configured");
    err.status = 503;
    throw err;
  }

  try {
    const sessionRes = await pool.query(
      `
        SELECT
          s.id,
          s.user_id::text AS user_id,
          s.user_email,
          s.user_name,
          s.source,
          s.created_at::text,
          s.updated_at::text,
          s.last_message_at::text
        FROM ai_assistant_sessions s
        WHERE s.id = $1
        LIMIT 1
      `,
      [sessionId],
    );
    const session = sessionRes.rows[0] || null;
    if (!session) return null;

    const initialTurnsRes = await pool.query(
      `
        SELECT
          id,
          session_id::text,
          turn_index,
          user_message,
          assistant_message,
          request_meta,
          created_at::text
        FROM ai_assistant_turns
        WHERE session_id = $1
        ORDER BY turn_index ASC
        LIMIT 500
      `,
      [sessionId],
    );

    const chain = await detectStitchedSessionIds(pool, session, initialTurnsRes.rows || []);
    const chainIds = Array.isArray(chain.ids) && chain.ids.length > 0 ? chain.ids : [sessionId];

    const turnsRes = await pool.query(
      `
        SELECT
          t.id,
          t.session_id::text,
          t.turn_index,
          t.user_message,
          t.assistant_message,
          t.created_at::text
        FROM ai_assistant_turns t
        JOIN ai_assistant_sessions s ON s.id = t.session_id
        WHERE t.session_id = ANY($1::uuid[])
        ORDER BY s.last_message_at ASC, t.turn_index ASC
        LIMIT 1000
      `,
      [chainIds],
    );

    return {
      id: session.id,
      source: session.source || null,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      lastMessageAt: session.last_message_at,
      user: {
        id: session.user_id || "",
        email: session.user_email || "",
        name: session.user_name || null,
      },
      turns: turnsRes.rows.map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        turnIndex: Number(row.turn_index || 0),
        userMessage: row.user_message || "",
        assistantMessage: row.assistant_message || null,
        createdAt: row.created_at,
      })),
      sessionChain: {
        ids: chainIds,
        stitched: Boolean(chain.stitched),
        reason: chain.reason || null,
      },
    };
  } catch (error) {
    if (isUndefinedTableError(error)) return null;
    throw error;
  }
}

const cache = {
  projects: null,
  runs: new Map(),
};

const server = http.createServer(async (req, res) => {
  try {
    const method = (req.method || "GET").toUpperCase();
    if (method === "OPTIONS") {
      setCommonHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    if (method !== "GET") {
      sendError(res, 405, "method not allowed");
      return;
    }

    const base = `http://${req.headers.host || "localhost"}`;
    const url = new URL(req.url || "/", base);
    const pathname = url.pathname;
    let m;

    if (pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (pathname === "/api/ai-chats/health") {
      sendJson(res, 200, {
        ok: true,
        configured: Boolean(AI_CHATS_DATABASE_URL),
      });
      return;
    }

    if (pathname === "/api/ai-chats/sessions") {
      const limit = url.searchParams.get("limit") || "120";
      const q = url.searchParams.get("q") || "";
      const sessions = await listAiChatSessions(limit, q);
      sendJson(res, 200, { ok: true, sessions });
      return;
    }

    m = pathname.match(/^\/api\/ai-chats\/sessions\/([^/]+)\/?$/);
    if (m) {
      const id = safeDecode(m[1]);
      if (!id) {
        sendError(res, 400, "invalid session id");
        return;
      }
      const session = await getAiChatSessionById(id);
      if (!session) {
        sendError(res, 404, "session not found");
        return;
      }
      sendJson(res, 200, { ok: true, session });
      return;
    }

    if (pathname === "/api/devloop/projects") {
      const projects = await listProjects();
      sendJson(res, 200, { ok: true, root: MLWEB_ROOT, projects });
      return;
    }

    // /api/devloop/:project/runs?limit=50
    m = pathname.match(/^\/api\/devloop\/([^/]+)\/runs\/?$/);
    if (m) {
      const project = safeDecode(m[1]);
      if (!project || !isSafeSegment(project, PROJECT_RE)) {
        sendError(res, 400, "invalid project");
        return;
      }

      const limitRaw = url.searchParams.get("limit") || "50";
      const limit = Math.min(200, Math.max(1, Number.parseInt(limitRaw, 10) || 50));

      const data = await listRuns(project, limit);
      sendJson(res, 200, { ok: true, project, latest: data.latest, runs: data.runs });
      return;
    }

    // /api/devloop/:project/runs/:run/summary
    m = pathname.match(/^\/api\/devloop\/([^/]+)\/runs\/([^/]+)\/summary\/?$/);
    if (m) {
      const project = safeDecode(m[1]);
      const run = safeDecode(m[2]);
      if (!project || !isSafeSegment(project, PROJECT_RE)) {
        sendError(res, 400, "invalid project");
        return;
      }
      if (!run || !isSafeSegment(run, RUN_RE)) {
        sendError(res, 400, "invalid run id");
        return;
      }

      const p = path.join(MLWEB_ROOT, project, "devloop", "runs", run, "SUMMARY.md");
      const st = await statOrNull(p);
      if (!st || !st.isFile()) {
        sendError(res, 404, "SUMMARY.md not found");
        return;
      }

      if (st.size > MAX_FILE_BYTES) {
        sendError(res, 413, `SUMMARY.md too large (${st.size} bytes)`);
        return;
      }

      const md = await fsp.readFile(p, "utf8");
      sendText(res, 200, md, "text/markdown; charset=utf-8");
      return;
    }

    // /api/devloop/:project/runs/:run/files
    m = pathname.match(/^\/api\/devloop\/([^/]+)\/runs\/([^/]+)\/files\/?$/);
    if (m) {
      const project = safeDecode(m[1]);
      const run = safeDecode(m[2]);
      if (!project || !isSafeSegment(project, PROJECT_RE)) {
        sendError(res, 400, "invalid project");
        return;
      }
      if (!run || !isSafeSegment(run, RUN_RE)) {
        sendError(res, 400, "invalid run id");
        return;
      }

      const files = await listRunFiles(project, run);
      sendJson(res, 200, { ok: true, project, run, files });
      return;
    }

    // /api/devloop/:project/runs/:run/raw/:file
    m = pathname.match(/^\/api\/devloop\/([^/]+)\/runs\/([^/]+)\/raw\/([^/]+)\/?$/);
    if (m) {
      const project = safeDecode(m[1]);
      const run = safeDecode(m[2]);
      const file = safeDecode(m[3]);
      if (!project || !isSafeSegment(project, PROJECT_RE)) {
        sendError(res, 400, "invalid project");
        return;
      }
      if (!run || !isSafeSegment(run, RUN_RE)) {
        sendError(res, 400, "invalid run id");
        return;
      }
      if (!file || !isSafeSegment(file, FILE_RE)) {
        sendError(res, 400, "invalid file name");
        return;
      }

      const p = path.join(MLWEB_ROOT, project, "devloop", "runs", run, file);
      const st = await statOrNull(p);
      if (!st || !st.isFile()) {
        sendError(res, 404, "file not found");
        return;
      }

      const download = url.searchParams.get("download") === "1";
      if (!download && st.size > MAX_FILE_BYTES) {
        sendError(res, 413, `file too large to view inline (${st.size} bytes). Use ?download=1`);
        return;
      }

      await streamFile(res, p, file, { download });
      return;
    }

    sendError(res, 404, "not found");
  } catch (err) {
    console.error(err);
    const status = Number(err?.status || 0) || 500;
    sendError(res, status, err?.message || "internal error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Devloop Reports API listening on :${PORT} (root=${MLWEB_ROOT})`);
});
