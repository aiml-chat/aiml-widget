# aiml-widget — Contributor Reference

Embeddable vanilla JS chat widget for AI-powered documentation assistants.

## Build

```bash
npm install
npm run build        # → dist/widget.js (esbuild IIFE)
npm test             # placeholder
```

## Hard constraints

- **<30KB gzipped** — never exceed this
- **Zero npm runtime dependencies** — esbuild dev-only
- **Vanilla JS only** — no React, Preact, Lit, or any framework
- **Shadow DOM** — all styles scoped inside shadow root

## Embed API

```html
<script
  src="https://cdn.aiml.chat/v1/widget.js"
  data-api-key="aiml_pk_..."
  data-website-id="..."
  data-position="right"
  data-theme="auto"
  async defer>
</script>
```

`data-theme`: `auto` | `light` | `dark`  
`data-position`: `right` | `left`

## SSE streaming

Chat uses `POST /v1/chat` — use `fetch()` + `ReadableStream`, **not** `EventSource` (EventSource is GET-only).

## Theming

CSS custom properties inside the shadow root: `--aiml-primary`, `--aiml-bg`, `--aiml-text`, `--aiml-radius`.

## Browser targets

Chrome, Firefox, Safari, Edge — last 2 major versions each.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
