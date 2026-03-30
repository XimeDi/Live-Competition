import { Trophy, Star, Shield, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'
import { useSquadStore, getPositionForIndex } from '@/store/useSquadStore'
import { useNavigate } from 'react-router-dom'

export function Profile() {
  const { user, logout } = useAuthStore()
  const { players, formation, budget } = useSquadStore()
  const navigate = useNavigate()

  const activePlayers = players.filter((p) => p !== null)
  const totalValue = activePlayers.reduce((sum, p) => sum + (p?.price ?? 0), 0)
  const avgRating = activePlayers.length > 0
    ? (activePlayers.reduce((sum, p) => sum + (p?.rating ?? 0), 0) / activePlayers.length).toFixed(1)
    : '—'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Mock match breakdown
  const matchBreakdown = [
    { match: 'USA vs Mexico', points: 42 },
    { match: 'Brazil vs Argentina', points: 38 },
    { match: 'France vs Germany', points: 55 },
    { match: 'Spain vs Portugal', points: 29 },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Stadium Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="container relative z-10 py-10 space-y-12">
        {/* Header - Broadcast Scoreboard Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-primary/20 pb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <Shield className="h-4 w-4" />
              <span className="text-[10px] font-oswald font-black uppercase tracking-[0.4em]">Manager Credentials // FIFA 2026</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-oswald font-black tracking-tighter uppercase italic leading-[0.8] text-foreground">
              MANAGER <span className="text-primary italic">PROFILE</span>
            </h1>
          </motion.div>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="h-14 px-10 font-oswald font-black uppercase tracking-[0.2em] border-2 border-destructive/20 hover:bg-destructive hover:text-foreground transition-all bg-card/40 backdrop-blur-xl rounded-xl gap-3 text-destructive italic"
          >
            <LogOut className="h-5 w-5" /> TERMINATE SESSION
          </Button>
        </div>

        {/* User Stats Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="bg-card/40 backdrop-blur-3xl border-2 border-border/50 rounded-[2rem] overflow-hidden group shadow-xl">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="text-[10px] font-black font-barlow uppercase tracking-[0.4em] text-primary italic">Division Commander</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="text-5xl font-oswald font-black italic text-foreground tracking-tighter uppercase">
                {user?.username ?? 'Recruit'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/40 backdrop-blur-3xl border-2 border-border/50 rounded-[2rem] overflow-hidden group shadow-xl border-l-4 border-l-primary">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="flex items-center gap-2 text-[10px] font-black font-barlow uppercase tracking-[0.4em] text-primary italic">
                <Star className="h-3 w-3" /> Efficiency Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-oswald font-black italic text-foreground">{user?.points ?? 0}</span>
                <span className="text-xl font-oswald font-black text-primary/40 uppercase tracking-tighter italic">Pts</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-3xl border-2 border-border/50 rounded-[2rem] overflow-hidden group shadow-xl border-l-4 border-l-secondary">
            <CardHeader className="p-8 pb-2">
              <CardTitle className="flex items-center gap-2 text-[10px] font-black font-barlow uppercase tracking-[0.4em] text-secondary italic">
                <Trophy className="h-3 w-3" /> Global Stance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-oswald font-black italic text-foreground">{user?.rank ? `#${user.rank}` : 'UNRANKED'}</span>
                <span className="text-xl font-oswald font-black text-secondary/40 uppercase tracking-tighter italic">Tier</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Squad - Tactical Summary Table */}
        <Card className="bg-card/40 backdrop-blur-3xl border-2 border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl border-t-8 border-t-primary">
          <CardHeader className="p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-4xl font-oswald font-black italic text-foreground uppercase tracking-tighter">
                  <Shield className="h-8 w-8 text-primary" /> ACTIVE ROSTER
                </CardTitle>
                <CardDescription className="font-oswald font-black text-sm text-foreground/30 uppercase tracking-[0.3em] italic">
                  Formation: {formation} &bull; {activePlayers.length}/11 Assets &bull; Capital: ${budget.toFixed(1)}M
                </CardDescription>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/5 flex gap-10">
                <div className="text-center">
                  <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">Avg Rating</p>
                  <p className="text-3xl font-oswald font-black text-primary italic">{avgRating}</p>
                </div>
                <div className="text-center border-l border-white/5 pl-10">
                  <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">Squad Value</p>
                  <p className="text-3xl font-oswald font-black text-foreground italic">${totalValue.toFixed(1)}M</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activePlayers.length === 0 ? (
              <div className="text-center py-24 text-foreground/20 border-t border-white/5">
                <Shield className="h-20 w-20 mx-auto mb-6 opacity-10" />
                <p className="text-2xl font-oswald font-black uppercase tracking-widest italic">No Assets Deployed</p>
                <Button onClick={() => navigate('/squad')} className="mt-8 h-12 px-8 font-oswald font-black italic bg-primary text-black rounded-xl">OPEN BATTLEFIELD</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary/10 border-b-2 border-black/20">
                      <th className="text-left py-6 px-10 font-oswald font-black uppercase tracking-widest text-primary italic text-xs">Index</th>
                      <th className="text-left py-6 px-10 font-oswald font-black uppercase tracking-widest text-primary italic text-xs">Contracted Elite</th>
                      <th className="text-left py-6 px-10 font-oswald font-black uppercase tracking-widest text-primary italic text-xs">Tactical Pos</th>
                      <th className="text-left py-6 px-10 font-oswald font-black uppercase tracking-widest text-primary italic text-xs">Official Club</th>
                      <th className="text-right py-6 px-10 font-oswald font-black uppercase tracking-widest text-primary italic text-xs">Rating</th>
                      <th className="text-right py-6 px-10 font-oswald font-black uppercase tracking-widest text-primary italic text-xs">Market Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {players.map((player, index) => {
                      if (!player) return null
                      const pos = getPositionForIndex(index, formation)
                      return (
                        <tr key={player.id} className="group hover:bg-foreground/5 transition-all duration-300">
                          <td className="py-6 px-10 text-foreground/20 font-oswald font-black font-mono italic">{(index + 1).toString().padStart(2, '0')}</td>
                          <td className="py-6 px-10">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={player.photo}
                                  alt={player.name}
                                  className="w-12 h-12 rounded-xl object-cover border-border/50 group-hover:border-primary/50 transition-colors shadow-xl"
                                  loading="lazy"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                              </div>
                              <span className="text-xl font-oswald font-black italic text-foreground group-hover:text-primary transition-colors uppercase tracking-tighter">{player.name}</span>
                            </div>
                          </td>
                          <td className="py-6 px-10">
                            <span className="bg-primary text-black px-3 py-1 rounded-md font-oswald font-black text-[10px] tracking-widest uppercase italic">
                              {pos}
                            </span>
                          </td>
                          <td className="py-6 px-10 text-foreground/40 font-oswald font-black italic uppercase tracking-widest text-xs">{player.club}</td>
                          <td className="py-6 px-10 text-right font-oswald font-black text-2xl text-foreground italic group-hover:text-primary transition-colors">{player.rating}</td>
                          <td className="py-6 px-10 text-right">
                             <div className="flex items-baseline justify-end gap-1">
                                <span className="text-2xl font-oswald font-black text-primary italic group-hover:scale-110 transition-transform origin-right">${player.price}</span>
                                <span className="text-xs font-oswald font-black text-primary/40 uppercase italic">M</span>
                             </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Breakdown - TV Graphic Style */}
        <Card className="bg-card/40 backdrop-blur-3xl border-2 border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-10">
            <CardTitle className="flex items-center gap-4 text-4xl font-oswald font-black italic text-foreground uppercase tracking-tighter">
              <Star className="h-8 w-8 text-secondary" /> BATTLE LOGS
            </CardTitle>
            <CardDescription className="font-oswald font-black text-sm text-foreground/30 uppercase tracking-[0.3em] italic">Historical Performance Summary</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="grid gap-6">
              {matchBreakdown.map((m, i) => (
                <motion.div
                  key={m.match}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between rounded-2xl border-2 border-white/5 p-6 hover:bg-foreground/5 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-foreground/5 flex items-center justify-center font-oswald font-black text-foreground/20">{(i+1).toString().padStart(2, '0')}</div>
                    <span className="text-2xl font-oswald font-black italic text-foreground group-hover:text-primary transition-colors tracking-tighter uppercase">{m.match}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-oswald font-black text-primary drop-shadow-[0_0_10px_oklch(var(--primary)/0.4)]">+{m.points}</span>
                    <span className="text-xs font-oswald font-black text-primary/30 uppercase italic">Credits</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t-4 border-primary/20 flex justify-between items-center">
              <span className="text-3xl font-oswald font-black italic text-foreground/40 uppercase tracking-widest">AGGREGATE SCORE</span>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-oswald font-black italic text-primary drop-shadow-[0_0_20px_oklch(var(--primary))]">
                  {matchBreakdown.reduce((s, m) => s + m.points, 0)}
                </span>
                <span className="text-2xl font-oswald font-black text-primary/40 uppercase italic tracking-tighter">Global Points</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
