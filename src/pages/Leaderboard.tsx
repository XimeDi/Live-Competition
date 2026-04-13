import { useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Trophy, Search, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getLeaderboard } from '@/services/api/leaderboard'
import { useAuthStore } from '@/store/useAuthStore'
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
}

const rowVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  }
}

export function Leaderboard() {
  const { user } = useAuthStore()
  const { language } = useUiStore()
  const scoringT = translations[language].scoring
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

  const entries = data?.pages.flatMap((page) => page.data) ?? []


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Stadium Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="container relative z-10 py-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-primary/20 pb-8">
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <Trophy className="h-4 w-4" />
              <span className="text-[10px] font-oswald font-black uppercase tracking-[0.4em]">Global Standings // FIFA 2026</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-oswald font-black tracking-tighter uppercase italic leading-[0.8]">
              WORLD <span className="text-primary italic">RANKING</span>
            </h1>
          </motion.div>
          <Button 
            variant="outline" 
            onClick={scrollToMe} 
            className="h-14 px-10 font-oswald font-black uppercase tracking-widest border-2 border-primary/20 hover:bg-primary hover:text-black transition-all gap-3 bg-card/40 backdrop-blur-xl rounded-xl"
          >
            <Search className="h-4 w-4" /> FIND MY SQUAD
          </Button>
        </div>

        {/* F4.3 — scoring rules visible */}
        <div className="rounded-3xl border-2 border-white/5 bg-card/30 backdrop-blur-3xl p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-oswald font-black uppercase tracking-widest italic text-lg text-foreground">{scoringT.title}</h2>
              <p className="text-sm text-muted-foreground font-barlow font-bold mt-1">
                {scoringT.win} · {scoringT.draw} · {scoringT.loss}
              </p>
            </div>
            <div className="text-[10px] font-black font-barlow uppercase tracking-[0.4em] text-foreground/30">
              Team result → player nationality → points
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border-2 border-white/5 overflow-hidden bg-foreground/5 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary border-b-2 border-black/10">
                  <th className="text-left py-6 px-12 font-oswald font-black uppercase tracking-widest text-black italic text-xs">Pos</th>
                  <th className="text-left py-6 px-12 font-oswald font-black uppercase tracking-widest text-black italic text-xs">Manager</th>
                  <th className="text-right py-6 px-12 font-oswald font-black uppercase tracking-widest text-black italic text-xs">Rating Points</th>
                </tr>
              </thead>
              <AnimatePresence mode="popLayout">
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {status === 'pending' ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5 opacity-50">
                        <td className="py-8 px-12"><Skeleton className="h-10 w-10 rounded-lg" /></td>
                        <td className="py-8 px-12"><Skeleton className="h-10 w-64 rounded-lg" /></td>
                        <td className="py-8 px-12 text-right"><Skeleton className="h-10 w-24 ml-auto rounded-lg" /></td>
                      </tr>
                    ))
                  ) : status === 'error' ? (
                    <tr>
                      <td colSpan={3} className="text-center py-32">
                        <h3 className="text-4xl font-oswald font-black text-destructive italic uppercase">Connection Lost</h3>
                        <p className="font-barlow font-bold opacity-70">Server synchronization failed.</p>
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => {
                      const isMe = user?.username === entry.username || user?.id === entry.userId
                      return (
                        <motion.tr
                          key={entry.userId}
                          variants={rowVariants}
                          // @ts-ignore - ref on motion component
                          ref={isMe ? myRowRef : undefined}
                          className={`transition-all duration-300 group border-b border-white/5 ${
                            isMe
                              ? 'bg-primary/20 relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-2 after:bg-primary'
                              : 'hover:bg-foreground/5'
                          }`}
                        >
                          <td className="py-8 px-12">
                            <div className="flex items-center text-4xl font-oswald font-black italic">
                              {entry.rank <= 3 ? (
                                <div className="flex items-center gap-4">
                                  <span className={entry.rank === 1 ? 'text-secondary' : entry.rank === 2 ? 'text-slate-300' : 'text-amber-600'}>
                                    {entry.rank.toString().padStart(2, '0')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-foreground/20 group-hover:text-primary/60 transition-colors">
                                  {entry.rank.toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-8 px-12">
                            <div className="flex items-center gap-8">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-oswald font-black shrink-0 border-2 transition-all duration-500 ${
                                isMe ? 'border-primary bg-primary text-black' : 'border-white/10 bg-foreground/5 text-foreground/40 group-hover:border-primary/40'
                              }`}>
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-3xl font-oswald font-black uppercase tracking-tighter italic ${isMe ? 'text-primary' : 'text-foreground'}`}>
                                  {entry.username}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`h-2 w-2 rounded-full ${isMe ? 'bg-primary' : 'bg-emerald-500'} animate-pulse`} />
                                  <span className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em]">Verified Manager</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-8 px-12 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-5xl font-oswald font-black italic tracking-tighter ${isMe ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                                {entry.points.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mt-1 italic">World Pts</span>
                            </div>
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
            <div className="p-12 text-center border-t border-white/5 bg-black/20">
              <Button
                variant="ghost"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-16 px-16 font-oswald font-black uppercase tracking-[0.3em] italic border-2 border-primary/20 hover:bg-primary hover:text-black transition-all shadow-2xl group/btn rounded-2xl"
              >
                {isFetchingNextPage ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-r-transparent" />
                ) : (
                  <div className="flex items-center gap-4">
                    <ArrowDown className="h-5 w-5 group-hover/btn:translate-y-1 transition-transform text-primary" />
                    Load More Rankings
                  </div>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
