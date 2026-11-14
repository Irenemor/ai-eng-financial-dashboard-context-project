# Especificación de componentes

Este documento describe los componentes, sus props y las decisiones de interfaz para las tres funcionalidades. Los tipos crudos de API y query se importan de `api-types.ts` y `param-types.ts`; no se vuelven a declarar en los props.

## Tipos compartidos

Los bloques de props de esta especificación asumen estos imports:

```ts
import type {
  AlertsResponse,
  CategoryEntry,
  FacetsResponse,
  TopCategoriesResponse,
} from './api-types'
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from './param-types'
import type {
  BusinessType,
  FinancialMovement,
} from '../src/lib/financial-types'
```

El modelo de vista de la comparativa es derivado, no una respuesta de API:

```ts
interface ComparisonCategoryViewModel extends CategoryEntry {
  groupSharePercent: number
}

interface ComparisonGroupViewModel {
  businessType: BusinessType
  totalIncome: number
  categories: ComparisonCategoryViewModel[]
}
```

`totalIncome` y `groupSharePercent` solo se calculan cuando se dispone de un denominador completo; no existen en `TopCategoriesResponse`.

## Componentes compartidos

### `App` (componente raíz)

Coordina la navegación entre `/` y `/comparison`, conserva el filtro de fechas compartido y pasa datos, parámetros y callbacks a la página activa. No necesita una interfaz de props porque es el punto de entrada de la aplicación.

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** ruta `/`, fechas vacías y vista del dashboard principal.
- **Carga/vacío/error:** no bloquea la navegación por las peticiones; cada página representa sus propios estados de datos.
- **Ordenación inicial:** no aplica a navegación.
- **Interacción:** cambiar de vista conserva el rango de fechas; volver al dashboard reutiliza sus filtros y vuelve a cargar los datos si el rango cambió.

### `DateRangeFilter`

Props:

```ts
interface DateRangeFilterProps {
  value: DateRangeFilter
  facets: FacetsResponse | null
  facetsLoading: boolean
  facetsError: string | null
  disabled?: boolean
  validationError?: string | null
  onChange: (value: DateRangeFilter) => void
}
```

Renderiza inputs nativos `type="date"` para `start_date` y `end_date`, mostrando `min_date` y `max_date` de `FacetsResponse`. No realiza peticiones ni construye URLs.

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** ambas fechas empiezan vacías, lo que representa el dataset completo; límites se muestran cuando llegan las facetas.
- **Carga/vacío/error:** durante la carga se muestra el texto de estado del rango; si faltan datos, no se inventan límites. Un error de facetas se presenta junto al control, pero no elimina los inputs.
- **Ordenación inicial:** no aplica a controles de fecha.
- **Interacción:** se permite un extremo sin el otro; ambos límites son inclusivos. El padre rechaza inicio posterior al fin. Enviar cambios solo si el rango es válido; valores vacíos se omiten del query.

## Funcionalidad 1: filtro del dashboard

### `DashboardPage`

Props:

```ts
interface DashboardPageProps {
  dateFilter: DateRangeFilter
  facets: FacetsResponse | null
  facetsLoading: boolean
  facetsError: string | null
  movements: FinancialMovement[]
  loading: boolean
  error: string | null
  onDateFilterChange: (value: DateRangeFilter) => void
}
```

Compone `DashboardHeader`, `DateRangeFilter`, `KPIRow`, `IncomeOutcomeChart`, `ProfitPercentChart` y `AlertsPanel`. Las métricas se calculan solo con los movimientos de la consulta correspondiente al filtro actual.

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** rango vacío; se solicita `/api/metrics` sin fechas y se muestran todos los datos.
- **Carga/vacío/error:** mantiene cabecera y filtros durante carga. Si la lista de movimientos está vacía, muestra un estado vacío en vez de valores antiguos. Un error de métricas se muestra en su región; un error de facets no borra el dashboard.
- **Ordenación inicial:** gráficos por período en orden cronológico ascendente; KPI mantienen el orden existente en `KPIRow`.
- **Interacción:** al modificar un extremo válido, consulta `/api/metrics` enviando solo las fechas no vacías. No aplica rangos invertidos. El período de la cabecera representa el filtro o los datos cargados, no una etiqueta fija.

## Funcionalidad 2: tabla de alertas

### `AlertsPanel`

Props:

```ts
interface AlertsPanelProps {
  params: AlertsParams
  alerts: AlertsResponse
  loading: boolean
  error: string | null
  onParamsChange: (value: AlertsParams) => void
}
```

Contiene `ThresholdControl` y `AlertsTable`, y se ubica debajo de los gráficos del dashboard.

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** `threshold` usa `0.3`; la agrupación de la vista es mensual (`group_by: 'month'`). El rango de fechas viene del dashboard.
- **Carga/vacío/error:** conserva el panel durante carga; lista vacía muestra «No se detectaron anomalías para este umbral y rango»; error se distingue del vacío.
- **Ordenación inicial:** períodos del más reciente al más antiguo para priorizar alertas actuales.
- **Interacción:** solo una configuración válida dispara la petición; cambios de umbral y rango actualizan los resultados. No conserva resultados del filtro anterior como actuales.

### `ThresholdControl`

Props:

```ts
interface ThresholdControlProps {
  params: AlertsParams
  disabled?: boolean
  onParamsChange: (value: AlertsParams) => void
}
```

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** muestra `params.threshold ?? 0.3`; input numérico con mínimo `0.01`, máximo `1.0` y paso `0.01`.
- **Carga/vacío/error:** deshabilitado mientras se actualizan las alertas; errores de API se muestran en `AlertsPanel`, no como error de validación del input.
- **Ordenación inicial:** no aplica a un control numérico.
- **Interacción:** el valor se interpreta como ratio decimal, no como porcentaje entero. Valores fuera del intervalo o incompletos no se envían; la API vigente declara mínimo `0`, por lo que el frontend conserva el límite de producto `0.01`–`1.0`.

### `AlertsTable`

Props:

```ts
interface AlertsTableProps {
  alerts: AlertsResponse
  loading: boolean
  error: string | null
}
```

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** importe y media usan formato de moneda; `increase_ratio` se muestra como porcentaje (`ratio * 100`).
- **Carga/vacío/error:** carga con indicador en el cuerpo de la tabla; lista vacía con el mensaje explícito del panel; error con estado visible dentro de la región.
- **Ordenación inicial:** descendente por `period`; no hay controles interactivos de ordenación.
- **Interacción:** columnas fijas `period`, `outcome_total`, `baseline_average` e incremento. La tabla permanece montada en los tres estados.

## Funcionalidad 3: comparativa B2B vs B2C

### `ComparisonPage`

Props:

```ts
interface ComparisonPageProps {
  dateFilter: DateRangeFilter
  facets: FacetsResponse | null
  b2bParams: TopCategoriesParams
  b2cParams: TopCategoriesParams
  b2bCategories: TopCategoriesResponse
  b2cCategories: TopCategoriesResponse
  groups: ComparisonGroupViewModel[]
  loading: boolean
  error: string | null
  onDateFilterChange: (value: DateRangeFilter) => void
}
```

Renderiza el filtro compartido, dos `BusinessCategorySection` en paralelo y un `RevenueComparisonChart` debajo. Cada consulta debe identificar el grupo con `business_type`, usar `operation_type: 'income'`, `limit: 5` y reenviar fechas activas.

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** fechas vacías; una consulta por grupo con ingresos, `limit=5` y los valores de query requeridos explícitos aunque la API tenga defaults.
- **Carga/vacío/error:** carga de las dos solicitudes de categorías en paralelo. Se mantienen ambas secciones; grupo vacío no impide mostrar el otro. Si falla una solicitud, esa sección muestra el error y el gráfico indica que la comparación está incompleta.
- **Ordenación inicial:** grupos en orden B2B, luego B2C; cada grupo ordena categorías por ingresos descendentes.
- **Interacción:** cambiar el rango actualiza ambas consultas. La navegación a la página conserva el rango compartido; volver al dashboard no crea un filtro distinto.

### `BusinessCategorySection`

Props:

```ts
interface BusinessCategorySectionProps {
  group: ComparisonGroupViewModel
  loading: boolean
  error: string | null
}
```

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** muestra como máximo cinco categorías y el total completo de ingresos del grupo solo si está disponible.
- **Carga/vacío/error:** mantiene título B2B/B2C; sin categorías muestra un mensaje explícito. Error de un grupo no oculta la otra sección.
- **Ordenación inicial:** `total_amount` descendente; empates por nombre de categoría ascendente para un resultado determinista.
- **Interacción:** tabla no editable ni ordenable por el usuario. Por fila muestra `category`, `total_amount` y `groupSharePercent`; no calcula la cuota sobre la suma de las cinco filas.

### `RevenueComparisonChart`

Props:

```ts
interface RevenueComparisonChartProps {
  groups: ComparisonGroupViewModel[]
  loading: boolean
  error: string | null
}
```

#### Decisiones y resolución de ambigüedades

- **Valores por defecto:** barras comparativas únicas para B2B y B2C, en ese orden, con totales completos; un grupo sin ingresos se representa con cero.
- **Carga/vacío/error:** indicador durante carga; si ambos totales son cero o no hay datos, muestra un estado vacío explícito; error o datos parciales no se presentan como comparación completa.
- **Ordenación inicial:** B2B primero y B2C segundo, sin reordenar por magnitud.
- **Interacción:** gráfico no editable; tooltip accesible muestra grupo e importe. En móvil mantiene ambos grupos comparables sin recortar etiquetas.

## Contratos y dependencias pendientes

- `FacetsResponse` expone listas globales y rango, pero no categorías agrupadas por tipo de negocio.
- `TopCategoriesResponse` contiene filas limitadas y no incluye el total completo del grupo ni porcentajes; el backend o el adaptador debe proporcionar un denominador completo para tablas y gráfico.
- OpenAPI establece `threshold` con default `0.3` y mínimo `0`, pero no el intervalo de producto `0.01`–`1.0`; el control lo valida y el backend debe alinearse.
- Los tipos de respuesta y parámetros se importan de `api-types.ts` y `param-types.ts`; los únicos tipos locales son modelos derivados de vista y props de presentación.
