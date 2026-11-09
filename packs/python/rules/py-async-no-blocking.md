---
id: py-async-no-blocking
title: No blocking calls inside async def; use the async client or asyncio.to_thread
impact: HIGH
impactDescription: "one slow call freezes the event loop and every other request on the worker"
roles: [implementer, reviewer]
tags: async, python
---
Inside `async def`, `requests`, `time.sleep`, `urllib`, sync DB drivers, file IO and CPU-heavy loops block the whole loop, not just this coroutine. Use the async equivalent (`httpx.AsyncClient`, `asyncio.sleep`, an async driver) or move the call off the loop with `await asyncio.to_thread(fn, ...)`. Ruff's `ASYNC` rules flag the common cases.

**Incorrect:**

```python
async def fetch_rate(code: str) -> Decimal:
    r = requests.get(f"{RATES_URL}/{code}", timeout=5)
    return Decimal(r.json()["rate"])
```

**Correct:**

```python
async def fetch_rate(client: httpx.AsyncClient, code: str) -> Decimal:
    r = await client.get(f"{RATES_URL}/{code}", timeout=5)
    return Decimal(r.json()["rate"])
```

Reference: https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code
