"use client"

import { useNotificationsV2 } from '@/hooks/useNotificationsV2';
import { Alert, Button } from "@heroui/react";
import SSETestButton from './SSETestButton';
import { useEffect, useState } from 'react';

const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    showAlert,
    currentNotification, 
    closeFloatingNotification, 
    markAsRead 
  } = useNotificationsV2();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showAlert && currentNotification) {
      // Pequeño delay para crear efecto de "tiempo real"
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        console.log('🎯 Mostrando alert flotante:', currentNotification.title);
      }, 100);

      // Auto-ocultar después de 8 segundos
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(closeFloatingNotification, 300); // Esperar a que termine la animación
      }, 8000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showAlert, currentNotification, closeFloatingNotification]);

  const getNotificationColor = (type: string) => {
    if (!type || type === '') return 'primary';
    
    switch (type.toLowerCase()) {
      case 'sistema':
      case 'info':
      case 'nuevo_cliente':
      case 'pedido_listo':
      case 'presupuesto_disponible':
        return 'primary';
      case 'stock_bajo':
      case 'pedido_atrasado':
      case 'sistema_error':
        return 'danger';
      case 'venta_realizada':
      case 'pedido_creado':
        return 'success';
      case 'nueva_medida':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getNotificationIcon = (type: string) => {
    const color = getNotificationColor(type);
    const colorClass = {
      primary: 'text-blue-500',
      danger: 'text-red-500',
      success: 'text-green-500',
      warning: 'text-yellow-500'
    }[color] || 'text-blue-500';
    
    if (!type || type === '') {
      return (
        <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    switch (type.toLowerCase()) {
      case 'stock_bajo':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'pedido_creado':
      case 'pedido_listo':
      case 'venta_realizada':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'sistema_error':
      case 'pedido_atrasado':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'nueva_medida':
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'sistema':
      case 'info':
      case 'nuevo_cliente':
      case 'presupuesto_disponible':
      default:
        return (
          <svg className={`w-5 h-5 ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <>
      {children}
             {isVisible && currentNotification && (
         <div className="fixed top-4 right-4 z-50 w-96">
                       <Alert
              color={getNotificationColor(currentNotification.type) as any}
              variant="solid"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
              startContent={getNotificationIcon(currentNotification.type)}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => {
                    setIsVisible(false);
                    setTimeout(closeFloatingNotification, 300);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              }
            >
             <div className="flex flex-col gap-1">
               <div className="flex items-center justify-between">
                 <h4 className="text-sm font-semibold">
                   {currentNotification.title}
                 </h4>
                 <span className="text-xs text-gray-500">
                   Ahora mismo
                 </span>
               </div>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 {currentNotification.message}
               </p>
               <div className="flex items-center gap-2 mt-2">
                 {!currentNotification.is_read && markAsRead && (
                   <Button
                     size="sm"
                     variant="light"
                     color={getNotificationColor(currentNotification.type) as any}
                     onPress={() => markAsRead(currentNotification.id)}
                   >
                     Marcar como leída y archivar
                   </Button>
                 )}
                 <Button
                   size="sm"
                   variant="light"
                   color="default"
                   onPress={() => {
                     setIsVisible(false);
                     setTimeout(closeFloatingNotification, 300);
                   }}
                 >
                   Ver todas
                 </Button>
               </div>
             </div>
           </Alert>
         </div>
       )}
      <SSETestButton />
    </>
  );
};

export default NotificationProvider;
