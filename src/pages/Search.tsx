import { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Filter, Plus, Shield } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { getPlayers, getNationalities, getClubs } from '@/services/api/players'
import { SearchFilters, Position } from '@/types'

export function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minRating: 0,
    position: 'ALL',
    nationality: '',
    club: ''
  })

  // Update query filter when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, query: debouncedSearch }))
  }, [debouncedSearch])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['players', filters],
    queryFn: ({ pageParam }) => getPlayers(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  // Setup options
  const nationalities = getNationalities()
  const clubs = getClubs()
  const positions: Position[] = ['GK', 'DEF', 'MID', 'FWD']

  // Handle infinite scroll trigger
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      // Very simple infinite scroll logic for bottom trigger
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 200
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          // Debounce scroll event fetching slightly
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            fetchNextPage()
          }, 100)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const players = data?.pages.flatMap(page => page.data) || []

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Player Search</h1>
          <p className="text-muted-foreground">Scout top talent for your fantasy squad.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="p-4 h-fit border-primary/10 shadow-lg bg-background/50 backdrop-blur-sm sticky top-24">
          <div className="space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <Filter className="h-4 w-4" /> Filters
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Player</label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Messi..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Select 
                value={filters.position} 
                onValueChange={(val: any) => setFilters(prev => ({...prev, position: val}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Positions</SelectItem>
                  {positions.map(pos => (
                     <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nationality</label>
              <Select 
                 value={filters.nationality || "ALL"} 
                 onValueChange={(val) => setFilters(prev => ({...prev, nationality: val === "ALL" ? "" : val}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Nations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Nations</SelectItem>
                  {nationalities.map(n => (
                     <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Rating: {filters.minRating === 0 ? 'Any' : filters.minRating}</label>
              <Slider 
                defaultValue={[0]} 
                max={99} 
                step={1}
                onValueChange={(vals) => setFilters(prev => ({...prev, minRating: vals[0]}))}
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {status === 'pending' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {[1,2,3,4,5,6].map(i => (
                 <Card key={i} className="overflow-hidden">
                   <CardContent className="p-0">
                     <div className="flex p-4 gap-4">
                       <Skeleton className="h-16 w-16 rounded-full" />
                       <div className="space-y-2 flex-1">
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-3 w-1/2" />
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </div>
          ) : status === 'error' ? (
            <div className="text-center p-8 text-destructive">
               Error loading players. Please try again later.
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {players.length} results
              </div>
              
              {players.length === 0 ? (
                <div className="text-center p-12 border rounded-xl border-dashed">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No players found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {players.map(player => (
                    <Card key={player.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <img 
                            src={player.photo} 
                            alt={player.name} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md bg-muted"
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg leading-tight">{player.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span className="font-medium bg-secondary text-secondary-foreground px-1.5 rounded">{player.position}</span>
                              <span className="truncate">{player.club}</span>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-sm">
                              <span className="flex items-center gap-1 font-semibold text-amber-500">
                                ⭐ {player.rating}
                              </span>
                              <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                ${player.price}M
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 bg-muted/30 border-t">
                        <Button variant="ghost" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <Plus className="h-4 w-4" /> Add to Squad
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
              
              {isFetchingNextPage && (
                <div className="py-4 text-center">
                   <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent align-[-0.125em]"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
