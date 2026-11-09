# web-frameworks · reviewer
Applies when: Remix, React Router framework mode, SvelteKit, Nuxt or Astro is detected
Read order: web-loader-action-authorise, web-public-env-prefix, web-server-only-modules, web-loader-return-public, web-progressive-form-actions

## Blocker vs should-fix
- Blocker: a loader, action or endpoint without its own auth; a secret under a public prefix; whole records with credentials or personal data returned from a loader.
- Should-fix: database or secret code outside server-only modules; mutations via `fetch` in click handlers where a form action fits; actions reading `formData` without a schema.
