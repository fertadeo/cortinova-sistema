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
} from "@nextui-org/react";
import BudgetPDFModal from './BudgetPDFModal';
import { FaFilePdf } from 'react-icons/fa';

interface Presupuesto {
  id: number;
  numero_presupuesto: string;
  fecha: string;
  estado: "Emitido" | "Confirmado" | "En Proceso" | "Entregado" | "Requiere Facturación" | "Cancelado";
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

const PresupuestosTable = () => {
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

  useEffect(() => {
    const fetchPresupuestos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos?include=clientes,producto`);
        if (!response.ok) throw new Error('Error al cargar los presupuestos');
        const data = await response.json();
        
        // Verificar la estructura de la respuesta
        if (data.success && Array.isArray(data.data)) {
          setPresupuestos(data.data);
        } else if (Array.isArray(data)) {
          setPresupuestos(data);
        } else {
          throw new Error('Formato de datos inválido');
        }
        
      } catch (err) {
        setError("Error al cargar los presupuestos");
        console.error('Error detallado:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestos();
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Emitido":
        return { color: "primary", textColor: "text-blue-600" };
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

  const columns = [
    { name: "N° PRESUPUESTO", uid: "numero_presupuesto" },
    { name: "FECHA", uid: "fecha" },
    { name: "CLIENTE", uid: "cliente" },
    { name: "PRODUCTOS", uid: "productos" },
    { name: "TOTAL", uid: "total" },
    { name: "ESTADO", uid: "estado" },
    { name: "PDF", uid: "pdf" },
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
        const estadoStyle = getEstadoColor(presupuesto.estado);
        return (
          <Chip
            size="md"
            color={estadoStyle.color as "default" | "primary" | "warning" | "success" | "danger" | "secondary"}
            variant="dot"
            classNames={{
              base: `capitalize ${estadoStyle.textColor}`,
              content: estadoStyle.textColor
            }}
          >
            {presupuesto.estado} Emitido
          </Chip>
        );
      case "pdf":
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewPDF(presupuesto)}
          >
            <FaFilePdf />
          </Button>
        );
      default:
        return null;
    }
  };

  const handleEstadoChange = async (
    presupuestoId: number, 
    nuevoEstado: "Emitido" | "Confirmado" | "En Proceso" | "Entregado" | "Requiere Facturación" | "Cancelado"
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
    <div className="p-4">
      <Table 
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
  );
};

export default PresupuestosTable;
