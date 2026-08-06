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
LOOP_HERO="$WORKDIR/loop-hero.mp4"
REEL_SD="$WORKDIR/reel-720p.mp4"
REEL_HD="$WORKDIR/reel-1080p.mp4"
REEL_4K="$WORKDIR/reel-2160p.mp4"

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

# 4K tier is conditional on the source actually being 4K — upscaling a
# 1080p source to 2160p would just waste storage/bandwidth on fake detail,
# not add real quality. Height (not width) is the check since footage can
# be shot either orientation.
SRC_HEIGHT="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$INPUT")"
HAS_4K=false
if [[ "$SRC_HEIGHT" -ge 2160 ]]; then
  HAS_4K=true
  echo "Source is ${SRC_HEIGHT}p — generating 2160p reel..." >&2
  ffmpeg -y -i "$INPUT" -vf "scale=-2:2160" -c:v libx264 -crf 21 -preset slow \
    -c:a aac -b:a 256k -movflags +faststart "$REEL_4K"

  # Hero-banner-only loop, at the same 2160p as the reel tier above — still
  # silent and still 6 seconds like the regular $LOOP, so it stays a small
  # clip, not a full-length download. This exists because the Works listing
  # page's hero (Hero.astro) autoplays a loop for every visitor on load —
  # upgrading ITS resolution is a reasonable, bounded cost; swapping it for
  # the actual multi-minute reel-with-audio would not be (see CLAUDE.md:
  # "any change that autoplays full reels in the grid is a regression" —
  # this loop is the deliberate middle ground, sharper without being that).
  echo "Generating 2160p hero loop..." >&2
  ffmpeg -y -i "$INPUT" -an -vf "scale=-2:2160" -c:v libx264 -crf 26 -preset veryslow \
    -movflags +faststart -t 6 "$LOOP_HERO"
else
  echo "Source is ${SRC_HEIGHT}p (<2160p) — skipping 4K rendition and hero loop." >&2
fi

PREFIX="projects/$SLUG"
echo "Uploading to R2 (site-media)..." >&2
wrangler r2 object put "site-media/$PREFIX/poster.jpg" --file "$POSTER"
wrangler r2 object put "site-media/$PREFIX/loop.mp4" --file "$LOOP"
wrangler r2 object put "site-media/$PREFIX/reel-720p.mp4" --file "$REEL_SD"
wrangler r2 object put "site-media/$PREFIX/reel-1080p.mp4" --file "$REEL_HD"
if [[ "$HAS_4K" == true ]]; then
  wrangler r2 object put "site-media/$PREFIX/reel-2160p.mp4" --file "$REEL_4K"
  wrangler r2 object put "site-media/$PREFIX/loop-hero.mp4" --file "$LOOP_HERO"
fi

PUBLISHED_AT="$(date -u +%Y-%m-%d)"
REEL_JSON="{ \"sd\": \"$PREFIX/reel-720p.mp4\", \"hd\": \"$PREFIX/reel-1080p.mp4\" }"
HERO_LOOP_JSON=""
if [[ "$HAS_4K" == true ]]; then
  REEL_JSON="{ \"sd\": \"$PREFIX/reel-720p.mp4\", \"hd\": \"$PREFIX/reel-1080p.mp4\", \"uhd\": \"$PREFIX/reel-2160p.mp4\" }"
  HERO_LOOP_JSON=",
  \"heroLoop\": \"$PREFIX/loop-hero.mp4\""
fi

cat <<JSON

Paste this entry into src/data/projects.json:

{
  "slug": "$SLUG",
  "category": "$CATEGORY",
  "title": { "pt": "TODO", "en": "TODO" },
  "poster": "$PREFIX/poster.jpg",
  "loop": "$PREFIX/loop.mp4",
  "reel": $REEL_JSON,
  "publishedAt": "$PUBLISHED_AT",
  "featured": false$HERO_LOOP_JSON
}
JSON
