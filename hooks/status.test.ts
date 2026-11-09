import { expect, test } from 'claude-code/testing'

import { keep, line, matchUnit, recorder } from './status'

const w = (type: string, status: string, description: string) =>
  ({ id: description, type: `foreman:${type}`, status, description }) as Parameters<typeof line>[0]['workers'][number]

test('a feature run shows the gate rail, iteration and running workers', () => {
  const run = {
    active: true,
    task: 'add rate limiting to the login endpoint please',
    featureId: 12,
    iteration: 1,
    changedFiles: ['a.ts'],
    gates: { verify: 'passed', review: 'running', security: 'failed' },
  }
  expect(line({ run, max: 3, workers: [w('implementer', 'running', 'x')], isIdle: false })).toBe(
    '⚒ #12 add rate limiting to the login en… · build ● verify ● review ◐ security ✕ · it 1/3 · 1 running',
  )
})

test('a feature run shows its confidence, with an arrow when the plan lowered it', () => {
  const run = (confidence: object) => ({ active: true, task: 'billing webhooks', featureId: 3, iteration: 0, confidence })
  const rail = '⚒ #3 billing webhooks · build ○ verify ○ review ○ security ○ · it 0/3 · '
  expect(line({ run: run({ before: 0.7 }), max: 3, workers: [], isIdle: true })).toBe(`${rail}conf 0.70`)
  expect(line({ run: run({ before: 0.7, after: 0.82 }), max: 3, workers: [], isIdle: true })).toBe(`${rail}conf 0.82`)
  expect(line({ run: run({ before: 0.8, after: 0.72 }), max: 3, workers: [], isIdle: true })).toBe(`${rail}conf 0.72 ↓`)
})

test('any foreman command shows its workers, last four', () => {
  const workers = [
    w('scout', 'completed', 'a'),
    w('scout', 'running', 'auth middleware'),
    w('scout', 'failed', 'test setup'),
    w('auditor', 'running', 'performance across the whole api'),
    w('auditor', 'pending', 'deps'),
  ]
  expect(line({ run: null, max: 3, cmd: 'map', workers, isIdle: false })).toBe(
    '⚒ map · scout ◐ auth middleware · scout ✕ test setup · auditor ◐ performance across the… · auditor ◐ deps · +1',
  )
})

test('a command before its workers, after it ends, and nothing at all', () => {
  expect(line({ run: null, max: 3, cmd: 'review', workers: [], isIdle: false })).toBe('⚒ review · working')
  expect(line({ run: null, max: 3, cmd: 'map', workers: [w('scout', 'completed', 'a')], isIdle: true })).toBe(
    '⚒ map done · 1 worker',
  )
  expect(line({ run: { active: false }, max: 3, workers: [], isIdle: true })).toBeUndefined()
})

test('compaction keeps a live run, a running command, or nothing', () => {
  expect(keep({ active: true, task: 'add rate limiting', featureId: 12, iteration: 2 })).toContain('re-read it after this compaction')
  expect(keep({ active: true, task: 'add rate limiting', featureId: 12, iteration: 2 })).toContain('iteration 2')
  expect(keep(null, 'review')).toBe('/foreman:review is in progress. Keep what it has done, its findings so far, what is left, and the exact next step.')
  expect(keep({ active: false }, undefined)).toBeUndefined()
})

const units = [
  { title: 'Rate limit guard', type: 'auth', files: ['src/auth/guard.ts'], model: 'opus' },
  { title: 'Docs for limits', type: 'docs', files: ['README.md'] },
]

test('unit matching: exact title, prefix either way, else none', () => {
  expect(matchUnit('rate limit guard ', units)?.type).toBe('auth')
  expect(matchUnit('Docs for limits and headers', units)?.type).toBe('docs')
  expect(matchUnit('Rate limit', units)?.type).toBe('auth')
  expect(matchUnit('verify iteration 1', units)).toBeUndefined()
  expect(matchUnit('', units)).toBeUndefined()
})

test('two fake agents become two dispatch rows with unit, type and model from the plan', async () => {
  const calls: string[][] = []
  let t = 0
  const rec = recorder(async args => void calls.push(args), () => t)
  const run = { active: true, featureId: 7, iteration: 0, plan: { units } }
  const config = { models: { implementer: 'sonnet', verifier: 'haiku' } }
  const a = { id: 'a1', type: 'foreman:implementer', description: 'Rate limit guard', status: 'running' as const }
  const b = { id: 'b1', type: 'foreman:implementer', description: 'Docs for limits', status: 'running' as const }
  const old = { id: 'z0', type: 'foreman:scout', description: 'old', status: 'running' as const }
  const other = { id: 'x1', type: 'Explore', description: 'x', status: 'running' as const }
  await rec.observe(run, config, [a, b, old, other], new Set(['z0']))
  t = 12_000
  rec.usage('a1', 1500)
  await rec.observe(run, config, [{ ...a, status: 'completed' }, { ...b, status: 'failed' }, old], new Set(['z0']))
  await rec.observe(run, config, [{ ...a, status: 'completed' }], new Set(['a1']))
  expect(calls).toEqual([
    ['dispatch', 'start', '--feature', '7', '--iteration', '0', '--role', 'implementer', '--model', 'opus', '--agent', 'a1', '--unit', 'Rate limit guard', '--type', 'auth', '--paths', 'src/auth/guard.ts'],
    ['dispatch', 'start', '--feature', '7', '--iteration', '0', '--role', 'implementer', '--model', 'sonnet', '--agent', 'b1', '--unit', 'Docs for limits', '--type', 'docs', '--paths', 'README.md'],
    ['dispatch', 'finish', '--agent', 'a1', '--outcome', 'completed', '--duration', '12', '--tokens', '1500'],
    ['dispatch', 'finish', '--agent', 'b1', '--outcome', 'failed', '--duration', '12'],
  ])
})

test('a role-only agent gets the configured model, and calls run one at a time in order', async () => {
  const log: string[] = []
  let open = 0
  const rec = recorder(async args => {
    open++
    if (open > 1) log.push('overlap')
    for (let i = 0; i < (args[1] === 'start' ? 5 : 1); i++) await Promise.resolve()
    log.push(`${args[1]} ${args[args.indexOf('--agent') + 1]}${args[1] === 'start' ? ` ${args[args.indexOf('--model') + 1]}` : ''}`)
    open--
    if (args[3] === 'boom') throw new Error('cli down')
  }, () => 0)
  const run = { active: true, featureId: 1, iteration: 2 }
  const v = (id: string, status: string) => ({ id, type: 'foreman:verifier', description: 'verify', status }) as Parameters<typeof line>[0]['workers'][number]
  await rec.observe({ ...run, featureId: 'boom' as unknown as number }, null, [v('v0', 'running')], new Set())
  await rec.observe(run, { models: { verifier: 'haiku' } }, [v('v1', 'completed'), v('v2', 'completed')], new Set())
  expect(log).toEqual(['start v0 sonnet', 'start v1 haiku', 'finish v1', 'start v2 haiku', 'finish v2'])
})
