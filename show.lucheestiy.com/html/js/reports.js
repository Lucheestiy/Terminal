(() => {
  const $ = (id) => document.getElementById(id);

  const apiStatusEl = $("apiStatus");
  const projectSelectEl = $("projectSelect");
  const searchInputEl = $("searchInput");
  const refreshBtn = $("refreshBtn");
  const runsListEl = $("runsList");

  const runTitleEl = $("runTitle");
  const runMetaEl = $("runMeta");
  const openDevBtn = $("openDevBtn");
  const copyLinkBtn = $("copyLinkBtn");
  const statusBadgesEl = $("statusBadges");

  const summaryEl = $("summary");
  const filesEl = $("files");
  const filesMetaEl = $("filesMeta");

  const state = {
    projects: [],
    project: null,
    runs: [],
    latest: null,
    run: null,
    autoRefresh: { timer: null, runId: null },
  };

  function setApiStatus(text, isError = false) {
    if (!apiStatusEl) return;
    apiStatusEl.textContent = text;
    apiStatusEl.style.color = isError ? "#ef4444" : "";
  }

  async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
    }
    return await res.json();
  }

  async function fetchText(url) {
    const res = await fetch(url, { headers: { Accept: "text/plain" } });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
    }
    return await res.text();
  }

  function getParams() {
    const p = new URLSearchParams(location.search);
    return {
      project: p.get("project"),
      run: p.get("run"),
    };
  }

  function setParams(project, run) {
    const p = new URLSearchParams(location.search);
    if (project) p.set("project", project);
    else p.delete("project");

    if (run) p.set("run", run);
    else p.delete("run");

    const next = `${location.pathname}?${p.toString()}`;
    history.replaceState(null, "", next);
  }

  function commitShort(hash) {
    if (!hash) return "";
    return String(hash).slice(0, 8);
  }

  function runIdToDate(runId) {
    const s = String(runId || "");
    if (!/^\d{8}T\d{6}Z$/.test(s)) return null;
    const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  function fmtLocal(runId) {
    const d = runIdToDate(runId);
    if (!d) return "";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function sizeHuman(bytes) {
    const n = Number(bytes || 0);
    if (!Number.isFinite(n)) return "";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function badge(label, ok, title) {
    const span = document.createElement("span");
    span.className = `badge ${ok === null ? "warn" : ok ? "ok" : "bad"}`;
    span.textContent = `${ok === null ? "·" : ok ? "✓" : "✕"} ${label}`;
    if (title) span.title = title;
    return span;
  }

  function triOk(value) {
    if (value === null || value === undefined) return null;
    return !!value;
  }

  function changedBadge(value) {
    if (value === null || value === undefined) return badge("Changed", null);
    return value ? badge("Changed", true) : badge("No change", null);
  }

  function renderRunBadges(run) {
    statusBadgesEl.textContent = "";

    if (run.hasSummary === 0) {
      const isLatest = state.latest && run.id === state.latest;
      statusBadgesEl.appendChild(badge(isLatest ? "Running" : "No summary", null));
      return;
    }

    statusBadgesEl.appendChild(badge("Codex", triOk(run.codexOk)));
    statusBadgesEl.appendChild(changedBadge(run.changed));
    statusBadgesEl.appendChild(badge("Build", triOk(run.buildOk)));
    if (run.changed === 0) statusBadgesEl.appendChild(badge("Push (skipped)", null));
    else statusBadgesEl.appendChild(badge("Push", triOk(run.pushOk)));
    statusBadgesEl.appendChild(badge("Deploy", triOk(run.deployOk)));

    if (run.geminiOk !== undefined && run.geminiOk !== null) statusBadgesEl.appendChild(badge("Gemini", triOk(run.geminiOk)));
    if (run.kimiOk !== undefined && run.kimiOk !== null) statusBadgesEl.appendChild(badge("Kimi", triOk(run.kimiOk)));
  }

  function renderRunsList() {
    if (!runsListEl) return;
    runsListEl.textContent = "";

    const q = String(searchInputEl?.value || "").trim().toLowerCase();

    const runs = state.runs.filter((r) => {
      if (!q) return true;
      const hay = [r.id, r.branch, r.commit].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });

    if (runs.length === 0) {
      const empty = document.createElement("div");
      empty.className = "emptyState";
      empty.textContent = "Нет запусков";
      runsListEl.appendChild(empty);
      return;
    }

    for (const run of runs) {
      const card = document.createElement("div");
      card.className = `runCard${state.run === run.id ? " active" : ""}`;
      card.addEventListener("click", () => selectRun(run.id));

      const top = document.createElement("div");
      top.className = "runTop";

      const idEl = document.createElement("div");
      idEl.className = "runId";
      idEl.textContent = run.id;

      const timeEl = document.createElement("div");
      timeEl.className = "runTime";
      timeEl.textContent = fmtLocal(run.id);

      top.appendChild(idEl);
      top.appendChild(timeEl);

      const meta = document.createElement("div");
      meta.className = "runMetaLine";

      const hasSummary = run.hasSummary === 1;
      const isLatest = state.latest && run.id === state.latest;

      if (!hasSummary) {
        meta.appendChild(badge(isLatest ? "Running" : "No summary", null));
        meta.appendChild(badge("Codex", null));
        meta.appendChild(badge("Build", null));
        meta.appendChild(badge("Deploy", null));
      } else {
        meta.appendChild(badge("Codex", triOk(run.codexOk)));
        meta.appendChild(badge("Build", triOk(run.buildOk)));
        meta.appendChild(badge("Deploy", triOk(run.deployOk)));
      }

      const extra = document.createElement("span");
      extra.className = "badge";
      const parts = [];
      if (run.branch) parts.push(run.branch);
      if (run.commit) parts.push(commitShort(run.commit));
      extra.textContent = parts.length ? parts.join(" · ") : "—";
      meta.appendChild(extra);

      card.appendChild(top);
      card.appendChild(meta);

      runsListEl.appendChild(card);
    }
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function linkify(escapedText) {
    // Input must already be HTML-escaped.
    const re = /(https?:\/\/[^\s<]+[^<\s.,;:)\]])/g;
    return escapedText.replace(re, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    });
  }

  function renderInline(text) {
    // Escape first, then simple inline code, then linkify.
    let out = escapeHtml(text);
    out = out.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
    out = linkify(out);
    return out;
  }

  function mdToHtml(md) {
    const lines = String(md || "").split(/\r?\n/);
    let html = "";
    let inList = false;
    let inCode = false;
    let codeBuf = [];

    function closeList() {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    }

    function closeCode() {
      if (inCode) {
        const code = escapeHtml(codeBuf.join("\n"));
        html += `<pre><code>${code}</code></pre>`;
        inCode = false;
        codeBuf = [];
      }
    }

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        if (inCode) closeCode();
        else {
          closeList();
          inCode = true;
          codeBuf = [];
        }
        continue;
      }

      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      const h1 = /^#\s+(.+?)\s*$/.exec(line);
      if (h1) {
        closeList();
        html += `<h1>${renderInline(h1[1])}</h1>`;
        continue;
      }

      const h2 = /^##\s+(.+?)\s*$/.exec(line);
      if (h2) {
        closeList();
        html += `<h2>${renderInline(h2[1])}</h2>`;
        continue;
      }

      const li = /^-\s+(.+?)\s*$/.exec(line);
      if (li) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${renderInline(li[1])}</li>`;
        continue;
      }

      if (!line.trim()) {
        closeList();
        continue;
      }

      closeList();
      html += `<p>${renderInline(line)}</p>`;
    }

    closeList();
    closeCode();

    return html || "<div class=\"emptyState\">(empty)</div>";
  }

  function setRunHeader(run) {
    runTitleEl.textContent = `${state.project} / ${run.id}`;

    const metaLines = [];
    if (run.hasSummary === 0) {
      const isLatest = state.latest && run.id === state.latest;
      metaLines.push(isLatest ? "status: running (no SUMMARY.md yet)" : "status: no SUMMARY.md");
    }
    if (run.branch) metaLines.push(`branch: ${run.branch}`);
    if (run.commit) metaLines.push(`commit: ${run.commit}`);
    if (run.codexSession) metaLines.push(`codex session: ${run.codexSession}`);

    runMetaEl.textContent = metaLines.join("\n");

    const devUrl = run.links && run.links.Dev ? String(run.links.Dev) : null;
    if (devUrl) {
      openDevBtn.href = devUrl;
      openDevBtn.style.display = "";
    } else {
      openDevBtn.href = "#";
      openDevBtn.style.display = "none";
    }

    renderRunBadges(run);
  }

  function stopAutoRefresh() {
    if (state.autoRefresh.timer) clearInterval(state.autoRefresh.timer);
    state.autoRefresh.timer = null;
    state.autoRefresh.runId = null;
  }

  function startAutoRefresh(runId) {
    if (state.autoRefresh.timer && state.autoRefresh.runId === runId) return;
    stopAutoRefresh();
    state.autoRefresh.runId = runId;
    state.autoRefresh.timer = setInterval(() => {
      if (state.run !== runId) return stopAutoRefresh();
      // Refresh runs list (to pick up SUMMARY.md creation) and artifacts.
      loadRuns().catch(() => {});
    }, 12_000);
  }

  async function loadProjects() {
    setApiStatus("подключение…");

    const data = await fetchJson("/api/devloop/projects");
    if (!data.ok) throw new Error(data.error || "API error");

    state.projects = data.projects || [];

    projectSelectEl.textContent = "";
    for (const p of state.projects) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.id;
      projectSelectEl.appendChild(opt);
    }

    const params = getParams();
    const candidate = params.project && state.projects.find((p) => p.id === params.project) ? params.project : null;

    const preferred = [
      "biznesinfo-develop.lucheestiy.com",
      "biznesinfo.lucheestiy.com",
    ];
    const preferredExisting = preferred.find((id) => state.projects.some((p) => p.id === id)) || null;

    state.project = candidate || preferredExisting || (state.projects[0] ? state.projects[0].id : null);

    if (state.project) projectSelectEl.value = state.project;

    setApiStatus(`OK (${state.projects.length})`);
  }

  async function loadRuns() {
    if (!state.project) {
      setApiStatus("нет проектов", true);
      return;
    }

    setApiStatus("загрузка запусков…");

    const url = `/api/devloop/${encodeURIComponent(state.project)}/runs?limit=120`;
    const data = await fetchJson(url);
    if (!data.ok) throw new Error(data.error || "API error");

    state.runs = data.runs || [];
    state.latest = data.latest || null;

    const params = getParams();
    const wanted = params.run && state.runs.find((r) => r.id === params.run) ? params.run : null;
    state.run = wanted || state.latest || (state.runs[0] ? state.runs[0].id : null);

    setApiStatus(`OK (${state.runs.length})`);

    renderRunsList();

    if (state.run) await selectRun(state.run, { noFocus: true });
  }

  async function selectRun(runId, opts = {}) {
    if (!runId) return;

    if (state.autoRefresh.runId && state.autoRefresh.runId !== runId) stopAutoRefresh();

    state.run = runId;
    setParams(state.project, state.run);

    renderRunsList();

    const run = state.runs.find((r) => r.id === runId) || { id: runId, links: {} };
    setRunHeader(run);

    // Summary
    summaryEl.innerHTML = `<div class="emptyState">Загрузка SUMMARY.md…</div>`;
    try {
      const md = await fetchText(`/api/devloop/${encodeURIComponent(state.project)}/runs/${encodeURIComponent(runId)}/summary`);
      summaryEl.innerHTML = mdToHtml(md);
      stopAutoRefresh();
    } catch (err) {
      const msg = err && err.message ? String(err.message) : String(err);
      const is404 = msg.includes("HTTP 404");
      if (is404 && run.hasSummary === 0) {
        summaryEl.innerHTML = `<div class="emptyState">SUMMARY.md пока не создан — вероятно, запуск ещё идёт. Обновление каждые ~12 секунд.</div>`;
        if (state.latest && runId === state.latest) startAutoRefresh(runId);
      } else {
        summaryEl.innerHTML = `<div class="emptyState">Не удалось загрузить SUMMARY.md: ${escapeHtml(msg)}</div>`;
      }
    }

    // Files
    filesEl.textContent = "";
    filesMetaEl.textContent = "";

    try {
      const filesData = await fetchJson(`/api/devloop/${encodeURIComponent(state.project)}/runs/${encodeURIComponent(runId)}/files`);
      if (!filesData.ok) throw new Error(filesData.error || "API error");

      const files = filesData.files || [];
      filesMetaEl.textContent = `${files.length} files`;

      if (files.length === 0) {
        filesEl.innerHTML = `<div class="emptyState">Нет файлов</div>`;
        return;
      }

      for (const f of files) {
        const row = document.createElement("div");
        row.className = "fileRow";

        const left = document.createElement("div");

        const name = document.createElement("span");
        name.className = "fileName";
        name.textContent = f.name;

        const meta = document.createElement("span");
        meta.className = "fileMeta";
        meta.textContent = `${sizeHuman(f.size)} · ${new Date(f.mtimeMs).toLocaleString()}`;

        left.appendChild(name);
        left.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "fileActions";

        const view = document.createElement("a");
        view.className = "btn btn-secondary btn-sm";
        view.textContent = "View";
        view.href = `/api/devloop/${encodeURIComponent(state.project)}/runs/${encodeURIComponent(runId)}/raw/${encodeURIComponent(f.name)}`;
        view.target = "_blank";
        view.rel = "noopener";

        const dl = document.createElement("a");
        dl.className = "btn btn-secondary btn-sm";
        dl.textContent = "Download";
        dl.href = `/api/devloop/${encodeURIComponent(state.project)}/runs/${encodeURIComponent(runId)}/raw/${encodeURIComponent(f.name)}?download=1`;
        dl.target = "_blank";
        dl.rel = "noopener";

        actions.appendChild(view);
        actions.appendChild(dl);

        row.appendChild(left);
        row.appendChild(actions);

        filesEl.appendChild(row);
      }

      if (!opts.noFocus) {
        // Scroll to top when selecting a run from the list
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      filesEl.innerHTML = `<div class="emptyState">Не удалось загрузить файлы: ${escapeHtml(err.message || String(err))}</div>`;
    }
  }

  async function copyLink() {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      copyLinkBtn.textContent = "Скопировано";
      setTimeout(() => (copyLinkBtn.textContent = "Скопировать ссылку"), 1200);
    } catch {
      // Fallback
      window.prompt("Copy link:", url);
    }
  }

  async function init() {
    try {
      await loadProjects();
      await loadRuns();
    } catch (err) {
      console.error(err);
      setApiStatus("ошибка API", true);
      if (summaryEl) summaryEl.innerHTML = `<div class="emptyState">API error: ${escapeHtml(err.message || String(err))}</div>`;
    }

    refreshBtn?.addEventListener("click", () => loadRuns().catch((e) => console.error(e)));

    projectSelectEl?.addEventListener("change", () => {
      state.project = projectSelectEl.value;
      state.run = null;
      setParams(state.project, null);
      loadRuns().catch((e) => console.error(e));
    });

    searchInputEl?.addEventListener("input", () => renderRunsList());
    copyLinkBtn?.addEventListener("click", () => copyLink());
  }

  init();
})();
