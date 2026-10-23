#!/usr/bin/env python3
"""
meta_setup.py - turn a short-lived Meta token into a long-lived Page token and
store it in GitHub Secrets, without ever printing or pasting a secret.
=============================================================================
One-time setup helper for posting to a Facebook Page and its linked Instagram
professional account through the Graph API (Facebook Login path).

What it does:
  1. Exchanges the short-lived user token for a long-lived user token.
  2. Lists the Pages that user manages; picks yours (--page-name).
  3. Reads that Page's own access token and its linked Instagram user id.
  4. Checks the Page token with debug_token (expiry and granted scopes).
  5. With --store-secrets, saves META_PAGE_TOKEN, META_PAGE_ID and META_IG_USER_ID
     into the GitHub repo's Actions secrets via the gh CLI. Nothing secret is printed.

Usage:
  export META_APP_ID=...            # App dashboard > App settings > Basic
  read -rs META_APP_SECRET; export META_APP_SECRET      # type it, it is not echoed
  read -rs META_SHORT_TOKEN; export META_SHORT_TOKEN    # from Graph API Explorer
  meta_setup.py --page-name "Neko Circuit"                   # dry run, prints a summary
  meta_setup.py --page-name "Neko Circuit" --store-secrets --repo jamar16/neko-circuit

Env: META_API_VERSION (default v24.0). Run again any time the token is invalidated
(a password change, removed Page role, or app deauthorization kills Page tokens).
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

VERSION = os.environ.get("META_API_VERSION", "v24.0")
GRAPH = f"https://graph.facebook.com/{VERSION}"


def get(path, **params):
    url = f"{GRAPH}/{path}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            msg = json.loads(body)["error"]["message"]
        except Exception:
            msg = body[:200]
        sys.exit(f"Meta API error on {path}: {msg}")


def need(name):
    v = os.environ.get(name, "").strip()
    if not v:
        sys.exit(f"Set {name} in the environment first (see the usage in this file's header).")
    return v


def set_secret(repo, name, value):
    r = subprocess.run(["gh", "secret", "set", name, "--repo", repo], input=value, text=True, capture_output=True)
    if r.returncode:
        sys.exit(f"gh secret set {name} failed: {r.stderr.strip()}")
    print(f"  stored secret {name}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--page-name", help="part of the Facebook Page name (needed if you manage several Pages)")
    ap.add_argument("--store-secrets", action="store_true")
    ap.add_argument("--repo", default="jamar16/neko-circuit")
    a = ap.parse_args()

    app_id, secret, short = need("META_APP_ID"), need("META_APP_SECRET"), need("META_SHORT_TOKEN")

    ll = get("oauth/access_token", grant_type="fb_exchange_token", client_id=app_id,
             client_secret=secret, fb_exchange_token=short)["access_token"]
    pages = get("me/accounts", access_token=ll, fields="id,name,access_token", limit=100).get("data", [])
    if not pages:
        sys.exit("No Pages found. The token needs pages_show_list and you need full control of the Page.")
    if a.page_name:
        pages = [p for p in pages if a.page_name.lower() in p["name"].lower()]
    if len(pages) != 1:
        names = ", ".join(p["name"] for p in pages) or "none"
        sys.exit(f"Expected exactly one matching Page, got {len(pages)} ({names}). Use --page-name.")
    page = pages[0]

    ig = get(page["id"], access_token=page["access_token"], fields="instagram_business_account").get("instagram_business_account")
    dbg = get("debug_token", input_token=page["access_token"], access_token=f"{app_id}|{secret}")["data"]

    exp = dbg.get("expires_at", 0)
    print(f"Page:            {page['name']} (id {page['id']})")
    print(f"Instagram user:  {ig['id'] if ig else 'NOT LINKED - link the IG account to this Page first'}")
    print(f"Token valid:     {dbg.get('is_valid')}")
    print(f"Token expires:   {'never (while the user stays admin and keeps the app)' if exp == 0 else exp}")
    print(f"Scopes granted:  {', '.join(dbg.get('scopes', []))}")
    want = {"pages_manage_posts", "pages_read_engagement", "instagram_basic", "instagram_content_publish", "pages_show_list"}
    missing = sorted(want - set(dbg.get("scopes", [])))
    if missing:
        print(f"MISSING scopes:  {', '.join(missing)} (regenerate the token with these ticked)")
    if not ig or missing or not dbg.get("is_valid"):
        sys.exit(1)
    if a.store_secrets:
        print(f"Storing secrets in {a.repo}:")
        set_secret(a.repo, "META_PAGE_TOKEN", page["access_token"])
        set_secret(a.repo, "META_PAGE_ID", page["id"])
        set_secret(a.repo, "META_IG_USER_ID", ig["id"])
    else:
        print("Dry run: add --store-secrets to save these to GitHub Secrets.")


if __name__ == "__main__":
    main()
