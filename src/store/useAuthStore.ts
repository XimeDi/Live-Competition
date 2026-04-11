import { create } from "zustand"
import { persist } from "zustand/middleware"
import { logoutAccount } from "@/services/api/auth"

export type User = {
  id: string
  username: string
  points: number
  rank: number
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  /** Calls POST /auth/logout to invalidate the token server-side, then clears local state. */
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: async () => {
        const { token } = get()
        if (token) {
          try {
            await logoutAccount(token)
          } catch {
            // Even if the server call fails, clear local state.
          }
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: "fantasy-auth-storage",
    }
  )
)
