import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-black text-white">
            World Cup Bracket
          </Link>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white hover:bg-white/20"
            >
              Home
            </Link>

            <Link
              href="/leagues"
              className="rounded-xl bg-lime-400 px-4 py-2 font-bold text-black hover:bg-lime-300"
            >
              Create / Join League
            </Link>

            <Link
              href="/leaderboard"
              className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white hover:bg-white/20"
            >
              Public Leaderboard
            </Link>
          </div>
        </nav>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.25),transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),transparent_45%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-lime-400">
          FIFA World Cup 2026
        </p>

        <h1 className="mt-4 max-w-4xl text-6xl font-black leading-tight md:text-8xl">
          Build your World Cup bracket.
        </h1>

        <p className="mt-6 max-w-2xl text-xl text-slate-300">
          Rank the groups, choose the best third-place teams, predict the
          knockouts, save your bracket, y gana 50 dolares
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/leagues"
            className="rounded-2xl bg-lime-400 px-7 py-4 font-black text-black hover:bg-lime-300"
          >
            Create Bracket
          </Link>

          <Link
            href="/leagues"
            className="rounded-2xl border border-white/10 bg-white/10 px-7 py-4 font-black text-white hover:bg-white/20"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">1. Rank Groups</h2>
            <p className="mt-2 text-slate-300">
              Predict every group from 1st to 4th.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">2. Pick Winners</h2>
            <p className="mt-2 text-slate-300">
              Fill out the full knockout bracket.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-black">3. Compete</h2>
            <p className="mt-2 text-slate-300">
              Save, share, and climb your league leaderboard.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}