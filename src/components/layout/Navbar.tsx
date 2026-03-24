import { Link, useLocation } from "react-router-dom"
import { Shield, Home, Search, Users, Trophy, User } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { buttonVariants } from "@/components/ui/button"

export function Navbar() {
  const location = useLocation()
  
  const navLinks = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Squad", href: "/squad", icon: Users },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ]
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">
            Fantasy World Cup
          </span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${
                  location.pathname === link.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center space-x-2">
          <ModeToggle />
          <Link to="/profile" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
