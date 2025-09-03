"use client"

import { useState } from 'react';
import { Button } from "@heroui/react";
import { useNotificationsV2 } from '@/hooks/useNotificationsV2';

const SSETestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSSEConnected, sseError, createNotification } = useNotificationsV2();

  const testSSEConnection = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Probando conexión SSE...');
      
      // Crear una notificación de prueba
      const testNotification = await createNotification({
        template_name: 'INFO',
        variables: {
          title: 'Prueba SSE',
          message: 'Esta es una notificación de prueba para verificar el SSE'
        },
        priority: 'MEDIUM'
      });
      
      console.log('✅ Notificación de prueba creada:', testNotification);
    } catch (error) {
      console.error('❌ Error al crear notificación de prueba:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hidden fixed bottom-4 left-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
        <h3 className="text-sm font-semibold mb-2">Prueba SSE</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSSEConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs">
              {isSSEConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          {sseError && (
            <p className="text-xs text-red-500">{sseError}</p>
          )}
          <Button
            size="sm"
            color="primary"
            onPress={testSSEConnection}
            isLoading={isLoading}
          >
            Probar SSE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SSETestButton;
