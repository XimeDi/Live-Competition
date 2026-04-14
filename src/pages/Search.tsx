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
import { getPlayers, getNationalities, getLeagues, getClubsByLeague } from '@/services/api/players'
import type { SearchFilters, Position, SortOption } from '@/types'
import { useSquadStore } from '@/store/useSquadStore'
import { useUiStore } from '@/store/useUiStore'
import { translations } from '@/lib/translations'
import { SigningCeremony } from '@/components/ui/SigningCeremony'
import { ScoutReportModal } from '@/components/ui/ScoutReportModal'
import { useSquadSync } from '@/hooks/useSquadSync'

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  DEF: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  MID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  FWD: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const SORT_LABELS_EN: Record<SortOption, string> = {
  rating_desc: 'Highest rating',
  rating_asc: 'Lowest rating',
  price_desc: 'Highest price',
  price_asc: 'Lowest price',
  name_asc: 'Name A-Z',
}

const SORT_LABELS_ES: Record<SortOption, string> = {
  rating_desc: 'Mayor media',
  rating_asc: 'Menor media',
  price_desc: 'Mayor precio',
  price_asc: 'Menor precio',
  name_asc: 'Nombre A-Z',
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  minRating: 0,
  maxPrice: 300,
  position: 'ALL',
  league: 'ALL',
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
    filters.league !== 'ALL' && filters.league,
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
  const leagues = getLeagues()
  const clubs = getClubsByLeague(filters.league)
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
            className={`h-11 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${sidebarOpen || activeFilterCount > 0
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filters.position === 'ALL' || !filters.position
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.position === pos
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
                    onValueChange={val => setFilters(prev => ({ ...prev, nationalities: (!val || val === 'ALL') ? [] : [val] }))}
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

                {/* League */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">{t.league}</label>
                  <Select
                    value={filters.league || 'ALL'}
                    onValueChange={val => setFilters(prev => ({ ...prev, league: (val === 'ALL' || !val) ? undefined : val, club: '' }))}
                  >
                    <SelectTrigger className="h-10 bg-background/60 border-border/60 rounded-xl text-sm">
                      <SelectValue placeholder={t.allLeagues} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      <SelectItem value="ALL">{t.allLeagues}</SelectItem>
                      {leagues.map(l => (
                        <SelectItem key={l} value={l} className="text-sm">{l}</SelectItem>
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
                  <div className={`relative w-full aspect-[2/3] rounded-[10%_10%_50%_50%_/_5%_5%_20%_20%] border-2 overflow-hidden bg-card/60 transition-all duration-500 ${player.rating >= 90
                      ? 'border-secondary/60 bg-gradient-to-b from-secondary/20 via-card/80 to-card'
                      : 'border-white/10 bg-gradient-to-b from-white/5 via-card/80 to-card'
                    }`}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out pointer-events-none" />

                    {/* Header Info (FIFA Style) */}
                    <div className="absolute top-[12%] left-[8%] flex flex-col items-center gap-0 leading-none z-10">
                      <span className={`text-4xl font-black italic font-oswald tracking-tighter ${player.rating >= 90 ? 'text-secondary' : 'text-white'}`}>
                        {player.rating}
                      </span>
                      <span className="text-[10px] font-bold font-barlow text-white/60 tracking-widest border-t border-white/20 pt-0.5 mt-0.5 uppercase">
                        {player.position}
                      </span>

                      {/* Flag */}
                      <div className="mt-2 w-8 h-5 rounded-[2px] overflow-hidden shadow-sm border border-white/10">
                        <img
                          src={`https://flagcdn.com/w80/${(player.nationality === 'England' ? 'gb-eng' : player.nationality === 'Scotland' ? 'gb-sct' : player.nationality === 'Wales' ? 'gb-wls' : player.nationality === 'Spain' ? 'es' : player.nationality === 'France' ? 'fr' : player.nationality === 'Germany' ? 'de' : player.nationality === 'Italy' ? 'it' : player.nationality === 'Brazil' ? 'br' : player.nationality === 'Argentina' ? 'ar' : player.nationality === 'Portugal' ? 'pt' : player.nationality === 'Netherlands' ? 'nl' : player.nationality === 'Belgium' ? 'be' : player.nationality === 'Norway' ? 'no' : player.nationality === 'Egypt' ? 'eg' : player.nationality === 'Morocco' ? 'ma' : player.nationality.substring(0, 2).toLowerCase())}.png`}
                          alt={player.nationality}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Club Logo */}
                      <div className="mt-2 w-7 h-7 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <img src={player.clubLogo} alt={player.club} className="max-w-full max-h-full object-contain" />
                      </div>

                      {/* League Logo */}
                      <div className="mt-1 w-5 h-5 flex items-center justify-center opacity-50 group-hover:opacity-80 transition-opacity">
                        <img src={player.leagueLogo} alt={player.league} className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>

                    {/* Player Image */}
                    <div className="absolute top-[8%] left-[25%] right-0 bottom-[30%] pointer-events-none overflow-hidden">
                      <motion.img
                        src={player.photo}
                        alt={player.name}
                        loading="lazy"
                        className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500 origin-bottom"
                      />
                    </div>

                    {/* Name & Details Section */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col items-center">
                      <h3 className="font-oswald italic font-bold text-lg text-white leading-tight uppercase tracking-tight text-center drop-shadow-md">
                        {player.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                        <span className="text-[9px] font-barlow font-bold uppercase tracking-[0.2em]">{player.club}</span>
                      </div>

                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

                      <div className="flex items-center justify-center gap-4 w-full px-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-barlow font-bold text-white/40 uppercase tracking-widest leading-none">Price</span>
                          <span className="text-xs font-black text-primary">${player.price}M</span>
                        </div>
                        <div className="w-px h-5 bg-white/10" />
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-barlow font-bold text-white/40 uppercase tracking-widest leading-none">League</span>
                          <span className="text-[10px] font-bold text-white/80">{player.league}</span>
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          if (budget >= player.price) handleSign(player)
                          else toast.error(errT.insubBudget)
                        }}
                        className={`w-full mt-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${budget >= player.price
                            ? 'bg-primary text-black hover:bg-primary/80 active:scale-95 shadow-[0_4px_10px_rgba(0,255,110,0.3)]'
                            : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                          }`}
                      >
                        {budget >= player.price ? t.sign : t.noBudget}
                      </button>
                    </div>

                    {player.rating >= 90 && (
                      <div className="absolute inset-0 pointer-events-none rounded-[10%_10%_50%_50%_/_5%_5%_20%_20%] ring-1 ring-secondary/40 group-hover:ring-secondary transition-all" />
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
