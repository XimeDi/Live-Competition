import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Trophy, Star, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { useSquadStore } from "@/store/useSquadStore"
import { BroadcastTicker } from "@/components/ui/BroadcastTicker"

export function Home() {
  const { user } = useAuthStore()
  const { players } = useSquadStore()
  const [isLoading, setIsLoading] = useState(true)

  const isSquadEmpty = players.every(p => !p)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-md mb-2"></div>
        <div className="h-6 w-64 bg-muted/60 rounded-md"></div>
        
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <div className="h-40 bg-muted/40 rounded-xl border border-border/50"></div>
          <div className="h-40 bg-muted/40 rounded-xl border border-border/50"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Stadium Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="container relative z-10 py-10 space-y-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-[6px] border-primary/10 pb-10 relative">
          <div className="absolute -bottom-[6px] left-0 w-32 h-[6px] bg-primary shadow-[0_0_20px_oklch(var(--primary))]" />
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_oklch(var(--primary))]" />
              <span className="text-[12px] font-black font-oswald uppercase tracking-[0.6em] text-primary italic">STADIUM HUB // 2026 BROADCAST ACTIVE</span>
            </div>
            <h1 className="text-8xl md:text-[10rem] font-oswald font-black tracking-tighter uppercase italic text-foreground leading-[0.75]">
              MANAGER <span className="text-primary italic">COMMAND</span>
            </h1>
            <p className="text-3xl font-oswald font-black text-foreground/30 mt-8 tracking-widest uppercase flex items-center gap-6 italic">
              Welcome, <span className="text-foreground border-b-[3px] border-primary/40 pb-1">{user?.username || "Commander"}</span> 
              <span className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
                 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 LINK STABLE
              </span>
            </p>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="shrink-0"
          >
            <Link to="/squad" className="h-24 px-16 text-3xl font-oswald font-black uppercase tracking-[0.2em] italic shadow-[0_30px_60px_-10px_oklch(var(--primary)/0.4)] bg-primary text-black hover:bg-primary/90 rounded-3xl border-b-[8px] border-black/20 flex items-center justify-center transition-all">
              GO TO PITCH <ArrowRight className="h-8 w-8 ml-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Points Display Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="broadcast-glass rounded-[3rem] overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
                <Star className="h-80 w-80 text-primary" />
              </div>
              <CardHeader className="p-12 pb-4">
                <CardTitle className="flex items-center gap-4 text-[11px] font-black font-oswald uppercase tracking-[0.5em] text-primary italic">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Efficiency Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 pt-0">
                <div className="flex items-baseline gap-4">
                  <span className="text-[10rem] font-oswald font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500 leading-none">
                    {user?.points || 0}
                  </span>
                  <span className="text-4xl font-oswald font-black text-foreground/20 uppercase tracking-tighter italic">Rating Pts</span>
                </div>
                <div className="mt-12 h-2 w-full bg-foreground/5 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    className="h-full bg-primary shadow-[0_0_20px_oklch(var(--primary))]" 
                   />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ranking Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="broadcast-glass rounded-[3rem] overflow-hidden group border-secondary/20">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
                <Trophy className="h-80 w-80 text-secondary" />
              </div>
              <CardHeader className="p-12 pb-4">
                <CardTitle className="flex items-center gap-4 text-[11px] font-black font-oswald uppercase tracking-[0.5em] text-secondary italic">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  Live Broadcast Ranking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 pt-0">
                <div className="flex items-baseline gap-4">
                  <span className="text-[10rem] font-oswald font-black tracking-tighter text-foreground group-hover:text-secondary transition-colors duration-500 leading-none">
                    {user?.rank ? `#${user.rank}` : "---"}
                  </span>
                  <span className="text-4xl font-oswald font-black text-foreground/20 uppercase tracking-tighter italic">World Tier</span>
                </div>
                <div className="mt-12">
                  <Link to="/leaderboard" className="font-oswald italic uppercase text-lg font-black tracking-[0.4em] text-primary hover:text-foreground flex items-center gap-4 group/link transition-all">
                    VIEW WORLD STANDINGS <ArrowRight className="h-5 w-5 group-hover/link:translate-x-3 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {isSquadEmpty ? (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 rounded-[4rem] border-4 border-dashed border-white/10 bg-foreground/5 p-24 text-center backdrop-blur-3xl relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none group-hover:opacity-30 transition-opacity" />
            <div className="bg-primary h-32 w-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-[0_40px_80px_oklch(var(--primary)/0.4)] rotate-3 group-hover:rotate-0 transition-transform duration-700">
               <Users className="h-16 w-16 text-black" />
            </div>
            <h3 className="text-7xl font-oswald font-black uppercase tracking-tight italic mb-8 text-foreground">DRAFT YOUR <span className="text-primary italic">WORLD XI</span></h3>
            <p className="text-foreground/40 mb-16 max-w-3xl mx-auto font-oswald font-black text-3xl italic uppercase tracking-widest leading-relaxed">
              COMMAND CENTER IS OFFLINE. RECRUIT ELITE ASSETS FROM 48 NATIONS TO DOMINATE THE STADIUM CYCLE.
            </p>
            <Link to="/search" className="h-24 px-20 font-oswald font-black uppercase tracking-[0.4em] text-2xl shadow-3xl bg-white text-black hover:bg-primary transition-all rounded-[2rem] italic flex items-center justify-center mx-auto w-fit">
              START BROADCAST SCOUTING
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[3rem] broadcast-glass p-14 flex flex-col md:flex-row items-center justify-between border-l-[16px] border-l-primary shadow-3xl"
          >
             <div className="flex items-center gap-12 mb-10 md:mb-0">
                <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl relative">
                  <div className="absolute inset-0 animate-ping bg-primary/20 rounded-3xl" />
                  <CheckCircle2 className="h-12 w-12 relative z-10" />
                </div>
                <div>
                  <h4 className="font-oswald text-5xl uppercase font-black italic leading-tight text-foreground tracking-tighter">XI OPERATIONAL</h4>
                  <p className="font-oswald text-2xl text-foreground/40 italic uppercase tracking-[0.3em] mt-3">Ready for Stadium Hub deployment.</p>
                </div>
             </div>
             <Link to="/squad" className="font-oswald uppercase font-black italic px-16 h-20 text-xl tracking-[0.3em] hover:bg-primary hover:text-black border-2 border-primary/20 transition-all rounded-[1.5rem] flex items-center justify-center">
                TACTICAL CONTROL
             </Link>
          </motion.div>
        )}
      </div>
      <BroadcastTicker />
    </div>
  )
}
