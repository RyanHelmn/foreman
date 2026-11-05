# foreman visual language

Every foreman command renders its user-facing messages with this language so a foreman session is recognisable at a glance. Use it in **fenced code blocks** (``` with no language) so monospace alignment holds in Claude Code and in the desktop app. Keep prose between blocks short.

## Sigils

| Sigil | Meaning |
|---|---|
| `⚒` | foreman (lead) |
| `◇` | scout |
| `▣` | implementer |
| `⚖` | verifier |
| `◎` | reviewer |
| `⛨` | security-auditor |
| `▤` | auditor (project review) |
| `●` done / passed · `◐` running / in progress · `○` pending · `✕` failed / blocked · `◌` skipped |

## Header (start of every command)

```
⚒ foreman · feature #12 · add rate limiting to login
───────────────────────────────────────────────────────────
```
Variants: `⚒ foreman · map · <project>`, `⚒ foreman · review · 5 areas`, `⚒ foreman · check · branch vs main`, `⚒ foreman · recall · "<query>"`.

## Gate rail (after every phase that changes it)

```
build ● · verify ◐ · review ○ · security ○      it 1/3 · 4 calls
```
`calls` = worker calls so far. Always one line.

## Phase banner (when a phase starts)

```
── ◇ gather ──────────────────────────────────────────────
```
Phases: `◇ gather`, `? confirm`, `⚒ plan`, `▣ build`, `⚖ verify`, `◎ review`, `⛨ security`, `✎ remember`.

## Roster (plan and build phases)

```
▣ auth-guard        apps/api/src/auth/throttle.guard.ts      sonnet   ◐
▣ throttle-config   apps/api/src/config/throttle.ts          sonnet   ●
◇ coverage-scan     tests touching auth/**                    haiku    ●
```
Columns: sigil + unit name (18), paths or question (40, truncate with …), model (8), status.

## Confidence loop

Precede the AskUserQuestion call with:
```
? confirm · 2 assumptions below medium confidence
```
and after answers:
```
? confirm · 0 open · 2 decisions stored
```

## Verdict lines (one per gate when it completes)

```
⚖ verify    ● PASSED (targeted) · 42 passed · flipped: auth.e2e login-lockout ✕→●
◎ review    ● APPROVE · 0 blockers · 2 nits applied
⛨ security  ● PASS_WITH_FINDINGS · 1 medium listed
```

## Close block (end of feature / review / check)

```
⚒ foreman · feature #12 · done
───────────────────────────────────────────────────────────
built     Throttler guard on /auth/login, 5/min per IP, tests added
files     4 changed · apps/api/src/auth/**, apps/api/test/auth.e2e.ts
gates     build ● · verify ● · review ● · security ●      it 2/3 · 9 calls
lessons   1 stored · "ThrottlerGuard must come after AuthGuard"
next      open PR  ·  /foreman:check security  ·  /foreman:recall throttler
```

## Backlog table (review)

```
#   sev       area          effort  title
──  ────────  ────────────  ──────  ──────────────────────────────────────
7   critical  security      s       Swagger UI exposed in production
3   high      performance   m       N+1 on /orders list (OrderItem.product)
```

## Briefing (session start, printed by the hook)

```
⚒ foreman · <project>
  in progress  #12 add rate limiting to login
  recent       #11 ● export CSV · #10 ● webhook retries
  backlog      3 open (1 critical/high) · lessons 14
  · gotcha     ThrottlerGuard must come after AuthGuard
  /foreman:feature · /foreman:review · /foreman:recall · /foreman:map
```

## Rules

- One header per command, one close block per command. Rails and banners are cheap; don't spam them more than once per phase.
- Never pad with emoji beyond the sigils. No colour codes in chat (they don't render); colour belongs to the status line and the CLI.
- Widths are guidance; never wrap a rail.
