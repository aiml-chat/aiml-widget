import styles from './styles.css';
import { renderMarkdown } from './markdown.js';

const ICONS = {
  chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bot: '🤖',
  minus: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  maximize: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  restore: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  menu: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>`,
  sparkles: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z"/></svg>`,
};

// 15px stroke icons for the error-bubble variants (design's ErrorBubble).
const SICON = (p) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const STATUS_ICON = {
  alert: SICON('<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  clock: SICON('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  info:  SICON('<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'),
};

// Agent-mode glyphs (Phase 10 D1) — small 12px stroke icons, drawn in the active agent's accent colour.
const AICON = (p) => `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const GLYPH = {
  msg:   AICON('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  spark: AICON('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>'),
  code:  AICON('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
  arrow: AICON('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
  shield: AICON('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  lock:  AICON('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  check: AICON('<polyline points="20 6 9 17 4 12"/>'),
  x: AICON('<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'),
  loader: AICON('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.9" y1="4.9" x2="7.8" y2="7.8"/><line x1="16.2" y1="16.2" x2="19.1" y2="19.1"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.9" y1="19.1" x2="7.8" y2="16.2"/><line x1="16.2" y1="7.8" x2="19.1" y2="4.9"/>'),
  user:  AICON('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
};

// One quiet accent per agent (matches the design's AGENTS_DEFAULT).
const AGENTS = {
  Support:   { accent: '#4F46E5', icon: 'msg' },
  Sales:     { accent: '#7C3AED', icon: 'spark' },
  Technical: { accent: '#0F766E', icon: 'code' },
};
const AGENT_FALLBACK = { accent: '#78716C', icon: 'spark' };
const agentMeta = (name) => AGENTS[name] || AGENT_FALLBACK;

export class WidgetUI {
  constructor(config) {
    this.config = config;
    this.host = null;
    this.shadow = null;
    this.isOpen = false;
    this._streaming = false;
    this._streamingEl = null;
    this._streamBuffer = '';
    this._currentBotMsg = null;   // wrapper of the in-flight bot message (for the agent pill)
    this._lastAgent = null;       // current agent name, to detect a change → handoff
    this._confirmCards = {};       // pending-action id → its approval card element
    this._toolGroup = null;        // active tool-activity group element for this turn
    this._toolRows = {};           // tool call id → its row element
  }

  mount() {
    this.host = document.createElement('div');
    this.host.setAttribute('id', 'aiml-widget-host');
    this.host.setAttribute('data-theme', this.config.theme || 'auto');
    document.body.appendChild(this.host);

    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadow.appendChild(style);

    // Per-site appearance via CSS custom properties (values are validated upstream in widget.js).
    const radii = { none: '0px', md: '12px', xl: '20px' };
    const overrides = [];
    if (this.config.primaryColor) overrides.push(`--aiml-primary: ${this.config.primaryColor};`);
    if (this.config.radius in radii) overrides.push(`--aiml-radius: ${radii[this.config.radius]};`);
    overrides.push(`--aiml-offset-x: ${this.config.offsetX ?? 24}px;`);
    overrides.push(`--aiml-offset-y: ${this.config.offsetY ?? 24}px;`);
    if (this.config.zIndex) overrides.push(`--aiml-z: ${this.config.zIndex};`);
    style.textContent += `:host { ${overrides.join(' ')} }`;

    this.shadow.appendChild(this._buildTrigger());
    if (this.config.launcherLabel) this.shadow.appendChild(this._buildLauncherLabel());
    this.shadow.appendChild(this._buildWindow());

    this._bindEvents();
    this._focusTrap();
  }

  _buildTrigger() {
    const btn = document.createElement('button');
    const size = this.config.launcherSize === 'sm' ? ' aiml-sz-sm'
      : this.config.launcherSize === 'lg' ? ' aiml-sz-lg' : '';
    btn.className = `aiml-trigger${this.config.position === 'left' ? ' aiml-left' : ''}${size}`;
    btn.setAttribute('aria-label', 'Open AI chat assistant');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'aiml-chat-window');
    const openIcon = this.config.launcherIconUrl
      ? `<img class="aiml-trigger-img" src="${escAttr(this.config.launcherIconUrl)}" alt="" />`
      : ICONS.chat;
    btn.innerHTML = `
      <span class="aiml-icon-open" aria-hidden="true">${openIcon}</span>
      <span class="aiml-icon-close" aria-hidden="true">${ICONS.close}</span>`;
    return btn;
  }

  // Teaser bubble next to the launcher ("Chat with us 👋"). Dismissed by opening the chat or its ×,
  // and stays dismissed for the tab session so it never nags.
  _buildLauncherLabel() {
    const KEY = 'aiml_label_dismissed';
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(KEY) === '1'; } catch {}
    const div = document.createElement('div');
    if (dismissed) return div;
    div.className = `aiml-launcher-label${this.config.position === 'left' ? ' aiml-left' : ''}`;
    div.innerHTML = `<span>${escHtml(this.config.launcherLabel)}</span>` +
      `<button class="aiml-label-dismiss" aria-label="Dismiss">${ICONS.close}</button>`;
    div.querySelector('span').addEventListener('click', () => this.open());
    div.querySelector('.aiml-label-dismiss').addEventListener('click', (e) => {
      e.stopPropagation();
      div.remove();
      try { sessionStorage.setItem(KEY, '1'); } catch {}
    });
    this._labelEl = div;
    return div;
  }

  _buildWindow() {
    const win = document.createElement('div');
    win.className = `aiml-window aiml-hidden${this.config.position === 'left' ? ' aiml-left' : ''}`;
    win.setAttribute('id', 'aiml-chat-window');
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'AI Chat Assistant');
    win.setAttribute('aria-modal', 'false');

    const avatar = this.config.avatarUrl
      ? `<img class="aiml-avatar-img" src="${escAttr(this.config.avatarUrl)}" alt="" />`
      : ICONS.bot;
    // Agent mode gets the design's live-team header: pulsing status dot in the ACTIVE agent's accent,
    // "AI agent team" identity, a live "Now: {agent}" line (updated from setAgent), an overflow menu
    // (talk to a human / clear conversation), and a maximize control. RAG mode keeps the classic header.
    const agent = !!this.config.agentMode;
    const startAccent = agentMeta('Support').accent;
    const title = this.config.title || (agent ? 'AI agent team' : 'AI Assistant');
    const subtitle = agent
      ? `Now: <span class="aiml-header-now" style="color:#fff">Support</span>`
      : escHtml(this.config.subtitle || 'Ask me anything');
    win.innerHTML = `
      <div class="aiml-header">
        ${agent
          ? `<span class="aiml-header-dot-wrap" aria-hidden="true"><span class="aiml-header-dot" style="background:${startAccent}"></span><span class="aiml-header-dot aiml-header-ping" style="background:${startAccent}"></span></span>`
          : `<div class="aiml-avatar" aria-hidden="true">${avatar}</div>`}
        <div class="aiml-header-info">
          <div class="aiml-header-title">${escAttr(title)}</div>
          <div class="aiml-header-subtitle">${subtitle}</div>
        </div>
        <span class="aiml-label" title="You are interacting with an AI">AI</span>
        ${agent ? `<button class="aiml-hbtn aiml-menu-btn" aria-label="More options" aria-haspopup="true" aria-expanded="false" title="More">${ICONS.menu}</button>` : ''}
        <button class="aiml-hbtn aiml-max-btn" aria-label="Full screen" title="Full screen">${ICONS.maximize}</button>
        <button class="aiml-hbtn aiml-close-btn" aria-label="Minimize chat" title="Minimize">${ICONS.minus}</button>
        <div class="aiml-menu aiml-hidden" role="menu">
          <button class="aiml-menu-item aiml-menu-human" role="menuitem">${GLYPH.user} Talk to a human</button>
          <button class="aiml-menu-item aiml-menu-clear" role="menuitem">${GLYPH.loader} Clear conversation</button>
        </div>
      </div>
      <div class="aiml-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="aiml-input-area">
        <textarea
          class="aiml-input"
          placeholder="${escAttr(this.config.placeholder || (agent ? 'Message the team…' : 'Ask a question…'))}"
          rows="1"
          aria-label="Chat message input"
          aria-multiline="true"
        ></textarea>
        <button class="aiml-send-btn" aria-label="Send message" disabled>
          ${ICONS.send}
        </button>
      </div>
      <div class="aiml-footer${this.config.showBranding === false ? ' aiml-no-brand' : ''}">
        <a class="aiml-badge" href="https://aiml.chat/playground?ref=widget&site=${encodeURIComponent((location.hostname || '').replace(/^www\./, ''))}" target="_blank" rel="noopener noreferrer" tabindex="${this.config.showBranding === false ? '-1' : '0'}">
          Powered by aiml.chat
        </a>
      </div>`;

    return win;
  }

  _bindEvents() {
    const shadow = this.shadow;
    const trigger = shadow.querySelector('.aiml-trigger');
    const closeBtn = shadow.querySelector('.aiml-close-btn');
    const input = shadow.querySelector('.aiml-input');
    const sendBtn = shadow.querySelector('.aiml-send-btn');

    trigger.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.close());

    // Maximize toggles a near-viewport window; icon swaps to "restore".
    const maxBtn = shadow.querySelector('.aiml-max-btn');
    maxBtn.addEventListener('click', () => {
      const win = shadow.querySelector('.aiml-window');
      const maxed = win.classList.toggle('aiml-maximized');
      maxBtn.innerHTML = maxed ? ICONS.restore : ICONS.maximize;
      maxBtn.title = maxed ? 'Exit full screen' : 'Full screen';
      maxBtn.setAttribute('aria-label', maxBtn.title);
    });

    // Agent-mode overflow menu: talk to a human (host wires the lead form), clear conversation.
    const menuBtn = shadow.querySelector('.aiml-menu-btn');
    if (menuBtn) {
      const menu = shadow.querySelector('.aiml-menu');
      const setOpen = (open) => {
        menu.classList.toggle('aiml-hidden', !open);
        menuBtn.setAttribute('aria-expanded', String(open));
      };
      menuBtn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.classList.contains('aiml-hidden')); });
      shadow.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target !== menuBtn) setOpen(false); });
      menu.querySelector('.aiml-menu-human').addEventListener('click', () => {
        setOpen(false);
        if (this.onTalkToHuman) this.onTalkToHuman();
      });
      menu.querySelector('.aiml-menu-clear').addEventListener('click', () => {
        setOpen(false);
        this.clearConversation();
      });
    }

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
      // Auto-resize textarea
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) this._emitSend(input.value.trim());
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!sendBtn.disabled) this._emitSend(input.value.trim());
    });

    // Escape to close
    shadow.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    // Dark mode listener
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (this.config.theme === 'auto') {
        this.host.setAttribute('data-theme', 'auto');
      }
    });
  }

  _focusTrap() {
    const shadow = this.shadow;
    shadow.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !this.isOpen) return;
      const focusable = [...shadow.querySelectorAll(
        'button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex="-1"])'
      )].filter(el => !el.closest('.aiml-window.aiml-hidden'));

      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  _emitSend(text) {
    if (!text || this._streaming) return;
    const event = new CustomEvent('aiml:send', { detail: { text }, bubbles: true });
    this.host.dispatchEvent(event);
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    if (this._labelEl) { this._labelEl.remove(); this._labelEl = null; }
    const win = this.shadow.querySelector('.aiml-window');
    const trigger = this.shadow.querySelector('.aiml-trigger');
    win.classList.remove('aiml-hidden');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close AI chat assistant');
    // Only autofocus when this document actually has focus. Inside a background iframe (e.g. the
    // dashboard's live preview, which rebuilds while the owner types in the settings form) a focus()
    // here would STEAL page focus from whatever the user is doing.
    setTimeout(() => {
      if (document.hasFocus()) this.shadow.querySelector('.aiml-input')?.focus();
    }, 100);
    if (this.config.onOpen) this.config.onOpen();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    const win = this.shadow.querySelector('.aiml-window');
    const trigger = this.shadow.querySelector('.aiml-trigger');
    win.classList.add('aiml-hidden');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open AI chat assistant');
    trigger.focus();
    if (this.config.onClose) this.config.onClose();
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  appendUserMessage(text) {
    const messages = this.shadow.querySelector('.aiml-messages');
    const msg = document.createElement('div');
    msg.className = 'aiml-msg aiml-msg-user';
    msg.setAttribute('role', 'article');
    msg.setAttribute('aria-label', 'You');
    msg.innerHTML = `<div class="aiml-msg-bubble">${escHtml(text)}</div>`;
    messages.appendChild(msg);
    this._stampTime(msg, true);
    this._scrollToBottom();
    return msg;
  }

  // Timestamp at message-GROUP ends: when the same role sends back-to-back, the previous stamp is
  // absorbed so only the last message of the run carries the time.
  _stampTime(afterEl, isUser) {
    const roleCls = isUser ? 'aiml-time-user' : 'aiml-time-bot';
    const prev = afterEl.previousElementSibling;
    if (prev && prev.classList.contains('aiml-msg-time') && prev.classList.contains(roleCls)) prev.remove();
    const t = document.createElement('div');
    t.className = `aiml-msg-time ${roleCls}`;
    t.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    afterEl.insertAdjacentElement('afterend', t);
  }

  startBotMessage() {
    const messages = this.shadow.querySelector('.aiml-messages');
    this._streaming = true;
    this._streamBuffer = '';
    this._toolGroup = null;
    this._toolRows = {};

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'aiml-msg aiml-msg-bot aiml-typing-indicator';
    typing.setAttribute('aria-label', 'AI is typing');
    typing.innerHTML = `<div class="aiml-msg-bubble"><div class="aiml-typing"><span></span><span></span><span></span></div></div>`;
    messages.appendChild(typing);
    this._scrollToBottom();

    this._streamingEl = null;
    this._typingEl = typing;

    const input = this.shadow.querySelector('.aiml-input');
    const sendBtn = this.shadow.querySelector('.aiml-send-btn');
    input.disabled = true;
    sendBtn.disabled = true;

    return { typing };
  }

  appendToken(token) {
    if (!this._streaming) return;
    this._streamBuffer += token;

    if (this._typingEl) {
      this._typingEl.remove();
      this._typingEl = null;

      const messages = this.shadow.querySelector('.aiml-messages');
      const msg = document.createElement('div');
      msg.className = 'aiml-msg aiml-msg-bot';
      msg.setAttribute('role', 'article');
      msg.setAttribute('aria-label', 'AI Assistant');
      msg.innerHTML = `<div class="aiml-msg-bubble"></div>`;
      messages.appendChild(msg);
      this._streamingEl = msg.querySelector('.aiml-msg-bubble');
      this._currentBotMsg = msg;
    }

    if (this._streamingEl) {
      this._streamingEl.innerHTML = renderMarkdown(this._streamBuffer);
      this._scrollToBottom();
    }
  }

  finishBotMessage(citations) {
    this._streaming = false;
    const hadBubble = !!this._streamingEl; // false when the turn produced no tokens (e.g. error path)

    if (this._typingEl) { this._typingEl.remove(); this._typingEl = null; }

    // Tolerate both camelCase (current API) and PascalCase (older API / cached answers), and drop
    // any citation without a URL so we never render an "undefined" link.
    const sources = (citations || [])
      .map(c => ({ url: c.sourceUrl || c.SourceUrl || '', title: c.title || c.Title || '', via: c.via || c.Via || '' }))
      .filter(c => c.url);

    if (this._streamingEl && sources.length) {
      const citDiv = document.createElement('div');
      citDiv.className = 'aiml-citations';
      citDiv.innerHTML = `<div class="aiml-citations-title">Sources</div>` +
        sources.map(c =>
          `<a class="aiml-citation-link" href="${escAttr(c.url)}" target="_blank" rel="noopener noreferrer" title="${escAttr(c.title || c.url)}">` +
          `${escHtml(c.title || c.url)}` +
          (c.via ? `<span class="aiml-via">via ${escHtml(c.via)}</span>` : '') +
          `</a>`).join('');
      this._streamingEl.appendChild(citDiv);
    }

    this._streamingEl = null;
    if (hadBubble && this._currentBotMsg) this._stampTime(this._currentBotMsg, false);
    this._scrollToBottom();

    const input = this.shadow.querySelector('.aiml-input');
    input.disabled = false;
    input.value = '';
    input.style.height = '';
    input.focus();
    const sendBtn = this.shadow.querySelector('.aiml-send-btn');
    sendBtn.disabled = true;
  }

  // Wipe the thread (overflow-menu "Clear conversation"): drop all messages and any in-flight
  // stream state, then re-show the greeting so the window isn't left blank.
  clearConversation() {
    const messages = this.shadow.querySelector('.aiml-messages');
    if (messages) messages.innerHTML = '';
    this._streaming = false;
    this._streamingEl = null;
    this._streamBuffer = '';
    this._currentBotMsg = null;
    this._toolGroup = null;
    this._toolRows = {};
    this._confirmCards = {};
    // The host's onClear resets the server-side session and re-renders the greeting; the fallback
    // only covers a UI used without a host wiring.
    if (this.onClear) this.onClear();
    else if (this.config.greeting) this.showGreeting(this.config.greeting);
  }

  // ── Agent mode (Phase 10 D1) — mirrors widget_agent.jsx ──

  // Tag the in-flight bot message with the agent that produced it, in that agent's accent colour.
  setAgent(name) {
    if (!name || !this.config.showAgentName) return;
    this._lastAgent = name;
    // Keep the header honest about who's talking: recolor the status dot and the "Now:" line.
    const meta = agentMeta(name);
    this.shadow.querySelectorAll('.aiml-header-dot').forEach((d) => { d.style.background = meta.accent; });
    const nowEl = this.shadow.querySelector('.aiml-header-now');
    if (nowEl) nowEl.textContent = name; // name stays white — the dot carries the accent
    const host = this._currentBotMsg;
    if (!host) return;
    let pill = host.querySelector('.aiml-agent-pill');
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'aiml-agent-pill';
      host.insertBefore(pill, host.firstChild);
    }
    pill.style.setProperty('--ac', meta.accent);
    pill.innerHTML = `<span class="aiml-agent-ico">${GLYPH[meta.icon]}</span>${escHtml(name)}`;
    this._scrollToBottom();
  }

  // Labelled divider when control passes between agents, accented in the destination agent's colour.
  showHandoff(info) {
    const to = info && info.to;
    if (!to) return;
    this._lastAgent = to;
    this._toolGroup = null; // a new agent starts a fresh tool group
    const col = agentMeta(to).accent;
    // The header follows the handoff too.
    this.shadow.querySelectorAll('.aiml-header-dot').forEach((d) => { d.style.background = col; });
    const nowEl = this.shadow.querySelector('.aiml-header-now');
    if (nowEl) nowEl.textContent = to; // name stays white — the dot carries the accent
    const messages = this.shadow.querySelector('.aiml-messages');
    const div = document.createElement('div');
    div.className = 'aiml-handoff';
    div.setAttribute('role', 'separator');
    div.style.setProperty('--ac', col);
    div.innerHTML =
      `<div class="aiml-handoff-row">` +
        `<span class="aiml-handoff-line"></span>` +
        `<span class="aiml-handoff-pill">${GLYPH.arrow} Handed off to <b>${escHtml(to)}</b></span>` +
        `<span class="aiml-handoff-line"></span>` +
      `</div>` +
      (info.reason ? `<span class="aiml-handoff-reason">${escHtml(info.reason)}</span>` : '');
    messages.appendChild(div);
    this._scrollToBottom();
  }

  // Live MCP tool activity: a running row flips to done; the group collapses to "Used N tools".
  showTool(info) {
    if (!info || !info.id) return;
    const messages = this.shadow.querySelector('.aiml-messages');
    if (!this._toolGroup) {
      this._toolGroup = document.createElement('div');
      this._toolGroup.className = 'aiml-tools';
      this._toolGroup.setAttribute('role', 'status');
      this._toolRows = {};
      messages.appendChild(this._toolGroup);
    }
    const group = this._toolGroup;
    let row = this._toolRows[info.id];
    if (!row) {
      row = document.createElement('div');
      row.className = 'aiml-tool-row';
      group.appendChild(row);
      this._toolRows[info.id] = row;
    }
    const running = !info.done;
    const failed = info.done && info.ok === false;
    const ico = running
      ? `<span class="aiml-tool-ico aiml-spin">${GLYPH.loader}</span>`
      : failed
        ? `<span class="aiml-tool-ico aiml-err aiml-done">${GLYPH.x}</span>`
        : `<span class="aiml-tool-ico aiml-ok aiml-done">${GLYPH.check}</span>`;
    const server = info.server
      ? `<span class="aiml-server-tag">${escHtml(info.server)}</span>` : '';
    row.innerHTML = `${ico}<span class="aiml-tool-label">${escHtml(info.label || info.name || 'Working')}${running ? '…' : ''}</span>${server}`;
    // When every row is done (succeeded or failed), collapse the group to a compact summary line.
    const rows = Object.values(this._toolRows);
    if (rows.length && rows.every((r) => r.querySelector('.aiml-done'))) {
      group.classList.add('aiml-tools-done');
      const n = rows.length;
      const anyErr = rows.some((r) => r.querySelector('.aiml-err'));
      group.innerHTML =
        `<span class="aiml-tool-ico ${anyErr ? 'aiml-err' : 'aiml-ok'}">${anyErr ? GLYPH.x : GLYPH.check}</span>` +
        `<span class="aiml-tool-summary">Used ${n} tool${n > 1 ? 's' : ''}</span>`;
      this._toolGroup = null; // finalize; a later call starts a new group
    }
    this._scrollToBottom();
  }

  // Human-in-the-loop write confirmation, accented in the active agent's colour.
  showConfirmCard(info, onDecide) {
    if (!info || !info.id) return;
    this._toolGroup = null;
    const col = agentMeta(this._lastAgent).accent;
    const messages = this.shadow.querySelector('.aiml-messages');
    const card = document.createElement('div');
    card.className = 'aiml-confirm';
    card.setAttribute('role', 'group');
    card.style.setProperty('--ac', col);
    const server = info.server
      ? `<span class="aiml-server-tag">${escHtml(info.server)}</span>` : '';
    card.innerHTML =
      `<div class="aiml-confirm-head"><span class="aiml-confirm-shield">${GLYPH.shield}</span>Approval needed${server ? `<span class="aiml-confirm-srv">${server}</span>` : ''}</div>` +
      `<div class="aiml-confirm-title">${escHtml(info.title || info.action || 'Perform this action?')}</div>` +
      (info.summary ? `<div class="aiml-confirm-summary">${escHtml(info.summary)}</div>` : '') +
      `<div class="aiml-confirm-actions">` +
        `<button class="aiml-confirm-approve" type="button">${GLYPH.check} Allow</button>` +
        `<button class="aiml-confirm-deny" type="button">Not now</button>` +
      `</div>` +
      `<div class="aiml-confirm-foot">${GLYPH.lock} Read-only by default — you approve every change.</div>` +
      `<div class="aiml-confirm-status aiml-hidden" role="status"></div>`;

    const decide = (allow) => {
      card.querySelector('.aiml-confirm-actions').classList.add('aiml-hidden');
      card.querySelector('.aiml-confirm-foot').classList.add('aiml-hidden');
      const status = card.querySelector('.aiml-confirm-status');
      status.classList.remove('aiml-hidden');
      status.textContent = allow ? 'Approving…' : 'Dismissed.';
      onDecide(allow);
    };
    card.querySelector('.aiml-confirm-approve').addEventListener('click', () => decide(true));
    card.querySelector('.aiml-confirm-deny').addEventListener('click', () => decide(false));

    this._confirmCards[info.id] = card;
    messages.appendChild(card);
    this._scrollToBottom();
  }

  // Resolution of a previously shown confirm card.
  showConfirmResult(info) {
    const card = info && this._confirmCards[info.id];
    if (!card) return;
    const status = card.querySelector('.aiml-confirm-status');
    status.classList.remove('aiml-hidden');
    status.innerHTML = info.executed
      ? `<span class="aiml-ok">${GLYPH.check}</span> Allowed`
      : 'Dismissed';
    card.classList.add(info.executed ? 'aiml-confirm-ok' : 'aiml-confirm-resolved');
    delete this._confirmCards[info.id];
    this._scrollToBottom();
  }

  // Passive escalation: offer a human handoff (opens the existing lead-capture form).
  showEscalate(onTalk) {
    const messages = this.shadow.querySelector('.aiml-messages');
    if (messages.querySelector('.aiml-escalate')) return; // once per turn
    const row = document.createElement('div');
    row.className = 'aiml-escalate';
    row.innerHTML =
      `<span class="aiml-escalate-ico">${GLYPH.user}</span>` +
      `<span class="aiml-escalate-text">Need a person? A teammate can take it from here.</span>` +
      `<button class="aiml-escalate-btn" type="button">Talk to a human</button>`;
    row.querySelector('.aiml-escalate-btn').addEventListener('click', () => { row.remove(); onTalk(); });
    messages.appendChild(row);
    this._scrollToBottom();
  }

  showStatus(type, message) {
    const messages = this.shadow.querySelector('.aiml-messages');
    const existing = messages.querySelector('.aiml-status');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = `aiml-status aiml-status-${type}`;
    div.setAttribute('role', 'alert');
    // Design's ErrorBubble variants: network / rate / quota get an icon + their own tone instead of
    // the generic centered error strip.
    const kindIcon = { network: 'alert', rate: 'clock', quota: 'info' }[type];
    if (kindIcon) {
      div.classList.add('aiml-status-kind');
      div.innerHTML = `<span class="aiml-status-ico">${STATUS_ICON[kindIcon]}</span><span>${escHtml(message)}</span>`;
    } else {
      div.textContent = message;
    }
    messages.appendChild(div);
    this._scrollToBottom();

    // Re-enable input on error
    if (type === 'error' || type === 'warn' || kindIcon) {
      this._streaming = false;
      if (this._typingEl) { this._typingEl.remove(); this._typingEl = null; }
      const input = this.shadow.querySelector('.aiml-input');
      input.disabled = false;
      const sendBtn = this.shadow.querySelector('.aiml-send-btn');
      sendBtn.disabled = !input.value.trim();
    }
  }

  // Agent-mode empty state (design: sparkles roundel + team intro). Used instead of the greeting
  // bubble when the owner hasn't set a custom greeting; the site's suggested-question chips render
  // beneath it via showSuggestedChips. Removed on first send like the chips.
  showAgentWelcome() {
    const messages = this.shadow.querySelector('.aiml-messages');
    const existing = messages.querySelector('.aiml-empty');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'aiml-empty';
    div.innerHTML =
      `<span class="aiml-empty-ico" aria-hidden="true">${ICONS.sparkles}</span>` +
      `<p class="aiml-empty-title">A team of agents, ready to help</p>` +
      `<p class="aiml-empty-sub">Support, Sales &amp; Technical agents that use live tools — and ask before acting.</p>`;
    messages.appendChild(div);
  }

  showGreeting(text) {
    if (!text) return;
    const messages = this.shadow.querySelector('.aiml-messages');
    const msg = document.createElement('div');
    msg.className = 'aiml-msg aiml-msg-bot';
    msg.setAttribute('role', 'article');
    msg.setAttribute('aria-label', 'AI Assistant');
    msg.innerHTML = `<div class="aiml-msg-bubble">${renderMarkdown(text)}</div>`;
    messages.appendChild(msg);
  }

  // Clickable starter-question chips. Shown beneath the AI's greeting on first open, and reused in the
  // no-answer flow ("you could ask about…"). Removed as soon as the visitor sends anything.
  showSuggestedChips(suggestedQuestions, heading) {
    const messages = this.shadow.querySelector('.aiml-messages');
    const existing = messages.querySelector('.aiml-welcome');
    if (existing) existing.remove();

    const qs = Array.isArray(suggestedQuestions) ? suggestedQuestions.slice(0, 4) : [];
    if (!qs.length) return;

    const div = document.createElement('div');
    div.className = 'aiml-welcome';
    div.innerHTML =
      `${heading ? `<p class="aiml-welcome-sub">${escHtml(heading)}</p>` : ''}` +
      `<div class="aiml-suggested" role="list">${
        qs.map(q => `<button class="aiml-suggested-btn" type="button" role="listitem">${escHtml(q)}</button>`).join('')
      }</div>`;

    div.querySelectorAll('.aiml-suggested-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        div.remove();
        this._emitSend(btn.textContent);
      });
    });

    messages.appendChild(div);
    this._scrollToBottom();
  }

  // After an honest "I couldn't find that" reply: offer related topics the assistant CAN answer, and
  // (when lead capture is available) let the visitor leave their email for a human follow-up.
  showNoAnswerHelp(question, suggestedQuestions, onLeadSubmit) {
    this.showSuggestedChips(suggestedQuestions, 'You could ask about:');
    if (onLeadSubmit) this.showLeadCaptureForm(question, onLeadSubmit);
  }

  hideWelcomeState() {
    const messages = this.shadow.querySelector('.aiml-messages');
    messages.querySelectorAll('.aiml-welcome, .aiml-empty').forEach((el) => el.remove());
  }

  // variant 'human' = the visitor asked for a person (overflow menu / escalation); default copy is
  // the no-answer fallback.
  showLeadCaptureForm(question, onSubmit, variant) {
    const messages = this.shadow.querySelector('.aiml-messages');
    const human = variant === 'human';
    const form = document.createElement('div');
    form.className = 'aiml-lead-form';
    form.setAttribute('role', 'form');
    form.innerHTML = `
      ${human ? '<p class="aiml-lead-title">Connect with a human</p>' : ''}
      <p class="aiml-lead-text">${human
        ? 'Leave your email and a teammate will pick up this thread.'
        : "I couldn't find an answer. Leave your email and we'll get back to you."}</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="you@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">${human ? 'Send' : 'Notify me'}</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">${human
        ? 'Thanks — a teammate will email you shortly.'
        : "Thanks! We'll be in touch."}</p>`;

    const emailInput = form.querySelector('.aiml-lead-email');
    const submitBtn = form.querySelector('.aiml-lead-submit');
    const errorEl = form.querySelector('.aiml-lead-error');
    const successEl = form.querySelector('.aiml-lead-success');

    submitBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      if (!email || !email.includes('@')) {
        errorEl.classList.remove('aiml-hidden');
        return;
      }
      errorEl.classList.add('aiml-hidden');
      submitBtn.disabled = true;
      try {
        await onSubmit(email, question);
        emailInput.classList.add('aiml-hidden');
        submitBtn.classList.add('aiml-hidden');
        successEl.classList.remove('aiml-hidden');
      } catch {
        submitBtn.disabled = false;
        errorEl.textContent = 'Failed to submit. Please try again.';
        errorEl.classList.remove('aiml-hidden');
      }
    });

    messages.appendChild(form);
    this._scrollToBottom();
    setTimeout(() => emailInput.focus(), 50);
  }

  _scrollToBottom() {
    const messages = this.shadow.querySelector('.aiml-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escAttr(str) {
  return String(str || '').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
