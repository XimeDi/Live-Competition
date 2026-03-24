import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export function RootLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
