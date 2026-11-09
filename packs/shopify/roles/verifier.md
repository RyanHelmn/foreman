# shopify · verifier
Applies when: a Shopify app package, `shopify.app.toml`, or a theme (`layout/theme.liquid`) is present

## Commands
- Themes: `shopify theme check` (full) or `shopify theme check <path>` on changed files.
- Webhook changes: run the route's fixture test that signs a recorded payload with a test secret (base64 HMAC-SHA256 of the raw body) and also sends one with a bad signature, which must get 401.

## Obstacles to report
- Tests that mock `authenticate.webhook` or `authenticate.admin` pass whether or not verification happens; only a signed-fixture or bad-signature test proves it.
- Anything needing a real dev store (`shopify app dev`) is INCONCLUSIVE in CI, not FAILED.
