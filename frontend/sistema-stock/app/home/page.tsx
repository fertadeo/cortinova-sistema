"use client"
import SimpleTable from '@/components/simpleTable';
import BarChart from '@/components/chart';
import PresupuestosTable from '@/components/presupuestosTable';
import NotificationCenter from '@/components/NotificationCenter';
import SettingsModal from '@/components/SettingsModal';
import { ThemeSwitch } from '@/components/theme-switch';
import { useState, useEffect } from "react";
import { Alert, Button, Avatar } from '@heroui/react';
import { useProfile } from '@/hooks/useProfile';
import { useAvatarContext } from '@/contexts/AvatarContext';

export default function Home() {
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Usar el hook useProfile para obtener datos del perfil
  const { profile } = useProfile();
  // Contexto para actualización del avatar
  const { avatarUpdateTrigger } = useAvatarContext();

  const handleDataLoaded = () => {
    setIsLoading(false);
  };

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleAvatarClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <div className="flex relative flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header con título y acciones */}
      <div className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 py-4 sm:py-6">
             <div className="flex-1 min-w-0">
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">
                 Panel de Control
               </h1>
               <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                 Resumen general de tu negocio - {new Date().toLocaleDateString('es-ES', { 
                   weekday: 'long', 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric' 
                 })}
               </p>
               <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                 {new Date().toLocaleDateString('es-ES', { 
                   day: 'numeric',
                   month: 'short',
                   year: 'numeric'
                 })}
               </p>
             </div>
             
             <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
               {/* Botón Filtrar período - oculto en móvil, solo icono */}
               <Button
                 variant="flat"
                 color="default"
                 size="sm"
                 className="hidden sm:flex"
                 startContent={
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 }
               >
                 Filtrar período
               </Button>
               
               {/* Botón solo icono para móvil */}
               <Button
                 variant="flat"
                 color="default"
                 size="sm"
                 isIconOnly
                 className="sm:hidden"
                 title="Filtrar período"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               </Button>
               
                                               <ThemeSwitch />
                <NotificationCenter />
                
                {/* Botón de configuración */}
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  title="Configuración"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  onPress={handleSettingsOpen}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </Button>

                {/* Avatar del usuario */}
                <Avatar
                  key={avatarUpdateTrigger}
                  isBordered
                  color="primary"
                  src={profile.avatarUrl || undefined}
                  name={profile.name}
                  size="sm"
                  className="cursor-pointer hover:scale-105 transition-transform"
                  title={`${profile.name} - ${profile.role}`}
                  onClick={handleAvatarClick}
                />
             </div>
           </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 py-6">
        <div className="mb-4">
          <Alert
            color="success"
            title="Ya se encuentran disponibles los Presupuestos de:"
            description="Bandas Verticales, Roller, Dubai, Paneles, Venecianas."
            variant="faded"
          />
        </div>
      
        {/* Añadimos un margen adicional debajo de Menucards */}
        <div className="mt-4" />

        {/* Grid de dos columnas para tabla y gráficos */}
        <div className="flex flex-col gap-12 px-4 w-full md:flex-row md:space-x-8">
          {/* Columna izquierda con SimpleTable */}
          <div className="p-6 w-full bg-white dark:bg-dark-card rounded-lg shadow md:w-1/2">
            <h3 className="mb-4 text-lg font-medium text-center text-gray-900 dark:text-dark-text"> Últimos 5 pedidos ingresados </h3>
            <SimpleTable />
          </div>

          {/* Columna derecha con BarChart */}
          <div className="p-6 w-full bg-white dark:bg-dark-card rounded-lg shadow md:w-1/2">
            <h3 className="mb-4 text-lg font-medium text-center text-gray-900 dark:text-dark-text"> Resumen de movimientos </h3>
            <BarChart  options={options} />
          </div>
        </div>

        {/* Añadimos un margen adicional debajo del grid de dos columnas */}
        <div className="mt-4" />

        {/* Seguimiento de Presupuestos - Columna completa */}
        <div className="p-6 px-4 py-6 mt-6 w-full bg-white dark:bg-dark-card rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium text-center text-gray-900 dark:text-dark-text"> Seguimiento de Presupuestos </h2>
     
                     <PresupuestosTable onDataLoaded={handleDataLoaded}  />
         </div>
       </div>

       {/* Modal de Configuración */}
       <SettingsModal 
         isOpen={isSettingsOpen} 
         onClose={handleSettingsClose} 
       />
     </div>
   );
 }
