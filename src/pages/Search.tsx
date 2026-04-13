import { useState, useEffect, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { getPlayers, getNationalities, getClubs } from '@/services/api/players'
import type { SearchFilters, Position, SortOption } from '@/types'
import { useSquadStore } from '@/store/useSquadStore'
import { useUiStore } from '@/store/useUiStore'
import { translations } from '@/lib/translations'
import { SigningCeremony } from '@/components/ui/SigningCeremony'
import { ScoutReportModal } from '@/components/ui/ScoutReportModal'
import { useSquadSync } from '@/hooks/useSquadSync'

const POSITION_COLORS: Record<string, string> = {
  GK:  'bg-amber-500/10 text-amber-500 border-amber-500/30',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  MID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const SORT_LABELS_EN: Record<SortOption, string> = {
  rating_desc: 'Highest rating',
  rating_asc:  'Lowest rating',
  price_desc:  'Highest price',
  price_asc:   'Lowest price',
  name_asc:    'Name A-Z',
}

const SORT_LABELS_ES: Record<SortOption, string> = {
  rating_desc: 'Mayor media',
  rating_asc:  'Menor media',
  price_desc:  'Mayor precio',
  price_asc:   'Menor precio',
  name_asc:    'Nombre A-Z',
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  minRating: 0,
  maxRating: 99,
  minPrice: 0,
  maxPrice: 300,
  position: 'ALL',
  nationalities: [],
  club: '',
  sortBy: 'rating_desc',
}

export function Search() {
  const [searchParams] = useSearchParams()
  const slotIndexStr = searchParams.get('add')
  const initialPos = searchParams.get('pos') as Position | 'ALL' || 'ALL'

  const { addPlayer, budget } = useSquadStore()
  const { language } = useUiStore()
  const syncSquad = useSquadSync()
  const t = translations[language].search
  const errT = translations[language].errors
  const sortLabels = language === 'es' ? SORT_LABELS_ES : SORT_LABELS_EN

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 250)
  const [filters, setFilters] = useState<SearchFilters>({ ...DEFAULT_FILTERS, position: initialPos })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [signedPlayer, setSignedPlayer] = useState<any | null>(null)
  const [scoutPlayer, setScoutPlayer] = useState<any | null>(null)

  useEffect(() => {
    setFilters(prev => ({ ...prev, query: debouncedSearch }))
  }, [debouncedSearch])

  useEffect(() => {
    if (initialPos && initialPos !== filters.position) {
      setFilters(prev => ({ ...prev, position: initialPos }))
    }
  }, [initialPos])

  const activeFilterCount = [
    filters.position !== 'ALL' && filters.position,
    filters.nationalities.length > 0,
    filters.club,
    filters.minRating > 0,
    filters.maxPrice < 300,
  ].filter(Boolean).length

  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setFilters({ ...DEFAULT_FILTERS, position: 'ALL' })
  }, [])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['players', filters],
    queryFn: ({ pageParam }) => getPlayers(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const nationalities = getNationalities()
  const clubs = getClubs()
  const positions: Position[] = ['GK', 'DEF', 'MID', 'FWD']

  const handleSign = (player: any) => {
    if (slotIndexStr !== null) {
      const idx = parseInt(slotIndexStr)
      const error = addPlayer(idx, player)
      if (!error) {
        setSignedPlayer(player)
        setScoutPlayer(null)
        syncSquad()
      } else {
        toast.error(errT[error as keyof typeof errT] || error)
      }
    } else {
      toast.error(errT.selectSlot)
    }
  }

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        if (hasNextPage && !isFetchingNextPage) {
          clearTimeout(id)
          id = setTimeout(() => fetchNextPage(), 80)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(id) }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const players = data?.pages.flatMap(page => page.data) || []
  const total = data?.pages[0]?.total ?? 0

  return (
    <div className="min-h-screen bg-background">
      <div className="h-1 w-full bg-gradient-to-r from-green-600 via-primary to-green-600" />

      <SigningCeremony player={signedPlayer} onComplete={() => setSignedPlayer(null)} />
      <ScoutReportModal
        player={scoutPlayer}
        isOpen={!!scoutPlayer}
        onClose={() => setScoutPlayer(null)}
        onSign={handleSign}
        canSign={budget >= (scoutPlayer?.price || 0)}
      />

      <div className="container py-8">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-foreground/50 mt-0.5">
              {status === 'success' ? `${total.toLocaleString()} ${t.prospects}` : '…'}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-2 text-sm self-start sm:self-auto">
            <span className="text-foreground/50">{t.budget}: </span>
            <span className="font-bold text-primary">${budget.toFixed(1)}M</span>
          </div>
        </div>

        {/* ── Search bar + sort + filter toggle ── */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <Input
              placeholder={t.searchPlaceholder}
              className="pl-10 h-11 bg-card/60 border-border/60 rounded-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <Select
            value={filters.sortBy}
            onValueChange={val => setFilters(prev => ({ ...prev, sortBy: val as SortOption }))}
          >
            <SelectTrigger className="h-11 w-auto min-w-[160px] bg-card/60 border-border/60 rounded-xl text-sm gap-2">
              <ChevronDown className="h-4 w-4 text-foreground/40 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-sm">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`h-11 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
              sidebarOpen || activeFilterCount > 0
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/60 bg-card/60 text-foreground/60 hover:text-foreground hover:border-border'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t.filters}
            {activeFilterCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="h-11 px-4 rounded-xl border border-border/60 text-sm text-foreground/50 hover:text-destructive hover:border-destructive/30 transition-all flex items-center gap-2"
            >
              <X className="h-3.5 w-3.5" /> {t.clearFilters}
            </button>
          )}
        </div>

        {/* ── Filter panel ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-border/60 bg-card/60 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Position */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{t.position}</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, position: 'ALL' }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        filters.position === 'ALL' || !filters.position
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'border-border/60 text-foreground/50 hover:border-border'
                      }`}
                    >
                      {t.allPositions}
                    </button>
                    {positions.map(pos => (
                      <button
                        key={pos}
                        onClick={() => setFilters(prev => ({ ...prev, position: pos }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          filters.position === pos
                            ? `${POSITION_COLORS[pos]} border-current`
                            : 'border-border/60 text-foreground/50 hover:border-border'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nationality */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{t.nationality}</label>
                  <Select
                    value={filters.nationalities[0] || 'ALL'}
                    onValueChange={val => setFilters(prev => ({ ...prev, nationalities: val === 'ALL' ? [] : [val as string] }))}
                  >
                    <SelectTrigger className="h-10 bg-background/60 border-border/60 rounded-xl text-sm">
                      <SelectValue placeholder={t.allNations} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      <SelectItem value="ALL">{t.allNations}</SelectItem>
                      {nationalities.map(n => (
                        <SelectItem key={n} value={n} className="text-sm">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Club */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{t.club}</label>
                  <Select
                    value={filters.club || 'ALL'}
                    onValueChange={val => setFilters(prev => ({ ...prev, club: val === 'ALL' ? '' : (val ?? '') }))}
                  >
                    <SelectTrigger className="h-10 bg-background/60 border-border/60 rounded-xl text-sm">
                      <SelectValue placeholder={t.allClubs} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      <SelectItem value="ALL">{t.allClubs}</SelectItem>
                      {clubs.map(c => (
                        <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating + Price */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{t.minOvr}</label>
                      <span className="text-xs font-bold text-primary">
                        {filters.minRating === 0 ? t.any : filters.minRating}
                      </span>
                    </div>
                    <Slider
                      value={[filters.minRating]}
                      max={99} min={0} step={1}
                      onValueChange={(vals) => setFilters(prev => ({ ...prev, minRating: (vals as number[])[0] }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{t.maxPrice}</label>
                      <span className="text-xs font-bold text-primary">${filters.maxPrice}M</span>
                    </div>
                    <Slider
                      value={[filters.maxPrice]}
                      max={300} min={0} step={5}
                      onValueChange={(vals) => setFilters(prev => ({ ...prev, maxPrice: (vals as number[])[0] }))}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        {status === 'pending' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : status === 'error' ? (
          <div className="text-center py-24">
            <p className="text-foreground/40 font-medium">Error.</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <SearchIcon className="h-10 w-10 mx-auto text-foreground/20" />
            <p className="font-semibold text-foreground/40">{t.noResults}</p>
            <p className="text-sm text-foreground/30">{t.noResultsSub}</p>
            <Button onClick={resetFilters} variant="outline" className="mt-4">
              {t.clearFilters}
            </Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i < 10 ? i * 0.03 : 0, duration: 0.2 }}
                  onClick={() => setScoutPlayer(player)}
                  className="group cursor-pointer"
                >
                  <div className={`relative rounded-2xl border overflow-hidden bg-card/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 ${
                    player.rating >= 90
                      ? 'border-secondary/40 bg-gradient-to-b from-secondary/5 to-transparent'
                      : 'border-border/60'
                  }`}>
                    {/* Rating badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <div className={`flex flex-col items-center leading-none px-2 py-1 rounded-lg ${
                        player.rating >= 90 ? 'bg-secondary/20 border border-secondary/40' : 'bg-black/30 border border-white/10'
                      }`}>
                        <span className={`text-xl font-black ${player.rating >= 90 ? 'text-secondary' : 'text-white'}`}>
                          {player.rating}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          player.rating >= 90 ? 'text-secondary/80' : 'text-white/60'
                        }`}>
                          {player.position}
                        </span>
                      </div>
                    </div>

                    {/* Nation */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white/70">
                          {player.nationality.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Player image */}
                    <div className="relative h-36 overflow-hidden bg-gradient-to-b from-muted/30 to-transparent">
                      <img
                        src={player.photo}
                        alt={player.name}
                        loading="lazy"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-32 object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3 pt-2 border-t border-border/30">
                      <p className="font-bold text-sm text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                        {player.name}
                      </p>
                      <p className="text-[10px] text-foreground/40 truncate mt-0.5">{player.club}</p>

                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${POSITION_COLORS[player.position]}`}>
                          {player.position}
                        </span>
                        <span className="text-sm font-black text-foreground">${player.price}M</span>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          if (budget >= player.price) handleSign(player)
                          else toast.error(errT.insubBudget)
                        }}
                        className={`w-full mt-2 h-8 rounded-lg text-xs font-bold transition-all ${
                          budget >= player.price
                            ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black'
                            : 'bg-foreground/5 text-foreground/20 border border-border/30 cursor-not-allowed'
                        }`}
                      >
                        {budget >= player.price ? t.sign : t.noBudget}
                      </button>
                    </div>

                    {player.rating >= 90 && (
                      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-secondary/30" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {isFetchingNextPage && (
          <div className="py-10 flex justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!hasNextPage && players.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-foreground/30">
              {t.noMoreResults.replace('{n}', players.length.toString())}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
