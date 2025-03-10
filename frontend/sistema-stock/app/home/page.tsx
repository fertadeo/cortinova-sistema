"use client"
import SimpleTable from '@/components/simpleTable';
import BarChart from '@/components/chart';
import PresupuestosTable from '@/components/presupuestosTable';
import { useState, useEffect } from "react";


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
   
        <PresupuestosTable onDataLoaded={handleDataLoaded}  />
      </div>
   
    </div>
  );
}
