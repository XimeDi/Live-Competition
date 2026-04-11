import { useEffect } from "react"
import { fetchCurrentUser } from "@/services/api/auth"
import { useAuthStore } from "@/store/useAuthStore"
import { useSquadStore } from "@/store/useSquadStore"

export function AuthSessionSync() {
  useEffect(() => {
    let cancelled = false
    void (async () => {
      await useAuthStore.persist.rehydrate()
      if (cancelled) return
      const { token, login, logout } = useAuthStore.getState()
      if (!token) return
      try {
        const user = await fetchCurrentUser(token)
        if (!cancelled) {
          login(user, token)
          // Restore squad from server (F3.7).
          void useSquadStore.getState().restoreFromBackend(token)
        }
      } catch {
        if (!cancelled) await logout()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
