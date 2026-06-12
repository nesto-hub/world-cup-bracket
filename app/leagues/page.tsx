"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LeaguesPage() {
  const router = useRouter();

  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");

  async function createLeague() {
    setMessage("");

    const code = createCode.trim().toLowerCase().replace(/\s+/g, "-");
    const name = createName.trim();

    if (!name || !code) {
      setMessage("Enter a league name and code.");
      return;
    }

    const { error } = await supabase.from("leagues").insert({
      name,
      code,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(`/predict?league=${code}`);
  }

  async function joinLeague() {
    setMessage("");

    const code = joinCode.trim().toLowerCase();

    if (!code) {
      setMessage("Enter a league code.");
      return;
    }

    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      setMessage("League not found.");
      return;
    }

    router.push(`/predict?league=${code}`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-10">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
            World Cup Bracket
          </p>

          <h1 className="mt-2 text-5xl font-black">Create or Join a League</h1>

          <p className="mt-3 text-slate-300">
            Make a private league for friends, family, or your lab group.
          </p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-3xl font-black">Create League</h2>

            <label className="mt-6 block text-sm font-bold text-slate-300">
              League Name
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
              placeholder="Friends"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />

            <label className="mt-6 block text-sm font-bold text-slate-300">
              League Code
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
              placeholder="League Code"
              value={createCode}
              onChange={(e) => setCreateCode(e.target.value)}
            />

            <button
              onClick={createLeague}
              className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
            >
              Create League
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-3xl font-black">Join League</h2>

            <label className="mt-6 block text-sm font-bold text-slate-300">
              League Code
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 p-4 text-white"
              placeholder="League Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />

            <button
              onClick={joinLeague}
              className="mt-6 w-full rounded-2xl bg-lime-400 px-6 py-3 font-black text-black hover:bg-lime-300"
            >
              Join League
            </button>
          </section>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-black/40 p-4 text-slate-200">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}