# rails · reviewer
Applies when: rails in the Gemfile, or config/application.rb present
Read order: rails-scope-find, rails-params-permit, rails-where-placeholders, rails-html-safe, rails-csrf-on, rails-devise-hardening, rails-includes, rails-migration-reversible

## Blocker vs should-fix
- Blocker: rails-scope-find, rails-params-permit, rails-where-placeholders, rails-html-safe on user content; CSRF skipped on a cookie-authenticated controller; a migration edited after it ran.
- Should-fix: missing `includes` on a list; an irreversible `change`; a multi-model write with no `transaction`; a job that charges or emails without an idempotency guard.
- Nit: logic in a callback or controller that the project's existing service objects would hold.
