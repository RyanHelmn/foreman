#!/usr/bin/env bash
# foreman SessionStart briefing: project rules (always) and ~10 lines of memory context when the project has been mapped.
# Silent when .foreman/ is absent. Fails open.
set -u
INPUT="$(cat 2>/dev/null || true)"
CWD="$(printf '%s' "$INPUT" | sed -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
[ -z "$CWD" ] && CWD="$(pwd)"
[ -d "$CWD/.foreman" ] || exit 0
if [ -s "$CWD/.foreman/rules.md" ]; then
  printf 'Project rules (.foreman/rules.md). Follow them in this session and pass them to any subagent you start:\n'
  cat "$CWD/.foreman/rules.md"
  printf '\n'
fi
grep -qs '"briefing"[[:space:]]*:[[:space:]]*false' "$CWD/.foreman/config.json" && exit 0
command -v node >/dev/null 2>&1 || exit 0
SCRIPT="$(cd "$(dirname "$0")/../.." && pwd)/scripts/memory.mjs"
OUT="$(node "$SCRIPT" briefing --root "$CWD" 2>/dev/null || true)"
if [ -n "$OUT" ]; then
  MAP=""; [ -f "$CWD/.foreman/project-map.md" ] && MAP=" Project map: .foreman/project-map.md (read it before planning work)."
  printf '%s\n%s\n' "$OUT" "  $MAP"
fi
exit 0
