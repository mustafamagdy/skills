# Delivery planning skills

Agent skills that carry a signed requirements document all the way to a sprint a team can start on Monday.

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

Installed by default as symlinks to a single canonical copy, so `npx skills update` refreshes every agent at once. Works with [Claude Code, Codex, Cursor, OpenCode and 70-odd others](https://skills.sh/mustafamagdy/skills).

## Conventions

House style is in [CLAUDE.md](CLAUDE.md). Vocabulary is in [CONTEXT.md](CONTEXT.md). The writing style follows [`writing-for-agents`](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md).
