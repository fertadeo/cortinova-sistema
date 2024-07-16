'use client';
import ClientesTable from "@/components/clientesTable";

export default function ClientesPage() {
  return (
    <div className="w-full h-screen">
      <h1 className="size-14">Clientes</h1>
      <div style={{ flex: 1 }}>
        <ClientesTable />
      </div>
    </div>
  );
}
