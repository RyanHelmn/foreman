---
id: jvm-deser-untrusted
title: Never deserialise untrusted bytes with ObjectInputStream or Jackson default typing
impact: CRITICAL
impactDescription: "remote code execution through a gadget chain on the classpath"
roles: [implementer, reviewer, security]
check: "rg -n 'ObjectInputStream|activateDefaultTyping|enableDefaultTyping|JsonTypeInfo.Id.CLASS' --type java --type kotlin"
tags: deserialisation, jackson
---
Source: a request body, cookie, queue message or file. Sink: `ObjectInputStream.readObject`, `XMLDecoder`, or Jackson with `activateDefaultTyping`/`enableDefaultTyping` or `@JsonTypeInfo(use = Id.CLASS)`, which let the payload name the class to instantiate. Deserialise into concrete DTOs; for polymorphism use `Id.NAME` with an explicit `@JsonSubTypes` list.

**Incorrect:**

```java
mapper.activateDefaultTyping(mapper.getPolymorphicTypeValidator());
Object cart = new ObjectInputStream(request.getInputStream()).readObject();
```

**Correct:**

```java
CartDto cart = mapper.readValue(request.getInputStream(), CartDto.class);
```

Reference: https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html
