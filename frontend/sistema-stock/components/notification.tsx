'use client';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface NotificationProps {
  message: string;
  description: string;
  isVisible: boolean;
  onClose: () => void;
  type: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, description, isVisible, onClose, type }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000); // Oculta la notificación después de 4 segundos
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Definimos el ícono y el color según el tipo de notificación
  const icon = type === 'success' ? (
    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
    </svg>
  ) : (
    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const notificationElement = (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      style={{ zIndex: 9999 }} // Agregamos un z-index alto
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {isVisible && (
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {icon} {/* Mostramos el ícono dinámico según el tipo */}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{message}</p>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Usamos ReactDOM.createPortal para renderizar la notificación en un lugar diferente del DOM
  return ReactDOM.createPortal(notificationElement, document.body);
};

export default Notification;
