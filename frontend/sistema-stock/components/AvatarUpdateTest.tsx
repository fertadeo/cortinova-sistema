"use client"

import { useState } from 'react';
import { Avatar, Button, Card, CardBody, Badge } from '@heroui/react';
import { useProfile } from '@/hooks/useProfile';
import { useAvatarContext } from '@/contexts/AvatarContext';

const AvatarUpdateTest = () => {
  const { profile, uploadAvatar, isLoading } = useProfile();
  const { avatarUpdateTrigger, triggerAvatarUpdate } = useAvatarContext();
  const [testResult, setTestResult] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTestResult('Subiendo imagen...');
      const result = await uploadAvatar(file);
      if (result.success) {
        setTestResult('✅ Imagen subida correctamente');
        // El trigger se ejecuta automáticamente en el SettingsModal
      } else {
        setTestResult(`❌ Error: ${result.error}`);
      }
    }
  };

  const handleManualTrigger = () => {
    triggerAvatarUpdate();
    setTestResult('🔄 Actualización manual ejecutada');
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="space-y-4">
        <h3 className="text-lg font-semibold">Prueba de Actualización de Avatar</h3>
        
        {/* Contador de actualizaciones */}
        <div className="text-center">
          <Badge color="primary" variant="flat">
            Actualizaciones: {avatarUpdateTrigger}
          </Badge>
        </div>
        
        {/* Avatar actual */}
        <div className="flex justify-center">
          <Avatar
            key={avatarUpdateTrigger}
            src={profile.avatarUrl || undefined}
            name={profile.name}
            size="lg"
            className="w-20 h-20"
            isBordered
            color="primary"
          />
        </div>
        
        {/* Información del perfil */}
        <div className="text-center">
          <p><strong>Nombre:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Rol:</strong> {profile.role}</p>
          <p><strong>Avatar URL:</strong> {profile.avatarUrl ? '✅ Configurada' : '❌ No configurada'}</p>
        </div>
        
        {/* Subida de archivo */}
        <div>
          <label htmlFor="avatar-test" className="block text-sm font-medium mb-2">
            Seleccionar imagen de prueba
          </label>
          <input
            id="avatar-test"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
          />
        </div>
        
        {/* Botón de actualización manual */}
        <Button
          color="secondary"
          variant="flat"
          size="sm"
          onPress={handleManualTrigger}
        >
          Forzar Actualización Manual
        </Button>
        
        {/* Estado de carga */}
        {isLoading && (
          <div className="text-center text-blue-600">
            ⏳ Procesando imagen...
          </div>
        )}
        
        {/* Resultado */}
        {testResult && (
          <div className={`text-center p-2 rounded ${
            testResult.includes('✅') ? 'bg-green-100 text-green-800' : 
            testResult.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {testResult}
          </div>
        )}
        
        {/* Instrucciones */}
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>Instrucciones:</strong></p>
          <p>1. Selecciona una imagen para subir</p>
          <p>2. Verifica que el avatar se actualice automáticamente</p>
          <p>3. El contador debe incrementarse</p>
          <p>4. Todos los avatares en la app deben actualizarse</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default AvatarUpdateTest;
