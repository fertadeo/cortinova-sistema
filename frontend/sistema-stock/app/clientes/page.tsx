'use client';

import dynamic from 'next/dynamic';

// Importa dinámicamente el componente ClientesTable y desactiva el SSR
const ClientesTable = dynamic(() => import('@/components/clientesTable'), { ssr: false });

export default function ClientesPage() {
  return (
    <div className="w-full h-screen">
      <div style={{ flex: 1 }}>
        <ClientesTable initialUsers={[]} />
      </div>
    </div>
  );
}
