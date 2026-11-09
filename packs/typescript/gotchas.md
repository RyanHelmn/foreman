# typescript gotchas

- [gotcha] Barrel files (index.ts re-exporting a folder) create circular imports; a value imported through the barrel is undefined at module load. Import from the file, not the barrel, inside the same package · paths: **/index.ts
- [gotcha] tsconfig `paths` aliases are a compile-time mapping only; plain `node` and `tsc` output do not rewrite them, so the build runs but the server fails with ERR_MODULE_NOT_FOUND · paths: **/tsconfig*.json
- [gotcha] With `"module": "nodenext"` and `"type": "module"`, relative imports need the `.js` extension in the .ts source · paths: **/tsconfig*.json
- [gotcha] Vitest and babel-jest strip types without checking them; green tests say nothing about type errors · paths: **/vitest.config.*
