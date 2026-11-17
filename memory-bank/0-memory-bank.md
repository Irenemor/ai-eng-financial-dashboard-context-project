# Financial Metrics Dashboard

Resumen del proyecto. Los archivos del 1 al 6 amplían cada apartado.

## 1. Producto

El dashboard muestra ingresos, gastos, beneficio y margen de beneficio.
Los datos son simulados. La API genera 360 movimientos de los últimos 12 meses completos.

## 2. Tecnología

- Backend: Python, FastAPI y Uvicorn.
- Frontend: React, TypeScript, Vite, Tailwind CSS y Recharts.
- Ejecución: Docker Compose.
- Pruebas: pytest y Vitest.

## 3. Arquitectura

El navegador carga el frontend. El frontend solicita `/api/metrics` y calcula los indicadores y datos de los gráficos. Vite envía la petición al backend, que genera los movimientos.

## 4. Interoperabilidad

La API usa HTTP y JSON. Incluye rutas para movimientos, filtros, resúmenes, comparaciones y alertas. La interfaz solo consume `/api/metrics`.

## 5. Usabilidad

La interfaz muestra cuatro indicadores y dos gráficos mensuales con tablas de datos accesibles. Tiene diseño adaptable, estados de carga y un mensaje de error.

## 6. Estado actual

Es una demostración sin base de datos ni autenticación. La configuración es para desarrollo. El encabezado muestra un período fijo que puede no coincidir con los datos. No hay filtros en la interfaz ni reintentos de la petición inicial.
