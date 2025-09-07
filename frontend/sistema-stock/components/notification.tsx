"use client"

import { useEffect, useState } from 'react';
import { Button } from "@heroui/react";
import { useAlertSound } from "@/hooks/useAlertSound";

interface NotificationProps {
  pedidosAtrasados: number;
  pedidosNuevos: number;
  onDismiss: () => void;
}

const Notification = ({ pedidosAtrasados, pedidosNuevos, onDismiss }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { playNotificationSound } = useAlertSound();

  useEffect(() => {
    // Mostrar notificación si hay pedidos atrasados o nuevos
    if (pedidosAtrasados > 0 || pedidosNuevos > 0) {
      setIsVisible(true);
      playNotificationSound();
      
      // Reproducir sonido cada 30 segundos si hay pedidos atrasados
      if (pedidosAtrasados > 0) {
        const interval = setInterval(() => {
          playNotificationSound();
        }, 30000); // 30 segundos
        
        return () => clearInterval(interval);
      }
    } else {
      setIsVisible(false);
    }
  }, [pedidosAtrasados, pedidosNuevos, playNotificationSound]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce hidden">
      <div className="bg-red-500 dark:bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg border-l-4 border-red-700 dark:border-red-800 max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              {pedidosAtrasados > 0 && (
                <p className="text-sm font-medium">
                  ¡Tienes {pedidosAtrasados} pedido{pedidosAtrasados > 1 ? 's' : ''} atrasado{pedidosAtrasados > 1 ? 's' : ''}!
                </p>
              )}
              {pedidosNuevos > 0 && (
                <p className="text-sm font-medium">
                  ¡Tienes {pedidosNuevos} pedido{pedidosNuevos > 1 ? 's' : ''} nuevo{pedidosNuevos > 1 ? 's' : ''} pendiente{pedidosNuevos > 1 ? 's' : ''} de revisión!
                </p>
              )}
            </div>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-white hover:bg-red-600 dark:hover:bg-red-700"
            onPress={() => {
              setIsVisible(false);
              onDismiss();
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
