# typescript · security
Applies when: tsconfig.json or a typescript dependency is present
Read order: ts-unknown-narrow

## Also trace (no rule file yet)
- `eval`, `new Function`, `vm.runInContext` or `vm.runInNewContext` reached by request data: code execution. `vm` is not a sandbox.
- Prototype pollution: request JSON into a recursive merge (`lodash.merge`, `deepmerge`, hand-written), or `obj[userKey] = value` with a user-controlled key, then a later `if (obj.isAdmin)`.
- `new RegExp(userInput)` or a nested-quantifier regex over request text: ReDoS blocks the event loop.
- `child_process.exec` / `execSync` with interpolated input: shell injection. `execFile` with an argument array is the safe form.

## Commands
- `npm audit --omit=dev`, `pnpm audit --prod`, or `yarn npm audit --environment production` (Yarn 2+), matching the lockfile present.
- A changed `package.json` without a changed lockfile means CI installs something nobody reviewed: report it.

## Output additions
- New dependencies with `preinstall`/`install`/`postinstall` scripts: name them.
