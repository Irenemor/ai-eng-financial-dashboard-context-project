---
name: dashboard-qa
description: Verifica antes de un merge el dashboard financiero React/Vite y la API FastAPI mediante pruebas, build y comprobaciones de datos y gráficos.
---

# Dashboard QA

## 1. Objetivo

Detectar regresiones antes de integrar cambios en el dashboard financiero. Los datos actuales son simulados; el frontend consume `/api/metrics` y calcula los indicadores y las series mensuales.

## 2. Cuándo utilizarla

Antes de cada merge y al validar cambios que puedan afectar al frontend, la API, los cálculos, las dependencias o la configuración. Si el agente no descubre esta ruta automáticamente, leer este archivo completo y seguirlo explícitamente.

## 3. Inputs necesarios

- Cambios y base de comparación del merge; revisar `git status --short` y el diff correspondiente sin alterar cambios ajenos.
- Servicios de Docker Compose y navegador disponibles. Confirmar que el frontend ejecuta la versión y dependencias que se van a validar; si no, acordar cómo reconstruirlo antes de seguir.
- Requisitos del cambio y comportamiento esperado. Consultar `.agents/rules/agent-rules.md` y `memory-bank/0-memory-bank.md`.

## 4. Procedimiento

1. Identificar las partes afectadas: `frontend/src/App.tsx`, `frontend/src/lib/financial-api.ts` y `financial-utils.ts`, componentes de `frontend/src/components/dashboard/` y rutas de `backend/app/routes.py`. Anotar qué pruebas adicionales exige el cambio.
2. Desde la raíz, comprobar `docker compose ps` y `docker compose exec -T frontend npm ls --depth=0`. Si las dependencias instaladas no coinciden con el manifiesto, los resultados del frontend no validan la versión actual. Comprobar también que el navegador muestra el código vigente; ante discrepancias, contrastar el módulo servido por Vite con el archivo local.

   Con ambos servicios disponibles y actualizados, ejecutar por separado:

   ```text
   docker compose exec -T frontend npm test
   docker compose exec -T frontend npm run lint
   docker compose exec -T frontend npm run build
   docker compose exec -T backend pytest -q
   ```

   Registrar resultado y advertencias de cada comando. Si faltan servicios, las dependencias no coinciden o se sirve código antiguo, informar del bloqueo y solicitar autorización antes de iniciar o reconstruir servicios compartidos; el arranque documentado es `docker compose up --build`. No presentar los resultados de un entorno desactualizado como validación del código actual.
3. En el navegador, abrir `http://localhost:5173/` y comprobar que la petición `/api/metrics` termina correctamente. Comparar sus movimientos con los cuatro KPI: sumar ingresos y gastos, calcular beneficio = ingresos - gastos y margen = beneficio / ingresos × 100, o 0 si no hay ingresos. Tener en cuenta el redondeo de moneda y porcentaje de la interfaz. Comprobar que el período muestra el primer y último mes de los datos, no fechas fijas.
4. Verificar que se dibujan **Income vs. Outcome** y **Profit Margin %**. Abrir sus tablas, comprobar el orden de los meses y cotejar al menos un mes con las sumas y el margen calculados a partir de la respuesta. Con teclado, enfocar cada gráfico y usar las flechas para consultar datos; enfocar cada resumen y usar Enter o Espacio para abrir su tabla.
5. Revisar los resultados de `frontend/src/App.test.tsx`, `frontend/src/lib/financial-api.test.ts` y `frontend/src/components/dashboard/chart-accessibility.test.tsx`: cubren carga, datos vacíos y errores, petición HTTP y alternativas tabulares. Los gráficos están simulados en `App.test.tsx`; esa prueba no sustituye la comprobación real en navegador. Añadir comprobaciones pertinentes al cambio sin detener servicios compartidos para provocar fallos.
6. Revisar errores de consola y de red en el navegador y registrar cualquier comprobación no realizada, su motivo y el riesgo. No afirmar que una comprobación pasó sin ejecutarla.

## 5. Outputs esperados

- Resultado **apto**, **bloqueado** o **no verificable** para el merge, con entorno y alcance revisado.
- Por cada comando y comprobación: resultado, evidencia concreta y advertencias relevantes.
- Por cada fallo: archivo o componente, pasos para reproducirlo, resultado esperado y observado, impacto y propuesta de solución. Distinguir fallos previos de regresiones con evidencia.
- Limitaciones y pruebas pendientes, incluyendo ausencia de navegador, servicios o datos adecuados.

## 6. Criterios de aceptación

Los cuatro comandos finalizan correctamente; la API responde; período y KPI coinciden con los datos; ambos gráficos y sus tablas muestran los valores esperados y son utilizables con teclado; no hay errores nuevos de consola o red. Los estados de carga, vacío y error están cubiertos por las pruebas existentes o por verificaciones adecuadas al cambio.

## 7. Condiciones para bloquear un merge

Bloquear ante fallos de build, lint o tests; regresiones en la API, cálculos, período, gráficos o interacción; errores nuevos relevantes de consola o red; o una comprobación esencial no realizada. Clasificar como **no verificable** cuando falte evidencia y no aprobar el merge. Documentar las advertencias y problemas previos por separado; no presentarlos como nuevos ni ignorar su impacto.
