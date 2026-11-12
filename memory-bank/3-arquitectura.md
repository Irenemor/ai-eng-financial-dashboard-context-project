# 3. Arquitectura del Producto

**Diseño de Capas, Flujos de Datos, Componentes y Modelos**

---

## Modelo de Capas

```
┌─────────────────────────────────────────────────────────┐
│         CAPA 1: PRESENTACIÓN (Frontend)                 │
│   React 19 + TypeScript + Tailwind                      │
│   Responsabilidad: Renderizar interfaz al usuario       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│   CAPA 2: APLICACIÓN (Componentes React)                │
│   ├─ DashboardHeader (Título + Período)                │
│   ├─ KPIRow (Contenedor de 4 tarjetas)                 │
│   ├─ IncomeOutcomeChart (Gráfico líneas)              │
│   └─ ProfitPercentChart (Gráfico líneas)              │
│   Responsabilidad: Orquestación y composición          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│   CAPA 3: SERVICIOS (Cálculo & Utilidades)             │
│   ├─ computeKPIs(movements[])                          │
│   ├─ computeMonthlyData(movements[])                   │
│   └─ Fetch API REST (HTTP calls)                       │
│   Responsabilidad: Lógica de negocio client-side       │
└─────────────────────────────────────────────────────────┘
                            ↓ (HTTP/JSON)
┌─────────────────────────────────────────────────────────┐
│   CAPA 4: API REST (Backend - FastAPI)                 │
│   ├─ GET /api/metrics (consumido)                      │
│   ├─ GET /api/metrics/facets                           │
│   ├─ GET /api/metrics/summary                          │
│   ├─ GET /api/metrics/categories/top                   │
│   ├─ GET /api/metrics/comparison                       │
│   ├─ GET /api/metrics/alerts                           │
│   ├─ GET /api/metrics/b2b                              │
│   ├─ GET /api/metrics/b2c                              │
│   └─ GET /health                                        │
│   Responsabilidad: Exposición de endpoints REST        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│   CAPA 5: LÓGICA DE NEGOCIO (Python)                   │
│   ├─ generate_mock_movements(seed=42)                  │
│   ├─ filter_movements(movements[], filters)            │
│   ├─ summarize_movements(movements[], group_by)        │
│   ├─ build_top_categories(movements[], limit)          │
│   ├─ detect_outcome_alerts(summary[], threshold)       │
│   └─ calculate_net_value(movements[])                  │
│   Responsabilidad: Transformación y agregación datos   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│   CAPA 6: MODELOS DE DATOS (Pydantic)                  │
│   ├─ FinancialMovement                                 │
│   ├─ MetricsFacets                                     │
│   ├─ MetricsSummaryItem                                │
│   ├─ TopCategoryItem                                   │
│   ├─ MetricsComparison                                 │
│   └─ MetricsAlert                                      │
│   Responsabilidad: Validación y tipado de datos        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│   CAPA 7: ALMACENAMIENTO (Mock - En Memoria)           │
│   └─ 360 movimientos generados con seed=42             │
│   Responsabilidad: Datos volátiles (reset en restart)  │
└─────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos (Step-by-Step)

```
INICIO: Usuario accede a http://localhost:5173
   │
   ├─ PASO 1: Browser solicita index.html
   │  └─ Vite server sirve /frontend/index.html
   │
   ├─ PASO 2: index.html carga main.tsx
   │  └─ React DOM monta la app en <div id="root">
   │
   ├─ PASO 3: main.tsx importa App.tsx
   │  └─ Component árbol: App.tsx → DashboardHeader + KPIRow + Charts
   │
   ├─ PASO 4: App.tsx usa useEffect(() => { fetch(...) }, [])
   │  └─ Ejecuta al montar el componente
   │
   ├─ PASO 5: fetch('/api/metrics')
   │  └─ Request HTTP: GET /api/metrics
   │
   ├─ PASO 6: Vite proxy intercepta /api
   │  └─ Redirige a http://backend:8000/api/metrics
   │
   ├─ PASO 7: FastAPI backend recibe GET /api/metrics
   │  └─ Ejecuta función routes.py::get_metrics()
   │
   ├─ PASO 8: Backend genera mock movements
   │  ├─ Llama: generate_mock_movements(seed=42)
   │  ├─ Genera: 360 FinancialMovement (12 meses × 30 items)
   │  └─ Retorna: JSON array
   │
   ├─ PASO 9: Frontend recibe response
   │  ├─ Parseado: FinancialMovement[]
   │  ├─ Guardado: setState(movements)
   │
   ├─ PASO 10: Cálculos frontend
   │  ├─ Llama: computeKPIs(movements)
   │  │  ├─ Suma todos income → totalIncome
   │  │  ├─ Suma todos outcome → totalOutcome
   │  │  ├─ Calcula profit = income - outcome
   │  │  └─ Calcula profitPercent = (profit / income) * 100
   │  │  └─ Retorna: KPIMetrics
   │  │
   │  └─ Llama: computeMonthlyData(movements)
   │     ├─ Agrupa por mes (12 grupos)
   │     ├─ Calcula income/outcome por mes
   │     └─ Retorna: MonthlyDataPoint[]
   │
   ├─ PASO 11: React re-renderiza
   │  ├─ Actualiza state: metrics, monthlyData
   │  ├─ Cambia loading: true → false
   │
   ├─ PASO 12: Renderización de componentes
   │  ├─ DashboardHeader: Muestra período "2024 - Full Year"
   │  ├─ KPIRow: Renderiza 4 KPICard con valores
   │  └─ Charts:
   │     ├─ IncomeOutcomeChart: LineChart(income vs outcome)
   │     └─ ProfitPercentChart: LineChart(profit %)
   │
   └─ FIN: Dashboard visible en navegador
```

---

## Estructura de Componentes Frontend

### Árbol de Componentes
```
<App>
  ├─ <DashboardHeader period="2024 - Full Year" />
  ├─ <KPIRow metrics={KPIMetrics} loading={boolean} />
  │  ├─ <KPICard label="Total Income" value={number} loading={boolean} />
  │  ├─ <KPICard label="Total Outcome" value={number} loading={boolean} />
  │  ├─ <KPICard label="Profit" value={number} loading={boolean} />
  │  └─ <KPICard label="Profit Margin %" value={number} loading={boolean} />
  │
  ├─ <IncomeOutcomeChart data={MonthlyDataPoint[]} loading={boolean} />
  │  └─ <Recharts.LineChart> (Recharts library)
  │     ├─ <CartesianGrid />
  │     ├─ <XAxis dataKey="month" />
  │     ├─ <YAxis />
  │     ├─ <Tooltip />
  │     ├─ <Line dataKey="income" />
  │     └─ <Line dataKey="outcome" />
  │
  └─ <ProfitPercentChart data={MonthlyDataPoint[]} loading={boolean} />
     └─ <Recharts.LineChart> (Recharts library)
        ├─ <CartesianGrid />
        ├─ <XAxis dataKey="month" />
        ├─ <YAxis />
        ├─ <Tooltip />
        └─ <Line dataKey="profitPercent" />
```

### Responsabilidades por Componente

| Componente | Archivo | Props | Responsabilidad |
|-----------|---------|-------|-----------------|
| `App` | App.tsx | None | Fetch data, state mgmt, orchestration, error handling |
| `DashboardHeader` | dashboard-header.tsx | `period: string` | Renderizar título con período |
| `KPIRow` | kpi-row.tsx | `metrics: KPIMetrics\|null`, `loading: boolean` | Grid de 4 tarjetas KPI |
| `KPICard` | kpi-card.tsx | `label: string`, `value: number\|null`, `loading: boolean` | Mostrar 1 métrica con Skeleton |
| `IncomeOutcomeChart` | income-outcome-chart.tsx | `data: MonthlyDataPoint[]`, `loading: boolean` | Recharts LineChart |
| `ProfitPercentChart` | profit-percent-chart.tsx | `data: MonthlyDataPoint[]`, `loading: boolean` | Recharts LineChart |
| `Card` | ui/card.tsx | `children: React.ReactNode` | Wrapper estilizado (Tailwind) |
| `Skeleton` | ui/skeleton.tsx | `className?: string` | Placeholder animado (loading) |

### Directorio Frontend
```
frontend/src/
├── App.tsx                                ← Componente raíz
├── main.tsx                               ← Entry point React DOM
├── components/
│   ├── dashboard/
│   │   ├── dashboard-header.tsx           ← Título período
│   │   ├── kpi-row.tsx                   ← Grid KPIs
│   │   ├── kpi-card.tsx                  ← Tarjeta individual
│   │   ├── income-outcome-chart.tsx      ← Gráfico líneas
│   │   └── profit-percent-chart.tsx      ← Gráfico líneas
│   └── ui/
│       ├── card.tsx                       ← Componente base
│       └── skeleton.tsx                   ← Loader placeholder
└── lib/
    ├── financial-types.ts                 ← Interfaces TS
    ├── financial-utils.ts                 ← Funciones cálculo
    ├── financial-utils.test.ts            ← Tests Vitest
    ├── mock-data.ts                       ← Datos ejemplo
    └── utils.ts                           ← Utilidades (cn, clsx)
```

---

## API REST - Endpoints

### Consumido por Frontend

**GET /api/metrics**
```
Descripción: Obtiene lista completa de movimientos financieros
Query Parameters:
  - start_date? (date): Fecha inicio filtro
  - end_date? (date): Fecha fin filtro
  - category? (Category): Filtro por categoría
  - operation_type? (OperationType): Filtro por tipo operación

Response: FinancialMovement[]
  [{
    create_date: "2024-01-15",
    amount: 5250.45,
    operation_type: "income",
    category: "sales",
    business_type: "B2B"
  }, ...]

HTTP Status: 200
Tamaño Response: ~50KB (360 items)
```

### Disponibles (No Consumidos)

| Endpoint | Método | Response | Filtros |
|----------|--------|----------|---------|
| `/health` | GET | `{status: "ok"}` | None |
| `/api/metrics/facets` | GET | `MetricsFacets` | None |
| `/api/metrics/summary` | GET | `MetricsSummaryItem[]` | group_by, dates, filters |
| `/api/metrics/categories/top` | GET | `TopCategoryItem[]` | operation_type, limit, dates |
| `/api/metrics/comparison` | GET | `MetricsComparison` | start_date, end_date, business_type |
| `/api/metrics/alerts` | GET | `MetricsAlert[]` | threshold, group_by, dates |
| `/api/metrics/b2b` | GET | `FinancialMovement[]` | dates, filters |
| `/api/metrics/b2c` | GET | `FinancialMovement[]` | dates, filters |

---

## Modelos de Datos

### FinancialMovement
```typescript
interface FinancialMovement {
  create_date: string      // ISO date "2024-01-15"
  amount: number           // 5250.45
  operation_type: "income" | "outcome"
  category: "suppliers" | "sales" | "operational" | "administrative" | "others"
  business_type: "B2B" | "B2C"
}
```

### KPIMetrics
```typescript
interface KPIMetrics {
  totalIncome: number      // Suma de todos income
  totalOutcome: number     // Suma de todos outcome
  profit: number           // totalIncome - totalOutcome
  profitPercent: number    // (profit / totalIncome) * 100
}
```

### MonthlyDataPoint
```typescript
interface MonthlyDataPoint {
  month: string            // "2024-01"
  income: number           // Ingresos del mes
  outcome: number          // Gastos del mes
  profitPercent: number    // (income - outcome) / income * 100
}
```

### Otros Modelos Backend (Pydantic)
```python
MetricsFacets:
  - operation_types: list[OperationType]
  - business_types: list[BusinessType]
  - categories: list[Category]
  - min_date: date
  - max_date: date

MetricsSummaryItem:
  - period: str
  - income: float
  - outcome: float
  - net: float

TopCategoryItem:
  - category: Category
  - operation_type: OperationType
  - total_amount: float

MetricsComparison:
  - current_period: float
  - previous_period: float
  - delta_abs: float
  - delta_pct: float | None

MetricsAlert:
  - period: str
  - outcome_total: float
  - baseline_average: float
  - increase_ratio: float
```

---

## Comunicación Frontend ↔ Backend

### HTTP Request Flow
```
Frontend (Vite Port 5173)
  │
  └─ fetch('/api/metrics')
     │
     └─ Vite Proxy Config (vite.config.ts)
        │
        └─ Redirect to http://backend:8000/api/metrics
           │
           └─ Docker Network (service name resolution)
              │
              └─ Backend (FastAPI Port 8000)
                 │
                 └─ UVicorn Server
                    │
                    └─ FastAPI Router
                       │
                       └─ routes.py::get_metrics()
                          │
                          └─ generate_mock_movements(seed=42)
                             │
                             └─ Return FinancialMovement[] JSON
```

### CORS Configuration
```python
# backend/app/main.py
CORSMiddleware(
    allow_origins=["*"],        # Allow all origins (dev)
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, etc.
    allow_headers=["*"],        # Any header
)
```

---

**Última actualización**: 2025-01-12  
**Arquitectura Status**: 🟢 Validada
