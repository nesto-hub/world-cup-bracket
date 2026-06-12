"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { groups } from "@/data/groups";
import { countryCodes } from "@/data/countryCodes";
import { supabase } from "@/lib/supabase";
import { BRACKET_LOCK_DATE } from "@/lib/config";

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
      draggable={false}
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

function PredictPageContent() {
  const searchParams = useSearchParams();

  const initialRankings: Rankings = Object.fromEntries(
    Object.entries(groups).map(([groupName, teams]) => [groupName, teams])
  );

  const isLocked = new Date() > BRACKET_LOCK_DATE;
  const leagueFromUrl = searchParams.get("league") || "public";

  const [currentStep, setCurrentStep] = useState(1);
  const [mobileRound, setMobileRound] = useState(0);
  const [rankings, setRankings] = useState<Rankings>(initialRankings);
  const [thirdPlaceRanking, setThirdPlaceRanking] = useState<string[]>([]);
  const [winnersByMatch, setWinnersByMatch] = useState<Record<number, Slot>>({});
  const [shareUrl, setShareUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [leagueCode] = useState(leagueFromUrl);

  const [selectedGroupSwap, setSelectedGroupSwap] = useState<{
    groupName: string;
    team: string;
  } | null>(null);

  const [selectedThirdPlaceSwap, setSelectedThirdPlaceSwap] =
    useState<string | null>(null);

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

  function loser(match: Match): Slot {
    const selectedWinner = winnersByMatch[match.id];

    if (!selectedWinner) {
      return { label: `L${match.id}`, team: "" };
    }

    return selectedWinner.team === match.teamA.team ? match.teamB : match.teamA;
  }

  const thirdPlaceMatch: Match = {
    id: 103,
    teamA: loser(semifinals[0]),
    teamB: loser(semifinals[1]),
  };

  const final: Match = {
    id: 104,
    teamA: winner(101),
    teamB: winner(102),
  };

  const rounds = [
    { name: "Round of 32", matches: round32 },
    { name: "Round of 16", matches: round16 },
    { name: "Quarterfinals", matches: quarterfinals },
    { name: "Semifinals", matches: semifinals },
    { name: "Third Place", matches: [thirdPlaceMatch] },
    { name: "Final", matches: [final] },
  ];

  const champion = winnersByMatch[104];

  function swapGroupTeam(groupName: string, team: string) {
    if (
      selectedGroupSwap &&
      selectedGroupSwap.groupName === groupName &&
      selectedGroupSwap.team === team
    ) {
      setSelectedGroupSwap(null);
      return;
    }

    if (!selectedGroupSwap || selectedGroupSwap.groupName !== groupName) {
      setSelectedGroupSwap({ groupName, team });
      return;
    }

    setRankings((old) => {
      const updatedGroup = [...old[groupName]];
      const firstIndex = updatedGroup.indexOf(selectedGroupSwap.team);
      const secondIndex = updatedGroup.indexOf(team);

      if (firstIndex === -1 || secondIndex === -1) return old;

      updatedGroup[firstIndex] = team;
      updatedGroup[secondIndex] = selectedGroupSwap.team;

      return {
        ...old,
        [groupName]: updatedGroup,
      };
    });

    setSelectedGroupSwap(null);
    setThirdPlaceRanking([]);
    setWinnersByMatch({});
    setShareUrl("");
  }

  function swapThirdPlaceTeam(team: string) {
    if (selectedThirdPlaceSwap === team) {
      setSelectedThirdPlaceSwap(null);
      return;
    }

    if (!selectedThirdPlaceSwap) {
      setSelectedThirdPlaceSwap(team);
      return;
    }

    setThirdPlaceRanking((old) => {
      const updated = [...old];
      const firstIndex = updated.indexOf(selectedThirdPlaceSwap);
      const secondIndex = updated.indexOf(team);

      if (firstIndex === -1 || secondIndex === -1) return old;

      updated[firstIndex] = team;
      updated[secondIndex] = selectedThirdPlaceSwap;

      return updated;
    });

    setSelectedThirdPlaceSwap(null);
    setWinnersByMatch({});
    setShareUrl("");
  }

  function generateThirdPlaceRanking() {
    const thirdPlaceTeams = Object.values(rankings)
      .map((groupRanking) => groupRanking[2])
      .filter(Boolean);

    setThirdPlaceRanking(thirdPlaceTeams);
    setSelectedGroupSwap(null);
    setSelectedThirdPlaceSwap(null);
    setWinnersByMatch({});
    setShareUrl("");
    setCurrentStep(2);
  }

  function startKnockout() {
    if (thirdPlaceRanking.length < 8) {
      alert("Rank the third-place teams first.");
      return;
    }

    setSelectedGroupSwap(null);
    setSelectedThirdPlaceSwap(null);
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
    if (saving) return;

    setSaving(true);

    try {
      if (isLocked) {
        alert("Brackets are locked.");
        return;
      }

      const cleanName = playerName.trim() || "Anonymous";
      const cleanLeague = leagueCode || "public";

      const bracketData = {
        rankings,
        thirdPlaceRanking,
        winnersByMatch,
      };

      const { data: existingBracket, error: checkError } = await supabase
        .from("brackets")
        .select("id")
        .eq("name", cleanName)
        .eq("league", cleanLeague)
        .maybeSingle();

      if (checkError) {
        console.error(checkError);
        alert(checkError.message);
        return;
      }

      if (existingBracket) {
        alert(
          "That username is already taken in this league. Please choose another name."
        );
        return;
      }

      const { data, error } = await supabase
        .from("brackets")
        .insert({
          name: cleanName,
          league: cleanLeague,
          data: bracketData,
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      setShareUrl(`${window.location.origin}/bracket/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  function StepButton({ step, label }: { step: number; label: string }) {
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

          {isLocked && (
            <div className="mt-6 rounded-2xl border border-red-400 bg-red-500/20 p-4 font-bold text-red-200">
              Brackets are locked. You can view the app, but new predictions
              cannot be saved.
            </div>
          )}

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
                  Tap one team, then tap another team in the same group to swap
                  them.
                </p>
              </div>

              <button
                onClick={generateThirdPlaceRanking}
                className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Continue
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
                    {teams.map((team, index) => {
                      const isSelected =
                        selectedGroupSwap?.groupName === groupName &&
                        selectedGroupSwap?.team === team;

                      return (
                        <button
                          key={team}
                          type="button"
                          onClick={() => swapGroupTeam(groupName, team)}
                          className={`flex w-full touch-manipulation select-none items-center justify-between rounded-2xl border p-4 text-left font-bold transition active:scale-[0.98] ${
                            isSelected
                              ? "border-lime-300 bg-lime-400 text-black"
                              : "border-white/10 bg-black/40 text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
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

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                              isSelected
                                ? "bg-black/20 text-black"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {isSelected ? "Selected" : "Tap"}
                          </span>
                        </button>
                      );
                    })}
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
                  Tap one team, then tap another team to swap them. Top 8
                  advance.
                </p>
              </div>

              <button
                onClick={startKnockout}
                className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Continue
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {thirdPlaceRanking.map((team, index) => {
                const isSelected = selectedThirdPlaceSwap === team;

                return (
                  <button
                    key={team}
                    type="button"
                    onClick={() => swapThirdPlaceTeam(team)}
                    className={`flex w-full touch-manipulation select-none items-center justify-between rounded-2xl border p-4 text-left font-bold transition active:scale-[0.98] ${
                      isSelected
                        ? "border-lime-300 bg-lime-400 text-black"
                        : index < 8
                        ? "border-lime-400 bg-lime-400/20 text-white"
                        : "border-white/10 bg-white/10 text-white"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                          index < 8
                            ? "bg-lime-400 text-black"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <TeamLabel team={team} />
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                        isSelected
                          ? "bg-black/20 text-black"
                          : index < 8
                          ? "bg-lime-400 text-black"
                          : "bg-black/40 text-white"
                      }`}
                    >
                      {isSelected ? "Selected" : index < 8 ? "Advances" : "Out"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {currentStep === 3 && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black">Knockout Bracket</h2>
                <p className="mt-2 text-slate-300">
                  Desktop shows the full bracket. Mobile uses round-by-round
                  tabs.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Save
              </button>
            </div>

            <div className="lg:hidden">
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {rounds.map((round, index) => (
                  <button
                    key={round.name}
                    onClick={() => setMobileRound(index)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${
                      mobileRound === index
                        ? "bg-lime-400 text-black"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {round.name}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {rounds[mobileRound].matches.map((match) => (
                  <RenderMatch key={match.id} match={match} />
                ))}
              </div>

              {champion?.team && (
                <div className="mt-6 rounded-3xl bg-lime-400 p-6 text-center text-black">
                  <p className="font-black uppercase tracking-[0.25em]">
                    Champion
                  </p>
                  <h3 className="mt-3 text-4xl font-black">{champion.team}</h3>
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto rounded-[2rem] border border-lime-400/30 bg-black/70 p-6 shadow-2xl lg:block">
              <div className="flex min-w-[1550px] items-center justify-between gap-6">
                <div className="grid w-[260px] gap-4">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Round of 32
                  </h3>
                  {round32.slice(0, 8).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[240px] gap-8">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Round of 16
                  </h3>
                  {round16.slice(0, 4).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[230px] gap-16">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Quarterfinals
                  </h3>
                  {quarterfinals.slice(0, 2).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[230px] gap-16">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Semifinals
                  </h3>
                  {semifinals.map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="w-[280px]">
                  <div className="rounded-[2rem] border border-lime-400 bg-lime-400 p-6 text-center text-black shadow-2xl">
                    <p className="text-xs font-black uppercase tracking-[0.3em]">
                      Final M104
                    </p>

                    <div className="mt-4 text-white">
                      <RenderMatch match={final} />
                    </div>

                    {champion?.team && (
                      <h3 className="mt-5 text-4xl font-black">
                        {champion.team}
                      </h3>
                    )}
                  </div>

                  <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/10 p-4">
                    <h3 className="mb-3 text-center text-sm font-black text-lime-300">
                      Third Place
                    </h3>
                    <RenderMatch match={thirdPlaceMatch} />
                  </div>
                </div>

                <div className="grid w-[230px] gap-16">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Quarterfinals
                  </h3>
                  {quarterfinals.slice(2, 4).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[240px] gap-8">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Round of 16
                  </h3>
                  {round16.slice(4, 8).map((match) => (
                    <RenderMatch key={match.id} match={match} />
                  ))}
                </div>

                <div className="grid w-[260px] gap-4">
                  <h3 className="text-center text-sm font-black text-lime-300">
                    Round of 32
                  </h3>
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

            <label className="mt-6 block text-sm font-black uppercase tracking-[0.2em] text-lime-400">
              Your Name
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
              placeholder="Ernesto"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />

            <div className="mt-6 rounded-xl bg-black/40 p-4 text-slate-300">
              League:
              <span className="ml-2 font-black text-lime-400">
                {leagueCode}
              </span>
            </div>

            <button
              disabled={isLocked || saving}
              onClick={saveBracket}
              className="mt-6 rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300 disabled:bg-slate-600 disabled:text-slate-300"
            >
              {saving ? "Saving..." : "Save Bracket"}
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

export default function PredictPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white" />}>
      <PredictPageContent />
    </Suspense>
  );
}
