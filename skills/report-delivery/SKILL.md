---
name: report-delivery
description: "Create an evidence-backed delivery report for a chosen audience and period, such as a weekly update, sprint review, milestone pack or executive status report. Reads plans, trackers, build systems and operational evidence, then produces polished files without changing delivery state."
---

# Report Delivery

Turn the delivery record and live systems into a report somebody can use in a meeting.

This is a reporting sidecar to the delivery-planning chain. It can run at any point. Weekly status is one mode, not the shape of every report. The audience, reporting period and available evidence decide the structure.

The report is a snapshot. Read live state, write report files, and change nothing on the tracker or in external systems. Never email, publish or share the report unless the user explicitly asks.

## Establish the brief

Resolve these before writing:

| Decision | Examples |
|---|---|
| Report type | Weekly status, sprint review, milestone review, steering update, executive summary, delivery health |
| Audience | Client, delivery team, executives, technical reviewers |
| Reporting window | Since project start, a named sprint, a date range, or status as at a cutoff |
| Comparison | Against the release baseline, previous report, sprint commitment, milestone criteria, or none |
| Output | Markdown, DOCX, PDF, slides, or a requested combination |
| Sensitivity | Client-safe, internal, confidential, or public |

Infer obvious answers from the request and repository. Ask only when a missing choice would materially change the report. State the chosen cutoff date and timezone in the report so numbers can be reproduced.

## Read the evidence

Use the sources that exist. Do not require a project to use this repository's full planning chain.

Prefer evidence in this order:

1. **Live systems**: tracker state, test runs, pipelines, deployments, cloud inventory, monitoring and incident systems.
2. **Delivery records**: sprint records, release plan, milestone definitions, requirement register and approved changes.
3. **Product evidence**: real application screenshots, demonstrations, test videos and acceptance records.
4. **Narrative sources**: meeting notes, status notes and conversation history.

Where present, read `docs/agents/delivery-tracker.md` for tracker operations and the repository's delivery artifacts under `docs/delivery/`. Also inspect the project's own planning and reporting locations rather than assuming these paths exist.

Live state outranks the plan for what happened. The approved baseline outranks live state for what was promised. Report the difference instead of choosing whichever looks better.

If a source cannot be reached, name the evidence gap. Do not fill it from memory or estimate it silently.

## Build the factual position

Reconcile the evidence before designing the document:

- **Delivered**: count only work in the tracker's accepted completion state. Keep cumulative delivery separate from delivery inside the reporting window.
- **In progress**: show current work and the outcome it is expected to enable. Do not present activity as completion.
- **Quality**: use actual test, coverage, security and release results with build or run identifiers.
- **Schedule**: show the reporting period, sprint start and end dates where relevant, milestone dates, and variance from the approved baseline.
- **Cost or capacity**: show units, currency, period and source. Keep actuals separate from forecasts.
- **Risks and dependencies**: give each one an owner, impact, requested action and needed-by date where known.
- **Next**: derive upcoming work from the current plan and ready work, not from a generic roadmap summary.

Recalculate totals from the underlying items. When two sources disagree, resolve the difference or expose it clearly. Never add unlike measures, such as story counts and tasks, into one completion percentage.

## Shape the report for its audience

Choose only sections that help the named audience. A useful default for a client delivery report is:

1. Executive position
2. Progress in the reporting window
3. Cumulative delivery position
4. Quality and release evidence
5. Schedule and milestone position
6. Next-period plan
7. Risks, dependencies, decisions and owners
8. Evidence register
9. A3 project-plan Gantt when approved schedule data exists
10. A3 sprint delivery log when sprint tracker data exists

For an internal report, add delivery causes, operational detail and corrective actions. For a client-facing report, remove internal chatter, blame, unsupported speculation and implementation notes, but never hide a material delivery risk or misstate progress.

Lead with outcomes. Story lists and evidence tables support the report; they do not replace the summary.

For weekly status, sprint review, milestone review and steering reports, include both A3 appendices by default when their source data exists. Omit one only when the user asks for a shorter report, the report type makes it irrelevant, or the required evidence is unavailable. Name the missing evidence rather than fabricating a page.

## Evidence rules

- Every important number must trace to a named source, query, build, run or calculation.
- Use stable links or identifiers beside evidence when available.
- A screenshot must come from the real source UI or real application. Never create a graphic that looks like a system screenshot.
- A generated chart is allowed when it is built from cited source data and clearly presented as a chart.
- Capture enough surrounding UI to show the account, environment, filter, result and date when those details matter.
- Redact secrets, credentials, personal data and unrelated customer information.
- Use screenshots selectively. One readable image is stronger than several tiny ones.
- Keep a compact evidence register stating what was verified, from where and as at when.

## Write the artifact

Follow the user's requested format and location. When neither is given, write Markdown to `docs/delivery/reports/<date>-<type>.md`. When a polished meeting pack is requested and document tooling is available, produce DOCX and PDF from the same source.

Use the bundled renderer instead of writing report-generation code for each run. Read [references/report-data.md](references/report-data.md) when preparing its input.

```bash
node scripts/build-report.mjs report.json --out-dir <output-directory>
node scripts/render-pdf.mjs <output-directory>/<name>.html <output-directory>/<name>.pdf
node scripts/render-docx.mjs <output-directory>/<name>.fodt <output-directory>/<name>.docx
```

`build-report.mjs` uses only the Node.js standard library and always produces Markdown, standalone HTML and Flat OpenDocument Text. It does not need Python or installed packages. The PDF helper uses an installed Chrome, Edge or Chromium browser. The DOCX helper converts the styled Flat OpenDocument file with LibreOffice. Each helper reports a clear missing-runtime error instead of installing software.

If Node.js is unavailable, use an available document skill or tool with [assets/report-template.md](assets/report-template.md). If neither exists, fill that Markdown template directly. Do not invent a new generator inside the project. Preserve the structured report data when possible so richer formats can be rendered later.

Do not force one visual identity onto every project. Reuse a supplied template, brand assets and document conventions. Otherwise use a restrained professional style with readable tables, consistent spacing and a small number of status colours.

For paged documents:

- Reserve forced page breaks for the cover and table of contents unless the layout genuinely requires another.
- Let body sections flow continuously. Do not start every section on a new page.
- Give callout boxes and table cells visible internal padding.
- Keep headings with the content that follows them.
- Avoid orphan headings, split rows, clipped figures and large accidental gaps.
- Put the reporting period and status date in a visible location.

The report body belongs in the file. In the terminal, report the files written, the evidence cutoff, the few decisions or gaps that need attention, and nothing else.

## Add the standard A3 project-plan Gantt

For a delivery report with an approved plan, add a task-level Gantt rather than a decorative sprint-block chart. This is the default when the skill is invoked for a weekly status, sprint review, milestone review or steering report. Also add it whenever the user asks to show the project plan, timeline, delivery path, milestones or current position. Read [references/a3-gantt.md](references/a3-gantt.md) and populate the top-level `schedule` object in the report JSON.

The page must be reusable across projects:

- derive phase bands, workstreams, tasks, dates and milestone positions from that project's approved plan;
- derive completed and active status from current delivery evidence;
- show the evidence cutoff with one red vertical status line;
- show milestone diamonds and full-height dashed milestone lines;
- give task names a wide left column and keep time cells compact and equal;
- mark a critical dependency only when the report also names its owner and requested action;
- append the chart as one A3 landscape page while leaving the report body on its normal page size.

`build-report.mjs` uses [scripts/gantt.mjs](scripts/gantt.mjs) to generate the same chart in every output. It writes a standalone SVG, embeds it in the HTML/PDF path, and places it on an A3 landscape master page in the FODT/DOCX path. The generator uses only Node.js standard-library features and does not require Python or packages.

If the plan has more than 26 periods or 32 task rows, split the plan or add a second detailed appendix. Do not shrink the chart into unreadable text. If a converter does not preserve mixed page sizes, use an available document tool to place the generated SVG in a true A3 landscape section and verify the result.

## Add the standard A3 sprint delivery log

For a delivery report backed by a sprint tracker, add the sprint delivery log by default. Also add it whenever the user asks for a sprint log, backlog by sprint, story appendix or detailed sprint position. Read [references/sprint-log.md](references/sprint-log.md) and populate the top-level `sprintLog` object in the report JSON.

The page follows a practical spreadsheet planning convention: a dark navy column header, one full-width navy band per sprint, compact alternating story rows, and priority and status colours. Show the fields the tracker can support: Sprint, Module, User Story or Task, Priority, Story Points, Assignee, Status and Notes. Do not invent missing values.

Use the sprint log for the reporting sprint and the next sprint by default. Include more sprints only when the audience needs them and the page remains readable. The renderer supports up to 70 story rows on one A3 landscape page.

## Verify

Before delivery:

1. Re-run totals and date calculations independently.
2. Check links, build identifiers, currency, units, status names and owners.
3. Confirm client-facing wording is accurate, neutral and free of internal notes.
4. Render every page of DOCX or PDF and inspect it visually.
5. Check that real evidence images remain readable at final size.
6. When a Gantt exists, verify its bars, milestone lines and red status line against the approved plan and confirm the page is A3 landscape.
7. When a sprint log exists, verify group membership, story points, owners and current tracker states and confirm the page is A3 landscape.
8. Run available document, PDF and accessibility checks.
9. Confirm the output opens and contains the expected text, pages and attachments.
10. Run `node scripts/build-report.test.mjs` when the bundled renderer changed.

## Done when

- The report states its audience, reporting window, cutoff date and timezone.
- Delivered, in-progress and planned work are clearly separated.
- Important claims and numbers have inspectable evidence.
- Actuals, forecasts and baseline commitments are not mixed.
- Every risk has an owner and action where the evidence provides one.
- No screenshot or system result was fabricated.
- Any requested project-plan Gantt is source-backed, readable and preserved as A3 landscape in DOCX and PDF.
- Any requested sprint delivery log is source-backed, readable and preserved as A3 landscape in DOCX and PDF.
- Requested files are polished, readable and verified page by page.
- No tracker, plan or external destination changed unless separately requested.

## Hand off

Link the report files and name any evidence gaps or decisions, capped to what the user can act on immediately.

If the report reveals an untrustworthy backlog, tell the user to run `/backlog-audit`. If dates no longer close, tell them to run `/plan-release`. At a sprint boundary, tell them to run `/plan-sprint`.
