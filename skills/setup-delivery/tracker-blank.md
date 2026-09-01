# Delivery tracker: <NAME>

Fill this in with the user, operation by operation, working from [CAPABILITIES.md](CAPABILITIES.md). An operation left blank becomes a guess three skills later, so answer every one, including the ones whose answer is `none`.

Where the tracker has both a CLI and an API, record the CLI form for single items and the API form for bulk. The chain does both, and a per-item CLI call across three hundred items is an afternoon.

## Shape

| | |
|---|---|
| **Levels** | |
| **Estimate** | |
| **Iteration** | |
| **Dependency** | |
| **Tags** | |

## Degradation

For each capability answered `none` above, the fallback. See the degradation table in `CAPABILITIES.md`.

## Auth

How a session authenticates, who runs it, what expiry looks like, and what to do instead of falling back to another credential.

## Read

- **`fetch`**:
- **`list`**:
- **`children`**:
- **`blockers`**:

## Write

- **`create`**:
- **`update`**:
- **`reparent`**:
- **`block`**:
- **`estimate`**:
- **`schedule`**:
- **`tag`**: (merge or replace? Prove it with the setup round trip.)
- **`comment`**:
- **`attach`**:

## Identity

- **`identifier`**:
- **`lookup`**:
