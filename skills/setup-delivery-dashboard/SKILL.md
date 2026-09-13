---
name: setup-delivery-dashboard
description: Create or refresh a concise project progress dashboard during project initiation or delivery setup, using Azure DevOps, GitHub Projects, Jira, or the team's existing tracker.
---

# Setup Delivery Dashboard

Create a polished, live delivery overview in the team's existing platform. Use this during project initiation and when an existing project needs a dashboard. A dashboard request authorizes creating its views and saved queries; it does not authorize changing team membership, workflow states, billing, integrations, or public access.

## Discover and define

Read the repository instructions, remote, and any `docs/agents/delivery-tracker.md` and `docs/agents/backlog-conventions.md`. Reuse their named tracker operations for work-item reads. If no contract exists, inspect the live platform and record the dashboard-specific scope without blocking on the whole planning chain. Resolve conflicting project names against the current remote and live board. Verify the signed-in account before account-scoped browser work.

Identify the project, team, repositories, branches, board filters, iteration dates, estimate field, and state meanings. Inspect existing dashboards before creating another. Read only the relevant platform section in [platforms.md](references/platforms.md), then verify current capabilities against the live account and official documentation.

Define each metric before configuring it: source/filter, unit, time window, completion rule, and refresh behavior. In shared projects, apply the team's actual area or label scope, including nested areas where intended. Do not change team configuration to make a chart populate.

Distinguish completed development from shipped work when the workflow does. Never assume Closed, Done, merged, and released mean the same thing. Use either story count or points consistently within a chart; do not mix stories and their subtasks. Counts are the fallback for missing estimates, not invented points or hours.

## Build the overview

Use a short project title and compact visual hierarchy: colored totals first, two useful trends next, then quality and activity. Prefer six to ten readable panels over a wall of tiny widgets. Keep colors consistent, pair color with labels, and make the main signals visible without excessive scrolling.

Choose panels supported by real data:

| Signal | Useful default |
|---|---|
| Progress | Total scope, shipped/completed, awaiting release, active work |
| Burn pace | Current sprint remaining work or burnup, with scope changes visible |
| Delivery pace | Completed stories or points over recent comparable sprints; throughput over fixed periods for Kanban |
| Quality | Open bugs, with severity or aging when reliable |
| Build health | Recent runs of the relevant active pipeline |
| Code activity | Recent commits and open PRs, plus links to the board, repository, and CI |

At initiation, history may be empty. Show truthful empty states or omit unavailable trends and record why. Zero means a successful query returned no matches; unavailable data is not zero. Do not forecast delivery from no history.

Use native saved views, queries, charts, and dashboard widgets first. If the platform has no single dashboard surface, use a small set of linked native views. Do not silently substitute a custom website. Annual contribution heatmaps are optional: add one only when already available and useful. If it needs an extension, payment, or custom development, explain that briefly and skip unless the user asks to pursue it. Commit volume is activity, not productivity or a basis for ranking people.

Use the supported connector or CLI for creation; use browser controls for missing configuration capabilities and visual verification. Inspect existing dashboard ownership and saved-query visibility. Preserve unrelated widgets and settings on updates. Read fresh revisions before mutation, prefer scoped updates, and reread after conflicts instead of replaying stale payloads. Re-running the skill should update the recorded dashboard and reuse queries, not create duplicates.

## Verify and record

Read back the saved configuration and compare headline totals with their source queries. Check one trend's scope, dates, unit, and completed-state mapping. Open the result in the browser: ensure charts load, labels fit, links work, and no permissions or configuration errors remain. Disclose when visual verification is blocked.

Write `docs/delivery/dashboard.md` (or update the existing dashboard record) with the dashboard/view URLs and IDs, owner, scope, metric definitions, source queries, refresh behavior, and any unavailable panels. Include dashboard-specific capability limitations here rather than inventing unsupported operations in the planning contract. Never store credentials. Record a verification timestamp; distinguish live values from any static snapshot.

## Done when

- A native dashboard or linked native views exist in the verified project, with working access for the intended audience.
- Metrics have consistent definitions and checked source totals; missing history is represented honestly.
- The layout and links were visually checked, or the exact verification blocker is reported.
- The dashboard record makes future updates repeatable without duplicating resources.

## Hand off

Return the dashboard link, the record path, and only material limitations. During project initiation, continue the already-authorized setup work; otherwise name `/ingest-requirements` for an empty backlog or `/plan-sprint` for a prepared backlog as the next human-invoked step. This dashboard is not a gate that prevents planning.
