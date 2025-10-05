// PresupuestosTable.tsx - Updated price formatting
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import BudgetPDFModal from './BudgetPDFModal';
import { FaFilePdf } from 'react-icons/fa';
import { Alert } from "@/components/shared/alert";

interface Presupuesto {
  id: number;
  numero_presupuesto: string;
  fecha: string;
  estado:  "Confirmado" | "En Proceso" | "Entregado" | "Requiere Facturación" | "Cancelado";
  subtotal: number; // Agregar subtotal
  descuento: number; // Cambiar de optional a required
  total: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  items: Item[];
  espacio?: string; // Campo espacio del presupuesto
  presupuesto_json?: string | any; // Campo JSON del presupuesto
  esEstimativo?: boolean; // Campo para identificar presupuestos estimativos
  opciones?: Array<{id: string, nombre: string, activa: boolean}>; // Opciones del presupuesto estimativo
  shouldRound?: boolean; // Campo para redondeo a miles
  applyDiscount?: boolean; // Campo para indicar si se aplicó descuento
  showMeasuresInPDF?: boolean; // Campo para mostrar medidas en PDF
}

interface Item {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  espacio?: string; // Nuevo campo para el espacio/ambiente
  opcion?: string; // Campo para opciones de presupuesto estimativo (A, B, C, etc.)
  detalles?: {
    sistema: string;
    detalle: string;
    colorSistema?: string;
    ladoComando?: string;
    tipoTela?: string;
    ancho?: number;
    alto?: number;
    caidaPorDelante?: string;
    soporteIntermedio?: boolean;
    soporteDoble?: boolean;
    accesorios?: any[];
    accesoriosAdicionales?: any[];
    incluirColocacion?: boolean;
    precioColocacion?: number;
    [key: string]: any; // Para campos adicionales
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
      espacio?: string; // Nuevo campo para el espacio/ambiente
      opcion?: string; // Campo para opciones de presupuesto estimativo
    }>;
    subtotal: number;
    descuento: number;
    total: number;
    esEstimativo?: boolean; // Campo para identificar presupuestos estimativos
    opciones?: Array<{id: string, nombre: string, activa: boolean}>; // Opciones del presupuesto estimativo
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [presupuestoToConfirm, setPresupuestoToConfirm] = useState<Presupuesto | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [presupuestoToDelete, setPresupuestoToDelete] = useState<Presupuesto | null>(null);
  const [deletingPresupuestoId, setDeletingPresupuestoId] = useState<number | null>(null);
  const [convertingPresupuestoId, setConvertingPresupuestoId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Limpiar errores previos
        
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
        const presupuestos = presupuestosData.data || presupuestosData;
        const pedidos = pedidosData.data || pedidosData;
        
        // Verificar que los datos sean arrays
        if (!Array.isArray(presupuestos)) {
          console.warn('Los presupuestos no son un array:', presupuestos);
          setPresupuestos([]);
          onDataLoaded?.();
          return;
        }
        
        // Verificar que pedidos sea un array antes de usar map
        const presupuestosConfirmados = new Set(
          Array.isArray(pedidos) 
            ? pedidos.map((pedido: any) => pedido.presupuesto_id)
            : []
        );

                          const presupuestosActualizados = presupuestos.map(
           (presupuesto: Presupuesto) => {
             
             
             // Extraer información del presupuesto_json para cada item
             let itemsConEspacio = presupuesto.items;
             let esEstimativo = false;
             let opciones = [];
             let shouldRound = false;
             let applyDiscount = false;
             let showMeasuresInPDF = false;
             let subtotalCalculado = presupuesto.subtotal;
             let descuentoCalculado = presupuesto.descuento;
             let totalCalculado = presupuesto.total;
             
             if (presupuesto.presupuesto_json) {
               try {
                 const presupuestoJson = typeof presupuesto.presupuesto_json === 'string' 
                   ? JSON.parse(presupuesto.presupuesto_json) 
                   : presupuesto.presupuesto_json;
                 
                 // Verificar si es presupuesto estimativo
                 esEstimativo = presupuestoJson.esEstimativo || false;
                 opciones = presupuestoJson.opciones || [];
                 shouldRound = presupuestoJson.shouldRound || false;
                 applyDiscount = presupuestoJson.applyDiscount || false;
                 showMeasuresInPDF = presupuestoJson.showMeasuresInPDF || false;
                 
                 // Usar los valores ya calculados del JSON (con redondeo aplicado)
                 subtotalCalculado = presupuestoJson.subtotal || presupuesto.subtotal;
                 descuentoCalculado = presupuestoJson.descuento || presupuesto.descuento;
                 totalCalculado = presupuestoJson.total || presupuesto.total;
                 
                 console.log('🔍 [DEBUG] Valores extraídos del JSON:', {
                   esEstimativo,
                   shouldRound,
                   applyDiscount,
                   subtotalDB: presupuesto.subtotal,
                   subtotalJSON: presupuestoJson.subtotal,
                   descuentoDB: presupuesto.descuento,
                   descuentoJSON: presupuestoJson.descuento,
                   totalDB: presupuesto.total,
                   totalJSON: presupuestoJson.total
                 });
                 
                 if (presupuestoJson.productos && Array.isArray(presupuestoJson.productos)) {
                   itemsConEspacio = presupuesto.items.map((item, index) => {
                     const productoJson = presupuestoJson.productos[index];
                     const espacio = productoJson?.espacio || 'Espacio/Ambiente sin especificar';
                     const opcion = productoJson?.opcion || '';
                     
                     // Extraer medidas del producto del JSON
                     const ancho = productoJson?.ancho;
                     const alto = productoJson?.alto;
                     
                     return {
                       ...item,
                       espacio: espacio,
                       opcion: opcion,
                       // Actualizar detalles con las medidas del JSON
                       detalles: {
                         ...item.detalles,
                         ancho: ancho,
                         alto: alto
                       } as any
                     };
                   });
                 }
               } catch (error) {
                 console.error('Error al parsear presupuesto_json:', error);
                 // Si hay error, asignar valores por defecto
                 itemsConEspacio = presupuesto.items.map((item) => ({
                   ...item,
                   espacio: 'Sin especificar',
                   opcion: ''
                 }));
               }
             } else {
               // Si no hay presupuesto_json, asignar valores por defecto
               itemsConEspacio = presupuesto.items.map((item) => ({
                 ...item,
                 espacio: 'Espacio/Ambiente sin especificar',
                 opcion: ''
               }));
             }
            
            return {
              ...presupuesto,
              items: itemsConEspacio,
              estado: presupuestosConfirmados.has(presupuesto.id) ? "Confirmado" : presupuesto.estado,
              esEstimativo: esEstimativo,
              opciones: opciones,
              shouldRound: shouldRound,
              applyDiscount: applyDiscount,
              showMeasuresInPDF: showMeasuresInPDF,
              // Usar los valores ya calculados del JSON (con redondeo aplicado)
              subtotal: subtotalCalculado,
              descuento: descuentoCalculado,
              total: totalCalculado
            };
          }
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

  // Función para formatear el número de presupuesto
  const formatearNumeroPresupuesto = (numero: string) => {
    // Si el número ya tiene el formato de fecha (YYYYMMDD-HHMMSS)
    if (/^\d{8}-\d{6}$/.test(numero)) {
      const fecha = numero.substring(0, 8);
      const hora = numero.substring(9, 15);
      
      const year = fecha.substring(0, 4);
      const month = fecha.substring(4, 6);
      const day = fecha.substring(6, 8);
      const hours = hora.substring(0, 2);
      const minutes = hora.substring(2, 4);
      const seconds = hora.substring(4, 6);
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    
    // Si es el formato anterior (PRES-YYYY-XXX), mantenerlo
    return numero;
  };

  // Función para formatear la información detallada del producto
  const formatearDetallesProducto = (item: Item) => {
    
    const detalles = [];
    
    // Información básica del producto
    let nombreProducto = `${item.cantidad}x ${item.nombre}`;
    if (item.opcion) {
      nombreProducto += ` (Opción ${item.opcion})`;
    }
    detalles.push(nombreProducto);
    
    // Lógica específica para Dunes
    if (item.detalles?.sistema?.toLowerCase().includes('dunes')) {
      // Mostrar información específica de Dunes
      if (item.detalles.productoDunes) {
        detalles.push(`• Sistema: ${item.detalles.productoDunes.nombreProducto}`);
        
        // Determinar si es cadena y cordón o bastón basado en el nombre del producto
        if (item.detalles.productoDunes.nombreProducto.toLowerCase().includes('cadena')) {
          detalles.push(`• Tipo de Apertura: Apertura con Cadena y Cordón`);
        } else if (item.detalles.productoDunes.nombreProducto.toLowerCase().includes('baston')) {
          detalles.push(`• Tipo de Apertura: Apertura con Bastón`);
        }
      }
      
      // Mostrar información de la tela
      if (item.detalles.telaDunes) {
        detalles.push(`• Tela: ${item.detalles.telaDunes.nombreProducto}`);
      }
      
      
      
             // Mostrar información de medidas si está disponible
       if (item.detalles.ancho && item.detalles.alto) {
         detalles.push(`• Medidas: Alto: ${item.detalles.alto}cm | Ancho: ${item.detalles.ancho}cm`);
       }
       
               // Mostrar detalles específicos de Dunes
        if (item.detalles.colorSistema) {
          detalles.push(`• Color Sistema: ${item.detalles.colorSistema}`);
        }
        if (item.detalles.ladoComando) {
          detalles.push(`• Lado Comando: ${item.detalles.ladoComando}`);
        }
        if (item.detalles.ladoApertura) {
          detalles.push(`• Lado Apertura: ${item.detalles.ladoApertura}`);
        }
        if (item.detalles.instalacion) {
          detalles.push(`• Instalación: ${item.detalles.instalacion}`);
        }
        if (item.detalles.detalle && item.detalles.detalle.trim() !== '') {
          detalles.push(`• Detalles: ${item.detalles.detalle}`);
        }
        
       
       
       // Mostrar información de colocación si está disponible
       if (item.detalles.incluirColocacion) {
         detalles.push(`• Colocación: Incluida`);
       }
    } else {
      // Para otros sistemas, usar la lógica original
      // Agregar descripción si existe
      if (item.descripcion && item.descripcion.trim() !== '') {
        detalles.push(`• Descripción: ${item.descripcion}`);
      }
      
      // Agregar detalles del sistema si existen
      if (item.detalles) {
        if (item.detalles.sistema) {
          detalles.push(`• Sistema: ${item.detalles.sistema}`);
        }
        if (item.detalles.detalle) {
          detalles.push(`• Detalle: ${item.detalles.detalle}`);
        }
        if (item.detalles.colorSistema) {
          detalles.push(`• Color: ${item.detalles.colorSistema}`);
        }
        if (item.detalles.ladoComando) {
          detalles.push(`• Comando: ${item.detalles.ladoComando}`);
        }
      
      // Buscar accesorios de manera más robusta
      let accesoriosEncontrados = false;
      
      // 1. Buscar en campos específicos de accesorios
      const accesorios = (item.detalles as any).accesorios;
      if (accesorios && Array.isArray(accesorios) && accesorios.length > 0) {
        detalles.push(`• Accesorios: ${accesorios.join(', ')}`);
        accesoriosEncontrados = true;
      } else if (accesorios && typeof accesorios === 'string' && accesorios.trim() !== '') {
        detalles.push(`• Accesorios: ${accesorios}`);
        accesoriosEncontrados = true;
      }
      
      // 2. Buscar en accesorios adicionales
      const accesoriosAdicionales = (item.detalles as any).accesoriosAdicionales;
      if (!accesoriosEncontrados && accesoriosAdicionales && Array.isArray(accesoriosAdicionales) && accesoriosAdicionales.length > 0) {
        detalles.push(`• Accesorios: ${accesoriosAdicionales.join(', ')}`);
        accesoriosEncontrados = true;
      } else if (!accesoriosEncontrados && accesoriosAdicionales && typeof accesoriosAdicionales === 'string' && accesoriosAdicionales.trim() !== '') {
        detalles.push(`• Accesorios: ${accesoriosAdicionales}`);
        accesoriosEncontrados = true;
      }
      
      // 3. Buscar en cualquier campo que contenga "accesorio" en el nombre
      if (!accesoriosEncontrados) {
        const detallesKeys = Object.keys(item.detalles);
        const accesoriosKeys = detallesKeys.filter(key => 
          key.toLowerCase().includes('accesorio') || 
          key.toLowerCase().includes('accesorios')
        );
        
        accesoriosKeys.forEach(key => {
          const valor = (item.detalles as any)[key];
          if (valor && valor !== 'false' && valor !== false && valor !== '[]' && valor !== '') {
            if (Array.isArray(valor)) {
              detalles.push(`• Accesorios: ${valor.join(', ')}`);
            } else {
              detalles.push(`• Accesorios: ${valor}`);
            }
            accesoriosEncontrados = true;
          }
        });
      }
      
      // 4. Buscar información de colocación
      const colocacionKeys = Object.keys(item.detalles).filter(key => 
        key.toLowerCase().includes('colocacion') || 
        key.toLowerCase().includes('instalacion')
      );
      
      colocacionKeys.forEach(key => {
        const valor = (item.detalles as any)[key];
        if (valor && valor !== 'false' && valor !== false) {
          if (typeof valor === 'boolean' && valor === true) {
            detalles.push(`• Colocación: Incluida`);
          } else {
            detalles.push(`• Colocación: ${valor}`);
          }
        }
      });
      
      // 5. Mostrar información de medidas si está disponible
      if (item.detalles.ancho && item.detalles.alto) {
        detalles.push(`• Medidas: Alto: ${item.detalles.alto}cm | Ancho: ${item.detalles.ancho}cm`);
      }
    }
  }
  
     // Agregar precio solo para sistemas que no sean Dunes
   if (!item.detalles?.sistema?.toLowerCase().includes('dunes')) {
     detalles.push(`• Precio: $${Number(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`);
   }
   
   return detalles;
  };

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
    if (presupuesto) {
      console.log('🔍 [DEBUG] Presupuesto para PDF:', {
        id: presupuesto.id,
        esEstimativo: presupuesto.esEstimativo,
        shouldRound: presupuesto.shouldRound,
        applyDiscount: presupuesto.applyDiscount,
        showMeasuresInPDF: presupuesto.showMeasuresInPDF,
        descuento: presupuesto.descuento,
        total: presupuesto.total,
        items: presupuesto.items?.map(item => ({
          nombre: item.nombre,
          ancho: item.detalles?.ancho,
          alto: item.detalles?.alto
        }))
      });
      
      const formattedData = {
        numeroPresupuesto: presupuesto.numero_presupuesto,
        fecha: new Date(presupuesto.fecha).toLocaleDateString(),
        cliente: {
          nombre: presupuesto.cliente_nombre || 'Sin nombre',
          telefono: presupuesto.cliente_telefono || 'Sin teléfono',
          email: presupuesto.cliente_email || undefined
        },
        productos: presupuesto.items?.map(item => {
          return {
            nombre: item.nombre,
            descripcion: item.descripcion,
            precioUnitario: Number(item.precio_unitario),
            cantidad: item.cantidad,
            subtotal: Number(item.subtotal),
            espacio: item.espacio || 'Sin especificar',
            opcion: item.opcion || undefined,
            // Incluir medidas del producto
            ancho: item.detalles?.ancho,
            alto: item.detalles?.alto
          };
        }) || [],
        subtotal: Number(presupuesto.subtotal), // Ya viene del JSON con redondeo aplicado
        descuento: Number(presupuesto.descuento), // Ya viene del JSON con redondeo aplicado
        total: Number(presupuesto.total), // Ya viene del JSON con redondeo aplicado
        esEstimativo: presupuesto.esEstimativo || false,
        opciones: presupuesto.opciones || [],
        showMeasuresInPDF: presupuesto.showMeasuresInPDF || false, // Usar valor real del presupuesto
        applyDiscount: presupuesto.applyDiscount || Number(presupuesto.descuento) > 0, // Usar valor real o indicar si se aplicó descuento
        shouldRound: presupuesto.shouldRound || false // Usar valor real del presupuesto
      };
      
      console.log('🔍 [DEBUG] Datos formateados para PDF:', {
        showMeasuresInPDF: formattedData.showMeasuresInPDF,
        productos: formattedData.productos.map(p => ({
          nombre: p.nombre,
          ancho: p.ancho,
          alto: p.alto
        }))
      });
      
      setFormattedPresupuesto(formattedData);
      setIsPDFModalOpen(true);
    }
  };

  const handleOpenConfirmModal = (presupuesto: Presupuesto) => {
    setPresupuestoToConfirm(presupuesto);
    setShowConfirmModal(true);
  };

  const handleOpenDeleteModal = (presupuesto: Presupuesto) => {
    // Verificar si el presupuesto ya fue convertido a pedido
    if (presupuesto.estado === "Confirmado") {
      setNotification({
        message: "No se puede eliminar un presupuesto que ya fue convertido a pedido",
        variant: "error"
      });
      return;
    }
    
    setPresupuestoToDelete(presupuesto);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPresupuestoToDelete(null);
  };

  const handleDeletePresupuesto = async () => {
    if (!presupuestoToDelete) return;

    setDeletingPresupuestoId(presupuestoToDelete.id);

    try {
      // Simular delay de 1.5 segundos
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/${presupuestoToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el presupuesto');
      }

      // Actualizar la lista de presupuestos removiendo el eliminado
      setPresupuestos(prevPresupuestos => 
        prevPresupuestos.filter(p => p.id !== presupuestoToDelete.id)
      );

      setNotification({
        message: "Presupuesto eliminado exitosamente",
        variant: "success"
      });

      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error al eliminar el presupuesto:', error);
      setNotification({
        message: "Error al eliminar el presupuesto",
        variant: "error"
      });
    } finally {
      setDeletingPresupuestoId(null);
    }
  };

  const handleDuplicatePresupuesto = async (presupuesto: Presupuesto) => {
    try {
      setIsDuplicating(true);
      
      // Crear nuevo número de presupuesto basado en fecha actual
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      const nuevoNumeroPresupuesto = `${year}${month}${day}-${hours}${minutes}${seconds}`;

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
            <div className="flex items-center gap-2">
              {formatearNumeroPresupuesto(presupuesto.numero_presupuesto)}
              {presupuesto.esEstimativo && (
                <Chip 
                  size="sm" 
                  color="primary" 
                  variant="flat"
                  className="text-xs"
                >
                  Estimativo
                </Chip>
              )}
            </div>
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
                      {item.espacio && (
                        <div className="text-xs text-blue-600">
                          Espacio: {item.espacio}
                        </div>
                      )}
                      {item.detalles && (
                        <div className="text-xs">
                          Sistema: {item.detalles.sistema || '-'} - 
                          Detalle: {item.detalles.detalle || '-'}
                          {item.detalles.colorSistema && ` - Color: ${item.detalles.colorSistema}`}
                          {item.detalles.ladoComando && ` - Comando: ${item.detalles.ladoComando}`}
                        </div>
                      )}
                      <div className="mt-1 font-medium text-right">
                        ${Number(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );
      case "total":
        const totalNumber = Number(presupuesto.total);
        const formattedTotal = totalNumber.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        return (
          <div className="font-medium text-right">
            <div>${formattedTotal}</div>
            {presupuesto.descuento > 0 && (
              <div className="text-xs text-green-600">
                Descuento: -${Number(presupuesto.descuento).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            )}
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
              isLoading={convertingPresupuestoId === presupuesto.id}
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
                          <p>N° Presupuesto: {formatearNumeroPresupuesto(presupuestoToConfirm.numero_presupuesto)}</p>
                          <p>Cliente: {presupuestoToConfirm.cliente_nombre}</p>
                          <p>Teléfono: {presupuestoToConfirm.cliente_telefono}</p>
                          {presupuestoToConfirm.cliente_email && (
                            <p>Email: {presupuestoToConfirm.cliente_email}</p>
                          )}
                          <div className="space-y-1">
                            <p>Subtotal: ${Number(presupuestoToConfirm.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            {presupuestoToConfirm.descuento > 0 && (
                              <p className="text-green-600">Descuento: -${Number(presupuestoToConfirm.descuento).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            )}
                            <p className="font-bold text-lg">Total: ${Number(presupuestoToConfirm.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="mt-4">
                            <p className="font-medium mb-3">Productos:</p>
                            <div className="space-y-3">
                              {presupuestoToConfirm.items.map((item, index) => (
                                <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="space-y-1">
                                    {formatearDetallesProducto(item).map((detalle, detalleIndex) => (
                                      <div key={detalleIndex} className="text-sm">
                                        {detalleIndex === 0 ? (
                                          <span className="font-semibold text-blue-600">{detalle}</span>
                                        ) : (
                                          <span className="text-gray-600">{detalle}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
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
                        isLoading={convertingPresupuestoId === presupuestoToConfirm?.id}
                        isDisabled={convertingPresupuestoId === presupuestoToConfirm?.id}
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
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="size-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" 
                />
              </svg>
            </Button>
            
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={deletingPresupuestoId === presupuesto.id}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="size-6"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" 
                    />
                  </svg>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Acciones del presupuesto">
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onPress={() => handleOpenDeleteModal(presupuesto)}
                  isDisabled={presupuesto.estado === "Confirmado"}
                >
                  <div className="flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="size-4"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" 
                      />
                    </svg>
                    Eliminar presupuesto
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
      setConvertingPresupuestoId(presupuestoId);
      setIsUpdating(true);

      // Simular delay de 1.5 segundos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Obtener el presupuesto completo para preservar todos los datos
      const presupuestoCompleto = presupuestos.find(p => p.id === presupuestoId);
      
      if (!presupuestoCompleto) {
        throw new Error('Presupuesto no encontrado');
      }
      
      // Preparar los datos completos del pedido
      const pedidoData = {
        estado: "Confirmado",
        presupuesto_id: presupuestoId,
        numeroPresupuesto: presupuestoCompleto.numero_presupuesto,
        cliente: {
          nombre: presupuestoCompleto.cliente_nombre,
          telefono: presupuestoCompleto.cliente_telefono,
          email: presupuestoCompleto.cliente_email
        },
        productos: presupuestoCompleto.items?.map(item => ({
          nombre: item.nombre,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario,
          subtotal: item.subtotal,
          espacio: item.espacio, // Incluir el campo espacio en el pedido
          detalles: item.detalles || {}
        })) || [],
        total: presupuestoCompleto.total,
        fecha_pedido: new Date().toISOString()
      };
        
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/${presupuestoId}/convertir-a-pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
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
      setConvertingPresupuestoId(null);
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

  // Si no hay presupuestos, mostrar tabla vacía con mensaje informativo
  if (!loading && presupuestos.length === 0) { 
    return (
      <div>
        <Alert 
          message="No hay presupuestos emitidos en producción" 
          variant="info"
          className="mb-4"
        />
        <div className="p-4 presupuestos-table">
          <Table 
            className="presupuestos-table"
            aria-label="Tabla de presupuestos"
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.uid}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-gray-500 py-8">
                  No hay presupuestos para mostrar
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
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

        {/* Modal de confirmación para eliminar presupuesto */}
        <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} backdrop="opaque">
          <ModalContent>
            <ModalHeader>Confirmar eliminación</ModalHeader>
            <ModalBody>
              <p>
                ¿Seguro que deseas eliminar este presupuesto? 
                <span className="text-red-500 font-semibold"> Esta acción es irreversible</span>.
              </p>
              {presupuestoToDelete && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Presupuesto: {formatearNumeroPresupuesto(presupuestoToDelete.numero_presupuesto)}</p>
                  <p className="text-gray-700 dark:text-gray-300">Cliente: {presupuestoToDelete.cliente_nombre}</p>
                  <div className="text-gray-700 dark:text-gray-300">
                    <p>Subtotal: ${Number(presupuestoToDelete.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    {presupuestoToDelete.descuento > 0 && (
                      <p className="text-green-600">Descuento: -${Number(presupuestoToDelete.descuento).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    )}
                    <p className="font-bold">Total: ${Number(presupuestoToDelete.total).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="default" onClick={handleCloseDeleteModal}>
                Cancelar
              </Button>
              <Button 
                color="danger" 
                onClick={handleDeletePresupuesto}
                isLoading={deletingPresupuestoId === presupuestoToDelete?.id}
                isDisabled={deletingPresupuestoId === presupuestoToDelete?.id}
              >
                Eliminar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
