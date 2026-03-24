import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Trophy, Star, Users, ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"

export function Home() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading state for dashboard data
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Manager Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.username || "Manager"}</span>.
          </p>
        </div>
        <Link to="/squad" className={buttonVariants({ size: "lg", className: "gap-2 shadow-[0_0_20px_rgba(170,59,255,0.3)] hover:shadow-[0_0_25px_rgba(170,59,255,0.5)] transition-all" })}>
          Edit Squad <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border-primary/20 bg-background/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Star className="h-48 w-48 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Total Points
            </CardTitle>
            <CardDescription>Your fantasy points this tournament</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">{user?.points || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              +0 points since last matchweek
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/20 bg-background/50 backdrop-blur-sm">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Trophy className="h-48 w-48 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Global Rank
            </CardTitle>
            <CardDescription>Your position in the world</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black">
              {user?.rank ? `#${user.rank}` : "Unranked"}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <Link to="/leaderboard" className="text-primary hover:underline">
                View full leaderboard
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 rounded-xl border bg-muted/30 p-8 text-center">
        <Users className="h-12 w-12 mx-auto text-primary/40 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your Squad is Empty</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven't selected your 11 players for the upcoming matches yet. Head over to the Squad Builder to start.
        </p>
        <Link to="/search" className={buttonVariants({ variant: "outline" })}>
          Find Players
        </Link>
      </div>
    </div>
  )
}
