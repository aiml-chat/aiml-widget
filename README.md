# aiml-widget

[![Build & Size Check](https://github.com/aimlchat/aiml-widget/actions/workflows/build.yml/badge.svg)](https://github.com/aimlchat/aiml-widget/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle size](https://img.shields.io/badge/gzipped-6.8KB-brightgreen)](dist/widget.js)

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

All configuration is via `data-*` attributes on the script tag:

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-api-key` | string | — | **Required.** Your API key from the dashboard. |
| `data-position` | `right` \| `left` | `right` | Widget position. |
| `data-theme` | `auto` \| `light` \| `dark` | `auto` | Colour scheme. |
| `data-primary-color` | CSS colour | `#2563eb` | Override the primary accent colour. |
| `data-api-url` | URL | `https://api.aiml.chat` | Override the API base URL (self-hosted). |

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
