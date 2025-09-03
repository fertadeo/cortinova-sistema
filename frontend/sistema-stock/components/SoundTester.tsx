"use client"

import { useState, useCallback, useRef } from 'react';
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

const SoundTester = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    try {
      // Crear el elemento de audio si no existe
      if (!audioRef.current) {
        audioRef.current = new Audio('/alert-notification.m4a');
        audioRef.current.volume = 0.5; // Volumen al 50%
        audioRef.current.preload = 'auto';
      }

      // Reproducir el sonido
      audioRef.current.currentTime = 0; // Reiniciar al inicio
      audioRef.current.play().catch((error) => {
        console.log('Error reproduciendo sonido:', error);
      });
      
    } catch (error) {
      console.log('Error reproduciendo sonido:', error);
    }
  }, []);

  const playSequence = useCallback(() => {
    // Reproducir el sonido 3 veces con intervalos
    playSound();
    setTimeout(() => playSound(), 1000);
    setTimeout(() => playSound(), 2000);
  }, [playSound]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Probador de Sonido de Notificación</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Prueba el sonido de notificación que se usará en el sistema de alertas.
        </p>
      </div>

      {/* Tarjeta principal del sonido */}
      <div className="max-w-2xl mx-auto">
        <Card className="cursor-pointer transition-all hover:scale-105">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Sonido de Notificación</h3>
              <Button
                color="primary"
                variant="solid"
                onPress={playSound}
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                }
              >
                Reproducir Sonido
              </Button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Archivo de audio: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">alert-notification.m4a</code>
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Volumen:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">50%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Formato:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">M4A (AAC)</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Ubicación:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">/public/alert-notification.m4a</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Botones de prueba */}
      <div className="mt-8 flex justify-center gap-4">
        <Button
          color="primary"
          variant="flat"
          onPress={playSound}
          startContent={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          }
        >
          Reproducir Una Vez
        </Button>
        
        <Button
          color="secondary"
          variant="flat"
          onPress={playSequence}
          startContent={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        >
          Reproducir Secuencia (3 veces)
        </Button>
      </div>

      {/* Información del sistema */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          ℹ️ Información del Sistema de Notificaciones
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>Archivo de audio:</strong> Se usa el archivo real <code>alert-notification.m4a</code></li>
          <li>• <strong>Volumen:</strong> Configurado al 50% para no ser molesto</li>
          <li>• <strong>Reproducción:</strong> Se reinicia automáticamente al inicio</li>
          <li>• <strong>Compatibilidad:</strong> Funciona en todos los navegadores modernos</li>
          <li>• <strong>Uso:</strong> Se reproduce automáticamente en las notificaciones de pedidos</li>
        </ul>
      </div>
    </div>
  );
};

export default SoundTester;
