(() => {
  const statusEl = document.getElementById("status");
  const refreshBtn = document.getElementById("refreshBtn");
  const systemBtn = document.getElementById("systemBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const clearBtn = document.getElementById("clearBtn");
  const showText = document.getElementById("showText");
  const showFeed = document.getElementById("showFeed");
  const expandBtn = document.getElementById("expandBtn");
  const collapseBtn = document.getElementById("collapseBtn");
  const sessionsEl = document.getElementById("sessions");
  const selectedTitleEl = document.getElementById("selectedTitle");
  const selectedMetaEl = document.getElementById("selectedMeta");
  const feedPanel = document.getElementById("feedPanel");
  const eventsEl = document.getElementById("events");
  const rateEl = document.getElementById("rate");
  const lastEventEl = document.getElementById("lastEvent");
  const codexOriginEl = document.getElementById("codexOrigin");
  const canvas = document.getElementById("flowCanvas");

  const langRuBtn = document.getElementById("langRu");
  const langEnBtn = document.getElementById("langEn");

  const sidebarTitleEl = document.getElementById("sidebarTitle");
  const systemStreamNameEl = document.getElementById("systemStreamName");
  const systemStreamPillEl = document.getElementById("systemStreamPill");
  const systemStreamMetaEl = document.getElementById("systemStreamMeta");
  const sessionsTitleEl = document.getElementById("sessionsTitle");
  const hintTitleEl = document.getElementById("hintTitle");
  const hintTextEl = document.getElementById("hintText");
  const toggleTextLabelEl = document.getElementById("toggleTextLabel");
  const toggleFeedLabelEl = document.getElementById("toggleFeedLabel");
  const hudEventsPerMinEl = document.getElementById("hudEventsPerMin");
  const hudLastEventLabelEl = document.getElementById("hudLastEvent");
  const hudPromptLabelEl = document.getElementById("hudPromptLabel");
  const hudPromptEl = document.getElementById("hudPrompt");
  const hudToolLabelEl = document.getElementById("hudToolLabel");
  const hudToolEl = document.getElementById("hudTool");
  const hudChipUserEl = document.getElementById("hudChipUser");
  const hudChipAssistantEl = document.getElementById("hudChipAssistant");
  const hudChipToolsEl = document.getElementById("hudChipTools");
  const hudChipOutputEl = document.getElementById("hudChipOutput");
  const hudChipMetaEl = document.getElementById("hudChipMeta");
  const topToolsEl = document.getElementById("topTools");
  const feedTitleEl = document.getElementById("feedTitle");

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

  const MAX_DOM_EVENTS = 400;
  const MAX_PENDING = 800;
  const MAX_PARTICLES = 220;
  const PARTICLE_MS = 1150;
  const TICK_MS = 1000 / 60;

  const LANG_KEY = "show_codex_lang";
  const I18N = {
    ru: {
      locale: "ru-RU",
      sidebar_title: "Потоки Codex",
      btn_refresh: "Обновить",
      system_stream_name: "Общий codex-tui.log",
      system_stream_pill: "система",
      system_stream_meta: "Общий лог (может перемешиваться)",
      sessions_title: "Сессии rollout",
      hint_title: "Подсказка",
      hint_text: "“Текст” показывает больше деталей и тела событий. “Лента” включает/выключает список событий справа.",
      btn_pause: "Пауза",
      btn_resume: "Продолжить",
      btn_clear: "Очистить",
      toggle_text: "Текст",
      toggle_feed: "Лента",
      hud_events_per_min: "События/мин",
      hud_last_event: "Последнее",
      hud_prompt_label: "Запрос",
      hud_tool_label: "Инструмент",
      hud_chip_user: "Пользователь",
      hud_chip_assistant: "Ассистент",
      hud_chip_tools: "Инструменты",
      hud_chip_output: "Вывод",
      hud_chip_meta: "Мета/Система",
      feed_title: "Лента",
      btn_expand: "Развернуть",
      btn_collapse: "Свернуть",
      selected_system_title: "Общий codex-tui.log",
      selected_system_meta: "Сводный поток (может перемешиваться при нескольких CLI)",
      selected_pick_stream: "Выберите поток…",
      selected_session: "Сессия",
      pill_active: "активна",
      pill_idle: "ожидание",
      label_id: "id",
      label_updated: "обновлено",
      label_cli: "cli",
      label_provider: "провайдер",
      label_cwd: "cwd",
      now_user: "пользователь",
      now_tool: "инструмент",
      kind_user: "пользователь",
      kind_assistant: "ассистент",
      kind_tool_call: "инструмент",
      kind_tool_output: "вывод",
      kind_meta: "мета",
      kind_system: "система",
      last_user: "пользователь",
      last_assistant: "ассистент",
      last_tool_call: "вызов инструмента",
      last_tool_output: "вывод инструмента",
      last_meta: "мета",
      last_system: "система",
      status_connecting: "Подключение…",
      status_connected: "Подключено",
      status_disconnected_retrying: "Отключено — переподключаюсь…",
      status_connection_error: "Ошибка соединения",
      status_error: "Ошибка: {msg}",
      status_sessions_unavailable: "API сессий недоступен: {msg}",
      status_paused: "Пауза — новых: {newCount}{droppedPart}",
      status_paused_dropped: " (пропущено: {dropped})",
      origin: "источник",
      node_user: "Пользователь",
      node_assistant: "Ассистент",
      node_tools: "Инструменты",
      tool_shell: "команда",
      tool_patch: "патч",
      tool_web: "веб",
      tool_generic: "инструмент",
      label_exit_code: "код",
      web_search: "поиск",
      web_open: "открыть",
      web_click: "клик",
      web_find: "найти",
      web_screenshot: "скрин",
      web_images: "картинки",
      web_weather: "погода",
      web_finance: "финансы",
      web_sports: "спорт",
      web_time: "время",
      web_calc: "калькулятор",
    },
    en: {
      locale: "en-US",
      sidebar_title: "Codex Streams",
      btn_refresh: "Refresh",
      system_stream_name: "Global codex-tui.log",
      system_stream_pill: "system",
      system_stream_meta: "Combined log (may interleave)",
      sessions_title: "Rollout sessions",
      hint_title: "Hint",
      hint_text: "“Text” shows more details and event bodies. “Feed” toggles the event list on the right.",
      btn_pause: "Pause",
      btn_resume: "Resume",
      btn_clear: "Clear",
      toggle_text: "Text",
      toggle_feed: "Feed",
      hud_events_per_min: "Events/min",
      hud_last_event: "Last",
      hud_prompt_label: "Prompt",
      hud_tool_label: "Tool",
      hud_chip_user: "User",
      hud_chip_assistant: "Assistant",
      hud_chip_tools: "Tools",
      hud_chip_output: "Output",
      hud_chip_meta: "Meta/System",
      feed_title: "Feed",
      btn_expand: "Expand",
      btn_collapse: "Collapse",
      selected_system_title: "Global codex-tui.log",
      selected_system_meta: "Combined stream (may interleave when multiple CLIs run)",
      selected_pick_stream: "Select a stream…",
      selected_session: "Session",
      pill_active: "active",
      pill_idle: "idle",
      label_id: "id",
      label_updated: "updated",
      label_cli: "cli",
      label_provider: "provider",
      label_cwd: "cwd",
      now_user: "user",
      now_tool: "tool",
      kind_user: "user",
      kind_assistant: "assistant",
      kind_tool_call: "tool",
      kind_tool_output: "output",
      kind_meta: "meta",
      kind_system: "system",
      last_user: "user",
      last_assistant: "assistant",
      last_tool_call: "tool call",
      last_tool_output: "tool output",
      last_meta: "meta",
      last_system: "system",
      status_connecting: "Connecting…",
      status_connected: "Connected",
      status_disconnected_retrying: "Disconnected — retrying…",
      status_connection_error: "Connection error",
      status_error: "Error: {msg}",
      status_sessions_unavailable: "Sessions API unavailable: {msg}",
      status_paused: "Paused — new: {newCount}{droppedPart}",
      status_paused_dropped: " (+{dropped} dropped)",
      origin: "source",
      node_user: "User",
      node_assistant: "Assistant",
      node_tools: "Tools",
      tool_shell: "shell",
      tool_patch: "patch",
      tool_web: "web",
      tool_generic: "tool",
      label_exit_code: "exit",
      web_search: "search",
      web_open: "open",
      web_click: "click",
      web_find: "find",
      web_screenshot: "screenshot",
      web_images: "images",
      web_weather: "weather",
      web_finance: "finance",
      web_sports: "sports",
      web_time: "time",
      web_calc: "calculator",
    },
  };

  let lang = localStorage.getItem(LANG_KEY) || "ru";
  if (!I18N[lang]) lang = "ru";

  function locale() {
    return I18N[lang].locale;
  }

  function t(key, vars) {
    const dict = I18N[lang] || I18N.en;
    const fallback = I18N.en || {};
    const tpl = dict[key] ?? fallback[key] ?? key;
    if (!vars || typeof tpl !== "string") return tpl;
    return tpl.replace(/\{([a-zA-Z0-9_]+)\}/g, (_m, k) => (vars[k] === undefined ? `{${k}}` : String(vars[k])));
  }

  function setLang(next) {
    if (!I18N[next]) return;
    lang = next;
    localStorage.setItem(LANG_KEY, lang);
    applyLang();
  }

  function setLangButtons() {
    langRuBtn.classList.toggle("active", lang === "ru");
    langEnBtn.classList.toggle("active", lang === "en");
  }

  function applyLang() {
    document.documentElement.lang = lang;
    setLangButtons();

    sidebarTitleEl.textContent = t("sidebar_title");
    refreshBtn.textContent = t("btn_refresh");
    systemStreamNameEl.textContent = t("system_stream_name");
    systemStreamPillEl.textContent = t("system_stream_pill");
    systemStreamMetaEl.textContent = t("system_stream_meta");
    sessionsTitleEl.textContent = t("sessions_title");
    hintTitleEl.textContent = t("hint_title");
    hintTextEl.textContent = t("hint_text");
    toggleTextLabelEl.textContent = t("toggle_text");
    toggleFeedLabelEl.textContent = t("toggle_feed");
    hudEventsPerMinEl.textContent = t("hud_events_per_min");
    hudLastEventLabelEl.textContent = t("hud_last_event");
    hudPromptLabelEl.textContent = t("hud_prompt_label");
    hudToolLabelEl.textContent = t("hud_tool_label");
    hudChipUserEl.textContent = t("hud_chip_user");
    hudChipAssistantEl.textContent = t("hud_chip_assistant");
    hudChipToolsEl.textContent = t("hud_chip_tools");
    hudChipOutputEl.textContent = t("hud_chip_output");
    hudChipMetaEl.textContent = t("hud_chip_meta");
    feedTitleEl.textContent = t("feed_title");
    expandBtn.textContent = t("btn_expand");
    collapseBtn.textContent = t("btn_collapse");
    clearBtn.textContent = t("btn_clear");
    pauseBtn.textContent = paused ? t("btn_resume") : t("btn_pause");

    codexOriginEl.textContent = `${t("origin")}: ${CODEX_ORIGIN}`;

    // Re-render dynamic bits
    setSelectedHeader();
    renderSessions(latestSessions);
    updateExistingFeedLanguage();

    if (nodes) {
      nodes.user.label = t("node_user");
      nodes.assistant.label = t("node_assistant");
      nodes.tools.label = t("node_tools");
    }

    // Avoid mixed-language particles/toasts after switching language.
    particles.length = 0;
    pulses.length = 0;
    toasts.user = null;
    toasts.assistant = null;
    toasts.tools = null;

    updateRate(Date.now());
  }

  const params = new URLSearchParams(location.search);
  const originParam = params.get("codex");

  const defaultOrigin =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:8120"
      : "https://codex.lucheestiy.com";

  function normalizeOrigin(value) {
    if (!value) return defaultOrigin;
    try {
      const u = new URL(value);
      return `${u.protocol}//${u.host}`;
    } catch {
      try {
        const u = new URL(`https://${value}`);
        return `${u.protocol}//${u.host}`;
      } catch {
        return defaultOrigin;
      }
    }
  }

  const CODEX_ORIGIN = normalizeOrigin(originParam || defaultOrigin);

  function wsBaseFromOrigin(origin) {
    const u = new URL(origin);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "";
    u.search = "";
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  }

  const WS_BASE = wsBaseFromOrigin(CODEX_ORIGIN);

  let paused = false;
  let ws = null;
  let reconnectTimer = null;
  let connectSeq = 0;
  let pending = [];
  let droppedPending = 0;

  let latestSessions = [];
  let selected = { stream: "system", session: null };

  const eventTimes = [];
  let lastEventInfo = null;
  let lastPromptText = "";
  let lastToolCall = null;
  const toolHistory = [];

  const particles = [];
  const pulses = [];
  const toasts = { user: null, assistant: null, tools: null };
  let particleId = 0;
  let nodes = null;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function statusError(msg) {
    setStatus(t("status_error", { msg: msg || "?" }));
  }

  function safeJsonParse(text) {
    if (!text || typeof text !== "string") return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  function clampText(text, maxChars) {
    const s = String(text ?? "");
    if (!Number.isFinite(maxChars) || maxChars <= 0) return s;
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}…`;
  }

  function normalizeOneLine(text) {
    return String(text ?? "").replace(/\s+/g, " ").trim();
  }

  function fmtTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function fmtDateTime(ms) {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return String(ms);
    return d.toLocaleString(locale());
  }

  function shortUuid(uuid) {
    if (!uuid) return "";
    return String(uuid).slice(0, 8);
  }

  function applyTextMode() {
    document.body.classList.toggle("no-text", !showText.checked);
    // Session list includes "current task" details; re-render to adapt truncation.
    renderSessions(latestSessions);
    updateRate(Date.now());
  }

  function applyFeedMode() {
    feedPanel.classList.toggle("hidden", !showFeed.checked);
  }

  function clearAll() {
    pending = [];
    droppedPending = 0;
    eventsEl.textContent = "";
    particles.length = 0;
    pulses.length = 0;
    toasts.user = null;
    toasts.assistant = null;
    toasts.tools = null;
    eventTimes.length = 0;
    lastEventInfo = null;
    lastPromptText = "";
    lastToolCall = null;
    toolHistory.length = 0;
    lastEventEl.textContent = "—";
    rateEl.textContent = "0";
    hudPromptEl.textContent = "—";
    hudToolEl.textContent = "—";
    topToolsEl.textContent = "";
  }

  function safeEventMs(ev) {
    const ts = ev?.ts ?? null;
    const ms = ts ? Date.parse(ts) : NaN;
    return Number.isFinite(ms) ? ms : Date.now();
  }

  function updateRate(nowMs) {
    while (eventTimes.length && nowMs - eventTimes[0] > 60_000) eventTimes.shift();
    const rate = Math.round((eventTimes.length / 60) * 60);
    rateEl.textContent = String(rate);
    lastEventEl.textContent = lastEventInfo ? formatLastEventLabel(lastEventInfo) : "—";
    updateHud(nowMs);
  }

  function isBoringUserText(text) {
    const t0 = normalizeOneLine(text).toLowerCase();
    if (!t0) return true;
    if (t0.startsWith("<environment_context")) return true;
    if (t0.includes("agents.md instructions") || t0.includes("agends.md instructions")) return true;
    if (t0.includes("<instructions>")) return true;
    if (t0.includes("<turn_aborted>")) return true;
    return false;
  }

  function recordToolUsage(toolName, nowMs) {
    if (!toolName) return;
    toolHistory.push({ ms: nowMs, name: toolName });
    // prune
    while (toolHistory.length && nowMs - toolHistory[0].ms > 60_000) toolHistory.shift();
  }

  function renderTopTools(nowMs) {
    while (toolHistory.length && nowMs - toolHistory[0].ms > 60_000) toolHistory.shift();
    const counts = new Map();
    for (const rec of toolHistory) {
      if (!rec || typeof rec !== "object") continue;
      const k = String(rec.name || "");
      if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    topToolsEl.textContent = "";
    for (const [name, count] of entries) {
      const chip = document.createElement("div");
      chip.className = "toolChip";
      const c = toolColor(name);
      chip.style.borderColor = c;
      chip.style.background = "rgba(15, 23, 42, 0.55)";

      const label = document.createElement("span");
      label.className = "name";
      label.textContent = `${toolIcon(name)} ${toolShortName(name)}`;
      label.title = name;

      const num = document.createElement("span");
      num.className = "count";
      num.textContent = `×${count}`;

      chip.append(label, num);
      topToolsEl.appendChild(chip);
    }
  }

  function updateHud(nowMs) {
    const prompt = normalizeOneLine(firstLine(lastPromptText || ""));
    if (!prompt) hudPromptEl.textContent = "—";
    else hudPromptEl.textContent = clampText(prompt, showText.checked ? 96 : 64);

    if (!lastToolCall) hudToolEl.textContent = "—";
    else {
      const icon = toolIcon(lastToolCall.name);
      const shortName = toolShortName(lastToolCall.name);
      const detail = lastToolCall.detail ? normalizeOneLine(lastToolCall.detail) : "";
      const short = `${icon} ${shortName}`;
      const compact = detail ? `${icon} ${shortName}: ${clampText(detail, 56)}` : short;
      const long = detail ? `${icon} ${shortName}: ${clampText(detail, 86)}` : short;
      hudToolEl.textContent = showText.checked ? long : compact;
    }

    renderTopTools(nowMs);
  }

  function setSelectedHeader() {
    if (selected.stream === "system") {
      selectedTitleEl.textContent = t("selected_system_title");
      selectedMetaEl.textContent = t("selected_system_meta");
      return;
    }
    if (selected.stream === "rollout") {
      const s = latestSessions.find((x) => x.id === selected.session);
      if (s?.startedAtLocal) selectedTitleEl.textContent = `${t("selected_session")}: ${s.startedAtLocal}`;
      else selectedTitleEl.textContent = `${t("selected_session")}: ${selected.session}`;
      const bits = [];
      if (s?.uuid) bits.push(`uuid: ${s.uuid}`);
      if (s?.meta?.cli_version) bits.push(`${t("label_cli")}: ${s.meta.cli_version}`);
      if (s?.meta?.model_provider) bits.push(`${t("label_provider")}: ${s.meta.model_provider}`);
      if (s?.meta?.cwd) bits.push(`${t("label_cwd")}: ${s.meta.cwd}`);
      selectedMetaEl.textContent = bits.join("\n");
      return;
    }
    selectedTitleEl.textContent = t("selected_pick_stream");
    selectedMetaEl.textContent = "";
  }

  function setActiveButtons() {
    systemBtn.classList.toggle("active", selected.stream === "system");
    for (const el of sessionsEl.querySelectorAll(".sessionBtn")) {
      const isActive = selected.stream === "rollout" && el.dataset.session === selected.session;
      el.classList.toggle("active", isActive);
    }
  }

  function selectSystem() {
    selected = { stream: "system", session: null };
    setSelectedHeader();
    setActiveButtons();
    clearAll();
    connectWs();
  }

  function selectRollout(sessionId) {
    selected = { stream: "rollout", session: sessionId };
    setSelectedHeader();
    setActiveButtons();
    clearAll();
    connectWs();
  }

  function kindLabel(kind) {
    if (kind === "user") return t("kind_user");
    if (kind === "assistant") return t("kind_assistant");
    if (kind === "tool_call") return t("kind_tool_call");
    if (kind === "tool_output") return t("kind_tool_output");
    if (kind === "meta") return t("kind_meta");
    if (kind === "system") return t("kind_system");
    return t("kind_system");
  }

  function updateExistingFeedLanguage() {
    for (const el of eventsEl.querySelectorAll("details.event")) {
      const kind = el.dataset.kind || "system";
      const kindEl = el.querySelector(".eventKind");
      if (kindEl) {
        kindEl.textContent = kindLabel(kind);
        kindEl.title = kind;
      }

      const titleEl = el.querySelector(".eventTitle");
      if (!titleEl) continue;
      if (kind === "tool_call" && el.dataset.toolName) {
        const toolName = el.dataset.toolName || "";
        const toolDetail = el.dataset.toolDetail || "";
        const icon = toolIcon(toolName);
        const sn = toolShortName(toolName);
        titleEl.textContent = toolDetail ? `${icon} ${sn}: ${clampText(toolDetail, 72)}` : `${icon} ${sn}`;
        continue;
      }
      if (kind === "tool_output" && (el.dataset.toolName || el.dataset.exitCode)) {
        const toolName = el.dataset.toolName || "";
        const code = el.dataset.exitCode ? Number.parseInt(el.dataset.exitCode, 10) : null;
        const isErr = Number.isFinite(code) && code !== 0;
        const icon = toolName ? toolIcon(toolName) : "📦";
        const sn = toolName ? toolShortName(toolName) : t("kind_tool_output");
        const base = `${isErr ? "❌" : "✅"} ${icon} ${sn}`;
        titleEl.textContent = Number.isFinite(code) && code !== 0 ? `${base} (${t("label_exit_code")} ${code})` : base;
        continue;
      }
      if ((kind === "user" || kind === "assistant") && el.dataset.msg) {
        const prefix = kind === "user" ? "⌨️" : "💬";
        titleEl.textContent = `${prefix} ${el.dataset.msg}`;
      }
    }
  }

  function extractTextFromContentArray(arr) {
    const out = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      if (typeof item.text === "string" && item.text.trim()) out.push(item.text);
    }
    return out.join("\n").trim();
  }

  function extractExitCode(text) {
    const raw = String(text ?? "");
    if (!raw) return null;
    const m = /Exit code:\s*([0-9]{1,6})/i.exec(raw);
    if (!m) return null;
    const n = Number.parseInt(m[1], 10);
    return Number.isFinite(n) ? n : null;
  }

  function summarizeWebRunArgs(parsed) {
    if (!parsed || typeof parsed !== "object") return "";
    const parts = [];
    const push = (labelKey, value) => {
      const v = normalizeOneLine(value);
      if (!v) return;
      parts.push(`${t(labelKey)}: ${clampText(v, 48)}`);
    };

    const searchQ = Array.isArray(parsed.search_query) ? parsed.search_query : null;
    if (searchQ && searchQ.length) {
      const qs = searchQ
        .map((x) => (x && typeof x === "object" ? x.q : ""))
        .filter((x) => typeof x === "string" && x.trim())
        .map((x) => x.trim());
      if (qs.length) {
        const first = qs[0];
        const extra = qs.length - 1;
        push("web_search", extra > 0 ? `${first} (+${extra})` : first);
      }
    }

    const imgQ = Array.isArray(parsed.image_query) ? parsed.image_query : null;
    if (imgQ && imgQ.length) {
      const qs = imgQ
        .map((x) => (x && typeof x === "object" ? x.q : ""))
        .filter((x) => typeof x === "string" && x.trim())
        .map((x) => x.trim());
      if (qs.length) {
        const first = qs[0];
        const extra = qs.length - 1;
        push("web_images", extra > 0 ? `${first} (+${extra})` : first);
      }
    }

    const open = Array.isArray(parsed.open) ? parsed.open : null;
    if (open && open.length) {
      const ref = open[0] && typeof open[0] === "object" ? open[0].ref_id : "";
      if (typeof ref === "string" && ref.trim()) push("web_open", ref.trim());
    }

    const click = Array.isArray(parsed.click) ? parsed.click : null;
    if (click && click.length) {
      const id = click[0] && typeof click[0] === "object" ? click[0].id : null;
      if (Number.isFinite(id)) push("web_click", `#${id}`);
    }

    const find = Array.isArray(parsed.find) ? parsed.find : null;
    if (find && find.length) {
      const pat = find[0] && typeof find[0] === "object" ? find[0].pattern : "";
      if (typeof pat === "string" && pat.trim()) push("web_find", pat.trim());
    }

    const screenshot = Array.isArray(parsed.screenshot) ? parsed.screenshot : null;
    if (screenshot && screenshot.length) {
      const pageno = screenshot[0] && typeof screenshot[0] === "object" ? screenshot[0].pageno : null;
      if (Number.isFinite(pageno)) push("web_screenshot", `p${pageno}`);
    }

    const weather = Array.isArray(parsed.weather) ? parsed.weather : null;
    if (weather && weather.length) {
      const loc = weather[0] && typeof weather[0] === "object" ? weather[0].location : "";
      if (typeof loc === "string" && loc.trim()) push("web_weather", loc.trim());
    }

    const finance = Array.isArray(parsed.finance) ? parsed.finance : null;
    if (finance && finance.length) {
      const tickers = finance
        .map((x) => (x && typeof x === "object" ? x.ticker : ""))
        .filter((x) => typeof x === "string" && x.trim())
        .map((x) => x.trim().toUpperCase());
      if (tickers.length) push("web_finance", tickers.slice(0, 3).join(", "));
    }

    const sports = Array.isArray(parsed.sports) ? parsed.sports : null;
    if (sports && sports.length) {
      const s0 = sports[0] && typeof sports[0] === "object" ? sports[0] : null;
      if (s0) {
        const bits = [];
        if (typeof s0.fn === "string" && s0.fn.trim()) bits.push(s0.fn.trim());
        if (typeof s0.league === "string" && s0.league.trim()) bits.push(s0.league.trim());
        if (typeof s0.team === "string" && s0.team.trim()) bits.push(s0.team.trim());
        if (bits.length) push("web_sports", bits.join(" "));
      }
    }

    const time = Array.isArray(parsed.time) ? parsed.time : null;
    if (time && time.length) {
      const off = time[0] && typeof time[0] === "object" ? time[0].utc_offset : "";
      if (typeof off === "string" && off.trim()) push("web_time", off.trim());
    }

    const calculator = Array.isArray(parsed.calculator) ? parsed.calculator : null;
    if (calculator && calculator.length) {
      const expr = calculator[0] && typeof calculator[0] === "object" ? calculator[0].expression : "";
      if (typeof expr === "string" && expr.trim()) push("web_calc", expr.trim());
    }

    return parts.slice(0, 2).join(" · ");
  }

  function normalizeUiEventText(ev) {
    const kind = ev?.kind ?? "system";
    const raw = String(ev?.text ?? "");
    if (!raw) return "";

    if (kind === "user" || kind === "assistant") {
      const parsed = safeJsonParse(raw);
      if (Array.isArray(parsed)) {
        const txt = extractTextFromContentArray(parsed);
        if (txt) return txt;
      }
      return raw;
    }

    if (kind === "tool_call") {
      const toolName = toolNameFromTitle(ev?.title);
      if (String(toolName).toLowerCase().includes("apply_patch")) {
        const files = extractPatchFiles(raw);
        if (files) return files;
      }

      const parsed = safeJsonParse(raw);
      if (parsed && typeof parsed === "object") {
        if (toolName === "web.run") {
          const summary = summarizeWebRunArgs(parsed);
          if (summary) return summary;
        }

        for (const k of ["cmd", "command", "expression", "q", "path", "ref_id"]) {
          if (typeof parsed[k] === "string" && parsed[k].trim()) return parsed[k];
        }
        try {
          return JSON.stringify(parsed);
        } catch {
          return raw;
        }
      }
      return raw;
    }

    return raw;
  }

  function toolNameFromTitle(title) {
    const raw = String(title ?? "");
    const m = /^Tool call:\s*(.+)\s*$/i.exec(raw);
    if (!m) return "";
    return m[1].trim();
  }

  function toolShortName(name) {
    const raw = String(name ?? "").trim();
    if (!raw) return "";
    const last = raw.split(".").pop() || raw;
    if (last === "shell_command" || raw === "exec_command") return t("tool_shell");
    if (last === "apply_patch") return t("tool_patch");
    if (raw === "web.run" || last === "web") return t("tool_web");
    return last || t("tool_generic");
  }

  function toolIcon(name) {
    const raw = String(name ?? "").toLowerCase();
    if (!raw) return "🛠️";
    if (raw.includes("shell") || raw.includes("exec_command")) return "🖥️";
    if (raw.includes("apply_patch")) return "✍️";
    if (raw.includes("web")) return "🌐";
    if (raw.includes("calculator")) return "🧮";
    if (raw.includes("image")) return "🖼️";
    return "🛠️";
  }

  function toolColor(name) {
    const raw = String(name ?? "").toLowerCase();
    if (!raw) return "#f59e0b";
    if (raw.includes("apply_patch")) return "#a78bfa";
    if (raw === "web.run" || raw.includes("web.run") || raw.endsWith(".web")) return "#2dd4bf";
    if (raw.includes("update_plan")) return "#60a5fa";
    if (raw.includes("request_user_input")) return "#f472b6";
    if (raw.includes("view_image") || raw.includes("image")) return "#fb7185";
    if (raw.includes("calculator")) return "#c084fc";
    if (raw.includes("shell") || raw.includes("exec_command")) return "#f59e0b";
    return "#f59e0b";
  }

  function firstLine(text) {
    const s = String(text ?? "");
    const idx = s.indexOf("\n");
    if (idx === -1) return s;
    return s.slice(0, idx);
  }

  function extractPatchFiles(text) {
    const src = String(text ?? "");
    if (!src) return "";
    const re = /^\*\*\*\s+(Update File|Add File|Delete File):\s+(.+)\s*$/gim;
    const files = [];
    let m;
    while ((m = re.exec(src)) !== null) {
      const f = String(m[2] ?? "").trim();
      if (!f) continue;
      if (!files.includes(f)) files.push(f);
      if (files.length >= 12) break;
    }
    if (!files.length) return "";
    const shown = files.slice(0, 4);
    const extra = files.length - shown.length;
    return extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", ");
  }

  function toolLabelForEvent(ev) {
    const name = toolNameFromTitle(ev?.title);
    const rawText = String(ev?.text ?? "");
    const normalized = normalizeUiEventText(ev);
    let detail = normalizeOneLine(firstLine(normalized));
    const lower = String(name).toLowerCase();
    if (lower.includes("apply_patch")) {
      const files = extractPatchFiles(rawText);
      if (files) detail = files;
    }
    if (name === "web.run") {
      const parsed = safeJsonParse(rawText);
      if (parsed && typeof parsed === "object") {
        const summary = summarizeWebRunArgs(parsed);
        if (summary) detail = summary;
      }
    }
    const shortName = toolShortName(name);
    const icon = toolIcon(name);
    const color = toolColor(name);
    const short = `${icon} ${shortName}`;
    const compact = detail ? `${icon} ${shortName}: ${clampText(detail, 34)}` : short;
    const long = detail ? `${icon} ${shortName}: ${clampText(detail, 86)}` : short;
    return { name, shortName, detail, short, compact, long, color };
  }

  function formatLastEventLabel(info) {
    const kind = info?.kind ?? "system";
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(info.ev);
      return tool.detail ? `${t("last_tool_call")}: ${clampText(tool.detail, 48)}` : `${t("last_tool_call")}: ${tool.shortName}`;
    }
    if (kind === "tool_output") {
      const code = extractExitCode(String(info.ev?.text ?? ""));
      if (code !== null && code !== 0) return `${t("last_tool_output")}: ${t("label_exit_code")} ${code}`;
      return t("last_tool_output");
    }
    if (kind === "user") {
      const msg = normalizeOneLine(firstLine(normalizeUiEventText(info.ev)));
      return msg ? `${t("last_user")}: ${clampText(msg, 58)}` : t("last_user");
    }
    if (kind === "assistant") {
      const msg = normalizeOneLine(firstLine(normalizeUiEventText(info.ev)));
      return msg ? `${t("last_assistant")}: ${clampText(msg, 58)}` : t("last_assistant");
    }
    if (kind === "meta") return t("last_meta");
    return t("last_system");
  }

  function formatSessionNow(s) {
    const sum = s?.summary;
    if (!sum || typeof sum !== "object") return "";

    const lines = [];
    const userTxt = sum.user?.text ? normalizeOneLine(sum.user.text) : "";
    if (userTxt) {
      lines.push(`👤 ${clampText(userTxt, showText.checked ? 140 : 92)}`);
    }

    const toolName = sum.tool?.name ? String(sum.tool.name) : "";
    const toolDetailRaw = sum.tool?.detail ? String(sum.tool.detail) : "";
    let toolDetail = toolDetailRaw ? normalizeOneLine(toolDetailRaw) : "";
    if (String(toolName).toLowerCase().includes("apply_patch")) {
      const files = extractPatchFiles(toolDetailRaw);
      if (files) toolDetail = files;
    }
    if (toolName === "web.run") {
      const parsed = safeJsonParse(toolDetail);
      if (parsed && typeof parsed === "object") {
        const summary = summarizeWebRunArgs(parsed);
        if (summary) toolDetail = summary;
      }
    }
    if (toolName || toolDetail) {
      const sn = toolShortName(toolName);
      const icon = toolIcon(toolName);
      const detail = toolDetail ? clampText(toolDetail, showText.checked ? 140 : 92) : "";
      lines.push(detail ? `${icon} ${sn}: ${detail}` : `${icon} ${sn}`);
    }

    return lines.join("\n");
  }

  function renderSessions(sessions) {
    sessionsEl.textContent = "";
    for (const s of sessions) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sessionBtn";
      btn.dataset.stream = "rollout";
      btn.dataset.session = s.id;
      if (selected.stream === "rollout" && selected.session === s.id) btn.classList.add("active");

      const top = document.createElement("div");
      top.className = "sessionTop";

      const name = document.createElement("span");
      name.className = "sessionName";
      name.textContent = s.startedAtLocal || s.file;

      const pill = document.createElement("span");
      pill.className = "pill" + (s.active ? " active" : "");
      pill.textContent = s.active ? t("pill_active") : t("pill_idle");

      top.append(name, pill);

      const nowText = formatSessionNow(s);
      const now = document.createElement("div");
      now.className = "sessionNow";
      now.textContent = nowText || "";

      const meta = document.createElement("div");
      meta.className = "sessionMeta";
      const bits = [];
      bits.push(`${t("label_id")}: ${shortUuid(s.uuid)}`);
      bits.push(`${t("label_updated")}: ${fmtDateTime(s.mtimeMs)}`);
      if (s.meta?.cli_version) bits.push(`${t("label_cli")}: ${s.meta.cli_version}`);
      if (s.meta?.model_provider) bits.push(`${t("label_provider")}: ${s.meta.model_provider}`);
      if (s.meta?.cwd) bits.push(`${t("label_cwd")}: ${s.meta.cwd}`);
      meta.textContent = bits.join("\n");

      btn.append(top);
      if (nowText) btn.append(now);
      btn.append(meta);

      btn.addEventListener("click", () => selectRollout(s.id));
      sessionsEl.appendChild(btn);
    }
  }

  async function refreshSessions() {
    try {
      const res = await fetch(`${CODEX_ORIGIN}/api/sessions`, { cache: "no-store", credentials: "include" });
      const data = await res.json();
      latestSessions = Array.isArray(data.sessions) ? data.sessions : [];
      renderSessions(latestSessions);

      if (selected.stream === "rollout") {
        const stillThere = latestSessions.find((s) => s.id === selected.session);
        if (!stillThere) selectSystem();
      }
    } catch (e) {
      setStatus(t("status_sessions_unavailable", { msg: e?.message || String(e) }));
    }
  }

  function addEventToFeed(ev) {
    const kind = ev?.kind ?? "system";
    const details = document.createElement("details");
    details.className = `event kind-${kind}`;
    details.dataset.kind = kind;

    const summary = document.createElement("summary");

    const time = document.createElement("span");
    time.className = "eventTime";
    time.textContent = fmtTime(ev?.ts);

    const kindEl = document.createElement("span");
    kindEl.className = "eventKind";
    kindEl.textContent = kindLabel(kind);
    kindEl.title = kind;

    const bodyText = normalizeUiEventText(ev);

    const title = document.createElement("span");
    title.className = "eventTitle";
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      if (tool.name) details.dataset.toolName = tool.name;
      if (tool.detail) details.dataset.toolDetail = tool.detail;
      title.textContent = tool.detail ? `${tool.short}: ${clampText(tool.detail, 72)}` : tool.short;
    } else if (kind === "tool_output") {
      const rawOut = String(ev?.text ?? "");
      const code = extractExitCode(rawOut);
      const toolName = lastToolCall?.name ? String(lastToolCall.name) : "";
      if (toolName) details.dataset.toolName = toolName;
      if (code !== null) details.dataset.exitCode = String(code);
      const isErr = code !== null && code !== 0;
      const icon = toolName ? toolIcon(toolName) : "📦";
      const sn = toolName ? toolShortName(toolName) : t("kind_tool_output");
      const base = `${isErr ? "❌" : "✅"} ${icon} ${sn}`;
      title.textContent = code !== null && code !== 0 ? `${base} (${t("label_exit_code")} ${code})` : base;
    } else if (kind === "user") {
      const msg = normalizeOneLine(firstLine(bodyText));
      const shown = msg && !isBoringUserText(msg) ? clampText(msg, 72) : "";
      if (shown) details.dataset.msg = shown;
      title.textContent = shown ? `⌨️ ${shown}` : ev?.title ?? "";
    } else if (kind === "assistant") {
      const msg = normalizeOneLine(firstLine(bodyText));
      const shown = msg ? clampText(msg, 72) : "";
      if (shown) details.dataset.msg = shown;
      title.textContent = shown ? `💬 ${shown}` : ev?.title ?? "";
    } else {
      title.textContent = ev?.title ?? "";
    }

    const size = document.createElement("span");
    size.className = "eventSize";
    size.textContent = bodyText ? `${bodyText.length}` : "";

    summary.append(time, kindEl, title, size);

    const body = document.createElement("div");
    body.className = "eventBody";
    body.textContent = bodyText;

    details.append(summary, body);
    details.open = false;

    eventsEl.appendChild(details);
    while (eventsEl.children.length > MAX_DOM_EVENTS) eventsEl.removeChild(eventsEl.firstElementChild);
  }

  function maybeSpawnParticlesForInit(events) {
    const tail = events.slice(-40);
    const now = performance.now();
    for (let i = 0; i < tail.length; i += 1) {
      const ev = tail[i];
      spawnParticle(ev, now - (tail.length - 1 - i) * 14);
    }
  }

  function ingestEventForState(ev, nowMs) {
    const kind = ev?.kind ?? "system";
    if (kind === "user") {
      const txt = normalizeUiEventText(ev);
      if (txt && !isBoringUserText(txt)) lastPromptText = txt;
      return;
    }
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      lastToolCall = tool;
      recordToolUsage(tool.name, nowMs);
    }
  }

  function setToast(nodeKey, text, color, nowPerf) {
    if (!nodes || !nodes[nodeKey]) return;
    const clean = normalizeOneLine(text);
    if (!clean) return;
    toasts[nodeKey] = { text: clampText(clean, 92), color, t0: nowPerf, ms: 2400 };
  }

  function handleEvent(ev) {
    const nowMs = safeEventMs(ev);
    eventTimes.push(nowMs);

    ingestEventForState(ev, nowMs);

    const kind = ev?.kind ?? "system";
    const nowPerf = performance.now();
    if (kind === "user") {
      const txt = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      if (txt && !isBoringUserText(txt)) {
        const shown = clampText(txt, showText.checked ? 92 : 56);
        setToast("user", `⌨️ ${shown}`, "#4f46e5", nowPerf);
      }
    }
    if (kind === "assistant") {
      const txt = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      if (txt) {
        const shown = clampText(txt, showText.checked ? 92 : 56);
        setToast("assistant", `💬 ${shown}`, "#22c55e", nowPerf);
      }
    }
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      setToast("tools", showText.checked ? tool.long : tool.compact || tool.short, tool.color, nowPerf);
    }
    if (kind === "tool_output") {
      const rawOut = String(ev?.text ?? "");
      const code = extractExitCode(rawOut);
      const isErr = code !== null && code !== 0;
      const toolName = lastToolCall?.name ? String(lastToolCall.name) : "";
      const icon = toolName ? toolIcon(toolName) : "📦";
      const sn = toolName ? toolShortName(toolName) : t("kind_tool_output");
      let msg = `${isErr ? "❌" : "✅"} ${icon} ${sn}`;
      if (code !== null && showText.checked) msg += ` (${t("label_exit_code")} ${code})`;
      const color = isErr ? "#ef4444" : lastToolCall?.color || "#38bdf8";
      setToast("assistant", msg, color, nowPerf);
    }

    lastEventInfo = { kind, ev };
    updateRate(nowMs);
    addEventToFeed(ev);
    spawnParticle(ev, nowPerf);
  }

  function flushPending() {
    const batch = pending;
    pending = [];
    for (const ev of batch) handleEvent(ev);
    droppedPending = 0;
  }

  function handleIncoming(message) {
    if (!message || typeof message !== "object") return;
    if (message.type === "error") {
      statusError(message.message || (lang === "ru" ? "неизвестно" : "unknown"));
      return;
    }
    if (message.type === "init") {
      clearAll();
      const items = Array.isArray(message.events) ? message.events : [];
      const evs = [];
      for (const item of items) {
        if (item && item.type === "event" && item.event) {
          evs.push(item.event);
          addEventToFeed(item.event);
          ingestEventForState(item.event, safeEventMs(item.event));
        }
      }
      maybeSpawnParticlesForInit(evs);
      if (evs.length) lastEventInfo = { kind: evs[evs.length - 1]?.kind ?? "system", ev: evs[evs.length - 1] };
      updateRate(Date.now());
      setStatus(t("status_connected"));
      return;
    }
    if (message.type === "event") {
      if (paused) {
        pending.push(message.event);
        if (pending.length > MAX_PENDING) {
          const extra = pending.length - MAX_PENDING;
          pending = pending.slice(-MAX_PENDING);
          droppedPending += extra;
        }
        const droppedPart = droppedPending ? t("status_paused_dropped", { dropped: droppedPending }) : "";
        setStatus(t("status_paused", { newCount: pending.length, droppedPart }));
      } else {
        handleEvent(message.event);
      }
    }
  }

  function connectWs() {
    if (reconnectTimer) clearTimeout(reconnectTimer);

    connectSeq += 1;
    const seq = connectSeq;

    if (ws) {
      try {
        ws.onclose = null;
        ws.close();
      } catch {
        // ignore
      }
      ws = null;
    }

    let url = `${WS_BASE}/ws/system`;
    if (selected.stream === "rollout" && selected.session) {
      url = `${WS_BASE}/ws/rollout?session=${encodeURIComponent(selected.session)}`;
    }

    ws = new WebSocket(url);
    setStatus(t("status_connecting"));

    ws.onopen = () => setStatus(t("status_connected"));
    ws.onmessage = (ev) => {
      let msg = null;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        msg = { type: "event", event: { ts: null, kind: "system", title: "raw", text: String(ev.data) } };
      }
      handleIncoming(msg);
    };
    ws.onerror = () => setStatus(t("status_connection_error"));
    ws.onclose = () => {
      if (seq !== connectSeq) return;
      setStatus(t("status_disconnected_retrying"));
      reconnectTimer = setTimeout(connectWs, 1200);
    };
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes = {
      user: { x: w * 0.18, y: h * 0.56, r: 44, label: t("node_user"), icon: "👤", color: "#4f46e5" },
      assistant: { x: w * 0.5, y: h * 0.48, r: 54, label: t("node_assistant"), icon: "🧠", color: "#22c55e" },
      tools: { x: w * 0.82, y: h * 0.56, r: 44, label: t("node_tools"), icon: "🛠️", color: "#f59e0b" },
    };
  }

  function drawGrid(w, h) {
    ctx.save();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    const step = 42;
    for (let x = (Date.now() / 45) % step; x < w + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = (Date.now() / 70) % step; y < h + step; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEdge(a, b, color, alpha) {
    const dx = (b.x - a.x) * 0.55;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.bezierCurveTo(a.x + dx, a.y, b.x - dx, b.y, b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawNode(n) {
    ctx.save();

    // Glow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = n.color;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + 14, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Accent ring
    ctx.strokeStyle = n.color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r - 4, 0, Math.PI * 2);
    ctx.stroke();

    // Icon + label
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f1f5f9";
    ctx.font = `700 ${Math.max(14, Math.round(n.r * 0.42))}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.icon, n.x, n.y - 6);

    ctx.fillStyle = "rgba(241, 245, 249, 0.92)";
    ctx.font = "600 13px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(n.label, n.x, n.y + n.r * 0.62);
    ctx.restore();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function pulseNode(nodeKey, color, nowPerf) {
    if (!nodes || !nodes[nodeKey]) return;
    pulses.push({ key: nodeKey, color: color || "#94a3b8", t0: nowPerf, ms: 720 });
    while (pulses.length > 90) pulses.shift();
  }

  function drawPulses(nowPerf) {
    if (!nodes) return;
    for (let i = pulses.length - 1; i >= 0; i -= 1) {
      const p = pulses[i];
      const t = (nowPerf - p.t0) / p.ms;
      if (t >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const n = nodes[p.key];
      if (!n) continue;
      const k = easeOutCubic(Math.max(0, Math.min(1, t)));
      const r = n.r + 8 + k * 32;
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.24;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function fitText(text, maxWidth) {
    const raw = String(text ?? "");
    if (!raw) return "";
    if (!Number.isFinite(maxWidth) || maxWidth <= 0) return raw;
    if (ctx.measureText(raw).width <= maxWidth) return raw;
    let lo = 0;
    let hi = raw.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const candidate = `${raw.slice(0, mid)}…`;
      if (ctx.measureText(candidate).width <= maxWidth) lo = mid + 1;
      else hi = mid;
    }
    const cut = Math.max(0, lo - 1);
    return `${raw.slice(0, cut)}…`;
  }

  function drawToast(nodeKey, nowPerf) {
    if (!nodes) return;
    const toast = toasts[nodeKey];
    if (!toast) return;

    const t = (nowPerf - toast.t0) / toast.ms;
    if (t >= 1) {
      toasts[nodeKey] = null;
      return;
    }

    const n = nodes[nodeKey];
    if (!n) return;

    const k = easeOutCubic(Math.max(0, Math.min(1, t)));
    const alpha = (1 - k) * 0.92;

    let align = "center";
    let anchorX = n.x;
    let anchorY = n.y - n.r - 42;
    if (nodeKey === "user") {
      align = "left";
      anchorX = n.x - n.r - 4;
    } else if (nodeKey === "tools") {
      align = "right";
      anchorX = n.x + n.r + 4;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "600 12px system-ui, -apple-system, Segoe UI, sans-serif";
    const maxTextW = 320;
    const text = fitText(toast.text, maxTextW);
    if (!text) {
      ctx.restore();
      return;
    }
    const padX = 10;
    const boxH = 26;
    const textW = Math.min(maxTextW, ctx.measureText(text).width);
    const boxW = textW + padX * 2;

    let bx = anchorX - boxW / 2;
    if (align === "left") bx = anchorX;
    if (align === "right") bx = anchorX - boxW;
    const by = anchorY;

    ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
    ctx.strokeStyle = toast.color || "rgba(148, 163, 184, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, bx, by, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    const tx = align === "left" ? bx + padX : align === "right" ? bx + boxW - padX : bx + boxW / 2;
    ctx.fillText(text, tx, by + boxH / 2);
    ctx.restore();
  }

  function drawToasts(nowPerf) {
    drawToast("user", nowPerf);
    drawToast("assistant", nowPerf);
    drawToast("tools", nowPerf);
  }

  function flowForEvent(ev) {
    const kind = ev?.kind ?? "system";
    const title = String(ev?.title ?? "").toLowerCase();

    if (kind === "user") return { from: "user", to: "assistant", color: "#4f46e5", label: t("kind_user") };
    if (kind === "assistant") {
      if (title.includes("reasoning")) return { from: "assistant", to: "assistant", color: "#22c55e", label: t("kind_assistant") };
      return { from: "assistant", to: "user", color: "#22c55e", label: t("kind_assistant") };
    }
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      return { from: "assistant", to: "tools", color: tool.color, label: clampText(tool.shortName || t("tool_generic"), 18) };
    }
    if (kind === "tool_output") return { from: "tools", to: "assistant", color: "#38bdf8", label: t("kind_tool_output") };
    if (kind === "meta") return { from: "assistant", to: "assistant", color: "#94a3b8", label: t("kind_meta") };
    return { from: "assistant", to: "assistant", color: "#64748b", label: t("kind_system") };
  }

  function spawnParticle(ev, nowPerf) {
    if (!nodes) resizeCanvas();
    if (!nodes) return;
    const flow = flowForEvent(ev);
    const a = nodes[flow.from];
    const b = nodes[flow.to];
    if (!a || !b) return;

    const base = {
      id: (particleId += 1),
      kind: ev?.kind ?? "system",
      label: flow.label,
      labelVerbose: flow.label,
      color: flow.color,
      t0: nowPerf,
      ms: PARTICLE_MS,
      jitter: (Math.random() - 0.5) * 0.14,
      size: 2.4 + Math.random() * 2.4,
    };

    if (base.kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      base.label = tool.compact || tool.short;
      base.labelVerbose = tool.detail ? `${tool.short}: ${clampText(tool.detail, 64)}` : tool.short;
      base.color = tool.color;
      base.toolName = tool.name;
      base.toolDetail = tool.detail;
      const detailLen = tool.detail ? tool.detail.length : 0;
      base.ms = 1050 + Math.min(950, detailLen * 9);
      base.size = 2.8 + Math.min(3.2, detailLen / 42);
    }
    if (base.kind === "user") {
      const msg = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      base.label = msg ? `⌨️ ${clampText(msg, 24)}` : t("kind_user");
      base.labelVerbose = msg ? `⌨️ ${clampText(msg, 64)}` : t("kind_user");
      base.ms = 980 + Math.min(720, msg.length * 7);
      base.size = 2.6 + Math.min(3.0, msg.length / 64);
    }
    if (base.kind === "assistant") {
      const msg = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      base.label = msg ? `💬 ${clampText(msg, 24)}` : t("kind_assistant");
      base.labelVerbose = msg ? `💬 ${clampText(msg, 64)}` : t("kind_assistant");
      base.ms = 980 + Math.min(720, msg.length * 7);
      base.size = 2.6 + Math.min(3.0, msg.length / 64);
    }
    if (base.kind === "tool_output") {
      const rawOut = String(ev?.text ?? "");
      const code = extractExitCode(rawOut);
      const isErr = code !== null && code !== 0;
      const toolName = lastToolCall?.name ? String(lastToolCall.name) : "";
      base.toolName = toolName;
      const icon = toolName ? toolIcon(toolName) : "📦";
      const sn = toolName ? toolShortName(toolName) : t("kind_tool_output");
      const status = isErr ? "❌" : "✅";
      base.label = `${status} ${icon} ${sn}`;
      base.labelVerbose = code !== null ? `${status} ${icon} ${sn} (${t("label_exit_code")} ${code})` : base.label;
      base.color = isErr ? "#ef4444" : lastToolCall?.color || "#38bdf8";
      base.ms = isErr ? 980 : 820;
    }

    pulseNode(flow.from, base.color, nowPerf);
    pulseNode(flow.to, base.color, nowPerf);

    if (flow.from === flow.to) {
      const angle0 = Math.random() * Math.PI * 2;
      particles.push({
        ...base,
        mode: "orbit",
        cx: a.x,
        cy: a.y,
        r: a.r * (0.72 + Math.random() * 0.35),
        angle0,
        spin: (Math.random() < 0.5 ? -1 : 1) * (1.8 + Math.random() * 2.2),
      });
    } else {
      let arc = -(60 + Math.random() * 120);
      if (base.kind === "tool_call") arc = -(110 + Math.random() * 210);
      else if (base.kind === "tool_output") arc = -(70 + Math.random() * 140);
      else if (base.kind === "user") arc = -(90 + Math.random() * 170);
      else if (base.kind === "assistant") arc = -(80 + Math.random() * 160);

      const cx = (a.x + b.x) / 2 + base.jitter * 180;
      const cy = (a.y + b.y) / 2 + arc;
      particles.push({
        ...base,
        mode: "travel",
        x0: a.x,
        y0: a.y,
        x1: b.x,
        y1: b.y,
        cx,
        cy,
      });
    }

    while (particles.length > MAX_PARTICLES) particles.shift();
  }

  function drawParticleShape(p, x, y, r) {
    const kind = p?.kind ?? "system";
    const toolName = String(p?.toolName ?? "").toLowerCase();

    if (kind === "tool_call") {
      if (toolName.includes("apply_patch")) {
        ctx.beginPath();
        ctx.moveTo(x, y - r * 1.4);
        ctx.lineTo(x + r * 1.4, y);
        ctx.lineTo(x, y + r * 1.4);
        ctx.lineTo(x - r * 1.4, y);
        ctx.closePath();
        ctx.fill();
        return;
      }
      if (toolName.includes("web")) {
        ctx.beginPath();
        ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      if (toolName.includes("update_plan")) {
        const rr = r * 1.25;
        ctx.beginPath();
        for (let i = 0; i < 6; i += 1) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const px = x + Math.cos(a) * rr;
          const py = y + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        return;
      }

      const w = r * 2.4;
      const h = r * 1.85;
      const rr = Math.min(11, r * 0.95);
      ctx.beginPath();
      roundRect(ctx, x - w / 2, y - h / 2, w, h, rr);
      ctx.fill();
      return;
    }

    if (kind === "tool_output") {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.25);
      ctx.lineTo(x + r * 1.15, y + r * 1.05);
      ctx.lineTo(x - r * 1.15, y + r * 1.05);
      ctx.closePath();
      ctx.fill();
      return;
    }
    if (kind === "assistant") {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.35);
      ctx.lineTo(x + r * 1.35, y);
      ctx.lineTo(x, y + r * 1.35);
      ctx.lineTo(x - r * 1.35, y);
      ctx.closePath();
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticles(nowPerf) {
    let labelsDrawn = 0;
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      const t = (nowPerf - p.t0) / p.ms;
      if (t >= 1.05) {
        particles.splice(i, 1);
        continue;
      }

      const k = easeOutCubic(Math.max(0, Math.min(1, t)));
      const alpha = (1 - k) * 0.95;

      let x = 0;
      let y = 0;
      if (p.mode === "orbit") {
        const ang = p.angle0 + k * p.spin;
        x = p.cx + Math.cos(ang) * p.r;
        y = p.cy + Math.sin(ang) * p.r;
      } else {
        const cx = Number.isFinite(p.cx) ? p.cx : (p.x0 + p.x1) / 2;
        const cy = Number.isFinite(p.cy) ? p.cy : (p.y0 + p.y1) / 2 - 80;
        const inv = 1 - k;
        x = inv * inv * p.x0 + 2 * inv * k * cx + k * k * p.x1;
        y = inv * inv * p.y0 + 2 * inv * k * cy + k * k * p.y1;
      }

      // Trail
      ctx.save();
      ctx.globalAlpha = alpha * 0.22;
      ctx.strokeStyle = p.color;
      const toolName = String(p.toolName || "").toLowerCase();
      if (p.kind === "tool_call" && toolName.includes("apply_patch")) {
        ctx.setLineDash([2, 6]);
        ctx.lineWidth = 3;
      } else if (p.kind === "tool_call" && toolName.includes("web")) {
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 2;
      } else if (p.kind === "tool_call" && (toolName.includes("shell") || toolName.includes("exec_command"))) {
        ctx.setLineDash([]);
        ctx.lineWidth = 2.5;
      } else if (p.kind === "tool_output") {
        ctx.setLineDash([3, 7]);
        ctx.lineWidth = 2;
      } else {
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
      }
      ctx.beginPath();
      let started = false;
      for (let j = 0; j < 5; j += 1) {
        const tt = Math.max(0, Math.min(1, t - j * 0.08));
        const kk = easeOutCubic(tt);

        let tx = 0;
        let ty = 0;
        if (p.mode === "orbit") {
          const ang = p.angle0 + kk * p.spin;
          tx = p.cx + Math.cos(ang) * p.r;
          ty = p.cy + Math.sin(ang) * p.r;
        } else {
          const cx = Number.isFinite(p.cx) ? p.cx : (p.x0 + p.x1) / 2;
          const cy = Number.isFinite(p.cy) ? p.cy : (p.y0 + p.y1) / 2 - 80;
          const inv = 1 - kk;
          tx = inv * inv * p.x0 + 2 * inv * kk * cx + kk * kk * p.x1;
          ty = inv * inv * p.y0 + 2 * inv * kk * cy + kk * kk * p.y1;
        }

        if (!started) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
        started = true;
      }
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.kind === "tool_call") {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
      }
      drawParticleShape(p, x, y, p.size * (1 + (1 - k) * 0.35));
      ctx.restore();

      const wantsLabel =
        (p.kind === "tool_call" && k > 0.15 && k < 0.92) ||
        (p.kind === "tool_output" && k > 0.25 && k < 0.9) ||
        (showText.checked && (p.kind === "user" || p.kind === "assistant") && k > 0.22 && k < 0.86);

      if (wantsLabel && labelsDrawn < 10) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.92;
        ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
        const text = String(showText.checked ? p.labelVerbose || p.label : p.label || "");
        if (!text) {
          ctx.restore();
          continue;
        }
        ctx.font = "600 11px system-ui, -apple-system, Segoe UI, sans-serif";
        const padX = 8;
        const tw = ctx.measureText(text).width;
        const boxW = tw + padX * 2;
        const boxH = 20;
        const bx = x - boxW / 2;
        const by = y - 26;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        roundRect(ctx, bx, by, boxW, boxH, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(226, 232, 240, 0.92)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, by + boxH / 2);
        ctx.restore();
        labelsDrawn += 1;
      }
    }
  }

  function roundRect(context, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    context.moveTo(x + rr, y);
    context.arcTo(x + w, y, x + w, y + h, rr);
    context.arcTo(x + w, y + h, x, y + h, rr);
    context.arcTo(x, y + h, x, y, rr);
    context.arcTo(x, y, x + w, y, rr);
    context.closePath();
  }

  function draw(nowPerf) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (!w || !h) return;
    if (!nodes) resizeCanvas();

    drawGrid(w, h);

    // Edges
    drawEdge(nodes.user, nodes.assistant, "rgba(79, 70, 229, 0.75)", 0.28);
    drawEdge(nodes.assistant, nodes.tools, "rgba(245, 158, 11, 0.75)", 0.26);
    drawEdge(nodes.tools, nodes.assistant, "rgba(56, 189, 248, 0.75)", 0.22);
    drawEdge(nodes.assistant, nodes.user, "rgba(34, 197, 94, 0.75)", 0.2);

    drawPulses(nowPerf);
    drawParticles(nowPerf);

    // Nodes on top
    drawNode(nodes.user);
    drawNode(nodes.assistant);
    drawNode(nodes.tools);

    drawToasts(nowPerf);
  }

  // Controls
  pauseBtn.addEventListener("click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? t("btn_resume") : t("btn_pause");
    if (!paused) {
      setStatus(t("status_connected"));
      flushPending();
    }
  });

  clearBtn.addEventListener("click", () => clearAll());

  refreshBtn.addEventListener("click", () => refreshSessions());
  systemBtn.addEventListener("click", () => selectSystem());

  showText.addEventListener("change", () => applyTextMode());
  showFeed.addEventListener("change", () => applyFeedMode());

  expandBtn.addEventListener("click", () => {
    for (const el of eventsEl.querySelectorAll("details.event")) el.open = true;
  });

  collapseBtn.addEventListener("click", () => {
    for (const el of eventsEl.querySelectorAll("details.event")) el.open = false;
  });

  // Animation loop with rAF + coarse throttling (keeps CPU low)
  let lastTick = 0;
  function loop(now) {
    if (now - lastTick >= TICK_MS) {
      lastTick = now;
      draw(now);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => resizeCanvas());

  // Init
  applyTextMode();
  applyFeedMode();
  langRuBtn.addEventListener("click", () => setLang("ru"));
  langEnBtn.addEventListener("click", () => setLang("en"));
  setSelectedHeader();
  connectWs();
  refreshSessions();
  setInterval(refreshSessions, 3500);
  applyLang();
  requestAnimationFrame(loop);
})();
