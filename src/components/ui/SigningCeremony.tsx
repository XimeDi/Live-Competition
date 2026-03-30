import { motion, AnimatePresence } from 'framer-motion'
import { Star, Zap } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

interface Player {
  name: string
  photo: string
  rating: number
  club: string
  nationality: string
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
      }, 8000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [player, onComplete])

  const fireworks = useMemo(() => [...Array(12)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: i * 0.1
  })), [])

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
                 opacity: [0.1, 0.3, 0.1],
                 scale: [1, 1.2, 1],
                 rotate: [0, 5, 0]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale opacity-10" 
             />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
             
             {/* Spotlights */}
             <motion.div 
               animate={{ x: ['-20%', '20%'], opacity: [0, 0.5, 0] }}
               transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
               className="absolute top-0 left-1/4 w-32 h-full bg-primary/20 blur-[80px] -rotate-12" 
             />
             <motion.div 
               animate={{ x: ['20%', '-20%'], opacity: [0, 0.4, 0] }}
               transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
               className="absolute top-0 right-1/4 w-32 h-full bg-white/10 blur-[80px] rotate-12" 
             />
          </div>

          {/* STAGE 2: SIGNATURE */}
          <AnimatePresence>
            {stage === 'signature' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                className="relative z-20"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-1 bg-primary mb-6 shadow-[0_0_30px_oklch(var(--primary))]"
                  />
                  <h2 className="text-8xl md:text-[12rem] font-oswald font-black italic text-white uppercase tracking-tighter leading-none mix-blend-difference">
                    {player.name.split(' ').pop()}
                  </h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="text-primary font-oswald font-black text-2xl uppercase tracking-[0.5em] mt-4"
                  >
                    CONTRACT VERIFIED
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 3: REVEAL */}
          <AnimatePresence>
            {stage === 'reveal' && (
              <motion.div 
                initial={{ scale: 0.5, y: 500, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotateY: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 70 }}
                className="relative z-30 flex flex-col items-center"
              >
                {/* Header Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="px-10 py-3 bg-primary rounded-2xl mb-12 shadow-[0_0_60px_rgba(34,197,94,0.4)] flex items-center gap-4 border border-white/20"
                >
                  <Zap className="h-6 w-6 text-black fill-black" />
                  <span className="text-sm font-oswald font-black uppercase tracking-[0.5em] text-black">OFFICIAL 2026 SIGNING</span>
                </motion.div>

                {/* The Card */}
                <div className="relative group perspective-1000">
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-primary/20 blur-[100px] animate-pulse" />
                  
                  <div className={`panini-foil relative w-80 h-[500px] rounded-[3rem] border-[6px] shadow-[0_60px_100px_rgba(0,0,0,1)] overflow-hidden transition-all duration-1000 ${
                    player.rating >= 90 ? 'border-secondary/50 bg-secondary/10' : 'border-primary/50 bg-primary/10'
                  }`}>
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-soft-light opacity-30" />
                    
                    {/* Stats */}
                    <div className="absolute top-10 left-10 z-20">
                      <p className="text-7xl font-oswald font-black text-white italic tracking-tighter leading-none">{player.rating}</p>
                      <div className="h-1.5 w-12 bg-primary my-3 shadow-[0_0_15px_oklch(var(--primary))]" />
                      <p className="text-xs font-barlow font-black text-primary uppercase tracking-[0.4em]">ELITE CLASS</p>
                    </div>

                    {/* Nation */}
                    <div className="absolute top-10 right-10 z-20">
                      <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-3xl flex items-center justify-center shadow-2xl">
                        <span className="text-xs font-oswald font-bold text-white">{player.nationality.substring(0,3).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Player Image */}
                    <div className="absolute inset-0 flex items-end justify-center h-[95%] pointer-events-none">
                      <motion.img 
                        initial={{ y: 200, scale: 0.8 }}
                        animate={{ y: 0, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        src={player.photo} 
                        alt={player.name} 
                        className="h-full object-contain object-bottom drop-shadow-[0_40px_60px_rgba(0,0,0,1)] z-10"
                      />
                      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
                    </div>

                    {/* Lower Info */}
                    <div className="absolute bottom-0 inset-x-0 p-10 z-30 text-center">
                      <h2 className="text-5xl font-oswald font-black italic text-white uppercase tracking-tighter leading-none mb-2 transform scale-y-110">
                        {player.name}
                      </h2>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1 w-4 bg-primary" />
                        <p className="text-primary font-barlow font-black text-[10px] uppercase tracking-[0.5em]">{player.club}</p>
                        <div className="h-1 w-4 bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background "Stadium" Text */}
                <motion.h1 
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 0.03, scale: 1 }}
                  className="absolute -bottom-40 text-[20rem] font-oswald font-black italic tracking-tighter text-white pointer-events-none whitespace-nowrap"
                >
                  BROADCAST REVEAL
                </motion.h1>

                {/* Fireworks VFX */}
                {fireworks.map((fw) => (
                  <motion.div
                    key={fw.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1.5, 0],
                      y: [-20, -100]
                    }}
                    transition={{ delay: fw.delay + 0.5, duration: 1.5, repeat: Infinity }}
                    className="absolute text-primary"
                    style={{ left: fw.left, top: fw.top }}
                  >
                    <Star className="h-4 w-4 fill-primary" />
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
