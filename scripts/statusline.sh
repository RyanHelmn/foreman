#!/usr/bin/env bash
# foreman status line for Claude Code.
# Reads the status-line JSON on stdin (model, workspace, context_window, cost) and the project's
# .foreman/run.json, and prints one coloured line:
#   ⚒ foreman │ #12 add rate limiting… │ build ● verify ◐ review ○ security ○ │ it 1/3 │ ctx 38% │ opus
# Outside a foreman run it prints a quiet line: ⚒ foreman │ main │ 3 open · 14 lessons │ ctx 12% │ opus
# Enable:  /foreman:config statusline   (or add to ~/.claude/settings.json:
#   "statusLine": { "type": "command", "command": "bash ~/.claude/foreman/statusline.sh" })
set -u
INPUT="$(cat 2>/dev/null || true)"
command -v node >/dev/null 2>&1 || { printf '⚒ foreman'; exit 0; }
export FOREMAN_SCRIPTS="$(cd "$(dirname "$0")" && pwd)"
printf '%s' "$INPUT" | node --no-warnings -e '
let raw=""; process.stdin.on("data",d=>raw+=d).on("end",()=>{
  const fs=require("fs"),path=require("path"),cp=require("child_process");
  let s={}; try{s=JSON.parse(raw||"{}")}catch{}
  const cwd=(s.workspace&&(s.workspace.current_dir||s.workspace.project_dir))||process.cwd();
  const c={r:"\x1b[0m",dim:"\x1b[2m",b:"\x1b[1m",am:"\x1b[38;5;214m",gr:"\x1b[38;5;114m",rd:"\x1b[38;5;203m",bl:"\x1b[38;5;75m",gy:"\x1b[38;5;245m",wh:"\x1b[97m"};
  const sep=` ${c.gy}│${c.r} `;
  const parts=[`${c.am}${c.b}⚒ foreman${c.r}`];
  const read=p=>{try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}};
  const run=read(path.join(cwd,".foreman","run.json"));
  let branch=""; try{branch=cp.execSync("git symbolic-ref --short HEAD",{cwd,stdio:["ignore","pipe","ignore"],timeout:500}).toString().trim()}catch{}
  const glyph=v=>v==="passed"?`${c.gr}●${c.r}`:v==="failed"?`${c.rd}✕${c.r}`:v==="running"?`${c.am}◐${c.r}`:`${c.gy}○${c.r}`;
  if(run&&run.active){
    const title=(run.task||"").length>34?(run.task||"").slice(0,33)+"…":(run.task||"");
    parts.push(`${c.wh}#${run.featureId||"?"} ${title}${c.r}`);
    const g=run.gates||{}; const built=(run.changedFiles||[]).length>0;
    const buildG=built?`${c.gr}●${c.r}`:(run.iteration>0?`${c.am}◐${c.r}`:`${c.gy}○${c.r}`);
    parts.push(`build ${buildG} verify ${glyph(g.verify)} review ${glyph(g.review)} security ${glyph(g.security)}`);
    const max=(read(path.join(cwd,".foreman","config.json"))||{}).maxFixIterations||3;
    parts.push(`${c.dim}it ${run.iteration||0}/${max}${c.r}`);
  } else {
    if(branch) parts.push(`${c.bl}${branch}${c.r}`);
    if(fs.existsSync(path.join(cwd,".foreman","memory.db"))){
      try{
        const mem=cp.execSync(`node --no-warnings "${path.join(process.env.FOREMAN_SCRIPTS,"memory.mjs")}" briefing --json --root "${cwd}"`,{stdio:["ignore","pipe","ignore"],timeout:800}).toString();
        const m=JSON.parse(mem); parts.push(`${c.dim}${m.open} open · ${m.lessons} lessons${c.r}`);
      }catch{}
    }
  }
  const cw=s.context_window||{}; const pct=cw.used_percentage!=null?Math.round(cw.used_percentage):null;
  if(pct!=null){const col=pct>80?c.rd:pct>60?c.am:c.gr; parts.push(`${col}ctx ${pct}%${c.r}`);}
  const model=(s.model&&(s.model.display_name||s.model.id))||""; if(model) parts.push(`${c.gy}${model.toLowerCase().replace(/^claude\s*/,"")}${c.r}`);
  process.stdout.write(parts.join(sep));
});'
exit 0
