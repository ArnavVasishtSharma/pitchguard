"""
PitchGuard — Transfermarkt Stats Scraper v3
============================================
Writes each player to a separate small CSV file instead of one giant xlsx.
This avoids the openpyxl memory issue with large workbooks.

Output: one CSV per player in:
  data/raw/player_stats_output/player_{no}_{name}.csv

After all scraping is done, combine with combine_outputs.py
"""

import time
import random
import re
import logging
from pathlib import Path

import pandas as pd
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("tm_v3")

# ── Config ────────────────────────────────────────────────────────────────────
INPUT_FILE = r"C:\Users\Aarya\Downloads\Pitchguard\pitchguard\src\scrapers\data\raw\player_stats_links.xlsx"
OUTPUT_DIR = r"C:\Users\Aarya\Downloads\Pitchguard\pitchguard\src\scrapers\data\raw\player_stats_output"
START_FROM = 1272

DELAY_MIN = 7.0
DELAY_MAX = 12.0
EXTRA_EVERY = 20
EXTRA_DELAY = 45.0


# ── Browser ───────────────────────────────────────────────────────────────────
def build_driver() -> uc.Chrome:
    opts = uc.ChromeOptions()
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--lang=en-GB")
    driver = uc.Chrome(options=opts, version_main=149)
    driver.set_window_size(1400, 900)
    return driver


def dismiss_cookies(driver: uc.Chrome) -> None:
    try:
        btn = WebDriverWait(driver, 8).until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[contains(.,'Agree') or contains(.,'Accept') "
                    "or contains(.,'Consent') or @id='onetrust-accept-btn-handler']",
                )
            )
        )
        btn.click()
        time.sleep(1.5)
        log.info("Cookie banner dismissed.")
    except TimeoutException:
        pass


# ── Parser ────────────────────────────────────────────────────────────────────
MINUTES_RE = re.compile(r"^[\d,]+'$")
NUMERIC_RE = re.compile(r"^[\d,]+$")
DASH_RE = re.compile(r"^-+$")
STOP_WORDS = {
    "total:",
    "total",
    "compact",
    "detailed",
    "matchday",
    "date",
    "venue",
    "home team",
    "away team",
}


def is_value(s: str) -> bool:
    return bool(MINUTES_RE.match(s) or NUMERIC_RE.match(s) or DASH_RE.match(s))


def is_season(s: str) -> bool:
    return bool(
        re.match(r"^\d{2}/\d{2}$", s)
        or re.match(r"^\d{4}$", s)
        or re.match(r"^\d{4}/\d{2}$", s)
    )


def parse_innertext(text: str) -> list[dict]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    start = None
    for i, line in enumerate(lines):
        if "stats of" in line.lower():
            start = i
            break
    if start is None:
        return []

    rows = []
    i = start + 1
    current_season = ""
    current_comp = ""
    values_buf: list[str] = []

    def flush():
        if not current_comp or not values_buf:
            return
        v = values_buf + ["-"] * 7

        def clean(s):
            return s.replace(",", "").replace("'", "").strip()

        rows.append(
            {
                "season": current_season,
                "competition": current_comp,
                "appearances": clean(v[0]) if NUMERIC_RE.match(v[0]) else "0",
                "goals": clean(v[1]),
                "assists": clean(v[2]),
                "yellow": clean(v[3]),
                "yellow_red": clean(v[4]),
                "red": clean(v[5]),
                "minutes": clean(v[6]).replace("'", "") if len(v) > 6 else "",
            }
        )

    while i < len(lines):
        line = lines[i]

        if line.lower().startswith("total"):
            flush()
            break

        if line.lower() in STOP_WORDS or line.lower().startswith("filter"):
            i += 1
            continue

        if is_season(line):
            flush()
            current_season = line
            current_comp = ""
            values_buf = []
            i += 1
            continue

        if is_value(line):
            values_buf.append(line)
            if len(values_buf) >= 7:
                flush()
                current_comp = ""
                values_buf = []
        else:
            if current_comp and values_buf:
                flush()
            current_comp = line
            values_buf = []

        i += 1

    return rows


# ── Scrape one player ─────────────────────────────────────────────────────────
def scrape_player(driver, url, player_name, cookies_dismissed):
    log.info(f"  GET {url}")
    try:
        driver.get(url)
    except Exception as e:
        log.warning(f"  Load error: {e}")
        return []

    if not cookies_dismissed[0]:
        dismiss_cookies(driver)
        cookies_dismissed[0] = True

    # Wait for page to settle
    time.sleep(3)

    text = ""
    found = False
    for attempt in range(2):
        for _ in range(40):
            try:
                text = driver.execute_script("return document.body.innerText;") or ""
                tl = text.lower()
                if "stats of" in tl or "performance data" in tl or "appearances" in tl:
                    found = True
                    break
            except Exception:
                pass
            time.sleep(1)

        if found:
            break

        # Check for Cloudflare
        title = (driver.title or "").lower()
        if "just a moment" in title or "captcha" in title:
            log.warning(f"  Cloudflare/captcha on attempt {attempt+1} — waiting 45s")
            time.sleep(45)
            try:
                driver.get(url)
                time.sleep(4)
            except Exception:
                pass
            continue

        if not found and attempt == 0:
            # Try refreshing once
            log.warning("  Stats not found on attempt 1 — refreshing page...")
            try:
                driver.refresh()
                time.sleep(5)
            except Exception:
                pass

    if not found:
        # Last resort: log what we got for debugging
        snippet = text[:300].replace("\n", " ") if text else "(empty)"
        log.warning(f"  Stats never appeared for {player_name}")
        log.warning(f"  Page snippet: {snippet}")
        return []

    rows = parse_innertext(text)
    log.info(f"  ✓ {len(rows)} competition rows")
    return rows


# ── Write single player CSV ───────────────────────────────────────────────────
def write_player_csv(
    output_dir: str, player_no: str, player_name: str, tm_id: str, rows: list[dict]
) -> None:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    # Safe filename
    safe_name = re.sub(r"[^\w\s-]", "", player_name).strip().replace(" ", "_")
    filepath = out / f"player_{player_no}_{safe_name}.csv"

    # Build vertical format matching your xlsx layout
    col_data = [player_no, player_name, tm_id]
    for r in rows:
        col_data.append(r["season"])
        col_data.append("")
        col_data.append(r["competition"])
        col_data.append("")
        col_data.append(r["appearances"])
        col_data.append(r["goals"])
        col_data.append(r["assists"])
        col_data.append(r["yellow"])
        col_data.append(r["yellow_red"])
        col_data.append(r["red"])
        col_data.append(r["minutes"])

    pd.DataFrame({"data": col_data}).to_csv(
        filepath, index=False, header=False, encoding="utf-8-sig"
    )
    log.info(f"  💾 Saved → {filepath.name}")


# ── Already done check ────────────────────────────────────────────────────────
def get_done_players(output_dir: str) -> set[str]:
    out = Path(output_dir)
    if not out.exists():
        return set()
    done = set()
    for f in out.glob("player_*.csv"):
        # extract player number from filename: player_1500_Name.csv
        m = re.match(r"player_(\d+)_", f.name)
        if m:
            done.add(m.group(1))
    return done


# ── Main ──────────────────────────────────────────────────────────────────────
def run():
    df = pd.read_excel(INPUT_FILE, dtype=str).fillna("")
    df.columns = ["no", "player_name", "club", "tm_id", "stats_url"] + list(
        range(len(df.columns) - 5)
    )

    df["no_int"] = pd.to_numeric(df["no"], errors="coerce")
    df = df[df["no_int"] >= START_FROM].reset_index(drop=True)
    log.info(f"{len(df)} players from No. {START_FROM} onwards")

    # Skip already scraped
    done = get_done_players(OUTPUT_DIR)
    if done:
        log.info(f"Skipping {len(done)} already scraped players")
        df = df[~df["no"].isin(done)].reset_index(drop=True)
    log.info(f"{len(df)} players left to scrape")

    if df.empty:
        log.info("All done!")
        return

    driver = build_driver()
    cookies_dismissed = [False]

    try:
        for i, row in df.iterrows():
            player_no = str(row["no"]).strip()
            player_name = str(row["player_name"]).strip()
            tm_id = str(row["tm_id"]).strip()
            url = str(row["stats_url"]).strip()

            if not url or not tm_id:
                log.warning(f"[{player_no}] {player_name} — missing data, skipping")
                continue

            log.info(f"[{player_no}] {player_name} (tm_id={tm_id})")

            delay = random.uniform(DELAY_MIN, DELAY_MAX)
            log.info(f"  Waiting {delay:.1f}s...")
            time.sleep(delay)

            rows = scrape_player(driver, url, player_name, cookies_dismissed)

            if rows:
                write_player_csv(OUTPUT_DIR, player_no, player_name, tm_id, rows)
            else:
                log.warning(f"  No data for {player_name}")

            count = i + 1
            if count % EXTRA_EVERY == 0:
                log.info(f"  🛑 Cooldown {EXTRA_DELAY}s after {count} players...")
                time.sleep(EXTRA_DELAY)

    except KeyboardInterrupt:
        log.info("\n⚠️  Ctrl+C — all completed players already saved as individual CSVs")
    finally:
        try:
            driver.quit()
        except Exception:
            pass
        log.info("Done.")


if __name__ == "__main__":
    run()
