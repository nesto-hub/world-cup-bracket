"use client";

import { useEffect, useState } from "react";
import { groups } from "@/data/groups";
import { countryCodes } from "@/data/countryCodes";
import { supabase } from "@/lib/supabase";

type Match = {
  id: number;
  label: string;
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

type ActualThirdPlaceTeam = {
  position: number;
  team: string;
};

const matchRounds: { title: string; matches: Match[] }[] = [
  {
    title: "Round of 32",
    matches: Array.from({ length: 16 }, (_, i) => ({
      id: 73 + i,
      label: `M${73 + i}`,
    })),
  },
  {
    title: "Round of 16",
    matches: Array.from({ length: 8 }, (_, i) => ({
      id: 89 + i,
      label: `M${89 + i}`,
    })),
  },
  {
    title: "Quarterfinals",
    matches: Array.from({ length: 4 }, (_, i) => ({
      id: 97 + i,
      label: `M${97 + i}`,
    })),
  },
  {
    title: "Semifinals",
    matches: Array.from({ length: 2 }, (_, i) => ({
      id: 101 + i,
      label: `M${101 + i}`,
    })),
  },
  {
    title: "Final / Third Place",
    matches: [
      { id: 103, label: "M103 Third Place" },
      { id: 104, label: "M104 Final" },
    ],
  },
];

const allTeams = Object.values(groups).flat();

function defaultGroupRankings() {
  return Object.fromEntries(
    Object.entries(groups).map(([groupName, teams]) => [groupName, teams])
  ) as Record<string, string[]>;
}

function defaultThirdPlaceTeams() {
  return Array(8).fill("");
}

function Flag({ team }: { team: string }) {
  const code = countryCodes[team];

  if (!team) return <span className="h-5 w-7 rounded bg-slate-700" />;

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
  if (!team) return <span className="text-slate-400">Choose team</span>;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <Flag team={team} />
      <span className="truncate">{team}</span>
    </span>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [actualRankings, setActualRankings] = useState<Record<string, string[]>>(
    defaultGroupRankings()
  );

  const [actualThirdPlaceTeams, setActualThirdPlaceTeams] = useState<string[]>(
    defaultThirdPlaceTeams()
  );

  const [actualResults, setActualResults] = useState<Record<number, string>>({});

  const [selectedGroupSwap, setSelectedGroupSwap] = useState<{
    groupName: string;
    team: string;
  } | null>(null);

  const [message, setMessage] = useState("");
  const [savingGroups, setSavingGroups] = useState(false);
  const [savingThird, setSavingThird] = useState(false);
  const [savingResults, setSavingResults] = useState(false);
  const [loading, setLoading] = useState(false);

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Wrong password.");
    }
  }

  useEffect(() => {
    if (!authenticated) return;

    loadSavedResults();
  }, [authenticated]);

  async function loadSavedResults() {
    setLoading(true);
    setMessage("");

    const [
      groupRankingsResponse,
      resultsResponse,
      thirdPlaceResponse,
    ] = await Promise.all([
      supabase.from("actual_group_rankings").select("*"),
      supabase.from("actual_results").select("*"),
      supabase.from("actual_third_place_teams").select("*"),
    ]);

    if (groupRankingsResponse.error) {
      setMessage(groupRankingsResponse.error.message);
      setLoading(false);
      return;
    }

    if (resultsResponse.error) {
      setMessage(resultsResponse.error.message);
      setLoading(false);
      return;
    }

    if (thirdPlaceResponse.error) {
      setMessage(thirdPlaceResponse.error.message);
      setLoading(false);
      return;
    }

    const loadedRankings = defaultGroupRankings();

    (groupRankingsResponse.data as ActualGroupRanking[] | null)?.forEach(
      (row) => {
        if (!loadedRankings[row.group_name]) return;

        loadedRankings[row.group_name][row.position - 1] = row.team;
      }
    );

    const loadedResults: Record<number, string> = {};

    (resultsResponse.data as ActualResult[] | null)?.forEach((row) => {
      loadedResults[row.match_id] = row.winner;
    });

    const loadedThirdPlace = defaultThirdPlaceTeams();

    (thirdPlaceResponse.data as ActualThirdPlaceTeam[] | null)?.forEach(
      (row) => {
        if (row.position >= 1 && row.position <= 8) {
          loadedThirdPlace[row.position - 1] = row.team;
        }
      }
    );

    setActualRankings(loadedRankings);
    setActualResults(loadedResults);
    setActualThirdPlaceTeams(loadedThirdPlace);
    setLoading(false);
    setMessage("Saved results loaded.");
  }

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

    setActualRankings((old) => {
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
  }

  function updateThirdPlaceTeam(index: number, team: string) {
    setActualThirdPlaceTeams((old) => {
      const updated = [...old];
      updated[index] = team;
      return updated;
    });
  }

  function updateKnockoutWinner(matchId: number, team: string) {
    setActualResults((old) => ({
      ...old,
      [matchId]: team,
    }));
  }

  async function saveAllGroupRankings() {
    setMessage("");
    setSavingGroups(true);

    const rows = Object.entries(actualRankings).flatMap(([groupName, teams]) =>
      teams.map((team, index) => ({
        group_name: groupName,
        position: index + 1,
        team,
      }))
    );

    const { error } = await supabase
      .from("actual_group_rankings")
      .upsert(rows, {
        onConflict: "group_name,position",
      });

    setSavingGroups(false);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("All group rankings saved.");
  }

  async function saveThirdPlaceTeams() {
    setMessage("");
    setSavingThird(true);

    const rows = actualThirdPlaceTeams
      .map((team, index) => ({
        position: index + 1,
        team,
      }))
      .filter((row) => row.team);

    const { error } = await supabase
      .from("actual_third_place_teams")
      .upsert(rows, {
        onConflict: "position",
      });

    setSavingThird(false);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Advancing third-place teams saved.");
  }

  async function saveAllKnockoutResults() {
    setMessage("");
    setSavingResults(true);

    const rows = Object.entries(actualResults)
      .map(([matchId, winner]) => ({
        match_id: Number(matchId),
        winner,
      }))
      .filter((row) => row.winner);

    if (rows.length === 0) {
      setSavingResults(false);
      setMessage("No knockout winners selected.");
      return;
    }

    const { error } = await supabase.from("actual_results").upsert(rows, {
      onConflict: "match_id",
    });

    setSavingResults(false);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Knockout winners saved.");
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-black">Admin Login</h1>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-6 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
          />

          <button
            onClick={login}
            className="mt-4 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
          >
            Login
          </button>

          {message && (
            <p className="mt-4 rounded-xl bg-black/40 p-3 text-slate-200">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-black">Update Results</h1>

          <p className="mt-3 text-slate-300">
            Results load from Supabase when this page opens. Edit only what
            changed, then save that section.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={loadSavedResults}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              {loading ? "Loading..." : "Reload Saved Results"}
            </button>

            <button
              onClick={() => setAuthenticated(false)}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              Log out
            </button>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Official Group Rankings</h2>
              <p className="mt-2 text-slate-300">
                Tap one team, then another team in the same group to swap them.
              </p>
            </div>

            <button
              disabled={savingGroups}
              onClick={saveAllGroupRankings}
              className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300 disabled:bg-slate-600 disabled:text-slate-300"
            >
              {savingGroups ? "Saving..." : "Save All Groups"}
            </button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(actualRankings).map(([groupName, teams]) => (
              <div
                key={groupName}
                className="rounded-3xl border border-white/10 bg-black/40 p-5"
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
                            : "border-white/10 bg-white/10 text-white hover:bg-white/20"
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

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">
                Advancing Third-Place Teams
              </h2>
              <p className="mt-2 text-slate-300">
                Select the official 8 third-place teams that advance.
              </p>
            </div>

            <button
              disabled={savingThird}
              onClick={saveThirdPlaceTeams}
              className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300 disabled:bg-slate-600 disabled:text-slate-300"
            >
              {savingThird ? "Saving..." : "Save Third-Place Teams"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {actualThirdPlaceTeams.map((team, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <label className="text-sm font-black text-lime-400">
                  Position {index + 1}
                </label>

                <select
                  value={team}
                  onChange={(e) => updateThirdPlaceTeam(index, e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black p-4 text-white"
                >
                  <option value="">Choose team</option>
                  {allTeams.map((optionTeam) => (
                    <option key={optionTeam} value={optionTeam}>
                      {optionTeam}
                    </option>
                  ))}
                </select>

                {team && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-lime-400/20 p-3 font-bold">
                    <Flag team={team} />
                    <span>{team}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">Official Knockout Winners</h2>

              <p className="mt-2 text-slate-300">
                Pick winners for each match. Save all selected knockout results
                together.
              </p>
            </div>

            <button
              disabled={savingResults}
              onClick={saveAllKnockoutResults}
              className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300 disabled:bg-slate-600 disabled:text-slate-300"
            >
              {savingResults ? "Saving..." : "Save Knockout Winners"}
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {matchRounds.map((round) => (
              <div
                key={round.title}
                className="rounded-3xl border border-white/10 bg-black/40 p-5"
              >
                <h3 className="text-2xl font-black">{round.title}</h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {round.matches.map((match) => {
                    const selectedWinner = actualResults[match.id] || "";

                    return (
                      <div
                        key={match.id}
                        className="rounded-2xl border border-white/10 bg-white/10 p-4"
                      >
                        <p className="text-sm font-black text-lime-400">
                          {match.label}
                        </p>

                        <select
                          value={selectedWinner}
                          onChange={(e) =>
                            updateKnockoutWinner(match.id, e.target.value)
                          }
                          className="mt-3 w-full rounded-xl border border-white/10 bg-black p-3 text-white"
                        >
                          <option value="">Choose winner</option>
                          {allTeams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>

                        {selectedWinner && (
                          <div className="mt-3 flex items-center gap-3 rounded-xl bg-lime-400/20 p-3 font-bold">
                            <Flag team={selectedWinner} />
                            <span>{selectedWinner}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {message && (
          <p className="mt-6 rounded-xl bg-black/40 p-4 text-slate-200">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
