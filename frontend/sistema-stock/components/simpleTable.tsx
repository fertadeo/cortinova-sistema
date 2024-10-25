"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

interface Pedido {
  id: string;
  cliente: string;
  estado: string;
}

export default function SimpleTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`);
        const data: Pedido[] = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error fetching pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <>
    
    <div className="flex flex-col gap-3">
      <Table
        selectionMode="single"
        aria-label="Tabla de pedidos"
      >
        <TableHeader>
          <TableColumn>PEDIDO</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>ESTADO</TableColumn>
        </TableHeader>
        <TableBody>
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{`Pedido #${pedido.id}`}</TableCell>
                <TableCell>{pedido.cliente}</TableCell>
                <TableCell>{pedido.estado}</TableCell>
              </TableRow>
            ))
          ) : (
<></>
          )}
        </TableBody>
      </Table>

      {/* Alerta de Tailwind CSS que solo aparece si no hay pedidos */}
      {pedidos.length === 0 && (
      <div
      className="relative px-4 py-3 text-teal-700 bg-teal-200 border border-teal-500 rounded bg-opacity-30 border-opacity-30"
      role="alert"
  >
      <strong className="font-bold">No hay pedidos pendientes! <br /></strong>
      <span className="block sm:inline">Cargá tus pedidos para volver a verlos aquí.</span>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg
              className="w-6 h-6 text-teal-500 fill-current"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
          >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
      </span>
  </div>
  
   
      )}
    </div>
    </>
  );
}
