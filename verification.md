# 📊 Financial Dashboard — Resumen de Validación

## ¿Qué es?

Un **dashboard financiero interactivo** que visualiza métricas clave de ingresos, gastos, beneficio y margen de beneficio a partir de **datos simulados (mock)**. Consta de un backend en Python (FastAPI) que genera y sirve los datos financieros, y un frontend en React + TypeScript que los consume y los presenta en una interfaz web con tarjetas KPI y gráficos de líneas.

---

## 📋 Tabla de Validación del Resumen

| # | Aspecto | Detalle |
|---|---------|---------|
| 1 | **Propósito general** | Dashboard financiero ejecutivo que muestra ingresos, gastos, beneficio neto y margen de beneficio |
| 2 | **Backend** | FastAPI (Python 3.13) corriendo en `:8000` |
| 3 | **Frontend** | React 19 + TypeScript + Vite 8, corriendo en `:5173` |
| 4 | **Estilizado** | Tailwind CSS v4 + Recharts para gráficos |
| 5 | **Orquestación** | Docker Compose levanta ambos servicios (`docker compose up --build`) |
| 6 | **Datos** | **100% simulados** — el backend genera 360 movimientos mock con `random.seed(42)` para 12 meses |
| 7 | **Conexión frontend → backend** | Vite tiene un **proxy reverso** configurado: cualquier ruta `/api` se redirige a `http://backend:8000` |
| 8 | **Endpoint usado por el frontend** | Solo consume `GET /api/metrics` (lista completa de movimientos) |
| 9 | **Endpoints disponibles (no consumidos desde frontend)** | 9 endpoints en total: `/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b`, `/api/metrics/b2c` |
| 10 | **Cálculos en frontend** | `computeKPIs()` y `computeMonthlyData()` en `financial-utils.ts` procesan los movimientos localmente |
| 11 | **KPIs mostrados** | 4 tarjetas: Total Income, Total Outcome, Profit, Profit Margin |
| 12 | **Gráficos mostrados** | 2 gráficos de líneas: "Income vs Outcome" mensual y "Profit Margin %" mensual |
| 13 | **Componentes UI reutilizables** | `Card` y `Skeleton` (skeleton loader mientras carga) |
| 14 | **Tests backend** | 12 tests con pytest + httpx.TestClient |
| 15 | **Tests frontend** | Tests unitarios con Vitest para `computeKPIs` y `computeMonthlyData` |
| 16 | **Debug habilitado** | Backend expone puerto `:5678` con `debugpy` para depuración remota |
| 17 | **Hot-reload** | Backend con `--reload` de Uvicorn, frontend con Vite Dev Server. Ambos montan el código local como volumen Docker |
| 18 | **Entry Points** | `index.html` → `main.tsx` (React DOM) → `App.tsx` (componente raíz) → llamada a API |
| 19 | **Sin base de datos** | No hay DB, ni ORM, ni persistencia — todo es volátil en memoria |
| 20 | **Sin autenticación** | CORS permite `allow_origins=["*"]`, no hay login, sesiones ni API keys |

---

## 🔁 Flujo de Ejecución Paso a Paso

```
1. docker compose up --build
       │
       ▼
2. Backend: uvicorn app.main:app --reload (puerto 8000)
   - Genera 360 movimientos mock (seed=42)
   - Expone 9 endpoints REST
       │
       ▼
3. Frontend: vite dev server (puerto 5173)
   - Sirve index.html
   - Carga main.tsx → monta App.tsx
       │
       ▼
4. App.tsx hace fetch a /api/metrics
       │
       ▼
5. Vite proxy redirige a http://backend:8000/api/metrics
       │
       ▼
6. Backend devuelve JSON con 360 FinancialMovement[]
       │
       ▼
7. Frontend calcula:
   - computeKPIs() → 4 valores para KPIRow
   - computeMonthlyData() → 12 puntos mensuales para gráficos
       │
       ▼
8. Renderiza: DashboardHeader + 4 KPICards + 2 Charts
```

---

## 🐳 Comandos para ejecutar

```bash
# Construir y levantar todo con Docker
docker compose up --build

# Solo backend (desarrollo sin Docker)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Solo frontend (desarrollo sin Docker)
cd frontend && npm install && npm run dev
```

---

## 📁 Mapa de Archivos del Proyecto

```
/workspaces/ai-eng-financial-dashboard-context-project/
├── docker-compose.yml          ← Orquestación de servicios
├── AGENTS.md                   ← Guía para agentes de IA
├── README.md / README.es.md    ← Documentación del proyecto
├── verification.md             ← ESTE ARCHIVO
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             ← Entry Point FastAPI
│   │   └── routes.py           ← 9 endpoints + lógica de negocio
│   └── tests/
│       ├── conftest.py
│       └── test_routes.py      ← 12 tests
├── frontend/
│   ├── Dockerfile
│   ├── index.html              ← Entry Point HTML
│   ├── vite.config.ts          ← Proxy /api + alias @
│   ├── package.json            ← React 19, Vite 8, Tailwind 4, Recharts
│   └── src/
│       ├── main.tsx             ← Entry Point React
│       ├── App.tsx              ← Componente raíz
│       ├── components/
│       │   ├── dashboard/      ← 4 componentes de dashboard
│       │   └── ui/             ← 2 componentes base (Card, Skeleton)
│       └── lib/                ← Tipos, utilidades, mock data, tests
└── memory-bank/                ← (vacío — para documentación del agente)
```