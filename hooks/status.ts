import type { AgentInfo, Register } from 'claude-code'

type Gate = 'verify' | 'review' | 'security'
type Run = {
  active?: boolean
  task?: string
  featureId?: number
  iteration?: number
  changedFiles?: string[]
  gates?: Partial<Record<Gate, string>>
  confidence?: { score?: number }
}
type Worker = Pick<AgentInfo, 'id' | 'type' | 'description' | 'status'>

const GATES: Gate[] = ['verify', 'review', 'security']
const PREFIX = 'foreman:'
const DONE_MS = 15000
const COMPACT_AT = 60

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
    const conf = r.confidence?.score
    return [`⚒ #${r.featureId ?? '?'} ${cut(r.task ?? '', 34)}`, rail.join(' '), `it ${r.iteration ?? 0}/${s.max}`]
      .concat(typeof conf === 'number' ? [`conf ${conf.toFixed(2)}`] : [])
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

export const keep = (run: Run | null, cmd?: string) =>
  run?.active
    ? `foreman feature #${run.featureId ?? '?'} is mid-run: "${run.task ?? ''}". Keep the approved plan (units, owned files, interfaces, done conditions), the user's decisions, gate states, iteration ${run.iteration ?? 0}, changed files, open blockers and the exact next step. The full state is in .foreman/run.json: re-read it after this compaction and carry on from its "next" field.`
    : cmd
      ? `/foreman:${cmd} is in progress. Keep what it has done, its findings so far, what is left, and the exact next step.`
      : undefined

export const register: Register = on => {
  let cmd: string | undefined
  let before = new Set<string>()
  let isTurnOpen = false
  let dir: string | undefined
  let run: Run | null = null
  let isCompacting = false
  let hasRunCommand = false
  let hint: string | undefined

  on('skill.prompt', async ($, e, next) => {
    if (e.skill.startsWith(PREFIX)) {
      cmd = e.skill.slice(PREFIX.length)
      hasRunCommand = true
      before = new Set((await $.agent.list()).map(a => a.id))
    }
    return next(e)
  })

  on('turn.start', ($, e, next) => {
    if (!e.agentId) {
      isTurnOpen = true
      hint = undefined
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId) return done
    isTurnOpen = false
    if (!dir) return done

    if (!(await $.fs.stat(dir).then(s => s.kind === 'dir').catch(() => false))) return done
    const config = await $.fs.read(`${dir}/config.json`).then(t => JSON.parse(t)).catch(() => null)
    const at = config?.context?.compactAt ?? COMPACT_AT
    const pct = (await $.session.usage()).context.percent ?? 0
    if (at === false || pct < at || isCompacting) return done

    if (!run?.active) {
      if (hasRunCommand) hint = `⚒ context ${pct}% · foreman's work is saved, /clear is safe`
      return done
    }

    isCompacting = true
    $.clock.after(1000, async () => {
      try {
        $.ui.toast(`⚒ context ${pct}% · compacting`)
        await $.session.compact({ instructions: keep(run, cmd) })
      } catch {
      } finally {
        isCompacting = false
      }
    })
    return done
  })

  on('session.compact', ($, e, next) => {
    const note = e.agentId ? undefined : keep(run, cmd)
    if (!note || e.instructions?.includes(note)) return next(e)
    return next({ ...e, instructions: e.instructions ? `${e.instructions}\n\n${note}` : note })
  }).catch(($, e, next) => next(e))

  on('session.start', async ($, e, next) => {
    dir = `${await $.session.cwd()}/.foreman`
    const json = (p: string) => $.fs.read(p).then(t => JSON.parse(t)).catch(() => null)

    let seen = -1
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

        const text = line({ run, max, cmd, workers: workers.filter(w => !before.has(w.id)), isIdle }) ?? hint
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
