# House style

Skills live flat under `skills/<name>/`, each with a `SKILL.md` and an `agents/openai.yaml`. There are no buckets: this repo covers one domain, and a bucket layer over this focused set is furniture.

Every skill is either **user-invoked** (`disable-model-invocation: true` in the frontmatter, `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, a human-facing one-line description) or **model-invoked** (neither, and a description carrying its trigger branches). A skill is user-invoked in both harnesses or neither.

Every chain step is user-invoked. That is a deliberate cost: the human is the index and has to remember the order, which is what `ask-delivery` and the closing **Hand off** section of each skill are for. The reason is that every step publishes to a real tracker a client can see, and a chain step firing on its own inference would publish three hundred work items nobody asked for.

`backlog-audit` is the exception, and model-invoked because it writes nothing.

Dependencies between skills are expressed as an instruction to **call the Skill tool** with the named skill, never as a `../other-skill/FILE.md` cross-reference. This only works for model-invoked skills; where a step's precondition is a user-invoked skill, tell the human to run it.

Every skill closes with **Done when** (checkable completion criteria) and **Hand off** (the artifact it wrote and what to run next).

Every skill in `skills/` appears in the top-level `README.md`, linked to its `SKILL.md`, under the right invocation heading. `ask-delivery` is the router over all of them: a skill it never mentions, or a stale one it still routes to, is a router that lies. Re-read it whenever a skill is added, renamed or repositioned.

**No em-dashes anywhere in this repo's prose.** Where a sentence reaches for one, rewrite it with a comma, colon, period, parentheses, or a conjunction, whichever the sentence actually wants. Never do a blind character substitution.

Distribution is [skills.sh](https://skills.sh), which discovers `skills/<name>/SKILL.md` by walking the `skills/` directory. That flat layout is load-bearing: adding a bucket level still resolves, but a skill placed anywhere outside `skills/` is invisible without `--full-depth`. There is no manifest to maintain, so a new skill is published by committing it.

`name` and `description` are the two frontmatter fields the installer requires. A skill missing either is skipped silently at install time, which looks exactly like it was never added.

## What a skill prints

A skill's terminal output is a summary of decisions. It is never a copy of what the skill wrote. The file is on disk and the tracker is a click away, so pasting either back into the transcript costs the user a page of scrolling and tells them nothing the source would not.

So no skill instructs the agent to print a document body, a template it has just filled in, or a work item it has just created. Where the user has to approve something before it is written, the approval step states the **decisions**, one line each, in a table or a short list, and names the file about to be written. Where a step reports results, it reports counts first, then the specific items that need attention, capped, with the remainder as a number.

Review of a written file happens against the file, not against a transcript echo of it. It is easier to read there, and `git diff` is a better review surface than scrollback.

The test for any instruction that produces output: **could the user act on it without scrolling?** If not, it is a document, and a document belongs in a file.
