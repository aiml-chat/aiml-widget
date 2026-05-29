import { ChatClient } from './chat.js';
import { WidgetUI } from './ui.js';

(function () {
  'use strict';

  // Prevent double-init
  if (window.__aimlWidgetLoaded) return;
  window.__aimlWidgetLoaded = true;

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
  const position = script.getAttribute('data-position') || 'right'; // 'right' | 'left'
  const theme = script.getAttribute('data-theme') || 'auto';        // 'light' | 'dark' | 'auto'
  const primaryColor = script.getAttribute('data-primary-color') || null;

  if (!apiKey) {
    console.warn('[AIML] Missing data-api-key on script tag.');
    return;
  }

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

    const uiConfig = {
      position,
      theme,
      primaryColor,
      title: serverConfig.title || 'AI Assistant',
      subtitle: serverConfig.subtitle || 'Ask me anything',
      placeholder: serverConfig.placeholder || 'Ask a question…',
      greeting: serverConfig.greeting || null,
      showBranding: serverConfig.showBranding !== false,
    };

    const ui = new WidgetUI(uiConfig);
    const client = new ChatClient(apiUrl, apiKey);

    ui.mount();

    if (uiConfig.greeting && session.history.length === 0) {
      // Show greeting when window first opens
      const origOpen = ui.open.bind(ui);
      let greeted = false;
      ui.open = function () {
        origOpen();
        if (!greeted) { greeted = true; ui.showGreeting(uiConfig.greeting); }
      };
    }

    // Listen for send events from the UI
    ui.host.addEventListener('aiml:send', async (e) => {
      const text = e.detail.text;
      session.history.push({ role: 'user', content: text });
      saveSession(session);

      ui.appendUserMessage(text);
      ui.startBotMessage();

      let fullResponse = '';

      await client.send(text, session.history.slice(0, -1), session.conversationId, session.visitorId, {
        onToken(token) {
          fullResponse += token;
          ui.appendToken(token);
        },
        onCitations(citations) {
          ui.finishBotMessage(citations);
          session.history.push({ role: 'assistant', content: fullResponse });
          saveSession(session);
        },
        onDone() {
          if (!fullResponse) return;
          ui.finishBotMessage([]);
          session.history.push({ role: 'assistant', content: fullResponse });
          saveSession(session);
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
