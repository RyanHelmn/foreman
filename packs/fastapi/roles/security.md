# fastapi · security
Applies when: fastapi is a dependency
Read order: fapi-auth-router-dependency, fapi-model-input-separate, fapi-response-model

## Also trace (no rule file yet)
- `/docs`, `/redoc`, `/openapi.json` public in production: set `docs_url=None, redoc_url=None, openapi_url=None` or put them behind auth.
- `CORSMiddleware(allow_origins=["*"], allow_credentials=True)`.
- Dependencies that read a token but don't fail closed (return `None` instead of raising 401) used as the auth dependency.
- `Query`/`Path` ids used in a lookup without the session user in the filter.
