#!/usr/bin/env bash
set -eu

# ---------- PATH and installed Bun detection ----------
export PATH="${HOME:-/root}/.bun/bin:/usr/local/bin:$PATH"

if ! command -v bun >/dev/null 2>&1; then
  echo "📥 Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="${HOME:-/root}/.bun/bin:$PATH"
fi

# Ensure symlink in /usr/local/bin if writable
if [ -w /usr/local/bin ] && [ -x "${HOME:-/root}/.bun/bin/bun" ]; then
  ln -sf "${HOME:-/root}/.bun/bin/bun" /usr/local/bin/bun || true
fi

echo "✅ Bun ready: $(bun --version)"

# Ensure dependencies are installed
bun install

export PORT=3000
