import { useEffect, useState } from "react";

export type RosterPlayer = {
  player_id?: number | string;
  player_name: string;
  position?: string;
  injured?: boolean;
};

export type TeamRoster = {
  team_code: string; // e.g., "SAC"
  starters: RosterPlayer[];
  bench: RosterPlayer[];
};

type RostersMap = Record<string, TeamRoster>; // key = team_id as string

export default function useTeamRostersById() {
  const [rosters, setRosters] = useState<RostersMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | Error>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/data/team_rosters_by_id.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load team_rosters_by_id.json`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setRosters(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { rosters, loading, error };
}
