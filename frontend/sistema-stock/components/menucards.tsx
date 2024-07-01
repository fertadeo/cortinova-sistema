"use client";

import Link from "next/link";

export const Menucards = () => {


  return (

    <div className="grid grid-cols-1 md:grid-cols-5 h-2">
      {/* <!-- Card 1 --> */}
      
      <Link href="/clientes">
      <div
        className="col-span-1 flex flex-col items-center"
        style={{
          width: '200px',
          backgroundImage: `url('/images/cards/clientes.png')`,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          display: 'flex',
          height: '100px', // Asegúrate de ajustar el tamaño según tus necesidades
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >

      </div>
    </Link>

      {/* <!-- Card 3 --> */}
      <Link href="/lista-precios">
      <div
        className="col-span-1 flex flex-col items-center"
        style={{
          width: '200px',
          backgroundImage: `url('/images/cards/listaprecios.png')`,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          display: 'flex',
          height: '100px', // Asegúrate de ajustar el tamaño según tus necesidades
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >

      </div>
    </Link>
 {/* <!-- Card 1 --> */}
 <Link href="/pedidos">
      <div
        className="col-span-1 flex flex-col items-center"
        style={{
          width: '200px',
          backgroundImage: `url('/images/cards/pedidos.png')`,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          display: 'flex',
          height: '100px', // Asegúrate de ajustar el tamaño según tus necesidades
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >

      </div>
    </Link>
      {/* <!-- Card 4 --> */}
      <Link href="/presupuestos">
      <div
        className="col-span-1 flex flex-col items-center"
        style={{
          width: '200px',
          backgroundImage: `url('/images/cards/presupuestos.png')`,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          display: 'flex',
          height: '100px', // Asegúrate de ajustar el tamaño según tus necesidades
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >

      </div>
    </Link>

      {/* <!-- Card 5 --> */}
      <Link href="/stock">
      <div
        className="col-span-1 flex flex-col items-center"
        style={{
          width: '200px',
          backgroundImage: `url('/images/cards/stock.png')`,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          display: 'flex',
          height: '100px', // Asegúrate de ajustar el tamaño según tus necesidades
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >

      </div>
    </Link>

      
    </div>

 )
};
