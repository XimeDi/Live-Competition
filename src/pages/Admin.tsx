import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Shield,
  Users,
  Trophy,
  Activity,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  LayoutDashboard,
  Swords,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
} from "lucide-react"
import {
  adminGetMatches,
  adminGetStats,
  adminSetResult,
  adminSimulateMatch,
  adminSimulateRound,
  adminResetTournament,
  type Match,
} from "@/services/api/matches"
import { getLeaderboard, type LeaderboardEntry } from "@/services/api/leaderboard"

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
function AdminMatchRow({ match, adminSecret }: { match: Match; adminSecret: string }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [s1, setS1] = useState(match.homeScore ?? 0)
  const [s2, setS2] = useState(match.awayScore ?? 0)

  const simulateMutation = useMutation({
    mutationFn: () => adminSimulateMatch(match.id, adminSecret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const saveMutation = useMutation({
    mutationFn: () => adminSetResult(match.id, s1, s2, adminSecret),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] })
      setEditing(false)
      toast.success(`Updated: ${data.homeScore}:${data.awayScore}`)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-indigo-500/20 transition-all">
      <div className="flex-1 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[140px]">
          <span className="text-sm font-bold text-white">{match.homeTeam}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={s1} 
                onChange={e => setS1(parseInt(e.target.value))} 
                className="w-10 h-8 rounded-lg bg-white/5 border border-white/10 text-center text-xs font-bold text-white"
              />
              <span className="text-slate-600 px-1">-</span>
              <input 
                type="number" 
                value={s2} 
                onChange={e => setS2(parseInt(e.target.value))} 
                className="w-10 h-8 rounded-lg bg-white/5 border border-white/10 text-center text-xs font-bold text-white"
              />
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${match.status === 'finished' ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5 border border-white/5'}`}>
              <span className={`text-sm font-black tabular-nums ${match.status === 'finished' ? 'text-indigo-400' : 'text-slate-500'}`}>
                {match.homeScore ?? '-'}
              </span>
              <span className="text-slate-700 font-bold">:</span>
              <span className={`text-sm font-black tabular-nums ${match.status === 'finished' ? 'text-indigo-400' : 'text-slate-500'}`}>
                {match.awayScore ?? '-'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 min-w-[140px] justify-end">
          <span className="text-sm font-bold text-white">{match.awayTeam}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <button onClick={() => saveMutation.mutate()} className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
            <CheckCircle2 className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="h-8 w-8 rounded-lg bg-white/5 text-slate-500 flex items-center justify-center hover:text-white hover:bg-white/10 transition-all">
              <Settings className="h-4 w-4" />
            </button>
            {match.status !== 'finished' && (
              <button 
                onClick={() => simulateMutation.mutate()} 
                disabled={simulateMutation.isPending}
                className="h-8 px-3 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
              >
                {simulateMutation.isPending ? '...' : 'SIM'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function AdminLeaderboardTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-leaderboard"],
    queryFn: () => getLeaderboard(1, 40),
  })

  const entries = data?.data ?? []

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank</th>
              <th className="text-left py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Manager Identification</th>
              <th className="text-right py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Point Aggregate</th>
              <th className="text-right py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                 <tr key={i} className="animate-pulse"><td colSpan={4} className="py-6 px-8"><div className="h-6 bg-white/5 rounded-lg" /></td></tr>
               ))
            ) : entries.map((entry: LeaderboardEntry) => (
              <tr key={entry.userId} className="hover:bg-white/[0.01] transition-colors group">
                <td className="py-5 px-8">
                  <span className="font-black text-indigo-400 tabular-nums">#{entry.rank.toString().padStart(2, '0')}</span>
                </td>
                <td className="py-5 px-8">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-slate-500 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-all uppercase">
                      {entry.username.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white">{entry.username}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">ID: {entry.userId.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8 text-right">
                  <span className="text-lg font-black text-white tabular-nums">{entry.points.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-600 font-bold ml-2">PTS</span>
                </td>
                <td className="py-5 px-8 text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main admin panel ──────────────────────────────────────────────────────────
// ── Main admin portal layout ────────────────────────────────────────────────
function AdminPanel({ adminSecret, onLogout }: { adminSecret: string; onLogout: () => void }) {
  const [activeView, setActiveView] = useState<"dashboard" | "matches" | "managers" | "system">("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const { data: matchesData } = useQuery({
    queryKey: ["admin-matches", adminSecret],
    queryFn: () => adminGetMatches(adminSecret),
  })

  const { data: statsData } = useQuery({
    queryKey: ["admin-stats", adminSecret],
    queryFn: () => adminGetStats(adminSecret),
    refetchInterval: 15_000,
  })

  const queryClient = useQueryClient()
  const simulateRoundMutation = useMutation({
    mutationFn: (round: number) => adminSimulateRound(round, adminSecret),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] })
      toast.success(
        `Jornada simulada: ${data.matchesSimulated} partidos · ${data.totalAffected} usuarios afectados`
      )
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const resetTournamentMutation = useMutation({
    mutationFn: () => adminResetTournament(adminSecret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] })
      toast.success("Torneo reiniciado: todos los partidos y puntos han vuelto a cero.")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const matches = matchesData?.matches ?? []
  const finishedCount = matches.filter((m) => m.status === "finished").length
  const groups = [...new Set(matches.map((m) => m.groupName))].sort()

  return (
    <div className="flex min-h-screen bg-[#07090d] text-slate-300 font-inter">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c1017] border-r border-white/5 transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-white tracking-tight text-lg">Hyperion<span className="text-indigo-500">HQ</span></span>
          </div>

          <nav className="flex-1 space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "matches", label: "Match Engine", icon: Swords },
              { id: "managers", label: "Technical Staff", icon: Users },
              { id: "system", label: "System Config", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeView === item.id
                    ? "bg-white/5 text-indigo-400 border border-white/5"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                }`}
              >
                <item.icon className={`h-4 w-4 ${activeView === item.id ? "text-indigo-400" : "text-slate-600"}`} />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 transition-all mt-auto"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#0c1017]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-white font-bold text-lg capitalize">{activeView}</h2>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span>Control Center</span>
                <ChevronRight className="h-2.5 w-2.5" />
                <span className="text-indigo-500/60">Live Environment</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none mb-1">Kris Paz</p>
                <p className="text-[10px] text-indigo-500/70 font-black uppercase tracking-widest">Master Admin</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400">
                KP
              </div>
            </div>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeView === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Users" value={statsData?.userCount ?? 0} icon={Users} color="text-indigo-400" />
                    <StatCard label="Squads Created" value={statsData?.squadCount ?? 0} icon={Shield} color="text-cyan-400" />
                    <StatCard label="Matches Played" value={statsData?.finishedCount ?? 0} icon={Activity} color="text-indigo-400" />
                    <StatCard label="Completion" value={`${Math.round((finishedCount / matches.length) * 100)}%`} icon={Trophy} color="text-indigo-400" />
                  </div>

                  {/* World Cup Simulation Engine Card */}
                  <div className="relative group overflow-hidden bg-[#0c1017] border border-white/5 p-8 rounded-[2rem] shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 text-white/5 -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700">
                      <Zap className="h-64 w-64" />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tight uppercase italic">Match Simulation <span className="text-indigo-500">Engine</span></h3>
                        <p className="text-slate-500 text-sm max-w-lg mt-2 font-medium">Batch process tournament phases with high-precision score generators and instant manager point distribution.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num) => (
                           <button
                             key={num}
                             onClick={() => simulateRoundMutation.mutate(num)}
                             disabled={simulateRoundMutation.isPending}
                             className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all group flex flex-col gap-4 text-left overflow-hidden"
                           >
                             <div className="flex items-center justify-between">
                               <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                 <Zap className="h-5 w-5 text-indigo-400 group-hover:animate-pulse" />
                               </div>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jornada {num}</span>
                             </div>
                             <div>
                                <p className="text-xs font-bold text-white uppercase italic tracking-wider">Execute Phase</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black opacity-40">Group Stage Round {num}</p>
                             </div>
                             {simulateRoundMutation.isPending && simulateRoundMutation.variables === num && (
                               <div className="absolute inset-0 bg-indigo-600/10 backdrop-blur-sm flex items-center justify-center">
                                 <div className="h-6 w-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                               </div>
                             )}
                           </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-time Simulation Node Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === "matches" && (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-12"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {groups.map((group) => (
                      <div key={group} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/20" />
                          <h4 className="text-xl font-black text-white italic uppercase tracking-tight">Group <span className="text-indigo-500">{group}</span></h4>
                        </div>
                        <div className="space-y-3">
                          {matches
                            .filter((m) => m.groupName === group)
                            .map((match) => (
                              <AdminMatchRow key={match.id} match={match} adminSecret={adminSecret} />
                            ))}
                        </div>
                      </div>
                    ))}
                   </div>
                </motion.div>
              )}

              {activeView === "managers" && (
                <motion.div
                  key="managers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-[#0c1017] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <AdminLeaderboardTable />
                  </div>
                </motion.div>
              )}

              {activeView === "system" && (
                <motion.div
                   key="system"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="max-w-xl space-y-8"
                >
                  <div className="bg-[#0c1017] border border-white/5 rounded-3xl p-8 space-y-6">
                     <div>
                       <h3 className="text-xl font-bold text-white mb-2">Destructive Actions</h3>
                       <p className="text-sm text-slate-500">Manage critical system state and database resets.</p>
                     </div>
                     
                     <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                       <p className="text-xs text-rose-500 font-bold uppercase tracking-widest leading-relaxed">
                         Warning: Resetting the tournament will clear all match results and set every manager's points to exactly zero.
                       </p>
                       <button
                         onClick={() => {
                           if (confirm("REINICIAR TODO EL TORNEO: ¿Estás seguro?")) {
                             resetTournamentMutation.mutate();
                           }
                         }}
                         disabled={resetTournamentMutation.isPending}
                         className="flex items-center gap-2 px-6 h-11 rounded-xl bg-rose-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20"
                       >
                         {resetTournamentMutation.isPending ? "Resetting..." : "Reset Tournament Database"}
                       </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
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
