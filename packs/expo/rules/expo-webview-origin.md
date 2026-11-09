---
id: expo-webview-origin
title: Restrict WebView origins and check the origin of every onMessage
impact: HIGH
impactDescription: "any page the WebView reaches can call the native bridge with the user's session"
roles: [implementer, reviewer, security]
check: "rg -n 'originWhitelist=\{\[.\*.\]\}'"
tags: expo, webview
---
Source: content loaded in `react-native-webview`, including pages reached by links and redirects. Sink: `onMessage` handlers that act on the user's behalf, and `injectedJavaScript` that exposes tokens. Set `originWhitelist` to your origins, block other navigations in `onShouldStartLoadWithRequest`, check `nativeEvent.url` before acting on a message, and never inject tokens or script built from untrusted input.

**Incorrect:**

```tsx
<WebView source={{ uri }} originWhitelist={['*']}
  injectedJavaScript={`window.token='${token}'`}
  onMessage={(e) => handle(JSON.parse(e.nativeEvent.data))} />
```

**Correct:**

```tsx
<WebView source={{ uri: 'https://app.example.com/help' }} originWhitelist={['https://app.example.com']}
  onShouldStartLoadWithRequest={(r) => r.url.startsWith('https://app.example.com/')}
  onMessage={(e) => { if (new URL(e.nativeEvent.url).origin === 'https://app.example.com') handle(Msg.parse(JSON.parse(e.nativeEvent.data))) }} />
```

Reference: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md
