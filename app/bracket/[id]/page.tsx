import { supabase } from "@/lib/supabase";
import { countryCodes } from "@/data/countryCodes";
import { calculateScore } from "@/lib/scoring";

type Slot = {
  label: string;
  team: string;
};

type Match = {
  id: number;
  teamA: Slot;
  teamB: Slot;
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

function TeamLabel({ team }: { team: string }) {
  if (!team) return <span className="text-slate-500">TBD</span>;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <Flag team={team} />
      <span className="truncate">{team}</span>
    </span>
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

function ReadOnlyMatch({ match }: { match: Match }) {
  const winner = match.teamA.team || match.teamB.team ? "" : "";

  return (
    <div className="rounded-2xl border border-lime-400/30 bg-lime-950/20 p-3 shadow-lg">
      <div className="mb-2 text-xs font-black text-lime-300">
        M{match.id}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm font-black">
          <TeamLabel team={match.teamA.team} />
          <span className="ml-2 rounded bg-black/30 px-2 py-1 text-[10px]">
            {match.teamA.label}
          </span>
        </div>

        <div className="text-center text-[10px] font-black text-lime-300">
          VS
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm font-black">
          <TeamLabel team={match.teamB.team} />
          <span className="ml-2 rounded bg-black/30 px-2 py-1 text-[10px]">
            {match.teamB.label}
          </span>
        </div>
      </div>
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

  function winner(matchId: number): Slot {
    return winnersByMatch[String(matchId)] || { label: `W${matchId}`, team: "" };
  }

  const round32: Match[] = [
    { id: 74, teamA: winner(74), teamB: { label: "Opponent", team: "" } },
    { id: 77, teamA: winner(77), teamB: { label: "Opponent", team: "" } },
    { id: 73, teamA: winner(73), teamB: { label: "Opponent", team: "" } },
    { id: 75, teamA: winner(75), teamB: { label: "Opponent", team: "" } },
    { id: 83, teamA: winner(83), teamB: { label: "Opponent", team: "" } },
    { id: 84, teamA: winner(84), teamB: { label: "Opponent", team: "" } },
    { id: 81, teamA: winner(81), teamB: { label: "Opponent", team: "" } },
    { id: 82, teamA: winner(82), teamB: { label: "Opponent", team: "" } },
    { id: 76, teamA: winner(76), teamB: { label: "Opponent", team: "" } },
    { id: 78, teamA: winner(78), teamB: { label: "Opponent", team: "" } },
    { id: 79, teamA: winner(79), teamB: { label: "Opponent", team: "" } },
    { id: 80, teamA: winner(80), teamB: { label: "Opponent", team: "" } },
    { id: 86, teamA: winner(86), teamB: { label: "Opponent", team: "" } },
    { id: 88, teamA: winner(88), teamB: { label: "Opponent", team: "" } },
    { id: 85, teamA: winner(85), teamB: { label: "Opponent", team: "" } },
    { id: 87, teamA: winner(87), teamB: { label: "Opponent", team: "" } },
  ];

  const round16: Match[] = [
    { id: 89, teamA: winner(74), teamB: winner(77) },
    { id: 90, teamA: winner(73), teamB: winner(75) },
    { id: 93, teamA: winner(83), teamB: winner(84) },
    { id: 94, teamA: winner(81), teamB: winner(82) },
    { id: 91, teamA: winner(76), teamB: winner(78) },
    { id: 92, teamA: winner(79), teamB: winner(80) },
    { id: 95, teamA: winner(86), teamB: winner(88) },
    { id: 96, teamA: winner(85), teamB: winner(87) },
  ];

  const quarterfinals: Match[] = [
    { id: 97, teamA: winner(89), teamB: winner(90) },
    { id: 98, teamA: winner(93), teamB: winner(94) },
    { id: 99, teamA: winner(91), teamB: winner(92) },
    { id: 100, teamA: winner(95), teamB: winner(96) },
  ];

  const semifinals: Match[] = [
    { id: 101, teamA: winner(97), teamB: winner(98) },
    { id: 102, teamA: winner(99), teamB: winner(100) },
  ];

  const thirdPlace: Match = {
    id: 103,
    teamA: winner(103),
    teamB: { label: "Opponent", team: "" },
  };

  const final: Match = {
    id: 104,
    teamA: winner(101),
    teamB: winner(102),
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-[1700px] px-5 py-8">
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
          <h2 className="text-3xl font-black">Knockout Bracket</h2>

          <div className="mt-6 overflow-x-auto rounded-[2rem] border border-lime-400/30 bg-black/70 p-6">
            <div className="flex min-w-[1450px] items-center justify-between gap-6">
              <div className="grid w-[260px] gap-4">
                {round32.slice(0, 8).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="grid w-[240px] gap-8">
                {round16.slice(0, 4).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="grid w-[230px] gap-16">
                {quarterfinals.slice(0, 2).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="grid w-[220px] gap-20">
                {semifinals.slice(0, 1).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="w-[280px] rounded-[2rem] border border-lime-400 bg-lime-400 p-6 text-center text-black shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em]">
                  Final M104
                </p>

                <div className="mt-4">
                  <ReadOnlyMatch match={final} />
                </div>

                <div className="mt-6 rounded-2xl bg-black/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Third Place M103
                  </p>

                  <div className="mt-3">
                    <ReadOnlyMatch match={thirdPlace} />
                  </div>
                </div>
              </div>

              <div className="grid w-[220px] gap-20">
                {semifinals.slice(1, 2).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="grid w-[230px] gap-16">
                {quarterfinals.slice(2, 4).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="grid w-[240px] gap-8">
                {round16.slice(4, 8).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>

              <div className="grid w-[260px] gap-4">
                {round32.slice(8, 16).map((match) => (
                  <ReadOnlyMatch key={match.id} match={match} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
