import { useEffect } from "react"
import { fetchCurrentUser } from "@/services/api/auth"
import { useAuthStore } from "@/store/useAuthStore"

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
        if (!cancelled) login(user, token)
      } catch {
        if (!cancelled) logout()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
