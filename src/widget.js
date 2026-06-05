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
  const position = script.getAttribute('data-position') || 'right'; // 'right' | 'left'
  const theme = script.getAttribute('data-theme') || 'auto';        // 'light' | 'dark' | 'auto'
  const primaryColor = script.getAttribute('data-primary-color') || null;
  // Comma-separated list of suggested questions, e.g. data-suggested-questions="How do I install?,...
  const suggestedQuestionsAttr = script.getAttribute('data-suggested-questions');
  const suggestedQuestionsOverride = suggestedQuestionsAttr
    ? suggestedQuestionsAttr.split('|').map(q => q.trim()).filter(Boolean)
    : null;

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

    const suggestedQuestions = suggestedQuestionsOverride
      ?? serverConfig.suggestedQuestions
      ?? [];

    const uiConfig = {
      position,
      theme,
      primaryColor,
      title: serverConfig.title || 'AI Assistant',
      subtitle: serverConfig.subtitle || 'Ask me anything',
      placeholder: serverConfig.placeholder || 'Ask a question…',
      greeting: serverConfig.greeting || null,
      showBranding: serverConfig.showBranding !== false,
      suggestedQuestions,
    };

    const ui = new WidgetUI(uiConfig);
    const client = new ChatClient(apiUrl, apiKey);

    ui.mount();

    // Greet proactively so the panel is NEVER empty. We render a welcome bubble + (if configured)
    // suggested-question chips into the chat area right away — visible the moment the visitor opens
    // the widget, so they never face a blank box and have to figure out what to type. Rendered on
    // mount (not on first open) so it's robust to the open/toggle path and to a persisted session.
    ui.showGreeting(uiConfig.greeting || DEFAULT_GREETING);
    ui.showSuggestedChips(uiConfig.suggestedQuestions, 'Try asking:');

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
