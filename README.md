# ⚽ Fantasy World Cup 2026

A production-ready fantasy football platform for the FIFA World Cup 2026. Build your dream squad, compete globally, and track your performance in a stunning, responsive interface.

## 🚀 Quick Start

**Frontend** (from project root):

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Backend** (in another terminal, required for login/register):

```bash
cd server
cp .env.example .env   # first time only; edit JWT_SECRET for production
npm install
npx prisma migrate dev # first time only (creates SQLite DB)
npm run dev
```

The API listens on [http://localhost:3001](http://localhost:3001). Vite proxies `/auth` and `/api` to that port during `npm run dev`.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (persisted) |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Routing | React Router v7 |
| Icons | Lucide React |

## 📄 Pages

- **Login / Register** — Zod-validated forms with session persistence
- **Dashboard** — Points, global rank, and quick actions with skeleton loaders
- **Player Search** — Real-time autocomplete with debounce, filters (position, nationality, rating), and infinite scroll  
- **Squad Builder** — Visual football pitch with formation selector (4-3-3, 4-4-2, 3-5-2), budget cap, and max 3 per country validation
- **Leaderboard** — Global rankings with "Find Me" button and infinite scroll pagination
- **Profile** — Saved squad overview, points breakdown per match, and account management

## 🏗️ Project Structure

```
src/
├── components/       # Shared UI components (Navbar, PageTransition, shadcn)
│   ├── layout/       # RootLayout, Navbar
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom hooks (useDebounce)
├── lib/              # Utilities and Zod schemas
├── pages/            # Route-level page components
├── providers/        # ThemeProvider (dark/light)
├── services/api/     # API client (auth + mock players/leaderboard)
├── store/            # Zustand stores (auth, squad)
└── types/            # TypeScript interfaces
```

## ⚙️ API Endpoints (Expected Backend)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/register` | Create new account |
| GET | `/api/search` | Search players |
| GET | `/api/squad` | Get user's squad |
| POST | `/api/squad` | Save user's squad |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/user/me` | Current user info |

> **Auth** is wired to the real server in `server/`. Player search, squad, and leaderboard still use mock modules under `src/services/api/` until those endpoints are implemented.

## 🎨 Design

- **Theme**: FIFA World Cup inspired dark mode with vibrant purple accents
- **Responsive**: Mobile-first design, works on all screen sizes
- **Animations**: Framer Motion page transitions and micro-animations
- **Loading**: Skeleton loaders throughout (no spinners)

## 📦 Build for Production

```bash
npm run build
npm run preview
```
