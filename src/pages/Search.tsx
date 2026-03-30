import { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search as SearchIcon, Filter, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { getPlayers, getNationalities } from '@/services/api/players'
import type { SearchFilters, Position } from '@/types'
import { useSquadStore } from '@/store/useSquadStore'
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"
import { SigningCeremony } from "@/components/ui/SigningCeremony"
import { ScoutReportModal } from "@/components/ui/ScoutReportModal"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  }
}

export function Search() {
  const [searchParams] = useSearchParams()
  const slotIndexStr = searchParams.get('add')
  const initialPos = searchParams.get('pos') as Position | 'ALL' || 'ALL'
  
  const { addPlayer, budget } = useSquadStore()
  const { language } = useUiStore()
  const t = translations[language].search
  const errT = translations[language].errors

  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minRating: 0,
    maxPrice: 300,
    position: initialPos,
    nationality: '',
    club: ''
  })

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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['players', filters],
    queryFn: ({ pageParam }) => getPlayers(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  const nationalities = getNationalities()
  const positions: Position[] = ['GK', 'DEF', 'MID', 'FWD']

  const handleSign = (player: any) => {
    if (slotIndexStr !== null) {
      const idx = parseInt(slotIndexStr)
      const error = addPlayer(idx, player)
      
      if (!error) {
        setSignedPlayer(player)
        setScoutPlayer(null)
      } else {
        toast.error(errT[error as keyof typeof errT] || error)
      }
    } else {
      toast.error(errT.selectSlot)
    }
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 200
      ) {
        if (hasNextPage && !isFetchingNextPage) {
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Stadium Background - Realistic and Subtle */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547619292-8816ee7cdd50?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.07] grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      <div className="container relative z-10 py-10">
        <SigningCeremony player={signedPlayer} onComplete={() => setSignedPlayer(null)} />
        <ScoutReportModal 
          player={scoutPlayer} 
          isOpen={!!scoutPlayer} 
          onClose={() => setScoutPlayer(null)} 
          onSign={handleSign}
          canSign={budget >= (scoutPlayer?.price || 0)}
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[6px] border-primary/10 mb-12 relative">
          <div className="absolute -bottom-[6px] left-0 w-24 h-[6px] bg-primary shadow-[0_0_20px_oklch(var(--primary))]" />
          <div>
            <div className="flex items-center gap-3 text-primary mb-3">
              <div className="h-1 w-6 bg-primary" />
              <span className="text-[10px] font-oswald font-black uppercase tracking-[0.5em]">{t.title}</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-oswald font-black uppercase tracking-tighter leading-[0.75] italic">
              SCOUTING <span className="text-primary italic">HUB</span>
            </h1>
          </div>
          <div className="bg-foreground/5 backdrop-blur-3xl px-8 py-5 rounded-3xl border border-white/10 flex flex-col items-end shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <p className="text-[10px] font-oswald font-black text-primary uppercase tracking-widest relative z-10">{t.budget}</p>
             <p className="text-5xl font-oswald font-black text-foreground italic relative z-10">${budget.toFixed(1)}M</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 h-fit">
            <div className="broadcast-glass rounded-[2rem] overflow-hidden">
              <div className="bg-primary px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Filter className="h-4 w-4 text-black" />
                   <span className="font-oswald font-black uppercase tracking-widest text-black text-xs">{t.filters}</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-black/40" />
              </div>
              
              <div className="p-8 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 font-barlow italic">Search Metadata</label>
                  <div className="relative group">
                    <SearchIcon className="absolute left-4 top-4 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder={t.searchPlaceholder}
                      className="pl-12 h-14 bg-black/20 border-white/5 font-barlow italic text-lg rounded-2xl focus:ring-primary focus:border-primary transition-all placeholder:text-foreground/10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 font-barlow italic">Position Tier</label>
                  <Select 
                    value={filters.position} 
                    onValueChange={(val: any) => setFilters(prev => ({...prev, position: val}))}
                  >
                    <SelectTrigger className="bg-black/20 border-white/5 h-14 font-oswald uppercase font-black italic rounded-2xl text-foreground/80">
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent className="broadcast-glass border-white/10 rounded-2xl">
                      <SelectItem value="ALL">{language === 'es' ? 'TODAS' : 'ALL'}</SelectItem>
                      {positions.map(pos => (
                         <SelectItem key={pos} value={pos} className="font-oswald font-black italic">{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 font-barlow italic">Nationality</label>
                  <Select 
                     value={filters.nationality || "ALL"} 
                     onValueChange={(val: string | null) => setFilters(prev => ({...prev, nationality: val === "ALL" || val === null ? undefined : val}))}
                  >
                    <SelectTrigger className="bg-black/20 border-white/5 h-14 font-oswald uppercase font-black italic rounded-2xl text-foreground/80">
                      <SelectValue placeholder="All Nations" />
                    </SelectTrigger>
                    <SelectContent className="broadcast-glass border-white/10 rounded-2xl">
                      <SelectItem value="ALL">{language === 'es' ? 'TODAS' : 'ALL'}</SelectItem>
                      {nationalities.map(n => (
                         <SelectItem key={n} value={n} className="font-oswald font-black italic">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-5 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 font-barlow italic">
                      {t.minOvr}
                    </label>
                    <span className="text-4xl font-oswald font-black text-primary italic">{filters.minRating === 0 ? t.any : filters.minRating}</span>
                  </div>
                  <Slider 
                    value={[filters.minRating]} 
                    max={99} 
                    step={1}
                    onValueChange={(vals) => setFilters(prev => ({...prev, minRating: (vals as number[])[0]}))}
                    className="py-4"
                  />
                </div>

                <div className="space-y-5 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 font-barlow italic">
                      {t.maxPrice}
                    </label>
                    <span className="text-4xl font-oswald font-black text-primary italic">${filters.maxPrice}M</span>
                  </div>
                  <Slider 
                    value={[filters.maxPrice]} 
                    max={300} 
                    step={5}
                    onValueChange={(vals) => setFilters(prev => ({...prev, maxPrice: (vals as number[])[0]}))}
                    className="py-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between px-6 py-4 bg-foreground/5 rounded-2xl border border-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-1 bg-primary shadow-[0_0_10px_oklch(var(--primary))]" />
                 <span className="text-xs font-oswald font-black uppercase tracking-[0.5em] text-primary italic">
                  {status === 'pending' ? 'ANALYZING MARKET...' : `${players.length} PROSPECTOS DETECTADOS`}
                 </span>
              </div>
            </div>

            {status === 'pending' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 {[1,2,3,4,5,6].map(i => (
                   <Skeleton key={i} className="h-96 w-full rounded-[2rem]" />
                 ))}
              </div>
            ) : status === 'error' ? (
              <div className="text-center p-12 border-4 border-destructive/20 rounded-[2.5rem] bg-destructive/5">
                  <h3 className="text-4xl font-oswald font-black text-destructive italic uppercase">Error</h3>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {players.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-20 border-4 border-dashed border-white/5 bg-card/10 rounded-[2.5rem] backdrop-blur-xl"
                  >
                    <Shield className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                    <h3 className="text-4xl font-oswald font-black uppercase italic tracking-tighter">{t.noResults}</h3>
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
                  >
                    {players.map(player => (
                      <motion.div 
                        key={player.id} 
                        variants={itemVariants} 
                        className="group"
                        onClick={() => setScoutPlayer(player)}
                      >
                        <div className={`panini-foil relative h-[32rem] rounded-[2.5rem] border-[4px] overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-4 cursor-pointer perspective-1000 ${
                           player.rating >= 90 
                            ? 'bg-gradient-to-b from-secondary/40 via-card/60 to-background border-secondary/40 shadow-secondary/10' 
                            : 'bg-gradient-to-b from-card/80 via-card/40 to-background border-white/10 hover:border-primary/50'
                         }`}>
                           {/* Stadium Ambient VFX */}
                           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547619292-8816ee7cdd50?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-soft-light opacity-20 transition-opacity duration-1000 group-hover:opacity-40" />
                           <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-white/5" />

                           {/* Rating & Position - Floating Broadcast Style */}
                           <div className="absolute top-10 left-10 z-20">
                              <div className="flex flex-col items-center">
                                <span className="text-7xl font-oswald font-black text-foreground italic tracking-tighter leading-none group-hover:text-primary transition-colors duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{player.rating}</span>
                                <div className="h-1.5 w-12 bg-primary mt-2 shadow-[0_0_15px_oklch(var(--primary))]" />
                                <span className="text-xs font-barlow font-black text-primary uppercase tracking-[0.3em] mt-2 italic">{player.position}</span>
                              </div>
                           </div>

                           {/* Nation Badge - Premium Glass Circle */}
                           <div className="absolute top-10 right-10 z-20">
                              <div className="w-12 h-12 rounded-full border border-white/20 bg-foreground/5 backdrop-blur-3xl flex items-center justify-center text-[11px] font-oswald font-black text-foreground/80 shadow-2xl">
                                {player.nationality.substring(0,3).toUpperCase()}
                              </div>
                           </div>

                           {/* Player Image - Cinematic High-Contrast */}
                           <div className="absolute inset-x-0 bottom-0 flex items-end justify-center h-[90%] pointer-events-none">
                              <motion.img 
                                src={player.photo} 
                                alt={player.name} 
                                className="h-full object-contain object-bottom drop-shadow-[0_30px_50px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-1000 z-10"
                                whileHover={{ y: -10 }}
                              />
                              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
                           </div>

                           {/* Name & Call to Action - Broadcast Lower Third Style */}
                           <div className="absolute bottom-0 inset-x-0 p-10 z-30">
                              <div className="relative overflow-hidden p-6 rounded-2xl bg-foreground/5 backdrop-blur-3xl border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors duration-500" />
                                <h3 className="text-4xl font-oswald font-black italic text-foreground uppercase tracking-tighter leading-none mb-3 group-hover:text-primary transition-colors">
                                  {player.name}
                                </h3>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-oswald font-black text-foreground/40 uppercase tracking-widest italic">Market Value</span>
                                    <span className="text-2xl font-oswald font-black text-foreground italic tracking-tighter">${player.price}M</span>
                                  </div>
                                  <Button 
                                    variant="secondary" 
                                    size="lg"
                                    className={`h-12 px-8 font-oswald font-black italic uppercase tracking-[0.2em] rounded-xl transition-all shadow-2xl ${
                                      budget >= player.price ? 'bg-primary text-black hover:scale-110' : 'bg-foreground/5 text-foreground/10 cursor-not-allowed'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (budget >= player.price) handleSign(player);
                                    }}
                                  >
                                    {budget >= player.price ? 'EXECUTE' : 'LOCKED'}
                                  </Button>
                                </div>
                              </div>
                           </div>
                         </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {isFetchingNextPage && (
              <div className="py-20 text-center">
                 <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
