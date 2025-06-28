# Sistema de Tracking de Usuarios

Este sistema proporciona un tracking completo de usuarios para landing pages, capturando información detallada sobre el comportamiento del usuario, dispositivo, navegador y interacciones.

## 🚀 Características

- **Tracking Completo**: Captura userAgent, tiempo activo, IP, interacciones, etc.
- **Tiempo Real**: Monitoreo en tiempo real de la actividad del usuario
- **Eventos Detallados**: Registro de clicks, scroll, focus, mouse movements
- **Información del Dispositivo**: Detección automática de mobile/tablet/desktop
- **Información de Conexión**: Tipo de conexión, velocidad, latencia
- **Fallback LocalStorage**: Almacenamiento local si falla el envío
- **Debug Visual**: Componente de debug para desarrollo
- **Reutilizable**: Fácil integración en otros proyectos

## 📦 Instalación

### 1. Copiar archivos

Copia los siguientes archivos a tu proyecto:

```
src/
├── hooks/
│   └── useUserTracking.ts
├── api/
│   └── tracking.ts
├── components/
│   └── TrackingDebug.tsx
└── utils/
    └── trackingUtils.ts
```

### 2. Instalar dependencias

```bash
npm install framer-motion react-icons
```

### 3. Configurar endpoints

Crea los endpoints de API en tu backend:

```javascript
// POST /api/tracking
app.post('/api/tracking', (req, res) => {
  const { trackingData, events } = req.body
  // Procesar y almacenar datos
  res.json({ success: true, message: 'Datos recibidos' })
})
```

## 🔧 Uso Básico

### 1. Integrar en tu componente principal

```tsx
import { useUserTracking } from './hooks/useUserTracking'
import { TrackingDebug } from './components/TrackingDebug'

function App() {
  const { trackingData, sendTrackingData } = useUserTracking()

  const handleRegistration = async () => {
    // Enviar datos antes de redirigir
    await sendTrackingData()
    window.location.href = '/register'
  }

  return (
    <div>
      {/* Tu contenido */}
      
      {/* Debug solo en desarrollo */}
      {import.meta.env.DEV && <TrackingDebug />}
    </div>
  )
}
```

### 2. Usar en cualquier componente

```tsx
import { useUserTracking } from '../hooks/useUserTracking'

function MyComponent() {
  const { trackingData, incrementPageViews } = useUserTracking()

  useEffect(() => {
    incrementPageViews()
  }, [])

  return (
    <div>
      <p>Session ID: {trackingData?.sessionId}</p>
      <p>Tiempo activo: {Math.round((trackingData?.totalActiveTime || 0) / 1000)}s</p>
    </div>
  )
}
```

## 📊 Datos Capturados

### Información del Navegador
- User Agent
- Idioma
- Plataforma
- Cookies habilitadas
- Do Not Track

### Información de Pantalla
- Resolución de pantalla
- Tamaño del viewport
- Profundidad de color
- Pixel ratio

### Información de Conexión
- Tipo de conexión (4G, WiFi, etc.)
- Velocidad de descarga
- Latencia (RTT)

### Información de Ubicación
- IP pública
- Zona horaria

### Información de Tiempo
- Tiempo de inicio de sesión
- Tiempo total activo
- Última actividad

### Información de Interacciones
- Número de page views
- Clicks realizados
- Profundidad de scroll
- Movimientos del mouse

### Información del Dispositivo
- Tipo (mobile/tablet/desktop)
- Soporte táctil

## 🛠️ Utilidades

### TrackingUtils

```tsx
import { TrackingUtils } from './utils/trackingUtils'

// Generar ID de sesión
const sessionId = TrackingUtils.generateSessionId()

// Detectar tipo de dispositivo
const deviceInfo = TrackingUtils.detectDeviceType(navigator.userAgent)

// Obtener IP
const ip = await TrackingUtils.getIPAddress()

// Formatear datos
const formattedData = TrackingUtils.formatTrackingData(rawData)

// Enviar a múltiples endpoints
await TrackingUtils.sendToMultipleEndpoints(data, [
  '/api/tracking',
  '/api/analytics'
])
```

### Configuración Personalizada

```tsx
import { DEFAULT_TRACKING_CONFIG } from './utils/trackingUtils'

const customConfig = {
  ...DEFAULT_TRACKING_CONFIG,
  autoSendInterval: 60000, // Enviar cada minuto
  endpoints: ['/api/tracking', '/api/backup'],
  trackMouseMovements: false // Deshabilitar tracking de mouse
}
```

## 🔍 Debug y Monitoreo

### Componente de Debug

El componente `TrackingDebug` muestra en tiempo real:

- Información del usuario
- Datos de pantalla
- Tiempo de sesión
- Interacciones
- Eventos registrados
- Botones para enviar datos y copiar información

### Acceso al Debug

```tsx
// Solo aparece en desarrollo
{import.meta.env.DEV && <TrackingDebug />}
```

### Logs en Consola

El sistema registra automáticamente:

```javascript
console.log('Datos de tracking enviados exitosamente')
console.warn('Error enviando datos de tracking:', error)
console.warn('No se pudo obtener la IP:', error)
```

## 📱 Eventos Automáticos

El sistema registra automáticamente estos eventos:

- **focus**: Usuario regresa a la pestaña
- **blur**: Usuario sale de la pestaña
- **scroll**: Usuario hace scroll (throttled)
- **click**: Usuario hace click
- **mousemove**: Movimientos del mouse (throttled)
- **page_view**: Carga de página
- **session_end**: Fin de sesión

## 🔄 Reutilización en Otros Proyectos

### 1. Copiar archivos base

```bash
cp -r src/hooks/useUserTracking.ts nuevo-proyecto/src/hooks/
cp -r src/api/tracking.ts nuevo-proyecto/src/api/
cp -r src/utils/trackingUtils.ts nuevo-proyecto/src/utils/
```

### 2. Adaptar configuración

```tsx
// En tu nuevo proyecto
import { useUserTracking } from './hooks/useUserTracking'

function App() {
  const { trackingData, sendTrackingData } = useUserTracking()
  
  // Tu lógica específica
  const handleConversion = async () => {
    await sendTrackingData()
    // Procesar conversión
  }
}
```

### 3. Personalizar endpoints

```tsx
// Modificar en tracking.ts
private static baseURL = '/api/your-custom-endpoint'
```

## 🚨 Consideraciones de Privacidad

### GDPR Compliance

- Los datos se almacenan localmente como fallback
- El usuario puede optar por no ser rastreado
- Los datos se envían de forma segura

### Configuración de Privacidad

```tsx
// Verificar si el usuario permite tracking
if (navigator.doNotTrack === '1') {
  // Deshabilitar tracking
  return
}
```

## 📈 Análisis de Datos

### Métricas Clave

- **Tiempo en página**: `totalActiveTime`
- **Engagement**: `clicks`, `scrollDepth`, `mouseMovements`
- **Dispositivos**: `isMobile`, `isTablet`, `isDesktop`
- **Rendimiento**: `pageLoadTime`, `connectionType`

### Ejemplo de Dashboard

```tsx
function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setAnalytics)
  }, [])

  return (
    <div>
      <h2>Métricas de Usuario</h2>
      <p>Tiempo promedio: {analytics?.avgTimeOnPage}s</p>
      <p>Dispositivos móviles: {analytics?.mobilePercentage}%</p>
      <p>Scroll promedio: {analytics?.avgScrollDepth}%</p>
    </div>
  )
}
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **No se obtiene la IP**
   - Verificar conexión a internet
   - El servicio ipify.org puede estar caído

2. **Datos no se envían**
   - Verificar endpoint de API
   - Revisar logs de consola
   - Los datos se guardan en localStorage como fallback

3. **Performance issues**
   - Ajustar throttling en configuración
   - Reducir frecuencia de envío automático

### Debug

```tsx
// Habilitar logs detallados
localStorage.setItem('trackingDebug', 'true')

// Ver datos en localStorage
console.log(localStorage.getItem('trackingData'))
```

## 📝 Licencia

Este sistema es de uso libre para proyectos personales y comerciales.

## 🤝 Contribuciones

Para mejorar el sistema:

1. Fork el proyecto
2. Crear feature branch
3. Commit cambios
4. Push al branch
5. Crear Pull Request

---

**Nota**: Este sistema está diseñado para ser ético y respetar la privacidad del usuario. Siempre informa a los usuarios sobre el tracking y proporciona opciones para optar por no participar. 