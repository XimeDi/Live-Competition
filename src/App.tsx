import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { RootLayout } from "./components/layout/RootLayout"
import { ThemeProvider } from "./providers/theme-provider"

import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Search } from "./pages/Search"
import { SquadBuilder } from "./pages/SquadBuilder"
import { Leaderboard } from "./pages/Leaderboard"
import { Profile } from "./pages/Profile"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/search", element: <Search /> },
      { path: "/squad", element: <SquadBuilder /> },
      { path: "/leaderboard", element: <Leaderboard /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
])

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="fantasy-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
