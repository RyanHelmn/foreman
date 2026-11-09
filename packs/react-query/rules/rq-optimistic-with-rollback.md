---
id: rq-optimistic-with-rollback
title: Pair every optimistic cache write with a rollback and a final refetch
impact: HIGH
impactDescription: "a failed save leaves the UI showing data the server rejected"
roles: [implementer, reviewer]
tags: react-query, mutations
---
An `onMutate` that writes to the cache must cancel in-flight queries for that key, snapshot the previous value and return it; `onError` restores it; `onSettled` invalidates the key. For UI-only optimism, rendering `mutation.variables` while `isPending` needs no cache write and no rollback. SWR: pass `optimisticData` with `rollbackOnError: true`.

**Incorrect:**

```ts
onMutate: (todo) => queryClient.setQueryData(todoKeys.all, (old: Todo[]) => [...old, todo]),
```

**Correct:**

```ts
onMutate: async (todo) => {
  await queryClient.cancelQueries({ queryKey: todoKeys.all })
  const previous = queryClient.getQueryData<Todo[]>(todoKeys.all)
  queryClient.setQueryData<Todo[]>(todoKeys.all, (old = []) => [...old, todo])
  return { previous }
},
onError: (_err, _todo, ctx) => queryClient.setQueryData(todoKeys.all, ctx?.previous),
onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
```

Reference: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
