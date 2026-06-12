"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login() {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/predict");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
        <h1 className="text-4xl font-black">Log In</h1>

        <input
          className="mt-6 w-full rounded-xl bg-black/50 p-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mt-4 w-full rounded-xl bg-black/50 p-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="mt-6 w-full rounded-2xl bg-lime-400 p-4 font-black text-black"
        >
          Log In
        </button>

        {message && <p className="mt-4 text-slate-300">{message}</p>}
      </div>
    </main>
  );
}