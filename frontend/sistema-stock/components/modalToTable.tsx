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
  PopoverTrigger,
  Pagination
} from "@heroui/react";
import { useRouter } from 'next/navigation';
import { Checkbox } from "@heroui/react";
import LoadingTransition from './LoadingTransition';

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

interface Medida {
  id: number;
  elemento: string;
  ancho: number;
  alto: number;
  cantidad: number;
  ubicacion: string;
  detalles: string;
  clienteId: number;
  cliente_nombre: string;
  fechaMedicion: string;
  medidoPor: string;
}

interface Pedido {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  numero_pedido: string;
  productos: Producto[];
  incluirColocacion: boolean;
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

// Definimos un tipo para las categorías
type Category = 'Presupuestos' | 'Pedidos' | 'Medidas';

// Agregar nueva interfaz para las medidas agrupadas
interface MedidasAgrupadas {
  cliente: {
    id: number;
    nombre: string;
    telefono: string;
    email: string;
  };
  medidas: {
    [ubicacion: string]: Medida[];
  };
}

const ModalToTable: React.FC<ModalToTableProps> = ({ isOpen, onClose, cliente }) => {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Presupuestos');
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [loadingMedidas, setLoadingMedidas] = useState(false);
  const [errorMedidas, setErrorMedidas] = useState<string | null>(null);
  const [currentPageMedidas, setCurrentPageMedidas] = useState(1);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState<string | null>(null);
  const [currentPagePedidos, setCurrentPagePedidos] = useState(1);
  const [medidasAgrupadas, setMedidasAgrupadas] = useState<MedidasAgrupadas | null>(null);
  const [medidasSeleccionadas, setMedidasSeleccionadas] = useState<number[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Definimos diferentes cantidades por página según la categoría
  const rowsPerPagePresupuestos = 4;
  const rowsPerPagePedidos = 4;
  const rowsPerPageMedidas = 2;

  // Cálculos de paginación para presupuestos
  const pages = Math.ceil(presupuestos.length / rowsPerPagePresupuestos);
  const items = presupuestos.slice(
    (currentPage - 1) * rowsPerPagePresupuestos, 
    currentPage * rowsPerPagePresupuestos
  );

  // Cálculos de paginación para medidas
  const pagesMedidas = Math.ceil(medidas.length / rowsPerPageMedidas);
  const itemsMedidas = medidas.slice(
    (currentPageMedidas - 1) * rowsPerPageMedidas, 
    currentPageMedidas * rowsPerPageMedidas
  );

  // Cálculos de paginación para pedidos
  const pagesPedidos = Math.ceil(pedidos.length / rowsPerPagePedidos);
  const itemsPedidos = pedidos.slice(
    (currentPagePedidos - 1) * rowsPerPagePedidos, 
    currentPagePedidos * rowsPerPagePedidos
  );

  // Estilo para las pestañas de categoría
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

  const getTabStyle = (category: Category) => {
    return `px-4 py-2 cursor-pointer transition-all ${
      selectedCategory === category
        ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 font-medium'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`;
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

  useEffect(() => {
    const fetchMedidas = async () => {
      if (!cliente?.id || selectedCategory !== 'Medidas') return;
      
      setLoadingMedidas(true);
      setErrorMedidas(null);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/medidas-cliente/${cliente.id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar las medidas');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setMedidasAgrupadas(data.data);
        } else {
          throw new Error(data.message || 'Error al obtener las medidas');
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMedidas(error instanceof Error ? error.message : 'Error al cargar las medidas');
      } finally {
        setLoadingMedidas(false);
      }
    };

    if (isOpen && selectedCategory === 'Medidas') {
      fetchMedidas();
    }
  }, [isOpen, cliente?.id, selectedCategory]);

  // Modificamos la función de redirección
  const handleRedirigirAPresupuesto = () => {
    if (medidasSeleccionadas.length === 0) {
      alert('Por favor, seleccione al menos una medida');
      return;
    }

    setIsRedirecting(true);
    onClose(); // Cerrar el modal

    // Construimos la URL con los parámetros necesarios
    const queryParams = new URLSearchParams();
    queryParams.append('clienteId', cliente.id.toString());
    // Agregamos cada medida como un valor separado
    medidasSeleccionadas.forEach(medidaId => {
      queryParams.append('medidas', medidaId.toString());
    });

    const redirectUrl = `/presupuestos?${queryParams.toString()}`;
    
    // Agregamos un pequeño delay para mostrar la transición
    setTimeout(() => {
      router.push(redirectUrl);
    }, 2000);
  };

  // Modificar la sección de renderizado de medidas
  const renderMedidas = () => {
    if (loadingMedidas) {
      return (
        <div className="flex justify-center items-center h-[20rem]">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
        </div>
      );
    }

    if (errorMedidas) {
      return (
        <div className="p-4 mb-4 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {errorMedidas}
        </div>
      );
    }

    if (!medidasAgrupadas || Object.keys(medidasAgrupadas.medidas).length === 0) {
      return (
        <div className="flex items-center justify-center h-[20rem] text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
          No hay medidas registradas para este cliente
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(medidasAgrupadas.medidas).map(([ubicacion, medidas]) => (
          <div key={ubicacion} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{ubicacion}</h4>
              <div className="space-y-4">
                {medidas.map((medida) => (
                  <div key={medida.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <Checkbox
                      isSelected={medidasSeleccionadas.includes(medida.id)}
                      onValueChange={(isSelected) => {
                        setMedidasSeleccionadas(prev => 
                          isSelected 
                            ? [...prev, medida.id]
                            : prev.filter(id => id !== medida.id)
                        );
                      }}
                    >
                      <div className="ml-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{medida.elemento}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {medida.ancho}cm x {medida.alto}cm - Cantidad: {medida.cantidad}
                        </p>
                        {medida.detalles && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{medida.detalles}</p>
                        )}
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {isRedirecting && <LoadingTransition />}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="3xl"
        classNames={{
          base: "h-[40rem]",
          body: "overflow-hidden",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {cliente?.nombre}
          </ModalHeader>
          
          <ModalBody>
            <div className="flex flex-col h-full">
              {/* Info del cliente */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <p className="text-gray-900 dark:text-gray-100">Teléfono: {cliente?.telefono || 'No registrado'}</p>
                <p className="text-gray-900 dark:text-gray-100">Email: {cliente?.email || 'No registrado'}</p>
                <p className="col-span-2 text-gray-900 dark:text-gray-100">Dirección: {cliente?.direccion || 'No registrada'}</p>
              </div>

              {/* Tabs de categorías */}
              <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8">
                  <button
                    className={getTabStyle('Presupuestos')}
                    onClick={() => setSelectedCategory('Presupuestos')}
                  >
                    <i className="mr-2 far fa-file-alt"></i>
                    Presupuestos
                  </button>
                  <button
                    className={getTabStyle('Pedidos')}
                    onClick={() => setSelectedCategory('Pedidos')}
                  >
                    <i className="mr-2 fas fa-shopping-cart"></i>
                    Pedidos
                  </button>
                  <button
                    className={getTabStyle('Medidas')}
                    onClick={() => setSelectedCategory('Medidas')}
                  >
                    <i className="mr-2 fas fa-ruler"></i>
                    Medidas
                  </button>
                </div>
              </div>

              {/* Contenedor con altura fija para el contenido */}
              <div className="flex-1 overflow-y-auto min-h-[25rem] max-h-[25rem]">
                {selectedCategory === 'Presupuestos' && (
                  <>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de Presupuestos</h3>
                    
                    {error && (
                      <div className="p-4 mb-4 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        {error}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="flex justify-center items-center h-[20rem]">
                        <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
                      </div>
                    ) : items.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {items.map((presupuesto) => (
                            <div key={presupuesto.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap gap-3 items-center">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        <i className="mr-1 far fa-calendar"></i>
                                        {new Date(presupuesto.fecha).toLocaleDateString('es-AR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric'
                                        })}
                                      </span>
                                      <span className="px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                        Presupuesto #{formatearNumeroPresupuesto(presupuesto.numero_presupuesto)}
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
                                    
                                    <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                      ${presupuesto.total.toLocaleString('es-AR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[20rem] text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        No hay presupuestos registrados para este cliente
                      </div>
                    )}
                  </>
                )}

                {selectedCategory === 'Pedidos' && (
                  <div className="flex items-center justify-center h-[20rem] text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    Historial de Pedidos - Próximamente
                  </div>
                )}

                {selectedCategory === 'Medidas' && renderMedidas()}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              {selectedCategory === 'Medidas' && medidasSeleccionadas.length > 0 && (
                <Button 
                  color="primary"
                  onPress={handleRedirigirAPresupuesto}
                >
                  Continuar con Presupuesto ({medidasSeleccionadas.length})
                </Button>
              )}
            </div>
            
            <div className="flex flex-1 justify-center">
              {selectedCategory === 'Presupuestos' && items.length > 0 && (
                <Pagination
                  total={pages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  size="sm"
                />
              )}
              
              {selectedCategory === 'Medidas' && itemsMedidas.length > 0 && (
                <Pagination
                  total={pagesMedidas}
                  page={currentPageMedidas}
                  onChange={setCurrentPageMedidas}
                  size="sm"
                />
              )}

              {selectedCategory === 'Pedidos' && itemsPedidos.length > 0 && (
                <Pagination
                  total={pagesPedidos}
                  page={currentPagePedidos}
                  onChange={setCurrentPagePedidos}
                  size="sm"
                />
              )}
            </div>

            <Button color="danger" variant="light" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalToTable;