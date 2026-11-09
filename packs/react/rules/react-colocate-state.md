---
id: react-colocate-state
title: Keep state in the lowest component that uses it
impact: MEDIUM
impactDescription: "every keystroke re-renders the whole page, and unrelated components couple to the state"
roles: [implementer, reviewer]
tags: react, state
---
Put state next to the component that reads it; lift it only to the nearest common parent of the components that need it. Context or a global store is for state read across distant parts of the tree, not for one form's input values. Filters, tabs and pagination that should survive reload or be shareable belong in the URL.

**Incorrect (search text lives in the page, re-rendering the table and sidebar):**

```tsx
export function Page() {
  const [query, setQuery] = useState('')
  return <><Sidebar /><Search value={query} onChange={setQuery} /><Table /></>
}
```

**Correct:**

```tsx
export function Search() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```
