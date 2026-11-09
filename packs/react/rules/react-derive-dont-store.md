---
id: react-derive-dont-store
title: Compute from props during render instead of syncing them into state with useEffect
impact: HIGH
impactDescription: "one render shows the stale value, and the copy silently stops following the prop"
roles: [implementer, reviewer]
tags: react, state
---
State is for values the component owns and changes. A value computable from props, other state or query data is computed in render (with `useMemo` only if measured slow). To reset state when an identity changes, pass a `key`; do not copy the prop in an effect.

**Incorrect:**

```tsx
const [fullName, setFullName] = useState('')
useEffect(() => setFullName(`${user.first} ${user.last}`), [user])
```

**Correct:**

```tsx
const fullName = `${user.first} ${user.last}`
```

```tsx
<ProfileForm key={user.id} user={user} />
```

Reference: https://react.dev/learn/you-might-not-need-an-effect
