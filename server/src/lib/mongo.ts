import mongoose from "mongoose"

let connected = false

export async function connectMongo(): Promise<void> {
  if (connected || mongoose.connection.readyState === 1) {
    connected = true
    return
  }
  const uri = process.env.MONGODB_URL ?? "mongodb://localhost:27017/fantasy_wc"
  await mongoose.connect(uri)
  connected = true
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect()
  connected = false
}

export async function pingMongo(): Promise<boolean> {
  try {
    await mongoose.connection.db?.admin().ping()
    return true
  } catch {
    return false
  }
}
