# react · implementer
Applies when: `react` is a dependency
Read order: react-no-html-unsanitised, react-url-validate, react-tokens-not-localstorage, react-derive-dont-store, react-stable-keys, react-test-by-role, react-colocate-state, react-hooks-per-domain, react-store-selectors, react-memo-measured-only

## Iron laws
- No unsanitised HTML into `dangerouslySetInnerHTML`. Thinking "it comes from our own API"? That is the bug.

## Deviation rules
- Client stores (Zustand, Redux, Jotai): one store or slice per domain, extend the existing one; no server data copied into a store when the project has a query library.
- Styling: use the approach the neighbouring components use (Tailwind, CSS modules, styled-components, vanilla-extract); never introduce a second one.
- Components and hooks: one component per file, matching the folder's naming.

## Output additions
- Client-only gates added (hidden buttons, guarded routes): each with the server check that enforces it, or "none found".

## Obstacles to report
- An existing `useEffect` that syncs props into state in a file you touch: report it, don't refactor it unless it is the bug.
- `act(...)` warnings in tests you wrote: an unawaited update; await the `findBy*` or user-event call instead of wrapping in `act`.
