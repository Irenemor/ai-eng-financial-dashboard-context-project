# 6. Estado actual

El proyecto es una demostración funcional con datos simulados.

## Disponible

- API de métricas y dashboard con indicadores y gráficos.
- Ejecución conjunta con Docker Compose.
- Pruebas de backend y frontend.

## Limitaciones

- No hay base de datos, persistencia ni autenticación.
- La configuración de CORS y depuración es para desarrollo.
- El encabezado muestra un período fijo que puede no coincidir con los datos.
- La interfaz no tiene filtros ni reintenta la petición inicial si falla.
- Las rutas analíticas adicionales no se usan en el dashboard.

Antes de usar datos reales o desplegar públicamente, hay que definir la persistencia y revisar la seguridad y la configuración.
