import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Play,
  Trash2,
  RotateCcw,
  Shield,
  Users,
  Trophy,
  Activity,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  adminGetMatches,
  adminGetStats,
  adminSetResult,
  adminSimulateMatch,
  adminResetMatch,
  adminDeleteMatch,
  type Match,
} from "@/services/api/matches"

const GROUP_COLORS: Record<string, string> = {
  A: "bg-red-500/20 text-red-400 border-red-500/30",
  B: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  C: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  D: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  E: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  F: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  G: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  H: "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

// ── Auth screen ──────────────────────────────────────────────────────────────
function AdminLogin({ onAuth }: { onAuth: (secret: string) => void }) {
  const [secret, setSecret] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!secret.trim()) return
    setLoading(true)
    setError("")
    try {
      // Verify credentials by calling a protected endpoint
      await adminGetStats(secret.trim())
      sessionStorage.setItem("admin_secret", secret.trim())
      onAuth(secret.trim())
    } catch {
      setError("Clave incorrecta o servidor no disponible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Panel de Administración</h1>
          <p className="text-sm text-foreground/50">Fantasy Copa del Mundo 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Clave de administrador"
              className="w-full h-12 rounded-xl border border-border/60 bg-card/60 px-4 pr-12 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="w-full h-12 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" /> Verificando…</>
            ) : (
              <>Acceder al panel</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ElementType; color: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <p className="text-xs text-foreground/50 font-medium">{label}</p>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  )
}

// ── Result input form ─────────────────────────────────────────────────────────
function ResultForm({
  match,
  adminSecret,
  onDone,
}: {
  match: Match
  adminSecret: string
  onDone: () => void
}) {
  const [home, setHome] = useState("")
  const [away, setAway] = useState("")
  const queryClient = useQueryClient()

  const setResultMutation = useMutation({
    mutationFn: () =>
      adminSetResult(match.id, Number(home), Number(away), adminSecret),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      toast.success(
        `Resultado registrado: ${data.homeScore} - ${data.awayScore} · ${data.usersAffected} users · +${data.totalPointsDistributed} pts`
      )
      onDone()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const valid =
    home !== "" &&
    away !== "" &&
    !isNaN(Number(home)) &&
    !isNaN(Number(away)) &&
    Number(home) >= 0 &&
    Number(away) >= 0

  return (
    <div className="flex items-center gap-2 mt-3">
      <input
        type="number"
        min={0}
        max={20}
        placeholder="0"
        value={home}
        onChange={(e) => setHome(e.target.value)}
        className="w-14 h-9 rounded-lg border border-border/60 bg-background text-center text-sm font-bold text-foreground focus:outline-none focus:border-primary/60 transition-all"
      />
      <span className="text-foreground/30 font-bold">—</span>
      <input
        type="number"
        min={0}
        max={20}
        placeholder="0"
        value={away}
        onChange={(e) => setAway(e.target.value)}
        className="w-14 h-9 rounded-lg border border-border/60 bg-background text-center text-sm font-bold text-foreground focus:outline-none focus:border-primary/60 transition-all"
      />
      <button
        onClick={() => setResultMutation.mutate()}
        disabled={!valid || setResultMutation.isPending}
        className="flex-1 h-9 rounded-lg bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
      >
        {setResultMutation.isPending ? (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        Guardar
      </button>
      <button
        onClick={onDone}
        className="h-9 px-3 rounded-lg border border-border/60 text-foreground/40 text-xs font-medium hover:text-foreground transition-all"
      >
        Cancelar
      </button>
    </div>
  )
}

// ── Match card ────────────────────────────────────────────────────────────────
function AdminMatchCard({
  match,
  adminSecret,
}: {
  match: Match
  adminSecret: string
}) {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const finished = match.status === "finished"
  const groupColor =
    GROUP_COLORS[match.groupName] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"

  const simulateMutation = useMutation({
    mutationFn: () => adminSimulateMatch(match.id, adminSecret),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      toast.success(
        `Simulado: ${data.homeScore} - ${data.awayScore} · ${data.usersAffected} usuarios · +${data.totalPointsDistributed} pts`
      )
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const resetMutation = useMutation({
    mutationFn: () => adminResetMatch(match.id, adminSecret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      toast.success("Partido reiniciado")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteMatch(match.id, adminSecret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      toast.success("Partido eliminado")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const busy =
    simulateMutation.isPending || resetMutation.isPending || deleteMutation.isPending

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 transition-all ${
        finished
          ? "border-primary/30 bg-primary/5"
          : "border-border/50 bg-card/60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${groupColor}`}>
          Grupo {match.groupName}
        </span>
        {finished ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
            <CheckCircle2 className="h-3 w-3" /> Finalizado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/40">
            <Clock className="h-3 w-3" /> Por jugar
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-2xl">{match.homeFlag}</span>
          <span className="text-xs font-semibold text-foreground/80 text-center truncate w-full">{match.homeTeam}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {finished ? (
            <span className="text-2xl font-black text-foreground tabular-nums">
              {match.homeScore} — {match.awayScore}
            </span>
          ) : (
            <span className="text-sm font-black text-foreground/30">VS</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-2xl">{match.awayFlag}</span>
          <span className="text-xs font-semibold text-foreground/80 text-center truncate w-full">{match.awayTeam}</span>
        </div>
      </div>

      {/* Action buttons */}
      {!finished && !showForm && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Resultado real
          </button>
          <button
            onClick={() => simulateMutation.mutate()}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-secondary/40 text-secondary text-xs font-bold hover:bg-secondary/10 transition-all disabled:opacity-50"
          >
            {simulateMutation.isPending ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Simular
          </button>
        </div>
      )}

      {!finished && showForm && (
        <ResultForm
          match={match}
          adminSecret={adminSecret}
          onDone={() => setShowForm(false)}
        />
      )}

      {finished && (
        <div className="flex gap-2">
          <button
            onClick={() => resetMutation.mutate()}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/10 transition-all disabled:opacity-50"
          >
            {resetMutation.isPending ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Reiniciar
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={busy}
            className="h-9 px-3 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            {deleteMutation.isPending ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── Main admin panel ──────────────────────────────────────────────────────────
function AdminPanel({ adminSecret, onLogout }: { adminSecret: string; onLogout: () => void }) {
  const { data: matchesData, isLoading } = useQuery({
    queryKey: ["admin-matches", adminSecret],
    queryFn: () => adminGetMatches(adminSecret),
  })

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats", adminSecret],
    queryFn: () => adminGetStats(adminSecret),
    refetchInterval: 15_000,
  })

  const matches = matchesData?.matches ?? []
  const finishedCount = matches.filter((m) => m.status === "finished").length
  const groups = [...new Set(matches.map((m) => m.groupName))].sort()

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-1 w-full bg-gradient-to-r from-secondary via-primary to-secondary" />

      <div className="container py-8 space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Panel de Administración
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground">
              Fantasy Copa del Mundo 2026
            </h1>
            <p className="text-sm text-foreground/50 mt-0.5">
              {finishedCount}/{matches.length} partidos finalizados
            </p>
          </div>
          <button
            onClick={onLogout}
            className="h-9 px-4 rounded-xl border border-border/60 text-foreground/50 text-sm font-medium hover:border-destructive/30 hover:text-destructive transition-all"
          >
            Salir
          </button>
        </div>

        {/* Stats */}
        {statsData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Usuarios" value={statsData.userCount} icon={Users} color="text-primary" />
            <StatCard label="Equipos guardados" value={statsData.squadCount} icon={Shield} color="text-secondary" />
            <StatCard label="Partidos totales" value={statsData.matchCount} icon={Activity} color="text-foreground" />
            <StatCard label="Partidos jugados" value={statsData.finishedCount} icon={Trophy} color="text-primary" />
          </div>
        )}

        {/* Progress */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-foreground/50">
              <span>Progreso del torneo</span>
              <span>{Math.round((finishedCount / matches.length) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${(finishedCount / matches.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>
        )}

        {/* Matches by group */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${GROUP_COLORS[group] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                    Grupo {group}
                  </div>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches
                    .filter((m) => m.groupName === group)
                    .map((match) => (
                      <AdminMatchCard
                        key={match.id}
                        match={match}
                        adminSecret={adminSecret}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="rounded-2xl border border-border/40 bg-card/30 px-6 py-4 text-xs text-foreground/40 space-y-1">
          <p className="font-semibold text-foreground/60 mb-2">Sistema de puntos</p>
          <p>🏆 Victoria: +3 pts por jugador · 🤝 Empate: +1 pt por jugador · ❌ Derrota: +0 pts</p>
          <p>Los puntos se distribuyen automáticamente a todos los usuarios con jugadores de las selecciones que juegan.</p>
        </div>
      </div>
    </div>
  )
}

// ── Page entry point ──────────────────────────────────────────────────────────
export function Admin() {
  const saved = sessionStorage.getItem("admin_secret")
  const [adminSecret, setAdminSecret] = useState<string | null>(saved)

  const handleLogout = () => {
    sessionStorage.removeItem("admin_secret")
    setAdminSecret(null)
  }

  return (
    <AnimatePresence mode="wait">
      {adminSecret ? (
        <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminPanel adminSecret={adminSecret} onLogout={handleLogout} />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AdminLogin onAuth={setAdminSecret} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
