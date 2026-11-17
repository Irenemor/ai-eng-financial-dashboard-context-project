# 4. Interoperabilidad

- El frontend y el backend se comunican mediante HTTP y JSON.
- En Docker Compose, Vite redirige `/api` a `http://backend:8000`.
- La API permite consultar y filtrar movimientos, resúmenes, categorías, comparaciones y alertas.
- La documentación interactiva está en `http://localhost:8000/docs`.
- El proxy predeterminado usa el nombre del servicio de Docker. Para ejecutar Vite fuera de Docker, configura `VITE_API_BASE_URL` con la dirección del backend.

La configuración CORS actual es permisiva y está orientada al desarrollo.
