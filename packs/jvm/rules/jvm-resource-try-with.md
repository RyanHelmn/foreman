---
id: jvm-resource-try-with
title: Close connections, statements and streams with try-with-resources or use {}
impact: HIGH
impactDescription: "a leaked connection per exception exhausts the pool and the service stops answering"
roles: [implementer, reviewer]
tags: resources, jdbc
---
Every `Connection`, `PreparedStatement`, `ResultSet`, `InputStream`, `HttpClient` response body and `Files.lines` stream must be closed on every path, including exceptions. Open it in a `try (...)` header in Java or `.use { }` in Kotlin; a `close()` at the end of the block skips on throw.

**Incorrect:**

```java
Connection c = dataSource.getConnection();
PreparedStatement ps = c.prepareStatement(SQL);
ResultSet rs = ps.executeQuery();
c.close();
```

**Correct:**

```java
try (Connection c = dataSource.getConnection();
     PreparedStatement ps = c.prepareStatement(SQL);
     ResultSet rs = ps.executeQuery()) {
  ...
}
```

```kotlin
Files.newBufferedReader(path).use { reader -> parse(reader) }
```
