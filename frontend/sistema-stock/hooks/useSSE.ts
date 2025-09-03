import { useEffect, useRef, useCallback, useState } from 'react';

export interface SSEEvent {
  type: 'connection' | 'heartbeat' | 'notification' | 'error';
  message?: string;
  userId?: string;
  timestamp?: string;
  notification?: any;
}

export interface SSEOptions {
  onMessage?: (event: SSEEvent) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useSSE = (url: string, options: SSEOptions = {}) => {
  const {
    onMessage,
    onOpen,
    onError,
    onClose,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE: Conexión establecida');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          setLastEvent(data);
          onMessage?.(data);
        } catch (err) {
          console.error('SSE: Error al parsear mensaje:', err);
        }
      };

      eventSource.addEventListener('connection', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          setLastEvent(data);
          onMessage?.(data);
        } catch (err) {
          console.error('SSE: Error al parsear evento de conexión:', err);
        }
      });

      eventSource.addEventListener('heartbeat', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          setLastEvent(data);
          onMessage?.(data);
        } catch (err) {
          console.error('SSE: Error al parsear heartbeat:', err);
        }
      });

      eventSource.addEventListener('notification', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          setLastEvent(data);
          onMessage?.(data);
        } catch (err) {
          console.error('SSE: Error al parsear notificación:', err);
        }
      });

      eventSource.onerror = (error) => {
        console.error('SSE: Error en conexión:', error);
        setIsConnected(false);
        setError('Error en la conexión SSE');
        onError?.(error);

        // Intentar reconectar
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`SSE: Intentando reconectar (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.error('SSE: Máximo número de intentos de reconexión alcanzado');
          setError('No se pudo reconectar después de múltiples intentos');
        }
      };

      eventSource.addEventListener('close', () => {
        console.log('SSE: Conexión cerrada');
        setIsConnected(false);
        onClose?.();
      });

    } catch (err) {
      console.error('SSE: Error al crear conexión:', err);
      setError('Error al crear conexión SSE');
    }
  }, [url, onMessage, onOpen, onError, onClose, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    error,
    connect,
    disconnect,
    reconnect
  };
};
