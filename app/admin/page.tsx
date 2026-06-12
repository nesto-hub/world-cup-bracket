"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const [matchId, setMatchId] = useState("");
  const [winner, setWinner] = useState("");

  const [groupName, setGroupName] = useState("");
  const [position, setPosition] = useState("");
  const [groupTeam, setGroupTeam] = useState("");

  const [message, setMessage] = useState("");

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Wrong password.");
    }
  }

  async function saveKnockoutResult() {
    setMessage("");

    if (!matchId || !winner) {
      setMessage("Enter a match ID and winner.");
      return;
    }

    const { error } = await supabase.from("actual_results").upsert(
      {
        match_id: Number(matchId),
        winner: winner.trim(),
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

    setMessage("Knockout result saved!");
    setMatchId("");
    setWinner("");
  }

  async function saveGroupRanking() {
    setMessage("");

    if (!groupName || !position || !groupTeam) {
      setMessage("Enter group, position, and team.");
      return;
    }

    const { error } = await supabase.from("actual_group_rankings").upsert(
      {
        group_name: groupName.trim().toUpperCase(),
        position: Number(position),
        team: groupTeam.trim(),
      },
      {
        onConflict: "group_name,position",
      }
    );

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Group ranking saved!");
    setGroupName("");
    setPosition("");
    setGroupTeam("");
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
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-black">Update Results</h1>

          <p className="mt-3 text-slate-300">
            Enter official group rankings and knockout winners. The leaderboard
            updates automatically.
          </p>

          <button
            onClick={() => setAuthenticated(false)}
            className="mt-6 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
          >
            Log out
          </button>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-black">Knockout Match Result</h2>

          <label className="mt-6 block text-sm font-bold text-slate-300">
            Match ID
          </label>

          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
            placeholder="104"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
          />

          <label className="mt-6 block text-sm font-bold text-slate-300">
            Winner
          </label>

          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
            placeholder="Argentina"
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
          />

          <button
            onClick={saveKnockoutResult}
            className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
          >
            Save Knockout Result
          </button>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-3xl font-black">Group Ranking Result</h2>

          <label className="mt-6 block text-sm font-bold text-slate-300">
            Group
          </label>

          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
            placeholder="A"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <label className="mt-6 block text-sm font-bold text-slate-300">
            Position
          </label>

          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
            placeholder="1"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />

          <label className="mt-6 block text-sm font-bold text-slate-300">
            Team
          </label>

          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
            placeholder="Mexico"
            value={groupTeam}
            onChange={(e) => setGroupTeam(e.target.value)}
          />

          <button
            onClick={saveGroupRanking}
            className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
          >
            Save Group Ranking
          </button>
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