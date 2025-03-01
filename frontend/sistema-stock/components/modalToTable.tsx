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

const ModalToTable: React.FC<ModalToTableProps> = ({ isOpen, onClose, cliente }) => {
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
  const getTabStyle = (category: Category) => {
    return `px-4 py-2 cursor-pointer transition-all ${
      selectedCategory === category
        ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
        : 'text-gray-500 hover:text-gray-700'
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
      
      console.log('Consultando medidas para el cliente ID:', cliente.id);
      
      setLoadingMedidas(true);
      setErrorMedidas(null);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medidas/cliente/${cliente.id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar las medidas');
        }
        
        const data = await response.json();
        console.log('Respuesta de medidas:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          setMedidas(data.data);
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

  return (
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
              <p>Teléfono: {cliente?.telefono || 'No registrado'}</p>
              <p>Email: {cliente?.email || 'No registrado'}</p>
              <p className="col-span-2">Dirección: {cliente?.direccion || 'No registrada'}</p>
            </div>

            {/* Tabs de categorías */}
            <div className="mb-4 border-b">
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
                  <h3 className="mb-4 text-lg font-semibold">Historial de Presupuestos</h3>
                  
                  {error && (
                    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
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
                          <div key={presupuesto.id} className="bg-white rounded-xl border shadow-sm">
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
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[20rem] text-center text-gray-500 bg-gray-50 rounded-lg">
                      No hay presupuestos registrados para este cliente
                    </div>
                  )}
                </>
              )}

              {selectedCategory === 'Pedidos' && (
                <div className="flex items-center justify-center h-[20rem] text-center text-gray-500 bg-gray-50 rounded-lg">
                  Historial de Pedidos - Próximamente
                </div>
              )}

              {selectedCategory === 'Medidas' && (
                <>
                  <h3 className="mb-4 text-lg font-semibold">Historial de Medidas</h3>
                  
                  {errorMedidas && (
                    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                      {errorMedidas}
                    </div>
                  )}

                  {loadingMedidas ? (
                    <div className="flex justify-center items-center h-[20rem]">
                      <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
                    </div>
                  ) : itemsMedidas.length > 0 ? (
                    <div className="space-y-4">
                      {itemsMedidas.map((medida) => (
                        <div key={medida.id} className="bg-white rounded-xl border shadow-sm">
                          <div className="p-4 bg-gray-50 border-b">
                            <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-3 items-center">
                                  <span className="text-sm text-gray-600">
                                    <i className="mr-1 far fa-calendar"></i>
                                    {new Date(medida.fechaMedicion).toLocaleDateString('es-AR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  <span className="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                                    {medida.elemento}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>Ubicación: {medida.ubicacion}</p>
                                  <p>Medido por: {medida.medidoPor}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-3 items-center">
                                <div className="text-sm">
                                  <p>Ancho: {medida.ancho} cm</p>
                                  <p>Alto: {medida.alto} cm</p>
                                  <p>Cantidad: {medida.cantidad}</p>
                                </div>
                              </div>
                            </div>
                            {medida.detalles && (
                              <div className="pt-2 mt-2 text-sm text-gray-600 border-t">
                                <p>Detalles: {medida.detalles}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[20rem] text-center text-gray-500 bg-gray-50 rounded-lg">
                      No hay medidas registradas para este cliente
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between items-center">
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
  );
};

export default ModalToTable;