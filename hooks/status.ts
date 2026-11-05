import type { AgentInfo, Register } from 'claude-code'

type Gate = 'verify' | 'review' | 'security'
type Run = {
  active?: boolean
  task?: string
  featureId?: number
  iteration?: number
  changedFiles?: string[]
  gates?: Partial<Record<Gate, string>>
}
type Worker = Pick<AgentInfo, 'id' | 'type' | 'description' | 'status'>

const GATES: Gate[] = ['verify', 'review', 'security']
const PREFIX = 'foreman:'
const DONE_MS = 15000

const gate = (v?: string) => (v === 'passed' ? '●' : v === 'failed' ? '✕' : v === 'running' ? '◐' : '○')
const mark = (s: string) => (s === 'completed' ? '●' : s === 'failed' || s === 'killed' ? '✕' : '◐')
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export const line = (s: {
  run: Run | null
  max: number
  cmd?: string
  workers: Worker[]
  isIdle: boolean
}): string | undefined => {
  const running = s.workers.filter(w => mark(w.status) === '◐').length

  if (s.run?.active) {
    const r = s.run
    const rail = [`build ${r.changedFiles?.length ? '●' : '○'}`, ...GATES.map(g => `${g} ${gate(r.gates?.[g])}`)]
    return [`⚒ #${r.featureId ?? '?'} ${cut(r.task ?? '', 34)}`, rail.join(' '), `it ${r.iteration ?? 0}/${s.max}`]
      .concat(running ? [`${running} running`] : [])
      .join(' · ')
  }

  if (!s.cmd && !s.workers.length) return undefined
  const head = `⚒ ${s.cmd ?? 'foreman'}`
  if (s.isIdle) return s.workers.length ? `${head} done · ${s.workers.length} worker${s.workers.length === 1 ? "" : "s"}` : `${head} done`
  if (!s.workers.length) return `${head} · working`

  const shown = s.workers.slice(-4).map(w => `${w.type.slice(PREFIX.length)} ${mark(w.status)} ${cut(w.description, 24)}`)
  if (s.workers.length > 4) shown.push(`+${s.workers.length - 4}`)
  return [head, ...shown].join(' · ')
}

export const register: Register = on => {
  let cmd: string | undefined
  let before = new Set<string>()
  let isTurnOpen = false

  on('skill.prompt', async ($, e, next) => {
    if (e.skill.startsWith(PREFIX)) {
      cmd = e.skill.slice(PREFIX.length)
      before = new Set((await $.agent.list()).map(a => a.id))
    }
    return next(e)
  })

  on('turn.start', ($, e, next) => {
    if (!e.agentId) isTurnOpen = true
    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    if (!e.agentId) isTurnOpen = false
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    const dir = `${await $.session.cwd()}/.foreman`
    const json = (p: string) => $.fs.read(p).then(t => JSON.parse(t)).catch(() => null)

    let seen = -1
    let run: Run | null = null
    let max = 3
    let gates: Run['gates'] | null = null
    let idleSince = 0
    let shown: string | undefined
    let busy = false

    const tick = async () => {
      if (busy) return
      busy = true
      try {
        const m = await $.fs.stat(`${dir}/run.json`).then(s => s.mtimeMs).catch(() => 0)
        if (m !== seen) {
          seen = m
          run = m ? await json(`${dir}/run.json`) : null
          if (run && gates) {
            for (const g of GATES) {
              const v = run.gates?.[g]
              if (v !== gates[g] && (v === 'passed' || v === 'failed')) $.ui.toast(`⚒ ${g} ${v}`)
            }
          }
          gates = run ? { ...run.gates } : null
          if (run?.active) max = (await json(`${dir}/config.json`))?.maxFixIterations ?? 3
        }

        const agents = await $.agent.list()
        const workers = agents.filter(a => a.type.startsWith(PREFIX) && !before.has(a.id))
        const isIdle = !isTurnOpen && !workers.some(w => mark(w.status) === '◐')

        if (!isIdle) idleSince = 0
        else if (!idleSince) idleSince = Date.now()
        else if (Date.now() - idleSince > DONE_MS && (cmd || workers.length)) {
          cmd = undefined
          before = new Set(agents.map(a => a.id))
        }

        const text = line({ run, max, cmd, workers: workers.filter(w => !before.has(w.id)), isIdle })
        if (text !== shown) {
          shown = text
          $.ui.status(text)
        }
      } finally {
        busy = false
      }
    }

    await tick()
    $.clock.every(1000, () => void tick())

    return next(e)
  })
}
