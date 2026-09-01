# Delivery tracker: local markdown

Work items are files under `.delivery/`. No service, no auth, no rate limit, and the whole backlog is greppable and diffable in the repo. The trade is that nothing is enforced: every field below is a convention a human can break with a typo.

## Layout

```
.delivery/
├── E1-backend-platform/
│   ├── epic.md
│   ├── F1.6-session-and-token-lifecycle/
│   │   ├── feature.md
│   │   ├── S1.6.1-open-a-session.md
│   │   └── S1.6.2-issue-payment-tokens.md
```

The directory tree **is** the hierarchy, so it is the one field that cannot silently disagree with itself.

## Item format

```markdown
---
code: S1.6.2
type: story
title: Issue single-use, short-lived payment tokens
points: 3
sprint: S3
blocked-by: [S1.6.1, S1.4.2]
tags: [Module:Fuelling, Persona:Driver, Req:BE-08, MoSCoW:Must]
state: new
---

## Context
...

## Acceptance criteria
- Given ... when ... then ...
```

Acceptance criteria live under their own heading rather than in a separate field, since there are no fields. Everything else follows `backlog-conventions.md` unchanged.

## Shape

| | |
|---|---|
| **Levels** | Three, as directories. |
| **Estimate** | `points` in the frontmatter. |
| **Iteration** | `sprint` in the frontmatter. |
| **Dependency** | `blocked-by`, a list of hierarchy codes. |
| **Tags** | `tags`, a list. |

## Read

- **`fetch`**: read the file.
- **`list`**: `grep -rl "Module:Wallet" .delivery/`, or `rg --files-with-matches`.
- **`children`**: the files one level down.
- **`blockers`**: the `blocked-by` codes. A blocker is closed when its file's `state` is `done`.

## Write

Edit the file. **`tag` replaces the list**, since the list is the whole value.

## Identity

- **`identifier`**: the hierarchy code, which is also the filename prefix and the frontmatter `code`. There is no second identifier, which is the one thing this tracker does better than the hosted ones.
- **`lookup`**: `find .delivery -name 'S1.6.2-*'`
