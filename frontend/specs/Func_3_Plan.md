# Funcionalidad 3: Vista comparativa B2B vs B2C

## Objetivo

Crear una página del dashboard para comparar los ingresos de B2B y B2C en un rango de fechas opcional. La página muestra dos tablas paralelas con las cinco categorías de ingreso principales de cada grupo y un gráfico único con el total de ingresos de ambos grupos.

## Estado actual y contratos

- `GET /api/metrics/categories/top` ya permite solicitar categorías por `operation_type`, `limit`, `business_type`, `start_date` y `end_date`.
- `GET /api/metrics/facets` devuelve las categorías y los tipos de negocio como listas globales. No relaciona actualmente las categorías disponibles con cada tipo de negocio, por lo que su respuesta debe ampliarse para cumplir esa parte de la especificación.
- Los tipos de categoría y el modelo frontend de movimientos ya existen. El frontend no tiene actualmente un sistema de rutas ni una página comparativa.
- El endpoint de categorías top devuelve solo las categorías solicitadas; el porcentaje debe usar el total de ingresos de todo el grupo y no la suma de las cinco filas si hubiera más categorías con ingresos.

## Correspondencia entre la especificación y la API

| Wording de la especificación | Campo/parámetro real | Desajuste o tratamiento |
|---|---|---|
| Categoría / nombre de categoría | `category` en la respuesta de `/api/metrics/categories/top` | Coincide semánticamente; `category` es el nombre de campo exacto. |
| Total de ingresos de la categoría | `total_amount` junto con `operation_type=income` | La respuesta no tiene un campo llamado `income_total`; `total_amount` es el importe y `operation_type` identifica que se trata de ingresos. |
| Una sección para B2B y otra para B2C | Query param `business_type` (`B2B` o `B2C`) | El parámetro es opcional en la API, pero debe enviarse para distinguir los grupos; el endpoint permite un grupo por petición, por lo que la UI debe hacer una llamada por grupo. El ejemplo de la especificación lo omite. |
| Cinco categorías principales | Query param `limit=5` | Coincide con el endpoint indicado; la respuesta se limita a ese número de categorías. |
| Porcentaje sobre el total del grupo | No existe campo de porcentaje ni total general en `TopCategoryItem` | `total_amount` solo describe cada categoría devuelta. Para obtener un denominador correcto hace falta ampliar la respuesta con el total completo del grupo o calcularlo desde todos sus movimientos filtrados. |
| Total de ingresos B2B frente a B2C para el gráfico | No hay un campo de total de grupo en `/api/metrics/categories/top` | No se debe inferir el total del grupo sumando solo las cinco categorías. Se necesita un total agregado fiable, por extensión de API o agregación de todos los movimientos del grupo y rango. |
| Categorías disponibles para cada grupo desde facets | `categories` y `business_types` en `/api/metrics/facets` | La respuesta actual contiene listas globales separadas; no relaciona categorías con B2B/B2C ni acepta rango de fechas. Debe ampliarse o documentarse una estrategia de consulta que dé disponibilidad por grupo. |
| Rango de fechas opcional | Query params opcionales `start_date` y `end_date` en `/api/metrics/categories/top` | El endpoint los acepta en `YYYY-MM-DD`; se deben incluir en ambas llamadas. El endpoint de facets actualmente no recibe esos parámetros. |

Los nombres reales de respuesta son `category`, `operation_type` y `total_amount`; no existen propiedades separadas para nombre, porcentaje o total del grupo. La implementación debe respetar ese contrato y resolver las brechas de facetas/denominador antes de afirmar que cumple toda la especificación.

## Plan de implementación

1. **Completar facetas por grupo**
   - Ampliar la respuesta de `/api/metrics/facets` para incluir las categorías disponibles por `business_type` (B2B y B2C), manteniendo los campos existentes para compatibilidad.
   - Calcular la disponibilidad a partir de los movimientos reales del dataset, considerando categorías con ingresos y no solo el conjunto global de categorías.
   - Tipar la respuesta ampliada en el frontend y usar las facetas para conocer las categorías disponibles de cada sección.

2. **Añadir navegación a la nueva página**
   - Crear una página comparativa independiente y permitir navegar entre ella y el dashboard principal.
   - Como el frontend no incluye un router, incorporar rutas client-side explícitas (por ejemplo, `/` para el dashboard y `/comparison` para la comparativa) y enlaces o botones de navegación coherentes con la interfaz existente.
   - Mantener la página comparativa separada del contenido principal para que el usuario pueda acceder a ella como una vista del dashboard.

3. **Compartir el filtro de fechas**
   - Reutilizar el rango de fechas de la Funcionalidad 1 y su formato `YYYY-MM-DD`; no crear un estado de filtro independiente que pueda divergir.
   - Permitir ambos campos vacíos para comparar todos los datos y enviar solo los parámetros de fecha que tengan valor.
   - Mostrar y validar el rango disponible con los metadatos de facets cuando la página incluya los controles de fecha.

4. **Cargar y preparar datos de cada grupo**
   - Consultar `/api/metrics/categories/top` para `operation_type=income` y `business_type=B2B`, y repetir para `business_type=B2C`, incluyendo las fechas activas.
   - Solicitar suficientes categorías para calcular el ingreso total completo de cada grupo; renderizar solo las cinco de mayor ingreso. Si el contrato actual no permite obtener denominadores completos de forma fiable, ampliarlo para devolver explícitamente el total de ingresos del grupo.
   - Calcular para cada fila el porcentaje como `total_categoria / total_ingresos_grupo * 100`; tratar un total cero sin producir `NaN` o infinito.
   - Preparar un único conjunto de datos para el gráfico con el total de ingresos de B2B y B2C.

5. **Construir tablas y gráfico**
   - Presentar dos secciones en paralelo, identificadas claramente como B2B y B2C.
   - Cada tabla muestra categoría, ingresos totales y porcentaje sobre el total de ingresos de su grupo, ordenada de mayor a menor y limitada a cinco filas.
   - Bajo ambas secciones, añadir un único gráfico comparativo de los totales de ingreso B2B y B2C usando Recharts, ya instalado en el proyecto.
   - Formatear importes y porcentajes consistentemente y adaptar el diseño a pantallas estrechas sin solapar las tablas.

6. **Resolver estados de carga y datos vacíos**
   - Mostrar carga y errores de forma diferenciada para las facetas y los datos comparativos.
   - Si un grupo no tiene ingresos en el rango, conservar su sección y mostrar un estado vacío; el gráfico debe seguir indicando el total cero de ese grupo.
   - Si ambos grupos no tienen datos, mostrar un estado vacío explícito en las tablas y el gráfico, sin conservar resultados de un filtro anterior.

## Criterios de aceptación

- Existe una página navegable de comparativa separada del dashboard principal.
- Cada grupo presenta como máximo sus cinco categorías de ingreso principales con total y porcentaje calculado sobre todos sus ingresos.
- Las categorías disponibles para B2B y B2C provienen de `/api/metrics/facets` con información asociada a cada grupo.
- Un único gráfico compara los totales de ingreso de ambos grupos.
- Las fechas opcionales se envían en formato `YYYY-MM-DD` y afectan a las dos tablas y al gráfico.
- El porcentaje se mantiene definido cuando el total del grupo es cero y los estados vacíos son visibles.
- La página funciona en escritorio y móvil; carga y errores no se confunden con ausencia de resultados.

## Verificación prevista

- Añadir pruebas backend para las categorías de facets agrupadas por tipo de negocio y para los totales de ingresos, con y sin fechas.
- Verificar las llamadas de categorías top por grupo, los parámetros de fecha, la selección de cinco filas y el cálculo de porcentajes.
- Probar navegación entre las dos páginas, resultados vacíos por grupo y presentación responsive.
- Ejecutar las pruebas backend afectadas y las pruebas/build frontend una vez implementada la funcionalidad.
