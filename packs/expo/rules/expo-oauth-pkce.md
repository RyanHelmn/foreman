---
id: expo-oauth-pkce
title: Use the authorization code flow with PKCE and no client secret in the app
impact: HIGH
impactDescription: "an app registered for the same redirect scheme intercepts the token or code and signs in as the user"
roles: [implementer, reviewer, security]
check: "rg -n 'ResponseType\.Token|clientSecret|usePKCE: false'"
tags: expo, oauth, auth
---
Source: the OAuth redirect into the app's scheme, which another app can also claim. Sink: the token exchange. Use `expo-auth-session` with `ResponseType.Code` (PKCE and `state` are on by default; don't pass `usePKCE: false`), and exchange the code with the request's `codeVerifier`. Implicit flow (`ResponseType.Token`) puts the token in the redirect URL. A provider that requires a client secret is exchanged on your backend.

**Incorrect:**

```ts
const [request, response, prompt] = useAuthRequest(
  { clientId, redirectUri, scopes, responseType: ResponseType.Token }, discovery)
```

**Correct:**

```ts
const [request, response, prompt] = useAuthRequest({ clientId, redirectUri, scopes }, discovery)
// on response.type === 'success'
await exchangeCodeAsync(
  { clientId, redirectUri, code: response.params.code, extraParams: { code_verifier: request!.codeVerifier! } },
  discovery)
```

Reference: https://docs.expo.dev/guides/authentication/
