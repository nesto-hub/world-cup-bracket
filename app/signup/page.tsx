"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        full_name: username,
      });
    }

    setMessage("Account created. Check your email if confirmation is enabled.");
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
        <h1 className="text-4xl font-black">Create Account</h1>

        <input
          className="mt-6 w-full rounded-xl bg-black/50 p-4"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="mt-4 w-full rounded-xl bg-black/50 p-4"
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
          onClick={signUp}
          className="mt-6 w-full rounded-2xl bg-lime-400 p-4 font-black text-black"
        >
          Sign Up
        </button>

        {message && <p className="mt-4 text-slate-300">{message}</p>}
      </div>
    </main>
  );
}