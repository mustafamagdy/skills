# A3 project-plan Gantt

Use this standard report appendix when an approved plan exists and the audience needs to see the baseline, current position and remaining route to delivery on one page. Weekly status, sprint review, milestone review and steering reports include it by default unless the user asks for a shorter report.

The chart is source-backed. Read the approved baseline for planned timing and live delivery evidence for status. Do not silently calculate a new baseline or move a milestone to make the chart look cleaner.

## Data contract

Add `schedule` at the top level of the report JSON:

```json
{
  "schedule": {
    "title": "Project delivery schedule",
    "subtitle": "Nine two-week sprints | Status as at 3 September 2026",
    "statusDate": "2026-09-03",
    "statusPeriod": 6,
    "periods": [
      {"label": "W1", "date": "26 Jul"},
      {"label": "W2"},
      {"label": "W3", "date": "9 Aug"}
    ],
    "phases": [
      {"label": "P1 Foundations", "start": 1, "end": 4, "color": "#6C97BF"}
    ],
    "sprints": [
      {"label": "Sprint 1", "start": 1, "end": 2},
      {"label": "Sprint 2", "start": 3, "end": 4}
    ],
    "milestones": [
      {"id": "M1", "label": "Design approval", "period": 2}
    ],
    "workstreams": [
      {
        "name": "Platform foundations",
        "items": [
          {
            "id": "1.1",
            "name": "Architecture and requirements baseline",
            "start": 1,
            "end": 2,
            "status": "complete",
            "duration": "2w",
            "critical": false
          }
        ]
      }
    ],
    "note": "Bars show approved timing; lines show milestone and status positions.",
    "source": "Approved delivery plan v2 and tracker query 123"
  }
}
```

## Meaning of each field

| Field | Requirement |
|---|---|
| `title` | Client-facing chart title. |
| `subtitle` | Cadence, duration, cutoff and Go-Live statement when relevant. |
| `statusDate` | ISO `YYYY-MM-DD` evidence cutoff. |
| `statusPeriod` | One-based period whose right boundary carries the red current-date line. Set this from the approved calendar and cutoff; do not guess it from a stale plan. |
| `periods` | Two to 26 equal visual periods. Each needs a label; `date` is an optional short display cue. |
| `phases` | Optional top bands. `start` and `end` are inclusive one-based period numbers. |
| `sprints` | Optional sprint bands shown directly under the week header. When omitted, the renderer groups consecutive periods in pairs. |
| `milestones` | Optional milestone diamonds and full-height dashed lines. `period` is the one-based boundary after that period. |
| `workstreams` | One or more named groups. The page supports up to 32 task rows. |
| `items` | Each task needs a unique ID, name, inclusive start/end period and status. |
| `status` | `complete`, `active`, `upcoming`, or `hypercare`. |
| `duration` | Optional display label such as `10d`, `2w`, or `4w`. It does not change timing. |
| `critical` | Optional boolean. `true` adds a red dependency marker; name the owner and action in the report's risk table. |
| `color` | Optional six-digit hex override for a phase or task. Use sparingly. |
| `note` | Optional one-line reading guide. |
| `source` | Approved baseline and live-status evidence used to draw the page. |

The explicit period model handles delivery plans whose approved week labels or milestone dates do not follow simple calendar arithmetic. Keep those decisions visible in the source rather than hiding them in rendering code.

## Output behavior

When `schedule` exists, `build-report.mjs`:

- appends a readable text schedule to Markdown;
- writes `<report-name>-gantt.svg` as a standalone vector chart;
- appends the SVG as a named A3 landscape page in HTML, ready for `render-pdf.mjs`;
- embeds the same SVG on an A3 landscape master page in FODT, ready for `render-docx.mjs`.

The Gantt is appended at the end so the report can switch to A3 without disturbing the A4 body or requiring a second page-style switch.

## Design rules

- Treat the page as a professional planning worksheet: centered title and subtitle, restrained navy headers, light phase or workstream bands, compact weekly cells, and precise grid alignment.
- Make the deliverable column materially wider than one period cell.
- Keep every period cell equal in width.
- Use phase bands across the top, a compact sprint band below the week header and group headers down the left.
- Show ID, Phase, Activity or Work Package, Owner, Start and End before the compact week cells. Leave optional values blank rather than inventing them.
- Put duration labels inside bars only when they remain readable.
- Draw milestone diamonds above full-height dashed milestone lines.
- Draw one solid red status line and label it `TODAY`.
- Use a red dot only for a material critical-path dependency. Explain its owner and required action elsewhere in the report.
- Show completed, active, upcoming and hypercare work with a small legend.
- Do not show a completion percentage unless it has a defensible denominator.
- Do not render more than 26 periods or 32 task rows on one page. Split the schedule or provide a second detailed appendix instead of shrinking text below readability.

## Verification

For every DOCX and PDF that includes the schedule:

1. Confirm the report body remains on its normal page size.
2. Confirm the schedule page is exactly A3 landscape.
3. Inspect the standalone SVG and the rendered DOCX/PDF page.
4. Check phase and bar start/end alignment against the source data.
5. Check each milestone line lands on its stated period.
6. Check the red status line matches the report cutoff.
7. Check long labels are readable and no task row, legend or source note is clipped.
8. Confirm the chart source is named in the evidence register or `schedule.source`.

If the office converter cannot preserve the mixed page size, keep the standalone SVG and PDF correct, then use an available document tool to append the SVG inside a true A3 landscape section. Do not rasterize a readable vector chart unless the target editor cannot accept SVG.
