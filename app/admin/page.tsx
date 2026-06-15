"use client";

import { useState } from "react";
import { groups } from "@/data/groups";
import { countryCodes } from "@/data/countryCodes";
import { supabase } from "@/lib/supabase";

type Slot = {
  label: string;
  team: string;
};

type Match = {
  id: number;
  label: string;
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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [actualRankings, setActualRankings] = useState<Record<string, string[]>>(
    Object.fromEntries(
      Object.entries(groups).map(([groupName, teams]) => [groupName, teams])
    )
  );

  const [selectedGroupSwap, setSelectedGroupSwap] = useState<{
    groupName: string;
    team: string;
  } | null>(null);

  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedWinner, setSelectedWinner] = useState("");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Wrong password.");
    }
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

  async function saveAllGroupRankings() {
    setMessage("");
    setSaving(true);

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

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("All group rankings saved.");
  }

  async function saveKnockoutResult() {
    setMessage("");

    if (!selectedMatchId || !selectedWinner) {
      setMessage("Choose a match and winner.");
      return;
    }

    const { error } = await supabase.from("actual_results").upsert(
      {
        match_id: selectedMatchId,
        winner: selectedWinner,
      },
      {
        onConflict: "match_id",
      }
    );

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage(`Saved M${selectedMatchId}: ${selectedWinner}`);
    setSelectedWinner("");
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
            Tap two teams in a group to swap their official positions. Choose a
            match and winner for knockout results.
          </p>

          <button
            onClick={() => setAuthenticated(false)}
            className="mt-6 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
          >
            Log out
          </button>
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
              disabled={saving}
              onClick={saveAllGroupRankings}
              className="rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300 disabled:bg-slate-600 disabled:text-slate-300"
            >
              {saving ? "Saving..." : "Save All Groups"}
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
          <h2 className="text-3xl font-black">Official Knockout Winners</h2>

          <p className="mt-2 text-slate-300">
            Select the match, choose the winning team, then save.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {matchRounds.map((round) => (
                <div
                  key={round.title}
                  className="rounded-3xl border border-white/10 bg-black/40 p-5"
                >
                  <h3 className="text-2xl font-black">{round.title}</h3>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {round.matches.map((match) => (
                      <button
                        key={match.id}
                        onClick={() => setSelectedMatchId(match.id)}
                        className={`rounded-2xl border p-4 text-left font-black transition ${
                          selectedMatchId === match.id
                            ? "border-lime-400 bg-lime-400 text-black"
                            : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {match.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-lime-400/30 bg-black/50 p-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-400">
                Selected Match
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {selectedMatchId ? `M${selectedMatchId}` : "None"}
              </h3>

              <label className="mt-6 block text-sm font-bold text-slate-300">
                Winner
              </label>

              <select
                value={selectedWinner}
                onChange={(e) => setSelectedWinner(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black p-4 text-white"
              >
                <option value="">Choose winner</option>
                {allTeams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>

              {selectedWinner && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-lime-400/20 p-4 font-bold">
                  <Flag team={selectedWinner} />
                  <span>{selectedWinner}</span>
                </div>
              )}

              <button
                onClick={saveKnockoutResult}
                className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
              >
                Save Knockout Winner
              </button>
            </div>
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
