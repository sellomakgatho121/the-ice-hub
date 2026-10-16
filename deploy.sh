#!/usr/bin/env bash
# One-shot: verify, push to GitHub, deploy to Vercel, print the live URL.
#
#   bash deploy.sh          # full run
#   bash deploy.sh --dry    # run the gates and show the diff, change nothing
#
# Deliberately refuses to deploy if any gate fails. A green local state is the
# precondition for shipping; see README.md for what each gate covers.

set -euo pipefail
cd "$(dirname "$0")"

DRY=0
[[ "${1:-}" == "--dry" ]] && DRY=1

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
fail() { printf '\033[31m%s\033[0m\n' "$1" >&2; exit 1; }
ok()   { printf '  \033[32m%s\033[0m\n' "$1"; }

# ---------------------------------------------------------------- preflight
bold "Preflight"
command -v git >/dev/null || fail "git not found"
command -v node >/dev/null || fail "node not found"
[[ -d site/node_modules ]] || fail "site/node_modules missing — run: cd site && npm install"
[[ -f site/vercel.json ]]  || fail "site/vercel.json missing"
[[ -f vercel.json ]]       || fail "root vercel.json missing"
ok "git $(git --version | awk '{print $3}')"
ok "node $(node --version)"
ok "config present"

# Make sure .vercel/ cannot be committed even if gitignore was bypassed.
# `git check-ignore .vercel` cannot be used here: it only matches paths that
# exist on disk, and .vercel/ is absent until `vercel link` runs — so the check
# fails exactly when the directory is missing. grep the rule instead.
if grep -qE '^\.vercel/?$' .gitignore 2>/dev/null; then
  ok ".vercel is gitignored"
elif [[ -d .vercel ]]; then
  fail ".vercel/ exists but is not in .gitignore — add it before committing"
else
  fail ".vercel is NOT in .gitignore — add '.vercel/' before committing"
fi

# ------------------------------------------------------------------- gates
bold "Gates"
echo "  running host gate (unit + contrast)…"
( cd site && npm run verify:host ) || fail "host gate FAILED — refusing to deploy"

if [[ -f /root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-linux/headless_shell ]]; then
  echo "  running browser gate (Playwright + axe)…"
  echo "  (needs a local server on :8000 — start one in another terminal if this hangs)"
  ( cd site && node scripts/verify.mjs >/tmp/verify-deploy.json 2>/tmp/verify-deploy.err ) \
    || { tail -20 /tmp/verify-deploy.err >&2; fail "browser gate FAILED — refusing to deploy"; }
  node -e '
    const d = require("/tmp/verify-deploy.json");
    const f = d.steps.filter(s => !s.ok);
    console.log(`  browser gate: ${d.steps.length - f.length}/${d.steps.length} passing, ${d.errors.length} runtime errors`);
    if (f.length) { console.error("  failing:", f.map(s => s.name).join("; ")); process.exit(1); }
  ' || fail "browser gate reported failures"
else
  echo "  browser gate SKIPPED — no Chromium on this host."
  echo "  It has passed here before, but treat this run as unverified."
fi

# --------------------------------------------------------------- git commit
bold "Changes"
git add -A
if git diff --cached --quiet; then
  ok "nothing staged — tree already matches HEAD"
else
  echo "  files to be committed:"
  git diff --cached --name-status | awk '{printf "    %-3s %s\n", $1, $2}'
  echo
  echo "  Read this list. Anything unexpected here is going to the public repo."
  read -r -p "  Commit these? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || fail "aborted by user"
  git commit -q -m "${COMMIT_MSG:-Redesign: product hero reel, token system, WhatsApp ordering}"
  ok "committed $(git rev-parse --short HEAD)"
fi

if [[ $DRY -eq 1 ]]; then
  bold "Dry run — stopping before push and deploy."
  git log --oneline -1 | sed 's/^/  /'
  exit 0
fi

# -------------------------------------------------------------------- push
bold "Push"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git push -u origin "$BRANCH" || fail "push failed — authenticate with: gh auth login"
ok "pushed to origin/$BRANCH"

# ------------------------------------------------------------------ deploy
bold "Deploy"
npx --yes vercel@latest --version >/dev/null 2>&1 || true

if [[ ! -d .vercel ]]; then
  echo "  no Vercel project linked yet — 'vercel link' will ask which to use."
  echo "  (press 's' to create a new project, or choose an existing one)"
  npx --yes vercel@latest link || fail "vercel link failed"
fi

echo "  deploying to production…"
OUT="$(npx --yes vercel@latest --prod --yes 2>&1)" || { echo "$OUT"; fail "deploy failed"; }
echo "$OUT" | sed 's/^/    /'

URL="$(printf '%s' "$OUT" | grep -oE 'https://[A-Za-z0-9.-]+\.vercel\.app' | tail -1)"
if [[ -z "$URL" ]]; then
  bold "Deployed, but I could not parse the URL from the output above."
  exit 0
fi

bold "Live"
printf '  %s\n\n' "$URL"
printf '  %s\n' "Run these against the live site before you trust it:"
printf '    curl -sI %s | head -1\n' "$URL"
printf '    curl -s  %s/icons.svg | grep -c "<symbol"   # expect 16\n' "$URL"
printf '    curl -sI %s/assets/reel/frame-048.webp | head -1\n' "$URL"