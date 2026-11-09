---
id: swift-log-privacy
title: Keep personal data private in Logger interpolation; no print of user data
impact: MEDIUM
impactDescription: "emails and tokens appear in plain text in device logs and sysdiagnoses shared with support"
roles: [implementer, reviewer, security]
check: "rg -n 'privacy: \.public' --type swift"
tags: swift, logging
---
`Logger` (os_log) redacts dynamic string interpolations by default. `privacy: .public` opts out, and `print` / `NSLog` always log in full. Mark only non-personal values public, and use `.private(mask: .hash)` when you need to correlate a user across lines.

**Incorrect:**

```swift
logger.info("login \(email, privacy: .public) token \(token, privacy: .public)")
```

**Correct:**

```swift
logger.info("login user \(userID, privacy: .private(mask: .hash)) status \(status.rawValue, privacy: .public)")
```

Reference: https://developer.apple.com/documentation/os/logger
