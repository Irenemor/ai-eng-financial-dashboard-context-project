# Contrato de datos entre backend y frontend

Este documento define las llamadas, tipos, validaciones y estados visibles que necesita el frontend para implementar las tres funcionalidades. Los nombres de las propiedades JSON y query params son sensibles a mayúsculas/minúsculas y coinciden con OpenAPI. Los ejemplos de respuesta son payloads observados en el backend en ejecución; son datos simulados y pueden cambiar al regenerarse.

## Convenciones generales

- Base de API durante desarrollo: mismo origen mediante el proxy de Vite; todas las rutas de este contrato empiezan por `/api/`.
- Método y formato: `GET`, query params en URL y respuestas `application/json`.
- Los tipos compartidos son `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams` de `param-types.ts`; y `FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `TopCategoriesResponse` de `api-types.ts`.
- `FinancialMovement` es el tipo ya definido en `src/lib/financial-types.ts`; sus propiedades son `create_date: string`, `amount: number`, `operation_type: 'income' | 'outcome'`, `category: Category` y `business_type: 'B2B' | 'B2C'`.
- En las consultas, omitir un query param opcional cuando no se usa. No serializar una fecha vacía o `null` como la cadena `"null"`.
- OpenAPI describe respuestas exitosas y validación `422`. La respuesta `422` de FastAPI tiene forma `{ "detail": [...] }`; el texto interno de `detail` varía. No exponer ese texto variable directamente en la interfaz.
- Para errores `500`, conservar controles y filtros, limpiar los resultados que correspondan a una consulta anterior y ofrecer el botón literal «Reintentar».
- Los esquemas de respuesta declaran campos requeridos no nulos, salvo que se indique lo contrario. Un `null` en esos campos es una respuesta incompatible con el contrato.

---

## 1. Referencia de rango de fechas y vista B2B vs B2C (`FacetsResponse`)

### 1. Endpoint(s) y método HTTP

- `GET /api/metrics/facets`: obtiene referencias de fechas y opciones globales; no recibe query params.
- `GET /api/metrics`: obtiene los movimientos que alimentan el dashboard principal. Para el rango usa `start_date` y `end_date`.

### 2. Contrato de tipos TypeScript

- Petición de rango: `DateRangeFilter` de `param-types.ts` (`start_date?`, `end_date?`).
- Respuesta de facets: `FacetsResponse` de `api-types.ts`.
- Respuesta de movimientos: `FinancialMovement[]` de `src/lib/financial-types.ts`.
- Componentes: `DateRangeFilter` y `DashboardPage` de `components.md`; `ComparisonPage` reutiliza el filtro para mantener el mismo rango.

Payload real de `GET /api/metrics/facets`:

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}
```

Payload real de `GET /api/metrics?start_date=2025-11-01&end_date=2025-11-01`:

```json
[
  {
    "create_date": "2025-11-01",
    "amount": 5465.56,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2C"
  }
]
```

`FacetsResponse.categories` es una lista global. No hay un campo en el contrato actual que relacione categorías con `B2B` o `B2C`; la vista comparativa debe usar las respuestas filtradas por grupo de `/api/metrics/categories/top` para saber qué categorías tienen ingresos en cada grupo. No se debe leer una propiedad `categories_by_business_type` porque no existe en `FacetsResponse` ni en OpenAPI.

### 3. Tabla de parámetros y validaciones

`GET /api/metrics/facets` no tiene parámetros de query.

| Endpoint | Nombre | Tipo | Obligatorio | Default | Formato/restricciones |
|---|---|---|---|---|---|
| `/api/metrics` | `start_date` | fecha (`string`) | No | Ninguno | ISO `YYYY-MM-DD`; límite inferior inclusivo; omitir para no filtrar por inicio. |
| `/api/metrics` | `end_date` | fecha (`string`) | No | Ninguno | ISO `YYYY-MM-DD`; límite superior inclusivo; omitir para no filtrar por fin. |
| `/api/metrics` | `category` | `Category` | No | Ninguno | `suppliers`, `sales`, `operational`, `administrative`, `others`; no se usa en el filtro de fecha. |
| `/api/metrics` | `operation_type` | `'income' \| 'outcome'` | No | Ninguno | Solo esos dos valores; no se usa en el filtro de fecha. |

`DateRangeFilter` incluye únicamente `start_date` y `end_date`. Los parámetros `category` y `operation_type` son filtros adicionales de `/api/metrics`, pero no forman parte del requerimiento de esta funcionalidad.

### 4. Casos límite y comportamiento exacto de la UI

| Caso | Respuesta/condición | Comportamiento exacto |
|---|---|---|
| Rango sin registros | `GET /api/metrics?start_date=2025-11-05&end_date=2025-11-05` devuelve `[]` en el backend observado. | `DashboardPage` conserva filtros y KPI, pone los KPI en cero, deja los gráficos sin series y muestra «No hay movimientos para el rango seleccionado.»; no conserva datos del rango anterior. |
| Inicio posterior al fin | El backend actual filtra ambos límites y devuelve `[]`; no valida el orden como error `422`. | `DateRangeFilter` no envía la consulta y muestra «La fecha de inicio no puede ser posterior a la fecha de fin.» junto a los inputs. |
| Fecha mal formada o enum inválido | FastAPI responde `422` con `{ "detail": [...] }`. | `DashboardPage` mantiene los controles y muestra «La API rechazó los parámetros del filtro (HTTP 422). Corrige las fechas y vuelve a intentarlo.»; no muestra datos previos. |
| Error del endpoint de facets | Respuesta `500` o fallo de red. | `DateRangeFilter` conserva los inputs sin límites inferidos y muestra «No se pudo cargar el rango disponible (HTTP 500).» o «No se pudo cargar el rango disponible. Comprueba la conexión.» respectivamente. El dashboard principal puede seguir cargándose. |

---

## 2. Tabla de anomalías (`AlertsParams` -> `AlertsResponse`)

### 1. Endpoint(s) y método HTTP

- `GET /api/metrics/alerts`: obtiene alertas agrupadas por período. El filtro de fecha se reenvía desde `DateRangeFilter`.

### 2. Contrato de tipos TypeScript

- Petición: `AlertsParams` de `param-types.ts`, que extiende `DateRangeFilter` e incluye `threshold?`, `group_by?` y `business_type?`.
- Respuesta: `AlertsResponse` de `api-types.ts`, equivalente a `AlertEntry[]`.
- Cada `AlertEntry` tiene exactamente `period: string`, `outcome_total: number`, `baseline_average: number` e `increase_ratio: number`.
- Componentes: `AlertsPanel`, `ThresholdControl` y `AlertsTable` de `components.md`.

Payload real observado de `GET /api/metrics/alerts?threshold=0.3&group_by=month` (extracto de dos filas):

```json
[
  {
    "period": "2025-12",
    "outcome_total": 103378.98,
    "baseline_average": 41404.44,
    "increase_ratio": 1.4968
  },
  {
    "period": "2026-03",
    "outcome_total": 88076.9,
    "baseline_average": 55334.29,
    "increase_ratio": 0.5917
  }
]
```

`increase_ratio` es un ratio decimal, no un porcentaje. La UI presenta `increase_ratio * 100`; por ejemplo, `1.4968` se muestra como `149,68 %`.

**Desajuste de implementación a resolver:** OpenAPI permite `threshold >= 0` sin máximo, mientras el producto exige `0.01`–`1.0`. Además, el backend observado calcula `baseline_average` usando todos los períodos anteriores, no exactamente los tres anteriores. Para cumplir la especificación, el backend debe aplicar ambos requisitos; el frontend no debe recalcular ni etiquetar como «media de 3 períodos» un promedio que no respete esa ventana.

### 3. Tabla de parámetros y validaciones

| Nombre | Tipo | Obligatorio | Default API | Formato/restricciones API | Validación de producto/UI |
|---|---|---|---|---|---|
| `threshold` | `number` | No | `0.3` | Mínimo API `0`; OpenAPI no fija máximo. | Solo enviar valores entre `0.01` y `1.0`, inclusive. Ratio decimal, paso del control `0.01`. |
| `group_by` | `'day' \| 'week' \| 'month'` | No | `'month'` | Enum exacto; con `month`, `period` usa `YYYY-MM`; con `day`, fecha ISO; con `week`, año y semana ISO. | La tabla usa `'month'` y lo envía explícitamente para que la granularidad sea estable. |
| `start_date` | fecha (`string`) | No | Ninguno | `YYYY-MM-DD`; inclusiva. | Tomar del rango compartido; omitir si está vacío. |
| `end_date` | fecha (`string`) | No | Ninguno | `YYYY-MM-DD`; inclusiva. | Tomar del rango compartido; omitir si está vacío. |
| `business_type` | `'B2B' \| 'B2C'` | No | Ninguno | Enum exacto. | Omitir para alertas generales del dashboard; solo enviar si la vista solicita alertas de un grupo específico. |

Todos los parámetros son opcionales en OpenAPI. `AlertsParams` también los declara opcionales; el frontend fija `threshold=0.3` y `group_by='month'` en su estado inicial y envía esos dos valores explícitamente.

### 4. Casos límite y comportamiento exacto de la UI

| Caso | Respuesta/condición | Comportamiento exacto |
|---|---|---|
| Sin anomalías | Respuesta válida `[]`. | `AlertsTable` conserva encabezados y muestra «No se detectaron anomalías para este umbral y rango.» |
| Ceros | Un campo numérico vale `0`. | Mostrar `0,00` para importes y `0,00 %` para `increase_ratio`; nunca dividir en el cliente ni mostrar `NaN` o infinito. |
| Valor `null` en una propiedad de respuesta | OpenAPI declara las cuatro propiedades no nulas; `null` incumple el contrato. | Rechazar la respuesta completa, limpiar filas previas y mostrar «La API devolvió una alerta con datos no válidos.» |
| Umbral fuera del rango de producto | Menor que `0.01`, mayor que `1.0` o vacío mientras se edita. | `ThresholdControl` muestra «Introduce un umbral entre 0,01 y 1,00.» y no solicita datos hasta que el valor sea válido. |
| Rechazo de parámetros | HTTP `422`, por ejemplo, fecha mal formada, enum no admitido o `threshold < 0`. | Mantener filtros y mostrar «La API rechazó los parámetros de alertas (HTTP 422). Revisa el umbral y las fechas.»; no presentar las filas anteriores. |
| Error interno | HTTP `500`. | Mostrar «No se pudieron cargar las alertas (HTTP 500).» y el botón «Reintentar». Al pulsarlo, repetir exactamente la última consulta válida. |

---

## 3. Tabla comparativa B2B vs B2C (`TopCategoriesParams` -> `TopCategoriesResponse`)

### 1. Endpoint(s) y método HTTP

- `GET /api/metrics/facets`: obtiene las listas globales de `business_types` y `categories`; no tiene query params.
- `GET /api/metrics/categories/top`: hacer una llamada para `business_type=B2B` y otra para `business_type=B2C`, ambas con `operation_type=income`, `limit=5` y las fechas activas.

### 2. Contrato de tipos TypeScript

- Petición por grupo: `TopCategoriesParams` de `param-types.ts`, que extiende `DateRangeFilter` e incluye `operation_type?`, `limit?` y `business_type?`.
- Respuesta de cada grupo: `TopCategoriesResponse` de `api-types.ts`, equivalente a `CategoryEntry[]`.
- Cada `CategoryEntry` contiene exactamente `category: Category`, `operation_type: OperationType` y `total_amount: number`.
- La referencia de opciones es `FacetsResponse` de `api-types.ts`; actualmente sus `categories` son globales, no una relación por grupo.
- Componentes: `ComparisonPage`, `BusinessCategorySection`, `RevenueComparisonChart` y `DateRangeFilter` de `components.md`.

Payloads reales observados de las dos llamadas (cada array es la respuesta de una llamada independiente):

```json
[
  { "category": "sales", "operation_type": "income", "total_amount": 557903.97 },
  { "category": "others", "operation_type": "income", "total_amount": 57636.75 }
]
```

```json
[
  { "category": "sales", "operation_type": "income", "total_amount": 574193.41 },
  { "category": "others", "operation_type": "income", "total_amount": 68412.74 }
]
```

El primer array corresponde a `business_type=B2B`; el segundo, a `business_type=B2C`. El endpoint no devuelve un campo de porcentaje ni un total general. En el modelo actual `Category` enumera exactamente cinco categorías y `limit=5` puede devolver todas las categorías posibles con ingresos del grupo; se calcula `totalIncome` sumando todos los `total_amount` de la respuesta, y `groupSharePercent = total_amount / totalIncome * 100`. Si en el futuro se añaden más de cinco valores a `Category`, el contrato deberá cambiar: pedir `limit=20` y mostrar solo las cinco primeras, o añadir un total agregado explícito.

La especificación de producto pide categorías por grupo desde facets, pero `FacetsResponse.categories` no está segmentado. Con el API actual, el frontend usa `categories` como vocabulario global y las filas de cada llamada `categories/top` para identificar las categorías de ingreso presentes en cada grupo. No debe suponerse que `FacetsResponse` contiene una propiedad agrupada que no figura en su tipo.

### 3. Tabla de parámetros y validaciones

`GET /api/metrics/facets` no tiene parámetros de query.

| Nombre en `/api/metrics/categories/top` | Tipo | Obligatorio | Default API | Formato/restricciones API | Valor enviado por la comparativa |
|---|---|---|---|---|---|
| `operation_type` | `'income' \| 'outcome'` | No | `'outcome'` | Enum exacto. | `'income'` explícito. |
| `limit` | `integer` | No | `5` | Mínimo `1`, máximo `20`. | `5`; la tabla no muestra más de cinco categorías. |
| `start_date` | fecha (`string`) | No | Ninguno | ISO `YYYY-MM-DD`; inclusiva. | Valor de `DateRangeFilter`; omitir si vacío. |
| `end_date` | fecha (`string`) | No | Ninguno | ISO `YYYY-MM-DD`; inclusiva. | Valor de `DateRangeFilter`; omitir si vacío. |
| `business_type` | `'B2B' \| 'B2C'` | No | Ninguno | Enum exacto. | `'B2B'` en la primera llamada y `'B2C'` en la segunda. |

En OpenAPI todos los parámetros son opcionales. Para cumplir la comparativa, el frontend debe enviar `operation_type`, `limit` y `business_type` explícitamente; las fechas se incluyen solo si están seleccionadas.

### 4. Casos límite y comportamiento exacto de la UI

| Caso | Respuesta/condición | Comportamiento exacto |
|---|---|---|
| Un grupo no tiene categorías de ingreso | Su `TopCategoriesResponse` es `[]`, el otro grupo puede tener filas. | `BusinessCategorySection` mantiene el encabezado del grupo y muestra «Sin categorías de ingresos para B2B en el rango seleccionado.» o la variante literal `B2C`; el otro grupo se renderiza normalmente. El total del grupo vacío es `0,00`. |
| Ambos grupos vacíos | Ambas respuestas son `[]`. | Las dos secciones muestran sus mensajes de vacío y el gráfico muestra «No hay ingresos para comparar en el rango seleccionado.»; no se ocultan las secciones. |
| Total de un grupo es cero | `totalIncome === 0`. | Mostrar los importes como `0,00` y las cuotas como `0,00 %`; no dividir por cero. Si la lista está vacía, mostrar el estado vacío definido arriba. |
| `null` o importe no numérico en una fila | La respuesta contradice `CategoryEntry.total_amount: number`. | Rechazar esa respuesta de grupo, mostrar «La API devolvió categorías con datos no válidos.» en la sección afectada y marcar el gráfico «Comparación incompleta». |
| Query inválida | HTTP `422`, por ejemplo `limit` fuera de `1..20`, fecha inválida o enum no admitido. | Mantener el filtro de fechas y mostrar «La API rechazó los parámetros de la comparativa (HTTP 422). Revisa el rango de fechas.»; borrar resultados previos de ambas llamadas. |
| Error interno en una llamada | HTTP `500` de B2B o B2C. | Mostrar «No se pudo cargar la comparación B2B vs B2C (HTTP 500).» y el botón «Reintentar». No presentar un gráfico como comparación completa hasta que ambas respuestas estén disponibles. |

---

## Reglas de presentación comunes

- Orden de tablas comparativas: `total_amount` descendente; empates por `category` ascendente. Grupos siempre en orden B2B y después B2C.
- Orden de alertas: `period` descendente, más reciente primero. `increase_ratio` se muestra multiplicado por 100; no se transforma el valor almacenado en el estado de petición.
- El contrato no declara moneda. Hasta que el backend exponga una moneda, mostrar importes con dos decimales y separadores de locale (`es-ES`), sin añadir símbolo de moneda.
- Los errores se representan junto a la región que falló, distinguiendo HTTP `422`, HTTP `500`, conexión fallida y respuesta vacía `[]`.
- Las propiedades `min_date`, `max_date`, `operation_types`, `business_types`, `categories`, `period`, `outcome_total`, `baseline_average`, `increase_ratio`, `category`, `operation_type` y `total_amount` deben conservar exactamente esa escritura en el acceso al JSON.
