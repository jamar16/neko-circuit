#!/usr/bin/env python3
"""
events.py - the Neko Circuit event store (single source of truth).

Replaces event-queue.md as the place events LIVE. The queue stays as notes;
this CSV is what scripts and the weekly review read and write. Nothing here
calls an LLM. An LLM may propose rows, but only this script writes them, so a
find is either in events.csv or it is not (no "narrated but not written").

Store: Active-Project/data/events.csv (one row per event or recurring series)

Stages (status):  lead -> verified -> carded -> scheduled -> posted -> past
                  plus: skip (not covering), missed (verified/carded, passed
                  with nothing scheduled or posted)

Usage:
  events.py list [--status S] [--days N] [--all]     table of events
  events.py add --name N --start YYYY-MM-DD [--end D] [--time T] [--venue V]
                [--city C] [--type T] [--url U] [--source S] [--recurring R]
                [--notes TEXT]                        add a lead (idempotent by id)
  events.py set ID field=value [field=value ...]       edit fields / move stage
  events.py review                                     walk leads: y/n/e/s/q
  events.py expire                                     roll passed events to past/missed
  events.py due [--days 21]                            what needs action now
  events.py plan [--days 30]                           T-14/T-7/T-2/day-of post dates
  events.py scorecard                                  weekly numbers from the store
  events.py import-csv FILE                            add rows from a seed CSV (idempotent)

Rules enforced (handoff doc, data integrity):
  - An event cannot move past `lead` without a start date, a venue and an
    organizer URL. Date and venue must come from the organizer, never a guess.
  - IDs are slug(name)-start, so re-adding the same event never duplicates it.

Deps: standard library only.
"""
import argparse
import csv
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "events.csv"
FIELDS = [
    "id", "name", "start", "end", "time", "venue", "city", "type",
    "organizer_url", "source", "recurring", "status", "card_slug",
    "scheduled_on", "posted_on", "verified_on", "added", "updated", "notes",
]
STATUSES = ["lead", "verified", "carded", "scheduled", "posted", "past", "skip", "missed"]
ACTIVE = {"lead", "verified", "carded", "scheduled", "posted"}
NEEDS_POST = {"verified", "carded"}  # verified events with no scheduled post yet
OFFSETS = [14, 7, 2, 0]              # days before the event to post


def today() -> date:
    return date.today()


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def make_id(name: str, start: str) -> str:
    return f"{slug(name)}-{start}" if start else slug(name)


def parse_date(s: str):
    try:
        return datetime.strptime(s.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return None


def load():
    if not DATA.exists():
        return []
    with DATA.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def save(rows):
    DATA.parent.mkdir(parents=True, exist_ok=True)
    tmp = DATA.with_suffix(".tmp")
    with tmp.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS, extrasaction="ignore")
        w.writeheader()
        for r in sorted(rows, key=lambda r: (r.get("start") or "9999", r["id"])):
            w.writerow({k: r.get(k, "") for k in FIELDS})
    tmp.replace(DATA)  # atomic: a crash never leaves a half-written store


def blank(**kw):
    r = {k: "" for k in FIELDS}
    r.update(kw)
    r["added"] = r["added"] or today().isoformat()
    r["updated"] = today().isoformat()
    return r


def event_date(r):
    """The date that decides 'is this over': end if present, else start."""
    return parse_date(r.get("end", "")) or parse_date(r.get("start", ""))


def verifiable(r):
    need = ("venue", "organizer_url") if (r.get("recurring") or "").strip() else ("start", "venue", "organizer_url")
    return [k for k in need if not (r.get(k) or "").strip()]


def find(rows, ident):
    hits = [r for r in rows if r["id"] == ident] or [r for r in rows if r["id"].startswith(ident)]
    if len(hits) != 1:
        sys.exit(f"{'No' if not hits else 'Ambiguous'} match for '{ident}'"
                 + ("" if not hits else ": " + ", ".join(h["id"] for h in hits)))
    return hits[0]


def fmt(r):
    when = r["start"] + (f"..{r['end']}" if r["end"] and r["end"] != r["start"] else "")
    if r["recurring"]:
        when += " (recurring)"
    return f"{r['status']:<9} {when:<26} {r['name'][:46]:<46} {r['city'][:14]}"


def cmd_list(a):
    rows = load()
    t = today()
    out = []
    for r in rows:
        if a.status and r["status"] != a.status:
            continue
        if not a.all and not a.status and r["status"] in ("past", "skip"):
            continue
        if a.days is not None:
            d = event_date(r)
            if not d or d < t or d > t + timedelta(days=a.days):
                continue
        out.append(r)
    for r in out:
        print(fmt(r) + f"  [{r['id']}]")
    print(f"\n{len(out)} shown, {len(rows)} total")


def cmd_add(a):
    rows = load()
    rid = make_id(a.name, a.start)
    if any(r["id"] == rid for r in rows):
        print(f"exists: {rid} (not added again)")
        return
    if a.start and not parse_date(a.start):
        sys.exit("start must be YYYY-MM-DD")
    rows.append(blank(id=rid, name=a.name, start=a.start or "", end=a.end or "",
                      time=a.time or "", venue=a.venue or "", city=a.city or "",
                      type=a.type or "", organizer_url=a.url or "", source=a.source or "",
                      recurring=a.recurring or "", status="lead", notes=a.notes or ""))
    save(rows)
    print(f"added lead: {rid}")


def apply_set(r, kv):
    for item in kv:
        if "=" not in item:
            sys.exit(f"bad field '{item}', use field=value")
        k, v = item.split("=", 1)
        if k not in FIELDS or k in ("id", "added"):
            sys.exit(f"cannot set '{k}'")
        if k == "status":
            if v not in STATUSES:
                sys.exit(f"status must be one of {STATUSES}")
            if v not in ("lead", "skip", "past", "missed"):
                miss = verifiable(r)
                if miss:
                    sys.exit(f"cannot move to '{v}': missing {', '.join(miss)} "
                             "(date, venue and organizer URL must come from the organizer)")
            if v == "verified" and not r["verified_on"]:
                r["verified_on"] = today().isoformat()
            if v == "scheduled" and not r["scheduled_on"]:
                r["scheduled_on"] = today().isoformat()
            if v == "posted" and not r["posted_on"]:
                r["posted_on"] = today().isoformat()
        r[k] = v
    r["updated"] = today().isoformat()


def cmd_set(a):
    rows = load()
    r = find(rows, a.id)
    apply_set(r, a.fields)
    save(rows)
    print(fmt(r))


def ask(prompt):
    try:
        return input(prompt).strip().lower()
    except EOFError:
        return "q"


def cmd_review(a):
    rows = load()
    leads = [r for r in rows if r["status"] == "lead"
             and (not event_date(r) or event_date(r) >= today())]
    leads.sort(key=lambda r: r["start"] or "9999")
    if not leads:
        print("No leads to review.")
        return
    print(f"{len(leads)} lead(s). y=verified at organizer  n=skip  e=edit  s=later  q=quit\n")
    done = 0
    for r in leads:
        print("-" * 70)
        print(f"{r['name']}\n  when : {r['start']} {r['end']} {r['time']}\n  where: {r['venue']}, {r['city']}"
              f"\n  type : {r['type']}   recurring: {r['recurring'] or '-'}"
              f"\n  check: {r['organizer_url'] or '(no organizer URL)'}\n  notes: {r['notes'][:200]}")
        while True:
            c = ask("verified at the organizer's own site? [y/n/e/s/q] ")
            if c == "q":
                save(rows)
                print(f"\nsaved. reviewed {done}.")
                return
            if c == "s" or c == "":
                break
            if c == "n":
                r["status"] = "skip"
                r["updated"] = today().isoformat()
                done += 1
                break
            if c == "e":
                f = ask("  field=value (blank to stop): ")
                while f:
                    try:
                        apply_set(r, [f])
                    except SystemExit as e:
                        print("  ", e)
                    f = ask("  field=value (blank to stop): ")
                continue
            if c == "y":
                miss = verifiable(r)
                if miss:
                    print(f"  cannot verify yet, missing: {', '.join(miss)}. Use e to fill them in.")
                    continue
                apply_set(r, ["status=verified"])
                done += 1
                break
    save(rows)
    print(f"\nsaved. reviewed {done}.")


def cmd_expire(a):
    rows = load()
    t = today()
    moved = []
    for r in rows:
        d = event_date(r)
        if r["recurring"] or not d or d >= t:
            continue
        if r["status"] in ("verified", "carded"):
            r["status"] = "missed"
        elif r["status"] in ("scheduled", "posted", "lead"):
            r["status"] = "past"
        else:
            continue
        r["updated"] = t.isoformat()
        moved.append(r)
    if moved:
        save(rows)
    for r in moved:
        print(f"{r['status']:<7} {r['id']}")
    print(f"\n{len(moved)} moved")


def next_actions(rows, days):
    t = today()
    horizon = t + timedelta(days=days)
    need_post, stale = [], []
    for r in rows:
        d = parse_date(r["start"])
        if r["status"] in NEEDS_POST and d and t <= d <= horizon and not r["recurring"]:
            need_post.append(r)
        if r["status"] == "lead":
            a = parse_date(r["added"])
            if a and (t - a).days > 7 and (not event_date(r) or event_date(r) >= t):
                stale.append(r)
    return need_post, stale


def cmd_due(a):
    rows = load()
    need_post, stale = next_actions(rows, a.days)
    print(f"Verified or carded, event within {a.days} days, NO post scheduled ({len(need_post)}):")
    for r in sorted(need_post, key=lambda r: r["start"]):
        days = (parse_date(r["start"]) - today()).days
        print(f"  {r['start']} (in {days}d)  {r['name']}  [{r['id']}]")
    print(f"\nLeads waiting more than 7 days for review ({len(stale)}):")
    for r in stale:
        print(f"  {r['name']}  [{r['id']}]")
    if getattr(a, "strict", False) and need_post:
        sys.exit(1)  # lets a scheduled job fail (and email) when a posting gap exists


def cmd_plan(a):
    rows = load()
    t = today()
    out = []
    for r in rows:
        d = parse_date(r["start"])
        if r["status"] not in NEEDS_POST or not d or r["recurring"]:
            continue
        for off in OFFSETS:
            when = d - timedelta(days=off)
            if t <= when <= t + timedelta(days=a.days):
                out.append((when, off, r))
    out.sort(key=lambda x: (x[0], x[2]["id"]))
    if not out:
        print("Nothing to plan.")
    for when, off, r in out:
        label = "day-of" if off == 0 else f"T-{off}"
        card = r["card_slug"] or "NO CARD YET"
        print(f"{when} {label:<6} {r['name'][:44]:<44} card: {card}")
    print("\nEvents already past a T-minus date still get the remaining ones; nothing is posted retroactively.")


def cmd_scorecard(a):
    rows = load()
    t = today()
    wk = t - timedelta(days=7)
    verified_wk = [r for r in rows if parse_date(r["verified_on"]) and parse_date(r["verified_on"]) > wk]
    need_post, stale = next_actions(rows, 21)
    in21 = [r for r in rows if r["status"] in (NEEDS_POST | {"scheduled", "posted"})
            and parse_date(r["start"]) and t <= parse_date(r["start"]) <= t + timedelta(days=21)
            and not r["recurring"]]
    covered = [r for r in in21 if r["status"] in ("scheduled", "posted")]
    posted_wk = [r for r in rows if parse_date(r["posted_on"]) and parse_date(r["posted_on"]) > wk]
    missed = [r for r in rows if r["status"] == "missed"]
    print(f"Scorecard {t} (auto numbers; 5 and 7 are hand/other tools)")
    print(f"  1 events verified this week              : {len(verified_wk)}")
    pct = f"{100 * len(covered) // len(in21)}%" if in21 else "n/a"
    print(f"  2 verified in next 21d with post scheduled: {pct} ({len(covered)}/{len(in21)})")
    print(f"  3 events posted this week (store only)    : {len(posted_wk)}")
    print(f"  4 leads unreviewed more than 7 days       : {len(stale)}")
    print(f"  6 events missed, all time                 : {len(missed)}")


def cmd_import(a):
    rows = load()
    have = {r["id"] for r in rows}
    n = 0
    with open(a.file, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rid = r.get("id") or make_id(r["name"], r.get("start", ""))
            if rid in have:
                continue
            new = blank(**{k: v for k, v in r.items() if k in FIELDS})
            new["id"] = rid
            new["status"] = new["status"] or "lead"
            rows.append(new)
            have.add(rid)
            n += 1
    save(rows)
    print(f"imported {n} new row(s), {len(rows)} total")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    s = p.add_subparsers(dest="cmd", required=True)
    x = s.add_parser("list"); x.add_argument("--status"); x.add_argument("--days", type=int)
    x.add_argument("--all", action="store_true"); x.set_defaults(f=cmd_list)
    x = s.add_parser("add")
    for k in ("name", "start", "end", "time", "venue", "city", "type", "url", "source", "recurring", "notes"):
        x.add_argument(f"--{k}")
    x.set_defaults(f=cmd_add)
    x = s.add_parser("set"); x.add_argument("id"); x.add_argument("fields", nargs="+"); x.set_defaults(f=cmd_set)
    x = s.add_parser("review"); x.set_defaults(f=cmd_review)
    x = s.add_parser("expire"); x.set_defaults(f=cmd_expire)
    x = s.add_parser("due"); x.add_argument("--days", type=int, default=21); x.add_argument("--strict", action="store_true", help="exit 1 if any event in the window has no post"); x.set_defaults(f=cmd_due)
    x = s.add_parser("plan"); x.add_argument("--days", type=int, default=30); x.set_defaults(f=cmd_plan)
    x = s.add_parser("scorecard"); x.set_defaults(f=cmd_scorecard)
    x = s.add_parser("import-csv"); x.add_argument("file"); x.set_defaults(f=cmd_import)
    a = p.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
