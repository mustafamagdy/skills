# A worked story

Two examples: the cut, then the write-up. The domain is a closed-loop fleet fuel payment platform, kept concrete on purpose.

## The cut

**Feature:** `F1.6 · Session and Token Lifecycle`

An echo, which is what one story under this Feature looks like:

> `S1.6.1 · Manage payment session and token lifecycle`
> *As the platform, I want to manage sessions and tokens, so that payments are secure.*

Nothing is demoable, nothing can fail alone, and the estimate is a shrug. Say it next to the Feature title and it is the same sentence twice.

The slices:

| Code | Title | Points |
|---|---|---|
| `S1.6.1` | Open a fuelling session against a verified vehicle | 3 |
| `S1.6.2` | Issue single-use, short-lived payment tokens | 3 |
| `S1.6.3` | Redeem a token exactly once and close the session | 5 |
| `S1.6.4` | Expire an abandoned session and release its hold | 2 |
| `S1.6.5` | Cancel a session in flight and tell the driver | 2 |

The first three came from the register. The last two came from the unhappy-path sweep, and neither was in the source document: the BRD described sessions being used, not sessions being abandoned or stopped. `S1.6.5` reached the client as a change request.

## The write-up

Title: `S1.6.2 · Issue single-use, short-lived payment tokens`

### Body

> **Context**
>
> Sits under `F1.6 · Session and Token Lifecycle` in `E1 · Backend Platform`, and delivers `BE-08` and `BE-09`. The token is what a driver presents at the forecourt and what the attendant's device reads, so it crosses the trust boundary between the platform and a merchant device that the platform does not control (BRD §7.2). Both the Driver App and the Attendant App consume it.
>
> **User story**
>
> As a driver with an open fuelling session, I want a payment token that works once and expires quickly, so that a screenshot of my phone cannot be used to fuel somebody else's vehicle.
>
> **Requirements**
>
> - A token is issued only against a session that is open and belongs to the requesting driver (BRD §7.2).
> - A token carries a short validity window, configurable per tenant, defaulting to five minutes (BRD §7.2).
> - A token is bound to the session, the vehicle and the merchant it was issued for, and is refused anywhere else.
> - Issuing a second token for a session invalidates the first.
> - A token is presented as a scannable code and readable without a network connection on the presenting device (BRD §9.1).
>
> **Business rules and validation**
>
> - Expiry is evaluated against server time, never the presenting device's clock.
> - A refusal states which condition failed to the attendant, and states nothing about other tenants' data.
> - Issuance is recorded in the audit log with the actor, the session and the time (BRD §7.4, `BE-12`).
>
> **Dependencies**
>
> Depends on `S1.6.1`. Feeds `S1.6.3` and `S4.4.x`.

Note what is absent: no table schema, no endpoint path, no field names, no library. Every one of those would be a guess about a codebase that does not exist yet, and each one would be wrong by the time somebody picked the story up. What the body pins down is what must be **true**, which does not go stale.

### Acceptance criteria

In the acceptance criteria field, never in the body:

> - Given an open session, when the driver requests a token, then a scannable single-use token valid for the tenant's configured window is returned.
> - Given a token that has been redeemed, when it is presented again, then it is refused and the refusal names the reason.
> - Given a token past its validity window, when it is presented, then it is refused regardless of the presenting device's clock.
> - Given a token issued for merchant A, when it is presented at merchant B, then it is refused.
> - Given a session with an outstanding token, when a second token is requested, then the first is invalidated and the second is returned.

Five criteria against five requirements. The refusal paths outnumber the success path, which is normal for anything on a trust boundary and is the shape to expect.

### Fields

| | |
|---|---|
| Points | 3 |
| Tags | `Module:Authorisation`, `Persona:Driver`, `Channel:Backend`, `MoSCoW:Must`, `Req:BE-08`, `Req:BE-09` |
| Iteration | backlog |
