# Notas de análisis del proyecto

Hallazgos observados en el código y la documentación del repositorio. Las reglas propuestas al final citan los identificadores de los hechos que las justifican.

## Hallazgos

### Arquitectura

- **A1. Datos simulados:** [backend/app/routes.py](./backend/app/routes.py) genera 360 movimientos sintéticos en memoria con `seed=42`; no lee ni persiste datos.
- **A2. Endpoints no consumidos:** [frontend/src/App.tsx](./frontend/src/App.tsx) consulta solo `GET /api/metrics`. Los endpoints de facetas, resúmenes, categorías, comparación y alertas están definidos en [backend/app/routes.py](./backend/app/routes.py), pero no los consume esta interfaz.
- **A3. Período inconsistente:** [frontend/src/App.tsx](./frontend/src/App.tsx) muestra el período fijo `2024 - Full Year`; [backend/app/routes.py](./backend/app/routes.py) genera fechas relativas a la fecha actual.
- **A4. CORS abierto:** [backend/app/main.py](./backend/app/main.py) permite cualquier origen con `allow_origins=["*"]`.
- **A5. Depuración expuesta:** [backend/Dockerfile](./backend/Dockerfile) inicia `debugpy` en `0.0.0.0:5678`; [docker-compose.yml](./docker-compose.yml) publica ese puerto.

### Naming

- **N1. Nombre de test impreciso:** [backend/tests/test_routes.py](./backend/tests/test_routes.py) llama `test_generate_mock_movements_returns_full_year_sorted_data` al test, aunque la generación corresponde a los 12 meses completos anteriores y no necesariamente a un año calendario.
- **N2. Etiqueta fija:** [frontend/src/App.tsx](./frontend/src/App.tsx) define el período mostrado como una cadena estática, no a partir de las fechas devueltas por la API.

### Testing

- **T1. Conteo desactualizado:** [verification.md](./verification.md) indica 12 tests backend; [backend/tests/test_routes.py](./backend/tests/test_routes.py) contiene 15 funciones `test_`.
- **T2. Cobertura de interfaz:** [frontend/src/lib/financial-utils.test.ts](./frontend/src/lib/financial-utils.test.ts) prueba funciones de cálculo y formato. No hay pruebas de la carga de datos, el estado de error ni la etiqueta de período de [frontend/src/App.tsx](./frontend/src/App.tsx).
- **T3. Rango de fechas sin probar:** [backend/tests/test_routes.py](./backend/tests/test_routes.py) comprueba longitud y orden de los datos generados, pero no el rango temporal producido por `generate_mock_movements`.

### Documentación

- **D1. Ubicaciones de instrucciones sin archivos:** [AGENTS.md](./AGENTS.md) pide revisar `.agents/rules`, `.agents/skills` y `memory-bank`; no se encontraron archivos en esas ubicaciones.
- **D2. Discrepancia de documentación:** [verification.md](./verification.md) registra 12 tests backend, mientras que [backend/tests/test_routes.py](./backend/tests/test_routes.py) contiene 15.

### DX y ejecución

- **X1. Proxy orientado a Docker:** [frontend/vite.config.ts](./frontend/vite.config.ts) dirige `/api` a `http://backend:8000`, nombre del servicio de Compose. Ejecutar Vite fuera de Compose requiere configurar otra URL; [README.md](./README.md) documenta `VITE_API_BASE_URL`.
- **X2. Disponibilidad al iniciar:** [docker-compose.yml](./docker-compose.yml) usa `depends_on` sin healthcheck del backend. [frontend/src/App.tsx](./frontend/src/App.tsx) hace una sola carga y no reintenta si falla.
- **X3. Versiones Python sin fijar:** [backend/requirements.txt](./backend/requirements.txt) lista dependencias sin versiones.
- **X4. Diagnóstico de errores limitado:** el `catch` de [frontend/src/App.tsx](./frontend/src/App.tsx) muestra un mensaje genérico y no registra el error original de la petición.

## Reglas propuestas

1. **Derivar el período mostrado de los datos o de un parámetro de período compartido.** No introducir etiquetas temporales estáticas.  
   **Hechos relacionados:** A3, N2.

2. **Mantener explícito qué endpoints consume la interfaz.** Al añadir o cambiar endpoints analíticos, actualizar la interfaz o documentar que quedan fuera de ella.  
   **Hechos relacionados:** A2.

3. **Tratar el generador como fuente de datos de demostración, no como almacenamiento financiero.** Antes de exponer la aplicación con datos reales, definir persistencia y revisar CORS y la exposición de depuración.  
   **Hechos relacionados:** A1, A4, A5.

4. **Nombrar los tests conforme al comportamiento real que verifican.** Si los datos cubren 12 meses móviles, no describirlos como un año calendario sin fijar esa semántica.  
   **Hechos relacionados:** N1, T3.

5. **Actualizar los documentos de validación cuando cambie el conjunto de pruebas.** El conteo documentado debe coincidir con las funciones de test del repositorio.  
   **Hechos relacionados:** T1, D2.

6. **Probar el contrato temporal del generador y la interfaz.** Cubrir el rango de fechas devuelto y comprobar que el período mostrado corresponde a esos datos.  
   **Hechos relacionados:** A3, T2, T3.

7. **Añadir pruebas de los estados de carga y error del dashboard.** Verificar el comportamiento de `fetch`, el mensaje de fallo y cualquier política de reintentos.  
   **Hechos relacionados:** T2, X2, X4.

8. **Documentar y distinguir la ejecución dentro y fuera de Docker.** Para el desarrollo sin Compose, indicar cómo configurar el origen de API que reemplaza el host `backend`.  
   **Hechos relacionados:** X1.

9. **Definir una condición de disponibilidad del backend o una estrategia de reintento del frontend.** Evitar que un fallo temporal al arrancar deje el dashboard en error hasta recargarlo.  
   **Hechos relacionados:** X2.

10. **Proporcionar errores útiles para diagnóstico sin ocultar el fallo original.** Conservar información del error de red o de respuesta junto al mensaje visible para el usuario.  
    **Hechos relacionados:** X4.

11. **Fijar o acotar versiones de dependencias Python para instalaciones reproducibles.**  
    **Hechos relacionados:** X3.

12. **Mantener instrucciones de agentes alineadas con los archivos existentes.** Crear las reglas, skills y memoria que se referencian o ajustar [AGENTS.md](./AGENTS.md) para señalar solo ubicaciones disponibles.  
    **Hechos relacionados:** D1.
