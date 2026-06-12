import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ id: string }>;
};

type Match = {
  teamA: string;
  teamB: string;
};

function createKnockoutMatches(teams: string[]): Match[] {
  const matches: Match[] = [];

  for (let i = 0; i < teams.length / 2; i++) {
    matches.push({
      teamA: teams[i],
      teamB: teams[teams.length - 1 - i],
    });
  }

  return matches;
}

function getRoundName(roundIndex: number) {
  const names = [
    "Round of 32",
    "Round of 16",
    "Quarterfinals",
    "Semifinals",
    "Final",
  ];

  return names[roundIndex] || `Round ${roundIndex + 1}`;
}

function getTeamsForRound(
  roundIndex: number,
  knockoutTeams: string[],
  roundWinners: Record<number, Record<number, string>>
): string[] {
  if (roundIndex === 0) return knockoutTeams;

  const previousTeams = getTeamsForRound(
    roundIndex - 1,
    knockoutTeams,
    roundWinners
  );

  const previousMatches = createKnockoutMatches(previousTeams);

  return previousMatches
    .map((_, matchIndex) => roundWinners[roundIndex - 1]?.[matchIndex])
    .filter(Boolean);
}

export default async function SavedBracketPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("brackets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <h1 className="text-4xl font-bold">Bracket not found</h1>
      </main>
    );
  }

  const bracket = data.data;
  const roundWinners = bracket.roundWinners || {};
  const knockoutTeams = bracket.knockoutTeams || [];

  const champion = getTeamsForRound(5, knockoutTeams, roundWinners)[0];

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold">Saved World Cup Bracket</h1>

        <p className="mt-3 text-slate-300">
          This is a shared 2026 World Cup prediction.
        </p>

        {champion && (
          <section className="mt-10 rounded-2xl bg-green-500 p-8 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-black">Champion</h2>
            <p className="mt-3 text-6xl font-extrabold text-black">
              {champion}
            </p>
          </section>
        )}

        <section className="mt-10 rounded-2xl bg-slate-800 p-6 shadow-xl">
          <h2 className="text-3xl font-bold">Knockout Bracket</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((roundIndex) => {
              const teamsForRound = getTeamsForRound(
                roundIndex,
                knockoutTeams,
                roundWinners
              );

              const matches = createKnockoutMatches(teamsForRound);

              if (teamsForRound.length < 2) return null;

              return (
                <div key={roundIndex}>
                  <h3 className="mb-4 text-xl font-bold">
                    {getRoundName(roundIndex)}
                  </h3>

                  <div className="space-y-4">
                    {matches.map((match, matchIndex) => {
                      const winner = roundWinners[roundIndex]?.[matchIndex];

                      return (
                        <div
                          key={matchIndex}
                          className="rounded-xl border border-slate-600 bg-slate-900 p-3"
                        >
                          <div
                            className={`rounded-lg p-2 ${
                              winner === match.teamA
                                ? "bg-green-500 text-black"
                                : "bg-slate-700"
                            }`}
                          >
                            {match.teamA}
                          </div>

                          <div className="my-2 text-center text-xs text-slate-400">
                            vs
                          </div>

                          <div
                            className={`rounded-lg p-2 ${
                              winner === match.teamB
                                ? "bg-green-500 text-black"
                                : "bg-slate-700"
                            }`}
                          >
                            {match.teamB}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-slate-800 p-6 shadow-xl">
          <h2 className="text-3xl font-bold">Group Rankings</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(bracket.rankings).map(([groupName, teams]) => (
              <div key={groupName} className="rounded-xl bg-slate-900 p-4">
                <h3 className="text-xl font-bold">Group {groupName}</h3>

                <ol className="mt-3 space-y-2">
                  {(teams as string[]).map((team, index) => (
                    <li
                      key={team}
                      className="rounded-lg border border-slate-700 p-3"
                    >
                      {index + 1}. {team}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-slate-800 p-6 shadow-xl">
          <h2 className="text-3xl font-bold">Best Third-Place Teams</h2>

          <ol className="mt-4 space-y-2">
            {bracket.thirdPlaceRanking?.map((team: string, index: number) => (
              <li
                key={team}
                className={`rounded-lg border p-3 ${
                  index < 8
                    ? "border-green-500 bg-green-900"
                    : "border-slate-700 bg-slate-900"
                }`}
              >
                {index + 1}. {team}{" "}
                {index < 8 ? "— advances" : "— eliminated"}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}