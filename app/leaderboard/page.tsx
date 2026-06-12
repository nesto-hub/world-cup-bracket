import { supabase } from "@/lib/supabase";
import { calculateScore } from "@/lib/scoring";

type ActualResult = {
  match_id: number;
  winner: string;
};

type ActualGroupRanking = {
  group_name: string;
  position: number;
  team: string;
};

type Slot = {
  label: string;
  team: string;
};

function getMedal(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return index + 1;
}

function getChampionPick(bracketData: any) {
  const champion = bracketData?.winnersByMatch?.["104"] as Slot | undefined;
  return champion?.team || "No champion picked";
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league } = await searchParams;

  let bracketsQuery = supabase.from("brackets").select("*");

  if (league) {
    bracketsQuery = bracketsQuery.eq("league", league.toLowerCase());
  }

  const { data: brackets, error: bracketsError } = await bracketsQuery;

  const { data: actualResults, error: resultsError } = await supabase
    .from("actual_results")
    .select("*");

  const { data: actualGroupRankings, error: groupError } = await supabase
    .from("actual_group_rankings")
    .select("*");

  if (bracketsError || resultsError || groupError) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-4xl font-black">Error loading leaderboard</h1>
      </main>
    );
  }

  const leaderboard = (brackets || [])
    .map((bracket) => ({
      id: bracket.id,
      name: bracket.player_name || bracket.name || "Anonymous",
      league: bracket.league || "public",
      championPick: getChampionPick(bracket.data),
      score: calculateScore(
        bracket.data,
        (actualResults || []) as ActualResult[],
        (actualGroupRankings || []) as ActualGroupRanking[]
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const leader = leaderboard[0];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.16),transparent_45%)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-8">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            World Cup Bracket
          </p>

          <h1 className="mt-2 text-5xl font-black">
            {league ? `${league} League` : "Leaderboard"}
          </h1>

          <p className="mt-3 text-slate-300">
            Scores update as group rankings and match winners are entered.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-black/40 p-5">
              <p className="text-sm text-slate-400">Players</p>
              <p className="mt-1 text-4xl font-black text-lime-400">
                {leaderboard.length}
              </p>
            </div>

            <div className="rounded-2xl bg-black/40 p-5">
              <p className="text-sm text-slate-400">Current Leader</p>
              <p className="mt-1 text-2xl font-black">
                {leader ? leader.name : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-black/40 p-5">
              <p className="text-sm text-slate-400">Top Score</p>
              <p className="mt-1 text-4xl font-black text-lime-400">
                {leader ? leader.score : 0}
              </p>
            </div>
          </div>

          {league && (
            <div className="mt-6 rounded-2xl bg-black/40 p-4 text-sm text-slate-300">
              Share this league leaderboard:
                <a
                  href={`/leaderboard/${league}`}
                  className="ml-2 font-bold text-lime-400 hover:underline"
                >
                  /leaderboard/{league}
                </a>
            </div>
          )}
        </header>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-black">Standings</h2>

          <div className="mt-6 space-y-4">
            {leaderboard.map((player, index) => (
              <a
                key={player.id}
                href={`/bracket/${player.id}`}
                className={`flex flex-col gap-4 rounded-2xl border p-5 transition hover:bg-white/10 md:flex-row md:items-center md:justify-between ${
                  index === 0
                    ? "border-lime-400 bg-lime-400/20"
                    : "border-white/10 bg-black/40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${
                      index < 3
                        ? "bg-lime-400 text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {getMedal(index)}
                  </span>

                  <div>
                    <h3 className="text-2xl font-black">{player.name}</h3>
                    <p className="text-sm text-slate-400">
                      Champion pick: {player.championPick}
                    </p>
                    <p className="text-sm text-slate-500">
                      League: {player.league}
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                    Score
                  </p>
                  <p className="text-4xl font-black text-lime-400">
                    {player.score}
                  </p>
                </div>
              </a>
            ))}

            {leaderboard.length === 0 && (
              <p className="rounded-2xl bg-black/40 p-5 text-slate-300">
                No brackets saved in this league yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}