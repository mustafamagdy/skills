#!/usr/bin/env bash
# Symlink every skill in this repo into the local harness skill directories.
# Re-run after adding, removing or renaming a skill. A git pull then keeps them current.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGETS=("$HOME/.claude/skills" "$HOME/.agents/skills")

for target in "${TARGETS[@]}"; do
  mkdir -p "$target"
  for skill in "$REPO"/skills/*/; do
    skill="${skill%/}"
    link="$target/$(basename "$skill")"
    if [ -e "$link" ] && [ ! -L "$link" ]; then
      echo "skip $link (real directory, not a symlink)"
      continue
    fi
    ln -sfn "$skill" "$link"
    echo "link $link -> $skill"
  done
done
