---
id: expo-deeplink-validate
title: Validate deep-link params and never perform a sensitive action on open
impact: HIGH
impactDescription: "a link in an email or web page makes a signed-in user pay, delete or change settings without a tap"
roles: [implementer, reviewer, security]
tags: expo, deeplink, router
---
Source: route params from a custom scheme or universal/app link (`useLocalSearchParams`, `Linking.getInitialURL`). Sink: a mutating API call or navigation into an authenticated flow. Any app or web page can open the link. Parse params with a schema, then show a screen the user confirms; never mutate in a mount effect. A `redirect` param navigates only to in-app paths.

**Incorrect (`app/pay.tsx`):**

```tsx
const { to, amount } = useLocalSearchParams()
useEffect(() => { api.transfer(to as string, Number(amount)) }, [])
```

**Correct:**

```tsx
const parsed = TransferParams.safeParse(useLocalSearchParams())
if (!parsed.success) return <Redirect href="/" />
return <ConfirmTransfer {...parsed.data} onConfirm={api.transfer} />
```

Reference: https://docs.expo.dev/linking/overview/
