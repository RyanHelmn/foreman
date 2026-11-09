# rails · security
Applies when: rails in the Gemfile, or config/application.rb present
Read order: rails-scope-find, rails-params-permit, rails-where-placeholders, rails-html-safe, rails-csrf-on, rails-devise-hardening

## Also trace (no rule file yet)
- `redirect_to params[:return_to]` without `allow_other_host: false` or a path check (open redirect).
- `render inline:` or `render file:` with input; `send_file` with a path from params.
- `config/master.key` or `config/credentials/*.key` committed; `config.force_ssl` off in production.
- Rack::Attack or equivalent throttling on sign-in, password reset and confirmation resend.
- `config.consider_all_requests_local = true` in production.

## Commands
- `bundle exec brakeman -q --no-pager` when brakeman is in the Gemfile, else `brakeman -q --no-pager` if installed; report new warnings in changed files.
- `bundle exec bundle-audit check --update` when bundler-audit is present.
