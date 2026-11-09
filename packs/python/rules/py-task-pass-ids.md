---
id: py-task-pass-ids
title: Send ids to Celery/RQ/Dramatiq tasks, not objects, and bound retries
impact: HIGH
impactDescription: "workers act on stale or oversized snapshots, and a poison message retries forever"
roles: [implementer, reviewer]
tags: tasks, python
---
A task argument is serialised when enqueued and read later, maybe after the row changed. Pass primary keys and reload inside the task; keep payloads small. Set an explicit retry ceiling with backoff, and make the task safe to run twice (it will be, on retry or redelivery).

**Incorrect:**

```python
@app.task(autoretry_for=(Exception,), max_retries=None)
def send_receipt(order):
    mailer.send(order.email, render_receipt(order))

send_receipt.delay(order)
```

**Correct:**

```python
@app.task(autoretry_for=(SMTPException,), retry_backoff=True, max_retries=5)
def send_receipt(order_id: int):
    order = Order.objects.get(pk=order_id)
    if order.receipt_sent_at:
        return
    mailer.send(order.email, render_receipt(order))

send_receipt.delay(order.id)
```

Reference: https://docs.celeryq.dev/en/stable/userguide/tasks.html#automatic-retry-for-known-exceptions
