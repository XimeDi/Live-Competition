import type { Player } from "@/types"
import { apiJson } from "./client"

export type StoredSquad = {
  formation: string
  players: (Player | null)[]
  updatedAt: string
}

export type SquadResponse = { squad: StoredSquad | null }

export function fetchSquad(token: string): Promise<SquadResponse> {
  return apiJson<SquadResponse>("/api/squad", { method: "GET", token })
}

export function saveSquad(
  token: string,
  formation: string,
  players: (Player | null)[]
): Promise<{ squad: StoredSquad }> {
  return apiJson("/api/squad", {
    method: "PUT",
    token,
    body: JSON.stringify({ formation, players }),
  })
}
