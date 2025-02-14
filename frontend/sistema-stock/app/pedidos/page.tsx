"use client"
import React, { useState } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Input, Select, SelectItem, Card } from "@nextui-org/react";

// Datos de ejemplo
const pedidosMock = [
  {
    id: 1,
    presupuestoId: "PRES-001",
    cliente: "Juan Pérez",
    estado: "pendiente",
    fechaCreacion: "2024-02-20",
    fechaEntrega: "2024-03-01",
    total: 150000,
    sistema: "Roller",
  },
  {
    id: 2,
    presupuestoId: "PRES-002",
    cliente: "María García",
    estado: "en_produccion",
    fechaCreacion: "2024-02-19",
    fechaEntrega: "2024-03-05",
    total: 280000,
    sistema: "Barcelona",
  },
  // ... más pedidos de ejemplo
];

type ChipColors = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

const statusColorMap: Record<string, ChipColors> = {
  pendiente: "warning",
  en_produccion: "primary",
  en_revision: "secondary",
  listo: "success",
  entregado: "success",
  cancelado: "danger",
} as const;

const PedidosPage = () => {
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <Card className="p-4 ">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <Button color="primary">
          Nuevo Pedido
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Buscar por cliente o número de presupuesto..."
          startContent={
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="text-gray-400 size-4"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
              />
            </svg>
          }
          value={filterValue}
          onValueChange={setFilterValue}
        />
        <Select
          className="w-full sm:max-w-[200px]"
          selectedKeys={[statusFilter]}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <SelectItem key="all" value="all">Todos los estados</SelectItem>
          <SelectItem key="pendiente" value="pendiente">Pendiente</SelectItem>
          <SelectItem key="en_produccion" value="en_produccion">En Producción</SelectItem>
          <SelectItem key="en_revision" value="en_revision">En Revisión</SelectItem>
          <SelectItem key="listo" value="listo">Listo</SelectItem>
          <SelectItem key="entregado" value="entregado">Entregado</SelectItem>
          <SelectItem key="cancelado" value="cancelado">Cancelado</SelectItem>
        </Select>
      </div>

      <Table aria-label="Tabla de pedidos" className="mt-4">
        <TableHeader>
          <TableColumn>ID PRESUPUESTO</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>SISTEMA</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>FECHA CREACIÓN</TableColumn>
          <TableColumn>FECHA ENTREGA</TableColumn>
          <TableColumn>TOTAL</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {pedidosMock.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.presupuestoId}</TableCell>
              <TableCell>{pedido.cliente}</TableCell>
              <TableCell>{pedido.sistema}</TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color={statusColorMap[pedido.estado] as ChipColors}
                  size="sm"
                  variant="flat"
                >
                  {pedido.estado.replace('_', ' ')}
                </Chip>
              </TableCell>
              <TableCell>{pedido.fechaCreacion}</TableCell>
              <TableCell>{pedido.fechaEntrega}</TableCell>
              <TableCell>${pedido.total.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" color="primary" variant="flat">
                    Ver
                  </Button>
                  <Button size="sm" color="secondary" variant="flat">
                    Editar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
    </div>
  )
}

export default PedidosPage