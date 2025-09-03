import { useState, useCallback, useEffect, useRef } from 'react';
import { useAlertSound } from './useAlertSound';

// Tipos de notificación
export type NotificationType = 'STOCK_BAJO' | 'PEDIDO_CREADO' | 'PRESUPUESTO_APROBADO' | 'CLIENTE_NUEVO' | 'SISTEMA_ERROR' | 'INFO';
export type NotificationCategory = 'pedido' | 'cliente' | 'stock' | 'presupuesto' | 'sistema' | 'general';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Interfaz de notificación
export interface Notification {
  id: string;
  user_id?: string | null;
  created_by?: string;
  title: string;
  message: string;
  type: NotificationType | string; // Puede estar vacío según la API
  category?: NotificationCategory;
  is_read: boolean;
  is_archived: boolean;
  priority: NotificationPriority | string; // Puede ser 'medium' en lugar de 'MEDIUM'
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

// Interfaz de configuración
export interface NotificationSettings {
  id?: string;
  user_id?: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sound_enabled: boolean;
  sound_on_hover: boolean;
  email_info: boolean;
  email_success: boolean;
  email_warning: boolean;
  email_error: boolean;
  email_system: boolean;
  push_info: boolean;
  push_success: boolean;
  push_warning: boolean;
  push_error: boolean;
  push_system: boolean;
  email_pedidos: boolean;
  email_clientes: boolean;
  email_stock: boolean;
  email_presupuestos: boolean;
  email_sistema: boolean;
  push_pedidos: boolean;
  push_clientes: boolean;
  push_stock: boolean;
  push_presupuestos: boolean;
  push_sistema: boolean;
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
}

// Interfaz de paginación
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interfaz de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Interfaz de filtros
export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  category?: NotificationCategory;
  is_read?: boolean;
  priority?: NotificationPriority;
  sort?: 'created_at' | 'priority' | 'type';
  order?: 'asc' | 'desc';
}

// No más datos mock - se cargan desde la API real

// Hook principal
export const useNotificationsV2 = () => {
  // Para desarrollo, usar un ID fijo
  const userId = 'test-user';
  const { playNotificationSound } = useAlertSound();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    sound_enabled: true,
    sound_on_hover: false,
    email_info: true,
    email_success: true,
    email_warning: true,
    email_error: true,
    email_system: true,
    push_info: true,
    push_success: true,
    push_warning: true,
    push_error: true,
    push_system: true,
    email_pedidos: true,
    email_clientes: true,
    email_stock: true,
    email_presupuestos: true,
    email_sistema: true,
    push_pedidos: true,
    push_clientes: true,
    push_stock: true,
    push_presupuestos: true,
    push_sistema: true,
    digest_frequency: 'immediate',
    quiet_hours_start: '22:00:00',
    quiet_hours_end: '08:00:00'
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
  // Estado de SSE (simulado para desarrollo)
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [sseError, setSseError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  
  // Referencia para el intervalo de polling (fallback)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para hacer peticiones a la API de Node.js
  const apiRequest = useCallback(async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
      const response = await fetch(`${baseUrl}/notifications/`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error en API request:', error);
      throw error;
    }
  }, []);

  // Cargar notificaciones
  const loadNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiRequest<Notification[]>(`?${queryParams.toString()}`);

      console.log('Respuesta de la API:', response); // Para debugging

      if (response.success && response.data) {
        // La API devuelve directamente un array en data, no data.data
        setNotifications(response.data);
        
        // Por ahora usar paginación por defecto ya que no viene en la respuesta
        setPagination({
          page: 1,
          limit: 20,
          total: response.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
        
        // Calcular no leídas desde los datos
        const unreadCount = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unreadCount);
      } else {
        console.error('Respuesta de API no exitosa:', response);
        setNotifications([]);
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
        setUnreadCount(0);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Cargar configuración
  const loadSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    setSettingsError(null);

    try {
      // Por ahora usar configuración por defecto ya que no tenemos endpoint de settings
      // TODO: Implementar cuando tengas el endpoint de configuración
      console.log('Cargando configuración de notificaciones');
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Error al cargar configuración');
    } finally {
      setIsSettingsLoading(false);
    }
  }, []);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiRequest(`/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }, [apiRequest]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiRequest('/read-all', {
        method: 'PATCH'
      });

      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, [apiRequest]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await apiRequest(`/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setNotifications(prev => {
          const notificationToDelete = prev.find(n => n.id === notificationId);
          
          if (notificationToDelete && !notificationToDelete.is_read) {
            setUnreadCount(current => Math.max(0, current - 1));
          }
          
          return prev.filter(n => n.id !== notificationId);
        });
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  }, [apiRequest]);

  // Crear notificación
  const createNotification = useCallback(async (data: {
    template_name: string;
    variables?: Record<string, any>;
    priority?: NotificationPriority;
    action_url?: string;
    action_text?: string;
    expires_at?: string;
  }) => {
    try {
      const response = await apiRequest<{ notification: Notification }>('/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.success && response.data) {
        setNotifications(prev => [response.data!.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        return response.data.notification;
      }
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }, [apiRequest]);

  // Actualizar configuración
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      // Por ahora solo actualizar localmente ya que no tenemos endpoint de settings
      // TODO: Implementar cuando tengas el endpoint de configuración
      console.log('Actualizando configuración:', newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      throw error;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, [loadNotifications, loadSettings]);

  // Implementar SSE real
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const sseUrl = `${baseUrl}/notifications/stream/`;
        
        console.log('Conectando SSE a:', sseUrl);
        
        eventSource = new EventSource(sseUrl);
        
        eventSource.onopen = () => {
          console.log('✅ SSE conectado exitosamente a:', sseUrl);
          setIsSSEConnected(true);
          setSseError(null);
        };
        
                 eventSource.onmessage = (event) => {
           try {
             console.log('📨 Mensaje SSE recibido:', event.data);
             const data = JSON.parse(event.data);
             console.log('📋 Datos parseados:', data);
             
             // Los datos llegan directamente como notificación
             const newNotification = data;
             console.log('🔔 Nueva notificación recibida:', newNotification);
             
             // Agregar la nueva notificación al inicio de la lista
             setNotifications(prev => {
               // Evitar duplicados
               if (prev.some(n => n.id === newNotification.id)) {
                 console.log('⚠️ Notificación duplicada, ignorando');
                 return prev;
               }
               console.log('✅ Agregando nueva notificación a la lista');
               return [newNotification, ...prev];
             });
             
             // Incrementar contador de no leídas
             if (!newNotification.is_read) {
               setUnreadCount(prev => prev + 1);
               console.log('📈 Contador de no leídas incrementado');
             }
             
             // Mostrar alert flotante
             setCurrentNotification(newNotification);
             setShowAlert(true);
             console.log('🎯 Alert flotante activado');
             
             // Reproducir sonido inmediatamente para efecto de tiempo real
             if (settings.sound_enabled) {
               // Reproducir sonido con un pequeño delay para sincronizar con la animación
               setTimeout(() => {
                 playNotificationSound();
                 console.log('🔊 Sonido de notificación reproducido');
               }, 150);
             }
           } catch (error) {
             console.error('Error al procesar mensaje SSE:', error);
           }
         };
        
        eventSource.onerror = (error) => {
          console.error('❌ Error en conexión SSE:', error);
          setIsSSEConnected(false);
          setSseError('Error de conexión SSE');
          
          // Intentar reconectar después de 5 segundos
          setTimeout(() => {
            console.log('🔄 Intentando reconectar SSE...');
            if (eventSource) {
              eventSource.close();
              connectSSE();
            }
          }, 5000);
        };
        
        eventSource.addEventListener('close', () => {
          console.log('🔌 Conexión SSE cerrada');
          setIsSSEConnected(false);
        });
        
        // Listener para heartbeat/ping
        eventSource.addEventListener('ping', () => {
          console.log('💓 Heartbeat SSE recibido');
        });
        
        // Listener para cualquier evento
        eventSource.addEventListener('open', () => {
          console.log('🚀 Evento open SSE disparado');
        });
        
      } catch (error) {
        console.error('Error al inicializar SSE:', error);
        setIsSSEConnected(false);
        setSseError('Error al conectar SSE');
      }
    };
    
    // Conectar SSE
    connectSSE();
    
      // Cleanup al desmontar
  return () => {
    if (eventSource) {
      console.log('Cerrando conexión SSE');
      eventSource.close();
    }
  };
}, [userId, settings.sound_enabled, playNotificationSound]);

  // Polling como fallback si SSE no está disponible
  useEffect(() => {
    if (!isSSEConnected) {
      console.log('⚠️ SSE no disponible, usando polling como fallback');
      
      const pollInterval = setInterval(async () => {
        try {
          console.log('🔄 Polling: cargando notificaciones...');
          await loadNotifications();
        } catch (error) {
          console.error('❌ Error en polling:', error);
        }
      }, 30000); // Polling cada 30 segundos
      
      return () => clearInterval(pollInterval);
    } else {
      console.log('✅ SSE conectado, polling deshabilitado');
    }
  }, [isSSEConnected, loadNotifications]);

  // Verificación periódica de conexión SSE
  useEffect(() => {
    if (isSSEConnected) {
      const connectionCheck = setInterval(() => {
        console.log('🔍 Verificando conexión SSE...');
        // Si el estado dice que está conectado pero no hay actividad reciente,
        // podríamos marcar como desconectado
      }, 60000); // Verificar cada minuto
      
      return () => clearInterval(connectionCheck);
    }
  }, [isSSEConnected]);

  const closeFloatingNotification = useCallback(() => {
    setShowAlert(false);
    setCurrentNotification(null);
  }, []);

  return {
    // Estado
    notifications,
    unreadCount,
    settings,
    pagination,
    isLoading,
    error,
    isSettingsLoading,
    settingsError,
    
    // Estado SSE
    isSSEConnected,
    sseError,
    showAlert,
    currentNotification,
    
    // Acciones
    loadNotifications,
    loadSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    updateSettings,
    closeFloatingNotification,
    
    // Utilidades
    refresh: () => loadNotifications()
  };
};
