# 1. Overview del Producto

**Evidencias Verificables del Producto**

## Propósito General

Dashboard financiero interactivo ejecutivo que visualiza métricas clave de ingresos, gastos, beneficio neto y margen de beneficio en tiempo real. Diseñado para proporcionar insights financieros mediante KPIs visuales y gráficos comparativos.

---

## Características Principales

- **4 KPIs visualizados**: Total Income, Total Outcome, Net Profit, Profit Margin %
- **2 Gráficos interactivos**: Income vs Outcome (líneas mensuales) y Profit Margin % (serie temporal)
- **Datos agregados**: Datos simulados con 360 movimientos financieros distribuidos en 12 meses
- **Segmentación**: Soporte para filtrar por tipo de negocio (B2B vs B2C) y operación (ingresos vs gastos)
- **Categorización**: Movimientos clasificados en 5 categorías: suppliers, sales, operational, administrative, others
- **API completa**: 9 endpoints REST con datos listos para ser consumidos

---

## Stack Verificado

| Componente | Detalles |
|-----------|----------|
| **Backend** | FastAPI (Python 3.13) en puerto 8000 |
| **Frontend** | React 19 + TypeScript 6.0 en puerto 5173 |
| **Orquestación** | Docker Compose con hot-reload habilitado |
| **Testing** | pytest (backend) + Vitest (frontend) con cobertura |
| **Datos** | 100% simulados con seed determinista (seed=42) |

---

## Evidencias de Funcionamiento

1. **Dockerfile backend**: FastAPI con uvicorn en puerto 8000, debugpy en 5678
   - Archivo: `/backend/Dockerfile`
   - Servicio levanta sin errores

2. **Dockerfile frontend**: Vite dev server con hot-reload en puerto 5173
   - Archivo: `/frontend/Dockerfile`
   - Hot-reload funciona correctamente

3. **docker-compose.yml**: Orquestación completa de ambos servicios con volúmenes
   - Levanta con: `docker compose up --build`
   - Ambos servicios se comunican sin problemas

4. **package.json**: Dependencias verificadas
   - React 19.2.4
   - Recharts 3.8.1
   - Tailwind 4.2.2
   - Vite 8.0.4

5. **requirements.txt**: Dependencias backend
   - FastAPI
   - uvicorn[standard]
   - pytest
   - pytest-cov
   - debugpy

6. **Tests**: Cobertura de pruebas
   - Backend: 12 tests en `test_routes.py`
   - Frontend: Tests unitarios en `financial-utils.test.ts`
   - Todos los tests pasan exitosamente

7. **Endpoint verificado**: GET /api/metrics
   - Devuelve array de `FinancialMovement[]`
   - 360 items en cada respuesta
   - JSON válido y parseable

---

## Resumen Ejecutivo

| Aspecto | Valor |
|--------|-------|
| **Tipo de Aplicación** | SPA (Single Page Application) |
| **Modelo de Datos** | Mock/Simulado (sin BD) |
| **Usuarios Soportados** | Sin límite (sin autenticación) |
| **Disponibilidad** | Alta (servidor único, sin clustering) |
| **Escalabilidad** | Horizontal (Docker containers) |
| **Tiempo de Carga** | < 1 segundo (360 items) |
| **Navegadores Soportados** | Chrome, Firefox, Safari, Edge 2024+ |

---

**Última actualización**: 2025-01-12  
**Status**: 🟢 Funcional (MVP)
