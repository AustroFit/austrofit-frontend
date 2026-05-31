#!/usr/bin/env python3
"""
fix_articles_seo.py — AustroFit Directus Article SEO Fixes

1. Sets release_date = 2026-05-31 for all 250 articles (currently null)
2. Removes ChatGPT artifacts <!-- :contentReference[oaicite:N]{index=N} --> (15 articles)
3. Converts inline <p><strong>Hinweis:</strong>...</p> to <h2>Hinweis</h2> (131 articles)
   so the frontend JS disclaimer-box styling triggers correctly
"""

import json
import re
import time
import sys
import requests

CMS_URL = "https://cms.austrofit.at"
TOKEN = "QCLK1MCiJDBFiD34g8us_TFdPqrMb3El"  # Admin token — Zugriff auf alle Collections
RELEASE_DATE = "2026-05-31T00:00:00"
BATCH_SIZE = 50

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

ARTIFACT_RE = re.compile(
    r"\s*<!--\s*:contentReference\[oaicite:\d+\]\{index=\d+\}\s*-->",
    re.IGNORECASE,
)

H2_HINWEIS_RE = re.compile(r"<h[23][^>]*>\s*(Hinweis|Disclaimer)", re.IGNORECASE)

# Matches: <p...><strong...>Hinweis:</strong> text </p>  (inline form)
INLINE_HINWEIS_RE = re.compile(
    r"<p[^>]*>\s*<strong[^>]*>Hinweis\s*[:/]\s*</strong>\s*(.*?)</p>",
    re.IGNORECASE | re.DOTALL,
)


def fetch_all_articles() -> list[dict]:
    items = []
    offset = 0
    while True:
        resp = requests.get(
            f"{CMS_URL}/items/articles",
            headers=HEADERS,
            params={
                "fields": "id,slug,content,release_date",
                "filter[status][_eq]": "published",
                "limit": 200,
                "offset": offset,
            },
            timeout=30,
        )
        resp.raise_for_status()
        batch = resp.json().get("data", [])
        items.extend(batch)
        print(f"  Fetched {len(items)} articles so far...")
        if len(batch) < 200:
            break
        offset += 200
    return items


def fix_content(content: str) -> tuple[str, list[str]]:
    """Apply all content fixes. Returns (new_content, applied_fix_names)."""
    if not content:
        return content, []

    fixes = []

    # Fix 1: Remove ChatGPT artifacts
    if ARTIFACT_RE.search(content):
        content = ARTIFACT_RE.sub("", content).rstrip()
        fixes.append("artifact")

    # Fix 2: Convert inline Hinweis → H2 (only if no H2 Hinweis already present)
    if not H2_HINWEIS_RE.search(content) and INLINE_HINWEIS_RE.search(content):
        content = INLINE_HINWEIS_RE.sub(
            lambda m: f"<h2>Hinweis</h2>\n<p>{m.group(1).strip()}</p>",
            content,
        )
        fixes.append("disclaimer")

    return content, fixes


def patch_batch(patches: list[dict]) -> bool:
    resp = requests.patch(
        f"{CMS_URL}/items/articles",
        headers=HEADERS,
        json=patches,
        timeout=60,
    )
    if not resp.ok:
        print(f"  ERROR {resp.status_code}: {resp.text[:300]}")
        return False
    return True


def main():
    print("=== AustroFit Article SEO Fix ===\n")
    print("Fetching articles from Directus...")
    articles = fetch_all_articles()
    print(f"Total: {len(articles)} articles\n")

    patches = []
    stats = {"date": 0, "artifact": 0, "disclaimer": 0, "unchanged": 0}
    artifact_slugs = []

    for a in articles:
        patch: dict = {"id": a["id"]}
        changed = False

        if a.get("release_date") is None:
            patch["release_date"] = RELEASE_DATE
            stats["date"] += 1
            changed = True

        new_content, fixes = fix_content(a.get("content") or "")
        if fixes:
            patch["content"] = new_content
            changed = True
            if "artifact" in fixes:
                stats["artifact"] += 1
                artifact_slugs.append(f"  ID {a['id']}: {a['slug']}")
            if "disclaimer" in fixes:
                stats["disclaimer"] += 1

        if changed:
            patches.append(patch)
        else:
            stats["unchanged"] += 1

    print("--- Changes planned ---")
    print(f"  release_date set (null -> 2026-05-31): {stats['date']}")
    print(f"  ChatGPT artifacts removed:             {stats['artifact']}")
    if artifact_slugs:
        for s in artifact_slugs:
            print(s)
    print(f"  Inline disclaimers -> H2:               {stats['disclaimer']}")
    print(f"  No change needed:                      {stats['unchanged']}")
    print(f"  Total patches:                         {len(patches)}\n")

    if not patches:
        print("Nothing to patch. Done.")
        return

    print(f"Sending PATCH requests ({BATCH_SIZE}/batch)...")
    total_ok = 0
    for i in range(0, len(patches), BATCH_SIZE):
        batch = patches[i : i + BATCH_SIZE]
        end = min(i + BATCH_SIZE, len(patches))
        print(f"  Batch {i // BATCH_SIZE + 1}: items {i + 1}–{end}...", end=" ", flush=True)
        if patch_batch(batch):
            print("OK")
            total_ok += len(batch)
        else:
            print("FAILED — stopping.")
            sys.exit(1)
        if i + BATCH_SIZE < len(patches):
            time.sleep(0.3)

    print(f"\nDone. {total_ok}/{len(patches)} articles patched successfully.")


if __name__ == "__main__":
    main()
