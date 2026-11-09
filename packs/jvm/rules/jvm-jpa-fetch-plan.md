---
id: jvm-jpa-fetch-plan
title: Fetch JPA associations a list needs with JOIN FETCH or @EntityGraph
impact: HIGH
impactDescription: "one extra query per row when a lazy association is touched in a loop or serialiser"
roles: [implementer, reviewer]
tags: jpa, hibernate, n+1
---
Lazy `@OneToMany`/`@ManyToOne` associations load one query per entity when a loop, mapper or JSON serialiser touches them. Fetch them in the query that loads the list. Do not switch the mapping to `FetchType.EAGER`: that loads it on every query, including those that don't need it.

**Incorrect:**

```java
List<Order> orders = orderRepository.findByStatus(status);
return orders.stream().map(o -> new OrderDto(o.getId(), o.getCustomer().getName())).toList();
```

**Correct:**

```java
@EntityGraph(attributePaths = "customer")
List<Order> findByStatus(Status status);
```

```java
@Query("select o from Order o join fetch o.customer where o.status = :status")
```

Reference: https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#fetching
