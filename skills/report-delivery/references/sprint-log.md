# A3 sprint delivery log

Use this optional report component when the audience needs story-level sprint detail in a compact meeting appendix.

## Data contract

Add `sprintLog` at the top level of the report JSON:

```json
{
  "sprintLog": {
    "title": "Sprint delivery log",
    "subtitle": "Previous and current sprint | Status as at 6 September 2026",
    "statusDate": "2026-09-06",
    "sprints": [
      {
        "name": "Sprint 3",
        "label": "Foundation",
        "shortName": "S3",
        "startDate": "23 Aug",
        "endDate": "5 Sep 2026",
        "items": [
          {
            "id": "519",
            "sprint": "S3",
            "module": "Delivery",
            "name": "Establish planning conventions",
            "priority": "High",
            "points": 3,
            "assignee": "Delivery team",
            "status": "Closed",
            "notes": "M2 Gate"
          }
        ]
      }
    ],
    "source": "Tracker query and status cutoff"
  }
}
```

## Rules

- Use tracker values at the report cutoff. Do not turn planned owners or estimated points into actual tracker values.
- Keep tracker state names unchanged unless the report defines an explicit mapping.
- Use one full-width band per sprint.
- Use the reporting sprint and next sprint by default. Add earlier or later sprints only when needed.
- Use priority labels already present in the tracker. If the tracker stores numeric priority, document the mapping before applying it.
- Put milestone or dependency context in Notes only when it exists in the plan or tracker.
- Keep the page to 70 story rows. Split longer logs rather than shrinking below readable A3 print size.

## Output

When `sprintLog` exists, the builder:

- appends a text version to Markdown;
- writes `<report-name>-sprint-log.svg`;
- appends the SVG as an A3 landscape page in HTML and PDF;
- appends the same SVG on the A3 page master in FODT and DOCX.

## Verification

Check every ID, sprint, status, owner and point value against the tracker cutoff. Render the standalone SVG and the final DOCX and PDF page. Confirm the group headers, row text and all eight columns remain readable.
