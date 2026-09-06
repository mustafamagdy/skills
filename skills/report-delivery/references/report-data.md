# Report data

Use the bundled renderer when the report needs repeatable Markdown, HTML, PDF or DOCX output. Prepare one JSON file, then keep it beside the report as the reproducible source unless it contains sensitive data. The builder writes Markdown, standalone HTML and a styled Flat OpenDocument Text file (`.fodt`).

## Required shape

```json
{
  "schemaVersion": 1,
  "report": {
    "title": "Delivery status report",
    "type": "Weekly status",
    "project": "Project name",
    "audience": "Client",
    "statusDate": "2026-09-03",
    "timezone": "Asia/Riyadh",
    "period": {
      "label": "Sprint 3",
      "start": "2026-08-23",
      "end": "2026-09-05"
    },
    "filename": "2026-09-03-weekly-status",
    "includeCover": true,
    "includeContents": true
  },
  "executiveSummary": ["One or two outcome-led paragraphs."],
  "sections": []
}
```

`schemaVersion`, `report.title`, `report.statusDate`, `report.timezone`, `report.audience`, and `sections` are required. Use ISO dates in the JSON. The prose may use the audience's preferred date format.

## Optional content

```json
{
  "branding": {
    "organization": "Delivery partner",
    "accent": "#5B34DA",
    "logo": "./logo.png"
  },
  "callouts": [
    {"label": "Delivery position", "text": "The release remains on plan.", "tone": "green"}
  ],
  "metrics": [
    {"value": "24", "label": "Stories completed", "detail": "During the period", "source": "Tracker query 123"}
  ],
  "sections": [
    {
      "title": "Progress this period",
      "subtitle": "Outcomes completed since the previous report",
      "paragraphs": ["Narrative paragraph."],
      "bullets": ["Outcome one", "Outcome two"],
      "tables": [
        {
          "title": "Completed work",
          "columns": ["ID", "Outcome", "Status"],
          "rows": [["S1", "A user can sign in", "Done"]]
        }
      ],
      "images": [
        {"path": "./evidence/tests.png", "alt": "Test result summary", "caption": "Build 123 passed 121 tests."}
      ]
    }
  ],
  "risks": [
    {
      "rating": "Amber",
      "item": "Pilot hardware",
      "impact": "Pilot evidence cannot complete without it.",
      "owner": "Client",
      "action": "Confirm delivery date.",
      "neededBy": "2026-09-10"
    }
  ],
  "evidence": [
    {
      "source": "CI pipeline",
      "statement": "Build 123 passed 121 of 121 tests.",
      "type": "Azure DevOps",
      "reference": "https://example.invalid/build/123",
      "asOf": "2026-09-03T08:00:00+03:00"
    }
  ]
}
```

Paths are resolved relative to the JSON file. Local images are embedded into the HTML so it remains portable. HTTP image URLs remain links and make the HTML dependent on network access, so prefer local evidence files.

Tone values are `green`, `amber`, `red`, `blue`, or `neutral`. Unknown values render as neutral.

## Optional A3 project-plan Gantt

Add a top-level `schedule` object when the report needs a one-page project plan with phase bands, task-level bars, milestone lines and a current-date line. Read [a3-gantt.md](a3-gantt.md) for the complete contract and validation rules.

The report builder then creates an additional standalone SVG and appends it as an A3 landscape page in HTML/PDF and FODT/DOCX. Keep the chart at the end of the report so the A4 body is unaffected.

## Optional A3 sprint delivery log

Add a top-level `sprintLog` object when the report needs story-level sprint detail. Read [sprint-log.md](sprint-log.md) for the data contract and validation rules.

The builder writes a second standalone SVG and appends it as an A3 landscape page after the Gantt. The log uses full-width sprint bands and columns for Sprint, Module, User Story or Task, Priority, Story Points, Assignee, Status and Notes.

## Runtime ladder

1. Run `build-report.mjs` with Node.js 18 or later. It has no package dependencies. The optional Gantt uses the same runtime.
2. For PDF, run `render-pdf.mjs`. It finds Chrome, Edge or Chromium, or uses `REPORT_BROWSER` when set.
3. For DOCX, pass the generated `.fodt` file to `render-docx.mjs`. It finds LibreOffice, or uses `REPORT_LIBREOFFICE` when set.
4. If Node.js is missing, use an available document tool with `assets/report-template.md`.
5. If no document tool exists, fill the Markdown template directly and explain which richer formats could not be rendered.

Do not install runtimes, browsers or office software without the user's approval.
