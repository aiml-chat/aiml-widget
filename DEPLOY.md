# Deploying the widget to `cdn.aiml.chat`

The embed snippet, the WordPress/Shopify plugins, the dashboard live preview, and the dogfood demo all load
the widget from **`https://cdn.aiml.chat/v1/widget.js`**. This doc gets that URL live.

`npm run build` produces, in `dist/`:
- `widget.js` — the bundle (also served at `/widget.js`).
- `v1/widget.js` — the **production embed path** (versioned prefix; a future breaking change ships as `/v2/`).
- `_headers` — Cloudflare Pages cache rules for `/v1/widget.js`.
- `test-embed.html` — manual test harness.

## Option A — Cloudflare Pages (recommended)
1. Cloudflare → Workers & Pages → **Create → Pages → Connect to Git** → `aiml-chat/aiml-widget`.
2. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Deploy. Then **Custom domains → add `cdn.aiml.chat`** (Cloudflare adds the CNAME automatically since DNS is
   on Cloudflare).
4. Verify:
   ```
   curl -I https://cdn.aiml.chat/v1/widget.js     # 200, Cache-Control from _headers
   ```
5. Every push to `main` redeploys. Because `/v1/widget.js` is re-published in place, the `_headers` cache is
   deliberately short (5 min browser / 1 h edge + stale-while-revalidate) so fixes propagate without pinning
   stale code. For a hard cutover, ship a new path (`/v2/widget.js`) and update the embed snippets.

## Option B — Cloudflare R2 + custom domain
Upload `dist/v1/widget.js` to an R2 bucket bound to `cdn.aiml.chat`, set `Cache-Control` on the object to
match `_headers`. Re-upload on each release.

## Option C — Cloudflare Worker
Serve the bundled JS from a Worker route `cdn.aiml.chat/v1/widget.js` with the cache headers. More moving
parts; only needed if you want request-time logic (A/B, kill-switch).

## After it's live
- Web build arg: `NEXT_PUBLIC_WIDGET_JS_URL` can stay unset (code already defaults to
  `https://cdn.aiml.chat/v1/widget.js`) or be set explicitly.
- Smoke: load a real page with the embed snippet → the launcher appears and chat answers; open the dashboard
  Widget tab → the live preview loads the same bundle.
