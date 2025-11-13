import json
import os

# Ensure script runs relative to its directory so relative file opens work
# even if the script is invoked from another cwd.
base_dir = os.path.dirname(__file__)

with open(os.path.join(base_dir, "teamsign2id.json")) as f:
    teams = json.load(f)
with open(os.path.join(base_dir, "team_rosters_master.json")) as f:
    players = json.load(f)

team_map = {t["team_code"]: t["team_id"] for t in teams}
final = {}

for p in players:
    team = p.get("team")
    team_id = team_map.get(team)
    if not team_id:
        continue
    if team_id not in final:
        final[team_id] = {
            "team_code": team,
            "starters": [],
            # keep singular 'bench' array (we'll map roles to this key)
            "bench": []
        }

    # normalize role and decide which list to append to
    role = p.get("role", "bench")
    if role == "bench":
        key = "bench"
    else:
        # e.g. role 'starter' -> 'starters'
        key = role + "s"

    final[team_id].setdefault(key, [])
    final[team_id][key].append({
        "player_name": p.get("name"),
        "injured": p.get("injured", False),
        "position": p.get("position", None)
    })

with open(os.path.join(base_dir, "team_rosters_by_id.json"), "w") as f:
    json.dump(final, f, indent=2)
