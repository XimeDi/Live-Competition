import { useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Trophy, Medal, Search, ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getLeaderboard } from '@/services/api/leaderboard'
import { useAuthStore } from '@/store/useAuthStore'

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
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-mono text-muted-foreground w-5 text-center">{rank}</span>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against managers worldwide.</p>
        </div>
        <Button variant="outline" onClick={scrollToMe} className="gap-2">
          <Search className="h-4 w-4" /> Find Me
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden bg-background/50 backdrop-blur-sm shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 font-semibold w-16">Rank</th>
              <th className="text-left py-3 px-4 font-semibold">Manager</th>
              <th className="text-right py-3 px-4 font-semibold">Points</th>
            </tr>
          </thead>
          <tbody>
            {status === 'pending' ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3 px-4"><Skeleton className="h-5 w-8" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-5 w-40" /></td>
                  <td className="py-3 px-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : status === 'error' ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-destructive">
                  Failed to load leaderboard. Please try again.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isMe = user?.username === entry.username || user?.id === entry.userId
                return (
                  <tr
                    key={entry.userId}
                    ref={isMe ? myRowRef : undefined}
                    className={`border-b transition-colors ${
                      isMe
                        ? 'bg-primary/10 border-primary/30 font-semibold'
                        : 'hover:bg-muted/30'
                    } ${entry.rank <= 3 ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">{getRankIcon(entry.rank)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <span className={isMe ? 'text-primary' : ''}>{entry.username}</span>
                        {isMe && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold">{entry.points.toLocaleString()}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {hasNextPage && (
          <div className="p-4 text-center border-t">
            <Button
              variant="ghost"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="gap-2"
            >
              {isFetchingNextPage ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
