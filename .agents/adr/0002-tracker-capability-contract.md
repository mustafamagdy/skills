# Tracker access goes through a capability contract

The chain has to run on whatever tracker a client already pays for: Azure DevOps on one engagement, GitHub Issues on the next, a folder of markdown on a prototype. Writing tracker commands into the skills would mean nine skills to rewrite per tracker, and in practice would mean the skills silently assuming whichever tracker they were written against.

So the skills call **named operations** (`create`, `block`, `estimate`, `schedule`, `tag`, …) and never a CLI. `setup-delivery` answers those operations once per repo in `docs/agents/delivery-tracker.md`. Swapping tracker rewrites one file.

The awkward part is that trackers differ in **capability**, not just syntax: GitHub Issues has two hierarchy levels where Azure DevOps has four, and local markdown has no notion of an estimate field. Rather than let each skill improvise, the contract carries a degradation table fixing the fallback for each missing capability, so a Feature collapsed into a label or an estimate written into the body happens the same way everywhere, decided once at setup.

The contract also forces one behavioural question that documentation reliably gets wrong: whether `tag` replaces or merges. Setup proves it with a round trip on a throwaway item, because getting it backwards doubles every tag on the board invisibly.
