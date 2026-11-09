---
id: react-memo-measured-only
title: Add memo, useMemo and useCallback only for a measured hot path
impact: LOW
impactDescription: "extra code and dependency arrays that go stale, for no render saved"
roles: [implementer, reviewer]
tags: react, performance
---
Memoisation pays only when the computation is slow or the memoised value is a prop of a `memo` component or a dependency of an effect. Wrapping every handler and cheap expression adds dependency arrays that drift and hide bugs. When the project uses the React Compiler (`babel-plugin-react-compiler`), add none by hand. A diff adding memoisation states what it measured.

**Incorrect:**

```tsx
const label = useMemo(() => `${count} items`, [count])
const onClick = useCallback(() => setOpen(true), [])
return <button onClick={onClick}>{label}</button>
```

**Correct:**

```tsx
return <button onClick={() => setOpen(true)}>{count} items</button>
```

Reference: https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere
