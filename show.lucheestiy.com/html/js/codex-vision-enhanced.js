(() => {
  // =========================================================
  // Codex Live - Vision Edition ENHANCED
  // Enhanced visualization with cyberpunk aesthetic
  // New features: Tool animations, Command details, File tracking
  // =========================================================

  // DOM Elements
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

  // Floating Action Buttons
  const fabFiles = document.getElementById("fabFiles");
  const fabCommands = document.getElementById("fabCommands");
  const fabSound = document.getElementById("fabSound");
  const fabHelp = document.getElementById("fabHelp");

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

  // =========================================================
  // Configuration
  // =========================================================
  const CONFIG = {
    MAX_DOM_EVENTS: 500,
    MAX_PENDING: 1000,
    MAX_PARTICLES: 300,
    MAX_TRAILS: 12,
    PARTICLE_MS: 1200,
    TICK_MS: 1000 / 60,
    GRID_SPEED_X: 40,
    GRID_SPEED_Y: 60,
    GLOW_STRENGTH: 20,
    SOUND_ENABLED: false,
    SOUND_VOLUME: 0.15,
    FILE_HISTORY_MAX: 50,
    COMMAND_HISTORY_MAX: 30,
  };

  // Color palette - Cyberpunk Neon
  const COLORS = {
    neonBlue: "#00f0ff",
    neonPurple: "#b829ff",
    neonGreen: "#39ff14",
    neonPink: "#ff00aa",
    neonOrange: "#ff9100",
    neonCyan: "#00e5ff",
    neonRed: "#ff3366",
    neonYellow: "#ffee00",
    bgDeep: "#0a0a0f",
    bgDark: "#0f111a",
    user: "#00f0ff",
    assistant: "#39ff14",
    tool: "#ff9100",
    output: "#00e5ff",
    meta: "#b829ff",
    shell: "#ffee00",
    patch: "#ff00aa",
    web: "#2dd4bf",
  };

  // Tool type detection
  const TOOL_TYPES = {
    SHELL: 'shell',
    PATCH: 'patch',
    WEB: 'web',
    PLAN: 'plan',
    INPUT: 'input',
    IMAGE: 'image',
    GENERIC: 'generic'
  };

  // =========================================================
  // State Management
  // =========================================================
  let fileChanges = []; // Track file changes
  let commandHistory = []; // Track command history
  let activeToolAnimations = []; // Active tool animations
  let expandedEventId = null; // Currently expanded event

  // =========================================================
  // i18n - Enhanced
  // =========================================================
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
      hint_title: "💡 Подсказка",
      hint_text: "Нажмите ? для горячих клавиш. F для файлов. C для команд.",
      btn_pause: "Пауза",
      btn_resume: "Продолжить",
      btn_clear: "Очистить",
      toggle_text: "Текст",
      toggle_feed: "Лента",
      toggle_files: "Файлы",
      toggle_commands: "Команды",
      hud_events_per_min: "События/мин",
      hud_last_event: "Последнее",
      hud_prompt_label: "Запрос",
      hud_tool_label: "Инструмент",
      hud_files_label: "Измененные файлы",
      hud_commands_label: "Команды",
      hud_chip_user: "Пользователь",
      hud_chip_assistant: "Ассистент",
      hud_chip_tools: "Инструменты",
      hud_chip_output: "Вывод",
      hud_chip_meta: "Мета/Система",
      feed_title: "Лента событий",
      files_title: "Изменения файлов",
      commands_title: "История команд",
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
      shortcuts_title: "Горячие клавиши",
      shortcut_pause: "Пауза/Продолжить",
      shortcut_clear: "Очистить",
      shortcut_text: "Показать/скрыть текст",
      shortcut_feed: "Показать/скрыть ленту",
      shortcut_files: "Показать/скрыть файлы",
      shortcut_commands: "Показать/скрыть команды",
      shortcut_lang: "Сменить язык",
      shortcut_refresh: "Обновить сессии",
      shortcut_close: "Закрыть это окно",
      sound_on: "Звук включен",
      sound_off: "Звук выключен",
      file_added: "Добавлен",
      file_updated: "Изменен",
      file_deleted: "Удален",
      file_renamed: "Переименован",
      file_copied: "Скопирован",
      cmd_executing: "Выполняется",
      cmd_completed: "Завершен",
      cmd_failed: "Ошибка",
    },
    en: {
      locale: "en-US",
      sidebar_title: "Codex Streams",
      btn_refresh: "Refresh",
      system_stream_name: "Global codex-tui.log",
      system_stream_pill: "system",
      system_stream_meta: "Combined log (may interleave)",
      sessions_title: "Rollout sessions",
      hint_title: "💡 Hint",
      hint_text: "Press ? for shortcuts. F for files. C for commands.",
      btn_pause: "Pause",
      btn_resume: "Resume",
      btn_clear: "Clear",
      toggle_text: "Text",
      toggle_feed: "Feed",
      toggle_files: "Files",
      toggle_commands: "Commands",
      hud_events_per_min: "Events/min",
      hud_last_event: "Last",
      hud_prompt_label: "Prompt",
      hud_tool_label: "Tool",
      hud_files_label: "Modified Files",
      hud_commands_label: "Command History",
      hud_chip_user: "User",
      hud_chip_assistant: "Assistant",
      hud_chip_tools: "Tools",
      hud_chip_output: "Output",
      hud_chip_meta: "Meta/System",
      feed_title: "Event Feed",
      files_title: "File Changes",
      commands_title: "Command History",
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
      shortcuts_title: "Keyboard Shortcuts",
      shortcut_pause: "Pause/Resume",
      shortcut_clear: "Clear",
      shortcut_text: "Toggle text details",
      shortcut_feed: "Toggle feed",
      shortcut_files: "Toggle files panel",
      shortcut_commands: "Toggle commands panel",
      shortcut_lang: "Switch language",
      shortcut_refresh: "Refresh sessions",
      shortcut_close: "Close this dialog",
      sound_on: "Sound on",
      sound_off: "Sound off",
      file_added: "Added",
      file_updated: "Modified",
      file_deleted: "Deleted",
      file_renamed: "Renamed",
      file_copied: "Copied",
      cmd_executing: "Executing",
      cmd_completed: "Completed",
      cmd_failed: "Failed",
    },
  };

  let lang = localStorage.getItem(LANG_KEY) || "ru";
  if (!I18N[lang]) lang = "ru";

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

  // =========================================================
  // File Change Tracking
  // =========================================================
  function detectFileChanges(text) {
    const changes = [];
    const lines = text.split('\n');
    
    // Pattern 1: Patch files (*** Update File: path)
    const patchRegex = /^\*\*\*\s+(Update File|Add File|Delete File|Rename File|Copy File):\s+(.+)$/i;
    
    for (const line of lines) {
      const match = line.match(patchRegex);
      if (match) {
        const action = match[1].toLowerCase();
        const file = match[2].trim();
        
        let type = 'updated';
        if (action.includes('add')) type = 'added';
        else if (action.includes('delete')) type = 'deleted';
        else if (action.includes('rename')) type = 'renamed';
        else if (action.includes('copy')) type = 'copied';
        
        changes.push({
          file,
          type,
          timestamp: Date.now(),
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
    
    // Pattern 2: Git-style diffs
    const diffRegex = /^diff --git a\/(.+) b\/(.+)$/;
    for (const line of lines) {
      const match = line.match(diffRegex);
      if (match) {
        changes.push({
          file: match[2],
          type: 'updated',
          timestamp: Date.now(),
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }
    
    return changes;
  }

  function addFileChanges(changes) {
    if (!changes || changes.length === 0) return;
    
    fileChanges.unshift(...changes);
    while (fileChanges.length > CONFIG.FILE_HISTORY_MAX) {
      fileChanges.pop();
    }
    
    renderFilePanel();
  }

  function renderFilePanel() {
    const panel = document.getElementById('filesPanel');
    const list = document.getElementById('filesList');
    if (!panel || !list) return;
    
    list.innerHTML = '';
    
    if (fileChanges.length === 0) {
      list.innerHTML = `<div class="empty-state">${lang === 'ru' ? 'Нет изменений файлов' : 'No file changes yet'}</div>`;
      return;
    }
    
    // Group by file, keep most recent
    const seen = new Set();
    const unique = [];
    
    for (const change of fileChanges) {
      const key = `${change.file}-${change.type}`;
      if (!seen.has(change.file)) {
        seen.add(change.file);
        unique.push(change);
      }
    }
    
    for (const change of unique.slice(0, 20)) {
      const item = document.createElement('div');
      item.className = `file-item file-${change.type}`;
      
      const icon = getFileIcon(change.type);
      const label = t(`file_${change.type}`);
      
      item.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span class="file-path" title="${change.file}">${change.file}</span>
        <span class="file-badge">${label}</span>
      `;
      
      list.appendChild(item);
    }
  }

  function getFileIcon(type) {
    switch (type) {
      case 'added': return '➕';
      case 'deleted': return '🗑️';
      case 'renamed': return '📝';
      case 'copied': return '📋';
      default: return '✏️';
    }
  }

  // =========================================================
  // Command History Tracking
  // =========================================================
  function extractCommand(toolName, text) {
    const lowerTool = toolName.toLowerCase();
    
    if (lowerTool.includes('shell') || lowerTool.includes('exec')) {
      try {
        const parsed = safeJsonParse(text);
        if (parsed) {
          return parsed.cmd || parsed.command || parsed.shell || text;
        }
      } catch {}
      return text;
    }
    
    return null;
  }

  function addCommand(toolName, command, status = 'executing') {
    if (!command) return;
    
    commandHistory.unshift({
      tool: toolName,
      command: command.slice(0, 500), // Limit length
      status,
      timestamp: Date.now(),
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    while (commandHistory.length > CONFIG.COMMAND_HISTORY_MAX) {
      commandHistory.pop();
    }
    
    renderCommandPanel();
  }

  function updateCommandStatus(toolName, exitCode) {
    // Find most recent command from this tool
    const cmd = commandHistory.find(c => c.tool === toolName && c.status === 'executing');
    if (cmd) {
      cmd.status = exitCode === 0 ? 'completed' : 'failed';
      cmd.exitCode = exitCode;
      renderCommandPanel();
    }
  }

  function renderCommandPanel() {
    const panel = document.getElementById('commandsPanel');
    const list = document.getElementById('commandsList');
    if (!panel || !list) return;
    
    list.innerHTML = '';
    
    if (commandHistory.length === 0) {
      list.innerHTML = `<div class="empty-state">${lang === 'ru' ? 'Нет команд' : 'No commands yet'}</div>`;
      return;
    }
    
    for (const cmd of commandHistory.slice(0, 15)) {
      const item = document.createElement('div');
      item.className = `command-item command-${cmd.status}`;
      item.dataset.id = cmd.id;
      
      const statusIcon = cmd.status === 'executing' ? '⏳' : 
                        cmd.status === 'completed' ? '✅' : '❌';
      
      const statusLabel = t(`cmd_${cmd.status}`);
      
      item.innerHTML = `
        <div class="command-header">
          <span class="command-status">${statusIcon}</span>
          <span class="command-tool">${toolIcon(cmd.tool)} ${toolShortName(cmd.tool)}</span>
          <span class="command-status-label">${statusLabel}</span>
        </div>
        <div class="command-code">${escapeHtml(cmd.command)}</div>
      `;
      
      item.addEventListener('click', () => {
        item.classList.toggle('expanded');
      });
      
      list.appendChild(item);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // =========================================================
  // Tool Type Detection
  // =========================================================
  function getToolType(name) {
    const lower = name.toLowerCase();
    if (lower.includes('shell') || lower.includes('exec')) return TOOL_TYPES.SHELL;
    if (lower.includes('patch')) return TOOL_TYPES.PATCH;
    if (lower.includes('web')) return TOOL_TYPES.WEB;
    if (lower.includes('plan')) return TOOL_TYPES.PLAN;
    if (lower.includes('input')) return TOOL_TYPES.INPUT;
    if (lower.includes('image')) return TOOL_TYPES.IMAGE;
    return TOOL_TYPES.GENERIC;
  }

  // =========================================================
  // Enhanced Tool Animations
  // =========================================================
  function spawnToolAnimation(toolType, from, to, color, nowPerf) {
    const animation = {
      type: toolType,
      t0: nowPerf,
      duration: 1500,
      from,
      to,
      color,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    switch (toolType) {
      case TOOL_TYPES.SHELL:
        animation.particles = createShellParticles(from, to, color);
        break;
      case TOOL_TYPES.PATCH:
        animation.fragments = createPatchFragments(from, to, color);
        break;
      case TOOL_TYPES.WEB:
        animation.rings = createWebRings(from, to, color);
        break;
      default:
        animation.sparkles = createSparkles(from, to, color);
    }
    
    activeToolAnimations.push(animation);
    
    // Play tool-specific sound
    if (soundEnabled) {
      const freq = toolType === TOOL_TYPES.SHELL ? 220 :
                   toolType === TOOL_TYPES.PATCH ? 440 :
                   toolType === TOOL_TYPES.WEB ? 880 : 330;
      playTone(freq, 0.3, toolType === TOOL_TYPES.SHELL ? "sawtooth" : "sine", 0.1);
    }
  }

  function createShellParticles(from, to, color) {
    const particles = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: from.x,
        y: from.y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
      });
    }
    return particles;
  }

  function createPatchFragments(from, to, color) {
    const fragments = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      fragments.push({
        x: from.x,
        y: from.y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 1,
        decay: 0.015,
        size: 8 + Math.random() * 6,
      });
    }
    return fragments;
  }

  function createWebRings(from, to, color) {
    return [
      { radius: 10, alpha: 1, speed: 3 },
      { radius: 20, alpha: 0.8, speed: 2.5 },
      { radius: 30, alpha: 0.6, speed: 2 },
    ];
  }

  function createSparkles(from, to, color) {
    const sparkles = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 30;
      sparkles.push({
        x: from.x + Math.cos(angle) * dist,
        y: from.y + Math.sin(angle) * dist,
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI,
      });
    }
    return sparkles;
  }

  function drawToolAnimations(nowPerf) {
    for (let i = activeToolAnimations.length - 1; i >= 0; i--) {
      const anim = activeToolAnimations[i];
      const t = (nowPerf - anim.t0) / anim.duration;
      
      if (t >= 1) {
        activeToolAnimations.splice(i, 1);
        continue;
      }
      
      const progress = easeInOutCubic(t);
      
      switch (anim.type) {
        case TOOL_TYPES.SHELL:
          drawShellAnimation(anim, progress, nowPerf);
          break;
        case TOOL_TYPES.PATCH:
          drawPatchAnimation(anim, progress);
          break;
        case TOOL_TYPES.WEB:
          drawWebAnimation(anim, progress);
          break;
        default:
          drawSparkleAnimation(anim, progress, nowPerf);
      }
    }
  }

  function drawShellAnimation(anim, progress, nowPerf) {
    if (!anim.particles) return;
    
    ctx.save();
    for (const p of anim.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life -= p.decay;
      
      if (p.life > 0) {
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = COLORS.shell;
        ctx.shadowColor = COLORS.shell;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    
    // Draw terminal-style cursor line
    const x = anim.from.x + (anim.to.x - anim.from.x) * progress;
    const y = anim.from.y + (anim.to.y - anim.from.y) * progress;
    
    ctx.save();
    ctx.strokeStyle = COLORS.shell;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1 - progress;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(anim.from.x, anim.from.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }

  function drawPatchAnimation(anim, progress) {
    if (!anim.fragments) return;
    
    ctx.save();
    ctx.fillStyle = COLORS.patch;
    ctx.strokeStyle = COLORS.patch;
    
    for (const f of anim.fragments) {
      f.x += f.vx;
      f.y += f.vy;
      f.rotation += f.rotSpeed;
      f.life -= f.decay;
      
      if (f.life > 0) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.globalAlpha = f.life;
        ctx.shadowColor = COLORS.patch;
        ctx.shadowBlur = 8;
        
        // Draw code bracket shape
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-f.size/2, -f.size/2);
        ctx.lineTo(-f.size/4, -f.size/2);
        ctx.lineTo(-f.size/4, f.size/2);
        ctx.lineTo(-f.size/2, f.size/2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(f.size/2, -f.size/2);
        ctx.lineTo(f.size/4, -f.size/2);
        ctx.lineTo(f.size/4, f.size/2);
        ctx.lineTo(f.size/2, f.size/2);
        ctx.stroke();
        
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawWebAnimation(anim, progress) {
    if (!anim.rings) return;
    
    const cx = anim.from.x + (anim.to.x - anim.from.x) * progress;
    const cy = anim.from.y + (anim.to.y - anim.from.y) * progress;
    
    ctx.save();
    ctx.strokeStyle = COLORS.web;
    ctx.lineWidth = 2;
    
    for (const ring of anim.rings) {
      ring.radius += ring.speed;
      ring.alpha -= 0.02;
      
      if (ring.alpha > 0) {
        ctx.globalAlpha = ring.alpha * (1 - progress);
        ctx.shadowColor = COLORS.web;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawSparkleAnimation(anim, progress, nowPerf) {
    if (!anim.sparkles) return;
    
    ctx.save();
    for (const s of anim.sparkles) {
      s.twinkle += 0.1;
      const alpha = (Math.sin(s.twinkle) + 1) / 2 * (1 - progress) * 0.8;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = anim.color;
      ctx.shadowColor = anim.color;
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Continue with the rest of the code...


  // Continue: Helper Functions
  function setLangButtons() {
    langRuBtn?.classList.toggle("active", lang === "ru");
    langEnBtn?.classList.toggle("active", lang === "en");
  }

  function applyLang() {
    document.documentElement.lang = lang;
    setLangButtons();

    const elements = [
      [sidebarTitleEl, "sidebar_title"],
      [refreshBtn, "btn_refresh"],
      [systemStreamNameEl, "system_stream_name"],
      [systemStreamPillEl, "system_stream_pill"],
      [systemStreamMetaEl, "system_stream_meta"],
      [sessionsTitleEl, "sessions_title"],
      [hintTitleEl, "hint_title"],
      [hintTextEl, "hint_text"],
      [toggleTextLabelEl, "toggle_text"],
      [toggleFeedLabelEl, "toggle_feed"],
      [hudEventsPerMinEl, "hud_events_per_min"],
      [hudLastEventLabelEl, "hud_last_event"],
      [hudPromptLabelEl, "hud_prompt_label"],
      [hudToolLabelEl, "hud_tool_label"],
      [hudChipUserEl, "hud_chip_user"],
      [hudChipAssistantEl, "hud_chip_assistant"],
      [hudChipToolsEl, "hud_chip_tools"],
      [hudChipOutputEl, "hud_chip_output"],
      [hudChipMetaEl, "hud_chip_meta"],
      [feedTitleEl, "feed_title"],
      [expandBtn, "btn_expand"],
      [collapseBtn, "btn_collapse"],
      [clearBtn, "btn_clear"],
    ];

    for (const [el, key] of elements) {
      if (el) el.textContent = t(key);
    }

    if (pauseBtn) pauseBtn.textContent = paused ? t("btn_resume") : t("btn_pause");
    if (codexOriginEl) codexOriginEl.textContent = `${t("origin")}: ${CODEX_ORIGIN}`;

    setSelectedHeader();
    renderSessions(latestSessions);
    updateExistingFeedLanguage();
    renderFilePanel();
    renderCommandPanel();

    if (nodes) {
      nodes.user.label = t("node_user");
      nodes.assistant.label = t("node_assistant");
      nodes.tools.label = t("node_tools");
    }

    particles.length = 0;
    pulses.length = 0;
    toasts.user = null;
    toasts.assistant = null;
    toasts.tools = null;

    updateRate(Date.now());
  }

  // =========================================================
  // WebSocket Connection
  // =========================================================
  const params = new URLSearchParams(location.search);
  const originParam = params.get("codex");
  const defaultOrigin = location.hostname === "localhost" || location.hostname === "127.0.0.1"
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

  // =========================================================
  // State
  // =========================================================
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
  let mousePos = { x: 0, y: 0 };
  let canvasRect = null;

  // =========================================================
  // Sound System (Web Audio API)
  // =========================================================
  let audioCtx = null;
  let soundEnabled = localStorage.getItem("codex_sound_enabled") === "true";

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, duration, type = "sine", volume = CONFIG.SOUND_VOLUME) {
    if (!soundEnabled || !audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  }

  function playEventSound(kind) {
    if (!soundEnabled) return;
    
    switch (kind) {
      case "user":
        playTone(440, 0.15, "sine", 0.1);
        break;
      case "assistant":
        playTone(554, 0.2, "sine", 0.12);
        break;
      case "tool_call":
        playTone(330, 0.1, "triangle", 0.08);
        break;
      case "tool_output":
        playTone(880, 0.12, "sine", 0.08);
        break;
      default:
        playTone(220, 0.08, "sine", 0.05);
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem("codex_sound_enabled", soundEnabled);
    
    if (soundEnabled) {
      initAudio();
      playTone(523.25, 0.2, "sine", 0.15);
    }
    
    updateSoundButton();
    return soundEnabled;
  }

  function updateSoundButton() {
    const btn = document.getElementById("soundToggle");
    if (btn) {
      btn.classList.toggle("active", soundEnabled);
      btn.innerHTML = soundEnabled ? "🔊" : "🔇";
      btn.title = soundEnabled ? t("sound_on") : t("sound_off");
    }
    updateFabStates();
  }

  // =========================================================
  // Keyboard Shortcuts
  // =========================================================
  let shortcutsModal = null;
  let showFiles = false;
  let showCommands = false;

  const COMPACT_MQ = "(max-width: 1280px)";
  function isCompactLayout() {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(COMPACT_MQ).matches;
  }

  function updateFabStates() {
    fabFiles?.classList.toggle("active", showFiles);
    fabCommands?.classList.toggle("active", showCommands);
    if (fabSound) fabSound.innerHTML = soundEnabled ? "🔊" : "🔇";
    fabSound?.classList.toggle("active", soundEnabled);
  }

  function createShortcutsModal() {
    if (shortcutsModal) return;
    
    shortcutsModal = document.createElement("div");
    shortcutsModal.className = "shortcuts-modal";
    shortcutsModal.innerHTML = `
      <div class="shortcuts-content">
        <h2>${t("shortcuts_title")}</h2>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <span>${t("shortcut_pause")}</span>
            <div class="shortcut-key"><kbd>Space</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_clear")}</span>
            <div class="shortcut-key"><kbd>C</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_text")}</span>
            <div class="shortcut-key"><kbd>T</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_feed")}</span>
            <div class="shortcut-key"><kbd>F</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_files")}</span>
            <div class="shortcut-key"><kbd>Shift</kbd> + <kbd>F</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_commands")}</span>
            <div class="shortcut-key"><kbd>Shift</kbd> + <kbd>C</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_lang")}</span>
            <div class="shortcut-key"><kbd>L</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_refresh")}</span>
            <div class="shortcut-key"><kbd>R</kbd></div>
          </div>
          <div class="shortcut-item">
            <span>${t("shortcut_close")}</span>
            <div class="shortcut-key"><kbd>Esc</kbd> <kbd>?</kbd></div>
          </div>
        </div>
      </div>
    `;
    
    shortcutsModal.addEventListener("click", (e) => {
      if (e.target === shortcutsModal) toggleShortcutsModal();
    });
    
    document.body.appendChild(shortcutsModal);
  }

  function toggleShortcutsModal() {
    createShortcutsModal();
    shortcutsModal.classList.toggle("visible");
    
    const h2 = shortcutsModal.querySelector("h2");
    if (h2) h2.textContent = t("shortcuts_title");
  }

  function toggleFilesPanel() {
    const next = !showFiles;

    // On narrow screens, avoid stacking multiple overlays
    if (isCompactLayout() && next) {
      showCommands = false;
      document.getElementById('commandsPanel')?.classList.add('hidden');
      if (showFeed) showFeed.checked = false;
      feedPanel?.classList.add("hidden");
    }

    showFiles = next;
    const panel = document.getElementById('filesPanel');
    if (panel) {
      panel.classList.toggle('hidden', !showFiles);
    }
    updateFabStates();
    updateLayout();
  }

  function toggleCommandsPanel() {
    const next = !showCommands;

    // On narrow screens, avoid stacking multiple overlays
    if (isCompactLayout() && next) {
      showFiles = false;
      document.getElementById('filesPanel')?.classList.add('hidden');
      if (showFeed) showFeed.checked = false;
      feedPanel?.classList.add("hidden");
    }

    showCommands = next;
    const panel = document.getElementById('commandsPanel');
    if (panel) {
      panel.classList.toggle('hidden', !showCommands);
    }
    updateFabStates();
    updateLayout();
  }

  function updateLayout() {
    const layout = document.querySelector('.codex-layout');
    if (!layout) return;
    
    if (isCompactLayout()) {
      layout.style.gridTemplateColumns = "";
      return;
    }

    const cols = ['340px', '1fr'];
    const feedVisible = !!showFeed?.checked;
    if (feedVisible) cols.push('400px');
    if (showFiles) cols.push('320px');
    if (showCommands) cols.push('320px');
    layout.style.gridTemplateColumns = cols.join(' ');
  }

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    
    // Shift + key combinations
    if (e.shiftKey) {
      switch (e.key) {
        case "F":
        case "f":
          e.preventDefault();
          toggleFilesPanel();
          return;
        case "C":
        case "c":
          e.preventDefault();
          toggleCommandsPanel();
          return;
      }
    }
    
    switch (e.key) {
      case " ":
        e.preventDefault();
        pauseBtn?.click();
        break;
      case "c":
      case "C":
        clearBtn?.click();
        break;
      case "t":
      case "T":
        if (showText) {
          showText.checked = !showText.checked;
          applyTextMode();
        }
        break;
      case "f":
      case "F":
        if (showFeed) {
          showFeed.checked = !showFeed.checked;
          applyFeedMode();
        }
        break;
      case "l":
      case "L":
        setLang(lang === "ru" ? "en" : "ru");
        break;
      case "r":
      case "R":
        refreshSessions();
        break;
      case "?":
      case "Escape":
        toggleShortcutsModal();
        break;
    }
  });

  // =========================================================
  // Helper Functions
  // =========================================================
  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
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
    return d.toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function fmtDateTime(ms) {
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return String(ms);
    return d.toLocaleString(lang === "ru" ? "ru-RU" : "en-US");
  }

  function shortUuid(uuid) {
    if (!uuid) return "";
    return String(uuid).slice(0, 8);
  }

  function applyTextMode() {
    document.body.classList.toggle("no-text", !showText?.checked);
    renderSessions(latestSessions);
    updateRate(Date.now());
  }

  function applyFeedMode() {
    const feedVisible = !!showFeed?.checked;
    if (feedPanel) feedPanel.classList.toggle("hidden", !feedVisible);

    // On narrow screens, avoid stacking multiple overlays
    if (isCompactLayout() && feedVisible) {
      showFiles = false;
      document.getElementById('filesPanel')?.classList.add('hidden');
      showCommands = false;
      document.getElementById('commandsPanel')?.classList.add('hidden');
    }

    updateFabStates();
    updateLayout();
  }

  function clearAll() {
    pending = [];
    droppedPending = 0;
    if (eventsEl) eventsEl.textContent = "";
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
    fileChanges = [];
    commandHistory = [];
    activeToolAnimations = [];
    if (lastEventEl) lastEventEl.textContent = "—";
    if (rateEl) rateEl.textContent = "0";
    if (hudPromptEl) hudPromptEl.textContent = "—";
    if (hudToolEl) hudToolEl.textContent = "—";
    if (topToolsEl) topToolsEl.textContent = "";
    renderFilePanel();
    renderCommandPanel();
  }

  function safeEventMs(ev) {
    const ts = ev?.ts ?? null;
    const ms = ts ? Date.parse(ts) : NaN;
    return Number.isFinite(ms) ? ms : Date.now();
  }

  function updateRate(nowMs) {
    while (eventTimes.length && nowMs - eventTimes[0] > 60_000) eventTimes.shift();
    const rate = Math.round((eventTimes.length / 60) * 60);
    if (rateEl) rateEl.textContent = String(rate);
    if (lastEventEl) lastEventEl.textContent = lastEventInfo ? formatLastEventLabel(lastEventInfo) : "—";
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
    if (topToolsEl) topToolsEl.textContent = "";
    for (const [name, count] of entries) {
      const chip = document.createElement("div");
      chip.className = "toolChip";
      const c = toolColor(name);
      chip.style.borderColor = c;
      chip.style.background = "rgba(0, 0, 0, 0.3)";

      const label = document.createElement("span");
      label.className = "name";
      label.textContent = `${toolIcon(name)} ${toolShortName(name)}`;
      label.title = name;

      const num = document.createElement("span");
      num.className = "count";
      num.textContent = `×${count}`;

      chip.append(label, num);
      if (topToolsEl) topToolsEl.appendChild(chip);
    }
  }

  function updateHud(nowMs) {
    const prompt = normalizeOneLine(firstLine(lastPromptText || ""));
    if (hudPromptEl) hudPromptEl.textContent = prompt ? clampText(prompt, showText?.checked ? 96 : 64) : "—";

    if (!lastToolCall) {
      if (hudToolEl) hudToolEl.textContent = "—";
    } else {
      const icon = toolIcon(lastToolCall.name);
      const shortName = toolShortName(lastToolCall.name);
      const detail = lastToolCall.detail ? normalizeOneLine(lastToolCall.detail) : "";
      const short = `${icon} ${shortName}`;
      const compact = detail ? `${icon} ${shortName}: ${clampText(detail, 56)}` : short;
      const long = detail ? `${icon} ${shortName}: ${clampText(detail, 86)}` : short;
      if (hudToolEl) hudToolEl.textContent = showText?.checked ? long : compact;
    }

    renderTopTools(nowMs);
  }

  function setSelectedHeader() {
    if (selected.stream === "system") {
      if (selectedTitleEl) selectedTitleEl.textContent = t("selected_system_title");
      if (selectedMetaEl) selectedMetaEl.textContent = t("selected_system_meta");
      return;
    }
    if (selected.stream === "rollout") {
      const s = latestSessions.find((x) => x.id === selected.session);
      if (selectedTitleEl) {
        if (s?.startedAtLocal) selectedTitleEl.textContent = `${t("selected_session")}: ${s.startedAtLocal}`;
        else selectedTitleEl.textContent = `${t("selected_session")}: ${selected.session}`;
      }
      const bits = [];
      if (s?.uuid) bits.push(`uuid: ${s.uuid}`);
      if (s?.meta?.cli_version) bits.push(`${t("label_cli")}: ${s.meta.cli_version}`);
      if (s?.meta?.model_provider) bits.push(`${t("label_provider")}: ${s.meta.model_provider}`);
      if (s?.meta?.cwd) bits.push(`${t("label_cwd")}: ${s.meta.cwd}`);
      if (selectedMetaEl) selectedMetaEl.textContent = bits.join("\n");
      return;
    }
    if (selectedTitleEl) selectedTitleEl.textContent = t("selected_pick_stream");
    if (selectedMetaEl) selectedMetaEl.textContent = "";
  }

  function setActiveButtons() {
    if (systemBtn) systemBtn.classList.toggle("active", selected.stream === "system");
    for (const el of sessionsEl?.querySelectorAll(".sessionBtn") || []) {
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
    return t(`kind_${kind}`) || t("kind_system");
  }

  function updateExistingFeedLanguage() {
    for (const el of eventsEl?.querySelectorAll("details.event") || []) {
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
    if (!raw) return COLORS.tool;
    if (raw.includes("apply_patch")) return COLORS.patch;
    if (raw === "web.run" || raw.includes("web.run") || raw.endsWith(".web")) return COLORS.web;
    if (raw.includes("update_plan")) return "#60a5fa";
    if (raw.includes("request_user_input")) return "#f472b6";
    if (raw.includes("view_image") || raw.includes("image")) return "#fb7185";
    if (raw.includes("calculator")) return "#c084fc";
    if (raw.includes("shell") || raw.includes("exec_command")) return COLORS.shell;
    return COLORS.tool;
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

  function extractExitCode(text) {
    const raw = String(text ?? "");
    if (!raw) return null;
    const m = /Exit code:\s*([0-9]{1,6})/i.exec(raw);
    if (!m) return null;
    const n = Number.parseInt(m[1], 10);
    return Number.isFinite(n) ? n : null;
  }

  function extractTextFromContentArray(arr) {
    const out = [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      if (typeof item.text === "string" && item.text.trim()) out.push(item.text);
    }
    return out.join("\n").trim();
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

  function formatSessionNow(s) {
    const sum = s?.summary;
    if (!sum || typeof sum !== "object") return "";

    const lines = [];
    const userTxt = sum.user?.text ? normalizeOneLine(sum.user.text) : "";
    if (userTxt) {
      lines.push(`👤 ${clampText(userTxt, showText?.checked ? 140 : 92)}`);
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
      const detail = toolDetail ? clampText(toolDetail, showText?.checked ? 140 : 92) : "";
      lines.push(detail ? `${icon} ${sn}: ${detail}` : `${icon} ${sn}`);
    }

    return lines.join("\n");
  }

  function renderSessions(sessions) {
    if (!sessionsEl) return;
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

  // =========================================================
  // Enhanced Event Feed with Syntax Highlighting
  // =========================================================
  function highlightCode(text, language) {
    // Simple syntax highlighting
    let html = escapeHtml(text);
    
    if (language === 'json') {
      // Highlight JSON
      html = html
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="json-boolean">$1</span>');
    } else if (language === 'shell' || language === 'bash') {
      // Highlight shell commands
      html = html
        .replace(/^(\$|#|>)/gm, '<span class="shell-prompt">$1</span>')
        .replace(/\b(cd|ls|cat|grep|awk|sed|mkdir|rm|cp|mv|git|npm|pip|python|node)\b/g, '<span class="shell-command">$1</span>')
        .replace(/(-[-\w]+)/g, '<span class="shell-flag">$1</span>');
    }
    
    return html;
  }

  function addEventToFeed(ev) {
    if (!eventsEl) return;
    const kind = ev?.kind ?? "system";
    const details = document.createElement("details");
    details.className = `event kind-${kind}`;
    details.dataset.kind = kind;
    details.dataset.id = `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
    
    let commandForHistory = null;
    let toolNameForHistory = null;
    
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      if (tool.name) details.dataset.toolName = tool.name;
      if (tool.detail) details.dataset.toolDetail = tool.detail;
      title.textContent = tool.detail ? `${tool.short}: ${clampText(tool.detail, 72)}` : tool.short;
      
      // Track command for history
      toolNameForHistory = tool.name;
      commandForHistory = extractCommand(tool.name, ev?.text);
      if (commandForHistory) {
        addCommand(tool.name, commandForHistory, 'executing');
      }
      
      // Track file changes
      const changes = detectFileChanges(ev?.text || '');
      if (changes.length > 0) {
        addFileChanges(changes);
      }
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
      
      // Update command status
      if (toolName) {
        updateCommandStatus(toolName, code);
      }
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
    
    // Determine language for syntax highlighting
    let language = null;
    const toolName = details.dataset.toolName || '';
    if (toolName.toLowerCase().includes('shell') || toolName.toLowerCase().includes('exec')) {
      language = 'shell';
    } else if (bodyText.trim().startsWith('{') || bodyText.trim().startsWith('[')) {
      language = 'json';
    }
    
    body.innerHTML = highlightCode(bodyText, language);

    details.append(summary, body);
    details.open = false;

    eventsEl.appendChild(details);
    while (eventsEl.children.length > CONFIG.MAX_DOM_EVENTS) eventsEl.removeChild(eventsEl.firstElementChild);
    
    // Auto-scroll to bottom
    eventsEl.scrollTop = eventsEl.scrollHeight;
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
    
    // Play sound
    playEventSound(kind);
    
    // Track tool animations
    if (kind === 'tool_call') {
      const toolName = toolNameFromTitle(ev?.title);
      const toolType = getToolType(toolName);
      const tool = toolLabelForEvent(ev);
      spawnToolAnimation(toolType, nodes.assistant, nodes.tools, tool.color, nowPerf);
    }
    
    if (kind === "user") {
      const txt = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      if (txt && !isBoringUserText(txt)) {
        const shown = clampText(txt, showText?.checked ? 92 : 56);
        setToast("user", `⌨️ ${shown}`, COLORS.user, nowPerf);
      }
    }
    if (kind === "assistant") {
      const txt = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      if (txt) {
        const shown = clampText(txt, showText?.checked ? 92 : 56);
        setToast("assistant", `💬 ${shown}`, COLORS.assistant, nowPerf);
      }
    }
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      setToast("tools", showText?.checked ? tool.long : tool.compact || tool.short, tool.color, nowPerf);
    }
    if (kind === "tool_output") {
      const rawOut = String(ev?.text ?? "");
      const code = extractExitCode(rawOut);
      const isErr = code !== null && code !== 0;
      const toolName = lastToolCall?.name ? String(lastToolCall.name) : "";
      const icon = toolName ? toolIcon(toolName) : "📦";
      const sn = toolName ? toolShortName(toolName) : t("kind_tool_output");
      let msg = `${isErr ? "❌" : "✅"} ${icon} ${sn}`;
      if (code !== null && showText?.checked) msg += ` (${t("label_exit_code")} ${code})`;
      const color = isErr ? "#ef4444" : lastToolCall?.color || COLORS.output;
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
        if (pending.length > CONFIG.MAX_PENDING) {
          const extra = pending.length - CONFIG.MAX_PENDING;
          pending = pending.slice(-CONFIG.MAX_PENDING);
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

    ws.onopen = () => {
      setStatus(t("status_connected"));
      statusEl?.classList.remove("disconnected", "connecting");
    };
    ws.onmessage = (ev) => {
      let msg = null;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        msg = { type: "event", event: { ts: null, kind: "system", title: "raw", text: String(ev.data) } };
      }
      handleIncoming(msg);
    };
    ws.onerror = () => {
      setStatus(t("status_connection_error"));
      statusEl?.classList.add("disconnected");
    };
    ws.onclose = () => {
      if (seq !== connectSeq) return;
      setStatus(t("status_disconnected_retrying"));
      statusEl?.classList.add("disconnected");
      reconnectTimer = setTimeout(connectWs, 1200);
    };
  }

  // Continue with canvas rendering...


  // =========================================================
  // Canvas Rendering - Enhanced Visual Effects
  // =========================================================

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvasRect = rect;

    nodes = {
      user: { x: w * 0.18, y: h * 0.55, r: 48, label: t("node_user"), icon: "👤", color: COLORS.user },
      assistant: { x: w * 0.5, y: h * 0.45, r: 58, label: t("node_assistant"), icon: "🧠", color: COLORS.assistant },
      tools: { x: w * 0.82, y: h * 0.55, r: 48, label: t("node_tools"), icon: "🛠️", color: COLORS.tool },
    };
  }

  // Mouse tracking for interactivity
  canvas?.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
    mouseInCanvas = true;
  });

  canvas?.addEventListener("mouseleave", () => {
    mouseInCanvas = false;
  });

  function drawGrid(w, h) {
    ctx.save();
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(0, 0, w, h);

    // Animated grid with parallax
    const time = Date.now() / 1000;
    const offsetX = (time * CONFIG.GRID_SPEED_X) % 50;
    const offsetY = (time * CONFIG.GRID_SPEED_Y) % 50;
    
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = COLORS.neonBlue;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = offsetX; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Radial glow from center
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.5);
    gradient.addColorStop(0, "rgba(0, 240, 255, 0.08)");
    gradient.addColorStop(0.5, "rgba(184, 41, 255, 0.04)");
    gradient.addColorStop(1, "transparent");
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    ctx.restore();
  }

  function drawEdge(a, b, color, alpha) {
    const dx = (b.x - a.x) * 0.55;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Add glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.bezierCurveTo(a.x + dx, a.y, b.x - dx, b.y, b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawNode(n) {
    ctx.save();

    // Outer glow
    const glowGradient = ctx.createRadialGradient(n.x, n.y, n.r, n.x, n.y, n.r + 20);
    glowGradient.addColorStop(0, n.color);
    glowGradient.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + 20, 0, Math.PI * 2);
    ctx.fill();

    // Core background
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(15, 17, 26, 0.9)";
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = n.color;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r - 6, 0, Math.PI * 2);
    ctx.stroke();

    // Icon
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f0f4f8";
    ctx.font = `700 ${Math.max(14, Math.round(n.r * 0.42))}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.icon, n.x, n.y - 6);

    // Label
    ctx.fillStyle = "rgba(240, 244, 248, 0.9)";
    ctx.font = "600 13px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(n.label, n.x, n.y + n.r * 0.62);
    
    ctx.restore();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function pulseNode(nodeKey, color, nowPerf) {
    if (!nodes || !nodes[nodeKey]) return;
    pulses.push({ key: nodeKey, color: color || "#94a3b8", t0: nowPerf, ms: 720, intensity: 1 });
    while (pulses.length > 100) pulses.shift();
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
      const r = n.r + 8 + k * 40;
      
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.3 * p.intensity;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
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
    const alpha = (1 - k) * 0.95;

    let align = "center";
    let anchorX = n.x;
    let anchorY = n.y - n.r - 48;
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
    const maxTextW = 360;
    const text = fitText(toast.text, maxTextW);
    if (!text) {
      ctx.restore();
      return;
    }
    const padX = 12;
    const boxH = 28;
    const textW = Math.min(maxTextW, ctx.measureText(text).width);
    const boxW = textW + padX * 2;

    let bx = anchorX - boxW / 2;
    if (align === "left") bx = anchorX;
    if (align === "right") bx = anchorX - boxW;
    const by = anchorY;

    // Glass effect background
    ctx.fillStyle = "rgba(20, 22, 35, 0.85)";
    ctx.strokeStyle = toast.color || "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    roundRect(ctx, bx, by, boxW, boxH, 14);
    ctx.fill();
    ctx.stroke();

    // Glow
    ctx.shadowColor = toast.color;
    ctx.shadowBlur = 15;
    ctx.stroke();

    ctx.fillStyle = "rgba(240, 244, 248, 0.95)";
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

    if (kind === "user") return { from: "user", to: "assistant", color: COLORS.user, label: t("kind_user") };
    if (kind === "assistant") {
      if (title.includes("reasoning")) return { from: "assistant", to: "assistant", color: COLORS.assistant, label: t("kind_assistant") };
      return { from: "assistant", to: "user", color: COLORS.assistant, label: t("kind_assistant") };
    }
    if (kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      return { from: "assistant", to: "tools", color: tool.color, label: clampText(tool.shortName || t("tool_generic"), 18) };
    }
    if (kind === "tool_output") return { from: "tools", to: "assistant", color: COLORS.output, label: t("kind_tool_output") };
    if (kind === "meta") return { from: "assistant", to: "assistant", color: COLORS.meta, label: t("kind_meta") };
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
      ms: CONFIG.PARTICLE_MS,
      jitter: (Math.random() - 0.5) * 0.14,
      size: 3 + Math.random() * 2.5,
      trails: [],
    };

    if (base.kind === "tool_call") {
      const tool = toolLabelForEvent(ev);
      base.label = tool.compact || tool.short;
      base.labelVerbose = tool.detail ? `${tool.short}: ${clampText(tool.detail, 64)}` : tool.short;
      base.color = tool.color;
      base.toolName = tool.name;
      base.toolDetail = tool.detail;
      const detailLen = tool.detail ? tool.detail.length : 0;
      base.ms = 1100 + Math.min(950, detailLen * 9);
      base.size = 3.5 + Math.min(3.5, detailLen / 40);
    }
    if (base.kind === "user") {
      const msg = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      base.label = msg ? `⌨️ ${clampText(msg, 24)}` : t("kind_user");
      base.labelVerbose = msg ? `⌨️ ${clampText(msg, 64)}` : t("kind_user");
      base.ms = 1000 + Math.min(700, msg.length * 7);
      base.size = 3 + Math.min(3, msg.length / 60);
    }
    if (base.kind === "assistant") {
      const msg = normalizeOneLine(firstLine(normalizeUiEventText(ev)));
      base.label = msg ? `💬 ${clampText(msg, 24)}` : t("kind_assistant");
      base.labelVerbose = msg ? `💬 ${clampText(msg, 64)}` : t("kind_assistant");
      base.ms = 1000 + Math.min(700, msg.length * 7);
      base.size = 3 + Math.min(3, msg.length / 60);
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
      base.color = isErr ? "#ef4444" : lastToolCall?.color || COLORS.output;
      base.ms = isErr ? 1000 : 850;
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

    while (particles.length > CONFIG.MAX_PARTICLES) particles.shift();
  }

  function drawParticleShape(p, x, y, r) {
    const kind = p?.kind ?? "system";
    const toolName = String(p?.toolName ?? "").toLowerCase();

    ctx.save();
    
    if (kind === "tool_call") {
      if (toolName.includes("apply_patch")) {
        ctx.beginPath();
        ctx.moveTo(x, y - r * 1.4);
        ctx.lineTo(x + r * 1.4, y);
        ctx.lineTo(x, y + r * 1.4);
        ctx.lineTo(x - r * 1.4, y);
        ctx.closePath();
        ctx.fill();
      } else if (toolName.includes("web")) {
        ctx.beginPath();
        ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (toolName.includes("update_plan")) {
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
      } else {
        const w = r * 2.4;
        const h = r * 1.85;
        const rr = Math.min(11, r * 0.95);
        ctx.beginPath();
        roundRect(ctx, x - w / 2, y - h / 2, w, h, rr);
        ctx.fill();
      }
    } else if (kind === "tool_output") {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.25);
      ctx.lineTo(x + r * 1.15, y + r * 1.05);
      ctx.lineTo(x - r * 1.15, y + r * 1.05);
      ctx.closePath();
      ctx.fill();
    } else if (kind === "assistant") {
      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.35);
      ctx.lineTo(x + r * 1.35, y);
      ctx.lineTo(x, y + r * 1.35);
      ctx.lineTo(x - r * 1.35, y);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
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

      // Store position for trails
      if (!p.trails) p.trails = [];
      p.trails.unshift({ x, y, t: nowPerf });
      if (p.trails.length > CONFIG.MAX_TRAILS) p.trails.pop();

      // Draw trails
      ctx.save();
      const toolName = String(p.toolName || "").toLowerCase();
      
      for (let j = 1; j < p.trails.length; j++) {
        const trail = p.trails[j];
        const trailAlpha = alpha * (1 - j / p.trails.length) * 0.4;
        ctx.globalAlpha = trailAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const trailR = p.size * (1 - j / p.trails.length) * 0.6;
        ctx.arc(trail.x, trail.y, trailR, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Main particle
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      
      if (p.kind === "tool_call") {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = CONFIG.GLOW_STRENGTH;
      }
      
      const size = p.size * (1 + (1 - k) * 0.35);
      drawParticleShape(p, x, y, size);
      ctx.restore();

      // Label
      const wantsLabel =
        (p.kind === "tool_call" && k > 0.15 && k < 0.92) ||
        (p.kind === "tool_output" && k > 0.25 && k < 0.9) ||
        (showText?.checked && (p.kind === "user" || p.kind === "assistant") && k > 0.22 && k < 0.86);

      if (wantsLabel && labelsDrawn < 10) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.92;
        ctx.fillStyle = "rgba(20, 22, 35, 0.85)";
        const text = String(showText?.checked ? p.labelVerbose || p.label : p.label || "");
        if (!text) {
          ctx.restore();
          continue;
        }
        ctx.font = "600 11px system-ui, -apple-system, Segoe UI, sans-serif";
        const padX = 10;
        const tw = ctx.measureText(text).width;
        const boxW = tw + padX * 2;
        const boxH = 22;
        const bx = x - boxW / 2;
        const by = y - 30;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        roundRect(ctx, bx, by, boxW, boxH, 11);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(240, 244, 248, 0.92)";
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
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);
    if (!w || !h) return;
    if (!nodes) resizeCanvas();

    drawGrid(w, h);

    // Draw connections
    drawEdge(nodes.user, nodes.assistant, COLORS.user, 0.25);
    drawEdge(nodes.assistant, nodes.tools, COLORS.tool, 0.22);
    drawEdge(nodes.tools, nodes.assistant, COLORS.output, 0.18);
    drawEdge(nodes.assistant, nodes.user, COLORS.assistant, 0.15);

    drawPulses(nowPerf);
    drawParticles(nowPerf);
    drawToolAnimations(nowPerf);

    // Draw nodes
    drawNode(nodes.user);
    drawNode(nodes.assistant);
    drawNode(nodes.tools);

    drawToasts(nowPerf);
  }

  // =========================================================
  // Event Handlers & Initialization
  // =========================================================

  // Controls
  pauseBtn?.addEventListener("click", () => {
    paused = !paused;
    if (pauseBtn) pauseBtn.textContent = paused ? t("btn_resume") : t("btn_pause");
    if (!paused) {
      setStatus(t("status_connected"));
      flushPending();
    }
  });

  clearBtn?.addEventListener("click", () => clearAll());
  refreshBtn?.addEventListener("click", () => refreshSessions());
  systemBtn?.addEventListener("click", () => selectSystem());

  showText?.addEventListener("change", () => applyTextMode());
  showFeed?.addEventListener("change", () => applyFeedMode());

  expandBtn?.addEventListener("click", () => {
    for (const el of eventsEl?.querySelectorAll("details.event") || []) el.open = true;
  });

  collapseBtn?.addEventListener("click", () => {
    for (const el of eventsEl?.querySelectorAll("details.event") || []) el.open = false;
  });

  langRuBtn?.addEventListener("click", () => setLang("ru"));
  langEnBtn?.addEventListener("click", () => setLang("en"));

  // HUD chip interactions
  hudChipUserEl?.addEventListener("click", () => {
    pulseNode("user", COLORS.user, performance.now());
  });
  hudChipAssistantEl?.addEventListener("click", () => {
    pulseNode("assistant", COLORS.assistant, performance.now());
  });
  hudChipToolsEl?.addEventListener("click", () => {
    pulseNode("tools", COLORS.tool, performance.now());
  });

  // Sound toggle button
  function createSoundButton() {
    if (document.getElementById("soundToggle")) return;
    const btn = document.createElement("button");
    btn.id = "soundToggle";
    btn.className = "sound-toggle" + (soundEnabled ? " active" : "");
    btn.innerHTML = soundEnabled ? "🔊" : "🔇";
    btn.title = soundEnabled ? t("sound_on") : t("sound_off");
    btn.addEventListener("click", () => {
      toggleSound();
    });
    document.body.appendChild(btn);
  }

  // Create Files Panel
  function createFilesPanel() {
    if (document.getElementById('filesPanel')) return;
    
    const panel = document.createElement('aside');
    panel.id = 'filesPanel';
    panel.className = 'codex-panel codex-files hidden';
    panel.innerHTML = `
      <div class="panelHeader">
        <h3 id="filesTitle">${t('files_title')}</h3>
        <button id="closeFiles" class="btn btn-icon" type="button">✕</button>
      </div>
      <div id="filesList" class="panelList"></div>
    `;
    
    document.querySelector('.codex-layout')?.appendChild(panel);
    
    document.getElementById('closeFiles')?.addEventListener('click', toggleFilesPanel);
  }

  // Create Commands Panel
  function createCommandsPanel() {
    if (document.getElementById('commandsPanel')) return;
    
    const panel = document.createElement('aside');
    panel.id = 'commandsPanel';
    panel.className = 'codex-panel codex-commands hidden';
    panel.innerHTML = `
      <div class="panelHeader">
        <h3 id="commandsTitle">${t('commands_title')}</h3>
        <button id="closeCommands" class="btn btn-icon" type="button">✕</button>
      </div>
      <div id="commandsList" class="panelList"></div>
    `;
    
    document.querySelector('.codex-layout')?.appendChild(panel);
    
    document.getElementById('closeCommands')?.addEventListener('click', toggleCommandsPanel);
  }

  // Animation loop
  let lastTick = 0;
  function loop(now) {
    if (now - lastTick >= CONFIG.TICK_MS) {
      lastTick = now;
      draw(now);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    updateLayout();
  });

  // Floating Action Buttons
  fabFiles?.addEventListener("click", () => toggleFilesPanel());
  fabCommands?.addEventListener("click", () => toggleCommandsPanel());
  fabSound?.addEventListener("click", () => toggleSound());
  fabHelp?.addEventListener("click", () => toggleShortcutsModal());

  // Initialize
  function init() {
    createSoundButton();
    createFilesPanel();
    createCommandsPanel();

    updateFabStates();

    // Keep the canvas clean on smaller screens (feed can still be toggled on)
    if (isCompactLayout() && showFeed) showFeed.checked = false;
    
    applyTextMode();
    applyFeedMode();
    setSelectedHeader();
    connectWs();
    refreshSessions();
    setInterval(refreshSessions, 3500);
    applyLang();
    requestAnimationFrame(loop);
    
    // Add loaded class to body for fade-in effect
    document.body.classList.add("loaded");
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose some functions for debugging
  window.codexLive = {
    setLang,
    toggleSound,
    toggleShortcutsModal,
    toggleFilesPanel,
    toggleCommandsPanel,
    clearAll,
    refreshSessions,
    getNodes: () => nodes,
    getParticles: () => particles,
    getFileChanges: () => fileChanges,
    getCommandHistory: () => commandHistory,
    getConfig: () => CONFIG,
  };
})();
