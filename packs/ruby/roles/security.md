# ruby · security
Applies when: Gemfile or *.gemspec present
Read order: rb-dispatch-input, rb-deser-safe-load, rb-shell-interpolation

## Also trace (no rule file yet)
- `File.join`/`File.read`/`send_file` with request input and no check that the expanded path stays under a fixed root.
- `ERB.new(input).result`: template injection is code execution.
- Regexes anchored with `^`/`$` used for validation: Ruby matches per line; use `\A` and `\z`.

## Commands
- `bundle exec bundle-audit check --update` when the bundler-audit gem is in the Gemfile; otherwise report that no Ruby advisory scan is configured.
