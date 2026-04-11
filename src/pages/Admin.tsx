/**
 * Admin page — enter match results (F4.1).
 * Protected by ADMIN_KEY entered locally in the UI (stored in sessionStorage).
 */
import { useState } from 'react'
import { Shield, Plus, CheckCircle2, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiJson } from '@/services/api/client'
import type { MatchRecord } from '@/services/api/auth'
import { useQuery } from '@tanstack/react-query'

async function postMatch(adminKey: string, body: { teamA: string; teamB: string; scoreA: number; scoreB: number }) {
  return apiJson<{ match: MatchRecord }>('/admin/match', {
    method: 'POST',
    headers: { 'X-Admin-Key': adminKey },
    body: JSON.stringify(body),
  })
}

async function fetchAdminMatches(adminKey: string) {
  return apiJson<{ matches: MatchRecord[] }>('/admin/matches', {
    method: 'GET',
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function Admin() {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem('adminKey') ?? '')
  const [keyInput, setKeyInput] = useState('')
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const authenticated = Boolean(adminKey)

  const { data, refetch } = useQuery({
    queryKey: ['admin-matches', adminKey],
    queryFn: () => fetchAdminMatches(adminKey),
    enabled: authenticated,
    staleTime: 0,
  })

  const handleKeySubmit = () => {
    const k = keyInput.trim()
    if (!k) return
    sessionStorage.setItem('adminKey', k)
    setAdminKey(k)
    setKeyInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamA.trim() || !teamB.trim() || scoreA === '' || scoreB === '') {
      toast.error('Fill all fields')
      return
    }
    setSubmitting(true)
    try {
      await postMatch(adminKey, {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
      })
      toast.success(`Match recorded: ${teamA} ${scoreA}–${scoreB} ${teamB}`)
      setTeamA(''); setTeamB(''); setScoreA(''); setScoreB('')
      void refetch()
    } catch (err: any) {
      if (err?.status === 403) {
        toast.error('Wrong admin key')
        setAdminKey('')
        sessionStorage.removeItem('adminKey')
      } else {
        toast.error(err?.message ?? 'Error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl font-oswald font-black uppercase">Admin Access</h1>
          </div>
          <Input
            type="password"
            placeholder="Enter admin key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleKeySubmit()}
            className="h-12"
          />
          <Button className="w-full h-12 font-oswald font-black uppercase" onClick={handleKeySubmit}>
            Authenticate
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="h-6 w-6" />
            <h1 className="text-4xl font-oswald font-black uppercase italic">Match Admin</h1>
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground underline"
            onClick={() => { setAdminKey(''); sessionStorage.removeItem('adminKey') }}
          >
            Sign out
          </button>
        </div>

        {/* Enter match result */}
        <form onSubmit={handleSubmit} className="space-y-6 broadcast-glass rounded-3xl p-8">
          <h2 className="text-lg font-oswald font-black uppercase text-primary">Enter Match Result</h2>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Team A</label>
              <Input value={teamA} onChange={(e) => setTeamA(e.target.value)} placeholder="e.g. Brazil" className="h-12" />
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Goals A</label>
                <Input type="number" min={0} value={scoreA} onChange={(e) => setScoreA(e.target.value)} className="h-12 text-center text-2xl font-oswald font-black" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Goals B</label>
                <Input type="number" min={0} value={scoreB} onChange={(e) => setScoreB(e.target.value)} className="h-12 text-center text-2xl font-oswald font-black" />
              </div>
            </div>
            <div className="space-y-2 col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Team B</label>
              <Input value={teamB} onChange={(e) => setTeamB(e.target.value)} placeholder="e.g. Argentina" className="h-12" />
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-12 font-oswald font-black uppercase text-base">
            <Plus className="mr-2 h-5 w-5" />
            {submitting ? 'Processing…' : 'Record Match & Award Points'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Points: Win = 3 pts per player · Draw = 1 pt · Loss = 0 pts
          </p>
        </form>

        {/* Match history */}
        {data && data.matches.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-oswald font-black uppercase text-primary">Match History</h2>
            <div className="space-y-3">
              {data.matches.map((m) => {
                const outcome =
                  m.scoreA > m.scoreB ? `${m.teamA} wins` :
                  m.scoreB > m.scoreA ? `${m.teamB} wins` : 'Draw'
                return (
                  <div key={m.id} className="flex items-center justify-between broadcast-glass rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-3">
                      {m.scoreA === m.scoreB
                        ? <CheckCircle2 className="h-4 w-4 text-yellow-400" />
                        : <XCircle className="h-4 w-4 text-primary" />
                      }
                      <span className="font-oswald font-black text-lg">
                        {m.teamA} <span className="text-primary">{m.scoreA}–{m.scoreB}</span> {m.teamB}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{outcome} · {new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
