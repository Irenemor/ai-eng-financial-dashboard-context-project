# 2. Stack Tecnológico

**Lenguajes, Frameworks, Infraestructura, Tooling y Dependencias Clave**

---

## Lenguajes de Programación

| Lenguaje | Versión | Uso | Características |
|----------|---------|-----|-----------------|
| **Python** | 3.13 | Backend (FastAPI) | Type hints, async support, 360 movimientos generados |
| **TypeScript** | 6.0.2 | Frontend (React) | Type safety, interfaces estrictas, compilación check |
| **HTML5** | 2024 | Interfaz | Semantic markup, ARIA labels, accesibilidad |
| **CSS4** | 2024 | Estilizado | Via Tailwind, custom properties, media queries |
| **JSON** | RFC 8259 | Serialización | Formato de datos universal REST |

---

## Backend (Python)

### Framework Principal
- **FastAPI** (^1.0)
  - Framework REST moderno con async
  - Validación automática con Pydantic
  - OpenAPI/Swagger docs auto-generados en `/docs`
  - CORS middleware integrado
  - File: `/backend/app/main.py`

### Servidor Web
- **Uvicorn[standard]** (^0.24)
  - Servidor ASGI de alta performance
  - Hot-reload (`--reload`) en desarrollo
  - Soporte para debugging
  - Puerto: 8000

### Debugging & Desarrollo
- **debugpy** (^1.8)
  - Debugging remoto
  - Puerto: 5678
  - Compatible con VS Code, PyCharm

### Testing
- **pytest** (^7.4)
  - Test runner con fixtures
  - Discovery automático de tests
  - File: `/backend/tests/test_routes.py` (12 tests)

- **pytest-cov** (^4.1)
  - Cobertura de código
  - Reportes HTML/XML

- **httpx** (^0.24)
  - Cliente HTTP asincrónico
  - TestClient para testing de endpoints

### Dependencias en requirements.txt
```
fastapi
uvicorn[standard]
debugpy
pytest
pytest-cov
httpx
```

---

## Frontend (TypeScript + React)

### Framework Principal
- **React** (19.2.4)
  - Renderizado de componentes
  - Hooks (useState, useEffect)
  - JSX syntax
  - File: `/frontend/src/App.tsx`

- **React DOM** (19.2.4)
  - Renderizado en el DOM browser
  - Entry point: `/frontend/src/main.tsx`

### Lenguaje
- **TypeScript** (6.0.2)
  - Strict mode habilitado
  - Interfaces para tipos de datos
  - File: `/frontend/src/lib/financial-types.ts`

### Build Tool & Dev Server
- **Vite** (8.0.4)
  - Bundler extremadamente rápido
  - Dev server con hot-reload
  - Proxy reverso para `/api`
  - Config: `/frontend/vite.config.ts`
  - Puerto dev: 5173

### Styling
- **Tailwind CSS** (4.2.2)
  - Utility-first CSS framework
  - Dark mode nativo
  - Responsive design (mobile-first)
  - Config: `/frontend/tailwind.config.js`

- **class-variance-authority** (0.7.1)
  - Variantes CSS tipadas
  - Composición de estilos

- **clsx** (2.1.1)
  - Fusión de clases CSS condicionales

- **tailwind-merge** (3.5.0)
  - Deduplicación de clases Tailwind

### Gráficos
- **Recharts** (3.8.1)
  - Librería de gráficos React
  - LineChart para series temporales
  - Responsive & interactive
  - Componentes: `IncomeOutcomeChart`, `ProfitPercentChart`

### Iconografía
- **lucide-react** (1.8.0)
  - Iconos React listos para usar
  - SVG optimizados

### Dependencias en package.json
```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "recharts": "^3.8.1",
    "tailwind-merge": "^3.5.0",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^1.8.0"
  }
}
```

---

## DevTools & Linting

### Frontend
- **ESLint** (9.39.4)
  - Linting de JavaScript/TypeScript
  - Config: `/frontend/eslint.config.js`

- **eslint-plugin-react-hooks** (7.0.1)
  - Validación de hooks (dependency arrays)

- **eslint-plugin-react-refresh** (0.5.2)
  - Validación de Fast Refresh en Vite

- **typescript-eslint** (8.58.0)
  - Soporte TypeScript en ESLint

- **@vitejs/plugin-react** (6.0.1)
  - Plugin React para Vite

- **Vitest** (4.1.4)
  - Test runner compatible con Vite
  - Tests unitarios: `financial-utils.test.ts`

- **@vitest/coverage-v8** (4.1.4)
  - Cobertura de tests con V8

### CSS Processing
- **PostCSS** (8.5.9)
  - Procesamiento de CSS
  - Usado por Tailwind

- **Autoprefixer** (10.4.27)
  - Prefijos automáticos (-webkit, -moz, etc.)

- **@tailwindcss/vite** (4.2.2)
  - Plugin Vite para Tailwind

---

## Infraestructura & Orquestación

### Containerización
- **Docker**
  - Backend: `/backend/Dockerfile` (FastAPI + Uvicorn)
  - Frontend: `/frontend/Dockerfile` (Vite + Node)
  - Multi-stage builds para optimización

### Orquestación
- **Docker Compose** (compose.yml)
  - 2 servicios: `backend`, `frontend`
  - Volúmenes compartidos (hot-reload)
  - Networking automático entre servicios
  - Ports: 5173 (frontend), 8000 (backend), 5678 (debug)

### Port Mapping
| Puerto | Servicio | Función |
|--------|----------|---------|
| 5173 | Frontend | Vite dev server |
| 8000 | Backend | FastAPI + Uvicorn |
| 5678 | Backend | debugpy (debugging remoto) |

### Volumes (Hot-Reload)
```yaml
# Backend
./backend:/app

# Frontend
./frontend:/app
/app/node_modules  # Excluido para performance
```

---

## Configuraciones Clave

### Vite Proxy (frontend/vite.config.ts)
```typescript
// Redirige /api → http://backend:8000
proxy: {
  '/api': {
    target: 'http://backend:8000',
    changeOrigin: true,
  }
}
```

### CORS Backend (backend/app/main.py)
```python
CORSMiddleware(
  allow_origins=["*"],      # Allow-all (desarrollo)
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
```

### TypeScript Config (frontend/tsconfig.json)
- `strict: true` (type safety estricta)
- `resolveJsonModule: true`
- `jsx: "react-jsx"`

### Mock Data Seed (backend/app/routes.py)
```python
def generate_mock_movements(seed: int | None = None):
    if seed is not None:
        random.seed(seed)  # seed=42 para reproducibilidad
```

---

## Dependencias Clave (Críticas para Funcionamiento)

### Must-Have (Sin estos no funciona nada)
1. **FastAPI** → API REST backend
2. **React** → Renderizado UI
3. **TypeScript** → Type safety
4. **Tailwind CSS** → Estilizado
5. **Vite** → Build & dev server

### High-Priority (Producción)
6. **Uvicorn** → Servidor web
7. **Pydantic** (en FastAPI) → Validación datos
8. **Recharts** → Visualización gráficos

### Nice-to-Have (Desarrollo)
9. **pytest** → Testing
10. **ESLint** → Linting
11. **debugpy** → Debugging remoto
12. **Vitest** → Testing frontend

---

## Matriz de Compatibilidad

| Componente | Versión Mínima | Versión Máxima | Node/Python |
|-----------|--------|--------|---------|
| React | 19.0.0 | 19.x | Node 16+ |
| TypeScript | 6.0.0 | 6.x | Node 16+ |
| FastAPI | 1.0.0 | 1.x | Python 3.9+ |
| Python | 3.9 | 3.13+ | - |
| Node | 16 | 20.x | - |
| Docker | 20.10+ | Latest | - |

---

**Última actualización**: 2025-01-12  
**Stack Status**: 🟢 Producción-Ready
