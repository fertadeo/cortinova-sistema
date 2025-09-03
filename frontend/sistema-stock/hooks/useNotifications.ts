import { useState, useCallback, useEffect } from 'react';

interface NotificationSettings {
  enabled: boolean;
  volume: number;
  soundType: string;
  customSound: string;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  soundOnHover: boolean;
}

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    volume: 50,
    soundType: 'sony-alert',
    customSound: '',
    desktopNotifications: true,
    emailNotifications: false,
    soundOnHover: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuraciones desde localStorage al inicializar
  useEffect(() => {
    loadSettingsFromStorage();
  }, []);

  const loadSettingsFromStorage = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem('notificationSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error cargando configuraciones de notificaciones:', error);
    }
  }, []);

  const saveSettingsToStorage = useCallback((notificationSettings: NotificationSettings) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Error guardando configuraciones en localStorage:', error);
      setError('Error al guardar las configuraciones localmente');
    }
  }, []);

  const updateSetting = useCallback(async (key: keyof NotificationSettings, value: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSettings = { ...settings, [key]: value };
      
      // Guardar en localStorage inmediatamente
      saveSettingsToStorage(updatedSettings);

      // Aquí iría la llamada real a tu API
      // const response = await fetch('/api/notifications/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSettings)
      // });
      
      // if (!response.ok) throw new Error('Error al actualizar configuraciones');

      setIsLoading(false);
      return { success: true, data: updatedSettings };
    } catch (error) {
      setIsLoading(false);
      setError('Error al actualizar las configuraciones');
      return { success: false, error: 'Error al actualizar las configuraciones' };
    }
  }, [settings, saveSettingsToStorage]);

  const updateMultipleSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSettings = { ...settings, ...updates };
      
      // Guardar en localStorage inmediatamente
      saveSettingsToStorage(updatedSettings);

      // Aquí iría la llamada real a tu API
      // const response = await fetch('/api/notifications/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSettings)
      // });
      
      // if (!response.ok) throw new Error('Error al actualizar configuraciones');

      setIsLoading(false);
      return { success: true, data: updatedSettings };
    } catch (error) {
      setIsLoading(false);
      setError('Error al actualizar las configuraciones');
      return { success: false, error: 'Error al actualizar las configuraciones' };
    }
  }, [settings, saveSettingsToStorage]);

  const resetSettings = useCallback(() => {
    const defaultSettings: NotificationSettings = {
      enabled: true,
      volume: 50,
      soundType: 'sony-alert',
      customSound: '',
      desktopNotifications: true,
      emailNotifications: false,
      soundOnHover: false
    };

    saveSettingsToStorage(defaultSettings);
    setError(null);
  }, [saveSettingsToStorage]);

  const testNotification = useCallback(async () => {
    if (!settings.enabled) return;

    try {
      // Solicitar permisos de notificación si no están habilitados
      if (settings.desktopNotifications && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setError('Se requieren permisos de notificación para las notificaciones de escritorio');
          return;
        }
      }

      // Mostrar notificación de prueba
      if (settings.desktopNotifications && Notification.permission === 'granted') {
        new Notification('Cortinova ERP', {
          body: 'Esta es una notificación de prueba del sistema',
          icon: '/favicon.ico',
          tag: 'test-notification'
        });
      }

      // Reproducir sonido de prueba
      const selectedSound = getSoundFile(settings.soundType);
      if (selectedSound) {
        const audio = new Audio(selectedSound);
        audio.volume = settings.volume / 100;
        await audio.play();
      }

      return { success: true };
    } catch (error) {
      setError('Error al probar la notificación');
      return { success: false, error: 'Error al probar la notificación' };
    }
  }, [settings]);

  const getSoundFile = useCallback((soundType: string) => {
    const soundOptions = [
      { key: 'sony-alert', file: '/alerts/Sony-Alert.m4a' },
      { key: 'iphone-notification', file: '/alerts/iphone-notification.m4a' },
      { key: 'alert-notification', file: '/alert-notification.m4a' }
    ];
    
    const selectedSound = soundOptions.find(option => option.key === soundType);
    return selectedSound ? selectedSound.file : null;
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    testNotification,
    loadSettingsFromStorage
  };
};

