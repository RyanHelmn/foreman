---
id: search-versioned-index
title: Change mappings by building a new versioned index and swapping an alias
impact: MEDIUM
impactDescription: "an in-place mapping change fails or empties search in production until a manual reindex"
roles: [implementer, reviewer]
tags: search, migrations
---
The app reads and writes through an alias (or a configured index name). A mapping or settings change creates `name_vN+1`, backfills it, then swaps the alias (Elastic/OpenSearch aliases, Meilisearch `swapIndexes`, Typesense collection aliases). The reindex script lives in the repo next to the mapping.

**Incorrect:**

```ts
await es.indices.putMapping({ index: 'products', properties: { price: { type: 'scaled_float', scaling_factor: 100 } } })
```

**Correct:**

```ts
await es.indices.create({ index: 'products_v3', mappings: productsMappingV3 })
await es.reindex({ source: { index: 'products_v2' }, dest: { index: 'products_v3' } })
await es.indices.updateAliases({ actions: [{ remove: { index: 'products_v2', alias: 'products' } }, { add: { index: 'products_v3', alias: 'products' } }] })
```
