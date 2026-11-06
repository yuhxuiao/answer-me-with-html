#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run build

for dest in \
  "$HOME/.agents/skills/answer-me-with-html" \
  "$HOME/.gemini/config/plugins/answer-me-with-html/skills/answer-me-with-html" \
  "/mnt/c/Users/Administrator/.agents/skills/answer-me-with-html" \
  "/mnt/c/Users/Administrator/.gemini/config/plugins/answer-me-with-html/skills/answer-me-with-html"; do
  if [ -d "$dest" ]; then
    cp -r "$ROOT_DIR/skills/answer-me-with-html/"* "$dest/"
    echo "Synced v$(node "$dest/scripts/am.mjs" --version) -> $dest"
  fi
done
