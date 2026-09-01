# House style

Skills live flat under `skills/<name>/`, each with a `SKILL.md` and an `agents/openai.yaml`. There are no buckets: this repo covers one domain, and a bucket layer over nine skills is furniture.

Every skill is either **user-invoked** (`disable-model-invocation: true` in the frontmatter, `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, a human-facing one-line description) or **model-invoked** (neither, and a description carrying its trigger branches). A skill is user-invoked in both harnesses or neither.

Every chain step is user-invoked. That is a deliberate cost: the human is the index and has to remember the order, which is what `ask-delivery` and the closing **Hand off** section of each skill are for. The reason is that every step publishes to a real tracker a client can see, and a chain step firing on its own inference would publish three hundred work items nobody asked for.

`backlog-audit` is the exception, and model-invoked because it writes nothing.

Dependencies between skills are expressed as an instruction to **call the Skill tool** with the named skill, never as a `../other-skill/FILE.md` cross-reference. This only works for model-invoked skills; where a step's precondition is a user-invoked skill, tell the human to run it.

Every skill closes with **Done when** (checkable completion criteria) and **Hand off** (the artifact it wrote and what to run next).

Every skill in `skills/` appears in the top-level `README.md`, linked to its `SKILL.md`, under the right invocation heading. `ask-delivery` is the router over all of them: a skill it never mentions, or a stale one it still routes to, is a router that lies. Re-read it whenever a skill is added, renamed or repositioned.

**No em-dashes anywhere in this repo's prose.** Where a sentence reaches for one, rewrite it with a comma, colon, period, parentheses, or a conjunction, whichever the sentence actually wants. Never do a blind character substitution.

Run `scripts/link-skills.sh` after adding, removing or renaming a skill.
