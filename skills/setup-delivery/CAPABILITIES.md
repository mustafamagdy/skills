# The capability contract

Every delivery skill talks to the tracker through **named operations**, never through a CLI command it invented. This file is the list of operations. `docs/agents/delivery-tracker.md` in each repo answers them for that repo's tracker.

A skill that needs to create a story looks up **`create`** and does what the repo's tracker doc says. It never guesses at `gh`, `az`, or a REST endpoint. That indirection is the whole reason the chain survives a tracker migration: the skills do not change, one file does.

## The shape questions

Answer these first. They decide how much the operations below have to work around.

| Question | Why the chain cares |
|---|---|
| **Levels** | How many hierarchy levels exist and what they are called. Three (Epic, Feature, Story) is the shape the chain assumes. |
| **Estimate** | The field holding a story point value, or `none`. |
| **Iteration** | Sprints, milestones, an iteration field, or `none`. |
| **Dependency** | Native blocking links, or `none`. |
| **Tags** | Free-form tags, fixed labels, or custom fields. |

## Degradation

A tracker missing a capability does not stop the chain. It changes where the information lives, and **the tracker doc decides where**, once, so every skill degrades the same way.

| Missing | Fallback the tracker doc must specify |
|---|---|
| A hierarchy level | Collapse Feature into a label on the Story, or use the tracker's grouping object (a GitHub milestone, a Jira epic link). Say which. |
| Estimates | A `Points:` line at the top of the body. |
| Iterations | A `Sprint:` label, or a milestone object. |
| Dependency links | A `Blocked by:` line at the top of the body, listing identifiers. |
| Tags | A `Tags:` line at the top of the body. |

A fallback written into the body is **not** as good as a native field: the tracker cannot filter, roll up, or warn on it. Say so to the user once, at setup, then stop mentioning it.

## Read operations

- **`fetch`** one item by identifier, with its body, fields, labels and links.
- **`list`** items, filtered by type, parent, label, iteration or state. The chain leans on this hard; make the filter syntax explicit.
- **`children`** of an item.
- **`blockers`** of an item, and whether each is closed.

## Write operations

- **`create`** an item of a given type, with a title, a body, and a parent.
- **`update`** an item's title or body.
- **`reparent`** an item under a different parent.
- **`block`** one item on another, the blocking edge.
- **`estimate`** an item.
- **`schedule`** an item into an iteration, or out of one and back to the backlog.
- **`tag`** an item. **State whether the operation replaces the tag set or merges into it.** Getting this wrong silently doubles every tag on the board, and it is the single most common tracker bug in this chain.
- **`comment`** on an item.
- **`attach`** a file to an item, or `none`.

## Identity

- **`identifier`**: what a skill writes down to refer to an item later, and how a human resolves it back. A tracker-assigned number is the obvious answer and it is a poor one on its own: the chain writes cross-references into bodies weeks before some of the referenced items exist.

  The chain's answer is a **hierarchy code** in the title (`S1.6.2`), assigned by `/shape-backlog` and `/groom-stories`, stable across renumbering, and readable by a human who has never opened the tracker. The tracker's own number stays the machine identifier for links and API calls. Record both conventions here.

- **`lookup`**: how to find an item by its hierarchy code. Usually a title prefix search. The chain calls this constantly, so make it a one-liner.

## Auth

State how a session authenticates, who runs it, and what happens when it expires. Where sign-in is interactive, say plainly that **a human runs it** and the agent stops and asks rather than falling back to a stored credential or a different account.
