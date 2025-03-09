// PresupuestosTable.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Pagination,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import BudgetPDFModal from './BudgetPDFModal';
import { FaFilePdf } from 'react-icons/fa';
import { Alert } from "@/components/shared/alert";

interface Presupuesto {
  id: number;
  numero_presupuesto: string;
  fecha: string;
  estado:  "Confirmado" | "En Proceso" | "Entregado" | "Requiere Facturación" | "Cancelado";
  total: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  items: Item[];
}

interface Item {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  detalles?: {
    sistema: string;
    detalle: string;
    colorSistema?: string;
    ladoComando?: string;
  };
}

interface PresupuestosTableProps {
  onDataLoaded?: () => void;
}

export default function PresupuestosTable({ onDataLoaded }: PresupuestosTableProps) {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [formattedPresupuesto, setFormattedPresupuesto] = useState<{
    numeroPresupuesto: string;
    fecha: string;
    cliente: {
      nombre: string;
      telefono?: string;
      email?: string;
    };
    productos: Array<{
      nombre: string;
      descripcion: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
    }>;
    subtotal: number;
    total: number;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [presupuestoToConfirm, setPresupuestoToConfirm] = useState<Presupuesto | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [presupuestosResponse, pedidosResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos?include=clientes,producto`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`)
        ]);

        if (!presupuestosResponse.ok || !pedidosResponse.ok) {
          throw new Error('Error al cargar los datos');
        }

        const presupuestosData = await presupuestosResponse.json();
        const pedidosData = await pedidosResponse.json();

        // Asegurarnos de acceder a la propiedad data si existe
        const pedidos = pedidosData.data || pedidosData;
        
        // Verificar que pedidos sea un array antes de usar map
        const presupuestosConfirmados = new Set(
          Array.isArray(pedidos) 
            ? pedidos.map((pedido: any) => pedido.presupuesto_id)
            : []
        );

        const presupuestosActualizados = (presupuestosData.data || presupuestosData).map(
          (presupuesto: Presupuesto) => ({
            ...presupuesto,
            estado: presupuestosConfirmados.has(presupuesto.id) ? "Confirmado" : presupuesto.estado
          })
        );

        setPresupuestos(presupuestosActualizados);
        onDataLoaded?.();
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onDataLoaded]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Confirmado":
        return { color: "success", textColor: "text-green-600" };
      case "En Proceso":
        return { color: "warning", textColor: "text-yellow-600" };
      case "Entregado":
        return { color: "success", textColor: "text-green-600" };
      case "Requiere Facturación":
        return { color: "secondary", textColor: "text-gray-600" };
      case "Cancelado":
        return { color: "danger", textColor: "text-red-600" };
      default:
        return { color: "default", textColor: "text-gray-600" };
    }
  };

  const handleViewPDF = (presupuesto: Presupuesto) => {
    console.log('handleViewPDF called', presupuesto);
    if (presupuesto) {
      const formattedData = {
        numeroPresupuesto: presupuesto.numero_presupuesto,
        fecha: new Date(presupuesto.fecha).toLocaleDateString(),
        cliente: {
          nombre: presupuesto.cliente_nombre || 'Sin nombre',
          telefono: presupuesto.cliente_telefono || 'Sin teléfono',
          email: presupuesto.cliente_email || undefined
        },
        productos: presupuesto.items?.map(item => ({
          nombre: item.nombre,
          descripcion: item.descripcion,
          precioUnitario: Number(item.precio_unitario),
          cantidad: item.cantidad,
          subtotal: Number(item.subtotal)
        })) || [],
        subtotal: Number(presupuesto.total),
        total: Number(presupuesto.total)
      };
      
      console.log('formattedData', formattedData);
      setFormattedPresupuesto(formattedData as unknown as {
        numeroPresupuesto: string;
        fecha: string;
        cliente: {
          nombre: string;
          telefono?: string;
          email?: string;
        };
        productos: Array<{
          nombre: string;
          descripcion: string;
          precioUnitario: number;
          cantidad: number;
          subtotal: number;
        }>;
        subtotal: number;
        total: number;
      });
      setIsPDFModalOpen(true);
    }
  };

  const handleOpenConfirmModal = (presupuesto: Presupuesto) => {
    setPresupuestoToConfirm(presupuesto);
    setShowConfirmModal(true);
  };

  const handleDuplicatePresupuesto = async (presupuesto: Presupuesto) => {
    try {
      setIsDuplicating(true);
      
      // Crear nuevo número de presupuesto
      const fechaActual = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const numeroAleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const nuevoNumeroPresupuesto = `P${fechaActual}${numeroAleatorio}`;

      // Crear el nuevo presupuesto duplicado
      const nuevoPrespuesto = {
        ...presupuesto,
        numero_presupuesto: nuevoNumeroPresupuesto,
        fecha: new Date().toISOString(),
        estado: "En Proceso"
      };
      // Crear nuevo presupuesto sin el ID
      const { id, ...nuevoPrespuestoSinId } = nuevoPrespuesto;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoPrespuesto),
      });

      if (!response.ok) {
        throw new Error('Error al duplicar el presupuesto');
      }

      // Actualizar la lista de presupuestos
      const [presupuestosResponse, pedidosResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos?include=clientes,producto`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`)
      ]);

      if (!presupuestosResponse.ok || !pedidosResponse.ok) {
        throw new Error('Error al actualizar los datos');
      }

      const presupuestosData = await presupuestosResponse.json();
      const pedidosData = await pedidosResponse.json();

      const pedidos = pedidosData.data || pedidosData;
      const presupuestosConfirmados = new Set(
        Array.isArray(pedidos) 
          ? pedidos.map((pedido: any) => pedido.presupuesto_id)
          : []
      );

      const presupuestosActualizados = (presupuestosData.data || presupuestosData).map(
        (presupuesto: Presupuesto) => ({
          ...presupuesto,
          estado: presupuestosConfirmados.has(presupuesto.id) ? "Confirmado" : presupuesto.estado
        })
      );

      setPresupuestos(presupuestosActualizados);
      setNotification({
        message: "Presupuesto duplicado exitosamente",
        variant: "success"
      });

    } catch (error) {
      console.error('Error:', error);
      setNotification({
        message: "Error al duplicar el presupuesto",
        variant: "error"
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const columns = [
    { name: "N° PRESUPUESTO", uid: "numero_presupuesto" },
    { name: "FECHA", uid: "fecha" },
    { name: "CLIENTE", uid: "cliente" },
    { name: "PRODUCTOS", uid: "productos" },
    { name: "TOTAL", uid: "total" },
    { name: "ESTADO", uid: "estado" },
    { name: "ACCIONES", uid: "acciones" },
  ];

  const renderCell = (presupuesto: Presupuesto, columnKey: React.Key) => {
    switch (columnKey) {
      case "numero_presupuesto":
        return (
          <div className="font-medium">
            {presupuesto.numero_presupuesto}
          </div>
        );
      case "fecha":
        return (
          <div>
            {new Date(presupuesto.fecha).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      case "cliente":
        return (
          <div>
            <div className="font-medium">
              {presupuesto.cliente_nombre || 'Cliente no especificado'}
            </div>
            <div className="text-sm text-gray-500">
              {presupuesto.cliente_telefono || 'Sin teléfono'}
            </div>
          </div>
        );
      case "productos":
        return (
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button size="sm" variant="flat">
                Ver {presupuesto.items?.length || 0} productos
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="overflow-auto p-4 w-80 max-h-72">
                {presupuesto.items?.map((item, idx) => (
                  <div key={idx} className="pb-3 mb-3 border-b last:border-b-0">
                    <div className="font-medium">{item.nombre}</div>
                    <div className="text-sm text-gray-600">
                      <div>Cantidad: {item.cantidad}</div>
                      {item.detalles && (
                        <div className="text-xs">
                          Sistema: {item.detalles.sistema || '-'} - 
                          Detalle: {item.detalles.detalle || '-'}
                          {item.detalles.colorSistema && ` - Color: ${item.detalles.colorSistema}`}
                          {item.detalles.ladoComando && ` - Comando: ${item.detalles.ladoComando}`}
                        </div>
                      )}
                      <div className="mt-1 font-medium">
                        ${item.subtotal.toLocaleString('es-AR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      case "total":
        return (
          <div className="font-medium">
            ${presupuesto.total.toLocaleString('es-AR')}
          </div>
        );
      case "estado":
        return (
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              color={presupuesto.estado === "Confirmado" ? "success" : "primary"}
              variant="flat"
              onClick={() => handleOpenConfirmModal(presupuesto)}
              isDisabled={presupuesto.estado === "Confirmado" || isUpdating}
            >
              {presupuesto.estado === "Confirmado" ? "Pedido Confirmado" : "Convertir a Pedido"}
            </Button>

            <Modal 
              isOpen={showConfirmModal} 
              onClose={() => {
                setShowConfirmModal(false);
                setPresupuestoToConfirm(null);
              }}
              backdrop="opaque"
              classNames={{
                backdrop: "bg-black/20 backdrop-blur-sm"
              }}
            >
              <ModalContent>
                {presupuestoToConfirm && (
                  <>
                    <ModalHeader>
                      <h3 className="text-xl font-bold">Confirmar Pedido</h3>
                    </ModalHeader>
                    <ModalBody>
                      <div className="space-y-4">
                        <p className="text-default-600">¿Estás seguro de proceder?</p>
                        <div className="p-4 space-y-2 rounded-lg bg-default-50">
                          <h4 className="font-medium">Datos del pedido:</h4>
                          <p>N° Presupuesto: {presupuestoToConfirm.numero_presupuesto}</p>
                          <p>Cliente: {presupuestoToConfirm.cliente_nombre}</p>
                          <p>Teléfono: {presupuestoToConfirm.cliente_telefono}</p>
                          <p>Total: ${presupuestoToConfirm.total.toLocaleString('es-AR')}</p>
                          <div className="mt-2">
                            <p className="font-medium">Productos:</p>
                            <ul className="list-disc list-inside">
                              {presupuestoToConfirm.items.map((item, index) => (
                                <li key={index} className="text-sm">
                                  {item.cantidad}x {item.nombre} - ${item.subtotal.toLocaleString('es-AR')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => {
                          setShowConfirmModal(false);
                          setPresupuestoToConfirm(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        color="success"
                        onPress={() => {
                          if (presupuestoToConfirm) {
                            handleConvertirAPedido(presupuestoToConfirm.id);
                            setShowConfirmModal(false);
                            setPresupuestoToConfirm(null);
                          }
                        }}
                        isLoading={isUpdating}
                      >
                        Confirmar Pedido
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        );
      case "acciones":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewPDF(presupuesto)}
            >
              <FaFilePdf />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleEstadoChange = async (
    presupuestoId: number, 
    nuevoEstado:  "Confirmado" | "En Proceso" | "Entregado" | "Requiere Facturación" | "Cancelado"
  ) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/${presupuestoId}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) throw new Error('Error al actualizar el estado');
      setPresupuestos(prevPresupuestos =>
        prevPresupuestos.map(p =>
          p.id === presupuestoId ? { ...p, estado: nuevoEstado } : p
        )
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvertirAPedido = async (presupuestoId: number) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/${presupuestoId}/convertir-a-pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: "Confirmado"
        })
      });

      if (!response.ok) {
        throw new Error('Error al convertir el presupuesto a pedido');
      }

      // Actualizar el estado local del presupuesto
      setPresupuestos(prevPresupuestos =>
        prevPresupuestos.map(p =>
          p.id === presupuestoId ? { ...p, estado: "Confirmado" } : p
        )
      );

      setNotification({
        message: "¡Pedido confirmado exitosamente!",
        variant: "success"
      });

    } catch (error) {
      console.error('Error:', error);
      setNotification({
        message: "Hubo un error al confirmar el pedido",
        variant: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const pages = Math.ceil(presupuestos.length / rowsPerPage);
  const items = presupuestos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <div className="flex justify-center p-4">Cargando presupuestos...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {notification && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-fade-in">
          <Alert 
            message={notification.message} 
            variant={notification.variant}
            className="border border-green-700 shadow-lg"
          />
        </div>
      )}
      <div className="p-4 presupuestos-table">
        <Table 
          className="presupuestos-table"
          aria-label="Tabla de presupuestos"
          bottomContent={
            pages > 1 ? (
              <div className="flex justify-center w-full">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            ) : null
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.uid}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody>
            {items.map((presupuesto) => (
              <TableRow key={presupuesto.id}>
                {columns.map((column) => (
                  <TableCell key={column.uid}>
                    {renderCell(presupuesto, column.uid)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {formattedPresupuesto && (
          <BudgetPDFModal
            isOpen={isPDFModalOpen}
            onClose={() => setIsPDFModalOpen(false)}
            presupuestoData={formattedPresupuesto}
          />
        )}
      </div>
    </div>
  );
}
