# Neko Circuit runbook and city playbook (draft, 2026-10-25)

Goal: one weekly loop that takes ~1 hour, every link in it works, and the same loop runs for
a new city by adding one config folder, not by rewriting tools.

## 1. The weekly loop (Detroit today; same loop for any city)

| Day | Step | Command / action | Time | Automatic? |
|---|---|---|---|---|
| Mon | Scan finds leads | cron: `event-scan.sh` -> `events.py` store | 0 | yes |
| Mon | Verify leads at the organizer | `events.py review` (y/n/e/s) | 20 min | you |
| Mon | Look 30 days ahead | `events.py plan --days 30` and `events.py due` | 2 min | you |
| Tue | Cards for new verified events | `make_cards.py` from a CSV, then push `media/social/` | 15 min | you |
| Tue | Posts | write plan JSON, run `add_metricool_rows.py` (checks links, marks `scheduled`) | 10 min | you |
| Tue | Import | upload the Metricool CSV by hand, spot-check 2 posts | 10 min | you |
| Daily | Alarm | GitHub `engine-daily.yml` emails only if a gap exists | 0 | yes |
| After event | Close out | `events.py expire` (target: also auto-set `posted`) | 2 min | you |

Rule: an event reaches Metricool only if it is `verified` (organizer's own page confirms date and venue).

## 2. Link rules (so nothing is broken or fake)

Every event needs three links and each must return HTTP 200 before it is used:
1. `organizer_url`: the organizer's own page (venue, convention site, ticket page). Not a news
   repost. Eventbrite/Posh/start.gg are acceptable only if the organizer's own listing, because
   those are the ticket page fans actually use.
2. Media URL (card): already checked by `add_metricool_rows.py` (refuses non-200).
3. Caption link: `dateanime.com` (our page) plus the organizer link. Never an IG-only link.
Instagram-only sources (Born Otaku, The Strays, Glotaku): log a date only if visible on their post;
the `organizer_url` is the IG post/Linktree and the row is marked `social-only` in notes.

Build next: `check_links.py` (CLI, idempotent): checks organizer_url + media URLs for every upcoming
event, prints a table, exits 1 on any failure. Run it in the weekly loop and in the daily GitHub check.

## 3. Where legitimate events come from (per-city source registry)

Rank sources by trust. Each city keeps its own list with last-checked dates:
| Tier | Source type | Trust | Examples (Detroit) |
|---|---|---|---|
| A | Organizer's own site/ticket page | confirm dates here | youmacon.com, motorcitycomiccon, gottagacha.com |
| B | Local aggregators | discovery only, confirm at tier A | MI Geek Scene, animecons.com |
| C | Ticket platforms | discovery + ticket link | Eventbrite, Posh, RA, start.gg |
| D | Social-only organizers | check by hand, log only visible dates | @born_otaku77, @thestraysdetroit, @glotakuparty |
| E | Communities | leads only | r/Detroit, r/Michigan, r/smashbros, campus clubs |

## 4. City pack (how a new city is added)

Today Detroit is hard-coded in: scan prompt `modes/scan.md`, card watermark and kicker in
`cards/make_cards.py`, hashtag block in `tools/validate_metricool_csv.py`, and the skill text.
Refactor once, then every city is a folder:

```
cities/detroit/city.json
cities/detroit/sources.md
cities/columbus/...
```
`city.json` fields: `slug`, `name`, `state`, `radius_miles`, `watermark`, `kicker`,
`hashtags` (the required block), `media_base`, `scan_sources` (path to sources.md),
`local_orgs` (the social-only list), `timezone`, `post_times`.
`events.csv` gets one new column, `market` (city slug), so one store serves all cities and
`events.py list --market columbus` filters.

Launch checklist for a new city (target 1 session):
1. Copy `cities/detroit` -> `cities/<slug>`; fill `city.json`.
2. Research 10 tier A/B sources and 3 social-only organizers; fill `sources.md`; confirm with a manual search.
3. Seed 5 verified events by hand (proves the loop; seed CSV through `events.py import-csv`).
4. Generate cards with that city's watermark and hashtags; push media; run `check_links.py`.
5. Run `add_metricool_rows.py` with the plan; import; confirm in Metricool.
6. Add the city's weekly scan to `~/tools/crontab.txt` (cron is code), commit.
7. Success measure for the first 30 days: events verified, posts scheduled, link failures = 0, plus
   the metrics tracker numbers already in `metrics-tracker.md`.

## 5. Build order (smallest steps first)
1. `check_links.py` (stops broken-link posts).  2. `sync-engine` command (private store -> engine copy).
3. Auto-close: set `posted` then `past` after the event date.  4. City pack refactor.
5. Second city pilot. Keep Metricool import manual until volume justifies it.
