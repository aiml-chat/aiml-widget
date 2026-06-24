# Changelog

## [1.2.0] — 2026-06-24

### Added
- **Agent mode** (`data-mode="agent"`) — routes the conversation to the site's agent team
  (Support / Sales / Technical) instead of plain RAG. The widget now renders the agent-mode SSE
  vocabulary: an agent attribution pill (`data-show-agent-name`, on by default), a handoff divider
  when the conversation is transferred between agents, and a human-in-the-loop **approval card** for
  actions that change data (the two-turn write-confirm flow — Approve/Deny re-posts to resolve the
  pending action and streams the result). All additive: a non-agent embed is byte-for-byte unchanged.
- Bundle: 10.6 KB gzipped (budget 30 KB).

## [1.1.0] — 2026-06-11

### Added
- **Appearance customization round** (all dashboard-configurable, with per-page `data-*` overrides):
  header avatar image (`data-avatar`), custom launcher icon (`data-launcher-icon`), launcher size
  presets (`data-launcher-size`: sm/md/lg), dismissible launcher teaser bubble (`data-launcher-label`),
  corner-rounding presets (`data-radius`: none/md/xl), edge offsets (`data-offset-x`/`data-offset-y` —
  clears cookie bars), `data-z-index`, one-time auto-open (`data-auto-open` seconds), and
  `data-hide-mobile`.
- `data-title`, `data-subtitle`, `data-greeting` embed overrides.

### Fixed
- **Dashboard appearance settings were silently ignored**: position, theme, and primary color were only
  ever read from `data-*` attributes. Precedence is now explicit attribute → dashboard config → default,
  per option — so the dashboard works, and embeds can still override.
- Color and image inputs are validated (CSS color literals only; https-only image URLs).

## [1.0.0] — 2026-05-31

### Added
- **Welcome/Empty state** — shown on first widget open with greeting text and up to 4 configurable suggested-question buttons
- `data-suggested-questions` attribute — pipe-separated list of questions shown on welcome screen
- Widget config endpoint now returns `suggestedQuestions[]` array from dashboard settings
- "Powered by aiml.chat" badge link now includes `?ref=widget` UTM parameter for referral tracking
- Welcome state is dismissed automatically when the user sends their first message

### Changed
- Bundle size: 8.0KB gzipped (welcome state CSS added)

## [Unreleased]

## [0.4.0] — 2026-05

### Added
- Lead capture form shown when API returns 404 (no relevant content)
- `ChatClient.captureLead()` — POST to `/v1/leads`
- `WidgetUI.showLeadCaptureForm()` — email input with validation and success state
- CSS: `.aiml-lead-form`, `.aiml-lead-email`, `.aiml-lead-submit`, `.aiml-lead-success`

## [0.3.0] — 2026-05

### Changed
- Bundle size: 7.5KB gzipped (was 6.8KB — lead capture form CSS added)
- Error message for `noContent` updated: shows lead form instead of static text when `websiteId` is set

## [0.2.0] — 2026-05

### Added
- Shadow DOM host with `data-theme` attribute
- Dark mode via `prefers-color-scheme` media query + `data-theme="dark"` override
- Typing indicator (3 bouncing dots)
- Markdown rendering (bold, italic, inline code, links, lists)
- Source citations with clickable links
- `window.AIML` public API (`open`, `close`, `toggle`, `clearHistory`)
- SessionStorage conversation continuity
- Error states: `auth`, `quota`, `rateLimit`, `noContent`, `network`, `stream`, `server`
- `data-primary-color` attribute for brand colour override

## [0.1.0] — 2026-05

### Added
- Initial IIFE widget with SSE streaming via `fetch()` + `ReadableStream`
- Shadow DOM isolation
- `data-position` (right/left), `data-theme` (light/dark/auto) attributes
- Keyboard accessibility: Tab navigation, focus trap, Escape to close
- "Powered by aiml.chat" badge (toggleable via `showBranding`)
- EU AI Act "AI Assistant" label in header
