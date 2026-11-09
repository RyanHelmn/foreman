# stripe · implementer
Applies when: `stripe` is a dependency
Read order: stripe-webhook-construct-event, stripe-fulfil-on-webhook, stripe-server-prices, stripe-event-order, stripe-idempotency-key, stripe-key-mode

## Iron laws
- Amounts and prices are decided on the server. Thinking "the client already shows the total"? That is the bug.
- Fulfilment happens in the verified webhook only. Thinking "the success page is quicker"? Show status there; grant nothing.

## Output additions
- Webhook event types added or changed: list them, so the dashboard endpoint subscription can be updated.

## Obstacles to report
- A new event type needs enabling on the dashboard endpoint (or `stripe listen`) before it arrives.
- Next.js route handlers need `await req.text()`; any middleware that parses the body first breaks verification.
