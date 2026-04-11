import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ThemeProvider } from "./providers/theme-provider"
import { RootLayout } from "./components/layout/RootLayout"
import { PageTransition } from "./components/PageTransition"

import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Search } from "./pages/Search"
import { SquadBuilder } from "./pages/SquadBuilder"
import { Leaderboard } from "./pages/Leaderboard"
import { Profile } from "./pages/Profile"
import { Admin } from "./pages/Admin"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <PageTransition><Home /></PageTransition> },
      { path: "/search", element: <PageTransition><Search /></PageTransition> },
      { path: "/squad", element: <PageTransition><SquadBuilder /></PageTransition> },
      { path: "/leaderboard", element: <PageTransition><Leaderboard /></PageTransition> },
      { path: "/profile", element: <PageTransition><Profile /></PageTransition> },
    ],
  },
  { path: "/login", element: <PageTransition><Login /></PageTransition> },
  { path: "/register", element: <PageTransition><Register /></PageTransition> },
  { path: "/admin", element: <Admin /> },
])

import { Toaster } from 'sonner'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="fantasy-theme">
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}

export default App
