import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Player } from "@/types"

export interface SimMatch {
  id: string
  group: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeNationality: string
  awayNationality: string
  homeScore?: number
  awayScore?: number
  simulated: boolean
  pointsEarned?: number
}

const SCORE_POOL: [number, number][] = [
  [0, 0], [1, 0], [0, 1], [1, 1],
  [2, 0], [0, 2], [2, 1], [1, 2],
  [2, 2], [3, 0], [0, 3], [3, 1],
  [1, 3], [3, 2], [2, 3], [4, 0],
  [0, 4], [4, 1], [1, 4], [5, 0],
]

// Weight more realistic scores higher
const SCORE_WEIGHTS = [4, 10, 10, 8, 8, 8, 10, 10, 5, 5, 5, 7, 7, 5, 5, 2, 2, 2, 2, 1]

function weightedRandom(): [number, number] {
  const total = SCORE_WEIGHTS.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < SCORE_WEIGHTS.length; i++) {
    r -= SCORE_WEIGHTS[i]
    if (r <= 0) return SCORE_POOL[i]
  }
  return [1, 0]
}

/**
 * F4.2 — Official scoring rules (mirrors server/src/lib/pointsCalculator.ts):
 *   Win:  +3 points per player whose national team wins
 *   Draw: +1 point  per player whose national team draws
 *   Loss: +0 points
 */
function calcPoints(
  homeScore: number,
  awayScore: number,
  squadPlayers: (Player | null)[],
  homeNationality: string,
  awayNationality: string
): number {
  let pts = 0
  const activePlayers = squadPlayers.filter(Boolean) as Player[]

  for (const player of activePlayers) {
    const isHome = player.nationality === homeNationality
    const isAway = player.nationality === awayNationality
    if (!isHome && !isAway) continue

    const myScore = isHome ? homeScore : awayScore
    const oppScore = isHome ? awayScore : homeScore

    if (myScore > oppScore) pts += 3      // Win
    else if (myScore === oppScore) pts += 1 // Draw
    // Loss = 0
  }

  return pts
}

const INITIAL_MATCHES: SimMatch[] = [
  // Group A — Argentina
  { id: 'a1', group: 'A', homeTeam: 'Argentina', awayTeam: 'Poland',      homeFlag: '🇦🇷', awayFlag: '🇵🇱', homeNationality: 'Argentina', awayNationality: 'Poland',        simulated: false },
  { id: 'a2', group: 'A', homeTeam: 'Australia', awayTeam: 'Saudi Arabia', homeFlag: '🇦🇺', awayFlag: '🇸🇦', homeNationality: 'Australia', awayNationality: 'Saudi Arabia',   simulated: false },
  // Group B — France
  { id: 'b1', group: 'B', homeTeam: 'France',    awayTeam: 'Germany',      homeFlag: '🇫🇷', awayFlag: '🇩🇪', homeNationality: 'France',    awayNationality: 'Germany',        simulated: false },
  { id: 'b2', group: 'B', homeTeam: 'Denmark',   awayTeam: 'Tunisia',      homeFlag: '🇩🇰', awayFlag: '🇹🇳', homeNationality: 'Denmark',   awayNationality: 'Tunisia',        simulated: false },
  // Group C — England
  { id: 'c1', group: 'C', homeTeam: 'England',   awayTeam: 'United States',homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇺🇸', homeNationality: 'England',   awayNationality: 'United States', simulated: false },
  { id: 'c2', group: 'C', homeTeam: 'Iran',      awayTeam: 'Wales',        homeFlag: '🇮🇷', awayFlag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', homeNationality: 'Iran',      awayNationality: 'Wales',          simulated: false },
  // Group D — Brazil
  { id: 'd1', group: 'D', homeTeam: 'Brazil',    awayTeam: 'Serbia',       homeFlag: '🇧🇷', awayFlag: '🇷🇸', homeNationality: 'Brazil',    awayNationality: 'Serbia',         simulated: false },
  { id: 'd2', group: 'D', homeTeam: 'Switzerland',awayTeam:'Cameroon',     homeFlag: '🇨🇭', awayFlag: '🇨🇲', homeNationality: 'Switzerland',awayNationality: 'Cameroon',       simulated: false },
  // Group E — Spain
  { id: 'e1', group: 'E', homeTeam: 'Spain',     awayTeam: 'Germany',      homeFlag: '🇪🇸', awayFlag: '🇩🇪', homeNationality: 'Spain',     awayNationality: 'Germany',        simulated: false },
  { id: 'e2', group: 'E', homeTeam: 'Japan',     awayTeam: 'Costa Rica',   homeFlag: '🇯🇵', awayFlag: '🇨🇷', homeNationality: 'Japan',     awayNationality: 'Costa Rica',     simulated: false },
  // Group F — Belgium
  { id: 'f1', group: 'F', homeTeam: 'Belgium',   awayTeam: 'Morocco',      homeFlag: '🇧🇪', awayFlag: '🇲🇦', homeNationality: 'Belgium',   awayNationality: 'Morocco',        simulated: false },
  { id: 'f2', group: 'F', homeTeam: 'Croatia',   awayTeam: 'Canada',       homeFlag: '🇭🇷', awayFlag: '🇨🇦', homeNationality: 'Croatia',   awayNationality: 'Canada',         simulated: false },
  // Group G — Portugal
  { id: 'g1', group: 'G', homeTeam: 'Portugal',  awayTeam: 'Uruguay',      homeFlag: '🇵🇹', awayFlag: '🇺🇾', homeNationality: 'Portugal',  awayNationality: 'Uruguay',        simulated: false },
  { id: 'g2', group: 'G', homeTeam: 'Korea Republic', awayTeam: 'Ghana',   homeFlag: '🇰🇷', awayFlag: '🇬🇭', homeNationality: 'Korea Republic', awayNationality: 'Ghana',    simulated: false },
  // Group H — Netherlands
  { id: 'h1', group: 'H', homeTeam: 'Netherlands',awayTeam: 'Senegal',     homeFlag: '🇳🇱', awayFlag: '🇸🇳', homeNationality: 'Netherlands',awayNationality: 'Senegal',        simulated: false },
  { id: 'h2', group: 'H', homeTeam: 'Ecuador',   awayTeam: 'Mexico',       homeFlag: '🇪🇨', awayFlag: '🇲🇽', homeNationality: 'Ecuador',   awayNationality: 'Mexico',         simulated: false },
]

interface SimulatorState {
  matches: SimMatch[]
  totalPointsEarned: number
  simulateMatch: (id: string, squadPlayers: (Player | null)[]) => number
  resetAll: () => void
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
      matches: INITIAL_MATCHES,
      totalPointsEarned: 0,

      simulateMatch: (id, squadPlayers) => {
        const match = get().matches.find(m => m.id === id)
        if (!match) return 0

        const [homeScore, awayScore] = weightedRandom()
        const pts = calcPoints(homeScore, awayScore, squadPlayers, match.homeNationality, match.awayNationality)

        set(state => ({
          matches: state.matches.map(m =>
            m.id === id ? { ...m, homeScore, awayScore, simulated: true, pointsEarned: pts } : m
          ),
          totalPointsEarned: state.totalPointsEarned + pts,
        }))

        return pts
      },

      resetAll: () =>
        set({
          matches: INITIAL_MATCHES.map(m => ({ ...m, homeScore: undefined, awayScore: undefined, simulated: false, pointsEarned: undefined })),
          totalPointsEarned: 0,
        }),
    }),
    { name: 'wc-simulator-storage' }
  )
)
