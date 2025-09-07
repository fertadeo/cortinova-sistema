"use client"

import { useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Badge, Card, CardBody, Divider, Pagination, Tabs, Tab } from "@heroui/react";
import { useAlertSound } from '@/hooks/useAlertSound';
import { useNotificationsV2 } from '@/hooks/useNotificationsV2';
import { SSEStatusIndicator } from './SSEStatusIndicator';
import ModalConfirmation from './modalConfirmation';

// Usar la interfaz de notificaciones del hook
import type { Notification } from '@/hooks/useNotificationsV2';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'nuevas' | 'archivadas'>('nuevas');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const { 
    notifications, 
    unreadCount, 
    isSSEConnected, 
    sseError,
    markAsRead, 
    deleteNotification,
    markAllAsRead,
    pagination,
    loadNotifications,
    loadArchivedNotifications,
    refreshArchivedNotifications,
    isLoading,
    markingAsRead,
    markingAllAsRead
  } = useNotificationsV2();
  const { playNotificationSound } = useAlertSound();

  const handleOpen = () => {
    setIsOpen(true);
    setActiveTab('nuevas');
    // Cargar notificaciones de la primera página
    loadNotifications({ page: 1, limit: 10 });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (activeTab === 'archivadas') {
      loadArchivedNotifications({ page, limit: 10 });
    } else {
      loadNotifications({ page, limit: 10 });
    }
  };

  const handleTabChange = (tab: 'nuevas' | 'archivadas') => {
    setActiveTab(tab);
    setCurrentPage(1);
    // Cargar notificaciones según el tab seleccionado
    if (tab === 'archivadas') {
      loadArchivedNotifications({ page: 1, limit: 10 });
    } else {
      loadNotifications({ page: 1, limit: 10 });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    // Actualizar notificaciones archivadas para dar sensación de tiempo real
    if (activeTab === 'archivadas') {
      await refreshArchivedNotifications();
    }
  };

  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (notificationToDelete) {
      await deleteNotification(notificationToDelete);
      setShowDeleteConfirmation(false);
      setNotificationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setNotificationToDelete(null);
  };

    const getNotificationColor = (type: Notification['type']) => {
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

  const getNotificationBackgroundClass = (type: Notification['type'], isRead: boolean) => {
    if (isRead) return '';
    
    const color = getNotificationColor(type);
    const colorMap = {
      primary: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500',
      danger: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500',
      success: 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'
    };
    
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const color = getNotificationColor(type);
    const colorClass = {
      primary: 'text-blue-500',
      danger: 'text-red-500',
      success: 'text-green-500',
      warning: 'text-yellow-500'
    }[color] || 'text-blue-500';
    
    // Si el tipo está vacío o es undefined, usar icono por defecto
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  return (
    <>
             {/* Botón de notificaciones */}
       <div className="relative">
         <Button
           isIconOnly
           variant="light"
           className={`relative ${unreadCount > 0 ? 'text-red-500 hover:text-red-600' : ''}`}
           onPress={handleOpen}
         >
           <svg 
             xmlns="http://www.w3.org/2000/svg" 
             fill="none" 
             viewBox="0 0 24 24" 
             strokeWidth="1.5" 
             stroke="currentColor" 
             className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-500' : ''}`}
           >
             <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
           </svg>
           
           {/* Badge de notificaciones no leídas */}
           {unreadCount > 0 && (
             <Badge
               color="danger"
               size="sm"
               className="absolute -top-2 -right-2"
             >
               {unreadCount > 99 ? '99+' : unreadCount}
             </Badge>
           )}
         </Button>
       </div>

      {/* Modal de notificaciones */}
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Notificaciones</h3>
                <SSEStatusIndicator 
                  isConnected={isSSEConnected} 
                  error={sseError}
                  className="ml-2"
                />
              </div>
              {/* <div className="flex items-center gap-2">
                {pagination && pagination.total > 0 && (
                  <span className="text-sm text-gray-500">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
                  </span>
                )}
                {unreadCount > 0 && (
                  <Badge color="danger" variant="flat" className='hidden'>
                    {unreadCount} sin leer
                  </Badge>
                )}
              </div> */}
            </div>
            
            {/* Tabs para notificaciones nuevas y archivadas */}
            <div className="w-full">
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={(key) => handleTabChange(key as 'nuevas' | 'archivadas')}
                color="primary"
                variant="underlined"
                className="w-full"
              >
                <Tab 
                  key="nuevas" 
                  title={
                    <div className="flex items-center gap-2">
                      <span>Nuevas</span>
                      {unreadCount > 0 && (
                        <Badge color="danger" size="sm" variant="flat">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  }
                />
                <Tab key="archivadas" title="Archivadas" />
              </Tabs>
            </div>
          </ModalHeader>
          
          <ModalBody>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando notificaciones...</p>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75a6 6 0 006 6h3a6 6 0 006-6V9.75a6 6 0 00-6-6h-3z" />
                </svg>
                <p className="text-gray-500">
                  {activeTab === 'archivadas' 
                    ? 'No hay notificaciones archivadas' 
                    : 'No hay notificaciones'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {notifications && notifications.map((notification) => (
                                         <Card
                       key={notification.id}
                       className={`transition-all hover:shadow-md ${getNotificationBackgroundClass(notification.type, notification.is_read)}`}
                     >
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                                           <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                   {notification.title}
                                 </h4>
                                 <Badge 
                                   color={getNotificationColor(notification.type) as any} 
                                   size="sm" 
                                   variant="flat"
                                 >
                                   {notification.type || 'info'}
                                 </Badge>
                               </div>
                               <span className="text-xs text-gray-500">
                                 {formatTimeAgo(new Date(notification.created_at))}
                               </span>
                             </div>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.is_read && activeTab === 'nuevas' && (
                              <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                isLoading={markingAsRead.has(notification.id)}
                                onPress={() => handleMarkAsRead(notification.id)}
                              >
                                {markingAsRead.has(notification.id) ? 'Marcando...' : 'Marcar como leída y archivar'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              isIconOnly
                              onPress={() => handleDeleteClick(notification.id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
                
                {/* Paginación */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      total={pagination.totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      showControls
                      showShadow
                      color="primary"
                      size="sm"
                    />
                  </div>
                )}
              </>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Cerrar
            </Button>
            <div className="flex gap-2">
                             {notifications && notifications.length > 0 && activeTab === 'nuevas' && (
                <Button 
                  color="primary" 
                  isLoading={markingAllAsRead}
                  onPress={markAllAsRead}
                >
                  {markingAllAsRead ? 'Marcando todas...' : 'Marcar todas como leídas'}
                </Button>
              )}
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <ModalConfirmation
        isOpen={showDeleteConfirmation}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default NotificationCenter;
