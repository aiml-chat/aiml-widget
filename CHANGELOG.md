# Changelog

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
