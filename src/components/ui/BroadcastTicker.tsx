
const TICKER_ITEMS = [
  "LIVE: MANAGER COMMAND CENTER OPTIMIZED",
  "MARKET REPORT: MBAPPÉ TRANSFER VALUE SURGES BY $12.5M",
  "WORLD TIER 1: GLOBAL BROADCAST RANKINGS UPDATED",
  "WEATHER: STADIUM OPTIMAL // 22°C // PITCH: IDEAL",
  "SQUAD VALIDATION: XI PROTOCOL ACTIVE",
  "BREAKING: NEW SCOUTING PROSPECTS DETECTED IN SOUTH AMERICA",
  "WORLD CUP 2026: 412 DAYS REMAINING",
]

export function BroadcastTicker() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 broadcast-ticker bg-black/80 backdrop-blur-xl border-t-2 border-primary/20">
      <div className="ticker-content">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex shrink-0">
            {TICKER_ITEMS.map((item, idx) => (
              <div key={idx} className="ticker-item flex items-center gap-6 px-12 border-r border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_oklch(var(--primary))]" />
                <span className="text-[11px] font-oswald font-black uppercase tracking-[0.4em] text-foreground/80 italic whitespace-nowrap">
                  {item}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
