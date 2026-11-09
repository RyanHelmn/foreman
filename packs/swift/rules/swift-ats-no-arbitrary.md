---
id: swift-ats-no-arbitrary
title: Keep App Transport Security on; no NSAllowsArbitraryLoads
impact: HIGH
impactDescription: "every request may go over plain HTTP and be read or modified on the network"
roles: [implementer, reviewer, security]
check: "rg -n -A1 'NSAllowsArbitraryLoads' --glob '*.plist'"
tags: swift, network
---
ATS forces HTTPS with modern TLS. `NSAllowsArbitraryLoads` turns that off for every host and needs justification in App Store review. If one legacy host must stay on HTTP, add an `NSExceptionDomains` entry for that host only.

**Incorrect (`Info.plist`):**

```xml
<key>NSAppTransportSecurity</key>
<dict><key>NSAllowsArbitraryLoads</key><true/></dict>
```

**Correct:**

```xml
<key>NSAppTransportSecurity</key>
<dict><key>NSExceptionDomains</key><dict>
  <key>legacy.example.com</key><dict><key>NSExceptionAllowsInsecureHTTPLoads</key><true/></dict>
</dict></dict>
```

Reference: https://developer.apple.com/documentation/bundleresources/information-property-list/nsapptransportsecurity
