---
id: next-server-component-default
title: Keep pages and layouts as Server Components and put "use client" on the interactive leaf
impact: MEDIUM
impactDescription: "the whole page and everything it imports ships to and hydrates in the browser"
roles: [implementer, reviewer]
check: "rg -l \"^['\\\"]use client['\\\"]\" --glob '**/{page,layout}.{tsx,jsx}'"
tags: nextjs, rsc, performance
---
`"use client"` marks a boundary: the file and every module it imports become client code. Fetch data in the Server Component and pass serialisable props to a small client component that holds the state or handler. Server Components can render client components and pass Server Components to them as `children`.

**Incorrect (a like button makes the whole page client-side, and data moves to an effect):**

```tsx
'use client'
export default function PostPage({ params }) {
  const [post, setPost] = useState(null)
  useEffect(() => { fetch(`/api/posts/${params.id}`).then((r) => r.json()).then(setPost) }, [params.id])
  …
}
```

**Correct:**

```tsx
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const post = await getPost((await params).id)
  return <article>{post.body}<LikeButton postId={post.id} /></article>
}
```
