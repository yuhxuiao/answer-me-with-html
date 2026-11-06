#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v edge-tts >/dev/null 2>&1; then
  if command -v uv >/dev/null 2>&1; then
    uv tool install edge-tts || true
  elif command -v pip3 >/dev/null 2>&1; then
    pip3 install --user -q edge-tts || true
  fi
fi

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
