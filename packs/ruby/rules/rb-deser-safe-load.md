---
id: rb-deser-safe-load
title: Parse untrusted YAML with safe_load and never Marshal.load untrusted bytes
impact: CRITICAL
impactDescription: "remote code execution through object instantiation in a crafted payload"
roles: [implementer, reviewer, security]
check: "rg -n 'YAML\\.(unsafe_)?load\\b|Marshal\\.load|Oj\\.load\\b' --type ruby"
tags: deserialisation, yaml
---
Source: uploads, cookies, cache entries an attacker can write, API responses. Sink: `Marshal.load`, `YAML.unsafe_load`, `Oj.load` in object mode, and `YAML.load` on Psych < 4 (Ruby < 3.1), where `load` instantiates arbitrary classes. Use `YAML.safe_load` with an explicit `permitted_classes` list, and JSON for data that crosses a trust boundary.

**Incorrect:**

```ruby
config = YAML.load(params[:file].read)
cart = Marshal.load(Base64.decode64(cookies[:cart]))
```

**Correct:**

```ruby
config = YAML.safe_load(params[:file].read, permitted_classes: [Date], aliases: false)
cart = JSON.parse(cookies.signed[:cart] || "{}")
```

