# Neko Circuit engine

The automation behind the Neko Circuit event calendar: find events, verify them, make
cards, host the images, and schedule the posts. This folder lives in the same public repo
as the website code (the repo root is the site backup; nothing here affects the live site).

| Path | What it is |
|---|---|
| `scripts/events.py` | The event store CLI (`list`, `add`, `set`, `review`, `expire`, `due`, `plan`, `scorecard`). `due --strict` exits 1 when a verified event within 21 days has no post. No AI. |
| `data/events.csv` | One row per event. Copied from the private working repo for now (one-way). |
| `cards/make_cards.py` | Generates the 4 files per event (square, story, reel, TikTok) from a CSV. Fonts and base template included. Music is not (licensed per track, kept out of git). |
| `tools/add_metricool_rows.py` | Turns a small JSON plan into Metricool CSV rows and refuses unhosted images, past dates, empty captions and em dashes. |
| `tools/validate_metricool_csv.py` | Guard run before every Metricool import. |
| `plans/` | Per-event post plans (dates, times, captions). |
| `../media/social/` | Published to GitHub Pages by `.github/workflows/pages.yml`. Only this folder is public-hosted. |

## Hosting images
Anything pushed to `media/` is served at `https://jamar16.github.io/neko-circuit/social/<file>`.
Use that URL base when building rows:

    NEKO_MEDIA_BASE=https://jamar16.github.io/neko-circuit/social/ \
      python3 engine/tools/add_metricool_rows.py engine/plans/youmacon-2026-posts.json

Check a hosted file with `curl -s -o /dev/null -w '%{http_code}' URL` (not `curl -I`).
GitHub's terms say Pages is not for running an online business; treat it as the starting
point and move media to a bucket (e.g. Cloudflare R2) if the project grows. Only the
base URL changes.

## Scheduled checks
`.github/workflows/engine-daily.yml` runs daily at an odd minute. It fails, and GitHub
emails the owner, when a verified event has no scheduled post. A weekly heartbeat commit
stops GitHub from disabling the schedule after 60 days of inactivity.

## Rules
- Only verified events get cards or posts (the organizer's own site is the source of truth).
- No secrets in this repo. Tokens go in GitHub Secrets.
- Every tool is a documented CLI, idempotent, no AI unless noted.
