"use client"
import "@/styles/globals.css"
import { useEffect, useState } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { PedidoEstado, estadoColors } from "@/types/pedido";
import { jsPDF } from "jspdf";

interface Pedido {
  id: number;
  fecha_pedido: string;
  fecha_entrega: string | null;
  estado: PedidoEstado;
  presupuesto_id: number;
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
    telefono: string;
  };
}

interface ProduccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido;
  onConfirm: (fechaEntrega: Date) => void;
}

const ProduccionModal = ({ isOpen, onClose, pedido, onConfirm }: ProduccionModalProps) => {
  // Calcular la fecha por defecto (30 días después de la fecha del pedido)
  const fechaPorDefecto = new Date(pedido.fecha_pedido);
  fechaPorDefecto.setDate(fechaPorDefecto.getDate() + 30);
  
  const [fechaEntrega, setFechaEntrega] = useState<string>(
    fechaPorDefecto.toISOString().split('T')[0]
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      className="md:!max-w-2xl z-[30] max-h-screen"
    >
      <ModalContent className="max-h-screen">
        <ModalHeader className="text-lg md:text-xl">Llevar pedido a producción</ModalHeader>
        <ModalBody className="overflow-y-auto max-h-[calc(100vh-120px)]">
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
            <div className="overflow-y-auto max-h-[30vh] md:max-h-[40vh]">
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
                      {Object.entries(formatearDetallesSegunSistema(producto.detalles)).map(([key, value]) => (
                        <div key={key} className="flex flex-wrap">
                          <span className="font-medium">{key}:</span>
                          <span className="ml-2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fecha de Entrega */}
            <div className="mt-4">
              <label 
                htmlFor="fechaEntrega" 
                className="block mb-2 text-sm font-medium text-gray-700 md:text-base"
              >
                Fecha de Entrega Estimada
              </label>
              <Input
                id="fechaEntrega"
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
  onMarcarComoListo: (pedido: Pedido) => void;
  onMarcarComoEntregado: (pedido: Pedido) => void;
}

const DetalleModal = ({ isOpen, onClose, pedido, onMarcarComoListo, onMarcarComoEntregado }: DetalleModalProps) => {
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
      className="md:!max-w-3xl z-[30] max-h-screen"
    >
              <ModalContent className="max-h-screen">
          <ModalHeader className="text-lg md:text-xl">Detalles del Pedido</ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(100vh-120px)]">
            <div className="space-y-6">
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
                        {Object.entries(formatearDetallesSegunSistema(producto.detalles)).map(([key, value]) => (
                          <div key={key} className="text-sm md:text-base">
                            <span className="font-medium">{key}:</span> {
                              typeof value === 'object' ? JSON.stringify(value) : String(value)
                            }
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
          {pedido.estado === PedidoEstado.EN_PRODUCCION && (
            <Button 
              color="success"
              variant="solid"
              onPress={() => {
                onMarcarComoListo(pedido);
                onClose();
              }}
              className="w-full md:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              Avisar que el pedido está listo
            </Button>
          )}
          {pedido.estado === PedidoEstado.LISTO_ENTREGA && (
            <>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    size="sm"
                    color="success"
                    variant="light"
                  >
                    <svg height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58">
                      <g>
                        <path fill="#2CB742" d="M0,58l4.988-14.963C2.457,38.78,1,33.812,1,28.5C1,12.76,13.76,0,29.5,0S58,12.76,58,28.5
                          S45.24,57,29.5,57c-4.789,0-9.299-1.187-13.26-3.273L0,58z"/>
                        <path fill="#FFFFFF" d="M47.683,37.985c-1.316-2.487-6.169-5.331-6.169-5.331c-1.098-0.626-2.423-0.696-3.049,0.42
                          c0,0-1.577,1.891-1.978,2.163c-1.832,1.241-3.529,1.193-5.242-0.52l-3.981-3.981l-3.981-3.981c-1.713-1.713-1.761-3.41-0.52-5.242
                          c0.272-0.401,2.163-1.978,2.163-1.978c1.116-0.627,1.046-1.951,0.42-3.049c0,0-2.844-4.853-5.331-6.169
                          c-1.058-0.56-2.357-0.364-3.203,0.482l-1.758,1.758c-5.577,5.577-2.831,11.873,2.746,17.45l5.097,5.097l5.097,5.097
                          c5.577,5.577,11.873,8.323,17.45,2.746l1.758-1.758C48.048,40.341,48.243,39.042,47.683,37.985z"/>
                      </g>
                    </svg>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Opciones de WhatsApp"
                  onAction={(key) => {
                    const mensaje = key === "retiro" 
                      ? `Hola ${pedido.cliente.nombre}! Queremos avisarte que tu pedido N° ${pedido.pedido_json.numeroPresupuesto}, está listo para retirar en local`
                      : `Hola ${pedido.cliente.nombre}, queremos avisarte que tu pedido está listo y podemos comenzar a coordinar el día de colocación.`;
                    
                    // Formatear el número de teléfono (eliminar espacios, guiones y asegurarse que empiece con el código de país)
                    const telefono = pedido.cliente.telefono
                      .replace(/\D/g, '') // Eliminar todo lo que no sea número
                      .replace(/^0/, '') // Eliminar el 0 inicial si existe
                      .replace(/^15/, '') // Eliminar el 15 inicial si existe
                      .replace(/^54/, ''); // Eliminar el 54 inicial si existe
                    
                    window.open(`https://wa.me/54${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
                  }}
                >
                  <DropdownItem key="retiro">
                    Avisar para retiro en local
                  </DropdownItem>
                  <DropdownItem key="colocacion">
                    Coordinar colocación
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          )}
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
          {pedido.estado === PedidoEstado.LISTO_ENTREGA && (
            <Button 
              color="success" 
              className="w-full md:w-auto"
              onPress={() => onMarcarComoEntregado(pedido)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Marcar como Entregado
            </Button>
          )}
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

// Función para formatear los detalles según el sistema
const formatearDetallesSegunSistema = (detalles: any) => {
  const sistema = detalles.sistema?.toLowerCase() || '';
  const detallesFormateados: { [key: string]: any } = {};
  

  
  // Información común para todos los sistemas
  if (detalles.sistema) {
    detallesFormateados['Sistema'] = detalles.sistema;
  }
  
  // Información específica según el tipo de sistema
  if (sistema.includes('tradicional') || sistema.includes('propios')) {
    // Para cortinas tradicionales
    if (detalles.tipoTela) {
      detallesFormateados['Tela'] = detalles.tipoTela;
    }
    if (detalles.ancho && detalles.alto) {
      detallesFormateados['Medidas'] = `${detalles.ancho}cm x ${detalles.alto}cm`;
    }
    if (detalles.caidaPorDelante) {
      detallesFormateados['Caída por delante'] = detalles.caidaPorDelante;
    }
    if (detalles.detalle && detalles.detalle.trim() !== '') {
      detallesFormateados['Detalle'] = detalles.detalle;
    }
    
    // Información específica de accesorios para tradicionales
    if (detalles.accesoriosAdicionales && Array.isArray(detalles.accesoriosAdicionales) && detalles.accesoriosAdicionales.length > 0) {
      detallesFormateados['Accesorios adicionales'] = detalles.accesoriosAdicionales.join(', ');
    } else if (detalles.accesoriosAdicionales && typeof detalles.accesoriosAdicionales === 'string' && detalles.accesoriosAdicionales.trim() !== '' && detalles.accesoriosAdicionales !== '[]') {
      detallesFormateados['Accesorios adicionales'] = detalles.accesoriosAdicionales;
    }
    
    // Verificar otros campos de accesorios específicos para tradicionales
    const camposAccesoriosTradicionales = ['accesorios', 'accesoriosIncluidos', 'accesorio'];
    camposAccesoriosTradicionales.forEach(campo => {
      if (detalles[campo] && !detallesFormateados['Accesorios adicionales']) {
        const valor = detalles[campo];
        if (Array.isArray(valor) && valor.length > 0) {
          detallesFormateados['Accesorios'] = valor.join(', ');
        } else if (typeof valor === 'string' && valor.trim() !== '' && valor !== '[]' && valor !== 'false') {
          detallesFormateados['Accesorios'] = valor;
        }
      }
    });
  } else if (sistema.includes('roller')) {
    // Para cortinas Roller
    if (detalles.colorSistema) {
      detallesFormateados['Color'] = detalles.colorSistema;
    }
    if (detalles.ladoComando) {
      detallesFormateados['Comando'] = detalles.ladoComando;
    }
    if (detalles.soporteIntermedio !== undefined) {
      detallesFormateados['Soporte intermedio'] = detalles.soporteIntermedio ? 'Sí' : 'No';
    }
    if (detalles.soporteDoble !== undefined) {
      detallesFormateados['Soporte doble'] = detalles.soporteDoble ? 'Sí' : 'No';
    }
    if (detalles.ancho && detalles.alto) {
      detallesFormateados['Medidas'] = `${detalles.ancho}cm x ${detalles.alto}cm`;
    }
  } else {
    // Para otros sistemas, mostrar información general
    if (detalles.detalle && detalles.detalle.trim() !== '') {
      detallesFormateados['Detalle'] = detalles.detalle;
    }
    if (detalles.colorSistema) {
      detallesFormateados['Color'] = detalles.colorSistema;
    }
    if (detalles.ladoComando) {
      detallesFormateados['Comando'] = detalles.ladoComando;
    }
    if (detalles.ancho && detalles.alto) {
      detallesFormateados['Medidas'] = `${detalles.ancho}cm x ${detalles.alto}cm`;
    }
  }
  
  // Información de accesorios (común para todos)
  if (detalles.accesorios && Array.isArray(detalles.accesorios) && detalles.accesorios.length > 0) {
    detallesFormateados['Accesorios'] = detalles.accesorios.join(', ');
  } else if (detalles.accesorios && typeof detalles.accesorios === 'string' && detalles.accesorios.trim() !== '') {
    detallesFormateados['Accesorios'] = detalles.accesorios;
  } else if (detalles.accesoriosAdicionales && Array.isArray(detalles.accesoriosAdicionales) && detalles.accesoriosAdicionales.length > 0) {
    detallesFormateados['Accesorios adicionales'] = detalles.accesoriosAdicionales.join(', ');
  } else if (detalles.accesoriosAdicionales && typeof detalles.accesoriosAdicionales === 'string' && detalles.accesoriosAdicionales.trim() !== '') {
    detallesFormateados['Accesorios adicionales'] = detalles.accesoriosAdicionales;
  }
  
  // Verificar otros campos que puedan contener información de accesorios
  const camposAccesorios = ['accesorios', 'accesoriosAdicionales', 'accesorio', 'accesoriosIncluidos'];
  camposAccesorios.forEach(campo => {
    if (detalles[campo] && !detallesFormateados['Accesorios'] && !detallesFormateados['Accesorios adicionales']) {
      const valor = detalles[campo];
      if (Array.isArray(valor) && valor.length > 0) {
        detallesFormateados['Accesorios'] = valor.join(', ');
      } else if (typeof valor === 'string' && valor.trim() !== '' && valor !== '[]' && valor !== 'false') {
        detallesFormateados['Accesorios'] = valor;
      }
    }
  });
  

  
  // Verificación adicional: buscar cualquier campo que contenga "accesorio" en el nombre
  Object.keys(detalles).forEach(key => {
    if (key.toLowerCase().includes('accesorio') && !detallesFormateados['Accesorios'] && !detallesFormateados['Accesorios adicionales']) {
      const valor = detalles[key];
      if (Array.isArray(valor) && valor.length > 0) {
        detallesFormateados['Accesorios'] = valor.join(', ');
      } else if (typeof valor === 'string' && valor.trim() !== '' && valor !== '[]' && valor !== 'false') {
        detallesFormateados['Accesorios'] = valor;
      }
    }
  });
  
  // Verificar información de colocación
  if (detalles.incluirColocacion === true || detalles.incluirColocacion === 'true') {
    detallesFormateados['Colocación'] = 'Incluida';
  } else if (detalles.colocacion && detalles.colocacion !== 'false' && detalles.colocacion !== false) {
    detallesFormateados['Colocación'] = detalles.colocacion;
  }
  

  
  return detallesFormateados;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${selectedPedido.presupuesto_id}/estado-entrega`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: PedidoEstado.EN_PRODUCCION,
          fechaEntrega: fechaEntrega.toISOString().split('T')[0]
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar el pedido');

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de pedidos
        setPedidos(pedidos.map(pedido => 
          pedido.id === selectedPedido.id 
            ? { ...pedido, estado: PedidoEstado.EN_PRODUCCION, fecha_entrega: fechaEntrega.toISOString() }
            : pedido
        ));

        setIsProduccionModalOpen(false);
        setSelectedPedido(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarcarComoListo = async (pedido: Pedido) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${pedido.presupuesto_id}/estado-entrega`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: PedidoEstado.LISTO_ENTREGA,
          fechaEntrega: pedido.fecha_entrega
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar el pedido');

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de pedidos
        setPedidos(pedidos.map(p => 
          p.id === pedido.id 
            ? { ...p, estado: PedidoEstado.LISTO_ENTREGA }
            : p
        ));
        
        setIsDetalleModalOpen(false);
        setSelectedPedidoDetalle(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMarcarComoEntregado = async (pedido: Pedido) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos/${pedido.presupuesto_id}/estado-entrega`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: PedidoEstado.ENTREGADO,
          fechaEntrega: pedido.fecha_entrega
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar el pedido');

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de pedidos
        setPedidos(pedidos.map(p => 
          p.id === pedido.id 
            ? { ...p, estado: PedidoEstado.ENTREGADO }
            : p
        ));
        
        setIsDetalleModalOpen(false);
        setSelectedPedidoDetalle(null);
      }
    } catch (error) {
      console.error('Error:', error);
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
              <>
                <DropdownItem key="todos">Todos</DropdownItem>
                {Object.values(PedidoEstado).map((estado) => (
                  <DropdownItem key={estado} textValue={estado}>
                    {estado}
                  </DropdownItem>
                ))}
              </>
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
                  {pedido.estado === PedidoEstado.EN_PRODUCCION && (
                    <Tooltip content="Marcar como listo para entrega">
                      <Button
                        isIconOnly
                        size="sm"
                        color="success"
                        variant="light"
                        onPress={() => handleMarcarComoListo(pedido)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                        </svg>
                      </Button>
                    </Tooltip>
                  )}
                  {pedido.estado === PedidoEstado.LISTO_ENTREGA ? (
                    <>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            color="success"
                            variant="light"
                          >
                            <svg height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58">
                              <g>
                                <path fill="#2CB742" d="M0,58l4.988-14.963C2.457,38.78,1,33.812,1,28.5C1,12.76,13.76,0,29.5,0S58,12.76,58,28.5
                                  S45.24,57,29.5,57c-4.789,0-9.299-1.187-13.26-3.273L0,58z"/>
                                <path fill="#FFFFFF" d="M47.683,37.985c-1.316-2.487-6.169-5.331-6.169-5.331c-1.098-0.626-2.423-0.696-3.049,0.42
                                  c0,0-1.577,1.891-1.978,2.163c-1.832,1.241-3.529,1.193-5.242-0.52l-3.981-3.981l-3.981-3.981c-1.713-1.713-1.761-3.41-0.52-5.242
                                  c0.272-0.401,2.163-1.978,2.163-1.978c1.116-0.627,1.046-1.951,0.42-3.049c0,0-2.844-4.853-5.331-6.169
                                  c-1.058-0.56-2.357-0.364-3.203,0.482l-1.758,1.758c-5.577,5.577-2.831,11.873,2.746,17.45l5.097,5.097l5.097,5.097
                                  c5.577,5.577,11.873,8.323,17.45,2.746l1.758-1.758C48.048,40.341,48.243,39.042,47.683,37.985z"/>
                              </g>
                            </svg>
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu 
                          aria-label="Opciones de WhatsApp"
                          onAction={(key) => {
                            const mensaje = key === "retiro" 
                              ? `Hola ${pedido.cliente.nombre}! Queremos avisarte que tu pedido N° ${pedido.pedido_json.numeroPresupuesto}, está listo para retirar en local`
                              : `Hola ${pedido.cliente.nombre}, queremos avisarte que tu pedido está listo y podemos comenzar a coordinar el día de colocación.`;
                            
                            // Formatear el número de teléfono (eliminar espacios, guiones y asegurarse que empiece con el código de país)
                            const telefono = pedido.cliente.telefono
                              .replace(/\D/g, '') // Eliminar todo lo que no sea número
                              .replace(/^0/, '') // Eliminar el 0 inicial si existe
                              .replace(/^15/, '') // Eliminar el 15 inicial si existe
                              .replace(/^54/, ''); // Eliminar el 54 inicial si existe
                            
                            window.open(`https://wa.me/54${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
                          }}
                        >
                          <DropdownItem key="retiro">
                            Avisar para retiro en local
                          </DropdownItem>
                          <DropdownItem key="colocacion">
                            Coordinar colocación
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </>
                  ) : pedido.estado === PedidoEstado.CONFIRMADO && (
                    <Tooltip content="Llevar a producción">
                      <Button
                        isIconOnly
                        size="sm"
                        color="secondary"
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
          onMarcarComoListo={handleMarcarComoListo}
          onMarcarComoEntregado={handleMarcarComoEntregado}
        />
      )}
    </div>
  );
}
