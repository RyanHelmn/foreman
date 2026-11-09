---
id: rb-dispatch-input
title: Never pass request input to send, constantize, eval or instance_variable_get
impact: CRITICAL
impactDescription: "the caller picks which method or class runs, up to remote code execution"
roles: [implementer, reviewer, security]
check: "rg -n '\\b(send|public_send|__send__|constantize|safe_constantize|instance_eval|class_eval|eval)\\b\\(?\\s*params' --type ruby"
tags: metaprogramming, injection
---
Source: `params`, headers, job arguments, webhook payloads. Sink: `send`/`public_send`, `constantize`, `Object.const_get`, `eval`/`instance_eval`, `instance_variable_get`. `send(params[:action])` reaches private methods such as `system` or `destroy`; `params[:type].constantize.new` instantiates any loaded class. Map input to an explicit allowlist first.

**Incorrect:**

```ruby
report = params[:type].constantize.new(current_user)
record.send(params[:field])
```

**Correct:**

```ruby
REPORTS = { "sales" => SalesReport, "refunds" => RefundReport }.freeze
report = REPORTS.fetch(params[:type]) { raise ActionController::BadRequest }.new(current_user)
record.public_send(params[:field]) if %w[name email].include?(params[:field])
```

Reference: https://guides.rubyonrails.org/security.html
