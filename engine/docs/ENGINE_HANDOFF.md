# Engine session handoff (written 2026-10-25 from the Coursework session)

Start this session in `~/neko-circuit-engine` (repo `jamar16/neko-circuit`, public).
Read `engine/README.md` first. Do not widen sandbox access; work only in this folder.

## Why the daily GitHub email was failing
`.github/workflows/engine-daily.yml` runs `python3 engine/scripts/events.py due --strict`
every day (12:23 UTC). `--strict` exits 1 when a `verified` or `carded` event within 21 days
has no post scheduled. Youmacon (2026-10-29) was still `carded` in the store even though its
4 posts were already in the Metricool CSV. The store never learns about Metricool by itself.
The "5 leads waiting more than 7 days" list is only a warning and never fails the run.
It counts from each lead's `added` date in events.csv, not from the last upload.

## Already done (uncommitted, nothing pushed)
1. `engine/data/events.csv`: `youmacon-2026-10-29` set to `status=scheduled`,
   `scheduled_on=2026-10-22` (the day the 4 Youmacon rows were added to the live Metricool CSV,
   commit f0f6fe3 in the private repo). Same change made in the private store
   `~/Neko-Circuit/Active-Project/data/events.csv`, which is the source of truth.
2. `engine/tools/add_metricool_rows.py`: after writing rows (or finding them already present),
   moves the event whose `card_slug` equals the plan slug from verified/carded to scheduled.
   New flags: `--events PATH`, `--no-mark`. Marks the event before returning the validator's exit code.
   Tested on temp copies only: flips to scheduled, second run is a no-op.
3. Local `due --strict` now reports 0 gaps and exits 0.

## To do, in order
1. `git diff` and review. Commit only `engine/data/events.csv` and `engine/tools/add_metricool_rows.py`.
   Do NOT stage `.env.example` (it has an unrelated local edit; look at it, and never commit real values).
   Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
2. Ask the user before `git push` (public repo, outward-facing). Never push to any `upstream`.
3. After the push, run the workflow once by hand and confirm it goes green:
   `gh workflow run "Engine daily check" && gh run list --limit 3` (user may need to run gh with `!`;
   the sandbox cannot read the gh keyring login).
4. Run `python3 engine/scripts/events.py expire` to roll past events forward (Anime Rave Halloween
   was Oct 23 and is still `carded`). Review the diff before committing.
5. Update `engine/README.md`: mention that add_metricool_rows.py marks events scheduled.
6. Housekeeping the user may want: archive the stale Oct 23 row in the live Metricool CSV
   (validator flags it), and set `NEKO_MEDIA_BASE=https://jamar16.github.io/neko-circuit/social/`
   when running the tool (its built-in default is still `https://dateanime.com/social/`).
7. Leads still unreviewed (the user must verify each at the organizer's own site, then
   `events.py review`): Detroit Retro Gaming Show (Nov 7), Grand Rapids Comic Con, Motor City Comic Con
   Fall, U-Con (all Nov 13), IsshoCon 2027 (Jan 29).

## Known gaps in the automation (candidates for the next tool, one at a time)
- private store -> engine copy of events.csv is a manual one-way copy.
- Importing the Metricool CSV into Metricool is manual (as far as the repo shows).
- `scheduled` -> `posted` is never set automatically. Youmacon posts go out Oct 23/25/27/29;
  after Oct 29 the event should become `posted`, then `past`.
- The old private remote `neko-circuit-business-` is retired (the user said so); the private repo
  is 19 commits ahead of it with uncommitted edits. Do not push there unless the user decides to.

## Repos at a glance
- `~/Neko-Circuit` (private working repo): event scan (cron), event store, Metricool CSV, business files.
- `~/neko-circuit-engine` (this repo): store copy, card generator, Metricool tools, Pages media, daily check.

## Added 2026-10-25 (later): link checker, Ohio, site revamp
- NEW TOOL written and tested outside this repo: `scratchpad/check_links.py`
  (/tmp/claude-1000/-home-marski-Coursework/0a5645fa-b307-4b99-bcf1-f278f3da2bbc/scratchpad/check_links.py).
  Copy it to `engine/tools/check_links.py`, add a README row, commit.
  Usage: `check_links.py [--events PATH] [--metricool CSV] [--days N] [--all]`. Read-only, stdlib only.
  Exit 1 on any broken link or on a verified+ event with no organizer_url.
  Tested on real data: 10 organizer links OK, 1 SOCIAL (Facebook event, hand check), 3 Youmacon card URLs OK.
  Note: it treats redirects as OK only if the final page is 200. In the Coursework sandbox the IsshoCon
  link looked broken only because the redirect host (www.isshocon.com) was not allow-listed; it is fine.
- Next step after committing it: add it to `engine-daily.yml` as a second step (separate from `due --strict`)
  so a dead organizer or card URL also emails the owner. Ask the user first; it makes the daily check
  stricter and can fail on third-party sites being down.
- Finding: four Detroit Public Library events all use the generic `detroitpubliclibrary.org/events-search`
  page as organizer_url. It returns 200 but is not an event page. Replace with each event's own page.
- NEXT CITY: Ohio (state, city not chosen). Candidate hub: Columbus (Ohayocon, January). Week 5 keyword
  data for the SEO class: "anime conventions in Ohio" 1,600, Ohayocon 1,600, "comic con Ohio" 880.
  Do the city-pack refactor (playbook section 4) before adding Ohio rows; do not copy Detroit rules into Ohio.
- LATER (not now): site revamp using SEO-class tools and the Week 6 site diagram/wireframes
  (`~/Coursework/week06/`). The website is the Next.js app in `~/Neko-Circuit/Website`; plan it in its own session.
