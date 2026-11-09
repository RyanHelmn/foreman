# electron · verifier
Applies when: `electron` or `@tauri-apps/api` in package.json, `tauri` in Cargo.toml, or `tauri.conf.json` present

## Commands
- Unit tests: the project's TypeScript runner, as the typescript pack describes.
- Tauri backend: subset `cargo test --manifest-path src-tauri/Cargo.toml <name_filter>`; full `cargo test --manifest-path src-tauri/Cargo.toml`.
- E2E, critical flows only: Playwright's Electron support (`_electron.launch`) via `npx playwright test <spec>` when the project has such specs. Needs a display; headless Linux without `xvfb-run`: INCONCLUSIVE.

## Obstacles to report
- Unit tests in jsdom never load the preload or main process; a passing renderer test says nothing about IPC wiring.
- Dev mode loads from a dev server with relaxed CSP and no asar; a feature that works in dev can fail packaged. Note when the change touches CSP, file paths or protocols and no packaged build was run.
