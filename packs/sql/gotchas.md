# sql gotchas

- [gotcha] MySQL before 8.0.16 parses CHECK constraints and silently ignores them · paths: **/migrations/**
- [gotcha] MySQL DDL commits implicitly, so a multi-statement migration that fails halfway is left partly applied; keep one DDL change per migration · paths: **/migrations/**
- [gotcha] TypeORM synchronize: true treats a renamed entity property as drop plus add and deletes the column's data · paths: **/*.ts
- [gotcha] A composite index serves queries on its leading columns only; an index on (a, b) does nothing for WHERE b = ? · paths: **/migrations/**
