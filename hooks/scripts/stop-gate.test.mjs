import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "./stop-gate.mjs";

const run = (o = {}) => ({ active: true, task: "t", started: new Date().toISOString(), changedFiles: ["a.ts"], gates: { verify: "pending" }, blockCount: 0, ...o });
const sess = { session_id: "s1" };

test("no run or inactive run: nothing", () => {
  assert.equal(decide(sess, null, null), null);
  assert.equal(decide(sess, run({ active: false }), null), null);
});
test("no changed files: nothing to gate", () => {
  assert.equal(decide(sess, run({ changedFiles: [] }), null), null);
});
test("all gates passed: nothing", () => {
  assert.equal(decide(sess, run({ gates: { verify: "passed", review: "passed", security: "passed" } }), null), null);
});
test("pending gates block, count increments, session is stamped", () => {
  const r = decide(sess, run(), null);
  assert.equal(r.out.decision, "block");
  assert.match(r.out.reason, /verify, review, security/);
  assert.equal(r.write.blockCount, 1);
  assert.equal(r.write.sessionId, "s1");
});
test("block limit allows the stop with a note", () => {
  const r = decide(sess, run({ blockCount: 3 }), { gates: { maxBlocks: 3 } });
  assert.equal(r.out.decision, undefined);
  assert.match(r.out.systemMessage, /block limit/);
});
test("enforce=false reminds instead of blocking", () => {
  const r = decide(sess, run(), { gates: { enforce: false } });
  assert.equal(r.out.decision, undefined);
  assert.match(r.out.systemMessage, /^Reminder/);
});
test("another session's run is not enforced", () => {
  const r = decide({ session_id: "s2" }, run({ sessionId: "s1" }), null);
  assert.equal(r.write, null);
  assert.match(r.out.systemMessage, /another session/);
});
test("a run older than staleHours is not enforced", () => {
  const old = new Date(Date.now() - 7 * 36e5).toISOString();
  const r = decide(sess, run({ started: old }), null);
  assert.equal(r.write, null);
  assert.match(r.out.systemMessage, /7h ago/);
  const r2 = decide(sess, run({ started: old }), { gates: { staleHours: 24 } });
  assert.equal(r2.out.decision, "block");
});
