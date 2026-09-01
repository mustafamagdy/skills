---
name: map-dependencies
description: "Set the blocking edges across a groomed story set: what genuinely gates what, cycles broken, external dependencies made first-class."
disable-model-invocation: true
---

# Map Dependencies

Turn a flat story set into a graph by adding **edges**: A blocks B when B cannot start until A is done.

The graph is what `/plan-release` and `/plan-sprint` compute over. Everything downstream, the critical path, the sprint frontier, the honest answer to *can we still hit the date*, is a query against these edges. A backlog without them is a list, and a list can only be planned by guessing.

Run this once the story set is complete. Edges can only point at items that exist.

Read `docs/delivery/backlog-map.md` and `docs/agents/delivery-tracker.md` first.

## The failure to avoid

**Over-linking** ruins the graph faster than missing edges do, and it is the natural direction to err in.

An edge means *B cannot start until A is done*. It does not mean *A feels like it comes first*, *A is more important*, or *the same person will do both*. Every spurious edge removes a chance to work in parallel, and enough of them turn the graph into a single chain that says the project takes as long as the sum of its parts. That number is then presented to a client.

The test for every edge: **if B started tomorrow with A untouched, what specifically breaks?** An answer naming a concrete artifact (a contract, a schema, a token, a screen) is a real edge. "It would be out of order" is not.

Sequencing preference without a hard gate belongs in `/plan-release`, which is allowed to prefer an order. This skill records only what is forced.

## Process

### 1. Classify what you are looking for

Five kinds of edge, and looking for them by name finds more than reading the backlog top to bottom:

| Kind | Shape | Example |
|---|---|---|
| **Contract** | B consumes something A defines | A story reading a token that another story issues |
| **Data** | B needs state A creates | Reporting on transactions that do not exist yet |
| **Foundation** | B needs infrastructure A builds | Everything, on `E0` |
| **External** | B needs something outside the team | Hardware delivered, an API credential issued, a certificate approved |
| **Approval** | B needs a decision | A build blocked on a client signing off a design |

### 2. Sweep for edges

Work Epic by Epic for the intra-Epic edges, then explicitly sweep **across** Epics.

The cross-Epic edges are the ones that matter and the ones that get missed, because grooming happened one Epic per session and nobody held two at once. They are also where the schedule actually breaks: a mobile story waiting on a backend story in a different Epic, three sprints apart, discovered in the sprint it was due.

### 3. Make external dependencies first-class

A dependency on something outside the team is a real edge and needs a real item on the tracker to point at. Create one, with an owner outside the team and a needed-by date, then block the stories on it.

This is not bookkeeping. An external dependency that lives only in a status report is invisible to every downstream calculation, so the critical path is computed as if the hardware were already on the shelf. Put it in the graph and it appears in the plan, in the sprint frontier, and in the escalation, on its own.

### 4. Break cycles

Walk the graph for cycles. A cycle is always one of three things, and the fix differs:

- **Two stories that are really one.** Merge them.
- **A story that needs splitting.** The half of A that B needs comes out as its own story, and the cycle opens.
- **A spurious edge.** Apply the test from above; usually one of the two edges fails it.

A cycle left in place makes the frontier empty, and every planning skill downstream reports that nothing can start.

### 5. Report before writing

Present, in around twenty lines. Counts carry the shape of the graph; names are for the handful of items the user has to think about:

- The edge count and the **longest chain** through the graph, by story count and by points. That chain is the floor on the schedule, and it is the number the user most needs to see before it becomes a date. Name its two ends and the Epics it crosses rather than listing every story on it.
- The five highest **fan-in** stories, with their counts. Everything is waiting on these, so they are the schedule risks.
- The count of stories with **no edges at all**, then up to five you are least sure about. The rest are either genuinely independent (good, and they are the parallel work) or under-analysed, and the full list belongs in the graph rather than the transcript.
- Every external dependency, with its owner. This list is never long, and each entry is somebody's action.
- Any cycle you had to break, and how.

The edges themselves are not part of the report. Three hundred `A blocks B` lines say nothing that the five bullets above do not say better.

### 6. Write the edges

Apply them with the `block` operation from the tracker doc, and mirror each in the story's Dependencies body section by hierarchy code, per the conventions. The link is the machine truth; the prose is what a human reads without opening the graph.

## Done when

- Every edge passes the "what specifically breaks" test.
- The cross-Epic sweep ran as its own pass.
- Every external dependency is an item on the tracker with an owner, not a sentence in a report.
- The graph is acyclic.
- The longest chain was reported to the user before the edges were written.

## Hand off

Tell the user: **`/plan-release`** next.
