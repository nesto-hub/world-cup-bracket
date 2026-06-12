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
  if (matchId >= 73 && matchId <= 88) return 2;
  if (matchId >= 89 && matchId <= 96) return 4;
  if (matchId >= 97 && matchId <= 100) return 8;
  if (matchId >= 101 && matchId <= 102) return 16;
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

  // Group stage: 1 point for each exact position correct
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