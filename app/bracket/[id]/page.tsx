import { supabase } from "@/lib/supabase";
import { countryCodes } from "@/data/countryCodes";
import { calculateScore } from "@/lib/scoring";

type Slot = {
  label: string;
  team: string;
};

type ActualResult = {
  match_id: number;
  winner: string;
};

type ActualGroupRanking = {
  group_name: string;
  position: number;
  team: string;
};

function Flag({ team }: { team: string }) {
  const code = countryCodes[team];

  if (!code) return <span className="h-5 w-7 rounded bg-slate-700" />;

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={`${team} flag`}
      className="h-5 w-7 rounded object-cover shadow"
    />
  );
}

function TeamRow({ team, index }: { team: string; index: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 font-bold">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-sm font-black text-black">
        {index + 1}
      </span>

      <Flag team={team} />

      <span>{team}</span>
    </div>
  );
}

function WinnerRow({ slot }: { slot: Slot }) {
  if (!slot?.team) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-lime-400/20 p-3 font-bold">
      <Flag team={slot.team} />

      <span>{slot.team}</span>

      <span className="ml-auto rounded bg-black/40 px-2 py-1 text-xs">
        {slot.label}
      </span>
    </div>
  );
}

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("brackets")
    .select("*")
    .eq("id", id)
    .single();

  const { data: actualResults } = await supabase
    .from("actual_results")
    .select("*");

  const { data: actualGroupRankings } = await supabase
    .from("actual_group_rankings")
    .select("*");

  if (error || !data) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <h1 className="text-4xl font-black">Bracket not found</h1>
      </main>
    );
  }

  const bracket = data.data;
  const rankings = bracket.rankings || {};
  const thirdPlaceRanking = bracket.thirdPlaceRanking || [];
  const winnersByMatch = bracket.winnersByMatch || {};
  const champion = winnersByMatch["104"];

  const score = calculateScore(
    bracket,
    (actualResults || []) as ActualResult[],
    (actualGroupRankings || []) as ActualGroupRanking[]
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-8">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            Shared World Cup Bracket
          </p>

          <h1 className="mt-2 text-5xl font-black">
            {data.name || "World Cup Bracket"}
          </h1>

          <div className="mt-6 rounded-2xl bg-lime-400 p-6 text-black">
            <p className="text-sm font-black uppercase tracking-[0.3em]">
              Current Score
            </p>

            <h2 className="mt-2 text-5xl font-black">{score} pts</h2>
          </div>
        </header>

        {champion?.team && (
          <section className="mt-8 rounded-3xl bg-lime-400 p-8 text-center text-black shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.3em]">
              Predicted Champion
            </p>

            <div className="mt-5 flex justify-center">
              <img
                src={`https://flagcdn.com/w160/${countryCodes[champion.team]}.png`}
                alt={`${champion.team} flag`}
                className="h-24 w-36 rounded-xl object-cover shadow-xl"
              />
            </div>

            <h2 className="mt-5 text-6xl font-black">{champion.team}</h2>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-black">Group Rankings</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(rankings).map(([groupName, teams]) => (
              <div
                key={groupName}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <h3 className="mb-4 text-2xl font-black">Group {groupName}</h3>

                <div className="space-y-3">
                  {(teams as string[]).map((team, index) => (
                    <TeamRow key={team} team={team} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-black">Best Third-Place Teams</h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {thirdPlaceRanking.map((team: string, index: number) => (
              <div
                key={team}
                className={`flex items-center gap-3 rounded-xl border p-3 font-bold ${
                  index < 8
                    ? "border-lime-400 bg-lime-400/20"
                    : "border-white/10 bg-black/40"
                }`}
              >
                <span>{index + 1}</span>

                <Flag team={team} />

                <span>{team}</span>

                <span className="ml-auto text-xs">
                  {index < 8 ? "Advances" : "Out"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-black">Knockout Picks</h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(winnersByMatch).map(([matchId, slot]) => (
              <div key={matchId} className="rounded-2xl bg-black/40 p-4">
                <p className="mb-3 text-xs font-black text-lime-300">
                  Match {matchId}
                </p>

                <WinnerRow slot={slot as Slot} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}