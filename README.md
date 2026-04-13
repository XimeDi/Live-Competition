# Fantasy Copa del Mundo 2026

Plataforma de fantasy football para el Mundial 2026. Los usuarios crean su equipo de 11 jugadores, el administrador registra los resultados de los partidos y los puntos se distribuyen automáticamente a todos los participantes.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS · shadcn/ui |
| Estado | Zustand (persistido) · TanStack Query |
| Animaciones | Framer Motion |
| Formularios | React Hook Form · Zod |
| Backend | Fastify v5 · Node.js 22 · TypeScript |
| **Base de datos** | **PostgreSQL 16** (usuarios, equipos, partidos) |
| ORM | Prisma 5 |
| Caché | Redis 7 (leaderboard en tiempo real) |
| Búsqueda | Meilisearch v1.8 (preparado) |
| Infraestructura | Docker Compose |

---

## Inicio rápido con Docker (recomendado)

> Requisito: Docker y Docker Compose instalados.

```bash
# 1. Clona el repositorio
git clone https://github.com/XimeDi/Live-Competition.git
cd Live-Competition

# 2. Ajusta las variables de entorno (opcional, hay valores por defecto)
#    Edita ADMIN_SECRET y JWT_SECRET antes de ir a producción.

# 3. Levanta toda la plataforma con un solo comando
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Panel admin | http://localhost:3000/admin |

---

## Desarrollo local

### Prerrequisitos
- Node.js 22+
- Docker (para las bases de datos)

### 1. Levantar bases de datos

```bash
docker compose up db redis -d
```

### 2. Backend

```bash
cd server
cp .env.example .env       # configura DATABASE_URL, JWT_SECRET, ADMIN_SECRET
npm install
npm run db:generate        # genera el cliente Prisma
npm run db:migrate         # aplica las migraciones SQL
npm run dev                # http://localhost:3001
```

### 3. Frontend

```bash
# desde la raíz del proyecto
npm install
npm run dev                # http://localhost:5173
```

---

## Variables de entorno del servidor

| Variable | Descripción | Valor ejemplo |
|----------|-------------|---------------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://fantasy:fantasy@localhost:5432/fantasy_wc` |
| `REDIS_URL` | Conexión Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Clave secreta JWT | *(cadena aleatoria larga)* |
| `JWT_EXPIRES_IN` | Duración del token | `30d` |
| `PORT` | Puerto del servidor | `3001` |
| `CORS_ORIGIN` | Origen CORS | `http://localhost:5173` |
| `ADMIN_SECRET` | Contraseña del panel admin | *(contraseña segura)* |

---

## Panel de administración

Accede en `/admin`. No requiere cuenta de usuario — solo la `ADMIN_SECRET`.

**Funcionalidades:**
- Ver todos los partidos agrupados por grupo
- **Resultado real** — introduce marcador y guarda
- **Simular partido** — resultado aleatorio con distribución realista
- **Reiniciar partido** — vuelve a estado "Por jugar"
- Estadísticas globales: usuarios, equipos, partidos jugados

Al registrar un resultado, el servidor calcula y distribuye los puntos automáticamente a todos los usuarios con jugadores de las selecciones involucradas.

---

## Sistema de puntos

| Evento | Puntos |
|--------|--------|
| Jugador participa | +2 |
| Su selección gana | +6 |
| Empate | +3 |
| Su selección pierde | +1 |
| Gol de su selección | +2 por gol |

---

## Reglas del equipo

- 11 jugadores (1 GK · DEF · MID · FWD según formación)
- Presupuesto inicial: **1.000M**
- Máximo **3 jugadores** de la misma selección
- Formaciones: **4-3-3 · 4-4-2 · 3-5-2**

---

## Estructura del proyecto

```
Live-Competition/
├── src/                    # Frontend React
│   ├── pages/              # Home, Search, SquadBuilder, Leaderboard, Profile, Admin
│   ├── components/         # UI, layout, MatchSimulator, BroadcastTicker
│   ├── store/              # Zustand (auth, squad, ui)
│   ├── services/api/       # Clientes HTTP (auth, squad, matches, leaderboard)
│   └── hooks/              # useDebounce, useSquadSync
├── server/                 # Backend Fastify
│   ├── src/
│   │   ├── routes/         # auth, user, squad, matches, admin, leaderboard
│   │   ├── lib/            # db, redis, jwt, leaderboard, pointsCalculator, seedMatches
│   │   └── middleware/     # requireAuth, requireAdmin
│   └── prisma/
│       ├── schema.prisma   # Esquema de la base de datos
│       └── migrations/     # Migraciones SQL versionadas
├── docker-compose.yml      # Orquestación completa (PostgreSQL · Redis · Meilisearch · API · Frontend)
├── Dockerfile              # Imagen de producción del frontend (nginx)
├── nginx.conf              # Proxy inverso + fallback SPA
└── ARCHITECTURE.md         # Documento de arquitectura detallado
```

---

## API — Referencia rápida

### Pública
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/api/matches` | Lista de partidos |
| GET | `/api/leaderboard` | Clasificación global |

### Con autenticación (Bearer JWT)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/user/me` | Datos del usuario |
| GET | `/api/squad` | Equipo guardado |
| POST | `/api/squad` | Guardar equipo |

### Administración (Header `X-Admin-Secret`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/matches` | Todos los partidos |
| PUT | `/api/admin/matches/:id/result` | Registrar resultado |
| POST | `/api/admin/matches/:id/simulate` | Simular resultado |
| POST | `/api/admin/matches/:id/reset` | Reiniciar partido |
| DELETE | `/api/admin/matches/:id` | Eliminar partido |
| GET | `/api/admin/stats` | Estadísticas globales |

---

## Arquitectura detallada

Ver [ARCHITECTURE.md](./ARCHITECTURE.md)
