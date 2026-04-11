import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Plus, Trash2, Settings, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CardContent } from '@/components/ui/card'
import { useSquadStore, getPositionForIndex, GET_POSITION_COORDS } from '@/store/useSquadStore'
import type { Formation } from '@/store/useSquadStore'
import { Button } from '@/components/ui/button'
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"
import { useAuthStore } from "@/store/useAuthStore"

const FORMATIONS: Formation[] = ["4-3-3", "4-4-2", "3-5-2"]

export function SquadBuilder() {
  const { formation, players, budget, setFormation, removePlayer, getIsComplete, syncToBackend } = useSquadStore()
  const { language } = useUiStore()
  const t = translations[language].squad
  const { token } = useAuthStore()

  const isComplete = getIsComplete()

  // Auto-save squad to backend whenever it changes (F3.7).
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!token) return
    void syncToBackend(token)
  }, [players, formation, token, syncToBackend])

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Settings className="h-4 w-4 animate-spin-slow" />
            <span className="text-[10px] font-bold font-barlow uppercase tracking-[0.2em]">{t.title}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-oswald font-black tracking-tighter uppercase italic leading-[0.8] mb-2">
            SQUAD <span className="text-primary italic">BUILDER</span>
          </h1>
          <p className="font-barlow text-lg text-muted-foreground italic">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-4 bg-card/40 backdrop-blur-xl p-1 rounded-2xl border border-white/5 shadow-2xl overflow-hidden stadium-glow">
          <div className="px-6 py-3 bg-background/40 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest font-bold font-barlow text-muted-foreground mb-1">{t.budget}</p>
            <div className="flex items-baseline gap-1">
              <p className={`text-4xl font-oswald font-bold ${budget < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                ${budget.toFixed(1)}
              </p>
              <span className="text-sm font-oswald font-bold text-muted-foreground">M</span>
            </div>
          </div>
          <div className="px-6 py-3 bg-background/40 rounded-xl border border-white/5 min-w-[140px]">
            <p className="text-[10px] uppercase tracking-widest font-bold font-barlow text-muted-foreground mb-1">{t.slots}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-oswald font-bold text-foreground">
                {players.filter(p => !!p).length}
                <span className="text-foreground/20">/</span>
                11
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Tactics Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 lg:sticky lg:top-24"
        >
          <div className="fifa-card bg-card/60 stadium-glow">
            <div className="bg-primary/20 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-xs font-oswald font-bold uppercase tracking-widest">{t.formation}</span>
              </div>
              <div className="text-[10px] font-bold font-barlow text-primary px-2 py-0.5 rounded bg-primary/20">{formation}</div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold font-barlow uppercase tracking-widest text-muted-foreground">{t.formation}</label>
                <div className="grid grid-cols-1 gap-2">
                  {FORMATIONS.map((f) => (
                    <Button 
                      key={f}
                      variant="outline"
                      onClick={() => setFormation(f)}
                      className={`h-12 font-oswald text-lg transition-all ${formation === f ? 'bg-primary text-black border-primary scale-105' : 'bg-background/40 text-muted-foreground border-white/5'}`}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-bold font-barlow uppercase tracking-widest text-muted-foreground mb-4">{t.status}</h4>
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div 
                      key="complete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                    >
                      <CheckCircle2 className="h-6 w-6 shrink-0" />
                      <div>
                        <p className="text-xs font-oswald font-bold uppercase tracking-widest">{t.ready?.split(' ')[0]}</p>
                        <p className="text-[10px] font-barlow font-bold opacity-70 uppercase">{t.ready}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="incomplete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                    >
                      <AlertCircle className="h-6 w-6 shrink-0" />
                      <div>
                        <p className="text-xs font-oswald font-bold uppercase tracking-widest">{t.incomplete}</p>
                        <p className="text-[10px] font-barlow font-bold opacity-70 uppercase">{t.needMore} ({11 - players.filter(p => !!p).length})</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 perspective-1000"
        >
          <div className="relative w-full max-w-4xl mx-auto rounded-[3rem] overflow-hidden border-[12px] border-[#0a2514] shadow-[0_60px_120px_rgba(0,0,0,0.8)] aspect-[4/5] sm:aspect-square md:aspect-[4/3] pitch-grass pitch-3d">
            {/* Pitch Markings SVG - Ultra Clean Broadcast Style */}
            <div className="absolute inset-0 pointer-events-none opacity-30 z-[1]">
              <svg viewBox="0 0 1000 1333" className="w-full h-full fill-none stroke-white stroke-[3]">
                <rect x="50" y="50" width="900" height="1233" rx="4" />
                <line x1="50" y1="666.5" x2="950" y2="666.5" />
                <circle cx="500" cy="666.5" r="95" />
                <circle cx="500" cy="666.5" r="3" fill="white" />
                <rect x="250" y="50" width="500" height="180" />
                <rect x="380" y="50" width="240" height="60" />
                <path d="M 420 230 A 100 80 0 0 0 580 230" />
                <rect x="250" y="1103" width="500" height="180" />
                <rect x="380" y="1223" width="240" height="60" />
                <path d="M 420 1103 A 100 80 0 0 1 580 1103" />
                <circle cx="500" cy="1153" r="3" fill="white" />
                <circle cx="500" cy="180" r="3" fill="white" />
              </svg>
            </div>

            {/* Players Layout - Absolute Positioning */}
            {players.map((player, index) => {
              const expectedPos = getPositionForIndex(index, formation)
              const coords = GET_POSITION_COORDS(formation, index)
              
              return (
                <motion.div 
                  key={index} 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 120, damping: 14, delay: index * 0.05 }}
                  className="absolute z-10 w-20 sm:w-28 flex flex-col items-center"
                  style={{ 
                    left: coords.x, 
                    top: coords.y, 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  {player ? (
                    <div className="relative group/player">
                      <div className={`absolute inset-0 blur-3xl rounded-full scale-150 transition-all duration-1000 ${
                        player.rating > 85 ? 'bg-secondary/40' : 'bg-primary/20'
                      }`} />
                      
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-br from-white/40 via-primary/60 to-transparent shadow-[0_20px_40px_rgba(0,0,0,0.9)] group-hover/player:scale-110 group-hover/player:-translate-y-4 transition-all duration-700 ring-4 ring-black/60">
                        <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white relative">
                          <img src={player.photo} alt={player.name} className="w-full h-full object-contain object-bottom pt-2" />
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/player:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                             <button 
                              onClick={(e) => { e.preventDefault(); removePlayer(index); }}
                              className="bg-destructive text-foreground rounded-full p-3 hover:bg-rose-500 hover:scale-125 transition-all shadow-2xl"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        {/* Rating Badge - Broadcast Circle */}
                        <div className={`absolute -top-2 -right-2 font-oswald font-black text-xs sm:text-sm w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-[3px] border-white shadow-2xl z-20 ${
                           player.rating >= 90 ? 'bg-secondary text-black' : 'bg-primary text-black'
                        }`}>
                          {player.rating}
                        </div>
                      </div>
                      
                      <div className="relative mt-4 text-center">
                        <div className="bg-black/90 backdrop-blur-3xl px-4 py-1.5 rounded-xl border border-white/20 shadow-2xl transform group-hover/player:scale-110 transition-all border-b-[4px] border-primary">
                          <p className="text-[10px] sm:text-[12px] font-oswald font-black uppercase tracking-widest text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-[120px] italic">
                            {player.name.split(' ').pop()}
                          </p>
                          <p className="text-[8px] sm:text-[9px] font-black font-barlow text-primary/80 leading-none mt-1 uppercase tracking-[0.2em]">
                            ${player.price}M
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      to={`/search?add=${index}&pos=${expectedPos}`} 
                      className="relative flex flex-col items-center group/btn"
                    >
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-black/40 hover:bg-primary/30 hover:border-primary/60 hover:scale-110 transition-all duration-700 shadow-2xl overflow-hidden panini-foil">
                         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                        <Plus className="h-6 w-6 sm:h-10 sm:w-10 text-foreground/30 group-hover:text-primary transition-all duration-700 relative z-10" />
                      </div>
                      <div className="mt-3 px-5 py-1.5 rounded-full text-[9px] sm:text-[11px] font-oswald font-black text-foreground bg-black/80 backdrop-blur-md border border-white/10 uppercase tracking-[0.3em] group-hover:text-primary group-hover:border-primary/60 transition-all shadow-xl italic">
                        {expectedPos}
                      </div>
                    </Link>
                  )}
                </motion.div>
              )
            })}

            {/* Tactical Broadcast Overlay - Premium Scoreboard Style */}
            <div className="absolute top-8 left-10 hidden md:block z-20">
              <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-card/40 backdrop-blur-3xl border-l-[6px] border-primary px-6 py-4 rounded-r-2xl shadow-2xl relative overflow-hidden group"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_oklch(var(--primary))]" />
                    <p className="text-[9px] font-black font-barlow text-primary uppercase tracking-[0.5em] italic">STADIUM BROADCAST // LIVE</p>
                  </div>
                  <h3 className="text-3xl font-oswald font-black uppercase tracking-tighter text-foreground italic group-hover:scale-105 transition-transform origin-left">
                    {formation} <span className="text-foreground/40">TACTICAL</span>
                  </h3>
                  <div className="flex items-center gap-6 mt-3">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em]">Efficiency</span>
                        <div className="h-1 bg-foreground/5 rounded-full mt-1.5 overflow-hidden border border-white/5">
                           <div className="h-full bg-primary w-[82%] shadow-[0_0_10px_oklch(var(--primary))]" />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
