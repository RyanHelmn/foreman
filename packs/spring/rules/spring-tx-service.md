---
id: spring-tx-service
title: Put @Transactional on the public service method that does the writes, called from outside the bean
impact: HIGH
impactDescription: "a failure halfway leaves half the rows written"
roles: [implementer, reviewer]
check: "rg -n '@Transactional' --type java --type kotlin"
tags: transactions, spring
---
A service method that writes more than once must run in one transaction. Spring applies `@Transactional` through a proxy, so it has no effect on `private` methods or on a call from another method of the same class (`this.save()`). Put it on the public service method the controller calls, not on the controller or repository. Use `@Transactional(readOnly = true)` for read-only service methods.

**Incorrect (self-invocation; no transaction is opened):**

```java
public void checkout(Cart cart) { placeOrder(cart); }

@Transactional
void placeOrder(Cart cart) { orders.save(...); stock.decrement(...); }
```

**Correct:**

```java
@Transactional
public void checkout(Cart cart) { orders.save(...); stock.decrement(...); }
```

Reference: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
