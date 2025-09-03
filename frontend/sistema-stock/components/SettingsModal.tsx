"use client"

import { useState, useEffect } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Card, 
  CardBody, 
  Switch, 
  Slider,
  Divider,
  Select,
  SelectItem,
  Input,
  Avatar,
  Spinner
} from "@heroui/react";
import { useAlertSound } from '@/hooks/useAlertSound';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { useThemeSettings } from '@/hooks/useTheme';
import { useAvatarContext } from '@/contexts/AvatarContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  enabled: boolean;
  volume: number;
  soundType: string;
  customSound: string;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  soundOnHover: boolean;
}

interface ProfileSettings {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  company: string;
}

interface ThemeSettings {
  defaultTheme: 'light' | 'dark' | 'system';
  accentColor: string;
  autoSwitch: boolean;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { playNotificationSound } = useAlertSound();
  const { 
    profile, 
    isLoading: profileLoading, 
    error: profileError, 
    updateProfile, 
    uploadAvatar, 
    resetProfile 
  } = useProfile();
  
  // Contexto para actualización global del avatar
  const { triggerAvatarUpdate, avatarUpdateTrigger } = useAvatarContext();
  
  const { 
    settings: notificationSettings, 
    isLoading: notificationLoading, 
    error: notificationError, 
    updateSetting: updateNotificationSetting, 
    updateMultipleSettings: updateMultipleNotificationSettings, 
    resetSettings: resetNotificationSettings,
    testNotification 
  } = useNotifications();
  
  const { 
    settings: themeSettings, 
    isLoading: themeLoading, 
    error: themeError, 
    updateSetting: updateThemeSetting, 
    updateMultipleSettings: updateMultipleThemeSettings, 
    resetSettings: resetThemeSettings 
  } = useThemeSettings();

  const soundOptions = [
    { key: 'sony-alert', label: 'Sony Alert', description: 'Sonido de alerta Sony', file: '/alerts/Sony-Alert.m4a' },
    { key: 'iphone-notification', label: 'iPhone Notification', description: 'Notificación estilo iPhone', file: '/alerts/iphone-notification.m4a' },
    { key: 'Tono Suave', label: 'Tono Suave', description: 'Tono suave', file: '/alerts/Tono-Suave.mp3' }
  ];

  const themeOptions = [
    { key: 'light', label: 'Claro', description: 'Tema claro por defecto' },
    { key: 'dark', label: 'Oscuro', description: 'Tema oscuro por defecto' },
    { key: 'system', label: 'Sistema', description: 'Seguir configuración del sistema' }
  ];

  const colorOptions = [
    { key: 'blue', label: 'Azul', color: '#3B82F6' },
    { key: 'green', label: 'Verde', color: '#10B981' },
    { key: 'purple', label: 'Púrpura', color: '#8B5CF6' },
    { key: 'orange', label: 'Naranja', color: '#F59E0B' },
    { key: 'red', label: 'Rojo', color: '#EF4444' },
    { key: 'teal', label: 'Verde azulado', color: '#14B8A6' }
  ];

  const handleNotificationSettingChange = async (key: keyof NotificationSettings, value: any) => {
    await updateNotificationSetting(key, value);
  };

  const handleProfileSettingChange = async (key: keyof ProfileSettings, value: any) => {
    await updateProfile({ [key]: value });
  };

  const handleThemeSettingChange = async (key: keyof ThemeSettings, value: any) => {
    await updateThemeSetting(key, value);
  };

  const testSound = () => {
    if (notificationSettings.enabled) {
      const selectedSound = soundOptions.find(option => option.key === notificationSettings.soundType);
      if (selectedSound && selectedSound.file) {
        const audio = new Audio(selectedSound.file);
        audio.volume = notificationSettings.volume / 100;
        audio.play().catch(error => {
          console.error('Error reproduciendo sonido:', error);
        });
      } else {
        // Fallback al sonido por defecto
        playNotificationSound();
      }
    }
  };

  const testSpecificSound = (soundKey: string) => {
    if (notificationSettings.enabled) {
      const selectedSound = soundOptions.find(option => option.key === soundKey);
      if (selectedSound && selectedSound.file) {
        const audio = new Audio(selectedSound.file);
        audio.volume = notificationSettings.volume / 100;
        audio.play().catch(error => {
          console.error('Error reproduciendo sonido:', error);
        });
      }
    }
  };

  const saveSettings = () => {
    // Las configuraciones ya se guardan automáticamente en los hooks
    // Forzar actualización del avatar si se ha cambiado
    triggerAvatarUpdate();
    onClose();
  };

  const resetSettings = () => {
    resetNotificationSettings();
    resetProfile();
    resetThemeSettings();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Configuración del Sistema</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Personaliza tu perfil, notificaciones y configuraciones del ERP
          </p>
        </ModalHeader>

        <ModalBody>
          {/* Indicadores de estado */}
          {(profileLoading || notificationLoading || themeLoading) && (
            <div className="flex items-center justify-center p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Spinner size="sm" color="primary" />
              <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                Guardando configuraciones...
              </span>
            </div>
          )}

          {/* Mensajes de error */}
          {(profileError || notificationError || themeError) && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                {profileError || notificationError || themeError}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Sección de Perfil */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar
                    key={avatarUpdateTrigger}
                    src={profile.avatarUrl || undefined}
                    name={profile.name}
                    size="lg"
                    className="w-16 h-16"
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Perfil de Usuario
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Información personal y datos de contacto
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Nombre Completo
                    </label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleProfileSettingChange('name', e.target.value)}
                      size="sm"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileSettingChange('email', e.target.value)}
                      size="sm"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleProfileSettingChange('phone', e.target.value)}
                      size="sm"
                      placeholder="+54 9 351 755-2258"
                    />
                  </div>

                                     <div>
                     <label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                       Empresa
                     </label>
                     <Input
                       id="company"
                       value={profile.company}
                       isDisabled
                       size="sm"
                       className="bg-gray-50 dark:bg-gray-800"
                       description="La empresa se asigna automáticamente al crear el usuario"
                     />
                   </div>

                   <div>
                     <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                       Rol
                     </label>
                     <Select
                       id="role"
                       selectedKeys={[profile.role]}
                       isDisabled
                       size="sm"
                       className="bg-gray-50 dark:bg-gray-800"
                       description="El rol se asigna automáticamente al crear el usuario"
                     >
                       <SelectItem key="Administrador">Administrador</SelectItem>
                       <SelectItem key="Empleado">Empleado</SelectItem>
                       <SelectItem key="Vendedor">Vendedor</SelectItem>
                       <SelectItem key="Gerente">Gerente</SelectItem>
                     </Select>
                   </div>

                  <div>
                    <label htmlFor="avatar" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Foto de Perfil
                    </label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      size="sm"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const result = await uploadAvatar(file);
                          if (result.success) {
                            // Forzar actualización del avatar en todos los componentes
                            triggerAvatarUpdate();
                            // Mostrar mensaje de éxito
                            console.log('Avatar actualizado correctamente');
                          } else {
                            console.error('Error al subir avatar:', result.error);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Sección de Tema */}
            <Card>
              <CardBody className="p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Configuración de Tema
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="theme-selection" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Tema por Defecto
                    </label>
                    <div id="theme-selection" className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-labelledby="theme-selection">
                      {/* Card Tema Claro */}
                      <Card
                        isPressable
                        role="radio"
                        aria-checked={themeSettings.defaultTheme === 'light'}
                        className={`cursor-pointer transition-all duration-200 ${
                          themeSettings.defaultTheme === 'light'
                            ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onPress={() => handleThemeSettingChange('defaultTheme', 'light')}
                      >
                        <CardBody className="p-4 text-center">
                          <div className="flex justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8 text-gray-700 dark:text-gray-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                            </svg>
                          </div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Claro</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Tema claro por defecto</p>
                        </CardBody>
                      </Card>

                      {/* Card Tema Oscuro */}
                      <Card
                        isPressable
                        role="radio"
                        aria-checked={themeSettings.defaultTheme === 'dark'}
                        className={`cursor-pointer transition-all duration-200 ${
                          themeSettings.defaultTheme === 'dark'
                            ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onPress={() => handleThemeSettingChange('defaultTheme', 'dark')}
                      >
                        <CardBody className="p-4 text-center">
                          <div className="flex justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8 text-gray-700 dark:text-gray-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                            </svg>
                          </div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Oscuro</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Tema oscuro por defecto</p>
                        </CardBody>
                      </Card>

                      {/* Card Tema Sistema */}
                      <Card
                        isPressable
                        role="radio"
                        aria-checked={themeSettings.defaultTheme === 'system'}
                        className={`cursor-pointer transition-all duration-200 ${
                          themeSettings.defaultTheme === 'system'
                            ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onPress={() => handleThemeSettingChange('defaultTheme', 'system')}
                      >
                        <CardBody className="p-4 text-center">
                          <div className="flex justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8 text-gray-700 dark:text-gray-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                            </svg>
                          </div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Sistema</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Seguir configuración del sistema</p>
                        </CardBody>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="accentColor" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Color de Acento
                    </label>
                    <Select
                      id="accentColor"
                      selectedKeys={[themeSettings.accentColor]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        handleThemeSettingChange('accentColor', value);
                      }}
                      size="sm"
                    >
                      {colorOptions.map((option) => (
                        <SelectItem key={option.key}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: option.color }}
                            />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-medium text-gray-900 dark:text-gray-100">
                        Cambio Automático de Tema
                      </h6>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Cambiar automáticamente según la hora del día
                      </p>
                    </div>
                    <Switch
                      isSelected={themeSettings.autoSwitch}
                      onValueChange={(value) => handleThemeSettingChange('autoSwitch', value)}
                      color="primary"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Sección de Notificaciones */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Notificaciones
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Configura cómo recibir las notificaciones del sistema
                    </p>
                  </div>
                  <Switch
                    isSelected={notificationSettings.enabled}
                    onValueChange={(value) => handleNotificationSettingChange('enabled', value)}
                    color="primary"
                  />
                </div>

                {notificationSettings.enabled && (
                  <div className="space-y-4">
                    <Divider />
                    
                    {/* Configuración de Sonido */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            Sonido de Notificaciones
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configura el sonido que se reproduce al recibir notificaciones
                          </p>
                          {notificationSettings.soundType !== 'custom' && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                <strong>Sonido actual:</strong> {soundOptions.find(s => s.key === notificationSettings.soundType)?.label}
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={testNotification}
                          isDisabled={!notificationSettings.enabled}
                        >
                          Probar Sonido Actual
                        </Button>
                      </div>

                      {/* Tipo de Sonido */}
                      <div>
                        <label htmlFor="sound-selection" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Tipo de Sonido
                        </label>
                        <div id="sound-selection" className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="sound-selection">
                          {soundOptions.map((sound) => (
                            <Card
                              key={sound.key}
                              isPressable
                              role="radio"
                              aria-checked={notificationSettings.soundType === sound.key}
                              className={`cursor-pointer transition-all duration-200 ${
                                notificationSettings.soundType === sound.key
                                  ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                              onPress={() => handleNotificationSettingChange('soundType', sound.key)}
                            >
                              <CardBody className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex justify-center">
                                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{sound.label}</h5>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{sound.description}</p>
                                    </div>
                                  </div>
                                  <Button
                                    color="primary"
                                    variant="flat"
                                    size="sm"
                                    isIconOnly
                                    onPress={() => testSpecificSound(sound.key)}
                                    isDisabled={!notificationSettings.enabled}
                                    title="Probar sonido"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                  </Button>
                                </div>
                                {sound.file && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    Archivo: {sound.file.split('/').pop()}
                                  </div>
                                )}
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Sonido Personalizado */}
                      {notificationSettings.soundType === 'custom' && (
                        <div>
                          <label htmlFor="customSound" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Archivo de Audio Personalizado
                          </label>
                          <div className="space-y-3">
                            <Input
                              id="customSound"
                              type="file"
                              accept="audio/*"
                              size="sm"
                              placeholder="Seleccionar archivo de audio..."
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleNotificationSettingChange('customSound', file.name);
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500">
                              Formatos soportados: MP3, WAV, M4A (máximo 5MB)
                            </p>
                            {notificationSettings.customSound && (
                              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Archivo seleccionado: {notificationSettings.customSound}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-300">
                                    Haz clic en &quot;Probar Sonido Actual&quot; para escucharlo
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="success"
                                  onPress={testSound}
                                  isDisabled={!notificationSettings.enabled}
                                >
                                  Probar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Volumen */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor="volume" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Volumen
                          </label>
                          <span className="text-sm text-gray-500">{notificationSettings.volume}%</span>
                        </div>
                        <Slider
                          id="volume"
                          size="sm"
                          step={5}
                          color="primary"
                          showSteps={false}
                          maxValue={100}
                          minValue={0}
                          value={notificationSettings.volume}
                          onChange={(value) => handleNotificationSettingChange('volume', value)}
                          className="max-w-md"
                        />
                      </div>

                      {/* Opciones Adicionales */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h6 className="font-medium text-gray-900 dark:text-gray-100">
                              Notificaciones de Escritorio
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Mostrar notificaciones del navegador
                            </p>
                          </div>
                          <Switch
                            isSelected={notificationSettings.desktopNotifications}
                            onValueChange={(value) => handleNotificationSettingChange('desktopNotifications', value)}
                            color="primary"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h6 className="font-medium text-gray-900 dark:text-gray-100">
                              Notificaciones por Email
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Enviar notificaciones importantes por email
                            </p>
                          </div>
                          <Switch
                            isSelected={notificationSettings.emailNotifications}
                            onValueChange={(value) => handleNotificationSettingChange('emailNotifications', value)}
                            color="primary"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h6 className="font-medium text-gray-900 dark:text-gray-100">
                              Sonido al Hover
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Reproducir sonido al pasar el mouse sobre notificaciones
                            </p>
                          </div>
                          <Switch
                            isSelected={notificationSettings.soundOnHover}
                            onValueChange={(value) => handleNotificationSettingChange('soundOnHover', value)}
                            color="primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Sección de Configuración General */}
            <Card>
              <CardBody className="p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Configuración General
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="timezone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Zona Horaria
                    </label>
                    <Select
                      id="timezone"
                      selectedKeys={['America/Argentina/Buenos_Aires']}
                      size="sm"
                    >
                      <SelectItem key="America/Argentina/Buenos_Aires">
                        Argentina (GMT-3)
                      </SelectItem>
                      <SelectItem key="America/New_York">
                        Nueva York (GMT-5)
                      </SelectItem>
                      <SelectItem key="Europe/Madrid">
                        España (GMT+1)
                      </SelectItem>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="language" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Idioma
                    </label>
                    <Select
                      id="language"
                      selectedKeys={['es']}
                      size="sm"
                    >
                      <SelectItem key="es">Español</SelectItem>
                      <SelectItem key="en">English</SelectItem>
                      <SelectItem key="pt">Português</SelectItem>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="dateFormat" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Formato de Fecha
                    </label>
                    <Select
                      id="dateFormat"
                      selectedKeys={['dd/mm/yyyy']}
                      size="sm"
                    >
                      <SelectItem key="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem key="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem key="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" variant="light" onPress={resetSettings}>
            Restablecer
          </Button>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" onPress={saveSettings}>
            Guardar Configuración
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
