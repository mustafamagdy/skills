# Delivery planning skills

Agent skills that carry a signed requirements document all the way to a sprint a team can start on Monday.

Built as an extension to [Matt Pocock's skills](https://github.com/mattpocock/skills), and shaped to sit beside them rather than overlap. His cover the loop from an issue to merged code; these cover the loop from a contract to a committed sprint. See [where this fits](#where-this-fits).

They run as a **chain**. Each leaves an artifact the next one reads, so a step skipped is a step the next one guesses at.

```
requirements docs
   ├─ /setup-delivery ........ once per repo: tracker contract + conventions
   ├─ /ingest-requirements ... source docs  → the register
   ├─ /shape-backlog ......... the register → the epic and feature spine
   ├─ /groom-stories ......... each feature → its story slices
   ├─ /map-dependencies ...... the story set → blocking edges
   ├─ /plan-release .......... edges + estimates → the route and the cadence
   └─ /plan-sprint ........... the route → one sprint, committed

delivery evidence
   └─ /report-delivery ....... any point → a client, sprint, milestone or executive report
```

## Skills

**User-invoked**

| Skill | What it does |
|---|---|
| [`ask-delivery`](skills/ask-delivery/SKILL.md) | Router over the set: which skill, in what order, where the handoffs are |
| [`setup-delivery`](skills/setup-delivery/SKILL.md) | Configure the tracker's capability contract and the backlog conventions |
| [`ingest-requirements`](skills/ingest-requirements/SKILL.md) | Source documents into a traceable requirement register |
| [`shape-backlog`](skills/shape-backlog/SKILL.md) | The register into an epic and feature spine on the tracker |
| [`groom-stories`](skills/groom-stories/SKILL.md) | Features into demoable, estimated story slices |
| [`map-dependencies`](skills/map-dependencies/SKILL.md) | Blocking edges across the groomed story set |
| [`plan-release`](skills/plan-release/SKILL.md) | Critical path, sprint cadence, milestone dates, honest reconciliation |
| [`plan-sprint`](skills/plan-sprint/SKILL.md) | Close the last sprint, commit the next |
| [`report-delivery`](skills/report-delivery/SKILL.md) | Turn live evidence into a polished report, with an optional source-backed A3 project-plan Gantt |

**Model-invoked**

| Skill | What it does |
|---|---|
| [`backlog-audit`](skills/backlog-audit/SKILL.md) | Audit traceability, structure, readiness, graph, tags and schedule. Writes nothing. |

## Any tracker

No skill here knows what Azure DevOps, GitHub Issues, Jira or a folder of markdown files is. They call **named operations** against a [capability contract](skills/setup-delivery/CAPABILITIES.md) that `/setup-delivery` answers once per repo, in `docs/agents/delivery-tracker.md`.

Ship-ready templates: [Azure DevOps](skills/setup-delivery/tracker-azure-devops.md), [GitHub Issues](skills/setup-delivery/tracker-github.md), [local markdown](skills/setup-delivery/tracker-local.md), and a [blank form](skills/setup-delivery/tracker-blank.md) for anything else.

Where a tracker lacks a capability, the contract's degradation table fixes the fallback in one place, so every skill degrades the same way.

## Install

```bash
npx skills@latest add mustafamagdy/skills -g
```

Pick the skills you want and which agents to install them on. `-g` installs to your user directory rather than the current project, which is what you want here: these skills plan the work in a repo, so they should be available before that repo exists.

**Take `setup-delivery`.** Every other skill reads the two files it writes, and without it they stop and ask you to run it.

One skill on its own, and updates:

```bash
npx skills@latest add mustafamagdy/skills --skill ask-delivery -g
npx skills@latest update ask-delivery
```

Interactively the installer offers symlinks to one canonical copy; non-interactively (`-y`) it copies. Either way `npx skills update` is what refreshes them. Works with [Claude Code, Codex, Cursor, OpenCode and 70-odd others](https://skills.sh/mustafamagdy/skills).

## Where this fits

These are an extension to **[mattpocock/skills](https://github.com/mattpocock/skills)**. Install both: nothing here duplicates anything there.

His set is the **engineering loop**, and it starts once work is already an issue: `/triage` sorts the queue, `/to-spec` turns a conversation into a spec, `/to-tickets` cuts a spec into tracer bullets, `/implement` builds one. It assumes somebody already decided what the work is.

This set is the **delivery loop** upstream of that decision, which is where agency and consultancy work actually starts: a signed BRD, an SOW, three hundred requirements, a client who wants dates. Documents into a traceable register, the register into a backlog, the backlog into a dependency graph, the graph into a critical path and a sprint somebody can commit to in front of a client.

The two meet at a story:

| Boundary | Which skill |
|---|---|
| Requirements still fuzzy in someone's head | `/grill-with-docs` first. `/ingest-requirements` reads documents, it does not interview. |
| Slicing one feature an agent is about to build | `/to-tickets`. Tracer bullets sized for a context window. |
| Slicing a contracted scope a client is about to sign off | `/groom-stories`. Stories a human team estimates and commits to. |
| A sprint is committed and the work starts | `/implement`, one story at a time. |

`/ask-delivery` is the router over this set, and it carries the same boundaries so you do not have to hold them in your head.

## Conventions

House style is in [CLAUDE.md](CLAUDE.md). Vocabulary is in [CONTEXT.md](CONTEXT.md). The writing style follows [`writing-for-agents`](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md), and the shape of a skill here (explore, recommend, confirm the decisions, then write) is lifted from the same repo.
