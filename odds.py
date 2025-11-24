# odds.py
import argparse
import json
import os
import sys
import time
import re
from pathlib import Path
from typing import Optional
import pandas as pd
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# === Parse command-line arguments ===
def parse_matchup_arg():
    """
    Parse matchup argument from command line. Expected format: 'DET vs IND' or 'DET @ IND'.
    Returns a tuple of uppercase team codes or (None, None) if not provided/invalid.
    """
    parser = argparse.ArgumentParser(description="NBA props scraper", add_help=False)
    parser.add_argument("matchup", nargs="?", help="Target matchup, e.g. 'DET vs IND'")
    args, _ = parser.parse_known_args(sys.argv[1:])

    matchup_str = (args.matchup or "").strip() if args.matchup else None
    if not matchup_str:
        print("[MATCHUP] No matchup specified - will scrape all games")
        return None, None

    parts = re.split(r"\s+(?:vs|@|v)\s+", matchup_str, flags=re.IGNORECASE)
    if len(parts) == 2:
        team1 = parts[0].strip().upper()
        team2 = parts[1].strip().upper()
        print(f"[MATCHUP] Target matchup: {team1} vs {team2}")
        return team1, team2

    print(f"[MATCHUP] Invalid format: '{matchup_str}' (expected: 'DET vs IND')")
    return None, None


MATCHUP_TEAM1, MATCHUP_TEAM2 = parse_matchup_arg()


def parse_prop_arg():
    """
    Parse prop type argument from command line.
    Expected format: "Steals Blocks" or "Points" or "Rebounds".
    Returns: prop_type string or default value.
    """
    if len(sys.argv) > 2:
        prop_type = sys.argv[2].strip()
        print(f"[PROP] Target prop type: {prop_type}")
        return prop_type

    print("[PROP] No prop type specified - defaulting to 'Steals Blocks'")
    return "Steals Blocks"


TARGET_PROP_TYPE = parse_prop_arg()

# === Config ===
URL = "https://unabated.com/nba/props-preview"
# Use env var override or platform-aware defaults
def resolve_teams_file() -> Path:
    # Allow caller to override via env var
    env_override = os.getenv("TEAMS_FILE_PATH")
    if env_override:
        return Path(env_override).expanduser()

    repo_root = Path(__file__).resolve().parent
    local_default = repo_root / "public" / "data" / "teamsign2id.json"
    linux_runner_default = Path("/mnt/data/teamsign2id.json")

    if linux_runner_default.exists():
        return linux_runner_default
    return local_default

TEAMS_FILE = resolve_teams_file()
OUTPUT_JSON = "nba_props.json"
BROWSER_HEADLESS = False  # per request: headless: false

# sportsbook logo substrings mapped to a friendly book name
SPORTSBOOK_KEYWORDS = {
    "fan-duel": "FanDuel",
    "fanduel": "FanDuel",
    "draftkings": "DraftKings",
    "draft-kings": "DraftKings",
    "betmgm": "BetMGM",
    "bet-mgm": "BetMGM",
    "caesars": "Caesars",
    "prizepicks": "PrizePicks",
    "fanatics": "Fanatics",
    "fanatics-sportsbook": "Fanatics",
}

TARGET_SPORTSBOOKS = ["FanDuel", "DraftKings", "Fanatics"]
TARGET_SPORTSBOOKS_LOWER = {name.lower() for name in TARGET_SPORTSBOOKS}

MAX_EXPAND_RETRIES = 2

print("="*80)
print("NBA PROPS SCRAPER - STARTING")
print("="*80)
print(f"[CONFIG] URL: {URL}")
print(f"[CONFIG] Teams file: {TEAMS_FILE}")
print(f"[CONFIG] Output file: {OUTPUT_JSON}")
print(f"[CONFIG] Browser headless: {BROWSER_HEADLESS}")
print(f"[CONFIG] Sportsbook filters: {', '.join(sorted(SPORTSBOOK_KEYWORDS.keys()))}")
if MATCHUP_TEAM1 and MATCHUP_TEAM2:
    print(f"[CONFIG] Target matchup: {MATCHUP_TEAM1} vs {MATCHUP_TEAM2}")
print(f"[CONFIG] Target prop type: {TARGET_PROP_TYPE}")
print(f"[CONFIG] Target sportsbooks: {', '.join(TARGET_SPORTSBOOKS)}")
print("="*80)

# Load team mapping (list of {"team_id":..., "team_code": "LAL"}). We will convert to set of codes.
team_codes = set()
print("\n[TEAMS] Loading team codes from file...")
try:
    if not TEAMS_FILE.exists():
        print(f"[TEAMS] ERROR: File does not exist at {TEAMS_FILE}")
        teams_json = []
    else:
        print(f"[TEAMS] File found at {TEAMS_FILE}")
        with open(TEAMS_FILE, "r", encoding="utf-8") as f:
            teams_json = json.load(f)
            print(f"[TEAMS] Loaded {len(teams_json)} team entries")
            for item in teams_json:
                if "team_code" in item:
                    team_codes.add(item["team_code"].upper())
            print(f"[TEAMS] Extracted {len(team_codes)} unique team codes: {sorted(team_codes)}")
except Exception as e:
    print(f"[TEAMS] ERROR loading teams file: {e}")
    teams_json = []
print("="*80)

def clean_text(el_text):
    return (el_text or "").strip()

def parse_player_teams(element):
    """
    Given a teams element innerText or HTML, try to extract two 3-letter codes.
    Strategy:
      - Look for img src filenames which include '/nba/<code>.svg' -> extract the 3-letter code.
      - Fall back to text like ' LAC @ ' by regex of 3-letter codes.
    """
    print(f"    [PARSE_TEAMS] Attempting to parse teams from element...")
    # prefer logos in <img> src
    imgs = element.query_selector_all("img")
    codes = []
    print(f"    [PARSE_TEAMS] Found {len(imgs)} img elements")
    for img in imgs:
        src = img.get_attribute("src") or ""
        m = re.search(r"/nba/([A-Za-z]{3})\.svg", src)
        if m:
            code = m.group(1).upper()
            codes.append(code)
            print(f"    [PARSE_TEAMS] Extracted code from img: {code}")
    if len(codes) >= 2:
        print(f"    [PARSE_TEAMS] Success: Found team codes {codes[0]} @ {codes[1]}")
        return codes[0], codes[1]  # usually away/home ordering from page (user indicated like "LAC @ CHA")
    # fallback: try to read text content and find 3 letter codes
    txt = element.inner_text().strip()
    print(f"    [PARSE_TEAMS] Fallback to text parsing: '{txt}'")
    m = re.findall(r"\b([A-Z]{3})\b", txt)
    if len(m) >= 2:
        print(f"    [PARSE_TEAMS] Success: Found team codes from text {m[0]} @ {m[1]}")
        return m[0].upper(), m[1].upper()
    print(f"    [PARSE_TEAMS] Failed to extract team codes")
    return None, None

# ---------- ADD: normalize prop type ----------
def normalize_prop_type(raw_text: str) -> str:
    """
    Normalize the prop type text into a canonical short key.
    Examples:
      "Points" -> "points"
      "Three Pointers Made" -> "threes"
      "Double Double (yes/no)" -> "double_double_bool"
    """
    if not raw_text:
        return "unknown"
    t = raw_text.strip().lower()

    # exact mapping table (extend if you see other labels)
    mapping = {
        "points": "points",
        "rebounds": "rebounds",
        "assists": "assists",
        "three pointers made": "threes",
        "three pointers": "threes",
        "blocks": "blocks",
        "double double (yes/no)": "double_double_bool",
        "double double": "double_double_bool",
        "points assists": "points_assists",
        "points and rebounds": "points_rebounds",
        "points rebounds assists": "points_rebounds_assists",
        "rebounds assists": "rebounds_assists",
        "steals": "steals",
        "steals blocks": "steals_blocks",
        "triple double (yes/no)": "triple_double_bool",
        "player turnovers": "turnovers",
        "first basket": "first_basket",
        "first team basket": "first_team_basket",
        "first three point scorer": "first_three_scorer",
        "player first dunk scorer": "first_dunk_scorer",
        "player free throws attempted": "fta",
        "player personal fouls": "personal_fouls",
        "player method of first basket": "method_first_basket",
        "player number of dunks": "num_dunks",
        "player field goals attempted": "fga",
        "player three pointers attempted": "3pa",
        "player free throws made": "ftm",
        "player field goals made": "fgm",
        "player most points in game": "most_points",
        "player to score in first 3 minutes": "score_first_3_min",
        "player most assists": "most_assists",
        "player most rebounds": "most_rebounds",
        "player most three pointers made": "most_threes",
        "double double (over/under)": "double_double_ou",
    }

    # try direct mapping first
    if t in mapping:
        return mapping[t]

    # catch common prefixes / variations
    if "points" in t and "assists" in t and "rebounds" in t:
        return "points_rebounds_assists"
    if "points" in t and "assists" in t:
        return "points_assists"
    if "points" in t and "rebounds" in t:
        return "points_rebounds"
    if "double" in t and "yes/no" in t:
        return "double_double_bool"
    if "triple" in t and "yes/no" in t:
        return "triple_double_bool"
    if "three" in t and ("made" in t or "pointers" in t):
        return "threes"
    if "rebounds" in t:
        return "rebounds"
    if "assists" in t:
        return "assists"
    if "points" in t:
        return "points"

    # default fallback
    return re.sub(r"\s+","_", re.sub(r"[^a-z0-9\s]", "", t)).strip() or "unknown"
# ---------- END ADD ----------

# ---------- ADD: helpers to manage prop-group dropdowns ----------
def close_all_prop_groups(page):
    """
    Click every prop-group header to ensure all groups are closed.
    We only click ones that appear open (via checking the next sibling display/height).
    """
    print("[UI] Closing all prop groups...")
    hdrs = page.query_selector_all("div.betTypeGroupRow-0-2-91")
    for hdr in hdrs:
        try:
            is_open = hdr.evaluate(
                "(n) => { const next = n.parentElement && n.parentElement.nextElementSibling; if(!next) return false; const style = window.getComputedStyle(next); return style.display !== 'none' && next.offsetHeight > 0; }"
            )
            if is_open:
                hdr.evaluate("n => n.click()")
                time.sleep(0.15)
        except Exception as e:
            # non-fatal: continue
            print(f"[UI] close_all_prop_groups: error toggling header: {e}")
    time.sleep(0.25)

def ensure_prop_group_open(page, prop_label: str, timeout_ms: int = 3000):
    """
    Ensure the given prop group (exact visible label like 'Points' or 'Rebounds')
    is expanded and visible. Returns the actual header text (normalized).
    """
    print(f"[UI] Ensuring prop group open: '{prop_label}'")
    # find header element by exact substring
    hdr = page.query_selector(f"div.betTypeGroupRow-0-2-91:has-text('{prop_label}')")
    if not hdr:
        # try case-insensitive fallback
        all_hdrs = page.query_selector_all("div.betTypeGroupRow-0-2-91")
        for h in all_hdrs:
            try:
                txt = (h.inner_text() or "").strip()
                if prop_label.lower() in txt.lower():
                    hdr = h
                    break
            except Exception:
                continue
    if not hdr:
        print(f"[UI] Prop header '{prop_label}' not found on page")
        return None

    # If not already open, click it
    try:
        is_open = hdr.evaluate(
            "(n) => { const next = n.parentElement && n.parentElement.nextElementSibling; if(!next) return false; const style = window.getComputedStyle(next); return style.display !== 'none' && next.offsetHeight > 0; }"
        )
        if not is_open:
            hdr.evaluate("n => n.click()")
            # wait a short time for the player list to render
            page.wait_for_timeout(250)
            # optionally wait until at least one h6.ua appears inside the newly opened section
            try:
                page.wait_for_selector("h6.ua", timeout=timeout_ms)
            except Exception:
                pass
    except Exception as e:
        print(f"[UI] ensure_prop_group_open: error toggling header: {e}")

    # return the header text (useful to canonicalize)
    try:
        return (hdr.inner_text() or "").strip()
    except Exception:
        return prop_label

def collapse_prop_group_if_open(page, prop_label: str):
    """Collapse a prop group if it's currently open (safe cleanup)."""
    hdr = page.query_selector(f"div.betTypeGroupRow-0-2-91:has-text('{prop_label}')")
    if not hdr:
        return
    try:
        is_open = hdr.evaluate(
            "(n) => { const next = n.parentElement && n.parentElement.nextElementSibling; if(!next) return false; const style = window.getComputedStyle(next); return style.display !== 'none' && next.offsetHeight > 0; }"
        )
        if is_open:
            hdr.evaluate("n => n.click()")
            page.wait_for_timeout(150)
    except Exception as e:
        print(f"[UI] collapse_prop_group_if_open: {e}")
# ---------- END ADD ----------

# ---------- ADD: Bet Types button handler ----------
def click_bet_types_button(page):
    """
    Click the 'Bet Types' button that collapses all props into clean dropdowns.
    Uses role=button with chevron-right icon to avoid ambiguity.
    """
    print("[UI] Looking for 'Bet Types' button...")
    
    # Strategy: find button with role="button" that contains both:
    # 1. SVG with chevron-right icon
    # 2. Text content "Bet Types"
    try:
        # Find all role=button elements
        buttons = page.query_selector_all('div[role="button"]')
        
        for btn in buttons:
            try:
                # Check if it contains "Bet Types" text
                text = (btn.inner_text() or "").strip()
                if "Bet Types" not in text:
                    continue
                
                # Check if it contains chevron-right SVG
                svg = btn.query_selector('svg[data-icon="chevron-right"]')
                if not svg:
                    continue
                
                # This is our button - click it
                btn.evaluate("el => el.click()")
                print("[UI] ✓ Clicked 'Bet Types' button (using SVG chevron-right identifier)")
                page.wait_for_timeout(500)  # Wait for UI transition
                return True
                
            except Exception as e:
                continue
        
        print("[UI] ✗ 'Bet Types' button not found")
        return False
        
    except Exception as e:
        print(f"[UI] Error clicking 'Bet Types' button: {e}")
        return False
# ---------- END ADD ----------

# ---------- ADD: Events dropdown and matchup selection ----------
def click_events_dropdown(page):
    """Click the 'Events' dropdown button to open the matchup selection menu."""
    print("[UI] Looking for 'Events' dropdown...")

    try:
        containers = page.query_selector_all("div.mr-2.container-0-2-22")
        for container in containers:
            try:
                text = (container.inner_text() or "").strip()
                if text.startswith("Events") or ("Events" in text and "of" in text):
                    container.evaluate("el => el.click()")
                    print(f"[UI] ✓ Clicked Events dropdown: '{text}'")
                    page.wait_for_timeout(500)
                    return True
            except Exception:
                continue

        events_div = page.query_selector("div:has-text('Events')")
        if events_div:
            events_div.evaluate("el => el.click()")
            print("[UI] ✓ Clicked Events dropdown (fallback method)")
            page.wait_for_timeout(500)
            return True

        print("[UI] ✗ Events dropdown not found")
        return False

    except Exception as e:
        print(f"[UI] Error clicking Events dropdown: {e}")
        return False


def click_clear_button(page):
    """Click the 'CLEAR' button inside the Events dropdown to deselect all games."""
    print("[UI] Looking for 'CLEAR' button in Events dropdown...")

    try:
        clear_link = page.query_selector("a:has-text('CLEAR')")
        if clear_link:
            clear_link.evaluate("el => el.click()")
            print("[UI] ✓ Clicked CLEAR button")
            page.wait_for_timeout(300)
            return True

        print("[UI] ✗ CLEAR button not found")
        return False

    except Exception as e:
        print(f"[UI] Error clicking CLEAR button: {e}")
        return False


def _gather_matchup_items(page):
    """Return a list of matchup item elements using multiple selector fallbacks."""
    selectors = [
        "div.sectionItem-0-2-123",
        "div[class*='sectionItem'][role='button']",
        "div[class*='sectionItem']",
        "div[class*='sectionList'] div[role='button']",
    ]

    for sel in selectors:
        try:
            items = page.query_selector_all(sel)
            if items:
                print(f"[UI]   Selector '{sel}' returned {len(items)} items")
                return items
        except Exception:
            continue

    # Fallback: search within the dropdown container for anything with NBA logos
    try:
        dropdown_container = page.query_selector("div[class*='megaMenu']") or page.query_selector("div[role='dialog']")
        if dropdown_container:
            items = dropdown_container.query_selector_all("div:has(img[src*='/nba/'])")
            if items:
                print(f"[UI]   Fallback container search returned {len(items)} items")
                return items
    except Exception:
        pass

    return []


def select_matchup(page, team1, team2):
    """Select a specific matchup from the Events dropdown."""
    print(f"[UI] Looking for matchup: {team1} vs {team2}...")

    # Wait for the dropdown content to render; attempt multiple times with backoff
    try:
        page.wait_for_selector("div[class*='sectionList']", timeout=5000)
    except Exception:
        print("[UI] WARNING: Section list container did not appear quickly")

    matchup_items = []
    wait_attempts = 6
    for attempt in range(1, wait_attempts + 1):
        matchup_items = _gather_matchup_items(page)
        if matchup_items:
            break
        print(f"[UI]   No matchup items yet (attempt {attempt}/{wait_attempts}); waiting...")
        page.wait_for_timeout(600)

    print(f"[UI] Found {len(matchup_items)} matchup items")

    try:
        if not matchup_items:
            print(f"[UI] ✗ Matchup not found: {team1} vs {team2}")
            return False

        for item in matchup_items:
            try:
                codes = []
                snippet = (item.inner_text() or "").strip()[:120]
                print(f"[UI] Inspecting matchup block snippet: {snippet}")

                # Strategy 1: pull team codes from <img src=".../nba/CODE.svg">
                imgs = item.query_selector_all("img")
                print(f"[UI]   IMG count: {len(imgs)}")
                for img in imgs:
                    src = img.get_attribute("src") or ""
                    match = re.search(r"/nba/([A-Za-z]{3})\.svg", src)
                    if match:
                        codes.append(match.group(1).upper())
                        print(f"[UI]     IMG src match: {codes[-1]} from {src}")
                    if len(codes) >= 2:
                        break

                # Strategy 2: fall back to <img alt="Team Name"> abbreviations
                if len(codes) < 2:
                    for img in imgs:
                        alt = (img.get_attribute("alt") or "").strip().upper()
                        if len(alt) == 3:
                            codes.append(alt)
                            print(f"[UI]     IMG alt match: {alt}")
                        if len(codes) >= 2:
                            break

                # Strategy 3: use <small> elements that contain the 3-letter codes
                if len(codes) < 2:
                    smalls = item.query_selector_all("small")
                    print(f"[UI]   SMALL count: {len(smalls)}")
                    for sm in smalls:
                        txt = (sm.inner_text() or "").strip().upper()
                        if len(txt) == 3 and txt.isalpha():
                            codes.append(txt)
                            print(f"[UI]     SMALL text match: {txt}")
                        if len(codes) >= 2:
                            break

                print(f"[UI]   Codes extracted: {codes}")
                if len(codes) >= 2:
                    away_code, home_code = codes[0], codes[1]
                    print(f"[UI]   Comparing vs target: {away_code} @ {home_code}")
                    if {away_code, home_code} == {team1, team2}:
                        item.evaluate("el => el.click()")
                        print(f"[UI] ✓ Selected matchup: {away_code} @ {home_code}")
                        page.wait_for_timeout(500)
                        return True
            except Exception:
                continue

        print(f"[UI] ✗ Matchup not found: {team1} vs {team2}")
        return False

    except Exception as e:
        print(f"[UI] Error selecting matchup: {e}")
        return False


def close_events_dropdown(page):
    """Close the Events dropdown by sending Escape."""
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        print("[UI] Closed Events dropdown")
    except Exception as e:
        print(f"[UI] Error closing dropdown: {e}")
# ---------- END ADD ----------

# ---------- ADD: Bet Types dropdown and prop selection ----------
def click_bet_types_dropdown(page):
    """
    Click the 'Bet Types' dropdown button to open the prop selection menu.
    Returns True if successful, False otherwise.
    """
    print("[UI] Looking for 'Bet Types' dropdown...")

    try:
        containers = page.query_selector_all("div.mr-2")
        for container in containers:
            try:
                text = (container.inner_text() or "").strip()
                if "Bet Types" in text and "of" in text:
                    container.evaluate("el => el.click()")
                    print(f"[UI] ✓ Clicked Bet Types dropdown: '{text}'")
                    page.wait_for_timeout(500)
                    return True
            except Exception:
                continue

        bet_types_div = page.query_selector("div:has-text('Bet Types')")
        if bet_types_div:
            bet_types_div.evaluate("el => el.parentElement && el.parentElement.click()")
            print("[UI] ✓ Clicked Bet Types dropdown (fallback method)")
            page.wait_for_timeout(500)
            return True

        print("[UI] ✗ Bet Types dropdown not found")
        return False

    except Exception as e:
        print(f"[UI] Error clicking Bet Types dropdown: {e}")
        return False


def click_clear_bet_types_button(page):
    """
    Click the 'CLEAR' button inside the Bet Types dropdown to deselect all prop types.
    Returns True if successful, False otherwise.
    """
    print("[UI] Looking for 'CLEAR' button in Bet Types dropdown...")

    try:
        links = page.query_selector_all("a")
        for link in links:
            try:
                text = (link.inner_text() or "").strip()
                if text == "CLEAR":
                    is_visible = link.evaluate("el => el.offsetParent !== null")
                    if is_visible:
                        link.evaluate("el => el.click()")
                        print("[UI] ✓ Clicked CLEAR button in Bet Types")
                        page.wait_for_timeout(300)
                        return True
            except Exception:
                continue

        print("[UI] ✗ CLEAR button not found in Bet Types dropdown")
        return False

    except Exception as e:
        print(f"[UI] Error clicking CLEAR button: {e}")
        return False


def select_prop_type(page, prop_name):
    """
    Select a specific prop type from the Bet Types dropdown.
    prop_name should be exact text like 'Steals Blocks'.
    Returns True if prop found and clicked, False otherwise.
    """
    print(f"[UI] Looking for prop type: '{prop_name}'...")

    try:
        prop_items = page.query_selector_all("div.sectionItem-0-2-111")
        print(f"[UI] Found {len(prop_items)} prop type items")

        for item in prop_items:
            try:
                content = item.query_selector("div.sectionItemContent-0-2-113")
                if not content:
                    continue

                item_text = content.evaluate(
                    """(el) => {
                        for (let node of el.childNodes) {
                            if (node.nodeType === Node.TEXT_NODE) {
                                const text = (node.textContent || '').trim();
                                if (text) return text;
                            }
                        }
                        return (el.innerText || '').trim();
                    }"""
                )

                if item_text and item_text == prop_name:
                    item.evaluate("el => el.click()")
                    print(f"[UI] ✓ Selected prop type: '{item_text}'")
                    page.wait_for_timeout(500)
                    return True

            except Exception:
                continue

        print(f"[UI] ✗ Prop type not found: '{prop_name}'")
        return False

    except Exception as e:
        print(f"[UI] Error selecting prop type: {e}")
        return False


def close_bet_types_dropdown(page):
    """Close the Bet Types dropdown by pressing Escape."""
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        print("[UI] Closed Bet Types dropdown")
    except Exception as e:
        print(f"[UI] Error closing Bet Types dropdown: {e}")
# ---------- END ADD ----------

def identify_sportsbook_from_src(src: Optional[str]) -> Optional[str]:
    """Return a friendly sportsbook name by inspecting the logo src."""
    if not src:
        return None
    lower_src = src.lower()
    for needle, name in SPORTSBOOK_KEYWORDS.items():
        if needle in lower_src:
            return name
    # fall back to filename-based guess
    filename = src.split("/")[-1].split("?")[0]
    if filename:
        stem = filename.split(".")[0].replace("-", " ").replace("_", " ").strip()
        if stem:
            return stem.title()
    return None

# Helper to extract odds information from an "odds cell" element (one grid cell that may contain u/o entries)
def extract_odds_from_cell(cell, allowed_sportsbooks):
    """
    Universal odds extractor filtered to allowed sportsbooks.
    """
    results = []
    allowed_lower = {name.lower() for name in allowed_sportsbooks}

    # blocks that visually contain the sportsbook logo + spans
    blocks = cell.query_selector_all(".props-hover-cells div")

    print(f"      [EXTRACT_ODDS] Found {len(blocks)} blocks in cell")

    for blk in blocks:
        try:
            img = blk.query_selector("img")
            if not img:
                continue

            src = (img.get_attribute("src") or "").lower()
            sportsbook_name = identify_sportsbook_from_src(src)
            if not sportsbook_name:
                continue

            if sportsbook_name.lower() not in allowed_lower:
                continue

            print(f"      [EXTRACT_ODDS] Found sportsbook entry: {sportsbook_name}")

            spans = blk.query_selector_all("span")
            outcome = None
            odds = None

            for s in spans:
                txt = (s.inner_text() or "").strip()

                # detect o/u
                if txt.lower() in ("o", "u", "over", "under"):
                    outcome = "o" if txt.lower().startswith("o") else "u"

                # detect odds (e.g. -200, +150)
                if re.match(r"^[+-]?\d+(\.\d+)?$", txt):
                    odds = txt

            # some pages might place odds in an element without span (rare) - fallback:
            if not odds:
                txtblk = (blk.inner_text() or "").strip()
                m = re.search(r"([+-]?\d{1,4})", txtblk)
                if m:
                    odds = m.group(1)

            if outcome and odds:
                print(f"      [EXTRACT_ODDS] Extracted: {outcome} {odds} ({sportsbook_name})")
                results.append({
                    "outcome": outcome,
                    "odds": odds,
                    "sportsbook": sportsbook_name
                })

        except Exception as e:
            print(f"      [EXTRACT_ODDS] Error processing block: {e}")
            continue

    return results

# Main scraping logic
def scrape():
    print("\n[SCRAPER] Starting Playwright browser...")
    players_index = {}
    total_prop_records = 0
    found_raw_props = set()

    def canonical_game_key(team_a, team_b, date, time_str):
        a = (team_a or "").upper()
        b = (team_b or "").upper()
        teams_sorted = "-".join(sorted([a, b]))
        return f"{teams_sorted}__{date}__{time_str}"
    with sync_playwright() as p:
        print(f"[SCRAPER] Launching browser (headless={BROWSER_HEADLESS})...")
        # Launch browser with a small slow_mo and create a realistic context to avoid bot-blocking
        browser = p.chromium.launch(headless=BROWSER_HEADLESS, slow_mo=25)
        context = browser.new_context(
            viewport={"width": 1366, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()
        
        print(f"[SCRAPER] Navigating to {URL}...")
        
        # --- robust navigation with retries ---
        NAV_RETRIES = 3
        NAV_TIMEOUT_MS = 120_000  # 120s per attempt

        nav_ok = False
        last_err = None
        for attempt in range(1, NAV_RETRIES + 1):
            try:
                print(f"[NAV] Attempt {attempt} -> page.goto(..., timeout={NAV_TIMEOUT_MS}ms)")
                # use domcontentloaded first, then optionally wait for networkidle shortly after
                page.goto(URL, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS)
                try:
                    # try to wait for networkidle but don't fail hard if it doesn't happen
                    page.wait_for_load_state("networkidle", timeout=10_000)
                except Exception:
                    pass
                nav_ok = True
                print("[NAV] Navigation succeeded (domcontentloaded)")
                break
            except Exception as e:
                last_err = e
                print(f"[NAV] Navigation attempt {attempt} failed: {e}. Retrying...")
                time.sleep(2)

        if not nav_ok:
            print(f"[NAV] Failed to load page after {NAV_RETRIES} attempts. Last error: {last_err}")
            browser.close()
            return pd.DataFrame()
        # --- end navigation retry ---
        
        # Wait explicitly for the player rows to render (AG Grid rows with pid)
        try:
            print("[WAIT] Waiting for player rows (role=row with 'pid' in row-id) (timeout 90s)...")
            page.wait_for_selector("div[role='row'][row-id*='pid']", timeout=90_000)
            print("[WAIT] Player rows appeared")
        except Exception:
            print("[WAIT] Timeout waiting for player rows — continuing anyway (may be empty).")
        
        # Try dismissing common cookie/consent modals if present
        for btn_text in ("I Accept", "Accept", "Agree", "Continue", "Close"):
            try:
                btn = page.query_selector(f"button:has-text('{btn_text}')")
                if btn:
                    btn.evaluate("el => el.click()")
                    print(f"[COOKIES] Clicked button via JS: '{btn_text}'")
                    time.sleep(0.6)
            except Exception:
                pass
        
        # Give some additional time for dynamic content
        print("[SCRAPER] Waiting for dynamic content (3 seconds)...")
        page.wait_for_timeout(3000)

        # 1) Handle matchup selection if specified
        if MATCHUP_TEAM1 and MATCHUP_TEAM2:
            print(f"\n[SCRAPER] Step 1: Selecting matchup: {MATCHUP_TEAM1} vs {MATCHUP_TEAM2}...")

            if not click_events_dropdown(page):
                print("[UI] ERROR: Could not open Events dropdown")
                browser.close()
                return pd.DataFrame()

            if not click_clear_button(page):
                print("[UI] WARNING: Could not click CLEAR button (continuing)")

            if not select_matchup(page, MATCHUP_TEAM1, MATCHUP_TEAM2):
                print(f"[UI] ERROR: Could not find matchup {MATCHUP_TEAM1} vs {MATCHUP_TEAM2}")
                browser.close()
                return pd.DataFrame()

            close_events_dropdown(page)
            page.wait_for_timeout(1000)
            print(f"[SCRAPER] ✓ Matchup selected: {MATCHUP_TEAM1} vs {MATCHUP_TEAM2}")
        else:
            print("\n[SCRAPER] Step 1: No specific matchup selected (scraping all games)...")

        # 2) Handle prop type selection
        print(f"\n[SCRAPER] Step 2: Selecting prop type: {TARGET_PROP_TYPE}...")

        if not click_bet_types_dropdown(page):
            print("[UI] ERROR: Could not open Bet Types dropdown")
            browser.close()
            return pd.DataFrame()

        if not click_clear_bet_types_button(page):
            print("[UI] WARNING: Could not click CLEAR button (continuing)")

        if not select_prop_type(page, TARGET_PROP_TYPE):
            print(f"[UI] ERROR: Could not find prop type '{TARGET_PROP_TYPE}'")
            browser.close()
            return pd.DataFrame()

        close_bet_types_dropdown(page)
        page.wait_for_timeout(1000)
        print(f"[SCRAPER] ✓ Prop type selected: {TARGET_PROP_TYPE}")

        # 3) Since we've selected a single prop type, just use that
        print("\n[SCRAPER] Step 3: Using selected prop type...")

        PROP_LIST = [TARGET_PROP_TYPE]
        canonical_prop_key = normalize_prop_type(TARGET_PROP_TYPE)

        print(f"[SCRAPER] Prop: '{TARGET_PROP_TYPE}' → canonical key: '{canonical_prop_key}'")
        print("="*80)

        # 4) Process the single selected prop type
        prop_label = TARGET_PROP_TYPE
        print(f"\n{'='*80}")
        print(f"[PROP] Processing prop type: {prop_label}")
        print(f"{'='*80}")

        print(f"[SCRAPER] Collecting visible players for '{prop_label}'...")
        top_rows_locator = page.locator("div[role='row'][row-id*='pid']:not([row-id^='detail_'])")
        total_top = top_rows_locator.count()
        row_ids = []
        seen_row_ids = set()
        for j in range(total_top):
            h = top_rows_locator.nth(j).element_handle()
            if not h:
                continue
            try:
                vis = h.evaluate(
                    "(n) => { const r = n.getBoundingClientRect(); return r && r.height>0 && (r.top>=0 || r.bottom>=0); }"
                )
                if not vis:
                    continue
            except Exception:
                pass
            rid = (h.get_attribute("row-id") or "").strip()
            if rid and rid not in seen_row_ids:
                row_ids.append(rid)
                seen_row_ids.add(rid)

        print(f"[SCRAPER] Player rows collected for prop '{prop_label}': {len(row_ids)}")

        for i, row_id in enumerate(row_ids):
            print(f"\n[PLAYER {i+1}/{len(row_ids)}] Processing player row (row-id={row_id})...")
            try:
                prow_locator = page.locator(f"div[role='row'][row-id=\"{row_id}\"]").first
                prow = prow_locator.element_handle()
                if not prow:
                    print(f"[PLAYER {i+1}] Unable to resolve row handle for {row_id}; skipping")
                    continue

                prow_locator.scroll_into_view_if_needed()
                print(f"[PLAYER {i+1}] Scrolled into view")

                row_id = prow.get_attribute("row-id") or ""
                print(f"[PLAYER {i+1}] Row ID: {row_id}")

                date_el = prow.query_selector("div.d-flex.justify-content-center span.d-flex.flex-column.align-items-center")
                if date_el:
                    date_txts = date_el.query_selector_all("span")
                    match_date = date_txts[0].inner_text().strip() if len(date_txts) >= 1 else ""
                    match_time = date_txts[1].inner_text().strip() if len(date_txts) >= 2 else ""
                    match_date = match_date.replace("\\/", "/")
                    match_date = match_date.replace("\\", "")
                    print(f"[PLAYER {i+1}] Match date/time: {match_date} {match_time}")
                else:
                    match_date = ""
                    match_time = ""
                    print(f"[PLAYER {i+1}] No date/time found")

                name_el = prow.query_selector("div.playerName-0-2-96")
                if name_el:
                    spans = name_el.query_selector_all("span")
                    player_name = spans[0].inner_text().strip() if spans else name_el.inner_text().strip()
                    pos = spans[1].inner_text().strip() if len(spans) > 1 else ""
                    pos = re.sub(r"[()]", "", pos).strip()
                    print(f"[PLAYER {i+1}] Name: {player_name}, Position: {pos}")
                else:
                    player_name = prow.inner_text().strip()
                    pos = ""
                    print(f"[PLAYER {i+1}] Name (fallback): {player_name}")

                teams_el = prow.query_selector("div.teams-0-2-93")
                team_away, team_home = (None, None)
                if teams_el:
                    print(f"[PLAYER {i+1}] Parsing teams...")
                    team_away, team_home = parse_player_teams(teams_el)
                else:
                    print(f"[PLAYER {i+1}] No teams element found")

                game_key = canonical_game_key(team_away or "", team_home or "", match_date or "", match_time or "")
                player_key = f"{game_key}__{player_name}"
                primary_team = (team_away or team_home or "").upper()

                player_record = players_index.setdefault(player_key, {
                    "game_id": game_key,
                    "game_teams": {"team_a": (team_away or "").upper(), "team_b": (team_home or "").upper()},
                    "match_date": match_date,
                    "match_time": match_time,
                    "player_name": player_name,
                    "position": pos,
                    "player_team": primary_team,
                    "props": {}
                })

                player_record["game_id"] = game_key
                player_record["game_teams"] = {"team_a": (team_away or "").upper(), "team_b": (team_home or "").upper()}
                player_record["match_date"] = match_date
                player_record["match_time"] = match_time
                player_record["player_name"] = player_name
                player_record["position"] = pos
                player_record["player_team"] = primary_team
                player_record.setdefault("props", {})
                player_record["props"].setdefault(canonical_prop_key, [])

                player_prop_entries = 0
                player_book_counts = {book: 0 for book in TARGET_SPORTSBOOKS}

                print(f"[PLAYER {i+1}] Looking for expand icon...")
                expanded = False
                for attempt in range(1, MAX_EXPAND_RETRIES + 1):
                    try:
                        container = prow.query_selector("span.ag-group-contracted")
                        icon = prow.query_selector("span.ag-icon-tree-closed")
                        if container:
                            container.evaluate("el => el.click()")
                            print(f"[PLAYER {i+1}] Clicked container (attempt {attempt})")
                        elif icon:
                            icon.evaluate(
                                "el => el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}))"
                            )
                            print(f"[PLAYER {i+1}] Dispatched click on icon (attempt {attempt})")
                        else:
                            print(f"[PLAYER {i+1}] No expand icon/container found (attempt {attempt})")
                        try:
                            prow.wait_for_selector("span.ag-icon-tree-open", timeout=1500)
                            expanded = True
                            print(f"[PLAYER {i+1}] Expansion detected")
                            break
                        except Exception:
                            if prow.query_selector("span.ag-icon-tree-open"):
                                expanded = True
                                print(f"[PLAYER {i+1}] Expansion confirmed via fallback check")
                                break
                    except Exception as e:
                        print(f"[PLAYER {i+1}] Error expanding (attempt {attempt}): {e}")
                    time.sleep(0.3)

                if not expanded:
                    print(f"[PLAYER {i+1}] Unable to expand row after {MAX_EXPAND_RETRIES} attempts; skipping")
                    continue

                print(f"[PLAYER {i+1}] Finding detail rows associated with this player...")
                m_pid = re.search(r"pid(\d+)", row_id)
                pid_token = m_pid.group(0) if m_pid else None
                detail_rows_locator = None
                detail_handles = []
                if pid_token:
                    detail_rows_locator = page.locator(f"div[role='row'][row-id^='detail_'][row-id*='{pid_token}']")
                    detail_handles = detail_rows_locator.element_handles()
                else:
                    try:
                        prow.evaluate(
                            "(n) => { const out=[]; let el = n.nextElementSibling; let c=0; while(el && c<200){ const rid = el.getAttribute && el.getAttribute('row-id') || ''; if(rid && rid.includes('pid') && !rid.startsWith('detail_')) break; if(rid && rid.startsWith('detail_')) out.push(el.outerHTML); el = el.nextElementSibling; c++; } return out; }"
                        )
                        detail_handles = []
                    except Exception:
                        detail_handles = []

                print(f"[PLAYER {i+1}] Detail rows found: {len(detail_handles)}")

                parsed_lines = 0
                for d_handle in detail_handles:
                    try:
                        line_elements = d_handle.query_selector_all("h6.ua")
                        print(f"[PLAYER {i+1}] Detail block has {len(line_elements)} line elements (will resolve prop header per-line)")

                        if not line_elements:
                            print(f"[PLAYER {i+1}] No line elements in this detail block, skipping")
                            continue

                        for le in line_elements:
                            try:
                                raw_prop = le.evaluate(
                                    """(node) => {
                                        let n = node.previousElementSibling;
                                        while (n) {
                                            try {
                                                if (n.matches && n.matches('div.betTypeGroupRow-0-2-91')) {
                                                    const textDiv = n.querySelectorAll('div');
                                                    if (textDiv && textDiv.length) {
                                                        return (textDiv[textDiv.length - 1].innerText || '').trim();
                                                    }
                                                    return (n.innerText || '').trim();
                                                }
                                            } catch(e) {}
                                            n = n.previousElementSibling;
                                        }
                                        return '';
                                    }""",
                                    le
                                ) or ""
                                raw_prop = raw_prop.strip()
                                if raw_prop == "":
                                    print(f"[PLAYER {i+1}] Could not find header for line: {repr((le.inner_text() or '').strip()[:60])} -> will treat as Unknown")

                                prop_key = canonical_prop_key
                                if not raw_prop:
                                    print(f"[PLAYER {i+1}] Using canonical prop_key: {canonical_prop_key}")

                                parent_row = le.evaluate_handle("(n)=>n.closest('[role=row]')").as_element()
                                if not parent_row:
                                    continue
                                odds_cells = parent_row.query_selector_all("[col-id^='odds_']")
                                for oc in odds_cells:
                                    extracted = extract_odds_from_cell(oc, TARGET_SPORTSBOOKS)
                                    for ex in extracted:
                                        line_val = re.sub(r"\s+", "", (le.inner_text() or "").strip())
                                        player_record["props"].setdefault(prop_key, [])
                                        player_record["props"][prop_key].append({
                                            "line": line_val,
                                            "outcome": ex["outcome"],
                                            "odds": ex["odds"],
                                            "sportsbook": ex["sportsbook"]
                                        })
                                        total_prop_records += 1
                                        parsed_lines += 1
                                        player_prop_entries += 1
                                        if ex["sportsbook"] in player_book_counts:
                                            player_book_counts[ex["sportsbook"]] += 1

                            except Exception as inner_e:
                                print(f"[PLAYER {i+1}] Error processing single line element: {inner_e}")

                        print(f"[PLAYER {i+1}] Parsed {parsed_lines} lines from this detail block")
                    except Exception as e:
                        print(f"[PLAYER {i+1}] Error parsing detail block (per-line header scan): {e}")
                        continue

                print(f"[PLAYER {i+1}] Parsed {parsed_lines} lines from detail rows")

                for book_name, count in player_book_counts.items():
                    if count == 0:
                        message = f"No {book_name} odds available for this player for '{prop_label}'"
                        player_record["props"].setdefault(canonical_prop_key, [])
                        player_record["props"][canonical_prop_key].append({
                            "line": None,
                            "outcome": None,
                            "odds": None,
                            "sportsbook": book_name,
                            "note": message
                        })
                        print(f"[PLAYER {i+1}] {message}")

                print(f"[PLAYER {i+1}] Attempting to collapse player row...")
                try:
                    collapse_container = prow.query_selector("span.ag-group-expanded")
                    icon_open = prow.query_selector("span.ag-icon-tree-open")
                    if collapse_container:
                        collapse_container.evaluate("el => el.click()")
                        print(f"[PLAYER {i+1}] Clicked expanded container (ag-group-expanded) via JS to collapse")
                    elif icon_open:
                        icon_open.evaluate(
                            "el => el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}))"
                        )
                        print(f"[PLAYER {i+1}] Dispatched click on open-icon via JS to collapse")
                    else:
                        print(f"[PLAYER {i+1}] No collapse icon/container found")
                    time.sleep(0.35)
                except Exception as e:
                    print(f"[PLAYER {i+1}] Error collapsing (JS click): {e}")

                print(f"[PLAYER {i+1}] Completed. Total props so far: {total_prop_records}")
                time.sleep(0.1)

            except Exception as e:
                print(f"[PLAYER {i+1}] ERROR processing player row: {e}")
                continue

        print(f"[PROP] ✓ Completed '{prop_label}': {total_prop_records} total props")

        # done
        print("\n" + "="*80)
        print("[SCRAPER] Scraping complete, closing browser...")
        browser.close()
        print("[SCRAPER] Browser closed")

    print("\n" + "="*80)
    print("ALL RAW PROP STRINGS SEEN:", sorted([repr(x) for x in found_raw_props]))
    print("="*80)

    players_out = list(players_index.values())

    print(f"\n[OUTPUT] Saving structured players JSON to {OUTPUT_JSON}...")
    with open(OUTPUT_JSON, "w", encoding="utf-8") as fo:
        json.dump(players_out, fo, ensure_ascii=False, indent=2)
    print(f"[OUTPUT] ✓ Successfully saved {len(players_out)} player entries to {OUTPUT_JSON}")

    flat_rows = []
    for p in players_out:
        for pk, lines in p.get("props", {}).items():
            for l in lines:
                r = {
                    "game_id": p["game_id"],
                    "match_date": p["match_date"],
                    "match_time": p["match_time"],
                    "player_name": p["player_name"],
                    "position": p["position"],
                    "player_team": p["player_team"],
                    "prop_type": pk,
                    "line": l.get("line"),
                    "outcome": l.get("outcome"),
                    "odds": l.get("odds"),
                    "sportsbook": l.get("sportsbook")
                }
                flat_rows.append(r)
    df = pd.DataFrame(flat_rows)
    return df

if __name__ == "__main__":
    print("\n[MAIN] Starting scraper execution...")
    df = scrape()
    # show a brief preview
    if isinstance(df, pd.DataFrame) and not df.empty:
        print("\n[PREVIEW] First few records:")
        print("="*80)
        print(df.head().to_string(index=False))
        print("="*80)
        print(f"\n[SUMMARY] Total records scraped: {len(df)}")
        print("[SUMMARY] Unique players:", df['player_name'].nunique() if 'player_name' in df.columns else 0)
        print("[SUMMARY] Unique prop types:", df['prop_type'].nunique() if 'prop_type' in df.columns else 0)
        print("="*80)
        print("\n✓ SCRAPING COMPLETE!")
    else:
        print("\n[MAIN] ✗ No data was scraped")
    print("="*80)
