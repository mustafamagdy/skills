---
name: ask-delivery
description: "Router over the delivery-planning skills: which one to reach for, in what order, and where the handoffs are."
disable-model-invocation: true
---

# Ask Delivery

You don't remember every skill, so ask.

These skills take a signed requirements document and carry it all the way to a sprint a team can start on Monday. They run as a **chain**: each one leaves an artifact the next one reads, so a step you skip is a step the next one has to guess at.

Every skill here is **tracker-agnostic**. None of them knows what Azure DevOps, GitHub Issues, Jira or a folder of markdown files is. They call **named operations** against a **capability contract** that `/setup-delivery` writes once per repo. Swap the tracker, rewrite one file, and the chain still runs.

## The chain

```
requirements docs
   │
   ├─ /setup-delivery ........... once per repo: tracker contract + conventions
   │
   ├─ /ingest-requirements ...... source docs  → the register
   ├─ /shape-backlog ............ the register → the epic and feature spine
   ├─ /groom-stories ............ each feature → its story slices
   ├─ /map-dependencies ......... the story set → blocking edges
   ├─ /plan-release ............. edges + estimates → the route and the sprint cadence
   └─ /plan-sprint .............. the route → one sprint, committed
```

| Step | Reach for it when | It leaves behind |
|---|---|---|
| `/setup-delivery` | First run in a repo, or the tracker changed | `docs/agents/delivery-tracker.md`, `docs/agents/backlog-conventions.md` |
| `/ingest-requirements` | You have a BRD, SOW, RFP or spec and no backlog | `docs/delivery/requirements.md`, the **register** |
| `/shape-backlog` | The register is agreed and nothing is on the tracker yet | Epics and Features on the tracker, `docs/delivery/backlog-map.md` |
| `/groom-stories` | Features exist, stories don't, or a feature holds one story that echoes it | User Stories on the tracker, estimated |
| `/map-dependencies` | The story set is complete and you need to know what gates what | Blocking edges on the tracker |
| `/plan-release` | Edges are set and you need dates, sprints and a critical path | `docs/delivery/release-plan.md` |
| `/plan-sprint` | A sprint is about to start | Items assigned to the iteration, `docs/delivery/sprints/<n>.md` |
| `/backlog-audit` | Any time you distrust the board | A findings report, nothing written |

## Two ways in

The chain assumes a **greenfield backlog**, but that is not the only way work arrives.

- **A document landed.** Start at `/ingest-requirements` and walk the chain.
- **A board already exists and you inherited it.** Start at `/backlog-audit`. It tells you which chain step to rejoin: no register means `/ingest-requirements`, thin features mean `/groom-stories`, no edges mean `/map-dependencies`.

## Handoffs

Every skill here is user-invoked, so **none of them can fire the next one**. The human is the index. Each skill closes by naming what it wrote and what to type next, so you can act on the last line instead of remembering the map.

The handoff is the **artifact**, never the conversation. That is deliberate: a chain that only works inside one unbroken session cannot survive an interruption, and these chains run for weeks. Each skill re-reads what it needs from disk and from the tracker.

Which means the context advice is simple, and the opposite of a code-feature chain:

| Boundary | Do this |
|---|---|
| Between chain steps | `/clear`. The artifact carries everything forward. |
| Inside `/groom-stories`, feature to feature | `/clear` every few features. Grooming is repetitive and context fills with published bodies. |
| Mid-step | Stay put. Only `/compact` if the window is genuinely tight. |

The exception is `/ingest-requirements` into `/shape-backlog`. Those two think about the same material at different altitudes, and the second is much sharper with the first still in context. Run them together, then clear.

## The neighbouring skills

These sit next to skills you already have, and the boundary matters:

- **`/to-tickets` versus `/groom-stories`.** `/to-tickets` slices one feature you are about to build into tracer bullets sized for a context window. `/groom-stories` slices a whole contracted scope into stories a human team estimates and commits to. Use `/to-tickets` when an agent is about to implement; use `/groom-stories` when a client is about to sign off.
- **`/grill-with-docs` before `/ingest-requirements`.** If the requirements are still fuzzy in someone's head, grill first. `/ingest-requirements` reads documents, it does not interview.
- **`/implement`** picks up where `/plan-sprint` leaves off, one committed story at a time.
