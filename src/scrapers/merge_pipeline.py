"""
PitchGuard — Data Merge & Clean Pipeline
=========================================
Merges squad list + player bios + injury history into two clean output files:
  - data/processed/players_clean.csv    (one row per player)
  - data/processed/injuries_clean.csv   (one row per injury event)

Usage:
    python merge_pipeline.py

Requirements:
    pip install pandas openpyxl unidecode
"""

import re
import logging
import pandas as pd
from pathlib import Path
from unidecode import unidecode

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("merge_pipeline")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
RAW_DIR       = Path("data/raw")
PROCESSED_DIR = Path("data/processed")
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

SQUAD_FILE   = RAW_DIR / "squad_data_combined.csv"
BIO_FILE     = RAW_DIR / "player_bios.csv"
INJURY_FILE  = RAW_DIR / "injury_history.csv"

OUT_PLAYERS  = PROCESSED_DIR / "players_clean.csv"
OUT_INJURIES = PROCESSED_DIR / "injuries_clean.csv"

# ---------------------------------------------------------------------------
# Impact injury keywords
# ---------------------------------------------------------------------------
IMPACT_KEYWORDS = [
    "acl", "anterior cruciate", "cruciate ligament",
    "hamstring",
    "ankle ligament", "ankle injury",
    "meniscus", "meniscal",
    "knee ligament", "knee injury",
    "muscle tear", "muscle rupture",
    "adductor", "quad", "quadricep",
    "calf", "thigh", "groin",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def normalise_name(name: str) -> str:
    """Lowercase, remove accents, strip suffixes, collapse whitespace."""
    if not isinstance(name, str):
        return ""
    name = unidecode(name)
    name = name.lower().strip()
    name = re.sub(r"\b(jr\.?|sr\.?|ii|iii|iv)\b", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def parse_date(val: str) -> str:
    """Try multiple date formats and return YYYY-MM-DD or empty string."""
    if not isinstance(val, str) or not val.strip():
        return ""
    val = val.strip()
    # Remove age suffix like "(30)" that TM sometimes appends
    val = re.sub(r"\s*\(\d+\)", "", val).strip()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%m/%d/%Y", "%d.%m.%Y"):
        try:
            return pd.to_datetime(val, format=fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    # Last resort: let pandas guess
    try:
        return pd.to_datetime(val, dayfirst=True).strftime("%Y-%m-%d")
    except Exception:
        return ""


def parse_height(val) -> int | None:
    """Convert height string like '183' or '1,83 m' to integer cm."""
    if pd.isna(val):
        return None
    val = str(val).replace(",", ".").replace(" m", "").strip()
    try:
        f = float(val)
        return int(f * 100) if f < 10 else int(f)   # handle both 1.83 and 183
    except ValueError:
        return None


def is_impact(injury_type: str) -> int:
    """Return 1 if injury type matches any impact keyword, else 0."""
    if not isinstance(injury_type, str):
        return 0
    lower = injury_type.lower()
    return int(any(kw in lower for kw in IMPACT_KEYWORDS))


# ---------------------------------------------------------------------------
# Step 1 — Load raw files
# ---------------------------------------------------------------------------
def load_files():
    log.info("Loading raw files...")

    squad_df = pd.read_csv(SQUAD_FILE, dtype=str)
    squad_df.columns = [c.strip().lower().replace(" ", "_") for c in squad_df.columns]
    log.info(f"  Squad:   {len(squad_df)} rows")

    bio_df = pd.read_csv(BIO_FILE, dtype=str)
    bio_df.columns = [c.strip().lower().replace(" ", "_") for c in bio_df.columns]
    log.info(f"  Bios:    {len(bio_df)} rows")

    injury_df = pd.read_csv(INJURY_FILE, dtype=str)
    injury_df.columns = [c.strip().lower().replace(" ", "_").replace(" ", "_") for c in injury_df.columns]
    # Rename messy column names
    injury_df = injury_df.rename(columns={
        "club_injured_for": "club_injured_for",
        "club_injured_for ": "club_injured_for",
        "club injured for": "club_injured_for",
        "club injured for ": "club_injured_for",
    })
    log.info(f"  Injuries: {len(injury_df)} rows")

    return squad_df, bio_df, injury_df


# ---------------------------------------------------------------------------
# Step 2 — Clean squad + bio, merge into players table
# ---------------------------------------------------------------------------
def build_players_table(squad_df: pd.DataFrame, bio_df: pd.DataFrame) -> pd.DataFrame:
    log.info("Building players table...")

    # Keep only needed columns from squad
    squad_cols = ["player_tm_id", "club_name", "club_tm_id", "player_name",
                  "position", "nationality", "market_value", "shirt_number", "profile_url"]
    squad_cols = [c for c in squad_cols if c in squad_df.columns]
    squad_df = squad_df[squad_cols].copy()

    # Drop scrape_status from bio, keep useful bio columns
    bio_keep = ["player_tm_id", "dob", "age", "height_cm",
                "nationality", "second_nationality", "detailed_position",
                "strong_foot", "current_club"]
    bio_keep = [c for c in bio_keep if c in bio_df.columns]
    bio_df = bio_df[bio_keep].copy()

    # Deduplicate both on player_tm_id before merging
    squad_df = squad_df.drop_duplicates(subset=["player_tm_id"])
    bio_df   = bio_df.drop_duplicates(subset=["player_tm_id"])

    # Merge on player_tm_id
    players = squad_df.merge(bio_df, on="player_tm_id", how="left", suffixes=("_squad", "_bio"))

    # Resolve duplicate nationality columns — prefer bio nationality
    if "nationality_bio" in players.columns:
        players["nationality"] = players["nationality_bio"].fillna(players.get("nationality_squad", ""))
        players.drop(columns=["nationality_bio", "nationality_squad"], errors="ignore", inplace=True)

    # Clean name
    players["player_name_normalised"] = players["player_name"].apply(normalise_name)

    # Parse DOB
    players["dob"] = players["dob"].apply(parse_date)

    # Parse height
    players["height_cm"] = players["height_cm"].apply(parse_height)

    # Clean age — remove anything that's not a number
    players["age"] = players["age"].apply(
        lambda x: re.sub(r"[^\d]", "", str(x)) if isinstance(x, str) else x
    )
    players["age"] = pd.to_numeric(players["age"], errors="coerce")

    # Validate height range
    players.loc[
        players["height_cm"].notna() &
        ((players["height_cm"] < 155) | (players["height_cm"] > 210)),
        "height_cm"
    ] = None

    # Validate age range
    players.loc[
        players["age"].notna() &
        ((players["age"] < 15) | (players["age"] > 45)),
        "age"
    ] = None

    log.info(f"  Players table: {len(players)} rows")
    return players


# ---------------------------------------------------------------------------
# Step 3 — Clean injuries table
# ---------------------------------------------------------------------------
def build_injuries_table(injury_df: pd.DataFrame, players: pd.DataFrame) -> pd.DataFrame:
    log.info("Building injuries table...")

    inj = injury_df.copy()

    # Normalise name for matching
    inj["player_name_normalised"] = inj["player_name"].apply(normalise_name)

    # Parse dates
    inj["injury_date"] = inj["injury_date"].apply(parse_date)
    inj["return_date"]  = inj["return_date"].apply(parse_date)

    # games_missed → integer
    inj["games_missed"] = pd.to_numeric(inj["games_missed"], errors="coerce").astype("Int64")

    # Impact injury flag
    inj["is_impact_injury"] = inj["injury_type"].apply(is_impact)

    # Ensure player_tm_id is present — if missing, join from players via normalised name
    if "player_tm_id" not in inj.columns or inj["player_tm_id"].isna().all():
        name_to_id = players.set_index("player_name_normalised")["player_tm_id"].to_dict()
        inj["player_tm_id"] = inj["player_name_normalised"].map(name_to_id)
    else:
        inj["player_tm_id"] = inj["player_tm_id"].astype(str).str.strip()

    # Drop rows with no player_tm_id (completely unmatched players)
    unmatched = inj["player_tm_id"].isna().sum()
    if unmatched:
        log.warning(f"  {unmatched} injury rows could not be matched to a player — dropping.")
    inj = inj.dropna(subset=["player_tm_id"])

    # Final column order
    final_cols = [
        "player_tm_id", "player_name", "current_club", "season",
        "injury_type", "injury_date", "return_date",
        "games_missed", "club_injured_for", "is_impact_injury"
    ]
    final_cols = [c for c in final_cols if c in inj.columns]
    inj = inj[final_cols]

    log.info(f"  Injuries table: {len(inj)} rows  |  Impact injuries: {inj['is_impact_injury'].sum()}")
    return inj


# ---------------------------------------------------------------------------
# Step 4 — Save
# ---------------------------------------------------------------------------
def save(players: pd.DataFrame, injuries: pd.DataFrame) -> None:
    players.to_csv(OUT_PLAYERS,  index=False, encoding="utf-8-sig")
    injuries.to_csv(OUT_INJURIES, index=False, encoding="utf-8-sig")
    log.info(f"✅ Saved: {OUT_PLAYERS}")
    log.info(f"✅ Saved: {OUT_INJURIES}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    squad_df, bio_df, injury_df = load_files()
    players  = build_players_table(squad_df, bio_df)
    injuries = build_injuries_table(injury_df, players)
    save(players, injuries)

    # Quick summary
    log.info("\n── Summary ──────────────────────────────────")
    log.info(f"Total players:          {len(players)}")
    log.info(f"Players with bios:      {players['dob'].notna().sum()}")
    log.info(f"Total injury events:    {len(injuries)}")
    log.info(f"Impact injury events:   {injuries['is_impact_injury'].sum()}")
    log.info(f"Players with injuries:  {injuries['player_tm_id'].nunique()}")
    log.info("─────────────────────────────────────────────")


if __name__ == "__main__":
    main()
