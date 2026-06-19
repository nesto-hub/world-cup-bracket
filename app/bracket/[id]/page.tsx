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

function ReadOnlyMatch({
  match,
  pickedWinner,
}: {
  match: Match;
  pickedWinner?: Slot;
}) {
  const pickedTeam = pickedWinner?.team;

  return (
    <div className="rounded-2xl border border-lime-400/30 bg-lime-950/20 p-3 shadow-lg">
      <div className="mb-2 text-xs font-black text-lime-300">M{match.id}</div>

      <div className="space-y-2">
        <div
          className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-black ${
            pickedTeam && pickedTeam === match.teamA.team
              ? "bg-lime-400 text-black"
              : "bg-white/10 text-white"
          }`}
        >
          <TeamLabel team={match.teamA.team} />
          <span className="ml-2 rounded bg-black/30 px-2 py-1 text-[10px]">
            {match.teamA.label}
          </span>
        </div>

        <div className="text-center text-[10px] font-black text-lime-300">
          VS
        </div>

        <div
          className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-black ${
            pickedTeam && pickedTeam === match.teamB.team
              ? "bg-lime-400 text-black"
              : "bg-white/10 text-white"
          }`}
        >
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

  const { data: actualThirdPlaceTeams } = await supabase
    .from("actual_third_place_teams")
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

  const score = calculateScore(
    bracket,
    (actualResults || []) as ActualResult[],
    (actualGroupRankings || []) as ActualGroupRanking[],
    actualThirdPlaceTeams || []
  );

  function getTeam(group: string, position: number): string {
    return (rankings[group] as string[] | undefined)?.[position - 1] || "";
  }

  function getThirdPlaceGroup(team: string): string {
    const entry = Object.entries(rankings).find(
      ([, groupRanking]) => (groupRanking as string[])[2] === team
    );

    return entry?.[0] || "";
  }

  function getThirdPlaceSlot(
    allowedGroups: string[],
    usedGroups: Set<string>
  ): Slot {
    for (const team of (thirdPlaceRanking as string[]).slice(0, 8)) {
      const group = getThirdPlaceGroup(team);

      if (group && allowedGroups.includes(group) && !usedGroups.has(group)) {
        usedGroups.add(group);
        return { label: `3${group}`, team };
      }
    }

    return { label: `3${allowedGroups.join("")}`, team: "" };
  }

  function buildRoundOf32(): Match[] {
    const usedThirdGroups = new Set<string>();
    const third = (allowed: string[]) =>
      getThirdPlaceSlot(allowed, usedThirdGroups);

    return [
      {
        id: 74,
        teamA: { label: "1E", team: getTeam("E", 1) },
        teamB: third(["A", "B", "C", "D", "F"]),
      },
      {
        id: 77,
        teamA: { label: "1I", team: getTeam("I", 1) },
        teamB: third(["C", "D", "F", "G", "H"]),
      },
      {
        id: 73,
        teamA: { label: "2A", team: getTeam("A", 2) },
        teamB: { label: "2B", team: getTeam("B", 2) },
      },
      {
        id: 75,
        teamA: { label: "1F", team: getTeam("F", 1) },
        teamB: { label: "2C", team: getTeam("C", 2) },
      },
      {
        id: 83,
        teamA: { label: "2K", team: getTeam("K", 2) },
        teamB: { label: "2L", team: getTeam("L", 2) },
      },
      {
        id: 84,
        teamA: { label: "1H", team: getTeam("H", 1) },
        teamB: { label: "2J", team: getTeam("J", 2) },
      },
      {
        id: 81,
        teamA: { label: "1D", team: getTeam("D", 1) },
        teamB: third(["B", "E", "F", "I", "J"]),
      },
      {
        id: 82,
        teamA: { label: "1G", team: getTeam("G", 1) },
        teamB: third(["A", "E", "H", "I", "J"]),
      },
      {
        id: 76,
        teamA: { label: "1C", team: getTeam("C", 1) },
        teamB: { label: "2F", team: getTeam("F", 2) },
      },
      {
        id: 78,
        teamA: { label: "2E", team: getTeam("E", 2) },
        teamB: { label: "2I", team: getTeam("I", 2) },
      },
      {
        id: 79,
        teamA: { label: "1A", team: getTeam("A", 1) },
        teamB: third(["C", "E", "F", "H", "I"]),
      },
      {
        id: 80,
        teamA: { label: "1L", team: getTeam("L", 1) },
        teamB: third(["E", "H", "I", "J", "K"]),
      },
      {
        id: 86,
        teamA: { label: "1J", team: getTeam("J", 1) },
        teamB: { label: "2H", team: getTeam("H", 2) },
      },
      {
        id: 88,
        teamA: { label: "2D", team: getTeam("D", 2) },
        teamB: { label: "2G", team: getTeam("G", 2) },
      },
      {
        id: 85,
        teamA: { label: "1B", team: getTeam("B", 1) },
        teamB: third(["E", "F", "G", "I", "J"]),
      },
      {
        id: 87,
        teamA: { label: "1K", team: getTeam("K", 1) },
        teamB: third(["D", "E", "I", "J", "L"]),
      },
    ];
  }

  function winner(matchId: number): Slot {
    return (
      winnersByMatch[String(matchId)] || {
        label: `W${matchId}`,
        team: "",
      }
    );
  }

  function winnerFromMatch(match: Match): Slot {
    const picked = winnersByMatch[String(match.id)];

    if (
      picked?.team &&
      (picked.team === match.teamA.team || picked.team === match.teamB.team)
    ) {
      return picked;
    }

    if (match.teamA.team && !match.teamA.label.startsWith("3")) {
      return match.teamA;
    }

    if (match.teamB.team && !match.teamB.label.startsWith("3")) {
      return match.teamB;
    }

    return { label: `W${match.id}`, team: "" };
  }

  const round32 = buildRoundOf32();

  const round16: Match[] = [
    {
      id: 89,
      teamA: winnerFromMatch(round32[0]),
      teamB: winnerFromMatch(round32[1]),
    },
    {
      id: 90,
      teamA: winnerFromMatch(round32[2]),
      teamB: winnerFromMatch(round32[3]),
    },
    {
      id: 93,
      teamA: winnerFromMatch(round32[4]),
      teamB: winnerFromMatch(round32[5]),
    },
    {
      id: 94,
      teamA: winnerFromMatch(round32[6]),
      teamB: winnerFromMatch(round32[7]),
    },
    {
      id: 91,
      teamA: winnerFromMatch(round32[8]),
      teamB: winnerFromMatch(round32[9]),
    },
    {
      id: 92,
      teamA: winnerFromMatch(round32[10]),
      teamB: winnerFromMatch(round32[11]),
    },
    {
      id: 95,
      teamA: winnerFromMatch(round32[12]),
      teamB: winnerFromMatch(round32[13]),
    },
    {
      id: 96,
      teamA: winnerFromMatch(round32[14]),
      teamB: winnerFromMatch(round32[15]),
    },
  ];

  const quarterfinals: Match[] = [
    {
      id: 97,
      teamA: winnerFromMatch(round16[0]),
      teamB: winnerFromMatch(round16[1]),
    },
    {
      id: 98,
      teamA: winnerFromMatch(round16[2]),
      teamB: winnerFromMatch(round16[3]),
    },
    {
      id: 99,
      teamA: winnerFromMatch(round16[4]),
      teamB: winnerFromMatch(round16[5]),
    },
    {
      id: 100,
      teamA: winnerFromMatch(round16[6]),
      teamB: winnerFromMatch(round16[7]),
    },
  ];

  const semifinals: Match[] = [
    {
      id: 101,
      teamA: winnerFromMatch(quarterfinals[0]),
      teamB: winnerFromMatch(quarterfinals[1]),
    },
    {
      id: 102,
      teamA: winnerFromMatch(quarterfinals[2]),
      teamB: winnerFromMatch(quarterfinals[3]),
    },
  ];

  const final: Match = {
    id: 104,
    teamA: winnerFromMatch(semifinals[0]),
    teamB: winnerFromMatch(semifinals[1]),
  };

  function loserFromMatch(match: Match): Slot {
    const pickedWinner = winnerFromMatch(match);

    if (!pickedWinner.team) {
      return { label: `L${match.id}`, team: "" };
    }

    if (pickedWinner.team === match.teamA.team) {
      return { label: `L${match.id}`, team: match.teamB.team };
    }

    if (pickedWinner.team === match.teamB.team) {
      return { label: `L${match.id}`, team: match.teamA.team };
    }

    return { label: `L${match.id}`, team: "" };
  }

  const thirdPlace: Match = {
    id: 103,
    teamA: loserFromMatch(semifinals[0]),
    teamB: loserFromMatch(semifinals[1]),
  };

  const champion = winnerFromMatch(final);

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
            {(thirdPlaceRanking as string[]).map((team, index) => (
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
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="grid w-[240px] gap-8">
                {round16.slice(0, 4).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="grid w-[230px] gap-16">
                {quarterfinals.slice(0, 2).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="grid w-[220px] gap-20">
                {semifinals.slice(0, 1).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="w-[280px] rounded-[2rem] border border-lime-400 bg-lime-400 p-6 text-center text-black shadow-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em]">
                  Final M104
                </p>

                <div className="mt-4">
                  <ReadOnlyMatch
                    match={final}
                    pickedWinner={winnerFromMatch(final)}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-black/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Third Place M103
                  </p>

                  <div className="mt-3">
                    <ReadOnlyMatch
                      match={thirdPlace}
                      pickedWinner={winner(103)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid w-[220px] gap-20">
                {semifinals.slice(1, 2).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="grid w-[230px] gap-16">
                {quarterfinals.slice(2, 4).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="grid w-[240px] gap-8">
                {round16.slice(4, 8).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>

              <div className="grid w-[260px] gap-4">
                {round32.slice(8, 16).map((match) => (
                  <ReadOnlyMatch
                    key={match.id}
                    match={match}
                    pickedWinner={winnerFromMatch(match)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
