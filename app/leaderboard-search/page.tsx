"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardSearchPage() {
  const router = useRouter();
  const [leagueCode, setLeagueCode] = useState("");

  function goToLeaderboard() {
    const code = leagueCode.trim().toLowerCase();

    if (!code) {
      alert("Enter a league code.");
      return;
    }

    router.push(`/leaderboard?league=${code}`);
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
          Leaderboard
        </p>

        <h1 className="mt-2 text-4xl font-black">Find League Leaderboard</h1>

        <input
          className="mt-6 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
          placeholder="Enter league code"
          value={leagueCode}
          onChange={(e) => setLeagueCode(e.target.value)}
        />

        <button
          onClick={goToLeaderboard}
          className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
        >
          View Leaderboard
        </button>
      </div>
    </main>
  );
}