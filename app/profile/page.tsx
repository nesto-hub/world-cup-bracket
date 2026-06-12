"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      setEmail(userData.user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      setUsername(profile?.username || "");
    }

    loadProfile();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
        <h1 className="text-4xl font-black">Profile</h1>

        <p className="mt-6 text-slate-300">Email</p>
        <p className="text-xl font-bold">{email}</p>

        <p className="mt-6 text-slate-300">Username</p>
        <p className="text-xl font-bold">{username}</p>

        <button
          onClick={logout}
          className="mt-8 rounded-2xl bg-red-500 px-6 py-3 font-black text-white"
        >
          Log Out
        </button>
      </div>
    </main>
  );
}