import { Link } from 'react-router-dom'
import { Plus, Trash2, Settings, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSquadStore, getPositionForIndex } from '@/store/useSquadStore'
import type { Formation } from '@/store/useSquadStore'
import { Button } from '@/components/ui/button'

export function SquadBuilder() {
  const { formation, players, budget, setFormation, removePlayer, getIsComplete } = useSquadStore()

  const defCount = parseInt(formation.split("-")[0])
  const midCount = parseInt(formation.split("-")[1])
  const fwdCount = parseInt(formation.split("-")[2])

  const getIndicesForLine = (start: number, count: number) => {
    return Array.from({ length: count }, (_, i) => start + i)
  }

  const lines = [
    { name: "FWD", indices: getIndicesForLine(1 + defCount + midCount, fwdCount) },
    { name: "MID", indices: getIndicesForLine(1 + defCount, midCount) },
    { name: "DEF", indices: getIndicesForLine(1, defCount) },
    { name: "GK", indices: [0] }
  ]

  const isComplete = getIsComplete()

  return (
    <div className="space-y-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic text-primary">Squad Builder</h1>
          <p className="text-muted-foreground">Manage your starting 11 for the upcoming matchweek.</p>
        </div>
        <div className="flex items-center gap-6 bg-card/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-primary/20 shadow-xl">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Budget Remaining</p>
            <p className={`text-2xl font-mono font-black ${budget < 10 ? 'text-destructive' : 'text-primary'}`}>
              ${budget.toFixed(1)}M
            </p>
          </div>
          <div className="h-10 w-px bg-border/50" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Squad Size</p>
            <p className="text-2xl font-mono font-black text-foreground">
              {players.filter(p => !!p).length}/11
            </p>
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
          <Card className="border-primary/20 shadow-2xl bg-card/40 backdrop-blur-xl overflow-hidden">
            <div className="bg-primary/10 px-4 py-2 border-b border-primary/20 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest">Tactical Setup</span>
            </div>
            <CardContent className="p-5 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formation</label>
                <Select value={formation} onValueChange={(val: string | null) => { if (val) setFormation(val as Formation) }}>
                  <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/50 transition-colors text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-3-3">4-3-3 Attack</SelectItem>
                    <SelectItem value="4-4-2">4-4-2 Balanced</SelectItem>
                    <SelectItem value="3-5-2">3-5-2 Defensive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground italic">
                  Note: Changing formation resets your field.
                </p>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Readiness</h4>
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div 
                      key="complete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">READY TO PLAY</p>
                        <p className="text-[10px] opacity-80">Your squad is eligible for submission.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="incomplete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500"
                    >
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">INCOMPLETE SQUAD</p>
                        <p className="text-[10px] opacity-80">Add {players.filter(p => !p).length} more players.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <Button 
            disabled={!isComplete}
            className={`w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl transition-all ${
              isComplete ? 'shadow-primary/25 hover:scale-[1.02] active:scale-95' : 'grayscale opacity-50'
            }`}
            onClick={() => window.location.href = '/profile'}
          >
            Submit Squad
          </Button>
        </motion.div>

        {/* Pitch Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border-8 border-border/80 shadow-[0_0_50px_rgba(0,0,0,0.5)] aspect-[3/4] sm:aspect-square md:aspect-[4/3] flex flex-col justify-around py-8 px-4 sm:px-12 bg-[#1a472a]">
            
            {/* Realistic Pitch Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a472a] via-[#2d5a27] to-[#1a472a]">
              {/* Grass Pattern */}
              <div 
                className="absolute inset-0 opacity-10" 
                style={{ 
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(255,255,255,0.1) 10%, rgba(255,255,255,0.1) 20%)`,
                  backgroundSize: '100% 100%'
                }} 
              />
            </div>
            
            {/* Pitch Markings */}
            <div className="absolute inset-0 pointer-events-none opacity-40 z-1">
              <div className="absolute inset-4 border-2 border-white/60 rounded-sm"></div>
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/60"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/60"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-24 border-x-2 border-b-2 border-white/60"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-10 border-x-2 border-b-2 border-white/60"></div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-24 border-x-2 border-t-2 border-white/60"></div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-10 border-x-2 border-t-2 border-white/60"></div>
            </div>

            {/* Players Layout */}
            {lines.map((line) => (
              <div key={line.name} className="flex justify-evenly relative z-10 w-full">
                {line.indices.map((index) => {
                  const player = players[index]
                  const expectedPos = getPositionForIndex(index, formation)
                  
                  return (
                    <motion.div 
                      key={index} 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring' as const, delay: index * 0.05 }}
                      className="flex flex-col items-center justify-center w-24 sm:w-28 relative group"
                    >
                      {player ? (
                        <div className="relative group/player">
                          {/* Glow effect for filled slot */}
                          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                          
                          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-card group-hover/player:scale-110 group-hover/player:-translate-y-2 transition-all duration-300">
                            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/player:opacity-100 flex items-center justify-center transition-opacity">
                               <button 
                                onClick={(e) => { e.preventDefault(); removePlayer(index); }}
                                className="bg-destructive text-destructive-foreground rounded-full p-2 hover:scale-110 transition-transform shadow-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="relative mt-3 text-center bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-2xl border border-white/20 transform group-hover/player:scale-105 transition-all">
                            <p className="text-[9px] sm:text-[10px] font-black leading-none text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-[100px]">
                              {player.name.split(' ').pop()}
                            </p>
                            <p className="text-[8px] font-bold text-primary mt-0.5 italic">
                              ${player.price}M
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Link 
                          to={`/search?add=${index}&pos=${expectedPos}`} 
                          className="relative flex flex-col items-center"
                        >
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 border-dashed border-white/40 flex items-center justify-center bg-white/5 hover:bg-white/20 hover:border-white hover:scale-110 transition-all duration-300 group/btn shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
                            <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-white/50 group-hover/btn:text-white group-hover/btn:rotate-90 transition-all duration-300" />
                          </div>
                          <div className="mt-3 text-center px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black text-white/90 bg-black/40 backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                            {expectedPos}
                          </div>
                        </Link>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ))}

          </div>
        </motion.div>
      </div>
    </div>
  )
}
