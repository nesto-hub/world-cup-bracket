"use client";

import { useParams } from "next/navigation";
import LeaderboardPage from "../page";

export default function LeagueLeaderboardPage() {
  const params = useParams();
  const league = params.league as string;

  return <LeaderboardPage leagueFromRoute={league} />;
}