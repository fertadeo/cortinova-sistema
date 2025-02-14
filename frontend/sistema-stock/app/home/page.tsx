"use client"
import { Menucards } from '@/components/menucards';
import SimpleTable from '@/components/simpleTable';
import BarChart from '@/components/chart';
import PresupuestosTable from '@/components/presupuestosTable';
import AnimatedButton from '@/components/animatedButton';
import { Skeleton } from "@nextui-org/react";
import { useState, useEffect } from "react";
import TourGuide from "@/components/TourGuide";


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

  const handleDataLoaded = () => {
    // console.log('Datos cargados, desactivando skeleton'); // Para debug
    setIsLoading(false);
  };

  return (
    <div className="flex relative flex-col min-h-full" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Título responsivo */}
      <div className="px-4 py-2 w-full">
        {/* <Menucards /> */}
      </div>
      
      {/* Añadimos un margen adicional debajo de Menucards */}
      <div className="mt-4" />

      {/* Grid de dos columnas para tabla y gráficos */}
      <div className="flex flex-col gap-12 px-4 w-full md:flex-row md:space-x-8">
        {/* Columna izquierda con SimpleTable */}
        <div className="p-6 w-full bg-white rounded-lg shadow md:w-1/2">
          <h3 className="mb-4 text-lg font-medium text-center"> Últimos 5 pedidos ingresados </h3>
          <SimpleTable />
        </div>

        {/* Columna derecha con BarChart */}
        <div className="p-6 w-full bg-white rounded-lg shadow md:w-1/2">
          <h3 className="mb-4 text-lg font-medium text-center"> Resumen de movimientos </h3>
          <BarChart  options={options} />
        </div>
      </div>

      {/* Añadimos un margen adicional debajo del grid de dos columnas */}
      <div className="mt-4" />

      {/* Seguimiento de Presupuestos - Columna completa */}
      <div className="p-6 px-4 py-6 mt-6 w-full bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-medium text-center"> Seguimiento de Presupuestos </h2>
        {/* {isLoading ? (
          <div className="space-y-3 w-full">
            <Skeleton className="w-full rounded-lg">
              <div className="h-12 rounded-lg bg-default-300"></div>
            </Skeleton>
            <Skeleton className="w-full rounded-lg">
              <div className="h-12 rounded-lg bg-default-300"></div>
            </Skeleton>
            <Skeleton className="w-full rounded-lg">
              <div className="h-12 rounded-lg bg-default-300"></div>
            </Skeleton>
          </div>
        ) : null} */}
        <PresupuestosTable onDataLoaded={handleDataLoaded}  />
      </div>
      {/* <TourGuide /> */}
    </div>
  );
}
