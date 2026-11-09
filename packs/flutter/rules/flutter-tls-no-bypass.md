---
id: flutter-tls-no-bypass
title: Never accept bad certificates; pin certificates for high-value APIs
impact: HIGH
impactDescription: "anyone on the network can read and change traffic, including tokens and payments"
roles: [implementer, reviewer, security]
check: "rg -n 'badCertificateCallback' lib"
tags: flutter, network, tls
---
Source: a TLS certificate presented by whoever answers the connection. Sink: `HttpClient`, `dio` or `http` requests carrying tokens. A `badCertificateCallback` returning `true` disables validation, often left over from a debug proxy. For payment, auth or health APIs, trust only your pinned certificate or CA through a `SecurityContext` with `withTrustedRoots: false`, and plan the pin rotation before the certificate expires.

**Incorrect:**

```dart
(dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () =>
    HttpClient()..badCertificateCallback = (cert, host, port) => true;
```

**Correct:**

```dart
final ctx = SecurityContext(withTrustedRoots: false)
  ..setTrustedCertificatesBytes((await rootBundle.load('certs/api_ca.pem')).buffer.asUint8List());
(dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () => HttpClient(context: ctx);
```
