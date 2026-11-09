# rails · implementer
Applies when: rails in the Gemfile, or config/application.rb present
Read order: rails-scope-find, rails-params-permit, rails-where-placeholders, rails-html-safe, rails-csrf-on, rails-devise-hardening, rails-includes, rails-migration-reversible

## Iron laws
- Every record loaded from `params[:id]` comes through `current_user`/`current_account` or an `authorize` call. Thinking "the route is already behind authenticate_user!"? That is the bug.

## Deviation rules
- Schema changes go through `bin/rails generate migration`; commit the migration and the updated `db/schema.rb` (or `structure.sql`) together.
- Jobs (ActiveJob, Sidekiq) are retried on failure; guard side effects (charges, emails) with a state check or unique key in the job.
- Secrets go in `bin/rails credentials:edit` or ENV, never `config/*.yml` committed in plain text.

## Output additions
- Migration added: file name and whether it ran (`bin/rails db:migrate`).

## Obstacles to report
- `ActiveRecord::PendingMigrationError` in tests: run `bin/rails db:migrate RAILS_ENV=test` only if the brief allows; otherwise report it.
