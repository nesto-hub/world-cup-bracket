import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white">
        <Link href="/" className="text-lg font-black">
          World Cup Bracket
        </Link>

        <div className="flex gap-2">
          <Link href="/" className="rounded-xl bg-white/10 px-4 py-2 font-bold hover:bg-white/20">
            Home
          </Link>

          <Link href="/leagues" className="rounded-xl bg-lime-400 px-4 py-2 font-bold text-black hover:bg-lime-300">
            Create / Join
          </Link>

          <Link href="/leaderboard-search" className="rounded-xl bg-white/10 px-4 py-2 font-bold hover:bg-white/20">
            Leaderboard
          </Link>
        </div>
      </div>
    </nav>
  );
}