# stripe · verifier
Applies when: `stripe` is a dependency

## Commands
- Webhook tests sign fixtures with `stripe.webhooks.generateTestHeaderString({ payload, secret })` and include one bad-signature case that must fail.
- Local end-to-end, when the brief asks: `stripe listen --forward-to localhost:3000/<webhook path>` and `stripe trigger checkout.session.completed`.

## Obstacles to report
- Tests that mock `constructEvent` pass whether or not the handler verifies; only a signed-fixture test proves it.
- `stripe listen` prints its own `whsec_` secret, different from the dashboard endpoint's; a mismatch looks like a signature bug.
