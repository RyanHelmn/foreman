# mongodb · security
Applies when: `mongodb`, `mongoose`, `pymongo` or `motor` is a dependency
Read order: mongo-operator-injection, mongo-bounded-in

## Also trace (no rule file yet)
- `$where`, `$function`, `$accumulator` or `mapReduce` with request-derived strings: server-side JavaScript execution.
- Aggregation pipelines with stages or `$lookup` targets taken from the request.
- `$regex` from user input without escaping: ReDoS and match-everything filters.
