# web-frameworks · implementer
Applies when: Remix, React Router framework mode, SvelteKit, Nuxt or Astro is detected
Read order: web-loader-action-authorise, web-public-env-prefix, web-server-only-modules, web-loader-return-public, web-progressive-form-actions

## Iron laws
- Every loader, action, `+server.ts`, `server/api` handler and Astro endpoint checks the session itself or sits behind a server hook that covers all paths. Thinking "the layout already redirects"? That is the bug.

## Deviation rules
- Validate `formData`/params with the project's schema library inside the action before use.
- React Router v7 framework mode: use the generated `Route.LoaderArgs`/`Route.ComponentProps` types from `./+types/<route>` when the project already does.
- Astro: a page reading cookies or the session must be server-rendered (`export const prerender = false` in hybrid/static output, or `output: 'server'`).

## Output additions
- Routes added or changed: loader/action/endpoint, with the auth check each uses.

## Obstacles to report
- Generated route types out of date (`.react-router/types`, `.svelte-kit`, `.nuxt`): regenerate with the project's typegen or sync script and say so.
