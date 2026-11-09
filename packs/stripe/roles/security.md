# stripe · security
Applies when: `stripe` is a dependency
Read order: stripe-webhook-construct-event, stripe-fulfil-on-webhook, stripe-server-prices, stripe-key-mode

## Also trace (no rule file yet)
- Customer portal and Checkout sessions created with a `customer` id from the request instead of the session user's stored id.
- `metadata` values read back in webhooks and trusted as user or order ids without matching them to your own records.
- Secret or restricted keys reaching the client: only `pk_` keys belong in `NEXT_PUBLIC_*` or browser code.
