---
id: node-graphql-limits
title: Cap GraphQL query depth and cost, and turn introspection off in production
impact: HIGH
impactDescription: "one nested query (user→posts→author→posts…) multiplies into millions of resolver calls"
roles: [implementer, reviewer, security]
tags: node, graphql
---
Add a depth limit and a complexity/cost limit to the server's validation rules (Apollo `validationRules`, Yoga/Envelop plugins such as GraphQL Armor), and disable introspection outside development. Resolvers check auth from `context` per field that exposes user data; a type reachable by nesting is reachable by every client.

**Incorrect:**

```ts
new ApolloServer({ schema, introspection: true })
```

**Correct:**

```ts
new ApolloServer({
  schema,
  introspection: config.NODE_ENV !== 'production',
  validationRules: [depthLimit(8)],
})
```
