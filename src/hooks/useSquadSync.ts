import { useAuthStore } from "@/store/useAuthStore"
import { useSquadStore } from "@/store/useSquadStore"

/**
 * Returns a fire-and-forget function that saves the current squad to the backend.
 * Safe to call without a token — it's a no-op when the user is not logged in.
 */
export function useSquadSync() {
  const token = useAuthStore((s) => s.token)
  const syncToServer = useSquadStore((s) => s.syncToServer)

  return () => {
    if (token) {
      void syncToServer(token)
    }
  }
}
