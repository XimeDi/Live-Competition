import { apiJson } from "./client"

export interface SquadPlayerSlot {
  id: string
  name: string
  nationality: string
  position: string
}

export interface RemoteSquad {
  formation: string
  budget: number
  players: (SquadPlayerSlot | null)[]
}

export function saveSquad(
  token: string,
  data: {
    formation: string
    budget: number
    players: (SquadPlayerSlot | null)[]
  }
): Promise<{ ok: boolean }> {
  return apiJson<{ ok: boolean }>("/api/squad", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  })
}

export function fetchSquad(token: string): Promise<{ squad: RemoteSquad | null }> {
  return apiJson<{ squad: RemoteSquad | null }>("/api/squad", {
    method: "GET",
    token,
  })
}
