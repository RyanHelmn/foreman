---
id: web-progressive-form-actions
title: Submit mutations through the framework's form action, not an onClick fetch
impact: MEDIUM
impactDescription: "the form does nothing before hydration or without JS, and loaders don't revalidate after the save"
roles: [implementer, reviewer]
tags: forms, remix, react-router, sveltekit
---
Use `<Form method="post">` with an `action` (Remix, React Router) or `<form method="POST" use:enhance>` with form actions (SvelteKit). The form posts natively before hydration, the framework revalidates loader data afterwards, and pending state comes from `useNavigation`/`useFetcher` or `enhance`. Use `useFetcher` for mutations that shouldn't navigate. A hand-written `fetch` in a click handler loses all three.

**Incorrect:**

```tsx
<button onClick={async () => { await fetch('/api/todos', { method: 'POST', body: JSON.stringify({ title }) }); setTodos(…) }}>Add</button>
```

**Correct:**

```tsx
<Form method="post">
  <input name="title" required />
  <button type="submit">Add</button>
</Form>
```

Reference: https://reactrouter.com/start/framework/actions
