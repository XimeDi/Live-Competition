/**
 * MongoDB MatchEvent model.
 *
 * Every time an admin finalises a match result, a MatchEvent document is
 * written here with the complete per-user points breakdown (F4.8).
 *
 * Why MongoDB for this instead of PostgreSQL?
 *   • The shape varies per match (different numbers of affected users / players).
 *   • It is append-only — an immutable audit log — which suits a document store.
 *   • Reading a user's full history is a single indexed query on userId.
 *   • PostgreSQL already holds the authoritative match schedule/score; MongoDB
 *     holds the derived *scoring event* with rich nested breakdowns.
 */
import mongoose from "mongoose"
const { Schema, model, models } = mongoose
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
  matchId: string          // references PostgreSQL matches.id
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

// Index for the per-user history query (F4.8)
MatchEventSchema.index({ "userBreakdowns.userId": 1 })
MatchEventSchema.index({ scoredAt: -1 })

export const MatchEventModel = (
  "MatchEvent" in models ? models["MatchEvent"] : model("MatchEvent", MatchEventSchema)
) as mongoose.Model<IMatchEvent>
