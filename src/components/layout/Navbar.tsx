import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Shield, Home, Search, Users, Trophy, User, Languages, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useUiStore } from "@/store/useUiStore"
import { useAuthStore } from "@/store/useAuthStore"
import { translations } from "@/lib/translations"
import { ModeToggle } from "@/components/ui/ModeToggle"

export function Navbar() {
  const location = useLocation()
  const { language, toggleLanguage } = useUiStore()
  const { user } = useAuthStore()
  const t = translations[language].nav
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { name: t.dashboard, href: "/", icon: Home },
    { name: t.search, href: "/search", icon: Search },
    { name: t.squad, href: "/squad", icon: Users },
    { name: t.leaderboard, href: "/leaderboard", icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-primary/20 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileOpen(false)}>
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_20px_oklch(var(--primary)/0.4)] group-hover:scale-110 transition-transform">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <span className="font-oswald font-black uppercase tracking-tighter text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors">
            FIFA <span className="text-primary italic">WORLD CUP</span><span className="text-[10px] align-top ml-0.5 opacity-50">TM</span> <span className="text-foreground/30 italic ml-1">2026</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-oswald font-black uppercase tracking-[0.2em] italic">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`group flex items-center gap-3 transition-all ${
                  isActive ? "text-primary" : "text-foreground/40 hover:text-foreground"
                }`}
              >
                <div className={`h-1 w-4 rounded-full transition-all ${isActive ? "bg-primary w-8" : "bg-transparent group-hover:bg-foreground/20"}`} />
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-foreground/20"}`} />
                <span>{link.name}</span>
              </Link>
            )
          })}

          {/* Admin shortcut (only for kris) */}
          {user?.email === "kristopherpaz@ufm.edu" && (
            <Link
              to="/admin"
              className={`group flex items-center gap-3 transition-all ${
                location.pathname === "/admin" ? "text-primary" : "text-foreground/40 hover:text-primary"
              }`}
            >
              <div className={`h-1 w-4 rounded-full transition-all ${location.pathname === "/admin" ? "bg-primary w-8" : "bg-transparent group-hover:bg-primary/20"}`} />
              <Shield className={`h-4 w-4 ${location.pathname === "/admin" ? "text-primary" : "text-foreground/20"}`} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-oswald font-black text-foreground/40 hover:text-primary hover:bg-foreground/5 gap-2 uppercase italic tracking-widest text-[10px] h-10 px-4 rounded-xl border border-white/5"
          >
            <Languages className="h-4 w-4" />
            <span>{language === 'en' ? 'ES' : 'EN'}</span>
          </Button>
          <div className="h-8 w-[1px] bg-foreground/10 mx-2" />
          <Link to="/profile" className="relative group">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all ${location.pathname === '/profile' ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 bg-foreground/5'}`}>
              {user?.username ? (
                <span className={`font-oswald font-black text-lg uppercase ${location.pathname === '/profile' ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`}>
                  {user.username.charAt(0)}
                </span>
              ) : (
                <User className={`h-6 w-6 ${location.pathname === '/profile' ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`} />
              )}
            </div>
            {location.pathname === '/profile' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full" />}
          </Link>
        </div>

        {/* Mobile: right side icons */}
        <div className="flex md:hidden items-center gap-3">
          <ModeToggle />
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="h-10 w-10 rounded-xl border border-white/10 bg-foreground/5 flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary/30 transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-white/5 bg-background/95 backdrop-blur-3xl"
          >
            <div className="container px-6 py-6 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-oswald font-black uppercase tracking-[0.2em] italic text-sm transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {link.name}
                    {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </Link>
                )
              })}

              <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-oswald font-black uppercase tracking-[0.2em] italic text-sm transition-all ${
                    location.pathname === '/profile'
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <User className="h-5 w-5 shrink-0" />
                  {user?.username ?? "Profile"}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { toggleLanguage(); }}
                  className="font-oswald font-black text-foreground/40 hover:text-primary gap-2 uppercase italic tracking-widest text-[10px] h-10 px-4 rounded-xl border border-white/5"
                >
                  <Languages className="h-4 w-4" />
                  {language === 'en' ? 'ES' : 'EN'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
