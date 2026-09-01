---
name: plan-release
description: "Turn the dependency graph and estimates into a route: critical path, sprint cadence, milestone dates, and an honest reconciliation against the committed date."
disable-model-invocation: true
---

# Plan Release

Compute the **route**: the order the work has to happen in, how many sprints it takes, and where the milestones land.

Two numbers do most of the work. The **critical path** is the longest chain of blocking edges through the graph: the floor on the schedule no amount of extra people can go below. **Capacity** is what the team can absorb per sprint. Everything else in this skill is arithmetic on those two and then a conversation about the gap.

Read `docs/delivery/backlog-map.md`, `docs/delivery/requirements.md` and the tracker doc first. The graph must be complete: run `/map-dependencies` if it is not.

## Process

### 1. Establish capacity, and say how you know

Ask, do not assume:

- Team composition, and how it changes over the engagement. A backend-heavy backlog and a frontend-heavy team is a constraint the point total hides completely.
- Sprint length, and the calendar: holidays, Ramadan, the client's freeze windows, the fact that a two-week sprint spanning a public holiday is not two weeks.
- **Velocity**: points per sprint. Measured from completed sprints where any exist, assumed where none do.

An assumed velocity is a guess wearing a number's clothes, and it is the input every date in the plan rests on. Label it as assumed everywhere it appears, and state the date's sensitivity to it: *at 30 points a sprint, M3 lands 12 March; at 24, 9 April*. A single date from an unmeasured velocity is a false promise, and it is the promise that gets quoted back.

Where sprints have already run, use **actual** velocity. Not the one the team hoped for, not the average of the good sprints.

### 2. Compute the critical path

Longest chain by points through the graph. Report its total, its length in stories, and the Epics it runs through. List the chain story by story only where it is short enough to read, around fifteen; past that the full chain belongs in the plan document, and what the user needs here is the number.

Then read what it means:

- **Critical path in sprints** = path points / velocity. Nothing ships sooner, at any team size.
- **Total scope in sprints** = total points / velocity. The floor when capacity binds rather than sequence.
- The schedule floor is the **larger** of the two.

A critical path much shorter than the total says the work parallelises and more people would help. A critical path close to the total says the graph is a chain, more people will not help, and the lever is scope or sequence. Say which situation this is, plainly. It changes what the user should do next.

### 3. Find the float

**Float** is how long a story can slip without moving the end date: everything off the critical path has some, and everything on it has none.

Report the near-critical chains too, the ones with a sprint or less of float. They become the critical path the moment anything slips, and a plan that names only one critical path is fragile in a way it does not look.

### 4. Lay out the sprints

Walk the graph forward, sprint by sprint, filling each to capacity from the **frontier**: stories whose blockers all land in an earlier sprint.

Three rules:

- **Never place a story in the same sprint as its blocker** unless the team has explicitly agreed to run them together and accepted that both may slip.
- **Front-load `E0` and the high fan-in stories.** Work everything waits on buys float for everything else, and is worth doing before work that is merely more visible.
- **Leave the last sprint of a milestone lighter.** It absorbs the slip that arrives from everywhere else, and a milestone sprint planned to full capacity has no way to be late except by being late.

### 5. Place the milestones

Map contractual milestones onto sprint boundaries: what defines each one as met, which stories carry it, and the date the sprint arithmetic gives.

Where milestones gate payment, that mapping is the most consequential output of this skill. State exactly which stories must be Done for a milestone to be claimable, since that list is what the argument will be about.

Handle scope beyond the plan explicitly: what is Phase 2, what is deferred, what is descoped. A story with no phase is a story somebody will assume is coming.

### 6. Reconcile, out loud

Compare the computed dates against the committed ones.

Where the plan does not close, **say so, with the size of the gap, and stop**. Do not close it by trimming estimates, by assuming a velocity the team has never hit, or by putting blocked work in the same sprint as its blocker. A plan that closes on paper and not in reality fails later, in front of a client, having consumed the runway that could have been used to fix it.

Present the three levers and their real costs:

| Lever | What it means | The cost nobody mentions |
|---|---|---|
| **Scope** | Move requirements to a later phase | Contracted scope, so it needs client agreement, not a decision in this session |
| **Capacity** | Add people | Ramp-up time, and no effect at all on a critical path |
| **Time** | Move the date | Usually the only honest lever, and the one raised last |

Name which requirements would move under the scope lever, by ID, with the fact that they are contracted.

### 7. Write the plan

Write `docs/delivery/release-plan.md`, then say four things and stop: the end date, the critical path length, whether the plan closes against the committed dates, and the decision you need if it does not. The plan is long and it is on disk. What the user has to act on is those four lines.

<plan-template>

# Release plan

**Assumptions**: velocity and its provenance (measured over which sprints, or assumed), team, sprint length, calendar exclusions. First, because everything below is downstream of it.

## Schedule

| Sprint | Dates | Points | Delivers | Milestone |
|---|---|---|---|---|

## Critical path

The chain, story by story, with its total and what it implies for the earliest possible finish.

## Milestones

| Milestone | Sprint | Date | Definition of met | Carrying stories |
|---|---|---|---|---|

## Risks

Each with its trigger, its impact in sprints, and its owner. External dependencies belong here by name, with their needed-by dates.

## Reconciliation

Computed against committed, the gap where there is one, and the options put to the user. Kept in the document rather than said once in a meeting.

## Out of plan

Phase 2, deferred, descoped, each with its requirement IDs.

</plan-template>

### 8. Tag the board

Apply the milestone and sprint dimensions from the conventions, using the `tag` and `schedule` operations. Where a `Sprint:` tag mirrors the iteration field, derive it rather than typing it: it goes stale the moment somebody drags a card.

## Done when

- Velocity is stated with its provenance, and every date carries its sensitivity to it.
- The critical path is computed and reported, with the near-critical chains beside it.
- No story sits in the same sprint as a blocker without an explicit, recorded agreement.
- Every milestone has a definition of met and a carrying story list.
- Where the plan does not close, the gap and the three levers went to the user, and no date was made to work by adjusting an input.
- `docs/delivery/release-plan.md` is written and the board is tagged to match.

## Hand off

Tell the user: **`/plan-sprint`** at the start of each sprint. The release plan is a projection; the sprint plan is a commitment, and only the second one binds.
