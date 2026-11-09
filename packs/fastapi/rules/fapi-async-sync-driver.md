---
id: fapi-async-sync-driver
title: Use def, not async def, for endpoints that call a sync driver or client
impact: HIGH
impactDescription: "every request queues behind one blocking query; throughput drops to one at a time"
roles: [implementer, reviewer]
tags: fastapi, async
---
FastAPI runs `def` endpoints and dependencies in a threadpool and `async def` ones on the event loop. An `async def` endpoint that calls a sync SQLAlchemy `Session`, `requests`, `boto3` or `time.sleep` blocks the loop for all requests. Either keep the endpoint `def`, or use async drivers end to end (`AsyncSession`, `httpx.AsyncClient`) and `await` them.

**Incorrect:**

```python
@router.get("/orders")
async def list_orders(db: Session = Depends(get_db)):
    return db.scalars(select(Order).limit(50)).all()
```

**Correct:**

```python
@router.get("/orders")
def list_orders(db: Session = Depends(get_db)):
    return db.scalars(select(Order).limit(50)).all()
```

Reference: https://fastapi.tiangolo.com/async/#path-operation-functions
