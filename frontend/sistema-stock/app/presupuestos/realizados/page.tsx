"use client"
import { useState } from 'react';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import PresupuestosTable from '@/components/presupuestosTable';

export default function PresupuestosRealizadosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const handleDataLoaded = () => {
    setIsLoading(false);
  };

  const handleCrearNuevo = () => {
    router.push('/presupuestos');
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 py-4 sm:py-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">
                Presupuestos Emitidos
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Listado de todos los presupuestos emitidos
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              <Button
                color="primary"
                size="md"
                onPress={handleCrearNuevo}
                startContent={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Crear Nuevo Presupuesto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 py-6">
        <div className="p-6 w-full bg-white dark:bg-dark-card rounded-lg shadow">
          <PresupuestosTable onDataLoaded={handleDataLoaded} />
        </div>
      </div>
    </div>
  );
}
