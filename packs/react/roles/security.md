# react · security
Applies when: `react` is a dependency
Read order: react-no-html-unsanitised, react-url-validate, react-client-checks-ux-only, react-tokens-not-localstorage

## Also trace
- Logout: query caches (`queryClient.clear()`), persisted stores and `localStorage` entries holding personal data are cleared, so the next user on the device sees none of it.
- Third-party frames and widgets: `<iframe sandbox>` with the minimum `allow-*` flags; a CSP that does not need `unsafe-inline` for scripts.
- `postMessage` listeners check `event.origin` before acting on `event.data`.
- Markdown renderers with raw HTML enabled (`rehype-raw`, `html: true`) count as `dangerouslySetInnerHTML`.
- `target="_blank"` links to user URLs: `rel="noopener noreferrer"` when the project targets old browsers.

## Commands
- `rg -n 'dangerouslySetInnerHTML|innerHTML|insertAdjacentHTML|window\.open|location\.href\s*=' --glob '*.{ts,tsx,js,jsx}'` over the changed files to list sinks.
