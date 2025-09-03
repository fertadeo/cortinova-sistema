"use client"

import { useEffect, useState } from 'react';
import { Alert, Button } from "@heroui/react";
import { useAlertSound } from "@/hooks/useAlertSound";

interface GeneralNotificationProps {
  message: string;
  description: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
}

const GeneralNotification = ({ message, description, type, isVisible, onClose }: GeneralNotificationProps) => {
  const { playNotificationSound } = useAlertSound();

  useEffect(() => {
    if (isVisible) {
      // Reproducir sonido cuando se muestra la notificación
      playNotificationSound();
      
      // Auto-ocultar después de 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, playNotificationSound]);

  if (!isVisible) return null;

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 animate-in slide-in-from-right-2 duration-300">
      <Alert
        color={getAlertColor(type) as any}
        variant="solid"
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
        startContent={getAlertIcon(type)}
        endContent={
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        }
      >
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {message}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </Alert>
    </div>
  );
};

export default GeneralNotification;

