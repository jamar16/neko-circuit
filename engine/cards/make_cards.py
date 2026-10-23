#!/usr/bin/env python3
"""
Neko Circuit — Detroit Nerd Scene card generator
-------------------------------------------------
Reads a CSV of events and, for each row, generates 4 ready-to-post files:

  <SLUG>_IG_square.png   1080x1080   IG feed + FB
  <SLUG>_IG_story.png    1080x1920   IG/FB story + reel cover (black bars top/bottom)
  <SLUG>_reel.mp4         1080x1920  5s still video  -> IG Reels
  <SLUG>_tiktok.mp4       1080x1920  5s still video  -> TikTok

The mp4s carry real audio if music/*.mp3 exists next to this script (picked
deterministically per event slug, half-second fade-out at the end). Without
that folder they're silent, same as before — silent uploads are what makes
IG/TikTok substitute generic fallback audio, which is the problem this
solves. See music/README.md for where to get pre-cleared tracks.

Everything is composited onto your real base PNG so the glitch texture,
the diagonal purple line, the DETROIT watermark, and the bottom NEKO CIRCUIT
bar all stay exactly as you designed them. Only the middle block changes.

USAGE
-----
    python3 make_cards.py events.csv
    python3 make_cards.py events.csv --out ./posts_2026_week27
    python3 make_cards.py events.csv --no-video        # skip the mp4s, png only

CSV COLUMNS (header row required; extra columns are ignored)
------------------------------------------------------------
    pill          e.g.  MEETUP   |  MUSIC · 18+  |  GAMING  |  EVENT
    title         e.g.  GAME NIGHT (RETRO THEME)
    subtitle      optional grey line under title, e.g.  Featuring: S-Cry-Ed + Bloody Roar
    line1         e.g.  Saturday, June 27, 6–11 PM
    line2         e.g.  22011 Coolidge Hwy, Oak Park, MI
    highlight     the cyan line, e.g.  $10 entry   (leave blank to omit)
    footer        bottom grey line, e.g.  more info: @born_otaku77 · Detroit's Anime Club
    slug          OPTIONAL. Output folder/file stem. Defaults to the title,
                  uppercased and de-punctuated (12TH TABLETOP GAME NIGHT ->
                  12TH_TABLETOP_GAME_NIGHT). Set it when two rows share a
                  title (alternate versions of one card) or a recurring
                  event would otherwise overwrite last month's files.
    music         OPTIONAL. Track for the mp4s: a filename inside music/ next
                  to this script, or a full path. Defaults to pick_track()
                  (deterministic per slug). A missing file warns and falls
                  back to pick_track() rather than silently going quiet.
    kicker        OPTIONAL. Replaces the base template's small cyan
                  "DETROIT NERD SCENE" line top-left (it's baked into the
                  PNG, so this cleans that spot, restores the purple diagonal
                  where it grazes the text, and redraws). Auto-fits size and
                  letter-spacing so it never runs into the purple line.
                  e.g.  Presented by @born_otaku77

A starter CSV (events_sample.csv) is written next to this script the first
time you run it without one. Open it, fill rows, run again.
"""

import csv
import os
import re
import shutil
import sys
import subprocess
import argparse
import zlib

from PIL import Image, ImageDraw, ImageFont

# ----------------------------------------------------------------------
# paths / brand constants
# ----------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
BASE_PNG   = os.path.join(HERE, "base_template.png")
MUSIC_DIR  = os.path.join(HERE, "music")
FONT_HEAD  = os.path.join(HERE, "fonts", "BebasNeue-Regular.ttf")
# Bebas is caps-only. For titles with intentional mixed case (e.g. "MeggaXP")
# fall back to a bold face that actually has lowercase letterforms.
FONT_HEAD_MIXED = os.path.join(HERE, "fonts", "Barlow-Bold.ttf")
FONT_BODY  = os.path.join(HERE, "fonts", "DMSans.ttf")

CYAN   = (59, 240, 255)     # #3BF0FF
VIOLET = (192, 132, 252)    # #C084FC
WHITE  = (245, 245, 245)
GREY   = (150, 150, 155)    # subtitle / footer grey
BLACK  = (13, 13, 13)       # #0D0D0D pill bars

CANVAS = 1080               # base is 1080x1080
STORY_H = 1920              # vertical output height

# layout anchors (measured from your base template) ---------------------
LEFT_X   = 40               # left text margin
PILL_Y   = 158             # top of purple pill
TITLE_Y  = 250             # top of headline block
PILL_PAD_X = 34
PILL_PAD_Y = 14

# ----------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------
def slugify(text):
    s = re.sub(r"[^A-Za-z0-9]+", "_", text).strip("_").upper()
    return s[:48] or "EVENT"

def headline_case(s):
    """Uppercase the headline UNLESS the title already carries intentional
    mixed case (e.g. 'MeggaXP') — then preserve it exactly as written."""
    s = s or ""
    return s if any(c.islower() for c in s) else s.upper()

def font(path, size):
    return ImageFont.truetype(path, size)

def text_w(draw, s, fnt):
    return draw.textbbox((0, 0), s, font=fnt)[2]

def head_font_for(title):
    """Bebas for all-caps house style; bold lowercase-capable face for mixed case."""
    return FONT_HEAD_MIXED if any(c.islower() for c in (title or "")) else FONT_HEAD

def fit_headline(draw, text, max_w, start=128, min_size=58, font_path=FONT_HEAD):
    """Shrink the headline until it fits max_w on one line."""
    size = start
    while size > min_size:
        f = font(font_path, size)
        if text_w(draw, text, f) <= max_w:
            return f, size
        size -= 2
    return font(font_path, min_size), min_size

def draw_pill(img, draw, label):
    """Purple rounded pill with black uppercase text, matching the base."""
    label = label.upper()
    f = font(FONT_BODY, 34)
    tw = text_w(draw, label, f)
    # rough letter-spacing to match the airy look in your samples
    spaced = "  ".join(list(label)) if len(label) <= 14 else label
    tw = text_w(draw, spaced, f)
    pill_w = tw + PILL_PAD_X * 2
    pill_h = 58
    x0, y0 = LEFT_X, PILL_Y
    x1, y1 = x0 + pill_w, y0 + pill_h
    draw.rounded_rectangle([x0, y0, x1, y1], radius=pill_h // 2, fill=VIOLET)
    # center the spaced label
    bbox = draw.textbbox((0, 0), spaced, font=f)
    th = bbox[3] - bbox[1]
    draw.text((x0 + PILL_PAD_X, y0 + (pill_h - th) / 2 - bbox[1]),
              spaced, font=f, fill=BLACK)
    return y1

def clear_watermark_band(img, top=150, bottom=780):
    """Cover the base PNG's original diagonal DETROIT watermark (it spans
    roughly y380-720 and reaches the right edge) by TILING a genuinely clean
    glitch strip. The strip is sampled from y760-880 — full width, below the
    watermark, above the footer text — so no watermark fragments get smeared
    into the band (the old right-column sample at x760+ contained 'OIT').
    Tiling (not resizing) keeps the scanline texture at its natural scale."""
    strip = img.crop((0, 760, CANVAS, 880)).copy()
    y = top
    while y < bottom:
        h = min(strip.height, bottom - y)
        img.paste(strip.crop((0, 0, CANVAS, h)), (0, y))
        y += h

def draw_watermark(img, text="DETROIT"):
    """Re-draw ONE faint glitch watermark. Centered in the card's open middle
    (y~560), not behind the headline, and low-opacity so it reads as texture,
    not competing text. Drawn before the content text, which layers on top."""
    spaced = "  ".join(list(text.upper()))
    size = 300
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    while size > 90:
        f = font(FONT_HEAD_MIXED, size)
        if od.textbbox((0, 0), spaced, font=f)[2] <= CANVAS - 36:
            break
        size -= 4
    f = font(FONT_HEAD_MIXED, size)
    bb = od.textbbox((0, 0), spaced, font=f)
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    x = (CANVAS - w) / 2 - bb[0]
    y = 560 - h / 2 - bb[1]
    od.text((x, y), spaced, font=f, fill=(255, 255, 255, 26))
    merged = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    img.paste(merged, (0, 0))

# base template's kicker ("DETROIT NERD SCENE"): glyphs span x36-447, y78-99
# (cap height 22 ~ DM Sans 31 with ~6px tracking). The purple diagonal
# (y ~ 166.35 - 0.1492x) passes the baseline at x~451, so replacement text
# must end by KICKER_MAX_RIGHT or it collides with the line.
KICKER_CLEAN_BOX = (28, 70, 456, 104)
KICKER_LEFT_X, KICKER_BASELINE_Y = 36, 100
KICKER_MAX_RIGHT = 445
KICKER_COLOR = CYAN

def _is_purple(rgb):
    r, g, b = rgb
    return b > 60 and b > g * 1.4 and r > g * 1.15

def replace_kicker(img, text):
    """Swap the baked-in kicker for `text`. Clean with the same texture
    source clear_watermark_band uses, put back any purple-line pixels the
    clean box swallowed (copied from the pristine base, so the anti-aliasing
    is untouched), then draw. Largest size/tracking that fits wins, tracking
    first so short all-caps text keeps the original airy look."""
    base = img.copy()
    x0, y0, x1, y1 = KICKER_CLEAN_BOX
    strip = base.crop((x0, 760, x1, 760 + (y1 - y0)))
    img.paste(strip, (x0, y0))
    pb, pi = base.load(), img.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            if _is_purple(pb[x, y]):
                pi[x, y] = pb[x, y]
    draw = ImageDraw.Draw(img)
    max_w = KICKER_MAX_RIGHT - KICKER_LEFT_X
    chosen = None
    for size in range(31, 17, -1):
        f = font(FONT_BODY, size)
        for track in range(6, -1, -1):
            w = sum(draw.textlength(ch, font=f) for ch in text) + track * (len(text) - 1)
            if w <= max_w:
                chosen = (f, track)
                break
        if chosen:
            break
    if not chosen:
        chosen = (font(FONT_BODY, 18), 0)
    f, track = chosen
    x = KICKER_LEFT_X
    for ch in text:
        draw.text((x, KICKER_BASELINE_Y), ch, font=f, fill=KICKER_COLOR, anchor="ls")
        x += draw.textlength(ch, font=f) + track

def render_card(row):
    """Return a 1080x1080 RGB image for one event row."""
    img = Image.open(BASE_PNG).convert("RGB")
    kick = row.get("kicker", "").strip()
    if kick:
        replace_kicker(img, kick)
    # wipe the placeholder text area AND the base's original diagonal
    # watermark (y150..780) with clean tiled texture, then redraw a single
    # subtle DETROIT watermark. Header, teal bar, and footer bar stay.
    clear_watermark_band(img)
    draw_watermark(img)
    draw = ImageDraw.Draw(img)

    # --- pill ---
    pill_bottom = draw_pill(img, draw, row.get("pill", "EVENT"))

    # --- headline (auto-shrink to fit) ---
    title = headline_case(row.get("title", ""))
    max_w = CANVAS - LEFT_X - 40
    f_title, _ = fit_headline(draw, title, max_w, font_path=head_font_for(title))
    y = TITLE_Y
    draw.text((LEFT_X, y), title, font=f_title, fill=WHITE)
    tb = draw.textbbox((LEFT_X, y), title, font=f_title)
    y = tb[3] + 6

    # --- optional grey subtitle ---
    sub = row.get("subtitle", "").strip()
    if sub:
        fs = font(FONT_BODY, 32)
        draw.text((LEFT_X, y), sub, font=fs, fill=GREY)
        y += 50

    y += 8
    # --- detail lines (white, DM Sans) ---
    fb = font(FONT_BODY, 40)
    for key in ("line1", "line2"):
        val = row.get(key, "").strip()
        if val:
            draw.text((LEFT_X, y), val, font=fb, fill=WHITE)
            y += 56

    # --- cyan highlight ---
    hl = row.get("highlight", "").strip()
    if hl:
        y += 6
        fh = font(FONT_BODY, 46)
        draw.text((LEFT_X, y), hl, font=fh, fill=CYAN)

    # --- footer grey line (sits above the teal bar ~ y 930) ---
    foot = row.get("footer", "").strip()
    if foot:
        ff = font(FONT_BODY, 34)
        fw = text_w(draw, foot, ff)
        # clear the old footer band fully: sample a clean texture strip from
        # mid-canvas (no text there) and tile it across the footer area,
        # stopping just above the teal divider (~y 956).
        clean = img.crop((0, 720, 1080, 780))          # clean glitch strip
        img.paste(clean, (0, 890))                       # cover 890..950
        draw = ImageDraw.Draw(img)
        draw.text(((CANVAS - fw) / 2, 900), foot, font=ff, fill=GREY)

    return img

def to_story(square):
    """Pad 1080x1080 to 1080x1920 with plain black bars top & bottom."""
    canvas = Image.new("RGB", (CANVAS, STORY_H), BLACK)
    y = (STORY_H - CANVAS) // 2
    canvas.paste(square, (0, y))
    return canvas

def render_cover(title, subtitle):
    """Branded slide-1 cover for a carousel. Big centered Bebas headline,
    cyan accent, reuses the base template so texture/line/watermark match."""
    img = Image.open(BASE_PNG).convert("RGB")
    draw = ImageDraw.Draw(img)

    # clear the middle band + original watermark like render_card does
    clear_watermark_band(img)
    draw_watermark(img)
    draw = ImageDraw.Draw(img)

    # small cyan kicker top-left already exists on base ("DETROIT NERD SCENE")
    # big centered title, auto-shrink, can wrap to 2 lines
    title = headline_case(title)
    max_w = CANVAS - 80
    # try one line; if too big, split on space nearest middle
    f, size = fit_headline(draw, title, max_w, start=150, min_size=72)
    if text_w(draw, title, f) <= max_w:
        lines = [title]
    else:
        words = title.split()
        mid = len(words) // 2
        lines = [" ".join(words[:mid]), " ".join(words[mid:])]
        f = font(FONT_HEAD, 120)

    total_h = sum(draw.textbbox((0, 0), ln, font=f)[3] for ln in lines)
    y = (CANVAS - total_h) // 2 - 40
    for ln in lines:
        w = text_w(draw, ln, f)
        draw.text(((CANVAS - w) / 2, y), ln, font=f, fill=WHITE)
        y += draw.textbbox((0, 0), ln, font=f)[3] + 4

    # cyan subtitle under the title
    if subtitle:
        fs = font(FONT_BODY, 44)
        w = text_w(draw, subtitle, fs)
        draw.text(((CANVAS - w) / 2, y + 16), subtitle, font=fs, fill=CYAN)

    # swipe hint bottom-right above the teal bar — first clear the base
    # placeholder footer band so "more info: @handle…" doesn't show through
    clean_foot = img.crop((0, 720, 1080, 780))
    img.paste(clean_foot, (0, 890))
    draw = ImageDraw.Draw(img)
    fh = font(FONT_BODY, 32)
    hint = "swipe →"
    w = text_w(draw, hint, fh)
    draw.text((CANVAS - w - 50, 905), hint, font=fh, fill=GREY)

    return img

def ffmpeg_bin():
    """Resolve an ffmpeg binary. Prefer PATH; fall back to the pip
    imageio-ffmpeg static build — system apt ffmpeg has been broken on this
    box before (stale Kali index, see project memory 2026-07-07)."""
    if shutil.which("ffmpeg"):
        return "ffmpeg"
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"  # let it fail with ffmpeg's own error, not a silent skip

def pick_track(slug):
    """Deterministically rotate through music/*.{mp3,m4a,wav} so the same
    event always gets the same track across regenerations (idempotent —
    matters since cards get regenerated mid-week, see event-queue.md's
    07-01 redeploy note) while different events spread across the library.
    Returns None if the folder is missing or empty — silent video is still
    a valid fallback, not a crash."""
    if not os.path.isdir(MUSIC_DIR):
        return None
    tracks = sorted(
        f for f in os.listdir(MUSIC_DIR)
        if f.lower().endswith((".mp3", ".m4a", ".wav"))
    )
    if not tracks:
        return None
    return os.path.join(MUSIC_DIR, tracks[zlib.crc32(slug.encode()) % len(tracks)])

def resolve_music(value):
    """Explicit per-row track (the CSV's optional `music` column): a filename
    inside MUSIC_DIR or a full path. Returns None when the column is blank or
    the file doesn't exist (with a warning in that case) so the caller falls
    back to pick_track() instead of a typo silently changing the audio."""
    value = (value or "").strip()
    if not value:
        return None
    for cand in (value, os.path.join(MUSIC_DIR, value)):
        if os.path.isfile(cand):
            return cand
    print(f"        (warning: music '{value}' not found, falling back to pick_track)")
    return None

def make_video(png_path, mp4_path, seconds=5, music_path=None):
    """Still PNG -> seconds-long H.264 mp4, social-safe encoding.
    With music_path set, mixes in AAC audio with a half-second fade-out so
    the clip doesn't cut the track off hard. Without it, output is silent
    (the original behavior) — IG/TikTok then substitute their own generic
    audio, which is the exact problem this parameter exists to avoid."""
    base = [
        ffmpeg_bin(), "-y", "-loglevel", "error",
        "-loop", "1", "-i", png_path,
    ]
    video_opts = [
        "-c:v", "libx264", "-t", str(seconds),
        "-pix_fmt", "yuv420p", "-r", "30",
        "-vf", "scale=1080:1920",
    ]
    if music_path:
        cmd = base + ["-i", music_path] + video_opts + [
            "-c:a", "aac", "-b:a", "128k",
            "-af", f"afade=t=out:st={seconds - 0.5}:d=0.5",
            "-shortest", "-map", "0:v", "-map", "1:a",
            mp4_path,
        ]
    else:
        cmd = base + video_opts + [mp4_path]
    subprocess.run(cmd, check=True)

def make_slideshow(image_paths, mp4_path, seconds_per_slide=2.5, music_path=None):
    """Square PNGs -> one music-backed H.264 mp4 that cycles through every
    slide (pad-to-story letterboxing, same black bars as to_story()), for
    posting a carousel as a single TikTok video instead of TikTok's native
    multi-image mode. Same real-audio-over-silent-fallback reasoning as
    make_video(): a fade-out on the last half second, AAC audio muxed in."""
    n = len(image_paths)
    total = n * seconds_per_slide
    cmd = [ffmpeg_bin(), "-y", "-loglevel", "error"]
    for p in image_paths:
        cmd += ["-loop", "1", "-t", str(seconds_per_slide), "-i", p]

    pad_y = (STORY_H - CANVAS) // 2
    filter_parts = "".join(
        f"[{i}:v]scale={CANVAS}:{CANVAS},pad={CANVAS}:{STORY_H}:0:{pad_y}:color=black,setsar=1[v{i}];"
        for i in range(n)
    )
    concat_inputs = "".join(f"[v{i}]" for i in range(n))
    filter_complex = filter_parts + f"{concat_inputs}concat=n={n}:v=1:a=0[outv]"

    video_opts = [
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
    ]
    if music_path:
        cmd += ["-i", music_path, "-filter_complex", filter_complex,
                "-map", "[outv]", "-map", f"{n}:a"] + video_opts + [
            "-c:a", "aac", "-b:a", "128k",
            "-af", f"afade=t=out:st={total - 0.5}:d=0.5",
            "-shortest", mp4_path,
        ]
    else:
        cmd += ["-filter_complex", filter_complex, "-map", "[outv]"] + video_opts + [mp4_path]
    subprocess.run(cmd, check=True)

# ----------------------------------------------------------------------
# sample CSV
# ----------------------------------------------------------------------
SAMPLE = """pill,title,subtitle,line1,line2,highlight,footer
MEETUP,GAME NIGHT (RETRO THEME),Featuring: S-Cry-Ed + Bloody Roar,"Saturday, June 27, 6–11 PM","22011 Coolidge Hwy, Oak Park, MI",$10 entry,more info: @born_otaku77 · Detroit's Anime Club
GAMING,GOTTA GACHA,,"Sun–Thu 2–12AM · Fri–Sat 2–2AM","Warren, MI",WALK-INS WELCOME · MEMBERSHIP $39/MO,gottagacha.com · @gottagacha.official
"""

# ----------------------------------------------------------------------
# main
# ----------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Generate Neko Circuit event cards.")
    ap.add_argument("csv", nargs="?", help="path to events CSV")
    ap.add_argument("--out", default="./cards_out", help="output folder")
    ap.add_argument("--no-video", action="store_true", help="skip mp4 generation")
    ap.add_argument("--no-music", action="store_true",
                    help="generate silent mp4s (old behavior) even if music/ has tracks")
    ap.add_argument("--carousel", action="store_true",
                    help="output one IG carousel: cover slide + one slide per event")
    ap.add_argument("--cover-title", default="THIS WEEK IN THE MIDWEST",
                    help="headline on the carousel cover slide")
    ap.add_argument("--cover-sub", default="",
                    help="cyan subtitle on the cover (e.g. a date range)")
    ap.add_argument("--carousel-video", action="store_true",
                    help="also render carousel_tiktok.mp4: all slides in order, "
                         "real music muxed in (pick_track), for TikTok as one "
                         "video instead of native multi-image mode")
    ap.add_argument("--slide-seconds", type=float, default=2.5,
                    help="seconds each slide is shown in --carousel-video (default 2.5)")
    args = ap.parse_args()

    if not args.csv:
        sample_path = os.path.join(HERE, "events_sample.csv")
        with open(sample_path, "w", encoding="utf-8") as fh:
            fh.write(SAMPLE)
        print(f"No CSV given. Wrote a starter file:\n  {sample_path}")
        print("Fill it in, then run:  python3 make_cards.py events_sample.csv")
        return

    with open(args.csv, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if not rows:
        print("CSV has no rows.")
        return

    os.makedirs(args.out, exist_ok=True)

    # ---------------- CAROUSEL MODE ----------------
    if args.carousel:
        folder = os.path.join(args.out, "carousel")
        os.makedirs(folder, exist_ok=True)
        print(f"Building carousel: cover + {len(rows)} event slide(s) into {folder}/\n")

        # slide 1 = cover
        cover = render_cover(args.cover_title, args.cover_sub)
        cover_path = os.path.join(folder, "slide_01_cover.png")
        cover.save(cover_path)
        print(f"  slide_01_cover.png   ({args.cover_title})")
        slide_paths = [cover_path]

        # slides 2..N = one square per event, in CSV order
        for i, row in enumerate(rows, start=2):
            slide = render_card(row)
            stem = row.get('slug', '').strip() or row.get('title', 'event')
            name = f"slide_{i:02d}_{slugify(stem)}.png"
            slide_path = os.path.join(folder, name)
            slide.save(slide_path)
            slide_paths.append(slide_path)
            print(f"  {name}")

        # caption file: cover line + each event one line + funnel CTA
        cap = os.path.join(folder, "caption.txt")
        with open(cap, "w", encoding="utf-8") as fh:
            fh.write(f"{args.cover_title}")
            if args.cover_sub:
                fh.write(f" — {args.cover_sub}")
            fh.write(" 📅\n\n")
            for row in rows:
                t = row.get("title", "").strip()
                l1 = row.get("line1", "").strip()
                l2 = row.get("line2", "").strip()
                bits = " · ".join(b for b in (l1, l2) if b)
                fh.write(f"• {t}" + (f" — {bits}" if bits else "") + "\n")
            fh.write("\nComment SYNC for the full Midwest con calendar 📅\n")
            fh.write("#MichiganAnime #313Circuit #DetroitNerdScene\n")
        print(f"\n  caption.txt")

        if args.carousel_video:
            slug = slugify(args.cover_title) or "carousel"
            track = pick_track(slug)
            video_path = os.path.join(folder, "carousel_tiktok.mp4")
            make_slideshow(slide_paths, video_path,
                            seconds_per_slide=args.slide_seconds, music_path=track)
            total = len(slide_paths) * args.slide_seconds
            print(f"\n  carousel_tiktok.mp4   ({len(slide_paths)} slides x "
                  f"{args.slide_seconds}s = {total:.1f}s)")
            if track:
                print(f"        (audio: {os.path.basename(track)})")
            else:
                print(f"        (audio: none — add mp3s to {MUSIC_DIR})")

        print("\nDone. Upload slides in order (01, 02, 03…) as one IG carousel.")
        print("Caption is in caption.txt — edit the hashtags per post.")
        return

    # ---------------- SINGLE-CARD MODE (default) ----------------
    print(f"Generating {len(rows)} event(s) into {args.out}/\n")

    for i, row in enumerate(rows, 1):
        title = row.get("title", f"event_{i}")
        slug = slugify(row.get("slug", "")) if row.get("slug", "").strip() else slugify(title)
        folder = os.path.join(args.out, slug)
        os.makedirs(folder, exist_ok=True)

        square = render_card(row)
        sq_path = os.path.join(folder, f"{slug}_IG_square.png")
        square.save(sq_path)

        story = to_story(square)
        st_path = os.path.join(folder, f"{slug}_IG_story.png")
        story.save(st_path)

        files = [os.path.basename(sq_path), os.path.basename(st_path)]

        if not args.no_video:
            reel = os.path.join(folder, f"{slug}_reel.mp4")
            tik  = os.path.join(folder, f"{slug}_tiktok.mp4")
            track = None if args.no_music else (resolve_music(row.get("music", "")) or pick_track(slug))
            make_video(st_path, reel, music_path=track)
            subprocess.run(["cp", reel, tik], check=True)
            files += [os.path.basename(reel), os.path.basename(tik)]
            if track:
                print(f"        (audio: {os.path.basename(track)})")
            elif not args.no_music:
                print(f"        (audio: none — add mp3s to {MUSIC_DIR})")

        print(f"  [{i}/{len(rows)}] {slug}")
        for f in files:
            print(f"        {f}")

    print("\nDone. Each event has its own folder with the 4 files.")

if __name__ == "__main__":
    main()
