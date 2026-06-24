import styles from './styles.css';
import { renderMarkdown } from './markdown.js';

const ICONS = {
  chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bot: '🤖',
};

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
    win.innerHTML = `
      <div class="aiml-header">
        <div class="aiml-avatar" aria-hidden="true">${avatar}</div>
        <div class="aiml-header-info">
          <div class="aiml-header-title">${escAttr(this.config.title || 'AI Assistant')}</div>
          <div class="aiml-header-subtitle">${escAttr(this.config.subtitle || 'Ask me anything')}</div>
        </div>
        <span class="aiml-label" title="Powered by AI">AI</span>
        <button class="aiml-close-btn" aria-label="Close chat">
          ${ICONS.close}
        </button>
      </div>
      <div class="aiml-messages" role="log" aria-live="polite" aria-label="Chat messages"></div>
      <div class="aiml-input-area">
        <textarea
          class="aiml-input"
          placeholder="${escAttr(this.config.placeholder || 'Ask a question…')}"
          rows="1"
          aria-label="Chat message input"
          aria-multiline="true"
        ></textarea>
        <button class="aiml-send-btn" aria-label="Send message" disabled>
          ${ICONS.send}
        </button>
      </div>
      <div class="aiml-footer${this.config.showBranding === false ? ' aiml-no-brand' : ''}">
        <a class="aiml-badge" href="https://aiml.chat?ref=widget" target="_blank" rel="noopener noreferrer" tabindex="${this.config.showBranding === false ? '-1' : '0'}">
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
    setTimeout(() => this.shadow.querySelector('.aiml-input')?.focus(), 100);
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
    this._scrollToBottom();
    return msg;
  }

  startBotMessage() {
    const messages = this.shadow.querySelector('.aiml-messages');
    this._streaming = true;
    this._streamBuffer = '';

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

    if (this._typingEl) { this._typingEl.remove(); this._typingEl = null; }

    // Tolerate both camelCase (current API) and PascalCase (older API / cached answers), and drop
    // any citation without a URL so we never render an "undefined" link.
    const sources = (citations || [])
      .map(c => ({ url: c.sourceUrl || c.SourceUrl || '', title: c.title || c.Title || '' }))
      .filter(c => c.url);

    if (this._streamingEl && sources.length) {
      const citDiv = document.createElement('div');
      citDiv.className = 'aiml-citations';
      citDiv.innerHTML = `<div class="aiml-citations-title">Sources</div>` +
        sources.map(c => `<a class="aiml-citation-link" href="${escAttr(c.url)}" target="_blank" rel="noopener noreferrer" title="${escAttr(c.title || c.url)}">${escHtml(c.title || c.url)}</a>`).join('');
      this._streamingEl.appendChild(citDiv);
    }

    this._streamingEl = null;
    this._scrollToBottom();

    const input = this.shadow.querySelector('.aiml-input');
    input.disabled = false;
    input.value = '';
    input.style.height = '';
    input.focus();
    const sendBtn = this.shadow.querySelector('.aiml-send-btn');
    sendBtn.disabled = true;
  }

  // ── Agent mode (Phase 10 D1) ──

  // Tag the in-flight bot message with the agent that produced it (e.g. "Support", "Sales").
  setAgent(name) {
    if (!name || !this.config.showAgentName) return;
    this._lastAgent = name;
    const host = this._currentBotMsg;
    if (!host || host.querySelector('.aiml-agent-pill')) {
      if (host && host.querySelector('.aiml-agent-pill'))
        host.querySelector('.aiml-agent-pill').textContent = name;
      return;
    }
    const pill = document.createElement('div');
    pill.className = 'aiml-agent-pill';
    pill.textContent = name;
    host.insertBefore(pill, host.firstChild);
    this._scrollToBottom();
  }

  // A mid-conversation transfer between agents, shown as a subtle divider.
  showHandoff(info) {
    const to = info && info.to;
    if (!to) return;
    this._lastAgent = to;
    const messages = this.shadow.querySelector('.aiml-messages');
    const div = document.createElement('div');
    div.className = 'aiml-handoff';
    div.setAttribute('role', 'status');
    div.innerHTML = `<span class="aiml-handoff-line"></span>` +
      `<span class="aiml-handoff-text">Connected to ${escHtml(to)}</span>` +
      `<span class="aiml-handoff-line"></span>`;
    messages.appendChild(div);
    this._scrollToBottom();
  }

  // Human-in-the-loop write confirmation: the agent wants to perform an action that changes data.
  // Renders an approval card; onDecide(allow) is invoked with the visitor's choice.
  showConfirmCard(info, onDecide) {
    if (!info || !info.id) return;
    const messages = this.shadow.querySelector('.aiml-messages');
    const card = document.createElement('div');
    card.className = 'aiml-confirm';
    card.setAttribute('role', 'group');
    card.innerHTML =
      `<div class="aiml-confirm-head">Approval needed</div>` +
      `<div class="aiml-confirm-title">${escHtml(info.title || info.action || 'Perform this action?')}</div>` +
      (info.summary ? `<div class="aiml-confirm-summary">${escHtml(info.summary)}</div>` : '') +
      `<div class="aiml-confirm-actions">` +
        `<button class="aiml-confirm-deny" type="button">No, don't</button>` +
        `<button class="aiml-confirm-approve" type="button">Approve</button>` +
      `</div>` +
      `<div class="aiml-confirm-status aiml-hidden" role="status"></div>`;

    const decide = (allow) => {
      card.querySelector('.aiml-confirm-actions').classList.add('aiml-hidden');
      const status = card.querySelector('.aiml-confirm-status');
      status.classList.remove('aiml-hidden');
      status.textContent = allow ? 'Approving…' : 'Cancelled.';
      onDecide(allow);
    };
    card.querySelector('.aiml-confirm-approve').addEventListener('click', () => decide(true));
    card.querySelector('.aiml-confirm-deny').addEventListener('click', () => decide(false));

    this._confirmCards[info.id] = card;
    messages.appendChild(card);
    this._scrollToBottom();
  }

  // Resolution of a previously shown confirm card (executed or not).
  showConfirmResult(info) {
    const card = info && this._confirmCards[info.id];
    if (!card) return;
    const status = card.querySelector('.aiml-confirm-status');
    status.classList.remove('aiml-hidden');
    status.textContent = info.executed ? '✓ Done' : 'Not performed.';
    card.classList.add('aiml-confirm-resolved');
    delete this._confirmCards[info.id];
  }

  showStatus(type, message) {
    const messages = this.shadow.querySelector('.aiml-messages');
    const existing = messages.querySelector('.aiml-status');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = `aiml-status aiml-status-${type}`;
    div.setAttribute('role', 'alert');
    div.textContent = message;
    messages.appendChild(div);
    this._scrollToBottom();

    // Re-enable input on error
    if (type === 'error' || type === 'warn') {
      this._streaming = false;
      if (this._typingEl) { this._typingEl.remove(); this._typingEl = null; }
      const input = this.shadow.querySelector('.aiml-input');
      input.disabled = false;
      const sendBtn = this.shadow.querySelector('.aiml-send-btn');
      sendBtn.disabled = !input.value.trim();
    }
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
    const welcome = messages.querySelector('.aiml-welcome');
    if (welcome) welcome.remove();
  }

  showLeadCaptureForm(question, onSubmit) {
    const messages = this.shadow.querySelector('.aiml-messages');
    const form = document.createElement('div');
    form.className = 'aiml-lead-form';
    form.setAttribute('role', 'form');
    form.innerHTML = `
      <p class="aiml-lead-text">I couldn't find an answer. Leave your email and we'll get back to you.</p>
      <div class="aiml-lead-row">
        <input class="aiml-lead-email" type="email" placeholder="your@email.com" aria-label="Your email address" />
        <button class="aiml-lead-submit" type="button">Notify me</button>
      </div>
      <p class="aiml-lead-error aiml-hidden" role="alert">Please enter a valid email.</p>
      <p class="aiml-lead-success aiml-hidden" role="status">Thanks! We'll be in touch.</p>`;

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
