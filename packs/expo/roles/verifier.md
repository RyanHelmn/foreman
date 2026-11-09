# expo · verifier
Applies when: `expo` or `react-native` in package.json, or `app.config.*` / `eas.json` present
Read order: expo-ota-no-native

## Commands
- Subset (jest-expo preset): `npx jest path/to/Screen.test.tsx`, `npx jest -t "name of test"`, or `npx jest --findRelatedTests src/a.tsx src/b.tsx`.
- Full: `npx jest`, then `npx expo lint` when the project has an Expo ESLint config, then `npx expo-doctor` for SDK and dependency mismatches.
- E2E, critical flows only and only when the brief asks: `maestro test .maestro/<flow>.yaml`, or `detox test --configuration <name from .detoxrc>` against an existing build. No simulator or build: INCONCLUSIVE.

## Output additions
- Native layer changed: yes/no, from the diff (package.json native deps, `plugins`, `ios`/`android` keys) and whether `runtimeVersion` changed with it.

## Obstacles to report
- jest-expo mocks native modules, so a component test passes when the module isn't installed in the dev build or is missing from `plugins`. Report it, don't count it as proof.
- Typed-route types live in generated `.expo/types`; a stale copy hides route errors from `tsc`. They regenerate when `npx expo start` runs.
- Tests using Testing Library RN need `await` on `findBy*` queries; a missing await passes while asserting nothing (list as weak).
