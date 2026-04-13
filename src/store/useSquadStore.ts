import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Player, Position } from "@/types"
import { saveSquad } from "@/services/api/squad"

export type Formation = "4-3-3" | "4-4-2" | "3-5-2"

export interface SquadState {
  formation: Formation
  players: (Player | null)[]
  budget: number
  setFormation: (formation: Formation) => void
  addPlayer: (index: number, player: Player) => string | null
  removePlayer: (index: number) => void
  getIsComplete: () => boolean
  syncToServer: (token: string) => Promise<void>
}

const INITIAL_BUDGET = 1000.0

export const getPositionForIndex = (index: number, formation: Formation): Position => {
  if (index === 0) return "GK"
  const defCount = parseInt(formation.split("-")[0])
  const midCount = parseInt(formation.split("-")[1])
  if (index <= defCount) return "DEF"
  if (index <= defCount + midCount) return "MID"
  return "FWD"
}

export const GET_POSITION_COORDS = (formation: Formation, index: number) => {
  const positions: Record<Formation, { x: string; y: string }[]> = {
    "4-3-3": [
      { x: "50%", y: "90%" },
      { x: "15%", y: "72%" }, { x: "38%", y: "75%" }, { x: "62%", y: "75%" }, { x: "85%", y: "72%" },
      { x: "25%", y: "48%" }, { x: "50%", y: "52%" }, { x: "75%", y: "48%" },
      { x: "20%", y: "22%" }, { x: "50%", y: "15%" }, { x: "80%", y: "22%" },
    ],
    "4-4-2": [
      { x: "50%", y: "90%" },
      { x: "15%", y: "75%" }, { x: "38%", y: "78%" }, { x: "62%", y: "78%" }, { x: "85%", y: "75%" },
      { x: "15%", y: "48%" }, { x: "38%", y: "52%" }, { x: "62%", y: "52%" }, { x: "85%", y: "48%" },
      { x: "35%", y: "18%" }, { x: "65%", y: "18%" },
    ],
    "3-5-2": [
      { x: "50%", y: "90%" },
      { x: "25%", y: "75%" }, { x: "50%", y: "78%" }, { x: "75%", y: "75%" },
      { x: "12%", y: "50%" }, { x: "32%", y: "45%" }, { x: "50%", y: "55%" }, { x: "68%", y: "45%" }, { x: "88%", y: "50%" },
      { x: "35%", y: "18%" }, { x: "65%", y: "18%" },
    ],
  }
  return positions[formation][index]
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set, get) => ({
      formation: "4-3-3",
      players: Array(11).fill(null),
      budget: INITIAL_BUDGET,

      setFormation: (formation) =>
        set({ formation, players: Array(11).fill(null), budget: INITIAL_BUDGET }),

      addPlayer: (index, player) => {
        const state = get()
        const oldPlayer = state.players[index]

        const effectiveBudget = state.budget + (oldPlayer ? oldPlayer.price : 0)
        if (effectiveBudget < player.price) return "INSUB_BUDGET"

        const countryCount = state.players.filter(
          (p) => p?.id !== oldPlayer?.id && p?.nationality === player.nationality
        ).length
        if (countryCount >= 3) return "MAX_NATION_LIMIT"

        const expectedPos = getPositionForIndex(index, state.formation)
        if (player.position !== expectedPos) return "WRONG_POSITION"

        if (state.players.some((p) => p?.id === player.id && p?.id !== oldPlayer?.id))
          return "ALREADY_IN_SQUAD"

        const newPlayers = [...state.players]
        const budgetDelta = oldPlayer ? oldPlayer.price - player.price : -player.price
        newPlayers[index] = player

        set({ players: newPlayers, budget: state.budget + budgetDelta })
        return null
      },

      removePlayer: (index) => {
        const state = get()
        const player = state.players[index]
        if (!player) return

        const newPlayers = [...state.players]
        newPlayers[index] = null
        set({ players: newPlayers, budget: state.budget + player.price })
      },

      getIsComplete: () => {
        const state = get()
        return state.players.every((p) => p !== null)
      },

      /** Push the current squad to the backend. Call after any mutation when authenticated. */
      syncToServer: async (token: string) => {
        const { formation, budget, players } = get()
        try {
          await saveSquad(token, {
            formation,
            budget,
            players: players.map((p) =>
              p
                ? { id: p.id, name: p.name, nationality: p.nationality, position: p.position }
                : null
            ),
          })
        } catch {
          // Non-fatal — local state is still the source of truth for the UI
        }
      },
    }),
    { name: "fantasy-squad-storage-v2" }
  )
)
