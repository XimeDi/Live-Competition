import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Player, Position } from "@/types"

export type Formation = "4-3-3" | "4-4-2" | "3-5-2"

export interface SquadState {
  formation: Formation
  players: (Player | null)[]
  budget: number
  setFormation: (formation: Formation) => void
  addPlayer: (index: number, player: Player) => boolean
  removePlayer: (index: number) => void
  getIsComplete: () => boolean
}

const INITIAL_BUDGET = 100.0

// Helper to determine position based on index & formation
export const getPositionForIndex = (index: number, formation: Formation): Position => {
  if (index === 0) return "GK"
  const defCount = parseInt(formation.split("-")[0])
  const midCount = parseInt(formation.split("-")[1])
  
  if (index <= defCount) return "DEF"
  if (index <= defCount + midCount) return "MID"
  return "FWD"
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
        
        // Rules Check
        if (state.budget < player.price) return false // Not enough budget
        
        // Max 3 players per country
        const countryCount = state.players.filter(p => p?.nationality === player.nationality).length
        if (countryCount >= 3) return false
        
        // Correct position
        const expectedPos = getPositionForIndex(index, state.formation)
        if (player.position !== expectedPos) return false
        
        // Player already in squad?
        if (state.players.some(p => p?.id === player.id)) return false

        const newPlayers = [...state.players]
        const oldPlayer = newPlayers[index]
        
        // Refund old player price if replacing
        const budgetDelta = oldPlayer ? oldPlayer.price - player.price : -player.price
        
        newPlayers[index] = player
        
        set({
          players: newPlayers,
          budget: state.budget + budgetDelta
        })
        return true
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
      }
    }),
    {
      name: "fantasy-squad-storage",
    }
  )
)
