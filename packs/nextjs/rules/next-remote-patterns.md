---
id: next-remote-patterns
title: Restrict images.remotePatterns to exact hosts
impact: HIGH
impactDescription: "the image optimiser fetches and resizes any URL on the internet at the project's cost"
roles: [implementer, reviewer, security]
check: "rg -n \"hostname: ['\\\"]\\*\\*\" next.config.*"
tags: security, nextjs, images
---
Source: the `url` parameter of `/_next/image`, which anyone can set. Sink: the server-side fetch the optimiser makes. A wildcard host turns the deployment into an open image proxy (bandwidth, optimisation quota, fetches from your network). List each host, with protocol and a `pathname` prefix where the provider allows it. `images.domains` is deprecated; replace it rather than extend it.

**Incorrect:**

```ts
images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
```

**Correct:**

```ts
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com', pathname: '/uploads/**' }],
}
```

Reference: https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
