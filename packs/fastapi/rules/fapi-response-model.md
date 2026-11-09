---
id: fapi-response-model
title: Declare a response model on every endpoint that returns a DB object
impact: HIGH
impactDescription: "password hashes, tokens and internal fields are serialised to the client"
roles: [implementer, reviewer, security]
tags: fastapi, serialisation
---
Source: an ORM row or an internal schema such as `UserInDB`. Sink: the JSON response. FastAPI filters output only through `response_model` (or the return annotation). Without it, every attribute of the returned object goes out, including fields added to the table later. Use an output schema with `model_config = ConfigDict(from_attributes=True)` listing only public fields.

**Incorrect:**

```python
@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    return UserInDB.model_validate(db.get(User, user_id))  # includes hashed_password
```

**Correct:**

```python
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr

@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return db.get(User, user_id)
```

Reference: https://fastapi.tiangolo.com/tutorial/response-model/
