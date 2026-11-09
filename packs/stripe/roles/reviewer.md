# stripe · reviewer
Applies when: `stripe` is a dependency
Read order: stripe-webhook-construct-event, stripe-fulfil-on-webhook, stripe-server-prices, stripe-event-order, stripe-idempotency-key, stripe-key-mode

## Blocker vs should-fix
- Blocker: a webhook route without `constructEvent`, a raised tolerance, fulfilment outside the webhook, or a client-supplied amount.
- Blocker: a webhook handler with no `event.id` dedupe on a path that grants money, credit or access.
- Should-fix: a create call without a stable idempotency key; state copied from `event.data.object` without a re-read.
