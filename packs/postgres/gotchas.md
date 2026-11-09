# postgres gotchas

- [gotcha] node-postgres returns numeric and bigint (int8) columns as strings; Number() or parseFloat on money reintroduces float error · paths: **/*.ts
- [gotcha] CREATE INDEX CONCURRENTLY cannot run inside a transaction block, and most migration tools wrap each migration in one · paths: **/migrations/**
- [gotcha] A failed CREATE INDEX CONCURRENTLY leaves an INVALID index that still costs writes; DROP INDEX CONCURRENTLY it and retry · paths: **/migrations/**
- [gotcha] An ALTER TABLE waiting for its lock queues every later query on that table behind it; SET lock_timeout = '5s' in migrations on busy tables · paths: **/migrations/**
- [gotcha] Adding a column with a volatile default such as gen_random_uuid() or clock_timestamp() rewrites the whole table; constant defaults are instant since PostgreSQL 11 · paths: **/migrations/**
- [gotcha] IVFFlat indexes built on an empty or small table choose poor list centres and recall drops; build them after loading data or use HNSW · paths: **/migrations/**
- [gotcha] Adding a foreign key or CHECK to a large table scans it under lock; add it NOT VALID, then VALIDATE CONSTRAINT in a separate statement · paths: **/migrations/**
