# mongodb · implementer
Applies when: `mongodb`, `mongoose`, `pymongo` or `motor` is a dependency
Read order: mongo-operator-injection, mongo-transaction-multi-doc, mongo-index-per-query, mongo-bounded-in, mongo-schema-validation

## Iron laws
- No request field reaches a filter until it is parsed to a primitive. Thinking "it's just an email string"? A JSON body can make it an object. That is the bug.

## Obstacles to report
- Transactions need a replica set; a standalone local or test server throws. Tests need a replica set (`MongoMemoryReplSet` with mongodb-memory-server).
- Mongoose builds indexes on startup with `autoIndex`; production often turns it off, so a new index needs the project's migration or `syncIndexes` step.
