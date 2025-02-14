"use client"
import { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Tooltip } from "@nextui-org/react";
import { PedidoEstado, estadoColors } from "@/types/pedido";

interface Pedido {
  id: number;
  fecha_pedido: string;
  estado: PedidoEstado;
  pedido_json: {
    numeroPresupuesto: string;
    productos: Array<{
      nombre: string;
      cantidad: number;
      detalles: {
        sistema: string;
      };
    }>;
  };
  cliente: {
    nombre: string;
  };
}

const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    className="w-4 h-4"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
    />
  </svg>
);

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`);
        if (!response.ok) throw new Error('Error al cargar pedidos');
        
        const data = await response.json();
        const pedidosData = data.data || [];
        setPedidos(pedidosData);
      } catch (error) {
        console.error("Error fetching pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  const filteredPedidos = pedidos.filter((pedido) => {
    const searchTerm = filterValue.toLowerCase();
    const matchesSearch = 
      pedido.pedido_json.numeroPresupuesto.toLowerCase().includes(searchTerm) ||
      pedido.cliente.nombre.toLowerCase().includes(searchTerm) ||
      pedido.pedido_json.productos[0]?.detalles.sistema.toLowerCase().includes(searchTerm);
    
    const matchesEstado = selectedEstado === "todos" || pedido.estado === selectedEstado;
    
    return matchesSearch && matchesEstado;
  });

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Pedidos</h1>
      
      <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
        <div className="flex gap-4 justify-between items-center">
          <div className="w-96">
            <Input
              isClearable
              className="w-full"
              placeholder="Buscar por N° pedido, cliente, sistema..."
              startContent={<SearchIcon />}
              value={filterValue}
              onValueChange={setFilterValue}
            />
          </div>
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                className="capitalize"
              >
                Estado: {selectedEstado === "todos" ? "Todos" : selectedEstado}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtrar por estado"
              onAction={(key) => setSelectedEstado(key as string)}
              selectedKeys={new Set([selectedEstado])}
            >
              <DropdownItem key="todos">Todos</DropdownItem>
              {Object.values(PedidoEstado).map((estado) => (
                <DropdownItem key={estado} textValue={estado}>
                  {estado}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <Table aria-label="Tabla de pedidos">
        <TableHeader>
          <TableColumn>N° PEDIDO</TableColumn>
          <TableColumn>FECHA</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>SISTEMA</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>OPCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay pedidos que coincidan con la búsqueda">
          {filteredPedidos.map((pedido) => (
            <TableRow key={pedido.id}>
              <TableCell>{pedido.pedido_json.numeroPresupuesto}</TableCell>
              <TableCell>
                {new Date(pedido.fecha_pedido).toLocaleDateString('es-AR')}
              </TableCell>
              <TableCell>{pedido.cliente.nombre}</TableCell>
              <TableCell>
                {pedido.pedido_json.productos[0]?.detalles.sistema || 'N/A'}
              </TableCell>
              <TableCell>
                <Chip
                  color={estadoColors[pedido.estado as PedidoEstado]}
                  variant="flat"
                  size="sm"
                >
                  {pedido.estado}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Ver detalles">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="light" 
                      onPress={() => console.log('Ver pedido', pedido.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Editar pedido">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="light" 
                      onPress={() => console.log('Editar pedido', pedido.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
