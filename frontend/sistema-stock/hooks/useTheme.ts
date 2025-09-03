import { useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface ThemeSettings {
  defaultTheme: 'light' | 'dark' | 'system';
  accentColor: string;
  autoSwitch: boolean;
}

export const useThemeSettings = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>({
    defaultTheme: 'system',
    accentColor: 'blue',
    autoSwitch: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuraciones desde localStorage al inicializar
  useEffect(() => {
    loadSettingsFromStorage();
  }, []);

  // Aplicar tema cuando cambien las configuraciones
  useEffect(() => {
    if (settings.defaultTheme !== 'system') {
      setTheme(settings.defaultTheme);
    }
  }, [settings.defaultTheme, setTheme]);

  const loadSettingsFromStorage = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem('themeSettings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error cargando configuraciones de tema:', error);
    }
  }, []);

  const saveSettingsToStorage = useCallback((themeSettings: ThemeSettings) => {
    try {
      localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
      setSettings(themeSettings);
    } catch (error) {
      console.error('Error guardando configuraciones de tema en localStorage:', error);
      setError('Error al guardar las configuraciones del tema localmente');
    }
  }, []);

  const updateSetting = useCallback(async (key: keyof ThemeSettings, value: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSettings = { ...settings, [key]: value };
      
      // Guardar en localStorage inmediatamente
      saveSettingsToStorage(updatedSettings);

      // Aplicar cambios inmediatamente si es el tema
      if (key === 'defaultTheme' && value !== 'system') {
        setTheme(value);
      }

      // Aquí iría la llamada real a tu API
      // const response = await fetch('/api/theme/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSettings)
      // });
      
      // if (!response.ok) throw new Error('Error al actualizar configuraciones del tema');

      setIsLoading(false);
      return { success: true, data: updatedSettings };
    } catch (error) {
      setIsLoading(false);
      setError('Error al actualizar las configuraciones del tema');
      return { success: false, error: 'Error al actualizar las configuraciones del tema' };
    }
  }, [settings, saveSettingsToStorage, setTheme]);

  const updateMultipleSettings = useCallback(async (updates: Partial<ThemeSettings>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedSettings = { ...settings, ...updates };
      
      // Guardar en localStorage inmediatamente
      saveSettingsToStorage(updatedSettings);

      // Aplicar cambios inmediatamente si es el tema
      if (updates.defaultTheme && updates.defaultTheme !== 'system') {
        setTheme(updates.defaultTheme);
      }

      // Aquí iría la llamada real a tu API
      // const response = await fetch('/api/theme/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSettings)
      // });
      
      // if (!response.ok) throw new Error('Error al actualizar configuraciones del tema');

      setIsLoading(false);
      return { success: true, data: updatedSettings };
    } catch (error) {
      setIsLoading(false);
      setError('Error al actualizar las configuraciones del tema');
      return { success: false, error: 'Error al actualizar las configuraciones del tema' };
    }
  }, [settings, saveSettingsToStorage, setTheme]);

  const resetSettings = useCallback(() => {
    const defaultSettings: ThemeSettings = {
      defaultTheme: 'system',
      accentColor: 'blue',
      autoSwitch: true
    };

    saveSettingsToStorage(defaultSettings);
    setTheme('system');
    setError(null);
  }, [saveSettingsToStorage, setTheme]);

  const applyAccentColor = useCallback((color: string) => {
    // Aquí podrías aplicar el color de acento al CSS
    // Por ejemplo, actualizando variables CSS personalizadas
    document.documentElement.style.setProperty('--accent-color', getAccentColorValue(color));
  }, []);

  const getAccentColorValue = useCallback((color: string) => {
    const colorMap: Record<string, string> = {
      'blue': '#3B82F6',
      'green': '#10B981',
      'purple': '#8B5CF6',
      'orange': '#F59E0B',
      'red': '#EF4444',
      'teal': '#14B8A6'
    };
    return colorMap[color] || colorMap.blue;
  }, []);

  return {
    settings,
    currentTheme: theme,
    isLoading,
    error,
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    applyAccentColor,
    loadSettingsFromStorage
  };
};

