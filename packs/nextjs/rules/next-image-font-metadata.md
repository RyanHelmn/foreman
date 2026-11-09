---
id: next-image-font-metadata
title: Use next/image, next/font and the metadata API instead of raw tags
impact: LOW
impactDescription: "layout shift, unoptimised images and missing or duplicated meta tags"
roles: [implementer, reviewer]
check: "rg -n '<img |fonts.googleapis.com|<head>' app src --glob '*.tsx'"
tags: nextjs, performance, seo
---
Images go through `next/image` with `width`/`height`, or `fill` plus `sizes`; `priority` only on the above-the-fold image. Fonts load through `next/font`, which self-hosts them. Titles and descriptions come from `export const metadata` or `generateMetadata` in the segment, not a `<head>` in a component.

**Incorrect:**

```tsx
<head><title>{post.title}</title></head>
<img src={post.cover} />
```

**Correct:**

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  return { title: post.title }
}

<Image src={post.cover} alt={post.coverAlt} width={1200} height={630} />
```

Reference: https://nextjs.org/docs/app/getting-started/images
