---
id: web-loader-return-public
title: Return from loaders only the fields the page renders
impact: HIGH
impactDescription: "password hashes, tokens and internal fields are serialised into the page for anyone to read"
roles: [implementer, reviewer, security]
tags: security, remix, react-router, sveltekit, nuxt
---
Source: a database record. Sink: the loader's return value, which is serialised into the HTML and the client-side data request (SvelteKit universal and server `load`, Remix/React Router loaders, Nuxt `useFetch` responses from `server/api`). Select or map fields on the server before returning; hiding a field in the component does not remove it from the payload.

**Incorrect:**

```ts
export async function loader({ params }: LoaderFunctionArgs) {
  return { author: await db.user.findUnique({ where: { id: params.id } }) }
}
```

**Correct:**

```ts
export async function loader({ params }: LoaderFunctionArgs) {
  return { author: await db.user.findUnique({ where: { id: params.id }, select: { name: true, bio: true } }) }
}
```
