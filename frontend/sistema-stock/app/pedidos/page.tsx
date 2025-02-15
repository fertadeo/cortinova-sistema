"use client"
import "@/styles/globals.css"
import { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { PedidoEstado, estadoColors } from "@/types/pedido";
import { jsPDF } from "jspdf";

interface Pedido {
  id: number;
  fecha_pedido: string;
  fecha_entrega: string | null;
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

interface ProduccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido;
  onConfirm: (fechaEntrega: Date) => void;
}

const ProduccionModal = ({ isOpen, onClose, pedido, onConfirm }: ProduccionModalProps) => {
  const [fechaEntrega, setFechaEntrega] = useState<string>("");

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      className="md:!max-w-2xl z-[30]"
    >
      <ModalContent>
        <ModalHeader className="text-lg md:text-xl">Llevar pedido a producción</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Información General */}
            <div className="p-3 bg-gray-50 rounded-lg md:p-4">
              <h3 className="mb-3 text-base font-semibold md:text-lg">Resumen del Pedido</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="text-sm md:text-base">
                  <span className="font-medium">N° Pedido:</span> {pedido.pedido_json.numeroPresupuesto}
                </div>
                <div className="text-sm md:text-base">
                  <span className="font-medium">Cliente:</span> {pedido.cliente.nombre}
                </div>
                <div className="text-sm md:text-base">
                  <span className="font-medium">Sistema:</span> {pedido.pedido_json.productos[0]?.detalles.sistema}
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div className="overflow-auto max-h-[40vh] md:max-h-[50vh]">
              <h3 className="sticky top-0 py-2 text-base font-semibold bg-white md:text-lg">
                Especificaciones
              </h3>
              <div className="space-y-4">
                {pedido.pedido_json.productos.map((producto, index) => (
                  <div key={index} className="p-3 rounded-lg border md:p-4">
                    <div className="text-sm font-medium md:text-base">{producto.nombre}</div>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Cantidad:</span>
                        <span className="ml-2">{producto.cantidad}</span>
                      </div>
                      {Object.entries(producto.detalles).map(([key, value]) => (
                        <div key={key} className="flex flex-wrap">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fecha de Entrega */}
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 md:text-base">
                Fecha de Entrega Estimada
              </label>
              <Input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                isRequired
                className="w-full"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-2 md:flex-row">
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            className="w-full md:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={() => onConfirm(new Date(fechaEntrega))}
            isDisabled={!fechaEntrega}
            className="w-full md:w-auto"
          >
            Confirmar y llevar a producción
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface DetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido;
}

const DetalleModal = ({ isOpen, onClose, pedido }: DetalleModalProps) => {
  const handlePrintPDF = () => {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text(`Pedido: ${pedido.pedido_json.numeroPresupuesto}`, 20, 20);
    
    // Información del cliente
    doc.setFontSize(12);
    doc.text(`Cliente: ${pedido.cliente.nombre}`, 20, 40);
    doc.text(`Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString('es-AR')}`, 20, 50);
    doc.text(`Fecha de entrega: ${pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR') : 'No especificada'}`, 20, 60);
    
    // Productos
    let yPos = 80;
    pedido.pedido_json.productos.forEach((producto, index) => {
      doc.setFontSize(14);
      doc.text(`Producto ${index + 1}: ${producto.nombre}`, 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.text(`Cantidad: ${producto.cantidad}`, 30, yPos);
      yPos += 10;
      
      // Detalles del producto
      Object.entries(producto.detalles).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 30, yPos);
        yPos += 10;
      });
      
      yPos += 10; // Espacio entre productos
    });
    
    doc.save(`pedido-${pedido.pedido_json.numeroPresupuesto}.pdf`);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      className="md:!max-w-3xl z-[30]"
    >
      <ModalContent>
        <ModalHeader className="text-lg md:text-xl">Detalles del Pedido</ModalHeader>
        <ModalBody>
          <div className="space-y-6 overflow-auto max-h-[75vh]">
            {/* Información General */}
            <div className="p-3 bg-gray-50 rounded-lg md:p-4">
              <h3 className="mb-3 text-base font-semibold md:text-lg">Información General</h3>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 md:text-base">
                <div><span className="font-medium">N° Pedido:</span> {pedido.pedido_json.numeroPresupuesto}</div>
                <div><span className="font-medium">Cliente:</span> {pedido.cliente.nombre}</div>
                <div><span className="font-medium">Fecha:</span> {new Date(pedido.fecha_pedido).toLocaleDateString('es-AR')}</div>
                <div>
                  <span className="font-medium">Fecha de entrega:</span> {
                    pedido.fecha_entrega 
                      ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR')
                      : 'No especificada'
                  }
                </div>
                <div><span className="font-medium">Estado:</span> {pedido.estado}</div>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h3 className="mb-3 text-base font-semibold md:text-lg">Productos</h3>
              <div className="space-y-4">
                {pedido.pedido_json.productos.map((producto, index) => (
                  <div key={index} className="p-3 rounded-lg border md:p-4">
                    <div className="text-base font-medium md:text-lg">{producto.nombre}</div>
                    <div className="mt-3 space-y-3">
                      <div className="text-sm md:text-base">
                        <span className="font-medium">Cantidad:</span> {producto.cantidad}
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="mb-2 text-sm font-medium md:text-base">Especificaciones:</div>
                        {Object.entries(producto.detalles).map(([key, value]) => (
                          <div key={key} className="text-sm md:text-base">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-2 md:flex-row">
          <Button 
            color="primary" 
            variant="light" 
            onPress={handlePrintPDF}
            className="w-full md:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Imprimir PDF
          </Button>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            className="w-full md:w-auto"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

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
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isProduccionModalOpen, setIsProduccionModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [selectedPedidoDetalle, setSelectedPedidoDetalle] = useState<Pedido | null>(null);

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

  const handleLlevarAProduccion = async (fechaEntrega: Date) => {
    if (!selectedPedido) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${selectedPedido.id}/produccion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fecha_entrega: fechaEntrega.toISOString(),
          estado: PedidoEstado.EN_PRODUCCION
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar el pedido');

      // Actualizar la lista de pedidos
      setPedidos(pedidos.map(pedido => 
        pedido.id === selectedPedido.id 
          ? { ...pedido, estado: PedidoEstado.EN_PRODUCCION, fecha_entrega: fechaEntrega.toISOString() }
          : pedido
      ));

      setIsProduccionModalOpen(false);
      setSelectedPedido(null);
    } catch (error) {
      console.error('Error:', error);
      // Aquí podrías mostrar una notificación de error
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-4 z-[20]">
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
          <TableColumn>FECHA ENTREGA</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>SISTEMA</TableColumn>
          <TableColumn>NOTIFICACIÓN</TableColumn>
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
              <TableCell>
                {pedido.fecha_entrega 
                  ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR')
                  : new Date(new Date(pedido.fecha_pedido).getTime() + (15 * 24 * 60 * 60 * 1000)).toLocaleDateString('es-AR')
                }
              </TableCell>
              <TableCell>{pedido.cliente.nombre}</TableCell>
              <TableCell>
                {pedido.pedido_json.productos[0]?.detalles.sistema || 'N/A'}
              </TableCell>
              <TableCell>
                {pedido.estado === PedidoEstado.CONFIRMADO && (
                  <div className="px-3 py-2 text-sm text-green-700 bg-green-100 rounded-md">
                    ¡Tenés un pedido pendiente de producción!
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  color={estadoColors[pedido.estado as PedidoEstado] as "danger" | "default" | "primary" | "secondary" | "success" | "warning" | undefined}
                  variant="flat"
                  size="sm"
                >
                  {pedido.estado}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {pedido.estado === PedidoEstado.CONFIRMADO && (
                    <Tooltip content="Llevar a producción">
                      <Button
                        isIconOnly
                        size="sm"
                        color="success"
                        variant="light"
                        onPress={() => {
                          setSelectedPedido(pedido);
                          setIsProduccionModalOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip content="Ver detalles">
                    <Button 
                      isIconOnly 
                      size="sm" 
                      variant="light" 
                      onPress={() => {
                        setSelectedPedidoDetalle(pedido);
                        setIsDetalleModalOpen(true);
                      }}
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

      {selectedPedido && (
        <ProduccionModal
          isOpen={isProduccionModalOpen}
          onClose={() => {
            setIsProduccionModalOpen(false);
            setSelectedPedido(null);
          }}
          pedido={selectedPedido}
          onConfirm={handleLlevarAProduccion}
        />
      )}

      {selectedPedidoDetalle && (
        <DetalleModal
          isOpen={isDetalleModalOpen}
          onClose={() => {
            setIsDetalleModalOpen(false);
            setSelectedPedidoDetalle(null);
          }}
          pedido={selectedPedidoDetalle}
        />
      )}
    </div>
  );
}
