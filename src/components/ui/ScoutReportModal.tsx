import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Shield, Target, Activity, Flame } from 'lucide-react'
import { Button } from './button'

interface Player {
  id: number
  name: string
  photo: string
  rating: number
  club: string
  nationality: string
  position: string
  price: number
}

interface ScoutReportModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  onSign?: (player: Player) => void
  canSign?: boolean
}

export function ScoutReportModal({ player, isOpen, onClose, onSign, canSign }: ScoutReportModalProps) {
  if (!player) return null

  // Mock stats based on rating for visual impact - Broadcast Style
  const stats = [
    { label: "SPEED", value: Math.floor(player.rating * 0.95), icon: Zap },
    { label: "SHOOTING", value: Math.floor(player.rating * 0.92), icon: Target },
    { label: "PASSING", value: Math.floor(player.rating * 0.88), icon: Activity },
    { label: "DRIBBLING", value: Math.floor(player.rating * 0.94), icon: Flame },
    { label: "DEFENSE", value: Math.floor(player.rating * 0.4), icon: Shield },
    { label: "PHYSICAL", value: Math.floor(player.rating * 0.85), icon: Activity },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 translate-z-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-5xl bg-card/60 rounded-[3rem] border-2 border-white/10 overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)]"
          >
            <div className="flex flex-col md:flex-row h-full min-h-[600px]">
              {/* Left: Player Visual - Immersive Stadium Feel */}
              <div className="relative w-full md:w-[45%] h-80 md:h-auto bg-gradient-to-b from-primary/10 to-black/40 overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:scale-110 transition-transform duration-1000" />
                 
                 <img 
                  src={player.photo} 
                  alt={player.name} 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[85%] object-contain object-bottom z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,1)] transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute top-10 left-10 z-20">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-9xl font-oswald font-black text-white italic tracking-tighter leading-none">
                      {player.rating}
                    </p>
                    <div className="h-2 w-16 bg-primary mt-2" />
                    <p className="text-3xl font-oswald font-black text-primary uppercase tracking-[0.4em] italic mt-2">{player.position}</p>
                  </motion.div>
                </div>

                <div className="absolute top-10 right-10 z-20">
                   <div className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/5 backdrop-blur-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                    <span className="text-xl font-oswald font-black uppercase tracking-tighter text-white/80">{player.nationality.substring(0,3).toUpperCase()}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent z-[5]" />
              </div>

              {/* Right: Scout Data - Clean Broadcast Layout */}
              <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto max-h-[70vh] md:max-h-none relative">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <div className="h-0.5 w-10 bg-primary" />
                       <span className="text-[11px] font-black font-barlow text-primary uppercase tracking-[0.6em] italic">TECHNICAL REPORT // FIFA 26</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-oswald font-black italic text-white uppercase tracking-tighter leading-[0.9] mb-1 drop-shadow-2xl">
                      {player.name}
                    </h2>
                    <p className="text-white/40 font-oswald font-black text-base uppercase tracking-[0.5em] italic">{player.club}</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-4 hover:bg-white/10 rounded-full transition-all group -mt-4 -mr-4"
                  >
                    <X className="h-8 w-8 text-white/20 group-hover:text-white group-hover:rotate-90 transition-all" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={stat.label} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="space-y-4"
                    >
                       <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-primary/80">
                          <stat.icon className="h-4 w-4" />
                          <span className="text-xs font-black font-oswald uppercase tracking-widest italic">{stat.label}</span>
                        </div>
                        <span className={`text-3xl font-oswald font-black italic ${stat.value >= 90 ? 'text-secondary' : 'text-white'}`}>{stat.value}</span>
                       </div>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 flex items-center px-[2px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 1.5, delay: 0.5 + (0.1 * i), ease: "easeOut" }}
                            className={`h-[4px] rounded-full shadow-[0_0_15px_oklch(var(--primary))] ${stat.value >= 90 ? 'bg-secondary' : 'bg-primary'}`}
                          />
                       </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-end justify-between pt-12 border-t border-white/10 relative z-10">
                   <div>
                      <p className="text-[11px] font-black font-barlow uppercase tracking-[0.5em] text-white/30 mb-3 italic">MARKET VALUE</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl md:text-6xl font-oswald font-black text-white italic tracking-tighter leading-none">${player.price}</p>
                        <p className="text-2xl font-oswald font-black text-primary italic">MILLION</p>
                      </div>
                   </div>
                   {onSign && (
                     <Button 
                      size="lg" 
                      className={`h-16 md:h-20 px-12 font-oswald font-black italic text-xl md:text-2xl uppercase tracking-wider rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl ${
                        canSign 
                        ? 'bg-primary text-black hover:shadow-[0_20px_60px_oklch(var(--primary)/0.4)]' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                      }`}
                      onClick={() => canSign && onSign(player)}
                    >
                      {canSign ? 'CONTRACT PLAYER' : 'INSUFFICIENT FUNDS'}
                    </Button>
                   )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
