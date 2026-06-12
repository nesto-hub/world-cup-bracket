type Slot = {
  label: string;
  team: string;
};

type BracketData = {
  rankings?: Record<string, string[]>;
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

function pointsForMatch(matchId: number) {
  // Round of 32
  if (matchId >= 73 && matchId <= 88) return 2;

  // Round of 16
  if (matchId >= 89 && matchId <= 96) return 4;

  // Quarterfinals
  if (matchId >= 97 && matchId <= 100) return 8;

  // Semifinals
  if (matchId >= 101 && matchId <= 102) return 16;

  // Third Place Match
  if (matchId === 103) return 16;

  // Final
  if (matchId === 104) return 32;

  return 0;
}

export function calculateScore(
  bracket: BracketData,
  actualResults: ActualResult[],
  actualGroupRankings: ActualGroupRanking[] = []
) {
  let score = 0;

  const predictions = bracket.winnersByMatch || {};
  const rankings = bracket.rankings || {};

  // Group stage: 1 point for exact position
  actualGroupRankings.forEach((result) => {
    const predictedTeam =
      rankings[result.group_name]?.[result.position - 1];

    if (predictedTeam === result.team) {
      score += 1;
    }
  });

  // Knockout stage
  actualResults.forEach((result) => {
    const predictedWinner = predictions[String(result.match_id)]?.team;

    if (predictedWinner === result.winner) {
      score += pointsForMatch(result.match_id);
    }
  });

  // Champion bonus
  const predictedChampion = predictions["104"]?.team;

  const actualChampion = actualResults.find(
    (result) => result.match_id === 104
  )?.winner;

  if (
    predictedChampion &&
    actualChampion &&
    predictedChampion === actualChampion
  ) {
    score += 20;
  }

  return score;
}
