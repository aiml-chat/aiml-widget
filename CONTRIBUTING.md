# Contributing to aiml-widget

Thanks for your interest in contributing! This is the embeddable vanilla JS chat widget for AIML.chat.

## Ground rules

- Bundle must stay **under 30KB gzipped** after your change (`node build.js` checks this)
- Zero external dependencies — vanilla JS only
- Shadow DOM must remain intact (style isolation)
- Keyboard accessibility must be maintained (Tab, Enter, Escape)
- All browsers: Chrome, Firefox, Safari, Edge (last 2 major versions)

## Development setup

```bash
npm install
node build.js        # build + size check
```

The build outputs to `dist/widget.js`. Open `test/index.html` in a browser to test manually.

## Making changes

1. Fork the repo and create a feature branch
2. Make your change in `src/`
3. Run `node build.js` — fix any size violations
4. Test manually across browsers
5. Open a pull request using the PR template

## What we accept

- Bug fixes
- Accessibility improvements
- Performance improvements that don't increase bundle size
- New error states

## What we don't accept

- External runtime dependencies
- Framework-specific code (React, Vue, etc.)
- Features requiring backend changes (open an issue instead)

## Code style

- Vanilla JS (ES2020 target)
- No TypeScript in widget source
- Comments only when the WHY is non-obvious
