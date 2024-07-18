'use client';
import ClientesTable from "@/components/clientesTable";

export default function ClientesPage() {
  return (
    <div className="w-full h-screen">
      <div style={{ flex: 1 }}>
        <ClientesTable initialUsers={[]} />
      </div>
    </div>
  );
}
