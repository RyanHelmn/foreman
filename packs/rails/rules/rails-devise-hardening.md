---
id: rails-devise-hardening
title: Enable Devise lockable and paranoid mode, and confirmable where emails grant access
impact: HIGH
impactDescription: "unlimited password guessing and account enumeration through login and reset responses"
roles: [implementer, reviewer, security]
check: "rg -n 'config.paranoid|lock_strategy|devise :' config/initializers/devise.rb app/models"
tags: auth, devise
---
Devise's defaults allow unlimited sign-in attempts and say whether an email exists on reset. Add `:lockable` to the model with `config.lock_strategy = :failed_attempts` and `config.maximum_attempts`, and set `config.paranoid = true`. Add `:confirmable` when an email address grants access (invites, domain-based org joins). Keep `config.stretches` at the default outside test. Don't hand-roll token checks next to Devise.

**Incorrect:**

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable
end
```

**Correct:**

```ruby
devise :database_authenticatable, :registerable, :recoverable, :lockable, :confirmable
```

```ruby
config.paranoid = true
config.lock_strategy = :failed_attempts
config.maximum_attempts = 10
```

Reference: https://github.com/heartcombo/devise/wiki
