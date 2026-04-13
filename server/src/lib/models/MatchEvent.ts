/**
 * Modelo MongoDB para eventos de puntuación (F4.8).
 * Cada vez que un admin finaliza un partido, se guarda el desglose de puntos por usuario.
 * Se usa MongoDB porque la estructura varía por partido y sirve como log inmutable de auditoría.
 */
import mongoose, { Schema, model } from "mongoose"
import type { Document } from "mongoose"

export interface IPlayerPoints {
  name: string
  nationality: string
  points: number
}

export interface IUserBreakdown {
  userId: string
  pointsEarned: number
  players: IPlayerPoints[]
}

export interface IMatchEvent extends Document {
  matchId: string          // referencia al id del partido en PostgreSQL
  homeTeam: string
  awayTeam: string
  homeNationality: string
  awayNationality: string
  homeScore: number
  awayScore: number
  scoredAt: Date
  usersAffected: number
  totalPointsDistributed: number
  userBreakdowns: IUserBreakdown[]
}

const PlayerPointsSchema = new Schema<IPlayerPoints>(
  {
    name: { type: String, required: true },
    nationality: { type: String, required: true },
    points: { type: Number, required: true },
  },
  { _id: false }
)

const UserBreakdownSchema = new Schema<IUserBreakdown>(
  {
    userId: { type: String, required: true },
    pointsEarned: { type: Number, required: true },
    players: { type: [PlayerPointsSchema], default: [] },
  },
  { _id: false }
)

const MatchEventSchema = new Schema<IMatchEvent>(
  {
    matchId: { type: String, required: true, unique: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    homeNationality: { type: String, required: true },
    awayNationality: { type: String, required: true },
    homeScore: { type: Number, required: true },
    awayScore: { type: Number, required: true },
    scoredAt: { type: Date, default: Date.now },
    usersAffected: { type: Number, default: 0 },
    totalPointsDistributed: { type: Number, default: 0 },
    userBreakdowns: { type: [UserBreakdownSchema], default: [] },
  },
  { timestamps: false }
)

// Índice para consultas de historial por usuario (F4.8)
MatchEventSchema.index({ "userBreakdowns.userId": 1 })
MatchEventSchema.index({ scoredAt: -1 })

export const MatchEventModel = (
  mongoose.models["MatchEvent"] ?? model("MatchEvent", MatchEventSchema)
) as mongoose.Model<IMatchEvent>
