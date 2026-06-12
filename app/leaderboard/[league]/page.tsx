import LeaderboardPage from "../page";

export default function LeagueLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  return <LeaderboardPage searchParams={searchParams} />;
}
