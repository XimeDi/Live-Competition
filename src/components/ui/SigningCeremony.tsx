import { motion, AnimatePresence } from 'framer-motion'
import { Star, Zap } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

interface Player {
  id: string
  name: string
  photo: string
  rating: number
  club: string
  clubLogo?: string
  league?: string
  leagueLogo?: string
  nationality: string
  position: string
}

interface SigningCeremonyProps {
  player: Player | null
  onComplete: () => void
}

export function SigningCeremony({ player, onComplete }: SigningCeremonyProps) {
  const [stage, setStage] = useState<'idle' | 'lights' | 'signature' | 'reveal'>('idle')

  useEffect(() => {
    if (player) {
      setStage('lights')
      const t1 = setTimeout(() => setStage('signature'), 1000)
      const t2 = setTimeout(() => setStage('reveal'), 3000)
      const t3 = setTimeout(() => {
        setStage('idle')
        onComplete()
      }, 10000) // Increased for better viewing of the premium card
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [player, onComplete])

  const fireworks = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: i * 0.15
  })), [])

  // Mock FIFA attributes for visual impact
  const attributes = useMemo(() => {
    if (!player) return []
    const r = player.rating
    return [
      { label: 'PAC', value: Math.floor(r * 0.88 + Math.random() * 10) },
      { label: 'SHO', value: Math.floor(r * 0.85 + Math.random() * 10) },
      { label: 'PAS', value: Math.floor(r * 0.82 + Math.random() * 10) },
      { label: 'DRI', value: Math.floor(r * 0.90 + Math.random() * 10) },
      { label: 'DEF', value: Math.floor(r * 0.40 + Math.random() * 20) },
      { label: 'PHY', value: Math.floor(r * 0.75 + Math.random() * 15) },
    ]
  }, [player])

  const flagUrl = player ? `https://flagcdn.com/w160/${(player.nationality === 'England' ? 'gb-eng' : player.nationality === 'Scotland' ? 'gb-sct' : player.nationality === 'Wales' ? 'gb-wls' : player.nationality === 'Spain' ? 'es' : player.nationality === 'France' ? 'fr' : player.nationality === 'Germany' ? 'de' : player.nationality === 'Italy' ? 'it' : player.nationality === 'Brazil' ? 'br' : player.nationality === 'Argentina' ? 'ar' : player.nationality === 'Portugal' ? 'pt' : player.nationality === 'Netherlands' ? 'nl' : player.nationality === 'Belgium' ? 'be' : player.nationality === 'Norway' ? 'no' : player.nationality === 'Egypt' ? 'eg' : player.nationality === 'Morocco' ? 'ma' : player.nationality.substring(0,2).toLowerCase())}.png` : ''

  return (
    <AnimatePresence>
      {stage !== 'idle' && player && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden perspective-1000"
        >
          {/* STAGE 1: STADIUM LIGHTS */}
          <div className="absolute inset-0 z-0">
             <motion.div 
               animate={{ 
                 opacity: [0.05, 0.15, 0.05],
                 scale: [1, 1.1, 1],
               }}
               transition={{ duration: 6, repeat: Infinity }}
               className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale opacity-10" 
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
             
             {/* Dynamic Spotlights */}
             <motion.div 
               animate={{ x: ['-40%', '40%'], opacity: [0.1, 0.6, 0.1], rotate: [-15, 15] }}
               transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
               className="absolute top-0 left-0 w-64 h-full bg-primary/20 blur-[120px] origin-top" 
             />
             <motion.div 
               animate={{ x: ['40%', '-40%'], opacity: [0.1, 0.5, 0.1], rotate: [15, -15] }}
               transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
               className="absolute top-0 right-0 w-64 h-full bg-white/10 blur-[120px] origin-top" 
             />
          </div>

          {/* STAGE 2: SIGNATURE SECTION */}
          <AnimatePresence>
            {stage === 'signature' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(40px)' }}
                className="relative z-20 text-center"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '400px' }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="h-1 bg-primary mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.8)]"
                />
                <h2 className="text-8xl md:text-[14rem] font-oswald font-black italic text-white uppercase tracking-tighter leading-none">
                  {player.name.split(' ').pop()}
                </h2>
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-primary font-oswald font-black text-3xl uppercase tracking-[0.6em] mt-6 italic"
                >
                  TRANSMISSION VERIFIED
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 3: REVEAL (THE FIFA CARD) */}
          <AnimatePresence>
            {stage === 'reveal' && (
              <motion.div 
                initial={{ scale: 0.3, y: 600, opacity: 0, rotateY: 360 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotateY: 0 }}
                transition={{ type: 'spring', damping: 18, stiffness: 60 }}
                className="relative z-30 flex flex-col items-center"
              >
                {/* Header Official Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="px-8 py-2 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)] flex items-center gap-3 border border-white/30"
                >
                  <Zap className="h-5 w-5 text-black fill-black" />
                  <span className="text-[10px] font-oswald font-black uppercase tracking-[0.4em] text-black italic">OFFICIAL 2026 SIGNING</span>
                </motion.div>

                {/* The EA FC Style Shield Card */}
                <div className="relative group">
                  {/* Outer Glow */}
                  <div className={`absolute -inset-10 blur-[100px] opacity-40 animate-pulse ${
                    player.rating >= 90 ? 'bg-secondary' : 'bg-primary'
                  }`} />
                  
                  <div className={`relative w-[340px] h-[520px] rounded-[10%_10%_50%_50%_/_5%_5%_20%_20%] border-[3px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${
                    player.rating >= 90 
                      ? 'border-secondary/60 bg-gradient-to-b from-secondary/30 via-card/90 to-black' 
                      : 'border-white/20 bg-gradient-to-b from-white/10 via-card/90 to-black'
                  }`}>
                    {/* Foil Shine Effect */}
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
                    
                    {/* Top Section: Rating, Nation, Club */}
                    <div className="absolute top-[12%] left-[10%] flex flex-col items-center gap-1 z-20">
                      <span className={`text-6xl font-black italic font-oswald tracking-tighter ${player.rating >= 90 ? 'text-secondary' : 'text-white'} leading-none`}>
                        {player.rating}
                      </span>
                      <span className="text-sm font-bold font-barlow text-white/50 tracking-[0.3em] uppercase border-t border-white/20 pt-1">
                        {player.position}
                      </span>
                      
                      <div className="mt-4 w-10 h-6 rounded-sm overflow-hidden border border-white/10 shadow-lg">
                        <img src={flagUrl} alt={player.nationality} className="w-full h-full object-cover" />
                      </div>

                      <div className="mt-2 w-10 h-10 flex items-center justify-center">
                        {player.clubLogo && <img src={player.clubLogo} alt={player.club} className="max-w-full max-h-full object-contain drop-shadow-lg" />}
                      </div>
                    </div>

                    {/* League Logo Top Right */}
                    <div className="absolute top-[12%] right-[12%] z-20 opacity-40">
                      {player.leagueLogo && <img src={player.leagueLogo} alt={player.league} className="w-8 h-8 object-contain" />}
                    </div>

                    {/* Player Image - Large & Impactful */}
                    <div className="absolute top-[8%] left-[20%] right-0 bottom-0 pointer-events-none">
                      <motion.img 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.05, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        src={player.photo} 
                        alt={player.name} 
                        className="w-full h-[75%] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,1)] z-10"
                      />
                    </div>

                    {/* Lower Info & Stats Area */}
                    <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col items-center bg-gradient-to-t from-black via-black/80 to-transparent">
                      <h2 className="text-4xl font-oswald font-black italic text-white uppercase tracking-tighter leading-tight mb-4 drop-shadow-2xl text-center w-full truncate">
                        {player.name}
                      </h2>
                      
                      {/* FIFA Attributes Grid */}
                      <div className="grid grid-cols-3 gap-x-8 gap-y-1 w-full max-w-[240px] border-t border-white/10 pt-4">
                        {attributes.map((attr) => (
                          <div key={attr.label} className="flex items-center justify-center gap-2">
                            <span className="text-[14px] font-black text-white italic font-oswald">{attr.value}</span>
                            <span className="text-[10px] font-bold text-white/40 font-barlow items-center mt-1">{attr.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2 opacity-30">
                         <div className="h-px w-8 bg-white" />
                         <span className="text-[8px] font-black font-barlow tracking-[0.5em] uppercase">{player.club}</span>
                         <div className="h-px w-8 bg-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Ambient Text */}
                <motion.h1 
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 0.05, scale: 1 }}
                  className="absolute -bottom-40 text-[18rem] font-oswald font-black italic tracking-tighter text-white pointer-events-none whitespace-nowrap z-0"
                >
                  ELITE SIGNING
                </motion.h1>

                {/* Visual Effects: Fireworks */}
                {fireworks.map((fw) => (
                  <motion.div
                    key={fw.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1.2, 0],
                      y: [-20, -150]
                    }}
                    transition={{ delay: fw.delay + 0.8, duration: 2, repeat: Infinity }}
                    className={`absolute ${player.rating >= 90 ? 'text-secondary' : 'text-primary'}`}
                    style={{ left: fw.left, top: fw.top }}
                  >
                    <Star className="h-4 w-4 fill-current shadow-glow" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
