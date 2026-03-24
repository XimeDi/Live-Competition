import { Trophy, Star, Shield, LogOut } from 'lucide-react'

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and review your squad performance.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>

      {/* User Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription>Manager Name</CardDescription>
            <CardTitle className="text-2xl">{user?.username ?? 'Unknown'}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Star className="h-3 w-3" /> Total Points
            </CardDescription>
            <CardTitle className="text-2xl">{user?.points ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Global Rank
            </CardDescription>
            <CardTitle className="text-2xl">{user?.rank ? `#${user.rank}` : 'Unranked'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* My Squad */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> My Squad
              </CardTitle>
              <CardDescription>
                Formation: {formation} &bull; {activePlayers.length}/11 players &bull; Budget left: ${budget.toFixed(1)}M
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Avg Rating: <span className="font-bold text-foreground">{avgRating}</span></p>
              <p>Total Value: <span className="font-bold text-foreground">${totalValue.toFixed(1)}M</span></p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activePlayers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No players selected yet</p>
              <p className="text-sm">Head to the Squad Builder to pick your starting 11.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-2 px-3 font-medium">#</th>
                    <th className="text-left py-2 px-3 font-medium">Player</th>
                    <th className="text-left py-2 px-3 font-medium">Position</th>
                    <th className="text-left py-2 px-3 font-medium">Club</th>
                    <th className="text-right py-2 px-3 font-medium">Rating</th>
                    <th className="text-right py-2 px-3 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => {
                    if (!player) return null
                    const pos = getPositionForIndex(index, formation)
                    return (
                      <tr key={player.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border bg-muted"
                              loading="lazy"
                            />
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-xs font-medium">
                            {pos}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{player.club}</td>
                        <td className="py-2 px-3 text-right font-mono">{player.rating}</td>
                        <td className="py-2 px-3 text-right font-mono text-primary">${player.price}M</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" /> Points Breakdown
          </CardTitle>
          <CardDescription>Performance across recent matches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matchBreakdown.map((m) => (
              <div
                key={m.match}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium">{m.match}</span>
                <span className="font-mono font-bold text-primary">+{m.points} pts</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold">
            <span>Total</span>
            <span className="text-primary font-mono text-lg">
              {matchBreakdown.reduce((s, m) => s + m.points, 0)} pts
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
