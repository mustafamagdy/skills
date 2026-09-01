---
name: plan-sprint
description: "Close out the last sprint and commit the next: actual velocity, the ready frontier, a sprint goal, and items scheduled into the iteration."
disable-model-invocation: true
---

# Plan Sprint

Run at the boundary between two sprints. Two halves: **close** the one that ended, then **commit** the one that starts.

The close is not a formality and it is the half that gets skipped. It produces the actual velocity, which is the only input that makes the next commitment real, and the carry-over, which is the first claim on the next sprint's capacity. Planning a sprint without closing the last one is planning against a number somebody hoped for.

Read `docs/delivery/release-plan.md`, `docs/delivery/backlog-map.md` and the tracker doc first.

## Close the last sprint

Skip this only for the first sprint of an engagement.

### 1. Read the board, not the plan

`list` everything in the closing iteration with its state and points. What the plan said would happen is not evidence.

### 2. Compute what actually happened

- **Completed points**: Done only. A story at 90 percent counts zero. Partial credit is how a team's velocity drifts upward while its delivery does not.
- **Actual velocity**, and how it compares to what the release plan assumed.
- **Carry-over**: unfinished stories, each with why. The reason matters more than the count, and the reasons cluster: blocked by something outside the team, larger than estimated, or never started because the sprint was overcommitted. Three different problems, three different fixes.

### 3. Return the carry-over to the backlog

Unschedule unfinished stories. Re-estimate the ones that turned out larger than they looked, because their old estimate is now known to be wrong and carrying it forward carries the error forward.

A story that carried over twice is not a story that needs a third sprint. Send it back to `/groom-stories`.

### 4. Report

Committed against delivered, actual velocity against assumed, carry-over with reasons, and the effect on the milestone dates. Where velocity has now missed the assumption for two sprints running, the release plan is wrong and needs re-baselining. Say that in this report rather than letting it surface at the milestone.

## Commit the next sprint

### 5. Compute the frontier

The **frontier** is every story whose blockers are all Done. Nothing else is eligible, whatever the release plan says.

Where the frontier is smaller than a sprint's capacity, the graph is gating the team and the honest options are to unblock something, split a blocker, or accept an underfilled sprint. Filling the gap with blocked work is not one of them.

### 6. Filter to what is ready

A story on the frontier is not automatically ready to commit. The gate:

- [ ] Acceptance criteria present, in the field, in `Given … when … then …` form
- [ ] Estimated, at 8 points or less
- [ ] Every requirement it cites is settled: no open question in the register blocks it
- [ ] Every external dependency it needs has arrived
- [ ] Its body is current against any change agreed since it was groomed

A story failing the gate is not committed. Fix it now if it is minutes of work; otherwise it waits and something ready takes its place. Committing an unready story converts a grooming problem into a mid-sprint stall, and the sprint is where that is most expensive.

### 7. Set a sprint goal

One sentence naming what the sprint makes true that was not true before. `Complete stories S3.1.1 through S3.4.2` is a list, not a goal. `A driver can complete a fuelling end to end on the pilot forecourt` is a goal: it says what to protect when the sprint gets tight, and which stories can be dropped without losing the sprint.

Where the ready set has no coherent goal in it, that is worth surfacing: it usually means the sprint is a bag of unrelated work, which is legitimate sometimes and a planning smell often.

### 8. Fill to capacity

Fill to **actual** velocity, not the plan's assumption and not the team's best sprint. Then:

- Take the carry-over first. It is already started and already accounted for.
- Prefer stories on or near the **critical path**. A point of float spent early is a point available later.
- Check the **skill mix**, not just the point total. A sprint that fits the team's capacity and consists entirely of backend work is overcommitted for the backend developer and idle for everyone else.
- Leave headroom. A sprint filled to exactly its velocity has no room for the bug that arrives on day three, and one arrives most sprints.

### 9. Quiz the team

Present the goal, the stories with points and owners, the total against velocity, and what was deliberately left out. Ask whether the goal is right, whether anything is missing a dependency the graph does not know about, and whether the team believes the commitment.

That last question is the one that matters. A commitment the team does not believe is a forecast, and it will behave like one.

### 10. Schedule

`schedule` the committed stories into the iteration and derive the `Sprint:` tag from the iteration field rather than typing it.

### 11. Write the record

Write `docs/delivery/sprints/<n>.md`: the goal, the committed stories with points, the velocity used and where it came from, what was left out and why, and the close-out of the previous sprint. At the end of the engagement this directory is the delivery record, and it is what a velocity trend, a client review, or a dispute is argued from.

Where the close-out showed drift against the release plan, say plainly whether re-baselining is needed. The decision is the user's; the diagnosis is yours.

## Done when

- The previous sprint is closed with an actual velocity computed from Done stories only.
- Carry-over is unscheduled, re-estimated where it was mis-sized, and reasons are recorded.
- Every committed story is on the frontier and passed the readiness gate.
- The sprint has a one-sentence goal that is not a list of stories.
- The commitment is against actual velocity, with headroom, and the team said they believe it.
- The sprint record is written.

## Hand off

`/implement` picks up individual stories. Run `/plan-sprint` again at the next boundary, and `/backlog-audit` if the board has stopped feeling trustworthy.
