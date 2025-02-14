"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@nextui-org/react";
import { PedidoEstado, estadoColors } from "@/types/pedido";

interface Pedido {
  id: number;
  fecha_pedido: string;
  estado: PedidoEstado;
  pedido_json: {
    numeroPresupuesto: string;
  };
  cliente: {
    nombre: string;
  };
}

export default function SimpleTable() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`);
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        const data = await response.json();
        const pedidosData = data.data || [];
        
        // Ordenar por fecha y tomar los últimos 5, asegurando estado Confirmado
        const ultimosPedidos = pedidosData
          .map((pedido: Pedido) => ({
            ...pedido,
            estado: pedido.estado || PedidoEstado.CONFIRMADO // Estado por defecto: Confirmado
          }))
          .sort((a: Pedido, b: Pedido) => 
            new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()
          )
          .slice(0, 5);

        setPedidos(ultimosPedidos);
      } catch (error) {
        console.error("Error fetching pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Table
        aria-label="Tabla de pedidos recientes"
        className="mt-4"
      >
        <TableHeader>
          <TableColumn>N° PEDIDO</TableColumn>
          <TableColumn>FECHA</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>ESTADO</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay pedidos recientes">
          {pedidos.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.pedido_json.numeroPresupuesto}</TableCell>
              <TableCell>
                {new Date(pedido.fecha_pedido).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </TableCell>
              <TableCell>{pedido.cliente.nombre}</TableCell>
              <TableCell>
                <Chip
                  color={estadoColors[pedido.estado as PedidoEstado] as "default" | "primary" | "secondary" | "success" | "warning" | "danger"}
                  variant="flat"
                  size="sm"
                >
                  {pedido.estado}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
