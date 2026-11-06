# Design principles (any language)

Composition and consistency rules that keep a codebase easy to change. They apply to functions, classes, modules, services and UI components alike. Stack skills (e.g. React composition patterns) refine these for one framework; where they disagree, the stack skill wins for that stack and the project's house patterns win over both.

## Consistency first

- **One way per concern.** Data access, error handling, validation, config, logging, API calls, forms, state, styling: each has one house pattern (see the project map). New code uses it. A second way is a finding even if it is "better", unless it replaces the first everywhere.
- **Match the neighbours.** Naming, file layout, export style and test style follow the closest existing code, not personal preference.

## Composition

- **Explicit variants over flag parameters.** `createDraft()` and `publish()`, not `save({ draft: true })`. A boolean that switches behaviour means two functions or two components share one body. One flag that only toggles a detail is fine; two or more that combine into modes is the smell.
- **Compose small parts over growing a config object.** When callers need different shapes, let them assemble parts (`children`, middleware, pipeline steps, strategy objects) instead of adding options to one big unit.
- **One owner per piece of state or implementation.** Only one module knows how something is stored or fetched; everyone else uses its interface. Swapping the implementation should touch that module only.
- **Depend on the interface, not the implementation.** Pass collaborators in (constructor, parameter, context, provider) when the caller or a test needs to substitute them; otherwise import directly.
- **Lift shared state to the nearest common owner,** not higher and not duplicated in siblings.
- **Derive, don't copy.** Compute values from the source of truth instead of storing a second copy that must be kept in sync.

## Size and shape

- **Small, focused units.** One reason to change per function or module. A file mixing unrelated concerns, or a function that needs section comments to be read, should be split along those seams.
- **Shallow call paths.** No pass-through layers that only forward arguments. Delete a wrapper that adds nothing.
- **Abstract on the third copy, not the first.** Two similar blocks are fine. Three is when to extract, and only the part that is truly shared. Removing a premature abstraction is as valid as adding a missing one.

## Removal over addition

- Dead code, unused exports, unused dependencies, commented-out blocks, `_v2`/`_old` copies and stale config are deleted, not refactored.
- A cleanup that adds more lines than it removes needs a reason.
