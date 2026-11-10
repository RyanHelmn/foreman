# foreman visual language

Claude Code renders markdown in the terminal: **bold** is bright, `inline code` is tinted, fenced blocks are monospace with a subtle background, bullets get a dot, and long runs of `─` or `=` turn into ugly rules. Design for that renderer:

- **No horizontal rules, no box-drawing lines.** Structure comes from bold labels and whitespace.
- Phase names are bold lines, not headings (headings render large and shout).
- The gate rail is one line of inline code so it reads as a status strip.
- Fenced blocks only where column alignment matters: the roster and the close block. Keep them ≤ 64 columns and ≤ 8 lines.
- Never start a line with `─`, `-`, `*` or `+` unless you want a bullet.
- Sigils only; no other emoji.

## Sigils

`⚒` foreman · `◇` scout · `▣` implementer · `⚖` verifier · `◎` reviewer · `⛨` security · `▤` auditor
`●` done/passed · `◐` running · `○` pending · `✕` failed/blocked · `◌` skipped

## Header (first line of every command)

**⚒ foreman** · feature #12 · add rate limiting to login

Variants: `**⚒ foreman** · map · hobson`, `**⚒ foreman** · review · 5 areas`, `**⚒ foreman** · check · branch vs main`, `**⚒ foreman** · recall · "throttler"`.

## Phase line (when a phase starts)

**◇ gather**  ·  3 scouts

**? confirm**  ·  2 assumptions below medium confidence

**⚒ plan**  ·  2 units

**▣ build**  ·  2 implementers in worktrees

**⚖ verify**  ·  targeted

**◎ review**

**⛨ security**

**✎ remember**

One bold line, optionally a short `·` detail. Then the content of that phase in prose or a roster.

## Gate rail (end of any phase that changed it)

`build ● · verify ◐ · review ○ · security ○`  it 1/3 · 4 calls · conf 0.72

`conf` shows the after-plan score once Phase 2 has run, with `↓` when the plan lowered it (`conf 0.72 ↓`).

## Roster (plan and build; fenced block)

```
◇ auth-wiring      how is AuthGuard registered?        haiku   ●
▣ throttle-guard   apps/api/src/auth/throttle.guard.ts  sonnet  ◐
▣ throttle-config  apps/api/src/config/throttle.ts      sonnet  ○
```

Columns: sigil + name (17), scope (36, truncate with …), model (7), status.

## Verdict line (one per gate, prose)

⚖ **verify** ● PASSED (targeted) · 42 passed · flipped: login-lockout ✕→●

◎ **review** ● APPROVE · 0 blockers · 2 nits applied

⛨ **security** ● PASS_WITH_FINDINGS · 1 medium listed

Failures the same shape: ⚖ **verify** ✕ FAILED (targeted) · auth.e2e login-lockout · 1 fix dispatched

## Close block (end of feature / review / check; fenced block)

```
⚒ foreman · feature #12 · done
built    Throttler guard on /auth/login, 5/min per IP, tests added
files    5 changed · apps/api/src/auth/**, config/throttle.ts
gates    build ● verify ● review ● security ●   it 2/3 · 10 calls
lessons  1 stored · ThrottlerGuard must come after AuthGuard
cost     182k tok · £0.84 est (workers only) · report .foreman/reports/12.md
next     open PR · /foreman:check security · /foreman:recall throttler
```

## Backlog (review) — markdown table

| # | sev | area | eff | title |
|---|---|---|---|---|
| 7 | critical | security | s | Swagger UI exposed in production |
| 3 | high | performance | m | N+1 on /orders list |

## Confidence loop

Precede the AskUserQuestion with the `**? confirm**` phase line; after answers: **? confirm** · 0 open · 2 decisions stored.

## Briefing (printed by the SessionStart hook, plain text)

```
⚒ foreman · hobson
  in progress  #12 add rate limiting to login
  recent       #11 ● export CSV · #10 ● webhook retries
  backlog      3 open (1 critical/high) · lessons 14
  · gotcha     ThrottlerGuard must come after AuthGuard
  /foreman:feature · /foreman:review · /foreman:recall · /foreman:map
```

## Rules

- One header and one close block per command. Phase lines and rails at most once per phase.
- Prose between elements stays short; the elements carry the state.
- Colour belongs to the status line and the CLI, never to chat.
