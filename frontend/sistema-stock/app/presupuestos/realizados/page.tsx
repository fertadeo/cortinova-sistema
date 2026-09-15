"use client"
import { useState } from 'react';
import { Button, Alert } from '@heroui/react';
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">
                Presupuestos Emitidos
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Historial completo de presupuestos emitidos
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                color="primary"
                size="lg"
                onClick={handleCrearNuevo}
                className="w-full sm:w-auto min-h-[44px]"
                startContent={
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
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

      {/* Content */}
      <div className="px-4 py-6">
        <div className="mb-4">
          <Alert
            color="success"
            title="Presupuestos disponibles"
            description="Aquí puedes ver y gestionar todos los presupuestos emitidos."
            variant="faded"
          />
        </div>

        {/* Table Section */}
        <div className="p-4 sm:p-6 bg-white dark:bg-dark-card rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-dark-text">
            Listado de Presupuestos
          </h2>
          <PresupuestosTable onDataLoaded={handleDataLoaded} />
        </div>
      </div>
    </div>
  );
}
