import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ScoreableGoal } from "./scoring-rules.js";
import { rankAllGoals } from "./scoring.js";

/** Fixed "today" so idle/due days mean the same every run. */
const NOW = new Date("2026-10-09T12:00:00.000Z");

/** Date n days before NOW (for lastTouchedAt). */
function daysAgo(n: number): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Date n days after NOW (for deadline). Negative = overdue. */
function daysFromNow(n: number): Date {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

/** Build one goal for a scenario. */
function goal(
  id: string,
  weight: number,
  opts: { deadline?: Date | null; idleDays?: number } = {},
): ScoreableGoal {
  return {
    id,
    weight,
    deadline: opts.deadline === undefined ? null : opts.deadline,
    lastTouchedAt: daysAgo(opts.idleDays ?? 0),
  };
}

describe("rankAllGoals — decision-model §5", () => {
  // Near deadline beats a heavy recent goal and a medium idle goal.
  it("#1 — due tomorrow beats important recent and medium neglect", () => {
    // A: weight 5, no due, touched yesterday
    const goalA = goal("A", 5, { idleDays: 1 });

    // B: weight 3, no due, idle 6 days
    const goalB = goal("B", 3, { idleDays: 6 });

    // C: weight 3, due tomorrow, idle 1 day
    const goalC = goal("C", 3, {
      deadline: daysFromNow(1),
      idleDays: 1,
    });

    const ranked = rankAllGoals([goalA, goalB, goalC], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#1 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "C");
  });

  // Soon deadline beats high importance + long neglect with no due date.
  it("#2 — due in 2d (low weight) beats no-due high weight + long idle", () => {
    // A: weight 2, due in 2 days, idle 1 day
    const goalA = goal("A", 2, { deadline: daysFromNow(2), idleDays: 1 });

    // B: weight 5, no due, idle 10 days
    const goalB = goal("B", 5, { idleDays: 10 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#2 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "A");
  });

  // Same urgency and neglect → the heavier goal wins.
  it("#3 — same due and idle → higher weight wins", () => {
    // A: weight 5, due in 14 days, idle 3 days
    const goalA = goal("A", 5, { deadline: daysFromNow(14), idleDays: 3 });

    // B: weight 2, due in 14 days, idle 3 days
    const goalB = goal("B", 2, { deadline: daysFromNow(14), idleDays: 3 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#3 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "A");
  });

  // Same weight, no deadlines → the colder (more idle) goal wins.
  it("#4 — same weight, no due → more neglected wins", () => {
    // A: weight 4, no due, idle 2 days
    const goalA = goal("A", 4, { idleDays: 2 });

    // B: weight 4, no due, idle 12 days
    const goalB = goal("B", 4, { idleDays: 12 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#4 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "B");
  });

  // A far soft deadline still beats having no deadline at all.
  it("#5 — soft far deadline edges no deadline", () => {
    // A: weight 3, due in 21 days, idle 3 days
    const goalA = goal("A", 3, { deadline: daysFromNow(21), idleDays: 3 });

    // B: weight 3, no due, idle 3 days
    const goalB = goal("B", 3, { idleDays: 3 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#5 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "A");
  });

  // Sooner due date wins when weight and neglect match.
  it("#8 — due tomorrow beats due in 3 days (same weight/neglect)", () => {
    // A: weight 3, due tomorrow, idle 2 days
    const goalA = goal("A", 3, { deadline: daysFromNow(1), idleDays: 2 });

    // B: weight 3, due in 3 days, idle 2 days
    const goalB = goal("B", 3, { deadline: daysFromNow(3), idleDays: 2 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#8 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "A");
  });

  // Due tomorrow ranks above overdue when other signals match.
  it("#9 — due tomorrow beats overdue (same weight/neglect)", () => {
    // A: weight 3, overdue 2 days, idle 2 days
    const goalA = goal("A", 3, { deadline: daysFromNow(-2), idleDays: 2 });

    // B: weight 3, due tomorrow, idle 2 days
    const goalB = goal("B", 3, { deadline: daysFromNow(1), idleDays: 2 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const orderIds = ranked.map((g) => g.goalId);
    const order = orderIds.join(" → ");

    console.log(`#9 order: ${order}`);
    // Doc: B then A
    assert.deepEqual(orderIds, ["B", "A"]);
  });

  // Touched today damps a heavy goal; a colder lighter goal can surface.
  it("#10 — idle cold goal beats high-weight touched today (no dues)", () => {
    // A: weight 5, no due, touched today
    const goalA = goal("A", 5, { idleDays: 0 });

    // B: weight 3, no due, idle 14 days
    const goalB = goal("B", 3, { idleDays: 14 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#10 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "B");
  });

  // Long idle lifts C over A/B; then higher weight puts A above B.
  it("#11 — neglect lifts C; then A over B on weight", () => {
    // A: weight 5, no due, idle 1 day
    const goalA = goal("A", 5, { idleDays: 1 });

    // B: weight 3, no due, idle 1 day
    const goalB = goal("B", 3, { idleDays: 1 });

    // C: weight 3, no due, idle 8 days
    const goalC = goal("C", 3, { idleDays: 8 });

    const ranked = rankAllGoals([goalA, goalB, goalC], NOW);
    const orderIds = ranked.map((g) => g.goalId);
    const order = orderIds.join(" → ");

    console.log(`#11 order: ${order}`);
    // Doc: C then A (then B)
    assert.deepEqual(orderIds, ["C", "A", "B"]);
  });

  // One active goal → that goal is the whole ranked list.
  it("#12 — single goal is the only ranked result", () => {
    // A: only active goal
    const goalA = goal("A", 4, { idleDays: 2 });

    const ranked = rankAllGoals([goalA], NOW);
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#12 order: ${order}`);
    assert.deepEqual(
      ranked.map((g) => g.goalId),
      ["A"],
    );
  });

  // Fully tied on score signals → stable order by lower id.
  it("#13 — identical signals → lower id wins", () => {
    // A and B: same weight, same deadline, same idle — only id differs
    const goalA = goal("A", 3, { deadline: daysFromNow(5), idleDays: 2 });
    const goalB = goal("B", 3, { deadline: daysFromNow(5), idleDays: 2 });

    const ranked = rankAllGoals([goalB, goalA], NOW); // B listed first on purpose
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#13 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "A");
  });

  // A nearer due date beats a distant due even with a bit more weight.
  it("#14 — due in 5d beats far due + slightly higher weight", () => {
    // A: weight 5, due in 30 days, idle 1 day
    const goalA = goal("A", 5, { deadline: daysFromNow(30), idleDays: 1 });

    // B: weight 4, due in 5 days, idle 1 day
    const goalB = goal("B", 4, { deadline: daysFromNow(5), idleDays: 1 });

    const ranked = rankAllGoals([goalA, goalB], NOW);
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#14 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "B");
  });

  // Equal on every signal → lower id wins the tie-break.
  it("#15 — fully equal → tie-break by id", () => {
    // A and B: weight 5, no due, touched today
    const goalA = goal("A", 5, { idleDays: 0 });
    const goalB = goal("B", 5, { idleDays: 0 });

    const ranked = rankAllGoals([goalB, goalA], NOW); // B listed first on purpose
    const winnerId = ranked[0]?.goalId;
    const order = ranked.map((g) => g.goalId).join(" → ");

    console.log(`#15 winner: ${winnerId} (order: ${order})`);
    assert.equal(winnerId, "A");
  });
});
