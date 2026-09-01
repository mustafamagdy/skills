# Flat skill layout, no docs site

The reference implementation for this style (`mattpocock/skills`) organises skills into bucket folders and mirrors each promoted bucket into a published `docs/` tree. Both exist to solve problems this repo does not have: twenty-five skills across several unrelated domains, and a public site to publish them to.

This repo has nine skills covering one domain and no site. A bucket layer would be a directory every reader has to traverse to reach the only bucket, and a `docs/` tree would be a second copy of every skill to keep in sync with no reader on the other end. Both are dropped. `README.md` carries the routing a bucket `README.md` would, and `ask-delivery` carries the routing a docs tree would.

Adopted from the reference in full: the frontmatter and invocation split, the Skill-tool dependency convention, the `agents/openai.yaml` parity file, progressive disclosure behind context pointers, completion criteria per step, and the em-dash ban.
