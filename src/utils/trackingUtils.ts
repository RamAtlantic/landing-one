import type { UserTrackingData, TrackingEvent } from '../hooks/useUserTracking'

/**
 * Utilidades para el sistema de tracking de usuarios
 * Este archivo contiene funciones auxiliares que facilitan la reutilización
 * del sistema de tracking en otros proyectos
 */

export class TrackingUtils {
  /**
   * Genera un ID de sesión único
   */
  static generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Detecta el tipo de dispositivo basado en el user agent
   */
  static detectDeviceType(userAgent: string) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)
    const isDesktop = !isMobile && !isTablet

    return {
      isMobile,
      isTablet,
      isDesktop,
      touchSupport: 'ontouchstart' in window
    }
  }

  /**
   * Obtiene información de la conexión del usuario
   */
  static getConnectionInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return {
        connectionType: connection.effectiveType || connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }
    }
    return {}
  }

  /**
   * Obtiene información de la pantalla
   */
  static getScreenInfo() {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    }
  }

  /**
   * Obtiene información del navegador
   */
  static getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  }

  /**
   * Obtiene la IP del usuario usando un servicio externo
   */
  static async getIPAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.warn('No se pudo obtener la IP:', error)
      return undefined
    }
  }

  /**
   * Calcula el tiempo de carga de la página
   */
  static getPageLoadTime(): number | undefined {
    if (window.performance && window.performance.timing) {
      return window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
    }
    return undefined
  }

  /**
   * Calcula la profundidad de scroll en porcentaje
   */
  static calculateScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    return (scrollTop / docHeight) * 100
  }

  /**
   * Formatea los datos de tracking para envío
   */
  static formatTrackingData(data: Partial<UserTrackingData>): UserTrackingData {
    return {
      // Información del navegador
      userAgent: data.userAgent || navigator.userAgent,
      language: data.language || navigator.language,
      platform: data.platform || navigator.platform,
      cookieEnabled: data.cookieEnabled ?? navigator.cookieEnabled,
      doNotTrack: data.doNotTrack ?? navigator.doNotTrack,
      
      // Información de la pantalla
      screenWidth: data.screenWidth || window.screen.width,
      screenHeight: data.screenHeight || window.screen.height,
      viewportWidth: data.viewportWidth || window.innerWidth,
      viewportHeight: data.viewportHeight || window.innerHeight,
      colorDepth: data.colorDepth || window.screen.colorDepth,
      pixelRatio: data.pixelRatio || window.devicePixelRatio,
      
      // Información de la conexión
      ...this.getConnectionInfo(),
      
      // Información de ubicación
      ipAddress: data.ipAddress,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Información de tiempo
      sessionStartTime: data.sessionStartTime || Date.now(),
      totalActiveTime: data.totalActiveTime || 0,
      lastActivityTime: data.lastActivityTime || Date.now(),
      
      // Información de interacciones
      pageViews: data.pageViews || 1,
      clicks: data.clicks || 0,
      scrollDepth: data.scrollDepth || 0,
      mouseMovements: data.mouseMovements || 0,
      
      // Información de la página
      referrer: data.referrer || document.referrer,
      currentUrl: data.currentUrl || window.location.href,
      pageLoadTime: data.pageLoadTime || this.getPageLoadTime(),
      
      // Información del dispositivo
      isMobile: data.isMobile ?? this.detectDeviceType(navigator.userAgent).isMobile,
      isTablet: data.isTablet ?? this.detectDeviceType(navigator.userAgent).isTablet,
      isDesktop: data.isDesktop ?? this.detectDeviceType(navigator.userAgent).isDesktop,
      touchSupport: data.touchSupport ?? 'ontouchstart' in window,
      
      // Información adicional
      sessionId: data.sessionId || this.generateSessionId(),
      timestamp: data.timestamp || Date.now()
    }
  }

  /**
   * Guarda datos de tracking en localStorage como fallback
   */
  static saveToLocalStorage(trackingData: UserTrackingData, events: TrackingEvent[]) {
    try {
      const existingData = localStorage.getItem('trackingData')
      const data = existingData ? JSON.parse(existingData) : []
      data.push({
        trackingData,
        events,
        timestamp: Date.now()
      })
      localStorage.setItem('trackingData', JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error guardando en localStorage:', error)
      return false
    }
  }

  /**
   * Recupera datos de tracking guardados en localStorage
   */
  static getFromLocalStorage() {
    try {
      const data = localStorage.getItem('trackingData')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error leyendo de localStorage:', error)
      return []
    }
  }

  /**
   * Limpia datos de tracking del localStorage
   */
  static clearLocalStorage() {
    try {
      localStorage.removeItem('trackingData')
      return true
    } catch (error) {
      console.error('Error limpiando localStorage:', error)
      return false
    }
  }

  /**
   * Envía datos de tracking a múltiples endpoints
   */
  static async sendToMultipleEndpoints(
    data: { trackingData: UserTrackingData; events: TrackingEvent[] },
    endpoints: string[]
  ) {
    const promises = endpoints.map(endpoint =>
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn(`Error enviando a ${endpoint}:`, error)
        return null
      })
    )

    const results = await Promise.allSettled(promises)
    return results.map((result, index) => ({
      endpoint: endpoints[index],
      success: result.status === 'fulfilled' && result.value !== null,
      response: result.status === 'fulfilled' ? result.value : null
    }))
  }

  /**
   * Crea un evento de tracking
   */
  static createEvent(
    type: TrackingEvent['type'],
    data: Partial<UserTrackingData> = {}
  ): TrackingEvent {
    return {
      type,
      data,
      timestamp: Date.now()
    }
  }

  /**
   * Valida si los datos de tracking son válidos
   */
  static validateTrackingData(data: UserTrackingData): boolean {
    const requiredFields = [
      'userAgent',
      'sessionId',
      'timestamp',
      'currentUrl'
    ]

    return requiredFields.every(field => 
      data[field as keyof UserTrackingData] !== undefined && 
      data[field as keyof UserTrackingData] !== null
    )
  }
}

/**
 * Configuración por defecto para el tracking
 */
export const DEFAULT_TRACKING_CONFIG = {
  // Intervalo de envío automático (en ms)
  autoSendInterval: 30000,
  
  // Endpoints para envío de datos
  endpoints: ['/api/tracking'],
  
  // Configuración de eventos
  trackClicks: true,
  trackScroll: true,
  trackMouseMovements: true,
  trackFocus: true,
  
  // Configuración de throttling
  scrollThrottle: 100,
  mouseThrottle: 1000,
  
  // Configuración de localStorage
  enableLocalStorage: true,
  maxLocalStorageItems: 50
}

/**
 * Hook factory para crear instancias de tracking personalizadas
 */
export const createTrackingHook = (config = DEFAULT_TRACKING_CONFIG) => {
  return () => {
    // Implementación del hook personalizado
    // Esta función retornaría un hook similar a useUserTracking pero con configuración personalizada
    return {
      // ... implementación
    }
  }
} 