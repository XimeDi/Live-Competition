import { Link } from "react-router-dom"
import { Trophy, Star, Users, ArrowRight, CheckCircle2, Globe } from "lucide-react"
import { motion } from "framer-motion"

import { useAuthStore } from "@/store/useAuthStore"
import { useSquadStore } from "@/store/useSquadStore"
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"
import { BroadcastTicker } from "@/components/ui/BroadcastTicker"
import { MatchSimulator } from "@/components/ui/MatchSimulator"

export function Home() {
  const { user } = useAuthStore()
  const { players } = useSquadStore()
  const { language } = useUiStore()
  const t = translations[language].home

  const squadCount = players.filter(Boolean).length
  const isSquadComplete = squadCount === 11
  const missing = 11 - squadCount

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-1 w-full bg-gradient-to-r from-green-600 via-primary to-green-600" />

      <div className="container py-8 space-y-10">

        {/* ── Welcome header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                {t.brand} · {t.brandTitle}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t.welcome} <span className="text-primary">{user?.username ?? "Manager"}</span>
            </h1>
            <p className="text-sm text-foreground/50 mt-1">{t.subtitle}</p>
          </div>
          <Link
            to="/squad"
            className="inline-flex items-center gap-2 h-11 px-6 bg-primary text-black font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
          >
            {t.myTeam} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t.totalPoints, value: user?.points ?? 0, color: "text-primary" },
            { label: t.globalRanking, value: user?.rank ? `#${user.rank}` : "—", color: "text-secondary" },
            { label: t.playersSigned, value: `${squadCount}/11`, color: "text-foreground" },
            { label: t.simPoints, value: `+${user?.points ?? 0}`, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 1) }}
              className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-1"
            >
              <p className="text-xs text-foreground/50 font-medium">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Squad status banner ── */}
        {!isSquadComplete && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-6 py-5"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {t.squadIncomplete} {missing} {missing === 1 ? t.squadIncompletePlayer : t.squadIncompletePlayers}
                </p>
                <p className="text-xs text-foreground/50 mt-0.5">{t.completeSubtitle}</p>
              </div>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-black font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shrink-0"
            >
              {t.signPlayers} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {isSquadComplete && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4"
          >
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-semibold text-primary">{t.squadComplete}</p>
            <Link to="/squad" className="ml-auto text-xs text-primary/70 hover:text-primary transition-colors font-medium flex items-center gap-1">
              {t.viewFormation} <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}

        {/* ── Quick links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/search" className="group rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">{t.transferMarket}</span>
            </div>
            <p className="text-xs text-foreground/50">{t.transferSubtitle}</p>
          </Link>

          <Link to="/leaderboard" className="group rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-secondary/40 hover:bg-secondary/5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Trophy className="h-4 w-4 text-secondary" />
              </div>
              <span className="font-semibold text-sm text-foreground">{t.globalStandings}</span>
            </div>
            <p className="text-xs text-foreground/50">{t.standingsSubtitle}</p>
          </Link>

          <Link to="/squad" className="group rounded-2xl border border-border/60 bg-card/60 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">{t.tacticBoard}</span>
            </div>
            <p className="text-xs text-foreground/50">{t.tacticSubtitle}</p>
          </Link>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border/40" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-card/40">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">
              {t.groupStage} · {t.matches}
            </span>
          </div>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* ── Match Simulator ── */}
        <MatchSimulator />
      </div>

      <BroadcastTicker />
    </div>
  )
}
