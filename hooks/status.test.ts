import { expect, test } from 'claude-code/testing'

import { keep, line } from './status'

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

test('a feature run shows its confidence score once computed', () => {
  const run = { active: true, task: 'billing webhooks', featureId: 3, iteration: 0, confidence: { score: 0.7 } }
  expect(line({ run, max: 3, workers: [], isIdle: true })).toBe(
    '⚒ #3 billing webhooks · build ○ verify ○ review ○ security ○ · it 0/3 · conf 0.70',
  )
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
