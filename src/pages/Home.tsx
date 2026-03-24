import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Trophy, Star, Users, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { useSquadStore } from "@/store/useSquadStore"

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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Live Tournament</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none">
            Manager <span className="text-primary">Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4">
            Welcome back, <span className="font-bold text-foreground">{user?.username || "Manager"}</span>. Your team is ready for battle.
          </p>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
        >
          <Link to="/squad" className={buttonVariants({ size: "lg", className: "h-14 px-8 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all bg-primary hover:bg-primary/90" })}>
            Manage Squad <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </motion.div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl group transition-all hover:border-primary/40">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <Star className="h-64 w-64 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Star className="h-4 w-4 text-primary" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-7xl font-black tracking-tighter text-primary">
                {user?.points || 0}
              </div>
              <p className="text-sm font-bold text-muted-foreground mt-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live update based on current matchweek
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl group transition-all hover:border-primary/40">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
              <Trophy className="h-64 w-64 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Trophy className="h-4 w-4 text-amber-500" />
                Global Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-7xl font-black tracking-tighter">
                {user?.rank ? `#${user.rank}` : "---"}
              </div>
              <p className="text-sm font-bold mt-4">
                <Link to="/leaderboard" className="text-primary hover:underline flex items-center gap-1 group/link">
                  View Competition <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {isSquadEmpty ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-12 text-center backdrop-blur-md"
        >
          <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
             <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tight italic mb-2">Build Your Dream Team</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
            Your roster is currently empty. Scout the best talent from all 48 nations and dominate the 2026 World Cup.
          </p>
          <Link to="/search" className={buttonVariants({ variant: "default", size: "lg", className: "h-14 px-10 font-black uppercase tracking-widest" })}>
            Scout Players
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-primary/10 bg-card/20 p-8 flex items-center justify-between backdrop-blur-sm"
        >
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight text-foreground">Squad Eligible</h4>
                <p className="text-sm text-muted-foreground">Your team is complete and ready for the next match!</p>
              </div>
           </div>
           <Link to="/squad" className={buttonVariants({ variant: "outline", className: "font-bold" })}>
              View Pitch
           </Link>
        </motion.div>
      )}
    </div>
  )
}
