#!/usr/bin/env bash
set -euo pipefail

REMOTE_NAME="storybook"
REMOTE_URL="${1:-https://github.com/Teampara/StoryBook.git}"
TARGET_BRANCH="${2:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: run this script inside a git repository."
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

echo "Using remote '$REMOTE_NAME' -> $REMOTE_URL"
echo "Pushing branch '$CURRENT_BRANCH' to '$TARGET_BRANCH'..."

git push "$REMOTE_NAME" "$CURRENT_BRANCH:$TARGET_BRANCH"

echo
echo "Done. Repository content is now pushed to: $REMOTE_URL (branch: $TARGET_BRANCH)"
