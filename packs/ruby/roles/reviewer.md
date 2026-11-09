# ruby · reviewer
Applies when: Gemfile or *.gemspec present
Read order: rb-dispatch-input, rb-deser-safe-load, rb-shell-interpolation

## Blocker vs should-fix
- Blocker: any of the three rules above reached by input that is not a constant.
- Should-fix: new rubocop offences in changed lines when the project runs rubocop in CI.
