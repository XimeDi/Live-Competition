import { useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Trophy, Medal, Search, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getLeaderboard } from '@/services/api/leaderboard'
import { useAuthStore } from '@/store/useAuthStore'

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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300 drop-shadow-md" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600 drop-shadow-md" />
    return <span className="text-sm font-mono text-muted-foreground w-5 text-center">{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against managers worldwide.</p>
        </motion.div>
        <Button variant="outline" onClick={scrollToMe} className="gap-2 shadow-sm hover:shadow-md transition-all">
          <Search className="h-4 w-4" /> Find Me
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden bg-card/40 backdrop-blur-sm shadow-xl border-primary/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-4 px-6 font-bold w-20 uppercase tracking-wider text-muted-foreground">Rank</th>
                <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-muted-foreground">Manager</th>
                <th className="text-right py-4 px-6 font-bold uppercase tracking-wider text-muted-foreground">Points</th>
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
                    <tr key={i} className="border-b opacity-50">
                      <td className="py-4 px-6"><Skeleton className="h-5 w-8" /></td>
                      <td className="py-4 px-6"><Skeleton className="h-5 w-48" /></td>
                      <td className="py-4 px-6 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : status === 'error' ? (
                  <tr>
                    <td colSpan={3} className="text-center py-16 text-destructive">
                      Failed to load leaderboard. Please try again.
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
                        className={`border-b transition-all duration-300 group ${
                          isMe
                            ? 'bg-primary/15 border-primary/40'
                            : 'hover:bg-primary/5'
                        } ${entry.rank <= 3 ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : ''}`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">{getRankIcon(entry.rank)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 ${
                              isMe ? 'border-primary bg-primary text-primary-foreground' : 'border-muted bg-muted text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors'
                            }`}>
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className={`font-semibold ${isMe ? 'text-primary' : 'text-foreground'}`}>
                                {entry.username}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-tight">Manager</span>
                            </div>
                            {isMe && (
                              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold ml-1">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-mono text-lg font-black ${isMe ? 'text-primary' : 'text-foreground opacity-90'}`}>
                            {entry.points.toLocaleString()}
                          </span>
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
          <div className="p-6 text-center border-t bg-muted/10">
            <Button
              variant="ghost"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all px-8 border border-primary/20"
            >
              {isFetchingNextPage ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {isFetchingNextPage ? 'Loading More Players...' : 'Load Next 20 Managers'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
