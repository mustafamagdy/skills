# Backlog conventions

Seed template for `docs/agents/backlog-conventions.md`. Adapt to the repo, then let every delivery skill read it as the single source of truth for what a good work item looks like here.

## Hierarchy codes

Every title carries its **hierarchy code**, then a separator, then a short action-shaped name. The code supplies lineage; the name never repeats the parent's words.

| Type | Form | Example |
|---|---|---|
| Epic | `E<n> · <name>` | `E1 · Backend Platform` |
| Feature | `F<n>.<m> · <name>` | `F1.6 · Session and Token Lifecycle` |
| Story | `S<n>.<m>.<k> · <name>` | `S1.6.2 · Issue single-use, short-lived payment tokens` |

The code is the chain's **identifier**. It is written into other items' bodies, into the register, and into the release plan, often before the referenced item exists on the tracker. A tracker-assigned number cannot do that job, and a raw `#417` in a body means nothing to a human and breaks silently when the board is rebuilt.

Epic numbers run in **dependency order**, not board order: what everything else needs comes first.

`S<n>.<m>.x` refers to the whole story set under feature `F<n>.<m>`, for when the specific sibling does not matter.

## Titles

A title states **what is done**, not who owns the screen. `Issue single-use, short-lived payment tokens`, not `A driver presents payment`. Titles are unique only within a parent, so look items up by code, never by name alone.

A Feature title never contains its Epic's name. The code already carries the lineage, and the repetition costs a third of the visible title width on every board.

## Story body

Five sections, in order, in the description field:

1. **Context**: the Feature it sits under, the requirement IDs it delivers, the personas involved, and the constraints that shape it. Cite sources inline (`BRD §7.2`), not in a pile at the end.
2. **User story**: As a … I want … so that ….
3. **Requirements**: concrete, buildable statements, each cited to where it comes from. Business and system-foundation level: what must be true, not the schema, the endpoint shapes or the mechanism, all of which go stale between writing and building.
4. **Business rules and validation**: the rules and constraints, cited.
5. **Dependencies**: prose naming siblings by hierarchy code (`Depends on S1.6.2. Feeds S4.4.1.`), **in addition to** the native blocking links, which stay the machine-readable truth.

**Acceptance criteria never appear in the body.** They belong in the acceptance criteria field, in `Given … when … then …` form. A body that carries them makes the field look empty and the story look unready.

## Granularity

A Feature decomposes into **several** stories, each separately demoable and separately able to fail. Target three to five.

A Feature holding one story is a signal that either the slicing is too coarse or the Feature is really a story. The specific failure to watch for is an **echo**: a story that restates its parent in different words. `F5.3 Wallet and Funding` echoing into *funds the wallet and reviews funding history* is one item wearing two hats. It becomes *see the balance and its ledger history* and *record a top-up and follow it to confirmation*.

Cover the whole feature, including the paths nobody demos: sign-out, cancellation, recovery, connectivity loss, deactivation, and the screen that tells the user what just happened.

## Estimates

Fibonacci (1, 2, 3, 5, 8) on every story in the committed scope. Points size the slice. They are **not** mapped to man-days: the moment they are, the team estimates the days and the scale stops measuring anything.

A story estimated above 8 is a story that has not been sliced yet. Send it back to `/groom-stories`.

## Tags

Tags are **parametric**: every tag is `Key:Value`, so the board is filterable along known dimensions instead of by string search.

| Dimension | Example | Source |
|---|---|---|
| `Product:` | `Product:Tazoud` | constant per repo |
| `Phase:` | `Phase:1` | scope agreement |
| `Milestone:` | `Milestone:M3` | the release plan |
| `Sprint:` | `Sprint:S3` | **derived from the iteration field** |
| `Channel:` | `Channel:Mobile` | the hierarchy code |
| `Module:` | `Module:Wallet` | the hierarchy code |
| `Persona:` | `Persona:Driver` | the hierarchy code |
| `MoSCoW:` | `MoSCoW:Must` | scope agreement |
| `Req:` | `Req:BE-12` | the register, zero or more |

Two rules keep this from rotting:

- **A tag that duplicates a native field is derived from it, never typed.** `Sprint:` mirrors the iteration field so the board can group by it, and it goes stale the moment somebody drags a card. Re-derive it on a schedule; do not hand-edit it.
- **A dimension's values cut across surfaces, not along them.** `Module:Wallet` covering the backend, the admin portal and the mobile app is what makes the dimension worth querying. Splitting it into `FleetWallet` and `OperatorWallet` gives you three tags that can never be asked one question.

## Areas

Where the tracker has an area or component field, keep the value set small and defend it. Split a story carrying substantial work in two areas into two stories and link the dependency. New area values need a reason, not a convenience.
