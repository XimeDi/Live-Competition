import { useSimulatorStore } from "@/store/useSimulatorStore"
import { useUiStore } from "@/store/useUiStore"
import { translations } from "@/lib/translations"

export function BroadcastTicker() {
  const { matches } = useSimulatorStore()
  const { language } = useUiStore()
  const t = translations[language].ticker

  const simulated = matches.filter(m => m.simulated)

  const dynamicItems = simulated.map(m =>
    `${m.homeFlag} ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam} ${m.awayFlag}`
  )

  const items = dynamicItems.length > 0
    ? [...dynamicItems, ...t.items]
    : t.items

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-primary/95 backdrop-blur-sm border-t-2 border-black/10 overflow-hidden">
      <div className="flex items-center h-8">
        {/* Label */}
        <div className="flex items-center gap-2 px-4 h-full bg-black/20 border-r border-black/10 shrink-0">
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black/80">{t.label}</span>
        </div>

        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden">
          <div className="ticker-content flex">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex shrink-0">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-8 border-r border-black/10 whitespace-nowrap">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-black/90">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
