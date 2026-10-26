#!/usr/bin/env python3
"""
check_links.py - verify the links every upcoming event depends on
=================================================================
Read-only. No AI. Standard library only. Safe to run any time (idempotent).

Checks, for each upcoming active event in the event store:
  organizer_url   must answer 200 (after redirects). Social-only hosts
                  (Instagram, Facebook, Linktree, ...) cannot be fetched
                  reliably, so they are reported as SOCIAL (needs a hand check),
                  not as a failure.
and, with --metricool, for each future-dated row of a Metricool import CSV:
  Picture Url 1   must answer 200 (the card is actually deployed).

Usage:
  check_links.py [--events PATH] [--metricool CSV] [--days N] [--all] [--timeout S]

  --events     event store (default: ../data/events.csv next to this file's folder)
  --metricool  also check media URLs on rows dated today or later
  --days N     only events starting within N days (default 45)
  --all        include events with no organizer_url or past the window
  --timeout S  seconds per request (default 20)

Exit codes: 0 all links OK (SOCIAL and recurring-series notes are warnings),
            1 at least one FAIL or a missing organizer_url on a verified+ event.

Uses GET, not HEAD: several event sites answer HEAD with an error but serve the page.
"""
import argparse
import csv
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse

ACTIVE = {"lead", "verified", "carded", "scheduled", "posted"}
VERIFIED_PLUS = {"verified", "carded", "scheduled", "posted"}
SOCIAL_HOSTS = ("instagram.com", "facebook.com", "fb.com", "linktr.ee", "tiktok.com",
                "x.com", "twitter.com", "threads.net")
UA = {"User-Agent": "Mozilla/5.0 (compatible; NekoCircuitLinkCheck/1.0)"}


def fetch(url, timeout):
    """Return (status or None, note). Follows redirects."""
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, ""
    except urllib.error.HTTPError as e:
        return e.code, e.reason if isinstance(e.reason, str) else ""
    except Exception as e:  # DNS, timeout, TLS
        return None, type(e).__name__


def is_social(url):
    host = urlparse(url).netloc.lower()
    return any(host == h or host.endswith("." + h) for h in SOCIAL_HOSTS)


def parse_date(s):
    try:
        return datetime.strptime(s.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return None


def main():
    here = Path(__file__).resolve().parent
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--events", default=str(here.parent / "data" / "events.csv"))
    ap.add_argument("--metricool")
    ap.add_argument("--days", type=int, default=45)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--timeout", type=int, default=20)
    a = ap.parse_args()

    today = date.today()
    horizon = today + timedelta(days=a.days)
    fails = warns = oks = 0
    seen = {}

    def check(url):
        if url not in seen:
            seen[url] = fetch(url, a.timeout)
        return seen[url]

    print(f"{'RESULT':<8} {'EVENT / ROW':<46} URL")
    with open(a.events, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            d = parse_date(r["start"])
            if r["status"] not in ACTIVE:
                continue
            if not a.all and (not d or d < today or d > horizon) and not r["recurring"]:
                continue
            url, name = r["organizer_url"].strip(), r["name"][:44]
            if not url:
                if r["status"] in VERIFIED_PLUS:
                    print(f"{'FAIL':<8} {name:<46} (no organizer_url on a {r['status']} event)")
                    fails += 1
                continue
            if is_social(url):
                print(f"{'SOCIAL':<8} {name:<46} {url}  <- check by hand, log only visible dates")
                warns += 1
                continue
            code, note = check(url)
            if code == 200:
                print(f"{'OK':<8} {name:<46} {url}")
                oks += 1
            else:
                print(f"{'FAIL':<8} {name:<46} {url}  [{code or note}]")
                fails += 1

    if a.metricool:
        with open(a.metricool, newline="", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                d = parse_date(r["Date"])
                url = r["Picture Url 1"].strip()
                if not url or not d or d < today:
                    continue
                code, note = check(url)
                label = f"{r['Date']} {r['Time'][:5]} {url.rsplit('/', 1)[-1]}"[:44]
                if code == 200:
                    print(f"{'OK':<8} {label:<46} {url}")
                    oks += 1
                else:
                    print(f"{'FAIL':<8} {label:<46} {url}  [{code or note}]")
                    fails += 1

    print(f"\n{oks} ok, {warns} social (hand check), {fails} fail")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
