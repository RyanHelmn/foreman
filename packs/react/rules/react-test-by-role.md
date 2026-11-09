---
id: react-test-by-role
title: Query components by role and drive them with user-event
impact: HIGH
impactDescription: "tests pass on markup a screen reader or keyboard user cannot operate, and break on every class rename"
roles: [implementer, reviewer, verifier]
check: "rg -n '(querySelector|getByTestId|fireEvent\\.|toMatchSnapshot)' --glob '*.test.{ts,tsx}'"
tags: react, testing
---
With Testing Library, find elements the way users do: `getByRole` with an accessible name, then `getByLabelText`, `getByText`; `getByTestId` only when nothing accessible exists. Interact through `userEvent.setup()`, which fires the real event sequence (focus, keydown, input). Assert visible outcomes; a snapshot alone asserts nothing.

**Incorrect:**

```tsx
fireEvent.click(container.querySelector('.btn-primary')!)
expect(container).toMatchSnapshot()
```

**Correct:**

```tsx
const user = userEvent.setup()
render(<InviteForm />)
await user.type(screen.getByLabelText(/email/i), 'a@b.io')
await user.click(screen.getByRole('button', { name: /send invite/i }))
expect(await screen.findByRole('status')).toHaveTextContent(/invite sent/i)
```

Reference: https://testing-library.com/docs/queries/about#priority
