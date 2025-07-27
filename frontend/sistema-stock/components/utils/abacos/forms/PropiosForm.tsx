import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Checkbox, Textarea, Tabs, Tab, Card, CardBody, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface PropiosFormProps {
  // Props generales
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  onPedidoDetailsChange: (detalles: any) => void;
  
  // Props específicas de Propios
  detalle: string;
  onDetalleChange: (value: string) => void;
  
  // Props para telas
  selectedTela?: any;
  onTelaSelect?: (tela: any) => void;
  searchTela?: string;
  onSearchTelaChange?: (value: string) => void;
  telasFiltradas?: any[];
  showTelasList?: boolean;
  onShowTelasListChange?: (show: boolean) => void;
  onProductoSelect?: (producto: any) => void;
  onAccesoriosAdicionalesChange?: (accesorios: any[]) => void;
}

export default function PropiosForm({
  ancho,
  alto,
  cantidad,
  selectedArticulo,
  onPedidoDetailsChange,
  detalle,
  onDetalleChange,
  onProductoSelect,
  onAccesoriosAdicionalesChange
}: PropiosFormProps) {
  // Estado para el tab seleccionado
  const [selectedTab, setSelectedTab] = useState<'riel' | 'barral' | 'sin-sistema'>('riel');
  
  // Estados específicos para Riel
  const [searchRiel, setSearchRiel] = useState('');
  const [rielesFiltrados, setRielesFiltrados] = useState<any[]>([]);
  const [selectedRiel, setSelectedRiel] = useState<any>(null);
  const [showRielesList, setShowRielesList] = useState(false);
  const [colorRiel, setColorRiel] = useState('');
  const [ladoComandoRiel, setLadoComandoRiel] = useState('');
  const [accesoriosRiel, setAccesoriosRiel] = useState<string[]>([]);
  const [tipoPañoRiel, setTipoPañoRiel] = useState<string>('');
  
  // Estados específicos para Barral
  const [searchBarral, setSearchBarral] = useState('');
  const [barralesFiltrados, setBarralesFiltrados] = useState<any[]>([]);
  const [selectedBarral, setSelectedBarral] = useState<any>(null);
  const [showBarralesList, setShowBarralesList] = useState(false);
  const [tipoBarral, setTipoBarral] = useState('');
  const [colorBarral, setColorBarral] = useState('');
  const [accesoriosBarral, setAccesoriosBarral] = useState<string[]>([]);
  const [tipoPañoBarral, setTipoPañoBarral] = useState<string>('');
  
  // Estados compartidos
  const [telaSeleccionada, setTelaSeleccionada] = useState<any>(null);
  const [detallesAdicionales, setDetallesAdicionales] = useState('');

  // Estados para productos
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Estados para accesorios
  const [accesoriosDisponibles, setAccesoriosDisponibles] = useState<any[]>([]);
  const [accesoriosSeleccionados, setAccesoriosSeleccionados] = useState<any[]>([]);
  const [searchAccesorio, setSearchAccesorio] = useState('');
  const [loadingAccesorios, setLoadingAccesorios] = useState(false);
  const [showAccesoriosList, setShowAccesoriosList] = useState(false);

  // Estado para el multiplicador de tela
  const [multiplicadorTela, setMultiplicadorTela] = useState(1);

  // Estado para el toast de confirmación
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estado para el modal de confirmación de cambio de tab
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<'riel' | 'barral' | 'sin-sistema' | null>(null);

  // Función para buscar rieles
  const handleBuscarRiel = async (value: string) => {
    setSearchRiel(value);
    setShowRielesList(true);

    // Permitir búsqueda si es '*' (con o sin espacios) o si hay texto
    const isAsterisk = value.trim() === '*';
    if (!value.trim() && !isAsterisk) {
      setRielesFiltrados([]);
      setShowRielesList(false);
      return;
    }

    try {
      // Solo buscar por rubroId=5 para rieles
      if (selectedTab === 'riel') {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?rubroId=5`;
        if (isAsterisk) {
          url += '&q=*';
        } else {
          url += `&q=${encodeURIComponent(value)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al buscar productos');
        const data = await response.json();
        setRielesFiltrados(Array.isArray(data.data) ? data.data : []);
      } else if (selectedTab === 'barral') {
        // Lógica existente para barral
        let url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=10&rubroId=6&proveedorId=8`;
        if (isAsterisk) {
          url += '&q=*';
        } else {
          url += `&q=${encodeURIComponent(value)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al buscar productos');
        const data = await response.json();
        setBarralesFiltrados(Array.isArray(data.data) ? data.data : []);
      } else {
        setRielesFiltrados([]);
        setShowRielesList(false);
      }
    } catch (error) {
      setRielesFiltrados([]);
    }
  };

  const handleBuscarBarral = async (value: string) => {
    setSearchBarral(value);
    setShowBarralesList(true);
    const isAsterisk = value.trim() === '*';
    if (!value.trim() && !isAsterisk) {
      setBarralesFiltrados([]);
      setShowBarralesList(false);
      return;
    }
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?rubroId=6`;
      if (isAsterisk) {
        url += '&q=*';
      } else {
        url += `&q=${encodeURIComponent(value)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al buscar productos');
      const data = await response.json();
      setBarralesFiltrados(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setBarralesFiltrados([]);
    }
  };

  // const tiposBarral = [
  //   "Barral de madera",
  //   "Barral de aluminio",
  //   "Barral de acero",
  //   "Barral telescópico",
  //   "Barral decorativo"
  // ];

  const coloresBarral = ["Blanco", "Negro", "Satinado", "Bronce Viejo"];
  const coloresRiel = ["Blanco", "Negro"];
  
  const ladosComando = ["Izquierda", "Derecha", "Centro"];

  const accesoriosRielOptions = [
    "Paño completo",
    "Paño dividido",
  ];

  const accesoriosBarralOptions = [
    "Soportes de pared",
    "Soportes de techo",
    "Anillas",
    "Ganchos",
    "Cordones",
    "Puntas decorativas"
  ];

  // Función para cargar productos según el tipo seleccionado
  const cargarProductos = async () => {
    setLoadingProductos(true);
    try {
      if (selectedTab === 'sin-sistema') {
        setProductosDisponibles([]);
        return;
      }
      
      const rubroId = selectedTab === 'riel' ? 5 : 6;
      const proveedorId = selectedTab === 'riel' ? 7 : 8;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=7&rubroId=${rubroId}&proveedorId=${proveedorId}`);
      const data = await response.json();
      
      if (Array.isArray(data.data)) {
        setProductosDisponibles(data.data);
      } else {
        setProductosDisponibles([]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductosDisponibles([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Cargar productos cuando cambie el tab
  useEffect(() => {
    cargarProductos();
  }, [selectedTab]);

  // Función para cargar accesorios
  const cargarAccesorios = async () => {
    setLoadingAccesorios(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/accesorios`);
      const data = await response.json();
      
      if (Array.isArray(data.data)) {
        setAccesoriosDisponibles(data.data);
      } else {
        setAccesoriosDisponibles([]);
      }
    } catch (error) {
      console.error('Error al cargar accesorios:', error);
      setAccesoriosDisponibles([]);
    } finally {
      setLoadingAccesorios(false);
    }
  };

  // Cargar accesorios al montar el componente
  useEffect(() => {
    cargarAccesorios();
  }, []);

  // Función para manejar cambios en accesorios de riel/barral
  const handleAccesorioChange = (accesorio: string, tipo: 'riel' | 'barral') => {
    if (tipo === 'riel') {
      setAccesoriosRiel(prev => 
        prev.includes(accesorio) 
          ? prev.filter(a => a !== accesorio)
          : [...prev, accesorio]
      );
    } else {
      setAccesoriosBarral(prev => 
        prev.includes(accesorio) 
          ? prev.filter(a => a !== accesorio)
          : [...prev, accesorio]
      );
    }
  };

  // Función para manejar cambios en tipo de paño (radio button)
  const handleTipoPañoChange = (tipo: string) => {
    setTipoPañoRiel(tipo === tipoPañoRiel ? '' : tipo);
  };

  // Función para mostrar toast de confirmación
  const mostrarToast = (mensaje: string) => {
    setToastMessage(mensaje);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  // Función para manejar el cambio de tab con confirmación
  const handleTabChange = (newTab: 'riel' | 'barral' | 'sin-sistema') => {
    // Si hay accesorios seleccionados y se está cambiando entre riel y barral, mostrar confirmación
    if (accesoriosSeleccionados.length > 0 && 
        ((selectedTab === 'riel' && newTab === 'barral') || 
         (selectedTab === 'barral' && newTab === 'riel'))) {
      setPendingTabChange(newTab);
      setShowConfirmModal(true);
    } else {
      // Si no hay accesorios o no es cambio entre riel/barral, cambiar directamente
      setSelectedTab(newTab);
      // Limpiar campos específicos del tab anterior
      limpiarCamposTab(selectedTab);
    }
  };

  // Función para limpiar campos específicos de cada tab
  const limpiarCamposTab = (tabAnterior: 'riel' | 'barral' | 'sin-sistema') => {
    if (tabAnterior === 'riel') {
      setSelectedRiel(null);
      setSearchRiel('');
      setShowRielesList(false);
      setColorRiel('');
      setLadoComandoRiel('');
      setAccesoriosRiel([]);
      setTipoPañoRiel('');
    } else if (tabAnterior === 'barral') {
      setSelectedBarral(null);
      setSearchBarral('');
      setShowBarralesList(false);
      setTipoBarral('');
      setColorBarral('');
      setAccesoriosBarral([]);
      setTipoPañoBarral('');
    }
    
    // Limpiar productos y accesorios adicionales
    setProductoSeleccionado(null);
    setAccesoriosSeleccionados([]);
    setSearchAccesorio('');
    setShowAccesoriosList(false);
    
    // Notificar al componente padre que se limpiaron los campos
    if (onProductoSelect) {
      onProductoSelect(null);
    }
    if (onAccesoriosAdicionalesChange) {
      onAccesoriosAdicionalesChange([]);
    }
  };

  // Función para confirmar el cambio de tab
  const confirmTabChange = () => {
    if (pendingTabChange) {
      // Limpiar campos del tab anterior
      limpiarCamposTab(selectedTab);
      
      setSelectedTab(pendingTabChange);
      setShowConfirmModal(false);
      setPendingTabChange(null);
      mostrarToast('Campos limpiados al cambiar de soporte');
    }
  };

  // Función para cancelar el cambio de tab
  const cancelTabChange = () => {
    setShowConfirmModal(false);
    setPendingTabChange(null);
  };

  // Función para agregar accesorio adicional
  const handleAgregarAccesorio = (accesorio: any) => {
    if (!accesoriosSeleccionados.find(a => a.id === accesorio.id)) {
      setAccesoriosSeleccionados(prev => [...prev, accesorio]);
      mostrarToast(`¡${accesorio.nombreProducto} agregado correctamente! ¡Seguí sumando otros!`);
    }
  };

  // Función para quitar accesorio adicional
  const handleQuitarAccesorio = (accesorioId: number) => {
    setAccesoriosSeleccionados(prev => prev.filter(a => a.id !== accesorioId));
  };

  // Filtrar accesorios según búsqueda
  const accesoriosFiltrados = accesoriosDisponibles.filter(accesorio =>
    (accesorio.nombreProducto?.toLowerCase() || '').includes(searchAccesorio.toLowerCase()) ||
    (accesorio.descripcion?.toLowerCase() || '').includes(searchAccesorio.toLowerCase())
  );

  const handleAccesorioInput = async (value: string) => {
    setSearchAccesorio(value);
    setShowAccesoriosList(true);
    let rubroId = selectedTab === 'riel' ? 5 : selectedTab === 'barral' ? 6 : selectedTab === 'sin-sistema' ? '5,6' : null;
    if (!rubroId) return;
    if (!value.trim() && value.trim() !== '*') {
      setAccesoriosDisponibles([]);
      return;
    }
    let url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?rubroId=${rubroId}`;
    if (value.trim() === '*') {
      url += '&q=*';
    } else {
      url += `&q=${encodeURIComponent(value)}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    setAccesoriosDisponibles(Array.isArray(data.data) ? data.data : []);
  };

  const handleAccesorioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowAccesoriosList(false);
      setSearchAccesorio(''); // Limpiar el campo de búsqueda
    }
  };

  // Actualizar detalles del pedido cuando cambien los valores
  useEffect(() => {
    const detalles = {
      tipoArmado: selectedTab,
      ...(selectedTab === 'riel' ? {
        selectedRiel,
        colorRiel,
        ladoComandoRiel,
        accesoriosRiel,
        tipoPañoRiel,
        multiplicadorTela
      } : selectedTab === 'barral' ? {
        tipoBarral,
        colorBarral,
        accesoriosBarral,
        selectedBarral,
        tipoPañoBarral,
        multiplicadorTela
      } : {}),
      telaSeleccionada,
      detallesAdicionales,
      detalle,
      productoSeleccionado,
      accesoriosSeleccionados
    };
    
    onPedidoDetailsChange(detalles);
    
    // Notificar al componente padre sobre el producto seleccionado
    if (onProductoSelect) {
      const productoActual = selectedTab === 'riel' ? selectedRiel : selectedTab === 'barral' ? selectedBarral : null;
      onProductoSelect(productoActual);
    }
  }, [
    selectedTab,
    selectedRiel,
    colorRiel,
    ladoComandoRiel,
    accesoriosRiel,
    tipoPañoRiel,
    tipoBarral,
    colorBarral,
    accesoriosBarral,
    tipoPañoBarral,
    telaSeleccionada,
    detallesAdicionales,
    detalle,
    productoSeleccionado,
    accesoriosSeleccionados,
    multiplicadorTela,
    selectedBarral,
    onPedidoDetailsChange,
    onProductoSelect
  ]);

  useEffect(() => {
    if (onAccesoriosAdicionalesChange) {
      onAccesoriosAdicionalesChange(accesoriosSeleccionados);
    }
  }, [accesoriosSeleccionados, onAccesoriosAdicionalesChange]);

  useEffect(() => {
    if (!showAccesoriosList) return;

    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAccesoriosList(false);
        setSearchAccesorio('');
      }
    };

    window.addEventListener('keydown', handleGlobalEsc, { capture: true });
    return () => window.removeEventListener('keydown', handleGlobalEsc, { capture: true });
  }, [showAccesoriosList]);

  return (
    <div className="space-y-6">
      {/* Tabs para Riel vs Barral vs Sin Sistema */}
      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={(key) => handleTabChange(key as 'riel' | 'barral' | 'sin-sistema')}
        className="w-full"
      >
        <Tab key="riel" title="Riel">
          <Card>
            <CardBody className="space-y-4">
              {/* Buscador de Riel */}
              <div className="space-y-2">
                <Input
                  label={`Buscar ${selectedTab === 'riel' ? 'Riel' : selectedTab === 'barral' ? 'Barral' : 'Producto'}`}
                  placeholder={`Buscar ${selectedTab === 'riel' ? 'rieles' : selectedTab === 'barral' ? 'barrales' : 'productos'} por nombre, ID o * para ver todos...`}
                  value={selectedRiel ? `${selectedRiel.nombreProducto} - $${selectedRiel.precio}` : searchRiel}
                  onValueChange={handleBuscarRiel}
                  size="sm"
                  startContent={
                    <div className="flex items-center pointer-events-none">
                      <span className="text-default-400 text-small">🔍</span>
                    </div>
                  }
                  endContent={
                    selectedRiel && (
                      <button
                        type="button"
                        className="px-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label="Quitar producto"
                        onClick={() => {
                          setSelectedRiel(null);
                          setSearchRiel("");
                          setShowRielesList(false);
                        }}
                      >
                        ×
                      </button>
                    )
                  }
                />
                {showRielesList && (searchRiel.length > 1 || searchRiel.trim() === '*') && selectedTab !== 'sin-sistema' && (
                  rielesFiltrados.length > 0 ? (
                    <div className="overflow-y-auto mt-2 max-h-48 rounded-lg border bg-gray-100 z-[1050] relative">
                      {rielesFiltrados.map(item => (
                        <button
                          key={item.id}
                          className="p-2 w-full text-left border-b cursor-pointer hover:bg-gray-200 last:border-b-0"
                          onClick={() => {
                            setSelectedRiel(item);
                            setShowRielesList(false);
                            setSearchRiel(item.nombreProducto);
                            if (onProductoSelect) onProductoSelect(item);
                            console.log(`[${selectedTab.toUpperCase()} SELECCIONADO]`, item);
                          }}
                          role="option"
                          aria-selected={selectedRiel?.id === item.id}
                        >
                          <div className="font-medium">{item.nombreProducto}</div>
                          <div className="text-sm text-gray-600">
                            {item.descripcion && <span className="text-gray-500">{item.descripcion}</span>}
                            {item.precio && <span className="ml-2">Precio: ${item.precio}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 max-h-48 rounded-lg border bg-gray-100 z-[1050] relative flex items-center justify-center p-4 text-gray-500">
                      Sin resultados
                    </div>
                  )
                )}
              </div>

              {/* Color de Riel */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Color del Riel"
                  placeholder="Seleccione color"
                  selectedKeys={colorRiel ? [colorRiel] : []}
                  onSelectionChange={(keys) => {
                    const color = Array.from(keys)[0] as string;
                    setColorRiel(color);
                  }}
                >
                  {coloresRiel.map((color) => (
                    <SelectItem key={color}>
                      {color}
                    </SelectItem>
                  ))}
                </Select>

                
              {/* Tipo de Paño para Riel */}
              <Select
                label="Tipo de Paño"
                placeholder="Seleccione tipo"
                selectedKeys={tipoPañoRiel ? [tipoPañoRiel] : []}
                onSelectionChange={(keys) => {
                  const tipo = Array.from(keys)[0] as string;
                  setTipoPañoRiel(tipo);
                }}
              >
                {accesoriosRielOptions.map((tipo) => (
                  <SelectItem key={tipo}>{tipo}</SelectItem>
                ))}
              </Select>



              </div>

            </CardBody>
          </Card>
        </Tab>

        <Tab key="barral" title="Barral">
          <Card>
            <CardBody className="space-y-4">
              {/* Input de búsqueda de Barral */}
              <div className="space-y-2">
                <Input
                  label="Buscar Barral"
                  placeholder="Buscar barrales por nombre, ID o * para ver todos..."
                  value={selectedBarral ? `${selectedBarral.nombreProducto} - $${selectedBarral.precio}` : searchBarral}
                  onValueChange={handleBuscarBarral}
                  size="sm"
                  startContent={
                    <div className="flex items-center pointer-events-none">
                      <span className="text-default-400 text-small">🔍</span>
                    </div>
                  }
                  endContent={
                    selectedBarral && (
                      <button
                        type="button"
                        className="px-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label="Quitar producto"
                        onClick={() => {
                          setSelectedBarral(null);
                          setSearchBarral("");
                          setShowBarralesList(false);
                        }}
                      >
                        ×
                      </button>
                    )
                  }
                />
                {showBarralesList && (searchBarral.length > 1 || searchBarral.trim() === '*') && (
                  barralesFiltrados.length > 0 ? (
                    <div className="overflow-y-auto mt-2 max-h-48 rounded-lg border bg-gray-100 z-[1050] relative">
                      {barralesFiltrados.map(item => (
                        <button
                          key={item.id}
                          className="p-2 w-full text-left border-b cursor-pointer hover:bg-gray-200 last:border-b-0"
                          onClick={() => {
                            setSelectedBarral(item);
                            setShowBarralesList(false);
                            setSearchBarral(item.nombreProducto);
                          }}
                          role="option"
                          aria-selected={selectedBarral?.id === item.id}
                        >
                          <div className="font-medium">{item.nombreProducto}</div>
                          <div className="text-sm text-gray-600">
                            {item.descripcion && <span className="text-gray-500">{item.descripcion}</span>}
                            {item.precio && <span className="ml-2">Precio: ${item.precio}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 max-h-48 rounded-lg border bg-gray-100 z-[1050] relative flex items-center justify-center p-4 text-gray-500">
                      Sin resultados
                    </div>
                  )
                )}
              </div>
              {/* Fin input búsqueda barral */}

              {/* Color del Barral */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Color del Barral"
                  placeholder="Seleccione color"
                  selectedKeys={colorBarral ? [colorBarral] : []}
                  onSelectionChange={(keys) => {
                    const color = Array.from(keys)[0] as string;
                    setColorBarral(color);
                  }}
                >
                  {coloresBarral.map((color) => (
                    <SelectItem key={color}>
                      {color}
                    </SelectItem>
                  ))}
                </Select>

                {/* Tipo de Paño para Barral */}
                <Select
                  label="Tipo de Paño"
                  placeholder="Seleccione tipo"
                  selectedKeys={tipoPañoBarral ? [tipoPañoBarral] : []}
                  onSelectionChange={(keys) => {
                    const tipo = Array.from(keys)[0] as string;
                    setTipoPañoBarral(tipo);
                  }}
                >
                  {accesoriosRielOptions.map((tipo) => (
                    <SelectItem key={tipo}>{tipo}</SelectItem>
                  ))}
                </Select>
              </div>

            </CardBody>
          </Card>
        </Tab>

        <Tab key="sin-sistema" title="Sin Sistema">
          <Card>
            <CardBody className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Para esta opción solo se requiere seleccionar la tela y especificar detalles adicionales.
                </p>
                <p className="text-sm text-gray-500">
                  No se requiere sistema de riel o barral.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>



              {/* Sección compartida - Detalles adicionales */}
        {/* Sección de Accesorios Adicionales */}
        <Card>
          <CardBody className="space-y-4">
            <h4 className="font-semibold text-lg">Accesorios Adicionales</h4>
            {/* Buscador de accesorios */}
            <div className="space-y-4">
              <Input
                label="Buscar accesorios"
                placeholder="Buscar accesorios por nombre o * para ver todos..."
                value={searchAccesorio}
                onValueChange={handleAccesorioInput}
                onKeyDown={handleAccesorioKeyDown}
                startContent={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              {showAccesoriosList && accesoriosDisponibles.length > 0 && (
                <div className="text-blue-600 text-xs mb-2">Presiona ESC para ocultar las opciones</div>
              )}
              {showAccesoriosList && searchAccesorio && accesoriosDisponibles.length > 0 && (
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <h5 className="font-medium mb-2">Accesorios disponibles:</h5>
                  <div className="space-y-2">
                    {accesoriosDisponibles.map((accesorio) => (
                      <div
                        key={accesorio.id}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{accesorio.nombreProducto}</p>
                          {accesorio.descripcion && (
                            <p className="text-sm text-gray-600">{accesorio.descripcion}</p>
                          )}
                          {accesorio.precio && (
                            <p className="text-sm text-green-600">Precio: ${accesorio.precio}</p>
                          )}
                        </div>
                        <input
                          type="number"
                          min={1}
                          defaultValue={1}
                          className="w-16 border rounded px-2 py-1 text-sm"
                          onChange={e => accesorio._cantidad = Number(e.target.value)}
                        />
                        <button
                          className="text-blue-600 hover:text-blue-800 text-xl px-2"
                          onClick={() => {
                            const cantidad = accesorio._cantidad || 1;
                            const accesorioConCantidad = { ...accesorio, cantidad };
                            if (!accesoriosSeleccionados.find(a => a.id === accesorio.id)) {
                              setAccesoriosSeleccionados(prev => [...prev, accesorioConCantidad]);
                              mostrarToast(`¡${accesorio.nombreProducto} agregado correctamente! ¡Seguí sumando otros!`);
                            }
                          }}
                        >
                         Agregar +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accesorios seleccionados */}
              {accesoriosSeleccionados.length > 0 && (
                <div className="border rounded-lg p-3">
                  <h5 className="font-medium mb-2">Accesorios seleccionados:</h5>
                  <div className="space-y-2">
                    {accesoriosSeleccionados.map((accesorio, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-blue-50 border rounded"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{accesorio.nombreProducto}</p>
                          {accesorio.descripcion && (
                            <p className="text-sm text-gray-600">{accesorio.descripcion}</p>
                          )}
                          {accesorio.precio && (
                            <p className="text-sm text-green-600">Precio: ${accesorio.precio}</p>
                          )}
                          <p className="text-sm">Cantidad: {accesorio.cantidad || 1}</p>
                        </div>
                        <button
                          onClick={() => handleQuitarAccesorio(accesorio.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!searchAccesorio && accesoriosSeleccionados.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>Agrega los accesorios que necesites</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Sección compartida - Detalles adicionales */}
        <Card>
          <CardBody className="space-y-4">
            <Textarea
              label="Detalles adicionales"
              placeholder="Especificaciones especiales, notas de instalación, etc."
              value={detallesAdicionales}
              onValueChange={setDetallesAdicionales}
              minRows={3}
            />
          </CardBody>
        </Card>
      
      {/* Modal de confirmación de cambio de tab */}
      <Modal isOpen={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar cambio de soporte
          </ModalHeader>
          <ModalBody>
            <p>¿Estás seguro que querés cambiar de soporte?</p>
            <p className="text-sm text-gray-600 mt-2">
              Los accesorios adicionales se limpiarán ya que los productos de riel y barral son específicos y no pueden mezclarse.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={cancelTabChange}>
              Cancelar
            </Button>
            <Button color="primary" onPress={confirmTabChange}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Toast de confirmación */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{toastMessage}</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 text-white hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}