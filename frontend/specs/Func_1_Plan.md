# Funcionalidad 1: Filtro de rango de fechas

## Objetivo

Permitir que el equipo de finanzas filtre todos los datos del dashboard por una fecha de inicio, una fecha de fin o ambas. Si no se especifica ninguna fecha, se muestran todos los movimientos disponibles. La interfaz también informa el rango temporal disponible en el dataset.

## Estado actual y contratos

- `App.tsx` solicita `GET /api/metrics` al montar y calcula los KPI y los gráficos con los movimientos recibidos.
- `GET /api/metrics` ya acepta `start_date` y `end_date` opcionales, inclusivos, en formato de fecha `YYYY-MM-DD`.
- `GET /api/metrics/facets` ya devuelve `min_date` y `max_date`; estos valores se obtienen del dataset y no deben fijarse en la interfaz.
- El filtro puede implementarse en el frontend sin cambiar las rutas del backend, salvo que las comprobaciones revelen una discrepancia con estos contratos.

## Correspondencia entre la especificación y la API

| Wording de la especificación | Campo/parámetro real | Correspondencia |
|---|---|---|
| Fecha de inicio | `start_date` en `GET /api/metrics` | Coincide; parámetro opcional de tipo fecha, serializado como `YYYY-MM-DD`. |
| Fecha de fin | `end_date` en `GET /api/metrics` | Coincide; parámetro opcional de tipo fecha, serializado como `YYYY-MM-DD`. |
| Fecha más antigua y más reciente disponibles | `min_date` y `max_date` en `GET /api/metrics/facets` | Coincide semánticamente; esos son los nombres exactos que debe leer el frontend. |
| Filtrar todos los datos mostrados en la página | Filtro de `/api/metrics` y cálculos frontend sobre su respuesta | No hay un único campo o endpoint que filtre los KPI y gráficos: el dashboard calcula ambos desde la lista filtrada. Las demás vistas que consuman otros endpoints deberán reenviar el mismo rango. |

No se detecta un desajuste de formato o de parámetros para este filtro: el endpoint ya acepta las dos fechas de forma independiente y el rango de facets usa fechas ISO. La diferencia es de nomenclatura entre el texto funcional y los identificadores concretos de API, recogida en la tabla.

## Plan de implementación

1. **Tipar los metadatos de fecha**
   - Añadir al modelo de tipos frontend la respuesta mínima de facets: `min_date` y `max_date` como cadenas `YYYY-MM-DD`.
   - Mantener el contrato alineado con `MetricsFacets` del backend.

2. **Cargar el rango disponible**
   - Al iniciar el dashboard, solicitar `/api/metrics/facets` y guardar las fechas mínima y máxima.
   - Mostrar el rango junto a los controles de fecha una vez recibido.
   - Si esta solicitud falla, presentar un error comprensible y evitar mostrar fechas de referencia inventadas.

3. **Añadir los controles en la parte superior**
   - Incorporar dos inputs nativos de tipo fecha, etiquetados «Fecha de inicio» y «Fecha de fin», cerca de la cabecera y antes de los KPI.
   - Mantener ambos valores opcionales y controlados por el estado de React.
   - Usar `min_date` y `max_date` como límites válidos de los inputs y mostrarlos como referencia.

4. **Aplicar el filtro a todos los datos visibles**
   - Volver a solicitar `/api/metrics` cuando cambie el rango.
   - Construir los parámetros con `URLSearchParams`, omitiendo los valores vacíos para que una selección vacía no limite los resultados.
   - Enviar las fechas como `YYYY-MM-DD`; aceptar inicio, fin o ambos.
   - Calcular KPI y series de ambos gráficos exclusivamente a partir de la respuesta filtrada, manteniendo una única fuente de datos para todo el dashboard.
   - Mantener coherente el período mostrado en la cabecera con las fechas seleccionadas o con el rango de movimientos cargados; no conservar una etiqueta fija que contradiga los datos.

5. **Cubrir validación y estados de interfaz**
   - No enviar una consulta cuando la fecha de inicio sea posterior a la fecha de fin; indicar el problema y permitir corregirlo.
   - Mantener visibles los controles durante la carga y comunicar los errores de carga sin sustituir el formulario.
   - Si el rango válido no produce movimientos, mostrar KPI y gráficos en un estado vacío consistente, sin reutilizar valores del rango anterior.

## Criterios de aceptación

- Al abrir el dashboard sin fechas, se muestran todos los movimientos disponibles y el rango real `min_date`–`max_date`.
- Cambiar solo la fecha de inicio, solo la de fin o ambas filtra los KPI y los dos gráficos.
- Las fechas enviadas a la API usan `YYYY-MM-DD`; los campos vacíos no aparecen en la consulta.
- El inicio y el fin son inclusivos, acorde con el filtro existente del backend.
- El usuario no puede aplicar un rango invertido y recibe una indicación clara si intenta hacerlo.
- Los estados de carga, error y ausencia de resultados no muestran datos obsoletos como si correspondieran al rango actual.
- El período de la cabecera no contradice el conjunto de datos visualizado.

## Verificación prevista

- Comprobar el contrato de `/api/metrics/facets` y que `/api/metrics` acepta fechas individuales y combinadas.
- Añadir o adaptar pruebas frontend focalizadas para la construcción de parámetros, campos vacíos, recálculo de KPI/gráficos y rango invertido.
- Ejecutar las pruebas backend pertinentes si se modifica el backend y las pruebas/build frontend para validar la integración visual y de tipos.
