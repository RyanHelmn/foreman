# ruby · verifier
Applies when: Gemfile or *.gemspec present

## Commands
- RSpec subset: `bundle exec rspec spec/models/user_spec.rb`, one example: `bundle exec rspec spec/models/user_spec.rb:42`.
- Minitest subset (no Rails): `bundle exec ruby -Itest test/user_test.rb -n /rejects_blank_email/`.
- Lint when configured: `bundle exec rubocop <files>`.
- Full: `bundle exec rspec` or `bundle exec rake test`, plus `bundle exec rubocop`.

## Obstacles to report
- A leftover `fit`/`fdescribe`/`focus: true` with `filter_run_when_matching :focus` runs only the focused examples; a green full run is then not a full run.
- `xit`/`pending` examples report as pending, not failed; list any the diff added.
