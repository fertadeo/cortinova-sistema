'use client';
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

interface NotificationProps {
  message: string;
  description: string;
  isVisible: boolean;
  onClose: () => void;
  type: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, description, isVisible, onClose, type }) => {
  const [progress, setProgress] = useState(100); // Estado para controlar el progreso de la barra
  const [isTransitioning, setIsTransitioning] = useState(false); // Estado para controlar la transición
  const notificationDuration = 4000; // Duración en milisegundos de la notificación
  const timerRef = useRef<number | null>(null); // Usamos una referencia para almacenar el temporizador

  // Función para iniciar el progreso de la barra
  const startProgress = () => {
    setProgress(100); // Reiniciamos la barra a 100%
    setIsTransitioning(true); // Activamos la transición después de mostrar la barra

    let start = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = 100 - (elapsed / notificationDuration) * 100;
      setProgress(newProgress > 0 ? newProgress : 0);

      if (newProgress <= 0) {
        clearInterval(timerRef.current!);
        onClose();
      }
    }, 16); // Actualizamos cada ~16ms (aproximadamente 60fps)
  };

  // Efecto para manejar el ciclo de vida de la notificación
  useEffect(() => {
    if (isVisible) {
      startProgress(); // Iniciar la barra cuando se muestra la notificación
    }

    // Limpiar el temporizador cuando la notificación se cierre
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setProgress(100); // Reiniciamos el progreso cuando la notificación se cierra
      setIsTransitioning(false); // Desactivamos la transición
    };
  }, [isVisible]);

  // Estilo dinámico para el borde inferior según el tipo de notificación
  const progressBarStyle = {
    width: `${progress}%`,
    transition: isTransitioning ? 'width 0.1s linear' : 'none', // La transición solo se aplica cuando isTransitioning es true
    height: '4px',
    backgroundColor: type === 'success' ? 'green' : 'red',
  };

  // Definimos el ícono y el color según el tipo de notificación
  const icon = type === 'success' ? (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-400">
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
      </svg>
    </div>
  ) : (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-400">
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );

  const notificationElement = (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      style={{ zIndex: 9999 }} // Agregamos un z-index alto para que se muestre sobre todo
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {isVisible && (
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {icon} {/* Mostramos el ícono dinámico dentro del círculo */}
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

            {/* Barra de progreso */}
            <div style={progressBarStyle}></div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(notificationElement, document.body);
};

export default Notification;
