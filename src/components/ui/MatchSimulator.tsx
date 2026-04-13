import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Clock, CheckCircle2, Loader2 } from "lucide-react"

import { getMatches, type Match } from "@/services/api/matches"
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"

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

function MatchCard({ match }: { match: Match }) {
  const { language } = useUiStore()
  const t = translations[language].simulator
  const groupColor = GROUP_COLORS[match.groupName] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"
  const finished = match.status === "finished"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
        finished
          ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/50 bg-card/60"
      }`}
    >
      {/* Group pill + status badge */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${groupColor}`}>
          {t.group} {match.groupName}
        </span>
        {finished ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> {t.ft}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-foreground/40 border border-border/30 px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" /> {t.upcoming}
          </span>
        )}
      </div>

      {/* Score display */}
      <div className="flex items-center justify-between px-5 py-4 gap-2">
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-3xl">{match.homeFlag}</span>
          <span className="text-xs font-semibold text-foreground/80 text-center leading-tight truncate w-full text-center">
            {match.homeTeam}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0 px-2">
          {finished ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${match.homeScore}-${match.awayScore}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl font-black text-foreground tabular-nums">{match.homeScore}</span>
                <span className="text-lg font-black text-foreground/30">—</span>
                <span className="text-3xl font-black text-foreground tabular-nums">{match.awayScore}</span>
              </motion.div>
            </AnimatePresence>
          ) : (
            <span className="text-sm font-black text-foreground/30 uppercase tracking-widest">{t.vs}</span>
          )}
          <span className="text-[9px] text-foreground/30 uppercase tracking-wider">
            {finished ? t.ft : t.upcoming}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-3xl">{match.awayFlag}</span>
          <span className="text-xs font-semibold text-foreground/80 text-center leading-tight truncate w-full text-center">
            {match.awayTeam}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function MatchSimulator() {
  const { language } = useUiStore()
  const t = translations[language].simulator

  const { data, isLoading, isError } = useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
    refetchInterval: 30_000, // re-fetch every 30 s to pick up admin updates
  })

  const matches = data?.matches ?? []
  const finishedCount = matches.filter((m) => m.status === "finished").length
  const groups = [...new Set(matches.map((m) => m.groupName))].sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t.title}</h2>
            <p className="text-xs text-foreground/50">
              {isLoading
                ? "Cargando partidos…"
                : `${finishedCount}/${matches.length} ${t.subtitle}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {matches.length > 0 && (
        <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(finishedCount / matches.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          No se pudieron cargar los partidos. ¿Está el servidor activo?
        </div>
      )}

      {/* Matches by group */}
      {!isLoading && !isError && (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${GROUP_COLORS[group] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                  {t.group} {group}
                </div>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matches
                  .filter((m) => m.groupName === group)
                  .map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
              </div>
            </div>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-10 text-foreground/30 text-sm">
              No hay partidos programados todavía.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
