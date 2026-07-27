#!/usr/bin/env bash
#
# Turns one finished, already-edited video into the poster/loop/reel assets
# the site needs, uploads them to the site-media R2 bucket, and prints a
# JSON object shaped like one src/data/projects.json entry.
#
# This IS the CMS: run the script, paste the printed JSON into
# src/data/projects.json, commit. There is no other ingestion path.
#
# Usage:
#   ./scripts/ingest.sh --input path/to/final.mp4 --slug my-project --category real-estate
#
# Assumes --input is a single, already-edited finished video (not raw,
# multi-clip footage needing trimming/concatenation first).
set -euo pipefail

INPUT=""
SLUG=""
CATEGORY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input) INPUT="$2"; shift 2 ;;
    --slug) SLUG="$2"; shift 2 ;;
    --category) CATEGORY="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$INPUT" || -z "$SLUG" || -z "$CATEGORY" ]]; then
  echo "Usage: $0 --input path/to/final.mp4 --slug my-project --category real-estate" >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Input file not found: $INPUT" >&2
  exit 1
fi

for bin in ffmpeg wrangler; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Required tool not found on PATH: $bin" >&2
    exit 1
  fi
done

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

POSTER="$WORKDIR/poster.jpg"
LOOP="$WORKDIR/loop.mp4"
REEL_SD="$WORKDIR/reel-720p.mp4"
REEL_HD="$WORKDIR/reel-1080p.mp4"

echo "Extracting poster frame..." >&2
ffmpeg -y -ss 1 -i "$INPUT" -frames:v 1 -q:v 2 "$POSTER"

echo "Generating silent loop..." >&2
ffmpeg -y -i "$INPUT" -an -vf "scale=480:-2" -c:v libx264 -crf 28 -preset veryslow \
  -movflags +faststart -t 6 "$LOOP"

# CRF 21 is a starting placeholder (open task 8 in CLAUDE.md) — coastal
# material (water texture, foliage at altitude) may band at this value and
# need tuning against real footage.
echo "Generating 720p reel..." >&2
ffmpeg -y -i "$INPUT" -vf "scale=-2:720" -c:v libx264 -crf 21 -preset slow \
  -c:a aac -b:a 128k -movflags +faststart "$REEL_SD"

echo "Generating 1080p reel..." >&2
ffmpeg -y -i "$INPUT" -vf "scale=-2:1080" -c:v libx264 -crf 21 -preset slow \
  -c:a aac -b:a 192k -movflags +faststart "$REEL_HD"

PREFIX="projects/$SLUG"
echo "Uploading to R2 (site-media)..." >&2
wrangler r2 object put "site-media/$PREFIX/poster.jpg" --file "$POSTER"
wrangler r2 object put "site-media/$PREFIX/loop.mp4" --file "$LOOP"
wrangler r2 object put "site-media/$PREFIX/reel-720p.mp4" --file "$REEL_SD"
wrangler r2 object put "site-media/$PREFIX/reel-1080p.mp4" --file "$REEL_HD"

PUBLISHED_AT="$(date -u +%Y-%m-%d)"

cat <<JSON

Paste this entry into src/data/projects.json:

{
  "slug": "$SLUG",
  "category": "$CATEGORY",
  "title": { "pt": "TODO", "en": "TODO" },
  "poster": "$PREFIX/poster.jpg",
  "loop": "$PREFIX/loop.mp4",
  "reel": { "sd": "$PREFIX/reel-720p.mp4", "hd": "$PREFIX/reel-1080p.mp4" },
  "publishedAt": "$PUBLISHED_AT",
  "featured": false
}
JSON
