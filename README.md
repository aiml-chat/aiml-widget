# aiml-widget

[![Build & Size Check](https://github.com/aimlchat/aiml-widget/actions/workflows/build.yml/badge.svg)](https://github.com/aimlchat/aiml-widget/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle size](https://img.shields.io/badge/gzipped-9.3KB-brightgreen)](dist/widget.js)

Embeddable AI chat widget for any website. Add one script tag — visitors get an AI assistant that answers questions using only your site's content.

**Part of [aiml.chat](https://aiml.chat)** — AI Docs & Website Assistant Infrastructure.

---

## Quick start

```html
<script
  src="https://cdn.aiml.chat/v1/widget.js"
  data-api-key="aiml_pk_your_key_here"
  async
></script>
```

Get your API key at [aiml.chat](https://aiml.chat) (free tier available).

---

## Configuration

Appearance is configured centrally in the [aiml.chat dashboard](https://aiml.chat) and fetched by the
widget — change it there and every embed updates without touching code. `data-*` attributes are
**per-page overrides**: an attribute set on the script tag wins over the dashboard value; an absent
attribute inherits it.

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-api-key` | string | — | **Required.** Your API key from the dashboard. |
| `data-website-id` | string | — | Enables lead capture when the assistant can't answer. |
| `data-position` | `right` \| `left` | `right` | Widget position. |
| `data-theme` | `auto` \| `light` \| `dark` | `auto` | Colour scheme. |
| `data-primary-color` | CSS colour | `#2563eb` | Primary accent colour (hex/rgb/hsl). |
| `data-title` | string | `AI Assistant` | Header title. |
| `data-subtitle` | string | `Ask me anything` | Header subtitle. |
| `data-greeting` | string | built-in | The assistant's opening message. |
| `data-avatar` | https URL | 🤖 | Avatar image in the chat header. |
| `data-launcher-icon` | https URL | chat icon | Custom image for the launcher button. |
| `data-launcher-size` | `sm` \| `md` \| `lg` | `md` | Launcher button size. |
| `data-launcher-label` | string | — | Teaser bubble next to the launcher ("Chat with us 👋"). Dismissible; hidden on mobile. |
| `data-radius` | `none` \| `md` \| `xl` | `md` | Corner rounding of the chat window. |
| `data-offset-x` | 0–400 (px) | `24` | Distance from the screen's side edge. |
| `data-offset-y` | 0–400 (px) | `24` | Distance from the bottom edge (clears cookie bars). |
| `data-z-index` | number | max | Stacking order override. |
| `data-auto-open` | 0–600 (seconds) | `0` | Auto-open the chat once per visit after this delay. `0` = never. |
| `data-hide-mobile` | `true` \| `false` | `false` | Don't render the widget on screens ≤ 640px. |
| `data-api-url` | URL | `https://api.aiml.chat` | Override the API base URL (self-hosted). |
| `data-suggested-questions` | pipe-separated strings | — | Up to 4 suggested questions shown on first open. |
| `data-mode` | `agent` | — | Route to the site's **agent team** (Support / Sales / Technical) with handoffs and write-confirm, instead of plain RAG. Requires an agent-capable plan; the API gates and falls back automatically. |
| `data-show-agent-name` | `true` \| `false` | `true` | In agent mode, show which agent answered as a pill above its replies. |

### Example with all options

```html
<script
  src="https://cdn.aiml.chat/v1/widget.js"
  data-api-key="aiml_pk_your_key_here"
  data-position="left"
  data-theme="dark"
  data-primary-color="#7c3aed"
  async
></script>
```

---

## JavaScript API

After the widget loads, `window.AIML` exposes:

```js
AIML.open()         // open the chat window
AIML.close()        // close the chat window
AIML.toggle()       // toggle open/closed
AIML.clearHistory() // clear conversation history from sessionStorage
```

---

## Browser support

Chrome, Firefox, Safari, Edge — last 2 major versions (ES2020+).

---

## Development

```bash
npm install
npm run build          # production bundle → dist/widget.js
npm run build:watch    # watch mode
npm run size           # show gzipped bundle size
```

The build fails if the gzipped bundle exceeds **30KB**.

---

## Architecture

| File | Purpose |
|------|---------|
| `src/widget.js` | Entry point. Reads `data-*` attributes, inits UI + client. |
| `src/ui.js` | Shadow DOM host, all DOM construction, event binding. |
| `src/chat.js` | SSE streaming via `fetch()` + `ReadableStream` (not `EventSource`). |
| `src/markdown.js` | Lightweight inline Markdown renderer (no deps). |
| `src/styles.css` | All styles, embedded as a string via esbuild. |
| `build.js` | esbuild config + gzip size check. |

The widget is a single IIFE bundle with **zero runtime dependencies**.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
