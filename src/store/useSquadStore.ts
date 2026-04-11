import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Player, Position } from "@/types"
import { fetchSquad, saveSquad } from "@/services/api/squad"

export type Formation = "4-3-3" | "4-4-2" | "3-5-2"

export interface SquadState {
  formation: Formation
  players: (Player | null)[]
  budget: number
  setFormation: (formation: Formation) => void
  addPlayer: (index: number, player: Player) => string | null
  removePlayer: (index: number) => void
  getIsComplete: () => boolean
  /** Persist current squad to the server. */
  syncToBackend: (token: string) => Promise<void>
  /** Load squad from server (called on login / app init). */
  restoreFromBackend: (token: string) => Promise<void>
}

const INITIAL_BUDGET = 1000.0

// Helper to determine position based on index & formation
export const getPositionForIndex = (index: number, formation: Formation): Position => {
  if (index === 0) return "GK"
  const defCount = parseInt(formation.split("-")[0])
  const midCount = parseInt(formation.split("-")[1])
  
  if (index <= defCount) return "DEF"
  if (index <= defCount + midCount) return "MID"
  return "FWD"
}

export const GET_POSITION_COORDS = (formation: Formation, index: number) => {
  const positions: Record<Formation, { x: string, y: string }[]> = {
    "4-3-3": [
      { x: "50%", y: "90%" }, // GK
      { x: "15%", y: "72%" }, { x: "38%", y: "75%" }, { x: "62%", y: "75%" }, { x: "85%", y: "72%" }, // DEF
      { x: "25%", y: "48%" }, { x: "50%", y: "52%" }, { x: "75%", y: "48%" }, // MID
      { x: "20%", y: "22%" }, { x: "50%", y: "15%" }, { x: "80%", y: "22%" }  // FWD
    ],
    "4-4-2": [
      { x: "50%", y: "90%" }, // GK
      { x: "15%", y: "75%" }, { x: "38%", y: "78%" }, { x: "62%", y: "78%" }, { x: "85%", y: "75%" }, // DEF
      { x: "15%", y: "48%" }, { x: "38%", y: "52%" }, { x: "62%", y: "52%" }, { x: "85%", y: "48%" }, // MID
      { x: "35%", y: "18%" }, { x: "65%", y: "18%" } // FWD
    ],
    "3-5-2": [
      { x: "50%", y: "90%" }, // GK
      { x: "25%", y: "75%" }, { x: "50%", y: "78%" }, { x: "75%", y: "75%" }, // DEF
      { x: "12%", y: "50%" }, { x: "32%", y: "45%" }, { x: "50%", y: "55%" }, { x: "68%", y: "45%" }, { x: "88%", y: "50%" }, // MID
      { x: "35%", y: "18%" }, { x: "65%", y: "18%" } // FWD
    ]
  }
  return positions[formation][index]
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set, get) => ({
      formation: "4-3-3",
      players: Array(11).fill(null),
      budget: INITIAL_BUDGET,
      
      setFormation: (formation) => set({ formation, players: Array(11).fill(null), budget: INITIAL_BUDGET }),
      
      addPlayer: (index, player) => {
        const state = get()
        const oldPlayer = state.players[index]
        
        // Correct budget check (including refund for replacement)
        const effectiveBudget = state.budget + (oldPlayer ? oldPlayer.price : 0)
        if (effectiveBudget < player.price) return "INSUB_BUDGET"
        
        // Max 3 players per country
        const countryCount = state.players.filter(p => p?.id !== oldPlayer?.id && p?.nationality === player.nationality).length
        if (countryCount >= 3) return "MAX_NATION_LIMIT"
        
        // Correct position
        const expectedPos = getPositionForIndex(index, state.formation)
        if (player.position !== expectedPos) return "WRONG_POSITION"
        
        // Player already in squad?
        if (state.players.some(p => p?.id === player.id && p?.id !== oldPlayer?.id)) return "ALREADY_IN_SQUAD"

        const newPlayers = [...state.players]
        const budgetDelta = oldPlayer ? oldPlayer.price - player.price : -player.price
        
        newPlayers[index] = player
        
        set({
          players: newPlayers,
          budget: state.budget + budgetDelta
        })
        return null
      },
      
      removePlayer: (index) => {
        const state = get()
        const player = state.players[index]
        if (!player) return
        
        const newPlayers = [...state.players]
        newPlayers[index] = null
        
        set({
          players: newPlayers,
          budget: state.budget + player.price
        })
      },
      
      getIsComplete: () => {
        const state = get()
        return state.players.every(p => p !== null)
      },

      syncToBackend: async (token) => {
        const { formation, players } = get()
        try {
          await saveSquad(token, formation, players)
        } catch {
          // Non-fatal: squad is still saved locally via Zustand persist.
        }
      },

      restoreFromBackend: async (token) => {
        try {
          const { squad } = await fetchSquad(token)
          if (!squad) return
          const formation = squad.formation as Formation
          const players = squad.players as (Player | null)[]
          const spent = players.reduce((acc, p) => acc + (p?.price ?? 0), 0)
          set({ formation, players, budget: INITIAL_BUDGET - spent })
        } catch {
          // Keep local state if server unavailable.
        }
      },
    }),
    {
      name: "fantasy-squad-storage-v2",
    }
  )
)
