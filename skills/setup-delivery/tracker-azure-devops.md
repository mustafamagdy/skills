# Delivery tracker: Azure DevOps Boards

Work items live in project `<PROJECT>` of organisation `<https://dev.azure.com/ORG>`.

## Shape

| | |
|---|---|
| **Levels** | Epic → Feature → User Story → Task. Native, four deep. |
| **Estimate** | `Microsoft.VSTS.Scheduling.StoryPoints` |
| **Iteration** | `System.IterationPath`, e.g. `<PROJECT>\Sprint 3`. Unset means backlog. |
| **Dependency** | Native link types. |
| **Tags** | `System.Tags`, free-form, semicolon separated. |

No degradation. Azure DevOps answers every capability natively, which makes it the reference implementation of this contract.

## Auth

`az login` against the correct tenant, then

```bash
az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 \
  --query accessToken -o tsv > /tmp/.adotok
```

The token is short-lived. **`az login` is interactive: a human runs it.** When a call returns HTML instead of JSON the token has expired; stop and ask for a refresh rather than falling back to a PAT or a different tenant.

The `az boards` CLI covers the common operations. The REST API (`api-version=7.1`) covers the rest, and is the only route for acceptance criteria, story points and link manipulation in bulk.

## Read

- **`fetch`**: `az boards work-item show --id <id> -o json`. Links need `?$expand=relations` on the REST call. **`$expand` and `fields` cannot be combined**; asking for both returns HTTP 400.
- **`list`**: WIQL. `az boards query --wiql "SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType]='User Story' AND [System.Tags] CONTAINS 'Module:Wallet'"`. Batch the resulting ids 100 at a time through `POST /wit/workitemsbatch`.
- **`children`**: WIQL on `[System.Parent] = <id>`.
- **`blockers`**: read `relations`, keep `System.LinkTypes.Dependency-Reverse`.

## Write

All writes are `PATCH /wit/workitems/<id>?api-version=7.1` with `Content-Type: application/json-patch+json`.

- **`create`**: `POST /wit/workitems/$<Type>`. Set the parent in the same call with a `System.LinkTypes.Hierarchy-Reverse` relation.
- **`update`**: `op: replace` on `/fields/System.Title` or `/fields/System.Description`. Acceptance criteria go to `/fields/Microsoft.VSTS.Common.AcceptanceCriteria`.
- **`reparent`**: remove the existing `Hierarchy-Reverse` relation by index, then add the new one.
- **`block`**: add a `System.LinkTypes.Dependency-Reverse` relation to the blocker (Predecessor). `-Forward` is Successor.
- **`estimate`**: `/fields/Microsoft.VSTS.Scheduling.StoryPoints`.
- **`schedule`**: `/fields/System.IterationPath`, full path including the project name.
- **`tag`**: `/fields/System.Tags`, semicolon separated. **`op: add` MERGES with the existing tag set. Use `op: replace` to actually replace it.** This is the single most expensive mistake on this tracker: an `add` intended as a replacement leaves every item carrying both the old and the new vocabulary, and it is invisible until somebody filters.
- **`comment`**: `POST /wit/workItems/<id>/comments?api-version=7.1-preview.3`.
- **`attach`**: `POST /wit/attachments`, then add an `AttachedFile` relation.

## Identity

- **`identifier`**: the hierarchy code in the title (`S1.6.2 · …`). The numeric work item id is the machine identifier for links and API calls.
- **`lookup`**: WIQL, `[System.Title] CONTAINS 'S1.6.2 ·'`. Index the whole board into a `title → id` map once at the start of a bulk run; the chain looks items up far too often to query per item.
