# Delivery tracker: GitHub Issues

Work lives as GitHub issues in `<owner>/<repo>`, driven with the `gh` CLI. `gh` infers the repo inside a clone.

## Shape

| | |
|---|---|
| **Levels** | Two native (issue and sub-issue). **Degraded.** |
| **Estimate** | A Projects v2 number field, or degraded. |
| **Iteration** | A Projects v2 iteration field, or a milestone. |
| **Dependency** | Native issue dependencies. |
| **Tags** | Labels. Fixed set: a label must exist before it can be applied. |

## Degradation

- **Three levels into two.** The Epic is a `type:epic` labelled issue, the Feature is its sub-issue, and the Story is the Feature's sub-issue where sub-issue nesting is enabled. Where it is not, the Story carries its Feature in its hierarchy code and in a `Parent: F1.6` line, and only Epics and Features nest.
- **Estimates without a Project.** A `Points: 3` line as the first line of the body. Not filterable, not summable; say so once at setup.
- **Tags are a fixed vocabulary.** Parametric tags become labels that must be created first: `gh label create "Module:Wallet"`. `/shape-backlog` creates the dimension's labels before it publishes.

## Auth

`gh auth status`. Interactive sign-in is `gh auth login`, run by a human.

## Read

- **`fetch`**: `gh issue view <n> --json number,title,body,labels,milestone,comments`
- **`list`**: `gh issue list --state all --label "Module:Wallet" --json number,title,labels --limit 500`
- **`children`**: `gh api repos/{owner}/{repo}/issues/<n>/sub_issues`
- **`blockers`**: `gh api repos/{owner}/{repo}/issues/<n> --jq .issue_dependencies_summary.blocked_by` gives the count of **open** blockers, which is the live gate. The list itself is on the `dependencies/blocked_by` endpoint.

## Write

- **`create`**: `gh issue create --title "..." --body-file -`, heredoc the body.
- **`update`**: `gh issue edit <n> --title ... --body-file -`
- **`reparent`**: `gh api --method POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`. The **database id**, not the `#number`: `gh api repos/{owner}/{repo}/issues/<n> --jq .id`.
- **`block`**: `gh api --method POST repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by -F issue_id=<blocker-db-id>`. Database id again.
- **`estimate`**: `gh project item-edit` on the points field, or the `Points:` body line.
- **`schedule`**: `gh issue edit <n> --milestone "Sprint 3"`, or the Projects iteration field.
- **`tag`**: `gh issue edit <n> --add-label "..." --remove-label "..."`. **Adds merge.** To replace a dimension, remove the old label explicitly in the same call.
- **`comment`**: `gh issue comment <n> --body "..."`
- **`attach`**: none. Upload through the web UI and paste the URL into a comment.

## Identity

- **`identifier`**: the hierarchy code in the title. The issue number is the machine identifier, and note that GitHub shares one number space between issues and pull requests.
- **`lookup`**: `gh issue list --search "S1.6.2 in:title" --json number,title`
