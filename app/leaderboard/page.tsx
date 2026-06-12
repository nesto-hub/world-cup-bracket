import { supabase } from "@/lib/supabase";
import { calculateScore } from "@/lib/scoring";

type ActualResult = {
  match_id: number;
  winner: string;
};

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

  if (bracketsError || resultsError) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-4xl font-black">Error loading leaderboard</h1>
      </main>
    );
  }

  const leaderboard = (brackets || [])
    .map((bracket) => ({
      id: bracket.id,
      name: bracket.name || "Anonymous",
      league: bracket.league || "public",
      score: calculateScore(
        bracket.data,
        (actualResults || []) as ActualResult[]
      ),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%)]" />

      <div className="relative mx-auto max-w-4xl px-5 py-8">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            World Cup Bracket
          </p>

          <h1 className="mt-2 text-5xl font-black">
            {league ? `${league} Leaderboard` : "Leaderboard"}
          </h1>

          <p className="mt-3 text-slate-300">
            Scores update as actual match results are entered.
          </p>

          {league && (
            <p className="mt-4 rounded-xl bg-black/40 p-3 text-sm text-slate-300">
              League link:{" "}
              <span className="font-bold text-lime-400">
                /leaderboard?league={league}
              </span>
            </p>
          )}
        </header>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <a
                key={player.id}
                href={`/bracket/${player.id}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-black">
                    {index + 1}
                  </span>

                  <div>
                    <h2 className="text-xl font-black">{player.name}</h2>
                    <p className="text-sm text-slate-400">
                      League: {player.league}
                    </p>
                  </div>
                </div>

                <div className="text-3xl font-black text-lime-400">
                  {player.score}
                </div>
              </a>
            ))}

            {leaderboard.length === 0 && (
              <p className="text-slate-300">
                No brackets saved in this league yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}