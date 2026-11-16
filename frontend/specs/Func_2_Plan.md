# Funcionalidad 2: Tabla de alertas de anomalías

## Objetivo

Añadir debajo de los gráficos del dashboard una tabla con los períodos en los que el gasto aumentó de forma inesperada. El usuario configura el umbral como ratio entre `0.01` y `1.0`, con valor inicial `0.3`. Las alertas deben usar el rango de fechas activo en el dashboard.

## Estado actual y contratos

- `GET /api/metrics/alerts` ya devuelve `period`, `outcome_total`, `baseline_average` e `increase_ratio`; el parámetro `threshold` tiene valor predeterminado `0.3`.
- La ruta ya admite `start_date` y `end_date`, por lo que puede compartir el rango de fechas de la Funcionalidad 1.
- El umbral del backend actualmente solo tiene límite inferior `0`, no el intervalo requerido `0.01`–`1.0`.
- El cálculo actual compara cada período con la media de todos los períodos anteriores. La especificación requiere comparar con la media móvil de exactamente los tres períodos anteriores.

## Correspondencia entre la especificación y la API

| Wording/valor de la especificación | Campo/parámetro real | Desajuste o tratamiento |
|---|---|---|
| Outcome registrado | `outcome_total` en cada alerta | El nombre de respuesta no es `outcome`; representa el importe de gastos del período y debe usarse como valor mostrado. |
| Media móvil de los 3 períodos anteriores | `baseline_average` | El campo existe, pero el cálculo actual promedia todos los períodos anteriores. Debe recalcularse con una ventana exacta de tres períodos para cumplir el wording. |
| Incremento porcentual | `increase_ratio` | La API entrega un ratio decimal, no un porcentaje ya multiplicado por 100. La UI debe mostrar `increase_ratio * 100` con formato de porcentaje. |
| Umbral entre `0.01` y `1.0`, predeterminado `0.3` | Query param `threshold`, predeterminado `0.3`, mínimo actual `0` | El default coincide; la validación de API no coincide con los límites especificados: falta el mínimo `0.01` y el máximo `1.0`. |
| Rango de fechas de Funcionalidad 1 | Query params opcionales `start_date` y `end_date` | La ruta los acepta en `YYYY-MM-DD`; el cliente debe reenviar los valores activos. |

La respuesta mantiene la forma `{ period, outcome_total, baseline_average, increase_ratio }`. No hace falta renombrar los campos para la tabla; sí hay que alinear la semántica de `baseline_average`, la conversión visual del ratio y los límites de `threshold`.

## Plan de implementación

1. **Ajustar el contrato y el cálculo de alertas en backend**
   - Restringir `threshold` a `0.01 <= threshold <= 1.0`, conservando `0.3` como predeterminado.
   - Calcular la media de `outcome` usando solo los tres períodos inmediatamente anteriores al período evaluado.
   - No evaluar un período hasta que existan tres períodos anteriores; evitar alertas basadas en una ventana incompleta.
   - Emitir una alerta cuando el incremento relativo frente a esa media alcance o supere el umbral: `(outcome_actual - media_anterior) / media_anterior`.
   - Mantener el contrato de respuesta existente. La interfaz presentará `increase_ratio` como porcentaje (`ratio * 100`) y `baseline_average` como la media móvil indicada en la especificación.

2. **Añadir tipos y presentación de la tabla**
   - Definir el tipo frontend de una alerta con los campos que devuelve la API.
   - Crear o incorporar un componente de alertas siguiendo los componentes del dashboard.
   - Situarlo inmediatamente debajo de los dos gráficos y mostrar las cuatro columnas: período, gasto registrado (`outcome_total`), media móvil de tres períodos (`baseline_average`) e incremento porcentual (`increase_ratio`).
   - Formatear los importes y el porcentaje de forma legible y consistente con el resto del dashboard.

3. **Añadir el control del umbral**
   - Incluir un input numérico asociado a las alertas, con valor inicial `0.3`, mínimo `0.01`, máximo `1.0` y paso `0.01`.
   - Validar el valor antes de solicitar datos y reflejarlo en el parámetro `threshold` como ratio, no como porcentaje entero.
   - Actualizar la tabla cuando el usuario cambie el umbral válido.

4. **Sincronizar rango de fechas y estados**
   - Solicitar `GET /api/metrics/alerts` con el umbral actual y añadir `start_date` y/o `end_date` solo cuando estén activos en el filtro de la Funcionalidad 1.
   - Volver a consultar las alertas al cambiar el rango de fechas o el umbral.
   - Mantener la tabla visible durante carga, error y ausencia de anomalías. Si la respuesta está vacía, mostrar un mensaje explícito, por ejemplo: «No se detectaron anomalías para este umbral y rango».
   - Evitar mostrar resultados anteriores como si pertenecieran al umbral o rango actual.

## Criterios de aceptación

- La tabla aparece bajo los gráficos y contiene período, gasto registrado, media de los tres períodos previos e incremento porcentual.
- El control inicia en `0.3` y solo admite ratios entre `0.01` y `1.0`.
- El backend detecta alertas usando exactamente los tres períodos anteriores y respeta el umbral configurado.
- La consulta incluye las fechas activas del dashboard; al limpiar ambas fechas, las alertas cubren todos los datos.
- Si no hay anomalías, la tabla permanece en pantalla con un estado vacío explícito.
- Los estados de carga y error se distinguen del estado vacío sin anomalías.

## Verificación prevista

- Añadir pruebas backend para la ventana móvil de tres períodos, el primer período elegible, distintos umbrales y los límites `0.01` y `1.0`.
- Verificar que la ruta aplica `start_date`/`end_date` antes de calcular los períodos y que la respuesta mantiene los campos esperados.
- Añadir pruebas frontend para el valor inicial y límites del control, parámetros enviados, presentación de filas y mensaje vacío.
- Ejecutar las pruebas backend afectadas y las pruebas/build frontend una vez implementada la funcionalidad.
