import { Menucards } from '@/components/menucards';
import SimpleTable from '@/components/simpleTable';
import BarChart from '@/components/chart';
import {PedidosTable} from '@/components/pedidosTable';




export default function Home() {


  const data = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
    datasets: [
      {
        label: 'Pedidos Realizados',
        data: [25, 19, 40, 11, 6, 5, 10],
        backgroundColor: '#12C0C8',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Clientes Agregados',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: '#F19C0F',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
 

  return (
    <div className="flex flex-col h-screen" style={{backgroundColor:'#F5F5F5'}}>
      {/* Menú cards ocupando el 100% */}
      <div className="w-full h-screen">
        <h2 style={{fontSize:'1.1rem', marginBottom:'1rem'}}> ¡Bienvenido nuevamente, User! </h2>
        <Menucards />
      </div>

      {/* Grid de dos columnas debajo */}
      <div className="flex flex-col space-x-8 md:flex-row ">
        {/* Espacio izquierdo para SimpleTable */}
        <div className="w-full md:w-1/2">
        <h3 className="justify-center align-middle"> Últimos 5 pedidos ingresados  </h3>
          <SimpleTable />
        </div>

        {/* Espacio derecho de Tabla */}
        <div className="w-full md:w-1/2 ">
          {/* Contenido del espacio derecho */}     
          <h3 className='' style={{fontFamily:'revert', fontSize:'1.2rem', marginBottom:'1rem', fontStyle:'bold'}}> Resumen de movimientos </h3>
      <BarChart data={data} options={options} />
        </div>
      </div>
      <div className="flex flex-col h-screen">
        <h2 className='pb-5'> Seguimiento de Presupuestos </h2>
      <PedidosTable/> 
      </div>
    </div>
  );
}
