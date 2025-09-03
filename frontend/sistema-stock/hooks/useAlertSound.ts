import { useState, useCallback, useRef } from 'react';

export const useAlertSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getNotificationSettings = () => {
    try {
      const settings = localStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error leyendo configuración de notificaciones:', error);
      return null;
    }
  };

  const getSoundFile = (soundType: string) => {
    const soundOptions = [
      { key: 'sony-alert', file: '/alerts/Sony-Alert.m4a' },
      { key: 'iphone-notification', file: '/alerts/iphone-notification.m4a' },
      { key: 'alert-notification', file: '/alert-notification.m4a' } // Fallback
    ];
    
    const selectedSound = soundOptions.find(option => option.key === soundType);
    return selectedSound ? selectedSound.file : '/alerts/Sony-Alert.m4a'; // Default a Sony Alert
  };

  const playAlertSound = useCallback((type: 'warning' | 'error' | 'info' = 'warning') => {
    try {
      const settings = getNotificationSettings();
      const soundType = settings?.soundType || 'sony-alert';
      const volume = settings?.volume || 50;
      const soundFile = getSoundFile(soundType);

      // Crear el elemento de audio si no existe o si cambió el archivo
      if (!audioRef.current || audioRef.current.src !== window.location.origin + soundFile) {
        audioRef.current = new Audio(soundFile);
        audioRef.current.volume = volume / 100;
        audioRef.current.preload = 'auto';
      } else {
        // Actualizar volumen si ya existe
        audioRef.current.volume = volume / 100;
      }

      // Reproducir el sonido
      audioRef.current.currentTime = 0; // Reiniciar al inicio
      audioRef.current.play().catch((error) => {
        console.log('No se pudo reproducir el sonido:', error);
      });
      
    } catch (error) {
      console.log('No se pudo reproducir el sonido:', error);
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    playAlertSound('warning');
  }, [playAlertSound]);

  const playErrorSound = useCallback(() => {
    playAlertSound('error');
  }, [playAlertSound]);

  const playInfoSound = useCallback(() => {
    playAlertSound('info');
  }, [playAlertSound]);

  return {
    playAlertSound,
    playNotificationSound,
    playErrorSound,
    playInfoSound
  };
};
