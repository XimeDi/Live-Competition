# Arquitectura — Fantasy Copa del Mundo 2026

## Visión general

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (React)                        │
│  React 19 · Vite · Zustand · TanStack Query · Tailwind CSS   │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTP (REST) · /auth  /api
┌─────────────────────────▼────────────────────────────────────┐
│                    SERVIDOR (Fastify)                          │
│           TypeScript · Node.js · Fastify v5                   │
│                                                               │
│  Rutas públicas:  /auth/register  /auth/login                 │
│                   /api/user/me    /api/leaderboard            │
│                   /api/matches    /api/squad                  │
│                                                               │
│  Rutas admin:     /api/admin/matches  /api/admin/stats        │
│                   (requieren X-Admin-Secret)                  │
└──────┬──────────────────────────────────────┬────────────────┘
       │ Prisma ORM                           │ ioredis
┌──────▼────────────────┐          ┌──────────▼───────────────┐
│    PostgreSQL 16       │          │      Redis 7              │
│  • users               │          │  • leaderboard:global     │
│  • squads              │          │    (sorted set – caché)   │
│  • squad_players       │          │                           │
│  • matches             │          │                           │
└───────────────────────┘          └──────────────────────────┘
```

---

## Capa de datos

### Base de datos relacional: PostgreSQL

**¿Por qué PostgreSQL?**

| Alternativa | Por qué se descartó |
|-------------|---------------------|
| MySQL | PostgreSQL ofrece mejor soporte de tipos, JSON nativo y mayor compatibilidad con Prisma |
| SQLite | No apto para producción multi-proceso / Docker con volúmenes |
| MongoDB | La relación `User → Squad → SquadPlayer` es naturalmente relacional; no hay beneficio en documentos |
| Solo Redis | Redis es efímero y no tiene garantías ACID; datos críticos (usuarios, equipos) requieren durabilidad |

**Tablas:**

| Tabla | Descripción |
|-------|-------------|
| `users` | Credenciales, puntos acumulados |
| `squads` | Formación y presupuesto por usuario (1-1) |
| `squad_players` | Jugadores por equipo con posición e índice de slot |
| `matches` | Partidos del torneo con resultado y estado |

**ORM:** Prisma 5 — elegido por su sistema de migraciones, generación de tipos TypeScript y sintaxis de consulta fluida.

### Caché de clasificación: Redis

**¿Por qué Redis para el leaderboard?**

- El leaderboard requiere lectura de la posición y página de manera muy frecuente.
- `ZREVRANK` y `ZREVRANGE` en Redis son O(log N) y O(log N + M) respectivamente.
- Redis sorted sets son la estructura de datos canónica para rankings en tiempo real.
- Los puntos del usuario se almacenan en PostgreSQL (fuente de verdad); Redis actúa como caché de lectura.
- Al arrancar el servidor, el leaderboard de Redis se reconstruye desde PostgreSQL para evitar divergencias.

**¿Por qué no Meilisearch para el leaderboard?**

Meilisearch está incluido en el stack (previsto para búsqueda de jugadores en el futuro) pero no es adecuado para rankings ordenados dinámicamente.

---

## Sistema de puntos

El cálculo ocurre **en el servidor** cuando el administrador registra o simula un resultado:

```
Por cada jugador en el squad del usuario que juega en el partido:

  Participación:  +2 pts
  Victoria:       +6 pts
  Empate:         +3 pts
  Derrota:        +1 pt
  Goles del equipo: +2 pts × goles marcados
```

Implementación: `server/src/lib/pointsCalculator.ts`

---

## Autenticación

- **Usuarios:** JWT (Bearer token) firmado con `JWT_SECRET`.
- **Administradores:** Header `X-Admin-Secret` validado contra la variable de entorno `ADMIN_SECRET`. No hay roles en el JWT — el panel de admin es un cliente separado.

---

## Panel de administración

Disponible en `/admin` (frontend). Permite:

- Ver todos los partidos agrupados por grupo
- Registrar resultado real de un partido
- Simular resultado aleatorio (distribución ponderada de marcadores realistas)
- Reiniciar resultado de un partido
- Ver estadísticas globales (usuarios, equipos, partidos)

Cuando se registra un resultado, el servidor:
1. Actualiza `matches.status = 'finished'` y guarda los goles
2. Busca todos los `squad_players` de las selecciones involucradas
3. Calcula los puntos para cada usuario afectado
4. Actualiza `users.points` en PostgreSQL
5. Sincroniza el sorted set de Redis

---

## Estrategia de caché

| Datos | Almacenamiento | TTL / Invalidación |
|-------|---------------|---------------------|
| Leaderboard (posiciones) | Redis sorted set | Actualizado en cada cambio de puntos |
| Leaderboard (datos de usuario) | PostgreSQL (consulta directa) | — |
| Sesión de usuario | JWT en localStorage | 30 días |
| Squad del usuario | localStorage + PostgreSQL | Sincronizado al añadir/quitar jugadores |
| Partidos | PostgreSQL | Refetch cada 30 s en el cliente |

---

## Infraestructura Docker

```yaml
services:
  db:          PostgreSQL 16-alpine
  redis:       Redis 7-alpine
  meilisearch: Meilisearch v1.8 (preparado para búsqueda de jugadores)
  server:      Fastify API (Node 22-alpine, multi-stage build)
  frontend:    React + nginx (multi-stage build, proxy inverso a /api y /auth)
```

El frontend en producción corre detrás de nginx, que:
- Sirve los archivos estáticos de React
- Hace proxy de `/api/*` y `/auth/*` al servicio `server`

---

## Decisiones de diseño destacadas

1. **Persistencia del squad:** El squad se guarda en localStorage (UX inmediata) y se sincroniza con PostgreSQL (persistencia cross-device y cálculo de puntos).

2. **Puntos calculados en servidor:** Evita trampas y garantiza que todos los usuarios reciban sus puntos correctamente, independientemente de qué dispositivo usen.

3. **Leaderboard híbrido:** Redis para las lecturas rápidas de ranking, PostgreSQL como fuente de verdad. Se reconstruye en cada arranque del servidor.

4. **Admin sin roles en JWT:** El `ADMIN_SECRET` es más sencillo de gestionar para un torneo pequeño que un sistema de roles completo. Se puede migrar a roles RBAC si el proyecto crece.
