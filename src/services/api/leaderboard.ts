export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  points: number
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 100 }, (_, i) => ({
  rank: i + 1,
  userId: `user-${i + 1}`,
  username: [
    'CR7_Fan', 'GoalMachine', 'TikiTaka', 'PitchMaster', 'FantasyKing',
    'WCChamp', 'GoldenBoot', 'MidfieldMaestro', 'DefensiveWall', 'GloveSaver',
    'SoccerGuru', 'HattrickHero', 'FreeKickPro', 'WingWizard', 'CornerKing',
    'PenaltyAce', 'OffsideTrap', 'CounterStrike', 'ParkTheBus', 'GegenPress',
  ][i % 20] + (i < 20 ? '' : `_${Math.floor(i / 20)}`),
  points: Math.max(0, 2500 - i * 18 + Math.floor(Math.random() * 30)),
}))

export const getLeaderboard = async (
  page = 1,
  limit = 20
): Promise<{ data: LeaderboardEntry[]; nextPage: number | null; total: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const data = MOCK_LEADERBOARD.slice(startIndex, endIndex)
  const nextPage = endIndex < MOCK_LEADERBOARD.length ? page + 1 : null

  return { data, nextPage, total: MOCK_LEADERBOARD.length }
}
