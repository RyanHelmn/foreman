import type { AgentInfo, Register } from 'claude-code'

type Gate = 'verify' | 'review' | 'security'
type Unit = { title?: string; type?: string; files?: string[]; model?: string }
type Config = { models?: Record<string, string>; maxFixIterations?: number; context?: { compactAt?: number | false } }
type Run = {
  active?: boolean
  task?: string
  featureId?: number
  iteration?: number
  changedFiles?: string[]
  gates?: Partial<Record<Gate, string>>
  confidence?: { before?: number; after?: number; band?: string }
  plan?: { units?: Unit[] } | null
}
type Worker = Pick<AgentInfo, 'id' | 'type' | 'description' | 'status'>

const GATES: Gate[] = ['verify', 'review', 'security']
const PREFIX = 'foreman:'
const DONE_MS = 15000
const COMPACT_AT = 60
const ROLES: Record<string, string> = { scout: 'scout', implementer: 'implementer', verifier: 'verifier', reviewer: 'reviewer', 'security-auditor': 'security' }
const MODELS: Record<string, string> = { scout: 'haiku', implementer: 'sonnet', verifier: 'sonnet', reviewer: 'opus', security: 'opus' }
const ENDED = ['completed', 'failed', 'killed']

const gate = (v?: string) => (v === 'passed' ? '●' : v === 'failed' ? '✕' : v === 'running' ? '◐' : '○')
const mark = (s: string) => (s === 'completed' ? '●' : s === 'failed' || s === 'killed' ? '✕' : '◐')
const clean = (s?: string) => (s ?? '').replace(/[\x00-\x1f\x7f]/g, ' ')
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
    const { before, after } = r.confidence ?? {}
    const conf = after ?? before
    return [`⚒ #${r.featureId ?? '?'} ${cut(clean(r.task), 34)}`, rail.join(' '), `it ${r.iteration ?? 0}/${s.max}`]
      .concat(typeof conf === 'number' ? [`conf ${conf.toFixed(2)}${after !== undefined && before !== undefined && after < before ? ' ↓' : ''}`] : [])
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
    ? `foreman feature #${run.featureId ?? '?'} is mid-run: "${cut(clean(run.task), 120)}". Keep the approved plan (units, owned files, interfaces, done conditions), the user's decisions, gate states, iteration ${run.iteration ?? 0}, changed files, open blockers and the exact next step. The full state is in .foreman/run.json: re-read it after this compaction and carry on from its "next" field.`
    : cmd
      ? `/foreman:${cmd} is in progress. Keep what it has done, its findings so far, what is left, and the exact next step.`
      : undefined

export const matchUnit = (description: string, units: Unit[] = []) => {
  const d = description.trim().toLowerCase()
  const t = (u: Unit) => (u.title ?? '').trim().toLowerCase()
  if (!d) return undefined
  return (
    units.find(u => t(u) === d) ??
    units
      .filter(u => t(u) && (d.startsWith(t(u)) || t(u).startsWith(d)))
      .sort((a, b) => t(b).length - t(a).length)[0]
  )
}

export const recorder = (exec: (args: string[]) => Promise<unknown>, clock: () => number) => {
  const seen = new Map<string, number>()
  const ended = new Set<string>()
  const tokens = new Map<string, number>()
  let queue: Promise<unknown> = Promise.resolve()
  const send = (args: string[]) => (queue = queue.then(() => exec(args)).catch(() => {}))

  return {
    usage: (id: string, n: number) => void tokens.set(id, (tokens.get(id) ?? 0) + n),
    observe(run: Run, config: Config | null, agents: Worker[], skip: Set<string>) {
      for (const a of agents) {
        const role = a.type.startsWith(PREFIX) ? ROLES[a.type.slice(PREFIX.length)] : undefined
        if (!role || run.featureId == null || ended.has(a.id) || (skip.has(a.id) && !seen.has(a.id))) continue
        if (!seen.has(a.id)) {
          seen.set(a.id, clock())
          const unit = matchUnit(a.description, run.plan?.units)
          send(['dispatch', 'start', '--feature', String(run.featureId), '--iteration', String(run.iteration ?? 0), '--role', role,
            '--model', unit?.model ?? config?.models?.[role] ?? MODELS[role]!, '--agent', a.id,
            ...(unit ? ['--unit', unit.title!, '--type', unit.type ?? 'other'] : []),
            ...(unit?.files?.length ? ['--paths', unit.files.join(',')] : [])])
        }
        if (ENDED.includes(a.status)) {
          ended.add(a.id)
          const n = tokens.get(a.id)
          send(['dispatch', 'finish', '--agent', a.id, '--outcome', a.status, '--duration', String(Math.round((clock() - seen.get(a.id)!) / 1000)),
            ...(n ? ['--tokens', String(n)] : [])])
        }
      }
      return queue
    },
  }
}

export const register: Register = on => {
  let cmd: string | undefined
  let before = new Set<string>()
  let isTurnOpen = false
  let dir: string | undefined
  let run: Run | null = null
  let isCompacting = false
  let hasRunCommand = false
  let hint: string | undefined
  let rec: ReturnType<typeof recorder> | undefined
  let loadConfig: () => Promise<Config | null> = async () => null

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
    if (e.agentId) {
      const u = done.usage
      if (u) rec?.usage(e.agentId, u.input_tokens + u.cache_creation_input_tokens + u.output_tokens)
      return done
    }
    isTurnOpen = false
    if (!dir) return done

    if (!(await $.fs.stat(dir).then(s => s.kind === 'dir').catch(() => false))) return done
    const at = (await loadConfig())?.context?.compactAt ?? COMPACT_AT
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
    const cwd = await $.session.cwd()
    dir = `${cwd}/.foreman`
    const json = (p: string) => $.fs.read(p).then(t => JSON.parse(t)).catch(() => null)
    const has = (p: string) => $.fs.stat(p).then(() => true).catch(() => false)
    const home = await $.env.get('HOME').catch(() => undefined)
    loadConfig = async () => {
      const [user, project] = await Promise.all([home ? json(`${home}/.claude/foreman.json`) : null, json(`${dir}/config.json`)])
      if (!user && !project) return null
      return { ...user, ...project, context: { ...user?.context, ...project?.context }, models: { ...user?.models, ...project?.models } }
    }
    const cli = (await has(`${$.plugin.root}/scripts/memory.mjs`)) ? `${$.plugin.root}/scripts/memory.mjs` : `${$.plugin.root}/../scripts/memory.mjs`
    rec = recorder(
      args => $.process.run(['node', '--no-warnings', cli, '--root', cwd, ...args]).then(r => {
        if (r.exitCode) throw new Error(r.stderr)
      }),
      () => Date.now(),
    )

    let seen = -1
    let max = 3
    let gates: Run['gates'] | null = null
    let idleSince = 0
    let shown: string | undefined
    let busy = false
    let config: Config | null = null
    let slow = 0

    const tick = async () => {
      if (busy) return
      // agent.list() every second only while a foreman command or run is live; otherwise just watch run.json every 3 s
      if (!cmd && !run?.active && ++slow % 3) return
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
          if (run?.active) {
            config = await loadConfig()
            max = config?.maxFixIterations ?? 3
          }
        }

        if (!cmd && !run?.active) {
          if (hint !== shown) $.ui.status((shown = hint))
          return
        }

        const agents = await $.agent.list()
        if (run?.active) void rec!.observe(run, config, agents, before)
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
