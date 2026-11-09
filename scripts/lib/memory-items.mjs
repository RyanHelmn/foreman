import { ftsQuery, ftsUpsert } from "./db.mjs";
import { exportMd } from "./export.mjs";
import { fail, list, norm, now, touches } from "./util.mjs";

export function lessonAdd(db, a) {
  if (!a.text) fail("--text required");
  const kind = a.kind ?? "gotcha", paths = list(a.paths).join(",");
  const r = db.prepare("INSERT INTO lessons (feature_id,kind,text,paths,created) VALUES (?,?,?,?,?)").run(a.feature ? Number(a.feature) : null, kind, a.text, paths, now());
  const id = Number(r.lastInsertRowid);
  ftsUpsert(db, "lesson", id, kind, a.text, paths.replace(/,/g, " "));
  return { id };
}
export const lessonList = (db, limit) => db.prepare("SELECT id,kind,text,paths,feature_id FROM lessons ORDER BY id DESC LIMIT ?").all(limit);

export function decisionAdd(db, a) {
  if (!a.text) fail("--text required");
  const r = db.prepare("INSERT INTO decisions (text,source,confirmed,area,created) VALUES (?,?,?,?,?)").run(a.text, a.source ?? "user", Number(a.confirmed ?? 1), a.area ?? "", now());
  const id = Number(r.lastInsertRowid);
  ftsUpsert(db, "decision", id, a.area ?? "", a.text, "");
  return { id };
}
export const decisionList = (db) => db.prepare("SELECT id,text,source,confirmed,area FROM decisions ORDER BY id").all();

export function backlogAdd(db, a) {
  if (!a.title || !a.area || !a.severity) fail("--title --area --severity required");
  const paths = list(a.paths).join(",");
  const r = db.prepare("INSERT INTO backlog (area,severity,title,plan,effort,paths,status,created,updated) VALUES (?,?,?,?,?,?,'open',?,?)").run(a.area, a.severity, a.title, a.plan ?? "", a.effort ?? "", paths, now(), now());
  const id = Number(r.lastInsertRowid);
  ftsUpsert(db, "backlog", id, a.title, [a.area, a.severity, a.plan].filter(Boolean).join(" "), paths.replace(/,/g, " "));
  return { id };
}

export function backlogList(db, status = "open") {
  const order = "CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, id";
  return status === "all" ? db.prepare(`SELECT * FROM backlog ORDER BY ${order}`).all() : db.prepare(`SELECT * FROM backlog WHERE status=? ORDER BY ${order}`).all(status);
}

export function backlogUpdate(db, dir, prices, id, a) {
  if (!id || !a.status) fail("backlog update <id> --status ...");
  db.prepare("UPDATE backlog SET status=?, feature_id=COALESCE(?, feature_id), updated=? WHERE id=?").run(a.status, a.feature ? Number(a.feature) : null, now(), id);
  exportMd(db, dir, prices);
  return { id, status: a.status };
}

export function recall(db, q, limit) {
  if (!q) fail("recall <query>");
  return db.prepare("SELECT kind, ref_id, title, snippet(fts, 3, '[', ']', '…', 64) AS snip, bm25(fts) AS rank FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT ?").all(ftsQuery(q), limit);
}

export function relevant(db, { paths = [], text = "", limit = 10 }) {
  const seen = new Set(), hits = [];
  const push = (kind, id, line) => { const k = kind + id; if (!seen.has(k)) { seen.add(k); hits.push({ kind, id, line }); } };
  const queries = paths.flatMap((p) => { const n = norm(p); return n.includes("/") ? [n, n.slice(0, n.lastIndexOf("/"))] : [n]; });
  for (const l of db.prepare("SELECT id,kind,text,paths FROM lessons WHERE paths != ''").all()) if (touches(l.paths, queries)) push("lesson", l.id, `[${l.kind}] ${l.text} (${l.paths})`);
  for (const b of db.prepare("SELECT id,severity,title,paths FROM backlog WHERE status='open' AND paths != ''").all()) if (touches(b.paths, queries)) push("backlog", b.id, `[${b.severity}] ${b.title} (${b.paths})`);
  if (text.trim())
    for (const r of db.prepare("SELECT kind, ref_id, title, body FROM fts WHERE fts MATCH ? AND kind IN ('lesson','decision','feature') ORDER BY bm25(fts) LIMIT ?").all(ftsQuery(text), limit))
      push(r.kind, r.ref_id, r.kind === "lesson" ? `[${r.title}] ${r.body}` : r.kind === "decision" ? r.body : `feature: ${r.title} — ${r.body.slice(0, 140)}`);
  for (const d of db.prepare("SELECT id,text FROM decisions WHERE confirmed=1 ORDER BY id DESC LIMIT 8").all()) push("decision", d.id, d.text);
  return hits.slice(0, limit + 8);
}
