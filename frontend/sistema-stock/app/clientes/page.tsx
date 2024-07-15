'use client';
import ClientesTable from "@/components/clientesTable";

export default function ClientesPage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ marginBottom: '16px' }}>Clientes</h1>
      <div style={{ flex: 1 }}>
        <ClientesTable />
      </div>
    </div>
  );
}
