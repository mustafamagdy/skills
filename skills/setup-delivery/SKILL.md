---
name: setup-delivery
description: "Configure the delivery-planning chain for this repo: which issue tracker it uses, and the backlog conventions the other skills write to."
disable-model-invocation: true
---

# Setup Delivery

Run once per repo. Writes the two files every other delivery skill reads:

- **`docs/agents/delivery-tracker.md`**: how this repo's tracker answers the [capability contract](CAPABILITIES.md).
- **`docs/agents/backlog-conventions.md`**: naming, body structure, tags, estimates. What a good work item looks like here.

Explore, present what you found, confirm, then write. This is a conversation, not a script.

## Process

### 1. Explore

Read before assuming:

- `git remote -v` and any CI config: which tracker is this repo's team actually on?
- `docs/agents/`: has this skill run before? If so you are re-syncing, not scaffolding, and the existing answers are the defaults.
- The tracker itself, if you can reach it. **An existing board is the strongest evidence there is.** Twenty work items tell you the real hierarchy, the real title convention, and the real tag vocabulary, and all three beat anything the user will remember to tell you.
- `CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`: existing conventions to honour rather than replace.

### 2. Ask

Lead each section with a recommendation so the user can accept it in a word. Skip any section exploration already settled.

**Tracker.** Propose what the evidence points at. Ship-ready templates:

| Tracker | Template |
|---|---|
| Azure DevOps Boards | [tracker-azure-devops.md](tracker-azure-devops.md) |
| GitHub Issues | [tracker-github.md](tracker-github.md) |
| Local markdown | [tracker-local.md](tracker-local.md) |
| Anything else (Jira, Linear, GitLab, Shortcut) | [tracker-blank.md](tracker-blank.md), filled in with the user |

For anything else, work through `CAPABILITIES.md` operation by operation with the user. Do not skip an operation because it seems obvious: the chain calls every one of them, and an operation left blank becomes a guess later.

**Hierarchy depth.** The chain assumes three levels (Epic, Feature, Story). Confirm the tracker's names for them, or agree the collapse if it has fewer.

**Conventions.** Default to the shipped conventions in [backlog-conventions.md](backlog-conventions.md) and say so in one line. Ask only about what the repo genuinely does differently: the hierarchy-code letters, the story body sections, the tag dimensions, the estimate scale.

**Requirement ID prefixes.** If a source document already assigns IDs (`BE-12`, `DA-04`, `FR-3.1`), the register inherits them and the chain traces to them. Ask what they look like. If nothing exists, the chain mints its own.

### 3. Confirm

Show both files in full and let the user edit before you write. They will be read by every later skill and by other humans, so a wrong line here is a wrong line in three hundred work items.

### 4. Write

Write both files. Then add or update a block in whichever of `CLAUDE.md` or `AGENTS.md` already exists (never create the other one):

```markdown
## Delivery planning

Backlog work runs through the delivery-planning skills. The issue tracker and its
capability contract are in `docs/agents/delivery-tracker.md`; the backlog conventions
are in `docs/agents/backlog-conventions.md`. Start with `/ask-delivery`.
```

### 5. Verify

A contract nobody exercised is a guess. Round-trip one throwaway item through the operations that carry the most risk, then delete it:

1. `create` an item titled `ZZ · setup verification`.
2. `tag` it twice with different tag sets. **Read it back.** If both sets survived, the operation merges rather than replaces, and the tracker doc's `tag` entry must say so.
3. `estimate` and `schedule` it, and read both back.
4. `block` it on itself if the tracker allows, or on any other item, and read the edge back.
5. Delete or close it.

Report what the round trip proved. Where an operation behaved differently from what the template claimed, **fix the tracker doc, not the report**.

## Done when

- Both files exist and every operation in `CAPABILITIES.md` has an answer, including the ones that answer `none`.
- The `tag` entry states merge or replace, proven by the round trip, not by reading documentation.
- Every degradation the tracker forces is written down with its fallback.
- `CLAUDE.md` or `AGENTS.md` points at both files.
- The verification item is gone.

## Hand off

Tell the user: **`/ingest-requirements`** next, with the paths to the source documents.
