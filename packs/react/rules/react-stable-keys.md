---
id: react-stable-keys
title: Key list items by a stable id, never by index or a random value
impact: HIGH
impactDescription: "after a delete or reorder, inputs and expanded state attach to the wrong row"
roles: [implementer, reviewer]
check: "rg -n 'key=\\{(i|idx|index|Math\\.random|crypto\\.randomUUID)' --glob '*.{tsx,jsx}'"
tags: react, lists
---
React matches children across renders by `key`. An index key moves state to whichever item lands at that position; a random key remounts every row on every render, losing focus and state. Use the record's id. Index is acceptable only for a static list that is never reordered, filtered or edited.

**Incorrect:**

```tsx
{todos.map((todo, i) => <TodoRow key={i} todo={todo} />)}
```

**Correct:**

```tsx
{todos.map((todo) => <TodoRow key={todo.id} todo={todo} />)}
```
