# web-frameworks · security
Applies when: Remix, React Router framework mode, SvelteKit, Nuxt or Astro is detected
Read order: web-loader-action-authorise, web-public-env-prefix, web-server-only-modules, web-loader-return-public

## Also trace
- `redirect(url.searchParams.get('redirectTo'))`: same-origin check before redirecting.
- SvelteKit `csrf.checkOrigin` (or `trustedOrigins`) left at its default; Remix and React Router have no built-in CSRF check, so cookie-authenticated actions need `SameSite` cookies or a token.
- Nuxt `server/api` and `server/routes` handlers: each authenticates; `runtimeConfig.public` holds nothing secret.
- Astro: `set:html` with untrusted input is the same sink as `innerHTML`.
- SvelteKit `{@html}` and Vue `v-html` with untrusted input: sanitise first.

## Commands
- `rg -n 'VITE_|PUBLIC_|NUXT_PUBLIC_' .env* --glob '!*.example'` to list what ships to the client.
- `npm audit --omit=dev` when the lockfile changed.
