#!/usr/bin/env python3
"""
validate_metricool_csv.py — guard against caption-less rows before import
===========================================================================
Run before every Metricool calendar-import upload. Exits non-zero (and
prints every offending row) if any row's Text field is empty or reduced to
just the trailing hashtag block — the exact failure found 2026-08-11, where
10 event posts across Aug 1-22 published/were-scheduled with real captions
missing, leaving only "#313Circuit #blackotaku #DetroitNerdScene
#MichiganAnime\"" as the entire post body. Confirmed in Metricool analytics:
those posts got 0-7 reach vs. 20-120 for posts with intact captions.

Also fails on any row dated before today. Found 2026-08-28: the live
Tools/metricool_calendar_import.csv had old already-posted rows (Aug 1-22)
sitting in it, kept around as "historical record" — reasonable for git
history, useless and confusing in a file whose whole purpose is "what to
import into Metricool right now." The owner's rule as of that date: the live
import file only ever holds rows dated today or later. Nothing else.

Also fails on any em dash (—) in Text or Alt text fields. Standing rule
(feedback_writing-style.md memory, predates this file): avoid em dashes in
casual/conversational writing, use commas/semicolons/periods instead — they
read as an AI tell-tale sign. Found 2026-08-28: 78 em dashes had made it into
this exact file despite that rule already being in memory the whole time.
Not a knowledge gap, a failure to actually apply it. Mechanized here instead
of trusting it gets remembered next time.

No generator writes this CSV (it's hand/AI-edited directly), so there's no
single source-of-truth bug to fix at a script level — this validator is the
guard instead. Run it and read every FAIL line before importing.

Usage:
  python3 Tools/validate_metricool_csv.py [path/to/calendar_import.csv]
  (defaults to Tools/metricool_calendar_import.csv)
"""

import csv
import sys
import os
from datetime import date

HASHTAG_BLOCK = "#313Circuit #blackotaku #DetroitNerdScene #MichiganAnime"
MIN_CAPTION_LEN = len(HASHTAG_BLOCK) + 20  # real captions run 300-600+ chars;
                                            # anything barely over the bare
                                            # hashtag block is almost certainly
                                            # a caption that never made it in


def validate(path):
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    today = date.today()
    failures = []
    for i, row in enumerate(rows, start=2):  # +2: header is line 1, rows are 1-indexed after it
        text = (row.get("Text") or "").strip()
        row_date = row.get("Date", "")
        pic = row.get("Picture Url 1", "")

        if not text:
            failures.append((i, row_date, pic, "EMPTY Text field"))
            continue

        stripped = text.rstrip('"').strip()
        if stripped == HASHTAG_BLOCK or len(text) < MIN_CAPTION_LEN:
            failures.append((i, row_date, pic, f"hashtags-only or too short ({len(text)} chars): {text!r}"))
            continue

        # unbalanced quote check: an odd number of literal " chars inside the
        # parsed value means something got mangled even if csv.DictReader
        # didn't raise (e.g. this exact bug's trailing stray ")
        if text.count('"') % 2 != 0:
            failures.append((i, row_date, pic, f"unbalanced quote in parsed Text ({text.count(chr(34))} quote chars)"))

        # stale row: this file is "what to import right now," not an archive.
        # A row dated before today means either it already posted (belongs in
        # git history / the posting-plan docs, not here) or it was missed
        # entirely (a different, separate problem — see posting-plan MISSED
        # notes) — either way it should not be sitting in this file.
        if row_date:
            try:
                y, m, d = (int(x) for x in row_date.split("-"))
                if date(y, m, d) < today:
                    failures.append((i, row_date, pic, f"STALE — dated before today ({today}); remove from this file"))
            except ValueError:
                pass  # malformed date is caught elsewhere / not this check's job

        # em dash check: Text + every Alt text column
        if "—" in text:
            failures.append((i, row_date, pic, "EM DASH in Text — replace with comma/semicolon/period"))
        for col in range(1, 11):
            alt = (row.get(f"Alt text picture {col}") or "")
            if "—" in alt:
                failures.append((i, row_date, pic, f"EM DASH in Alt text picture {col} — replace with comma/semicolon/period"))

    print(f"Checked {len(rows)} rows in {path}")
    if failures:
        print(f"\n{len(failures)} FAILURE(S):\n")
        for line_no, row_date, pic, reason in failures:
            print(f"  Row (line {line_no}, {row_date}): {reason}")
            if pic:
                print(f"    image: {pic}")
        return 1

    print("All rows have real captions. Safe to import.")
    return 0


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "metricool_calendar_import.csv"
    )
    sys.exit(validate(path))
