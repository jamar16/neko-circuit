#!/usr/bin/env python3
"""
add_metricool_rows.py - append planned posts to the live Metricool import CSV
==============================================================================
Reads a small JSON plan (one entry per post) and appends matching rows to
Tools/metricool_calendar_import.csv, using the same column conventions as the
existing hand-built rows. No AI. Idempotent: a row already in the CSV with the
same date, time, media URL and post type is skipped.

Usage:
  add_metricool_rows.py PLAN.json [--csv PATH] [--dry-run] [--no-check-urls]

Plan file: {"slug": "YOUMACON", "alt": "Youmacon card, ...", "posts": [
    {"date": "2026-10-20", "time": "18:00", "kind": "square", "caption": "..."},
    ...]}

kind -> media file under https://dateanime.com/social/ and platforms:
  square  {slug}_IG_square.png   FB + IG   POST
  reel    {slug}_reel.mp4        FB + IG + TikTok   REEL
  story   {slug}_reel.mp4        FB + IG   STORY   (reel mp4 carries the music)
  tiktok  {slug}_tiktok.mp4      TikTok only

Safety: refuses past dates, empty captions, and em dashes (same rules as
validate_metricool_csv.py, which this runs at the end). With URL checking on
(default) every media URL must answer 200, so nothing gets scheduled against a
card that was never deployed. Only add events whose status is verified.
"""
import argparse
import csv
import json
import os
import subprocess
import sys
import urllib.request
from datetime import date, datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_CSV = HERE / "metricool_calendar_import.csv"
BASE = os.environ.get("NEKO_MEDIA_BASE", "https://dateanime.com/social/")

KINDS = {
    "square": ("{slug}_IG_square.png", dict(Facebook="true", Instagram="true", TikTok="false"), "POST"),
    "reel": ("{slug}_reel.mp4", dict(Facebook="true", Instagram="true", TikTok="true"), "REEL"),
    "story": ("{slug}_reel.mp4", dict(Facebook="true", Instagram="true", TikTok="false"), "STORY"),
    "tiktok": ("{slug}_tiktok.mp4", dict(Facebook="false", Instagram="false", TikTok="true"), None),
}


def url_ok(url):
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        return urllib.request.urlopen(req, timeout=20).status == 200
    except Exception:
        return False


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("plan")
    ap.add_argument("--csv", default=str(DEFAULT_CSV))
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-check-urls", action="store_true")
    a = ap.parse_args()

    plan = json.loads(Path(a.plan).read_text())
    slug, alt = plan["slug"], plan.get("alt", "")
    path = Path(a.csv)
    with path.open(newline="", encoding="utf-8-sig") as f:
        rd = csv.DictReader(f)
        fields, rows = rd.fieldnames, list(rd)
    seen = {(r["Date"], r["Time"][:5], r["Picture Url 1"], r.get("Instagram Post Type") or r.get("Facebook Post Type", "")) for r in rows}

    new, today = [], date.today()
    for p in plan["posts"]:
        d = datetime.strptime(p["date"], "%Y-%m-%d").date()
        if d < today:
            sys.exit(f"FAIL: {p['date']} is in the past")
        if not p["caption"].strip() or "—" in p["caption"]:
            sys.exit(f"FAIL: empty caption or em dash on {p['date']}")
        fn, plats, ptype = KINDS[p["kind"]]
        media = BASE + fn.format(slug=slug)
        if not a.no_check_urls and not url_ok(media):
            sys.exit(f"FAIL: {media} is not live (deploy the card first)")
        key = (p["date"], p["time"][:5], media, ptype or "")
        if key in seen:
            print("skip (already present):", key)
            continue
        row = {k: "" for k in fields}
        row.update(Text=p["caption"], Date=p["date"], Time=p["time"] + ":00", Draft="false", **plats)
        row["Picture Url 1"] = media
        row["Alt text picture 1"] = p.get("alt", alt)
        if ptype:
            row["Instagram Post Type"] = row["Facebook Post Type"] = ptype
        new.append(row)

    print(f"{len(new)} new row(s) for {slug}")
    if a.dry_run or not new:
        return
    with path.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        for r in new:
            w.writerow(r)
    rc = subprocess.call([sys.executable, str(HERE / "validate_metricool_csv.py"), str(path)])
    sys.exit(rc)


if __name__ == "__main__":
    main()
