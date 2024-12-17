import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@nextui-org/react";

interface Producto {
  detalles: {
    sistema: string;
    colorSistema: string;
    ladoComando: string;
  };
  nombre: string;
  cantidad: number;
  subtotal: number;
}

interface Presupuesto {
  id: number;
  fecha: string;
  total: number;
  items: Producto[];
  numero_presupuesto: string;
}

interface ModalToTableProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: {
    id: number;
    nombre: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
}

const ModalToTable: React.FC<ModalToTableProps> = ({ isOpen, onClose, cliente }) => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const presupuestosPerPage = 4;

  const indexOfLastPresupuesto = currentPage * presupuestosPerPage;
  const indexOfFirstPresupuesto = indexOfLastPresupuesto - presupuestosPerPage;
  const currentPresupuestos = presupuestos.slice(indexOfFirstPresupuesto, indexOfLastPresupuesto);

  const totalPages = Math.ceil(presupuestos.length / presupuestosPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    const fetchPresupuestos = async () => {
      if (!cliente?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/cliente/${cliente.id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los presupuestos');
        }
        
        const data = await response.json();
        console.log('Respuesta completa del servidor:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          setPresupuestos(data.data);
        } else {
          throw new Error(data.message || 'Error al obtener los presupuestos');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar los presupuestos');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPresupuestos();
    }
  }, [isOpen, cliente?.id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {cliente?.nombre}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <p>Teléfono: {cliente?.telefono || 'No registrado'}</p>
              <p>Email: {cliente?.email || 'No registrado'}</p>
              <p className="col-span-2">Dirección: {cliente?.direccion || 'No registrada'}</p>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold">Historial de Presupuestos</h3>
              
              {error && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
                </div>
              ) : currentPresupuestos.length > 0 ? (
                <div className="space-y-4">
                  {currentPresupuestos.map((presupuesto) => (
                    <div key={presupuesto.id} className="overflow-hidden mb-6 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md">
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-3 items-center">
                              <span className="text-sm text-gray-600">
                                <i className="mr-1 far fa-calendar"></i>
                                {new Date(presupuesto.fecha).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                                Presupuesto #{presupuesto.numero_presupuesto}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 items-center">
                            <Popover placement="bottom">
                              <PopoverTrigger>
                                <Button 
                                  size="sm"
                                  variant="flat"
                                  color="default"
                                >
                                  Ver {presupuesto.items?.length || 0} productos
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="overflow-auto w-80 max-h-72">
                                <div className="p-4 space-y-3">
                                  {presupuesto.items && presupuesto.items.length > 0 ? (
                                    presupuesto.items.map((producto, idx) => (
                                      <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                                        <div className="flex-1">
                                          <p className="font-medium">{producto.nombre}</p>
                                          <div className="text-sm text-gray-600">
                                            <p>Cantidad: {producto.cantidad}</p>
                                            {producto.detalles && (
                                              <p className="text-xs">
                                                Sistema: {producto.detalles.sistema} - 
                                                Color: {producto.detalles.colorSistema} - 
                                                Comando: {producto.detalles.ladoComando}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-medium">
                                            ${producto.subtotal.toLocaleString('es-AR')}
                                          </p>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center text-gray-500">
                                      No hay productos para mostrar
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                            
                            <span className="text-lg font-bold text-gray-800">
                              ${presupuesto.total.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between mt-4">
                    <Button 
                      size="md"
                      variant="solid"
                      color="primary"
                      onPress={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                     Anterior
                    </Button>
                    <Button 
                      size="md"
                      variant={currentPage === totalPages ? "flat" : "solid"}
                      color="primary"
                      onPress={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente 
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
                  No hay presupuestos registrados para este cliente
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalToTable;