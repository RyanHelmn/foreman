---
id: fapi-model-input-separate
title: Request bodies use Create/Update models without server-owned fields, extra="forbid"
impact: HIGH
impactDescription: "a client sets `owner_id`, `role` or `is_paid` by adding it to the JSON"
roles: [implementer, reviewer, security]
tags: fastapi, pydantic, mass-assignment
---
Source: the request body. Sink: `Model(**body.model_dump())` into the ORM. Reusing the full schema (or the ORM model) as the input type lets clients write every field. Give each write its own model listing only client-editable fields, reject unknown keys, set owner and status from the session in code, and use `model_dump(exclude_unset=True)` for partial updates.

**Incorrect:**

```python
@router.post("/projects")
def create(body: ProjectSchema, db: Session = Depends(get_db)):
    db.add(Project(**body.model_dump()))
```

**Correct:**

```python
class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=120)

@router.post("/projects")
def create(body: ProjectCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.add(Project(**body.model_dump(), owner_id=user.id))
```
