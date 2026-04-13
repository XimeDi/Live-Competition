/**
 * MongoDB Player model.
 *
 * MongoDB is used as the primary document store for the 18 000+ player records
 * from the FC-26 dataset (110+ attributes, many optional fields → ideal for a
 * flexible document schema).  Meilisearch is seeded FROM this collection and
 * acts as the search/autocomplete layer on top of it.
 *
 * Key fields are indexed so that MongoDB can serve direct look-ups
 * (e.g. fetch a single player by id from a squad page) without hitting
 * Meilisearch.
 */
import mongoose, { Schema, model, models } from "mongoose"

export interface IPlayer {
  _id: string        // same string id used everywhere ("12345")
  name: string
  nameNormalized: string
  photo: string
  nationality: string
  club: string
  position: "GK" | "DEF" | "MID" | "FWD"
  rating: number
  price: number
}

const PlayerSchema = new Schema<IPlayer>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    nameNormalized: { type: String, required: true },
    photo: { type: String, default: "" },
    nationality: { type: String, required: true },
    club: { type: String, required: true },
    position: { type: String, required: true, enum: ["GK", "DEF", "MID", "FWD"] },
    rating: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }  // we manage _id ourselves (string)
)

PlayerSchema.index({ nationality: 1 })
PlayerSchema.index({ club: 1 })
PlayerSchema.index({ rating: -1 })
PlayerSchema.index({ nameNormalized: "text" })

// Prevent model re-compilation on hot reload (tsx watch)
export const PlayerModel = (
  "Player" in models ? models["Player"] : model("Player", PlayerSchema)
) as mongoose.Model<IPlayer>
