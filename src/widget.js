import { ChatClient } from './chat.js';
import { WidgetUI } from './ui.js';

(function () {
  'use strict';

  // Prevent double-init
  if (window.__aimlWidgetLoaded) return;
  window.__aimlWidgetLoaded = true;

  // Shown as the AI's opening message when the site owner hasn't set a custom greeting.
  const DEFAULT_GREETING =
    "Hi! 👋 I'm this site's AI assistant. Ask me anything — I'll answer from this site's own content and show you the sources.";

  // Read config from the script tag's data attributes
  const script = document.currentScript ||
    document.querySelector('script[data-api-key]');

  if (!script) {
    console.warn('[AIML] No script tag found with data-api-key attribute.');
    return;
  }

  const apiKey = script.getAttribute('data-api-key');
  const websiteId = script.getAttribute('data-website-id');
  const apiUrl = script.getAttribute('data-api-url') || 'https://api.aiml.chat';

  // Per-option embed overrides. Attributes win over the dashboard config ONLY when explicitly set —
  // an absent attribute means "use whatever the site owner configured in the dashboard".
  const attr = (name) => script.getAttribute('data-' + name);
  // Comma-free list separator is | so questions can contain commas.
  const suggestedQuestionsAttr = attr('suggested-questions');
  const suggestedQuestionsOverride = suggestedQuestionsAttr
    ? suggestedQuestionsAttr.split('|').map(q => q.trim()).filter(Boolean)
    : null;

  if (!apiKey) {
    console.warn('[AIML] Missing data-api-key on script tag.');
    return;
  }

  // Cheap input guards: a color must look like a CSS color literal (hex/rgb/hsl — no url(), no
  // semicolons that could escape the declaration); images must be https.
  const safeColor = (c) => c && /^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([\d\s.,%\/]+\))$/.test(c.trim()) ? c.trim() : null;
  const safeUrl = (u) => u && /^https:\/\/[^\s"'<>]+$/i.test(u.trim()) ? u.trim() : null;
  const intOr = (v, fallback, min, max) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  const oneOf = (v, allowed) => allowed.includes(v) ? v : null;

  // Session state (per-tab, cleared on close)
  const SESSION_KEY = `aiml_session_${websiteId || 'default'}`;

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : { conversationId: null, history: [], visitorId: generateId() };
    } catch { return { conversationId: null, history: [], visitorId: generateId() }; }
  }

  function saveSession(session) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
  }

  function generateId() {
    return 'v-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Fetch widget config from API (non-blocking, falls back to defaults)
  async function fetchConfig() {
    try {
      const res = await fetch(`${apiUrl}/v1/widgets/${encodeURIComponent(apiKey)}/config`, {
        headers: { 'X-Api-Key': apiKey }
      });
      if (res.ok) return await res.json();
    } catch {}
    return {};
  }

  async function init() {
    const serverConfig = await fetchConfig();
    const session = getSession();

    const suggestedQuestions = suggestedQuestionsOverride
      ?? serverConfig.suggestedQuestions
      ?? [];

    // Precedence per option: explicit data-attribute → dashboard config → default.
    const uiConfig = {
      position: oneOf(attr('position'), ['left', 'right']) || serverConfig.position || 'right',
      theme: oneOf(attr('theme'), ['light', 'dark', 'auto']) || serverConfig.theme || 'auto',
      primaryColor: safeColor(attr('primary-color')) || safeColor(serverConfig.primaryColor) || null,
      title: attr('title') || serverConfig.title || 'AI Assistant',
      subtitle: attr('subtitle') || serverConfig.subtitle || 'Ask me anything',
      placeholder: serverConfig.placeholder || 'Ask a question…',
      greeting: attr('greeting') || serverConfig.greeting || null,
      showBranding: serverConfig.showBranding !== false,
      suggestedQuestions,
      // Appearance extras (all optional; dashboard-first with embed overrides):
      avatarUrl: safeUrl(attr('avatar')) || safeUrl(serverConfig.avatarUrl) || null,
      launcherIconUrl: safeUrl(attr('launcher-icon')) || safeUrl(serverConfig.launcherIconUrl) || null,
      launcherSize: oneOf(attr('launcher-size'), ['sm', 'md', 'lg']) || serverConfig.launcherSize || 'md',
      launcherLabel: attr('launcher-label') ?? serverConfig.launcherLabel ?? null,
      radius: oneOf(attr('radius'), ['none', 'md', 'xl']) || serverConfig.radius || 'md',
      offsetX: intOr(attr('offset-x') ?? serverConfig.offsetX, 24, 0, 400),
      offsetY: intOr(attr('offset-y') ?? serverConfig.offsetY, 24, 0, 400),
      zIndex: intOr(attr('z-index') ?? serverConfig.zIndex, 2147483647, 1, 2147483647),
      autoOpenDelaySec: intOr(attr('auto-open') ?? serverConfig.autoOpenDelaySec, 0, 0, 600),
      hideOnMobile: (attr('hide-mobile') ?? String(serverConfig.hideOnMobile ?? false)) === 'true',
    };

    // Owner chose to keep the widget off small screens (e.g. it overlaps a mobile nav).
    if (uiConfig.hideOnMobile && window.matchMedia('(max-width: 640px)').matches) return;

    const ui = new WidgetUI(uiConfig);
    const client = new ChatClient(apiUrl, apiKey);

    ui.mount();

    // Greet proactively so the panel is NEVER empty. We render a welcome bubble + (if configured)
    // suggested-question chips into the chat area right away — visible the moment the visitor opens
    // the widget, so they never face a blank box and have to figure out what to type. Rendered on
    // mount (not on first open) so it's robust to the open/toggle path and to a persisted session.
    ui.showGreeting(uiConfig.greeting || DEFAULT_GREETING);
    ui.showSuggestedChips(uiConfig.suggestedQuestions, 'Try asking:');

    // Proactive open, ONCE per tab session — a classic engagement pattern, but re-opening on every
    // navigation is the fastest way to get the widget uninstalled.
    if (uiConfig.autoOpenDelaySec > 0 && !session.autoOpened) {
      setTimeout(() => {
        if (!ui.isOpen) ui.open();
        session.autoOpened = true;
        saveSession(session);
      }, uiConfig.autoOpenDelaySec * 1000);
    }

    // Listen for send events from the UI
    ui.host.addEventListener('aiml:send', async (e) => {
      const text = e.detail.text;
      ui.hideWelcomeState();
      session.history.push({ role: 'user', content: text });
      saveSession(session);

      ui.appendUserMessage(text);
      ui.startBotMessage();

      let fullResponse = '';

      // Finalize the bot bubble exactly once — citations, no-answer, and done can all arrive.
      let finalized = false;
      const finalize = (citations) => {
        if (finalized) return;
        finalized = true;
        ui.finishBotMessage(citations);
        if (fullResponse) {
          session.history.push({ role: 'assistant', content: fullResponse });
          saveSession(session);
        }
      };

      await client.send(text, session.history.slice(0, -1), session.conversationId, session.visitorId, {
        onToken(token) {
          fullResponse += token;
          ui.appendToken(token);
        },
        onCitations(citations) {
          finalize(citations);
        },
        onNoAnswer() {
          // Honest deflection: close the bubble, then offer what we CAN help with + email capture.
          finalize([]);
          ui.showNoAnswerHelp(text, uiConfig.suggestedQuestions, websiteId
            ? (email, question) => client.captureLead(websiteId, email, question)
            : null);
        },
        onDone() {
          finalize([]);
        },
        onError(type, extra) {
          if (type === 'noContent' && websiteId) {
            ui.showLeadCaptureForm(text, async (email, question) => {
              await client.captureLead(websiteId, email, question);
            });
            return;
          }
          const messages = {
            auth:       'Authentication failed. Please check your API key.',
            quota:      'Monthly message quota reached. Please upgrade your plan.',
            rateLimit:  `Too many requests. Please wait ${extra || 60} seconds.`,
            noContent:  'No answer found. Please contact us directly.',
            network:    'Connection error. Please check your network and try again.',
            stream:     'Stream interrupted. Please try again.',
            server:     'Server error. Please try again later.',
          };
          ui.showStatus('error', messages[type] || 'Something went wrong. Please try again.');
        },
      });
    });

    // Expose public API on window
    window.AIML = {
      open: () => ui.open(),
      close: () => ui.close(),
      toggle: () => ui.toggle(),
      clearHistory: () => {
        session.history = [];
        session.conversationId = null;
        saveSession(session);
      },
    };
  }

  // Defer init until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
