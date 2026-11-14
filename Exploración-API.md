# Exploración de la API

## Alcance

La documentación OpenAPI se consultó con el backend en marcha en [`/docs`](http://localhost:8000/docs). Los ejemplos de Swagger muestran la estructura y los tipos de respuesta; valores como `0` o `"string"` son marcadores, no datos reales.

## Endpoints para las funcionalidades

### Funcionalidad 1: filtro de fechas

`GET /api/metrics`

Query params:

- `start_date`, `end_date`: fechas opcionales (`YYYY-MM-DD`).
- `category`: categoría opcional (`suppliers`, `sales`, `operational`, `administrative`, `others`).
- `operation_type`: operación opcional (`income` o `outcome`).

Respuesta: array de movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`.

`GET /api/metrics/facets` no requiere parámetros y devuelve `operation_types`, `business_types`, `categories`, `min_date` y `max_date`.

### Funcionalidad 2: alertas

`GET /api/metrics/alerts`

Query params:

- `threshold`: número, predeterminado `0.3`, mínimo actual `0`.
- `group_by`: `day`, `week` o `month`; predeterminado `month`.
- `start_date`, `end_date`: fechas opcionales (`YYYY-MM-DD`).
- `business_type`: `B2B` o `B2C`, opcional.

Respuesta: array de alertas con `period`, `outcome_total`, `baseline_average` e `increase_ratio`.

La especificación de producto pide un umbral entre `0.01` y `1.0` y una media móvil de exactamente los tres períodos previos. El contrato actual no establece el máximo `1.0` y el cálculo implementado compara contra el promedio de todos los períodos anteriores; ambos puntos requieren ajuste para cumplir la funcionalidad.

### Funcionalidad 3: comparativa B2B vs B2C

`GET /api/metrics/categories/top`

Query params:

- `operation_type`: `income` o `outcome`; predeterminado `outcome`.
- `limit`: entero entre `1` y `20`; predeterminado `5`.
- `business_type`: `B2B` o `B2C`, opcional.
- `start_date`, `end_date`: fechas opcionales (`YYYY-MM-DD`).

Para obtener las categorías de ingreso de cada grupo se necesitan dos llamadas, una con `operation_type=income&business_type=B2B` y otra con `operation_type=income&business_type=B2C`. Cada respuesta es un array de `{ category, operation_type, total_amount }`.

`/api/metrics/facets` solo devuelve categorías globales; no indica cuáles pertenecen a cada línea de negocio. Además, `/api/metrics/categories/top` no devuelve el total completo de ingresos del grupo por separado, por lo que la UI no debe calcular el porcentaje sobre el grupo usando inadvertidamente solo la suma de las filas retornadas.

## Patrón actual del frontend

La búsqueda del código encontró una sola llamada `fetch`, en `frontend/src/App.tsx`. El helper actual:

- Usa `API_BASE_URL` (`VITE_API_BASE_URL` o cadena vacía) y llama a `/api/metrics`.
- Comprueba `response.ok` y devuelve el JSON como movimientos financieros.
- No construye query params ni utiliza `URLSearchParams`.
- Se ejecuta al montar `App`; todavía no hay carga reactiva a cambios de filtros.

Las nuevas llamadas pueden conservar el uso de `fetch` y la comprobación de `response.ok`, pero necesitan parámetros de query opcionales y tipos de respuesta distintos para facetas, alertas y categorías top. El rango de fechas y el umbral deberán volver a disparar las peticiones que dependan de ellos.

## Resumen

La API ya ofrece las rutas base para las tres funcionalidades y el filtro temporal está disponible en los endpoints de métricas, alertas y categorías top. La principal adaptación del frontend consiste en consumirlas con sus query params y manejar sus respuestas tipadas. Para cumplir toda la especificación aún hay que ajustar el cálculo/límites de alertas, enriquecer las facetas con información por grupo y garantizar un denominador completo para los porcentajes de la comparativa.


