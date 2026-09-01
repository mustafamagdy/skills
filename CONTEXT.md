# Delivery planning skills

A chain of agent skills that turns contracted requirements into a planned, tracked, sprint-ready backlog on any issue tracker.

## Language

**Register**:
The flat, numbered list of every requirement the source documents state, each with provenance and a stable ID. Lives at `docs/delivery/requirements.md`. The chain's traceability spine.
_Avoid_: requirements doc, backlog of requirements, requirements list

**Spine**:
The Epic and Feature structure every story hangs from. Produced by `shape-backlog`.
_Avoid_: skeleton, structure, hierarchy (when the spine is meant)

**Slice**:
A story that is separately demoable, separately able to fail, and separately estimable. What `groom-stories` cuts a Feature into.
_Avoid_: task, item, chunk

**Echo**:
A story that restates its parent Feature in different words. The failure `groom-stories` exists to kill.

**Edge**:
A blocking relationship: A blocks B when B cannot start until A is done. Set by `map-dependencies`.
_Avoid_: link, relation, dependency (as a countable noun; a **dependency** is the condition, an **edge** is the recorded relationship)

**Frontier**:
Every story whose blockers are all Done, so it can start now. Read by `plan-release` and `plan-sprint`.

**Float**:
How long a story can slip without moving the end date. Zero on the critical path.
_Avoid_: slack, buffer

**Capability contract**:
The fixed set of named operations every skill calls against a tracker, answered per repo in `docs/agents/delivery-tracker.md`. What makes the chain tracker-agnostic.

**Hierarchy code**:
The `E1` / `F1.6` / `S1.6.2` prefix in a work item title. The chain's human-readable identifier, stable across trackers and assignable before an item exists.
_Avoid_: id, number (those name the tracker's own identifier)

## Relationships

- A **Register** requirement is covered by one or more **Slices**; a slice citing none is gold-plating, a requirement covered by none is an orphan
- A **Spine** Feature holds three to five **Slices**; one holding a single slice is usually an **Echo**
- **Edges** between slices form the graph; the **Frontier** and **Float** are queries against it
