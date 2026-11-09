# ruby · implementer
Applies when: Gemfile or *.gemspec present
Read order: rb-dispatch-input, rb-deser-safe-load, rb-shell-interpolation

## Deviation rules
- Run `bundle exec rubocop <changed files>` when `.rubocop.yml` exists and fix offences in lines you wrote; leave the rest.
- Add gems only through the Gemfile the brief names; never `gem install`.

## Obstacles to report
- `Gemfile.lock` changed by your work without a Gemfile change: report it, don't commit it silently.
