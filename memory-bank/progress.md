# Progreso del ejercicio de skills

Actualizado el 17 de noviembre de 2026. El dashboard es una demo con datos simulados, React/Vite y FastAPI.

## Skills aplicadas

- **accessibility** — `addyosmani/web-quality-skills`. Se añadieron nombres e instrucciones para los gráficos, tablas alternativas, anuncios de error y tooltips, foco visible, contraste mejorado y soporte de movimiento reducido. Archivos principales: [gráfico de ingresos y gastos](../frontend/src/components/dashboard/income-outcome-chart.tsx), [gráfico de margen](../frontend/src/components/dashboard/profit-percent-chart.tsx), [tabla de datos](../frontend/src/components/dashboard/chart-data-table.tsx), [App.tsx](../frontend/src/App.tsx) e [index.css](../frontend/src/index.css). Commit: `bffd6ed`.
- **vercel-react-best-practices** — `vercel-labs/agent-skills`. Se dividieron los gráficos con carga diferida y límites de error, se adelantó la petición, se estabilizaron los estados de carga y se optimizaron los cálculos de KPI. También se derivó el período de los datos y se agruparon fechas en UTC. Archivos principales: [App.tsx](../frontend/src/App.tsx), [main.tsx](../frontend/src/main.tsx), [financial-utils.ts](../frontend/src/lib/financial-utils.ts) e [index.html](../frontend/index.html). Commit: `0dca135`. El proyecto usa Vite, no Next.js.
- **javascript-testing-patterns** — `wshobson/agents`, descubierta mediante `skills find testing`. Se eligió para complementar las otras skills con pruebas de comportamiento y errores compatibles con Vitest y React. [App.test.tsx](../frontend/src/App.test.tsx) cubre carga, datos, vacío, fallo y aislamiento de errores de gráficos; se añadieron Testing Library y jsdom. Commit: `5c9ec66`.
- **dashboard-qa** — skill interna en [.skills/dashboard-qa/SKILL.md](../.skills/dashboard-qa/SKILL.md), todavía sin seguimiento en Git. Define comprobaciones previas al merge para pruebas, API, KPI, período, gráficos, tablas y teclado. Para utilizarla, pedir al agente que lea y siga el archivo: el selector de esta sesión no la descubrió automáticamente y el proyecto documenta `.agents/skills` como directorio habitual.

Las tres skills externas y sus orígenes están registrados en [skills-lock.json](../skills-lock.json). La instalación de las dos obligatorias figura en `db0cf44`; la comunitaria, en `5c9ec66`.

## Verificaciones y evidencia

- En una validación anterior de accesibilidad se probaron teclado y foco en gráficos y tablas, se midió el contraste de ejes y foco, y se simuló un error HTTP. No se ejecutaron axe o Lighthouse ni se verificaron los anuncios con un lector de pantalla real.
- Tras actualizar dependencias, una instalación limpia en un contenedor temporal pasó 18 tests frontend, lint, build y `npm audit` con cero vulnerabilidades; también se comprobó el dashboard en navegador. El backend pasó 15 tests.
- En la auditoría del 17 de noviembre, el contenedor existente pasó 18 tests frontend, lint y build, y el backend pasó 15 tests con una advertencia `StarletteDeprecationWarning`. `npm audit --package-lock-only` informó cero vulnerabilidades. **Estas pruebas frontend usaron dependencias antiguas**, por lo que no sustituyen una validación actual del entorno compartido.
- La API activa respondió HTTP 200 con 360 movimientos. Sus KPI coincidieron con la interfaz y ambos gráficos mostraron valores al usar las flechas. Sin embargo, el servidor activo mostró `2024 - Full Year` aunque los datos abarcaban de noviembre de 2025 a octubre de 2026, y no mostró las tablas actuales. El módulo servido de `App.tsx` era anterior al código del repositorio; no se puede atribuir esta discrepancia a una regresión del código vigente.

## Git, decisiones y pendientes

- La rama comprobada es `main`, no `feature/agent-skills`; esta última no aparece entre las ramas locales ni remotas disponibles. Los commits relevantes son `bffd6ed`, `db0cf44`, `0dca135` y `5c9ec66`.
- La skill interna se ha leído y probado parcialmente, pero su validación integral y su commit `feat(skills): add internal dashboard QA skill` siguen pendientes por el entorno desactualizado. Este archivo de progreso también está pendiente de seguimiento.
- Con autorización, actualizar las dependencias del frontend compartido y asegurar que Vite sirve el código actual; repetir pruebas, build y QA del período, tablas y gráficos. No se iniciaron ni reconstruyeron contenedores durante esta auditoría.
- Completar la revisión con lector de pantalla y axe o Lighthouse. Investigar por separado la advertencia de Starlette. La demo no tiene persistencia, autenticación ni filtros en la interfaz.
