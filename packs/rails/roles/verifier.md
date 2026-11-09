# rails · verifier
Applies when: rails in the Gemfile, or config/application.rb present

## Commands
- Minitest subset: `bin/rails test test/models/user_test.rb`, one test by line: `bin/rails test test/models/user_test.rb:12`.
- RSpec subset: `bundle exec rspec spec/requests/projects_spec.rb:12`.
- Full: `bin/rails test` then `bin/rails test:system` (system tests are not in `bin/rails test`), or `bundle exec rspec`.

## Obstacles to report
- Pending migrations or a schema mismatch abort the run before any test: INCONCLUSIVE with the error, not FAILED.
- System tests need a browser driver (Chrome/Selenium/Cuprite); a driver error is INCONCLUSIVE.
