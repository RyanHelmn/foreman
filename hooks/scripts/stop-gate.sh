#!/usr/bin/env bash
# foreman Stop gate.
# Reads the Stop hook payload on stdin and <cwd>/.foreman/run.json. While a feature run is active
# with gates pending, it blocks the stop (bounded by gates.maxBlocks, default 3) so the lead finishes
# verify -> review -> security instead of declaring done early.
# Stale-run protection: a run is only enforced in the session that owns it (stamped on first stop) and
# only within gates.staleHours (default 6). Other sessions get a one-line note instead of a block.
# Zero tokens; fails open on any error. Requires node (as does the rest of foreman).
set -u
INPUT="$(cat 2>/dev/null || true)"
command -v node >/dev/null 2>&1 || exit 0
export FOREMAN_HOOK_INPUT="$INPUT"
exec node --no-warnings "$(cd "$(dirname "$0")" && pwd)/stop-gate.mjs"
