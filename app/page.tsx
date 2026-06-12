"use client";

import { useState } from "react";
import { groups } from "@/data/groups";
import { countryCodes } from "@/data/countryCodes";
import { supabase } from "@/lib/supabase";

type Rankings = Record<string, string[]>;

type Slot = {
  label: string;
  team: string;
};

type Match = {
  id: number;
  teamA: Slot;
  teamB: Slot;
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
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Flag team={team} />
      <span className="truncate">{team}</span>
    </span>
  );
}

function MatchButton({
  slot,
  selected,
  onClick,
}: {
  slot: Slot;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={!slot.team}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-black transition ${
        selected
          ? "bg-lime-400 text-black"
          : slot.team
          ? "bg-white/10 text-white hover:bg-lime-400/30"
          : "bg-white/5 text-slate-500"
      }`}
    >
      <span className="min-w-0">
        {slot.team ? <TeamLabel team={slot.team} /> : "TBD"}
      </span>

      <span className="ml-2 shrink-0 rounded bg-black/30 px-2 py-1 text-[10px]">
        {slot.label}
      </span>
    </button>
  );
}

export default function Home() {
  const initialRankings: Rankings = Object.fromEntries(
    Object.entries(groups).map(([groupName, teams]) => [groupName, teams])
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [rankings, setRankings] = useState<Rankings>(initialRankings);
  const [thirdPlaceRanking, setThirdPlaceRanking] = useState<string[]>([]);
  const [winnersByMatch, setWinnersByMatch] = useState<Record<number, Slot>>({});
  const [shareUrl, setShareUrl] = useState("");

  function getTeam(group: string, position: number): string {
    return rankings[group]?.[position - 1] || "";
  }

  function getThirdPlaceGroup(team: string): string {
    const entry = Object.entries(rankings).find(
      ([, groupRanking]) => groupRanking[2] === team
    );

    return entry?.[0] || "";
  }

  function getThirdPlaceSlot(
    allowedGroups: string[],
    usedGroups: Set<string>
  ): Slot {
    for (const team of thirdPlaceRanking) {
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
    return winnersByMatch[matchId] || { label: `W${matchId}`, team: "" };
  }

  const round32 = buildRoundOf32();

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

  const final: Match = {
    id: 104,
    teamA: winner(101),
    teamB: winner(102),
  };

  const champion = winnersByMatch[104];

  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
    groupName: string,
    index: number
  ) {
    event.dataTransfer.setData("groupName", groupName);
    event.dataTransfer.setData("index", String(index));
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    groupName: string,
    dropIndex: number
  ) {
    const sourceGroup = event.dataTransfer.getData("groupName");
    const sourceIndex = Number(event.dataTransfer.getData("index"));

    if (sourceGroup !== groupName) return;

    setRankings((old) => {
      const updatedGroup = [...old[groupName]];
      const [movedTeam] = updatedGroup.splice(sourceIndex, 1);
      updatedGroup.splice(dropIndex, 0, movedTeam);

      return { ...old, [groupName]: updatedGroup };
    });

    setThirdPlaceRanking([]);
    setWinnersByMatch({});
    setShareUrl("");
  }

  function generateThirdPlaceRanking() {
    const thirdPlaceTeams = Object.values(rankings)
      .map((groupRanking) => groupRanking[2])
      .filter(Boolean);

    setThirdPlaceRanking(thirdPlaceTeams);
    setWinnersByMatch({});
    setShareUrl("");
    setCurrentStep(2);
  }

  function handleThirdPlaceDragStart(
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) {
    event.dataTransfer.setData("thirdPlaceIndex", String(index));
  }

  function handleThirdPlaceDrop(
    event: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) {
    const sourceIndex = Number(event.dataTransfer.getData("thirdPlaceIndex"));

    setThirdPlaceRanking((old) => {
      const updated = [...old];
      const [movedTeam] = updated.splice(sourceIndex, 1);
      updated.splice(dropIndex, 0, movedTeam);
      return updated;
    });

    setWinnersByMatch({});
    setShareUrl("");
  }

  function startKnockout() {
    if (thirdPlaceRanking.length < 8) {
      alert("Rank the third-place teams first.");
      return;
    }

    setWinnersByMatch({});
    setShareUrl("");
    setCurrentStep(3);
  }

  function selectWinner(matchId: number, slot: Slot) {
    if (!slot.team) return;

    setWinnersByMatch((old) => ({
      ...old,
      [matchId]: slot,
    }));

    setShareUrl("");
  }

  async function saveBracket() {
    const bracketData = {
      rankings,
      thirdPlaceRanking,
      winnersByMatch,
    };

    const { data, error } = await supabase
      .from("brackets")
      .insert({
        name: "My World Cup Bracket",
        data: bracketData,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error saving bracket.");
      return;
    }

    setShareUrl(`${window.location.origin}/bracket/${data.id}`);
  }

  function StepButton({
    step,
    label,
  }: {
    step: number;
    label: string;
  }) {
    return (
      <button
        onClick={() => setCurrentStep(step)}
        className={`rounded-full px-5 py-2 text-sm font-black ${
          currentStep === step
            ? "bg-lime-400 text-black"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {label}
      </button>
    );
  }

  function RenderMatch({ match }: { match: Match }) {
    return (
      <div className="rounded-2xl border border-lime-400/30 bg-lime-950/20 p-3 shadow-lg">
        <div className="mb-2 text-xs font-black text-lime-300">
          M{match.id}
        </div>

        <MatchButton
          slot={match.teamA}
          selected={winnersByMatch[match.id]?.team === match.teamA.team}
          onClick={() => selectWinner(match.id, match.teamA)}
        />

        <div className="my-2 text-center text-[10px] font-black text-lime-300">
          VS
        </div>

        <MatchButton
          slot={match.teamB}
          selected={winnersByMatch[match.id]?.team === match.teamB.team}
          onClick={() => selectWinner(match.id, match.teamB)}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-[1700px] px-5 py-8">
        <header className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            FIFA World Cup 2026
          </p>

          <h1 className="mt-2 text-5xl font-black">Bracket Predictor</h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <StepButton step={1} label="1. Groups" />
            <StepButton step={2} label="2. Third-place teams" />
            <StepButton step={3} label="3. Knockouts" />
            <StepButton step={4} label="4. Save & Share" />
          </div>
        </header>

        {currentStep === 1 && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black">Group Stage</h2>
                <p className="mt-2 text-slate-300">
                  Drag teams inside each group to predict 1st, 2nd, 3rd, and 4th.
                </p>
              </div>

              <button
                onClick={generateThirdPlaceRanking}
                className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Continue to Third-Place Teams
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(rankings).map(([groupName, teams]) => (
                <div
                  key={groupName}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-black">
                      {groupName}
                    </span>

                    <h3 className="text-2xl font-black">Group {groupName}</h3>
                  </div>

                  <div className="space-y-3">
                    {teams.map((team, index) => (
                      <div
                        key={team}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, groupName, index)
                        }
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, groupName, index)}
                        className="flex cursor-move items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 hover:bg-black/60"
                      >
                        <div className="flex min-w-0 items-center gap-3 font-bold">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                              index < 2
                                ? "bg-lime-400 text-black"
                                : index === 2
                                ? "bg-yellow-300 text-black"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <TeamLabel team={team} />
                        </div>

                        <span className="text-slate-500">⋮⋮</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black">Best Third-Place Teams</h2>
                <p className="mt-2 text-slate-300">
                  Drag the third-place teams. The top 8 advance to the Round of 32.
                </p>
              </div>

              <button
                onClick={startKnockout}
                className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Continue to Knockouts
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {thirdPlaceRanking.map((team, index) => (
                <div
                  key={team}
                  draggable
                  onDragStart={(event) =>
                    handleThirdPlaceDragStart(event, index)
                  }
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleThirdPlaceDrop(event, index)}
                  className={`flex cursor-move items-center justify-between rounded-2xl border p-4 font-bold ${
                    index < 8
                      ? "border-lime-400 bg-lime-400/20"
                      : "border-white/10 bg-white/10"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                        index < 8
                          ? "bg-lime-400 text-black"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <TeamLabel team={team} />
                  </div>

                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-black">
                    {index < 8 ? "Advances" : "Out"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black">Knockout Bracket</h2>
                <p className="mt-2 text-slate-300">
                  Click winners. The matches follow the official-style 2026 bracket path.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Continue to Save
              </button>
            </div>

            <div className="overflow-x-auto rounded-[2rem] border border-lime-400/30 bg-black/70 p-6 shadow-2xl">
              <div className="mb-8 text-center">
                <h3 className="text-5xl font-black">WORLD CHAMPIONS</h3>
              </div>

              <div className="flex min-w-[1450px] items-center justify-between gap-6">
                <div className="grid w-[260px] gap-4">
                  {round32.slice(0, 8).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[240px] gap-8">
                  {round16.slice(0, 4).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[230px] gap-16">
                  {quarterfinals.slice(0, 2).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[220px] gap-20">
                  {semifinals.slice(0, 1).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="w-[280px] rounded-[2rem] border border-lime-400 bg-lime-400 p-6 text-center text-black shadow-2xl">
                  <p className="text-xs font-black uppercase tracking-[0.3em]">
                    Final M104
                  </p>

                  <div className="mt-4">
                    <RenderMatch match={final} />
                  </div>

                  {champion?.team && (
                    <div className="mt-6">
                      <p className="text-xs font-black uppercase tracking-[0.3em]">
                        Champion
                      </p>

                      <img
                        src={`https://flagcdn.com/w160/${
                          countryCodes[champion.team]
                        }.png`}
                        alt={`${champion.team} flag`}
                        className="mx-auto mt-4 h-20 w-32 rounded-xl object-cover shadow-xl"
                      />

                      <h3 className="mt-4 text-3xl font-black">
                        {champion.team}
                      </h3>
                    </div>
                  )}
                </div>

                <div className="grid w-[220px] gap-20">
                  {semifinals.slice(1, 2).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[230px] gap-16">
                  {quarterfinals.slice(2, 4).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[240px] gap-8">
                  {round16.slice(4, 8).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[260px] gap-4">
                  {round32.slice(8, 16).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {currentStep === 4 && (
          <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-4xl font-black">Save & Share</h2>

            <p className="mt-2 text-slate-300">
              Save your bracket and send the link to friends.
            </p>

            <button
              onClick={saveBracket}
              className="mt-6 rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
            >
              Save Bracket
            </button>

            {shareUrl && (
              <input
                className="mt-6 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
                value={shareUrl}
                readOnly
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}