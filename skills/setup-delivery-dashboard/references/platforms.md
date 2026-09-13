# Platform guidance

Verify current capabilities, plan limits, installed widgets, and permissions before using these patterns. These are starting points, not hard-coded project settings.

## Azure DevOps

Prefer `az boards` for source queries and `az devops invoke` for dashboard operations not covered by a dedicated command. Confirm organization, project, and team explicitly rather than trusting CLI defaults. Use native Query Tile counters, Sprint Burndown, Velocity, Code Tile, Build History, and Markdown links where available.

Team area filters can omit nested work even when project-wide queries find it. Check the intended area scope and iteration configuration before diagnosing empty analytics. Do not silently broaden a team chart to the entire project. Resolved can mean development complete while Closed means shipped; configure analytics and label totals according to the actual workflow.

Practical API lessons:

- Discover the supported preview version for the installed CLI. `az devops invoke` accepts versions differently from a raw REST URL; a previously working CLI value was `7.1-preview`.
- Markdown widget settings are the raw Markdown string. Many other widgets use a JSON-encoded settings string. Read a configured widget as the schema reference rather than guessing.
- Updates can require a fresh dashboard revision as well as widget data. Follow the endpoint's documented concurrency contract. A whole-dashboard layout update needs a fresh snapshot preserving every unrelated widget and setting.
- Native code counters may cap their display at `99+`. Keep that limitation visible; do not describe it as an exact total.

Sources: [widget catalog](https://learn.microsoft.com/en-us/azure/devops/report/dashboards/widget-catalog), [widget update API](https://learn.microsoft.com/en-us/rest/api/azure/devops/dashboard/widgets/update-widget?view=azure-devops-rest-7.1).

## GitHub

Use GitHub Projects views and Insights for status distribution and available historical burnup charts. Verify chart availability under the organization's plan and the project's fields. GitHub Projects is not an Azure-style widget canvas: a concise Project overview with saved views and links is a valid result. Use the supported API/CLI for fields and items, and the UI when chart configuration is not exposed.

Do not promise a native velocity report. With reliable completion history, use comparable period throughput or supported historical charts; otherwise report current scope and link to iteration views. A closed issue is not proof of production deployment. Keep repository commit graphs, Pulse, PRs, and Actions as linked code/build views. A personal profile contribution calendar is not a project contribution calendar.

Sources: [Projects Insights](https://docs.github.com/en/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project), [repository commit graphs](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/analyzing-changes-to-a-repositorys-content), [Pulse](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/using-pulse-to-view-a-summary-of-repository-activity).

## Jira

Inspect project type, board filter, sprint setup, status mappings, estimation settings, and available gadgets. Build saved JQL filters and a native dashboard with issue statistics, filter results, and useful available charts. Share filters consistently with the dashboard's intended audience, without broadening public access.

Use the board's native burndown, burnup, velocity, or cumulative flow reports as appropriate. Reports and dashboard gadgets are different surfaces: link to a report when it cannot be embedded natively. Sprint reports depend on board scope and configuration; Kanban teams need flow or throughput measures instead. Separate Done from released versions when the team does. Code and CI activity require an existing repository integration or direct source-platform links; do not invent Jira commit data or install an integration implicitly.

Sources: [Jira reports](https://support.atlassian.com/jira-software-cloud/docs/generate-a-report/), [burnup report](https://support.atlassian.com/jira-software-cloud/docs/what-is-the-burnup-report/).

## Other platforms

Map the same metric definitions to supported native views. Record unsupported panels and link to the source platform where practical. Keep local-only results as explicitly dated snapshots unless an actual refresh mechanism exists. Ask about a custom dashboard only if native options cannot meet a material user requirement.
