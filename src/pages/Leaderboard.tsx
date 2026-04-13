import { useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Trophy, Search, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getLeaderboard } from '@/services/api/leaderboard'
import { useAuthStore } from '@/store/useAuthStore'
import { useUiStore } from '@/store/useUiStore'
import { translations } from '@/lib/translations'

const MEDAL_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-amber-400/10 border-amber-400/30',  text: 'text-amber-400',  label: '🥇' },
  2: { bg: 'bg-slate-300/10 border-slate-300/30',  text: 'text-slate-300',  label: '🥈' },
  3: { bg: 'bg-amber-700/10 border-amber-600/30',  text: 'text-amber-600',  label: '🥉' },
}

export function Leaderboard() {
  const { user } = useAuthStore()
  const { language } = useUiStore()
  const t = translations[language].leaderboard
  const myRowRef = useRef<HTMLTableRowElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['leaderboard'],
    queryFn: ({ pageParam }) => getLeaderboard(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const scrollToMe = useCallback(() => {
    myRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const entries = data?.pages.flatMap(page => page.data) ?? []
  const top3 = entries.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 w-full bg-gradient-to-r from-green-600 via-primary to-green-600" />

      <div className="container py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest">{t.worldRanking}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-foreground/50 mt-0.5">{t.subtitle}</p>
          </div>
          <Button
            variant="outline"
            onClick={scrollToMe}
            className="h-10 px-5 font-semibold text-sm border-primary/30 hover:bg-primary hover:text-black transition-all gap-2 self-start sm:self-auto"
          >
            <Search className="h-4 w-4" /> {t.findMe}
          </Button>
        </div>

        {/* ── Podium top 3 ── */}
        {status === 'success' && top3.length === 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {/* 2nd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl border p-4 text-center flex flex-col items-center gap-2 ${MEDAL_STYLES[2].bg}`}
            >
              <span className="text-2xl sm:text-3xl">🥈</span>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-foreground/10 flex items-center justify-center">
                <span className="font-black text-lg sm:text-xl text-foreground/60">
                  {top3[1].username.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-foreground truncate max-w-full">{top3[1].username}</p>
              <p className={`font-black text-base sm:text-lg ${MEDAL_STYLES[2].text}`}>{top3[1].points.toLocaleString()}</p>
              <p className="text-[9px] text-foreground/30 uppercase tracking-wider">{t.pts}</p>
            </motion.div>

            {/* 1st */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className={`rounded-2xl border p-4 text-center flex flex-col items-center gap-2 -mt-4 sm:-mt-6 ${MEDAL_STYLES[1].bg} shadow-lg shadow-amber-400/10`}
            >
              <span className="text-3xl sm:text-4xl">🥇</span>
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                <span className="font-black text-xl sm:text-2xl text-amber-400">
                  {top3[0].username.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-bold text-sm text-foreground truncate max-w-full">{top3[0].username}</p>
              <p className={`font-black text-xl sm:text-2xl ${MEDAL_STYLES[1].text}`}>{top3[0].points.toLocaleString()}</p>
              <p className="text-[9px] text-foreground/30 uppercase tracking-wider">{t.pts}</p>
            </motion.div>

            {/* 3rd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`rounded-2xl border p-4 text-center flex flex-col items-center gap-2 ${MEDAL_STYLES[3].bg}`}
            >
              <span className="text-2xl sm:text-3xl">🥉</span>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-foreground/10 flex items-center justify-center">
                <span className="font-black text-lg sm:text-xl text-amber-700">
                  {top3[2].username.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-foreground truncate max-w-full">{top3[2].username}</p>
              <p className={`font-black text-base sm:text-lg ${MEDAL_STYLES[3].text}`}>{top3[2].points.toLocaleString()}</p>
              <p className="text-[9px] text-foreground/30 uppercase tracking-wider">{t.pts}</p>
            </motion.div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-foreground/[0.03]">
                  <th className="text-left py-4 px-5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.rank}</th>
                  <th className="text-left py-4 px-5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.manager}</th>
                  <th className="text-right py-4 px-5 text-[10px] font-semibold text-foreground/40 uppercase tracking-widest">{t.points}</th>
                </tr>
              </thead>
              <AnimatePresence mode="popLayout">
                <motion.tbody>
                  {status === 'pending' ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-5 px-5"><Skeleton className="h-8 w-8 rounded-lg" /></td>
                        <td className="py-5 px-5"><Skeleton className="h-8 w-48 rounded-lg" /></td>
                        <td className="py-5 px-5 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-lg" /></td>
                      </tr>
                    ))
                  ) : status === 'error' ? (
                    <tr>
                      <td colSpan={3} className="text-center py-16 text-foreground/40 text-sm">{t.error}</td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => {
                      const isMe = user?.username === entry.username || user?.id === entry.userId
                      const medal = MEDAL_STYLES[entry.rank]
                      return (
                        <motion.tr
                          key={entry.userId}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                          // @ts-ignore
                          ref={isMe ? myRowRef : undefined}
                          className={`border-b border-border/30 transition-colors group ${
                            isMe ? 'bg-primary/10 border-primary/20' : 'hover:bg-foreground/[0.03]'
                          }`}
                        >
                          <td className="py-4 px-5">
                            {medal ? (
                              <span className="text-xl">{medal.label}</span>
                            ) : (
                              <span className={`text-lg font-black tabular-nums ${
                                isMe ? 'text-primary' : 'text-foreground/30 group-hover:text-foreground/50'
                              }`}>
                                {entry.rank.toString().padStart(2, '0')}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-base font-black border transition-all ${
                                isMe
                                  ? 'bg-primary/20 border-primary/40 text-primary'
                                  : 'bg-foreground/5 border-border/40 text-foreground/40 group-hover:border-border/60'
                              }`}>
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className={`font-semibold ${isMe ? 'text-primary' : 'text-foreground'}`}>
                                  {entry.username}
                                  {isMe && <span className="ml-2 text-[10px] text-primary/60 font-normal">{t.you}</span>}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[10px] text-foreground/30">{t.verifiedManager}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span className={`text-xl font-black tabular-nums ${
                              isMe ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'
                            }`}>
                              {entry.points.toLocaleString()}
                            </span>
                            <p className="text-[10px] text-foreground/30 mt-0.5">{t.pts}</p>
                          </td>
                        </motion.tr>
                      )
                    })
                  )}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>

          {hasNextPage && (
            <div className="p-6 text-center border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-10 px-8 font-semibold text-sm gap-2 hover:bg-primary hover:text-black hover:border-primary transition-all"
              >
                {isFetchingNextPage ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <><ArrowDown className="h-4 w-4" /> {t.loadMore}</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
