"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchupFactors } from "@/components/game/matchup-factors";
import { LineupTable } from "@/components/game/lineup-table";
import { PlayerPropsTab } from "@/components/game/player-props-tab";
import { BenchPropsTab } from "@/components/game/bench-props-tab";
import { TeamPropsTab } from "@/components/game/team-props-tab";
import { useSportsData, getPlayerRecentGames, getPlayerAverages } from "@/hooks/use-sports-data";
import useTeamRostersById from "@/hooks/use-team-rosters-by-id";
import { TeamLogoPlaceholder } from "@/components/team-logo-placeholder";

function parseSlug(slug: string) {
  const parts = slug.split("-");
  const home = parts[0];
  const away = parts[2];
  const gameNum = parts[3] === "game" ? Number(parts[4]) : undefined;
  return { home, away, gameNum };
}

export default function GamePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingTime, setLoadingTime] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const params = useParams() as { slug: string };
  const router = useRouter();
  const { slug } = params;

  const { home, away } = useMemo(() => parseSlug(slug), [slug]);
  const { gameData, playerStatsByName, gameDataMap, teamIdMap, loading: dataLoading } = useSportsData();
  const { rosters, loading: rosterLoading } = useTeamRostersById();

  const isDataLoaded = !dataLoading && !rosterLoading;

  // Timer for loading screen - continues until content is ready to show
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!showContent) {
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 0.1);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showContent]);

  // Show content only after data is loaded and processed
  useEffect(() => {
    if (isDataLoaded && gameData?.length && rosters && Object.keys(teamIdMap).length > 0) {
      // Add small delay to ensure all processing is complete
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setLoadingTime(0);
    }
  }, [isDataLoaded, gameData, rosters, teamIdMap]);

  const game = useMemo(() => {
    if (!gameData?.length) return null;

    const homeCode = home?.toUpperCase();
    const awayCode = away?.toUpperCase();

    const homeEntry = Object.entries(rosters || {}).find(([, t]: any) => t.team_code === homeCode);
    const awayEntry = Object.entries(rosters || {}).find(([, t]: any) => t.team_code === awayCode);

    if (homeEntry && awayEntry) {
      const homeId = Number(homeEntry[0]);
      const awayId = Number(awayEntry[0]);
      return gameData.find((g: any) => g.home_team_id === homeId && g.away_team_id === awayId) || null;
    }

    return (
      gameData.find((g: any) => g.home_team_name?.toLowerCase() === home && g.away_team_name?.toLowerCase() === away) ||
      gameData.find((g: any) => String(g.home_team_id) === home || String(g.away_team_id) === away) ||
      null
    );
  }, [gameData, home, away, rosters]);

  const homeRoster = rosters?.[String(game?.home_team_id)];
  const awayRoster = rosters?.[String(game?.away_team_id)];

  const mapRosterToPlayers = useMemo(() => {
    if (!teamIdMap || Object.keys(teamIdMap).length === 0) return () => [];

    return (players: any[], teamCode: string) =>
      (players || []).map((p, index) => {
        const playerName = p.player_name || `Player-${index}`;
        const seasonGames = getPlayerRecentGames(playerStatsByName, playerName, teamIdMap, 200, gameDataMap);
        const recentGames = seasonGames.slice(0, 10);
        const last5 = seasonGames.slice(0, 5);
        const averageSample = last5.length > 0 ? last5 : seasonGames;
        const averages = getPlayerAverages(averageSample);

        return {
          id: String(p.player_id || `${teamCode}-${index}`),
          name: playerName,
          pos: p.position || "",
          gs: recentGames.length,
          statsAvg: averages,
          recentGames,
          last5Games: last5,
          seasonGames,
          currentLines: {
            pts: averages.pts,
            reb: averages.reb,
            ast: averages.ast,
          },
        };
      });
  }, [playerStatsByName, teamIdMap, gameDataMap]);  const displayGameData = useMemo(() => {
    if (!game || !homeRoster || !awayRoster) return null;
    
    const defaultRecord = { wins: 0, losses: 0 };
    const defaultAtsRecord = {
      total: defaultRecord,
      home: defaultRecord,
      away: defaultRecord,
      favored: defaultRecord,
      underdog: defaultRecord,
    };
    
    const defaultLast5Games = Array(5).fill(null).map((_, idx) => ({
      date: "N/A",
      opp: "TBD",
      result: "W",
      score: "0-0",
      ats: "W",
      ou: "O",
    }));
    
    return {
      id: game.game_id || "",
      sport: "NBA",
      date: new Date(game.date || Date.now()).toLocaleDateString(),
      time: "4:30 AM",
      venue: {
        name: "Arena",
        city: "City",
      },
      teamA: {
        name: game.home_team_name,
        code: String(game.home_team_id),
        tricode: home.toUpperCase(),
        record: defaultRecord,
      },
      teamB: {
        name: game.away_team_name,
        code: String(game.away_team_id),
        tricode: away.toUpperCase(),
        record: defaultRecord,
      },
      ats: {
        teamA: defaultAtsRecord,
        teamB: defaultAtsRecord,
      },
      ou: {
        teamA: {
          total: defaultRecord,
          home: defaultRecord,
          away: defaultRecord,
        },
        teamB: {
          total: defaultRecord,
          home: defaultRecord,
          away: defaultRecord,
        },
      },
      last5: {
        teamA: defaultLast5Games,
        teamB: defaultLast5Games,
      },
      lineups: {
        teamA: mapRosterToPlayers(homeRoster.starters, home.toUpperCase()),
        teamB: mapRosterToPlayers(awayRoster.starters, away.toUpperCase()),
        teamA_bench: mapRosterToPlayers(homeRoster.bench, home.toUpperCase()),
        teamB_bench: mapRosterToPlayers(awayRoster.bench, away.toUpperCase()),
      },
    };
  }, [game, homeRoster, awayRoster, home, away, mapRosterToPlayers]);

  // All hooks are called before any conditional returns
  if (!showContent) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading Game Data</h2>
            <p className="text-slate-400 mb-3">Fetching player stats and rosters...</p>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none"/>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 6v6l4 2"
                />
              </svg>
              <span className="text-lg font-mono font-semibold">
                {loadingTime.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!game) {
    return (
      <div className="text-gray-300 p-6">
        Game not found.{" "}
        <button className="underline" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    );
  }

  if (!homeRoster || !awayRoster || !displayGameData) {
    return <div className="text-gray-300 p-6">Roster data not available for this matchup.</div>;
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Game Title / Matchup Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-800/70 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-950/90 p-6 shadow-[0_12px_45px_rgba(0,0,0,0.55)]">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span>{displayGameData?.date ?? "Today"}</span>
              <span className="text-white tracking-[0.25em]">NBA</span>
              <span>{displayGameData?.time ?? "TBD"}</span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr] items-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center p-2">
                  <TeamLogoPlaceholder
                    abbreviation={displayGameData?.teamA?.tricode || home.toUpperCase()}
                    size="xxl"
                    variant="plain"
                  />
                </div>
                <div>
                  <p className="text-white text-xl font-bold">{displayGameData?.teamA?.tricode || home.toUpperCase()}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{displayGameData?.teamA?.name || "Home Team"}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.5em] text-slate-500">Matchup</p>
                <p className="mt-3 text-4xl font-black text-white">
                  {home.toUpperCase()} <span className="text-emerald-400">vs</span> {away.toUpperCase()}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {(displayGameData?.date ?? "Today")} · {(displayGameData?.time ?? "TBD")}
                </p>
                <p className="text-xs text-slate-500">
                  {(displayGameData?.venue?.name && displayGameData?.venue?.city)
                    ? `${displayGameData.venue.name} · ${displayGameData.venue.city}`
                    : "Venue TBA"}
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center p-2">
                  <TeamLogoPlaceholder
                    abbreviation={displayGameData?.teamB?.tricode || away.toUpperCase()}
                    size="xxl"
                    variant="plain"
                  />
                </div>
                <div>
                  <p className="text-white text-xl font-bold">{displayGameData?.teamB?.tricode || away.toUpperCase()}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{displayGameData?.teamB?.name || "Away Team"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border-b border-slate-700/50 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Game Overview</TabsTrigger>
            <TabsTrigger value="player-props">Player Props</TabsTrigger>
            <TabsTrigger value="bench-props">Bench Props</TabsTrigger>
            <TabsTrigger value="team-props">Team Props</TabsTrigger>
            <TabsTrigger value="my-bets">My Bets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <MatchupFactors game={displayGameData as any} />
            <LineupTable game={displayGameData as any} />
          </TabsContent>

          <TabsContent value="player-props" className="mt-6">
            <PlayerPropsTab game={displayGameData as any} />
          </TabsContent>

          <TabsContent value="bench-props" className="mt-6">
            <BenchPropsTab game={displayGameData as any} />
          </TabsContent>

          <TabsContent value="team-props" className="mt-6">
            <TeamPropsTab />
          </TabsContent>

          <TabsContent value="my-bets" className="mt-6">
            <Card className="p-6 bg-slate-800/30 border-slate-700/50">
              <p className="text-white">My Bets view coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
