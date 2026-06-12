"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [matchId, setMatchId] = useState("");
  const [winner, setWinner] = useState("");
  const [message, setMessage] = useState("");

  async function saveResult() {
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
      setMessage("Error saving result.");
      return;
    }

    setMessage("Result saved!");
    setMatchId("");
    setWinner("");
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
          Admin
        </p>

        <h1 className="mt-2 text-4xl font-black">Enter Match Result</h1>

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
          onClick={saveResult}
          className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
        >
          Save Result
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