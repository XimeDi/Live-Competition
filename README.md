# ⚽ Fantasy World Cup 2026

A production-ready fantasy football platform for the FIFA World Cup 2026. Build your dream squad, compete globally, and track your performance in a stunning, responsive interface.

## 🚀 Quick Start

**Frontend** (from project root):

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Backend** (in another terminal, required for login/register, leaderboard, and player search):

1. Run **Redis** and **Meilisearch**, for example:

```bash
docker run -d --name redis-live -p 6379:6379 redis:7-alpine
docker run -d --name meili-live -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey \
  getmeili/meilisearch:v1.11
```

2. Configure `server/.env` (copy from `.env.example`): `REDIS_URL`, `MEILISEARCH_HOST` (e.g. `http://127.0.0.1:7700`), `MEILISEARCH_API_KEY` (same as `MEILI_MASTER_KEY` if you use the command above), and `JWT_SECRET`.

3. Start the API:

```bash
cd server
npm install
npm run dev
```

On first start, the server **indexes** `src/data/players.json` into Meilisearch if the index is empty (can take a few minutes). To reindex manually: `npm run search:index`.

User accounts and leaderboard use **Redis**; **player search** uses **Meilisearch** (`GET /api/search`, `GET /api/search/meta`). The API listens on [http://localhost:3001](http://localhost:3001). Vite proxies `/auth` and `/api` to that port during `npm run dev`.

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
- **Player Search** — Name search from 2+ characters (debounced), suggestions API, filters (position, multi-nationality OR, club, OVR/price range), AND logic across groups, infinite scroll  
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
| GET | `/api/search/suggest` | Name autocomplete (`q` min 2 chars) |
| GET | `/api/search/meta` | Facet lists (nationalities, clubs) |
| GET | `/api/squad` | Get user's squad |
| POST | `/api/squad` | Save user's squad |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/user/me` | Current user info |

> **Auth**, **leaderboard** (`GET /api/leaderboard`), and **player search** (`GET /api/search`, `GET /api/search/meta`, `GET /api/search/suggest`) are wired to the real server in `server/` (Redis + Meilisearch). Squad persistence still uses mock/local state until that API exists.

**Player search API (`GET /api/search`)** (non-exhaustive): `q` (omitted or 0–1 chars = **no text ranking**, still returns filter-only results; **2+** runs fuzzy name search), `nationality` or **`nationalities`** (comma-separated, OR within group), `club` or **`clubs`** (comma-separated), `position`, `minRating`, **`maxRating`**, **`minPrice`**, `maxPrice`, `page`, `limit`. Filters combine with **AND**; multiple nationalities/clubs use **OR** inside that group. **`GET /api/search/suggest`**: `q` (min 2), `limit` (default 8, max 20). After changing index fields, run `cd server && npm run search:index` to reindex.

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
