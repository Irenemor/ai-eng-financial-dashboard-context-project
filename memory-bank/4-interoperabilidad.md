# 4. Interoperabilidad del Producto

**Protocolos, Conexiones, Extensibilidad y Compatibilidad**

---

## Protocolos de Comunicación

### HTTP/REST
- **Protocolo**: HTTP 1.1
- **Formato**: JSON (RFC 8259)
- **Content-Type**: `application/json`
- **CORS**: Habilitado (allow-all en desarrollo)
- **Puerto**: 8000 (backend), 5173 (frontend)

### Comunicación Frontend → Backend
```
Frontend (Browser)
    │
    └─ HTTP GET /api/metrics
       │
       └─ Vite Proxy
          │
          └─ http://backend:8000/api/metrics
             │
             └─ FastAPI Response (JSON)
```

### DNS Resolution (Docker)
```
Frontend container (port 5173)
  └─ curl http://backend:8000/api/metrics
     └─ Docker DNS resolves "backend" hostname
        └─ Routes to backend service container
```

---

## Consumidores Externos Potenciales

### 1. Navegadores Web
- **Chrome/Chromium**: 100+ (Vite, React 19 compatible)
- **Firefox**: 120+ (ES2020+)
- **Safari**: 17+ (iOS/macOS)
- **Edge**: 120+ (Chromium-based)
- **Compatibilidad**: HTML5, CSS4, ES2020+, WebGL

### 2. Clientes HTTP
```bash
# cURL
curl http://localhost:8000/api/metrics

# Postman
GET http://localhost:8000/api/metrics

# Python
import requests
response = requests.get('http://localhost:8000/api/metrics')

# JavaScript
fetch('http://localhost:8000/api/metrics')
  .then(r => r.json())
```

### 3. Aplicaciones Móviles
- **React Native**: Compartir lógica `financial-utils.ts`
- **Flutter**: Consumir endpoints REST directamente
- **iOS/Android**: HTTP client standard

### 4. Dashboards BI
- **Power BI**: Conectar a `/api/metrics/summary`
- **Tableau**: Consumir via REST API
- **Looker**: Datos simulados para prototipos
- **Qlik Sense**: Integración REST

### 5. Herramientas de Terceros
- **Zapier**: Trigger en cambios de KPIs
- **IFTTT**: Automatización basada en alertas
- **Webhooks**: Notificaciones a sistemas externos

---

## Conexiones Internas

### Docker Network
```yaml
# docker-compose.yml
services:
  frontend:
    networks:
      - dashboard-network
    
  backend:
    networks:
      - dashboard-network

networks:
  dashboard-network:
    driver: bridge
```

### Service-to-Service Communication
```
Frontend Service
  ├─ Hostname: "frontend"
  ├─ Port: 5173
  └─ ¿Qué resuelve?: (internal, no consumido)

Backend Service
  ├─ Hostname: "backend"
  ├─ Port: 8000
  └─ Resuelto desde: Frontend via http://backend:8000
```

### Vite Proxy Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### Volúmenes Compartidos
```yaml
backend:
  volumes:
    - ./backend:/app          # Hot-reload código
    
frontend:
  volumes:
    - ./frontend:/app         # Hot-reload código
    - /app/node_modules       # Persistencia de deps
```

---

## Extensibilidad

### 1. Agregar Nuevos Endpoints

**Paso 1**: Definir modelo Pydantic
```python
# backend/app/routes.py
class NewMetricResponse(BaseModel):
    metric_name: str
    value: float
```

**Paso 2**: Implementar función
```python
@router.get("/api/metrics/new")
def get_new_metric() -> NewMetricResponse:
    # Lógica
    return NewMetricResponse(...)
```

**Paso 3**: Frontend puede consumir sin cambios en arquitectura

**Impacto**: Bajo - Frontend solo necesita fetch adicional

---

### 2. Agregar Nuevos Componentes

**Paso 1**: Crear componente React
```tsx
// frontend/src/components/dashboard/new-chart.tsx
export function NewChart({ data }: Props) {
  return <div>...</div>
}
```

**Paso 2**: Importar en App.tsx
```tsx
<NewChart data={customData} loading={loading} />
```

**Paso 3**: No necesita cambios en backend

**Impacto**: Bajo - Completamente client-side

---

### 3. Agregar Nuevas Categorías

**Backend**: Ya flexible
```python
Category = Literal["suppliers", "sales", "operational", "administrative", "others", "NEW_CATEGORY"]
```

**Frontend**: Maneja dinámicamente via API

**Impacto**: Bajo - No requiere cambios frontend

---

### 4. Agregar Filtros Avanzados

**Paso 1**: Backend ya soporta (parámetros query)
```
GET /api/metrics?start_date=2024-01-01&end_date=2024-12-31&category=sales
```

**Paso 2**: Frontend crea formulario
```tsx
<DateRangePicker onChange={handleDateChange} />
```

**Paso 3**: Fetch con parámetros
```typescript
fetch(`/api/metrics?start_date=${start}&end_date=${end}`)
```

**Impacto**: Medio - Requiere componentes UI + fetch logic

---

### 5. Cambiar Storage (Mock → Base de Datos)

**Impacto en Frontend**: Ninguno (mismo API)

**Impacto en Backend**: Alto
```python
# Cambiar de:
movements = generate_mock_movements(seed=42)

# A:
movements = db.query(FinancialMovement).all()
```

**Pasos**:
1. Instalar SQLAlchemy + PostgreSQL driver
2. Definir ORM models
3. Reemplazar mock data con queries
4. API mantiene misma firma

---

## Compatibilidad

### Versiones Mínimas

| Componente | Mínimo | Máximo | Notas |
|-----------|--------|--------|-------|
| Node.js | 16.x | 20.x | Vite 8 requiere 16+ |
| Python | 3.9 | 3.13 | FastAPI soporta 3.9+ |
| Docker | 20.10 | Latest | BuildKit recomendado |
| npm | 8.x | 10.x | Compatible con Node 16+ |
| TypeScript | 5.0 | 6.x | Frontend targets ES2020 |

### Navegadores Soportados

| Navegador | Versión Mínima | Estado |
|-----------|---------|--------|
| Chrome | 90+ | ✅ Completo |
| Firefox | 88+ | ✅ Completo |
| Safari | 14+ | ✅ Completo |
| Edge | 90+ | ✅ Completo |
| IE 11 | - | ❌ No soportado (ES2020) |

### Sistemas Operativos

| OS | Docker | Python | Node | Status |
|----|--------|--------|------|--------|
| Linux | ✅ | ✅ | ✅ | 🟢 Optimizado |
| macOS | ✅ | ✅ | ✅ | 🟢 Soportado |
| Windows | ✅ (WSL2) | ✅ | ✅ | 🟢 Soportado |

---

## Integración con Terceros

### APIs Externas (Potenciales)

**Banco de Datos**:
- PostgreSQL, MySQL, MongoDB: Reemplazar mock data
- Cambio: Solo backend, API sin cambios

**Autenticación**:
- Auth0, Firebase, Okta: Agregar middleware
- Cambio: Backend + agregue login UI en frontend

**Analytics**:
- Segment, Mixpanel, GA4: Agregar eventos
- Cambio: Frontend solo (tracking code)

**Storage**:
- S3, Google Cloud Storage: Exportar datos
- Cambio: Backend endpoint nuevo

---

## Publicación & Deployment

### Opciones Actuales

1. **Local** (desarrollo)
   ```bash
   docker compose up --build
   ```

2. **Docker Hub**
   ```bash
   docker build -t dashboard:latest ./frontend
   docker push user/dashboard:latest
   ```

3. **Container Registries**
   - GitHub Container Registry (ghcr.io)
   - GitLab Registry
   - AWS ECR

### Plataformas de Hosting

| Plataforma | Ideal Para | Esfuerzo |
|-----------|-----------|---------|
| **Vercel** | Frontend solo | ⭐ Bajo |
| **Heroku** | Full stack | ⭐⭐ Medio |
| **AWS EC2** | Full control | ⭐⭐⭐ Alto |
| **DigitalOcean App Platform** | Full stack | ⭐⭐ Medio |
| **Railway** | Full stack | ⭐ Bajo |
| **Render** | Full stack | ⭐ Bajo |

---

## Seguridad en Interoperabilidad

### CORS (Actual - Permisivo)
```python
allow_origins=["*"]  # ⚠️ Desarrollo solo
```

### CORS (Producción)
```python
allow_origins=[
    "https://dashboard.example.com",
    "https://app.example.com"
]
```

### Autenticación (Recomendado)
```python
# Agregar JWT o OAuth2
from fastapi.security import HTTPBearer
security = HTTPBearer()

@router.get("/api/metrics")
def get_metrics(credentials: HTTPAuthCredentials = Depends(security)):
    # Verificar token
    pass
```

### Rate Limiting
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.get("/api/metrics")
@limiter.limit("100/minute")
def get_metrics():
    pass
```

---

**Última actualización**: 2025-01-12  
**Interoperabilidad Status**: 🟡 Parcialmente Extensible (sin BD/auth)
