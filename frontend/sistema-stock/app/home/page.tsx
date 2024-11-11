import { Menucards } from '@/components/menucards';
import SimpleTable from '@/components/simpleTable';
import BarChart from '@/components/chart';
import PresupuestosTable from '@/components/presupuestosTable';
import AnimatedButton from '@/components/animatedButton';


export default function Home() {
  // const data = {
  //   labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
  //   datasets: [
  //     {
  //       label: 'Pedidos Realizados',
  //       data: [25, 19, 40, 11, 6, 5, 10],
  //       backgroundColor: '#12C0C8',
  //       borderColor: 'rgba(75, 192, 192, 1)',
  //       borderWidth: 1,
  //     },
  //     {
  //       label: 'Clientes Agregados',
  //       data: [65, 59, 80, 81, 56, 55, 40],
  //       backgroundColor: '#F19C0F',
  //       borderColor: 'rgba(75, 192, 192, 1)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="relative flex flex-col min-h-full " style={{ backgroundColor: '#F5F5F5' }}>
      {/* Título responsivo */}
      <div className="w-full px-4 py-2">
        {/* <Menucards /> */}
      </div>
      
      {/* Añadimos un margen adicional debajo de Menucards */}
      <div className="mt-4" />

      {/* Grid de dos columnas para tabla y gráficos */}
      <div className="flex flex-col w-full gap-12 px-4 md:flex-row md:space-x-8">
        {/* Columna izquierda con SimpleTable */}
        <div className="w-full p-6 bg-white rounded-lg shadow md:w-1/2">
          <h3 className="mb-4 text-lg font-medium text-center"> Últimos 5 pedidos ingresados </h3>
          <SimpleTable />
        </div>

        {/* Columna derecha con BarChart */}
        <div className="w-full p-6 bg-white rounded-lg shadow md:w-1/2">
          <h3 className="mb-4 text-lg font-medium text-center"> Resumen de movimientos </h3>
          <BarChart  options={options} />
        </div>
      </div>

      {/* Añadimos un margen adicional debajo del grid de dos columnas */}
      <div className="mt-4" />

      {/* Seguimiento de Presupuestos - Columna completa */}
      <div className="w-full p-6 px-4 py-6 mt-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-medium text-center"> Seguimiento de Presupuestos </h2>
        <div className="">
          <PresupuestosTable />
        </div>
      </div>
    </div>
  );
}
