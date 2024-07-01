import { Menucards } from '@/components/menucards';
import SimpleTable from '@/components/simpleTable'; // Asegúrate de que el nombre del archivo y el componente sean correctos

export default function Home() {
  return (
    <div className="flex flex-col h-screen p-4">
      {/* Menú cards ocupando el 100% */}
      <div className="w-full h-24 mb-4">
        <h2 style={{fontFamily:'revert', fontSize:'1.5rem', marginBottom:'1rem'}}> ¡Bienvenido nuevamente, User! </h2>
        <Menucards />
      </div>

      {/* Grid de dos columnas debajo */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Espacio izquierdo para SimpleTable */}
        <div className="w-full md:w-1/2 ">
        <h3 className='' style={{fontFamily:'revert', fontSize:'1.2rem', marginTop:'4rem', marginBottom:'1rem', fontStyle:'bold'}}> Últimos 5 pedidos ingresados  </h3>
          <SimpleTable />
        </div>

        {/* Espacio derecho (opcional) */}
        <div className="w-full md:w-1/2">
          {/* Contenido del espacio derecho */}
        </div>
      </div>
    </div>
  );
}
