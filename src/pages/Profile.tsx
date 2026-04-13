import { Trophy, Star, Shield, LogOut, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { useSquadStore, getPositionForIndex } from '@/store/useSquadStore'
import { useUiStore } from '@/store/useUiStore'
import { translations } from '@/lib/translations'
import { useNavigate } from 'react-router-dom'

const POS_COLORS: Record<string, string> = {
  GK:  'bg-amber-500/10 text-amber-500 border-amber-500/30',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  MID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export function Profile() {
  const { user, logout } = useAuthStore()
  const { players, formation, budget } = useSquadStore()
  const { language } = useUiStore()
  const t = translations[language].profile
  const navigate = useNavigate()

  const activePlayers = players.filter(Boolean) as NonNullable<typeof players[number]>[]
  const totalValue = activePlayers.reduce((sum, p) => sum + p.price, 0)
  const avgRating = activePlayers.length > 0
    ? (activePlayers.reduce((sum, p) => sum + p.rating, 0) / activePlayers.length).toFixed(1)
    : '—'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 w-full bg-gradient-to-r from-green-600 via-primary to-green-600" />

      <div className="container py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-foreground/50 mt-0.5">{t.subtitle}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="h-10 px-5 text-sm font-semibold border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-all gap-2 self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" /> {t.logout}
          </Button>
        </div>

        {/* ── Avatar + stats ── */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-4xl font-black text-primary">
                {user?.username?.charAt(0).toUpperCase() ?? '?'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-widest mb-1">{t.managerLabel}</p>
              <p className="text-xl font-black text-foreground truncate">{user?.username ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-3 w-3 text-primary" />
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">{t.pointsLabel}</p>
              </div>
              <p className="text-2xl font-black text-primary">{user?.points ?? 0}</p>
            </div>
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="h-3 w-3 text-secondary" />
                <p className="text-[10px] font-semibold text-secondary uppercase tracking-widest">{t.rankingLabel}</p>
              </div>
              <p className="text-2xl font-black text-secondary">{user?.rank ? `#${user.rank}` : t.unranked}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 text-foreground/40" />
                <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.simPtsLabel}</p>
              </div>
              <p className="text-2xl font-black text-foreground">+{user?.points ?? 0}</p>
            </div>
          </div>
        </div>

        {/* ── Squad card ── */}
        <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{t.mySquad}</h2>
                <p className="text-xs text-foreground/50">
                  {t.formationLabel} {formation} · {activePlayers.length}/11 {t.playersLabel} · ${budget.toFixed(1)}M {t.availableLabel}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest">{t.avgRating}</p>
                <p className="text-xl font-black text-primary">{avgRating}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest">{t.value}</p>
                <p className="text-xl font-black text-foreground">${totalValue.toFixed(1)}M</p>
              </div>
            </div>
          </div>

          {activePlayers.length === 0 ? (
            <div className="py-16 text-center">
              <Shield className="h-12 w-12 mx-auto text-foreground/10 mb-4" />
              <p className="font-semibold text-foreground/30 text-sm">{t.noPlayers}</p>
              <button
                onClick={() => navigate('/squad')}
                className="mt-4 h-9 px-5 bg-primary text-black text-sm font-semibold rounded-xl"
              >
                {t.buildTeam}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-foreground/[0.02]">
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.indexCol}</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.playerCol}</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.posCol}</th>
                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest hidden sm:table-cell">{t.clubCol}</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.ratingCol}</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.valueCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {players.map((player, index) => {
                    if (!player) return null
                    const pos = getPositionForIndex(index, formation)
                    return (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group hover:bg-foreground/[0.03] transition-colors"
                      >
                        <td className="py-3 px-4 text-foreground/30 font-mono text-xs">{(index + 1).toString().padStart(2, '0')}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={player.photo}
                                alt={player.name}
                                className="w-9 h-9 rounded-lg object-cover border border-border/40 group-hover:border-primary/30 transition-colors"
                                loading="lazy"
                              />
                              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                            </div>
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${POS_COLORS[pos]}`}>{pos}</span>
                        </td>
                        <td className="py-3 px-4 text-foreground/40 text-xs hidden sm:table-cell truncate max-w-[120px]">{player.club}</td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">{player.rating}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">${player.price}M</td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Points info ── */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {user?.points ?? 0} puntos acumulados
            </p>
            <p className="text-xs text-foreground/50 mt-0.5">
              Los puntos se actualizan automáticamente cuando el administrador registra resultados de partidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
