"use client"

import { Button } from "@heroui/react";
import { useNotificationsV2 } from '@/hooks/useNotificationsV2';

const NotificationTestButton = () => {
  const { createNotification } = useNotificationsV2();

  const handleCreateTestNotification = async () => {
    try {
      await createNotification({
        template_name: 'STOCK_BAJO',
        variables: {
          producto: 'Tela Premium',
          cantidad: 5,
          fecha: new Date().toLocaleDateString('es-ES'),
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        },
        priority: 'HIGH',
        action_url: '/productos',
        action_text: 'Gestionar Stock'
      });
      
      console.log('Notificación de prueba creada exitosamente');
    } catch (error) {
      console.error('Error al crear notificación de prueba:', error);
    }
  };

  return (
    <Button
      color="primary"
      variant="flat"
      size="sm"
      onPress={handleCreateTestNotification}
    >
      Crear Notificación de Prueba
    </Button>
  );
};

export default NotificationTestButton;

