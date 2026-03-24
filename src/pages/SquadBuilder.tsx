import { Link } from 'react-router-dom'
import { Plus, Trash2, Settings, ShieldAlert, CheckCircle2 } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSquadStore, getPositionForIndex } from '@/store/useSquadStore'
import type { Formation } from '@/store/useSquadStore'

export function SquadBuilder() {
  const { formation, players, budget, setFormation, removePlayer, getIsComplete } = useSquadStore()

  // Generate rows of players based on formation (e.g., [4, 3, 3])
  const defCount = parseInt(formation.split("-")[0])
  const midCount = parseInt(formation.split("-")[1])
  const fwdCount = parseInt(formation.split("-")[2])

  // Player indices:
  // GK: 0
  // DEF: 1 to defCount
  // MID: defCount+1 to defCount+midCount
  // FWD: defCount+midCount+1 to 10
  
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Squad Builder</h1>
          <p className="text-muted-foreground">Manage your starting 11 for the upcoming matchweek.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Budget Remaining</p>
            <p className={`text-2xl font-mono font-bold ${budget < 10 ? 'text-destructive' : 'text-primary'}`}>
              ${budget.toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings / Status */}
        <div className="space-y-6 lg:self-start sticky top-24">
          <Card className="border-primary/20 shadow-lg bg-background/50 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <Settings className="h-4 w-4" /> Tactics
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Formation</label>
                <Select value={formation} onValueChange={(val: string | null) => { if (val) setFormation(val as Formation) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-3-3">4-3-3</SelectItem>
                    <SelectItem value="4-4-2">4-4-2</SelectItem>
                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Changing formation will reset your current squard.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Status</h4>
                {isComplete ? (
                  <div className="flex items-start gap-2 text-emerald-500 text-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <p>Squad is complete! You are ready for the matchweek.</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-amber-500 text-sm">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <p>Incomplete squad. You need {players.filter(p => !p).length} more players.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Link 
            to={isComplete ? "/profile" : "#"} 
            className={buttonVariants({ className: "w-full shadow-lg h-12 text-lg font-bold" }) + (isComplete ? "" : " opacity-50 pointer-events-none")}
          >
            Save Team
          </Link>
        </div>

        {/* Pitch Area */}
        <div className="lg:col-span-3">
          <div className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden border-4 border-border/50 shadow-2xl bg-emerald-950 aspect-[3/4] sm:aspect-square md:aspect-[4/3] flex flex-col justify-between py-4 sm:py-8 px-2 sm:px-6">
            
            {/* Pitch Markings */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between">
              <div className="w-full h-1/2 border-b-2 border-white/50 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/50"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-x-2 border-b-2 border-white/50"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 border-x-2 border-b-2 border-white/50"></div>
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/50"></div>
              </div>
              <div className="w-full h-1/2 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-x-2 border-t-2 border-white/50"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-x-2 border-t-2 border-white/50"></div>
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/50"></div>
              </div>
            </div>

            {/* Players Layout */}
            {lines.map((line) => (
              <div key={line.name} className="flex justify-evenly relative z-10 w-full mb-2 sm:mb-4">
                {line.indices.map((index) => {
                  const player = players[index]
                  const expectedPos = getPositionForIndex(index, formation)
                  
                  return (
                    <div key={index} className="flex flex-col items-center justify-center w-20 sm:w-24">
                      {player ? (
                        <div className="relative group cursor-pointer transition-transform hover:scale-105">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary bg-background shadow-lg mx-auto">
                            <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="absolute -top-2 -right-2 sm:-top-1 sm:-right-1 bg-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <button 
                              onClick={() => removePlayer(index)}
                              className="bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          <div className="mt-1 sm:mt-2 text-center bg-background/90 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold truncate max-w-full shadow-md border">
                            {player.name}
                          </div>
                          <div className="text-[10px] sm:text-xs text-center font-mono mt-0.5 font-bold text-white drop-shadow-md">
                            ${player.price}M
                          </div>
                        </div>
                      ) : (
                        <Link 
                          to={`/search?add=${index}&pos=${expectedPos}`} 
                          className={buttonVariants({ variant: "outline", className: "w-12 h-12 sm:w-16 sm:h-16 rounded-full border-dashed border-2 flex p-0 bg-background/50 backdrop-blur shadow-lg hover:border-primary hover:text-primary transition-all group" })}
                        >
                          <Plus className="h-5 w-5 sm:h-6 sm:w-6 opacity-50 group-hover:opacity-100" />
                          <span className="sr-only">Add {expectedPos}</span>
                        </Link>
                      )}
                      {!player && (
                        <div className="mt-1 sm:mt-2 text-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white/70 bg-black/30 backdrop-blur-sm">
                          {expectedPos}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  )
}
