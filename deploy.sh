#!/usr/bin/env bash
# One-shot: verify, commit, push to GitHub, deploy to Vercel, print the live URL.
#
#   bash deploy.sh          # full run (asks before committing)
#   bash deploy.sh --yes    # full run, commit without the prompt
#   bash deploy.sh --dry    # run every gate, show staged files, change nothing
#
# Deliberately refuses to deploy if any gate fails. A green local state is the
# precondition for shipping; see README.md for what each gate covers.

set -euo pipefail
cd "$(dirname "$0")"

DRY=0
AUTO=0
for arg in "$@"; do
  case "$arg" in
    --dry) DRY=1 ;;
    --yes) AUTO=1 ;;
    *) printf 'Unknown argument: %s\n' "$arg" >&2; exit 2 ;;
  esac
done

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
fail() { printf '\033[31m%s\033[0m\n' "$1" >&2; exit 1; }
ok()   { printf '  \033[32m%s\033[0m\n' "$1"; }

# ---------------------------------------------------------------- preflight
bold "Preflight"
command -v git >/dev/null || fail "git not found"
command -v node >/dev/null || fail "node not found"
command -v npm >/dev/null || fail "npm not found"
command -v curl >/dev/null || fail "curl not found"
[[ -d app/node_modules ]] || fail "app/node_modules missing — run: cd app && npm ci"
[[ -f app/package-lock.json ]] || fail "app/package-lock.json missing"
[[ -f app/index.html ]] || fail "app/index.html missing"
[[ -f vercel.json ]] || fail "root vercel.json missing"
ok "git $(git --version | awk '{print $3}')"
ok "node $(node --version)"
ok "config present"

# Make sure .vercel/ cannot be committed even if gitignore was bypassed.
if grep -qE '^\.vercel/?$' .gitignore 2>/dev/null; then
  ok ".vercel is gitignored"
elif [[ -d .vercel ]]; then
  fail ".vercel/ exists but is not in .gitignore — add it before committing"
else
  fail ".vercel is NOT in .gitignore — add '.vercel/' before committing"
fi

# ------------------------------------------------------------------- gates
bold "Gates"
echo "  running unit tests…"
( cd app && npm test ) || fail "unit tests FAILED — refusing to deploy"

echo "  building the prerendered app…"
( cd app && npm run build ) || fail "build FAILED — refusing to deploy"

grep -q "2 kg ice cubes" app/dist/index.html || fail "prerender missing product copy"
grep -q "R17" app/dist/index.html || fail "prerender missing prices"
if grep -q "app-html" app/dist/index.html; then
  fail "prerender marker still present"
fi
ok "prerender contains product copy and prices"

QA="$HOME/.config/opencode/design-intelligence/browser/qa.mjs"
[[ -f "$QA" ]] || fail "QA harness missing: $QA"

TMP="$(mktemp -d)"
PREVIEW_PID=""
cleanup() {
  if [[ -n "$PREVIEW_PID" ]]; then
    kill "$PREVIEW_PID" 2>/dev/null || true
    wait "$PREVIEW_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

echo "  starting preview on 127.0.0.1:4174…"
( cd app && exec ./node_modules/.bin/vite preview --host 127.0.0.1 --port 4174 >"$TMP/preview.log" 2>&1 ) &
PREVIEW_PID=$!

for _ in $(seq 1 40); do
  curl -sf http://127.0.0.1:4174/ >/dev/null 2>&1 && break
  sleep 0.5
done
curl -sf http://127.0.0.1:4174/ >/dev/null 2>&1 || {
  cat "$TMP/preview.log" >&2 || true
  fail "preview server did not start"
}

for spec in "320:" "390:" "1440:" "390:--reduced-motion"; do
  width="${spec%%:*}"
  extra="${spec#*:}"
  name="$width${extra:+$extra}"
  echo "  QA ${width}px ${extra:-default}…"
  node "$QA" http://127.0.0.1:4174/ --width "$width" $extra \
    --scroll-through --out "$TMP/$name.png" --json "$TMP/$name.json" \
    >"$TMP/$name.log" 2>&1 || {
      cat "$TMP/$name.log" >&2
      fail "QA run failed: ${width}px ${extra:-default}"
    }
  node -e '
    const fs = require("fs");
    const d = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const problems = {
      findings: d.findings || [],
      consoleErrors: d.consoleErrors || [],
      failedRequests: d.failedRequests || [],
    };
    if (problems.findings.length || problems.consoleErrors.length || problems.failedRequests.length) {
      console.error(JSON.stringify(problems, null, 2));
      process.exit(1);
    }
  ' "$TMP/$name.json" || fail "QA findings at ${width}px ${extra:-default}"
done
ok "QA 320/390/1440 + reduced motion clean"

# --------------------------------------------------------------- git commit
bold "Changes"
git add -A
if git diff --cached --quiet; then
  ok "nothing staged — tree already matches HEAD"
else
  echo "  files to be committed:"
  git diff --cached --name-status | awk '{printf "    %-3s %s\n", $1, $2}'
  echo
  if [[ $DRY -eq 1 ]]; then
    bold "Dry run — stopping before commit, push, and deploy."
    exit 0
  fi
  if [[ $AUTO -eq 1 ]]; then
    git commit -q -m "${COMMIT_MSG:-Migrate storefront to React/Tailwind}"
    ok "committed $(git rev-parse --short HEAD)"
  else
    read -r -p "  Commit these? [y/N] " reply
    [[ "$reply" =~ ^[Yy]$ ]] || fail "aborted by user"
    git commit -q -m "${COMMIT_MSG:-Migrate storefront to React/Tailwind}"
    ok "committed $(git rev-parse --short HEAD)"
  fi
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
printf '    curl -sI %s/assets/reel/frame-030.webp | head -1\n' "$URL"
