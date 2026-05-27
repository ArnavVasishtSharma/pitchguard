"""
Transfermarkt Scraper
---------------------
Scrapes player bio, injury history, and current squad data
from Transfermarkt for the 6 target leagues.

Usage:
    python src/scrapers/transfermarkt_scraper.py --league pl --output data/raw/
"""

import argparse
import time
import logging
from pathlib import Path

import requests
import pandas as pd
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; PitchGuard Research Bot/1.0; "
        "+https://github.com/YOUR_USERNAME/pitchguard)"
    )
}

# Transfermarkt league codes
LEAGUE_IDS = {
    "pl": "GB1",       # Premier League
    "la_liga": "ES1",  # La Liga
    "bundesliga": "L1",
    "serie_a": "IT1",
    "ligue_1": "FR1",
    "super_lig": "TR1",
}

DELAY_SECONDS = 2  # Polite crawl delay


def get_clubs(league_id: str) -> list[dict]:
    """Return list of {name, url} for all clubs in a league."""
    url = f"https://www.transfermarkt.com/league/startseite/wettbewerb/{league_id}"
    logger.info(f"Fetching clubs for league {league_id}")
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")
    clubs = []
    for row in soup.select("table.items tbody tr"):
        link = row.select_one("td.hauptlink a")
        if link:
            clubs.append({"name": link.text.strip(), "url": link["href"]})
    logger.info(f"Found {len(clubs)} clubs")
    return clubs


def get_squad(club_url: str) -> pd.DataFrame:
    """Scrape squad bio data for a single club."""
    url = f"https://www.transfermarkt.com{club_url}"
    time.sleep(DELAY_SECONDS)
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")
    rows = []
    for row in soup.select("table.items tbody tr.odd, table.items tbody tr.even"):
        cells = row.find_all("td")
        if len(cells) < 5:
            continue
        rows.append({
            "name": row.select_one(".hauptlink a").text.strip() if row.select_one(".hauptlink a") else None,
            "position": cells[4].text.strip() if len(cells) > 4 else None,
            "age": cells[5].text.strip() if len(cells) > 5 else None,
            "height": cells[6].text.strip() if len(cells) > 6 else None,
            "nationality": cells[7].text.strip() if len(cells) > 7 else None,
            "market_value": cells[-1].text.strip() if cells else None,
        })
    return pd.DataFrame(rows)


def get_injury_history(player_url: str) -> pd.DataFrame:
    """Scrape injury log for a single player."""
    url = f"https://www.transfermarkt.com{player_url}/verletzungen/spieler/"
    time.sleep(DELAY_SECONDS)
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")
    rows = []
    for row in soup.select("table.items tbody tr"):
        cells = row.find_all("td")
        if len(cells) < 5:
            continue
        rows.append({
            "season": cells[0].text.strip(),
            "injury_type": cells[1].text.strip(),
            "from_date": cells[2].text.strip(),
            "to_date": cells[3].text.strip(),
            "games_missed": cells[4].text.strip(),
        })
    return pd.DataFrame(rows)


def main(league: str, output_dir: str) -> None:
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    league_id = LEAGUE_IDS.get(league)
    if not league_id:
        raise ValueError(f"Unknown league '{league}'. Valid: {list(LEAGUE_IDS.keys())}")

    clubs = get_clubs(league_id)
    all_squads = []

    for club in clubs:
        logger.info(f"Scraping squad: {club['name']}")
        try:
            df = get_squad(club["url"])
            df["club"] = club["name"]
            df["league"] = league
            all_squads.append(df)
        except Exception as e:
            logger.warning(f"Failed for {club['name']}: {e}")

    if all_squads:
        combined = pd.concat(all_squads, ignore_index=True)
        out_file = output_path / f"{league}_squad_bio.csv"
        combined.to_csv(out_file, index=False)
        logger.info(f"Saved {len(combined)} players to {out_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape Transfermarkt squad and injury data")
    parser.add_argument("--league", required=True, choices=LEAGUE_IDS.keys())
    parser.add_argument("--output", default="data/raw/")
    args = parser.parse_args()
    main(args.league, args.output)
