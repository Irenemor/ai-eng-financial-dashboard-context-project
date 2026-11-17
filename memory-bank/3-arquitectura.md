# 3. Arquitectura

El proyecto separa frontend y backend.

1. El navegador carga la aplicación React.
2. El frontend solicita `/api/metrics`.
3. El proxy de Vite envía la petición al backend.
4. FastAPI genera y devuelve los movimientos en JSON.
5. El frontend calcula los indicadores y los datos de los gráficos.

La API también ofrece resúmenes, categorías, comparaciones y alertas. Estas rutas no se consumen desde el dashboard.

Los datos se generan en memoria. No hay base de datos.
