"use client";

import Link from "next/link";

export const Menucards = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-4 ">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Card 1 */}
        <Link href="/clientes">
          <div
            className="flex flex-col items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md"
            style={{
              backgroundImage: `url('/images/cards/clientes.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Puedes añadir contenido aquí si es necesario */}
          </div>
        </Link>

        {/* Card 2 */}
        <Link href="/lista-precios">
          <div
            className="flex flex-col items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md"
            style={{
              backgroundImage: `url('/images/cards/listaprecios.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Puedes añadir contenido aquí si es necesario */}
          </div>
        </Link>

        {/* Card 3 */}
        <Link href="/pedidos">
          <div
            className="flex flex-col items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md"
            style={{
              backgroundImage: `url('/images/cards/pedidos.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Puedes añadir contenido aquí si es necesario */}
          </div>
        </Link>

        {/* Card 4 */}
        <Link href="/presupuestos">
          <div
            className="flex flex-col items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md"
            style={{
              backgroundImage: `url('/images/cards/presupuestos.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Puedes añadir contenido aquí si es necesario */}
          </div>
        </Link>

        {/* Card 5 */}
        <Link href="/stock">
          <div
            className="flex flex-col items-center justify-center w-48 h-24 bg-white rounded-lg shadow-md"
            style={{
              backgroundImage: `url('/images/cards/stock.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              cursor: 'pointer',
            }}
          >
            {/* Puedes añadir contenido aquí si es necesario */}
          </div>
        </Link>
      </div>
    </div>
  );
};
