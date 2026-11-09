# github-actions · verifier
Applies when: .github/workflows or an action.yml is present

## Commands
- If installed: `actionlint` for syntax, expression and shell errors in workflows.
- Without it: report the workflows as unverified; don't hand-roll a YAML check.

## Known false negatives
- Workflows can't run locally; a clean lint is not a passing run. Report changed workflows as "unverified until CI runs".
- An `on: paths:` filter or a branch filter can mean the changed workflow never triggers on this PR.
