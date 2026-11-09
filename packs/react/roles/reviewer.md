# react · reviewer
Applies when: `react` is a dependency
Read order: react-no-html-unsanitised, react-url-validate, react-client-checks-ux-only, react-tokens-not-localstorage, react-derive-dont-store, react-stable-keys, react-test-by-role, react-colocate-state, react-hooks-per-domain, react-store-selectors, react-memo-measured-only

## Blocker vs should-fix
- Blocker: unsanitised HTML or unvalidated URL from users reaching a sink; a UI-only permission gate on a mutating action; index keys on a list that can be reordered, filtered or edited.
- Should-fix: effect-synced state; a component calling the HTTP client directly when domain hooks exist; whole-store subscriptions; a second styling approach (CSS modules next to Tailwind, styled-components next to CSS modules); component tests that only snapshot.
- Nit: memoisation without a measured reason; state one level higher than needed.

## Obstacles to report
- A component that fetches, holds state and lays out a whole page: suggest the split in Notes, don't block on it.
