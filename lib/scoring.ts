type Slot = {
  label: string;
  team: string;
};

type BracketData = {
  rankings?: Record<string, string[]>;
  thirdPlaceRanking?: string[];
  winnersByMatch?: Record<string, Slot>;
};

type ActualResult = {
  match_id: number;
  winner: string;
};

type ActualGroupRanking = {
  group_name: string;
  position: number;
  team: string;
};

type ActualThirdPlaceTeam = {
  position: number;
  team: string;
};

function pointsForMatch(matchId: number) {
  if (matchId >= 73 && matchId <= 88) return 4;
  if (matchId >= 89 && matchId <= 96) return 8;
  if (matchId >= 97 && matchId <= 100) return 16;
  if (matchId >= 101 && matchId <= 102) return 24;
  if (matchId === 103) return 16;
  if (matchId === 104) return 32;
  return 0;
}

export function calculateScore(
  bracket: BracketData,
  actualResults: ActualResult[],
  actualGroupRankings: ActualGroupRanking[] = [],
  actualThirdPlaceTeams: ActualThirdPlaceTeam[] = []
) {
  let score = 0;

  const predictions = bracket.winnersByMatch || {};
  const rankings = bracket.rankings || {};
  const predictedAdvancingThirdPlace = bracket.thirdPlaceRanking?.slice(0, 8) || [];

  // Group winner / runner-up: 2 points for exact 1st or 2nd place
  actualGroupRankings.forEach((result) => {
    const predictedTeam = rankings[result.group_name]?.[result.position - 1];

    if (
      predictedTeam === result.team &&
      (result.position === 1 || result.position === 2)
    ) {
      score += 2;
    }
  });

  // Advancing third-place teams: 3 points each
  const actualAdvancingThirdPlaceTeams = actualThirdPlaceTeams
    .sort((a, b) => a.position - b.position)
    .slice(0, 8)
    .map((result) => result.team);

  predictedAdvancingThirdPlace.forEach((team) => {
    if (actualAdvancingThirdPlaceTeams.includes(team)) {
      score += 3;
    }
  });

  // Knockout stage
  actualResults.forEach((result) => {
    const predictedWinner = predictions[String(result.match_id)]?.team;

    if (predictedWinner === result.winner) {
      score += pointsForMatch(result.match_id);
    }
  });

  return score;
}
