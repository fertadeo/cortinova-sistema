"use client"
import { useState, useEffect, useRef } from "react";
import { Button, Input, Select, SelectItem, Card, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Selection, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Alert } from "@heroui/react";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  cuil?: string;
}

interface Medida {
  id: string;
  elemento: string;
  ubicacion: string;
  ubicacionPersonalizada?: string;
  ancho: number;
  alto: number;
  cantidad: number;
  detalles: string;
  medidoPor: string;
  fechaMedicion?: Date;
}

// Opciones de ubicación predefinidas
const UBICACIONES = ["Comedor", "Cocina", "Dormitorio", "Otro"];

// Hook para detectar si es mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

export default function MedidasPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState<string>("");
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: "", type: "" });
  
  // Estados para el modal de nuevo cliente
  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState<{
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    cuil: string;
  }>({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    cuil: "",
  });

  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  const buscadorRef = useRef<HTMLDivElement>(null);
  const [showHeroAlert, setShowHeroAlert] = useState(true);
  const isMobile = useIsMobile();

  // Auto-ocultar alert de éxito después de 5 segundos
  useEffect(() => {
    if (alert.visible && alert.type === 'success') {
      const timer = setTimeout(() => {
        setAlert({ ...alert, visible: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert.visible, alert.type]);

  // Crear una medida por defecto al cargar el componente
  useEffect(() => {
    if (medidas.length === 0) {
      const newMedida: Medida = {
        id: Date.now().toString(),
        elemento: "",
        ubicacion: "",
        ancho: 0,
        alto: 0,
        cantidad: 1,
        detalles: "",
        medidoPor: "",
        fechaMedicion: new Date()
      };
      setMedidas([newMedida]);
    }
  }, [medidas.length]);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (busquedaCliente.trim() === "") {
      setClientesFiltrados([]);
    } else {
      const filtrados = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.telefono.includes(busquedaCliente)
      );
      setClientesFiltrados(filtrados);
    }
  }, [busquedaCliente, clientes]);

  useEffect(() => {
    // Función para cerrar los resultados cuando se hace clic fuera del buscador
    const handleClickOutside = (event: MouseEvent) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };

    // Agregar el event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Limpiar el event listener al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        // Asegurarnos de que cada cliente tenga el formato correcto
        const clientesFormateados = result.data.map((cliente: { 
          id: { toString: () => any; }; 
          nombre: any; 
          telefono: any; 
          email: any;
          direccion: any;
          cuil: any;
        }) => ({
          id: cliente.id.toString(), // Convertir a string para el SelectItem
          nombre: cliente.nombre,
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          direccion: cliente.direccion || '',
          cuil: cliente.cuil || ''
        }));
        setClientes(clientesFormateados);
        setClientesFiltrados(clientesFormateados);
      } else {
        setClientes([]);
        setClientesFiltrados([]);
      }
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
      setClientes([]);
      setClientesFiltrados([]);
      setAlert({
        visible: true,
        message: "Error al cargar los clientes",
        type: "error"
      });
    }
  };

  const handleAddMedida = () => {
    const newMedida: Medida = {
      id: Date.now().toString(),
      elemento: "",
      ubicacion: "",
      ancho: 0,
      alto: 0,
      cantidad: 1,
      detalles: "",
      medidoPor: "",
      fechaMedicion: new Date()
    };
    setMedidas([...medidas, newMedida]);
  };

  const handleUpdateMedida = (id: string, field: keyof Medida, value: string | number | Date) => {
    setMedidas(medidas.map(medida => {
      if (medida.id === id) {
        // Si cambiamos la ubicación a algo que no es "Otro", limpiamos el campo personalizado
        if (field === "ubicacion") {
          const ubicacionValue = value as string; // Aseguramos que sea string
          if (ubicacionValue !== "Otro") {
            return { ...medida, ubicacion: ubicacionValue, ubicacionPersonalizada: "" };
          }
          return { ...medida, ubicacion: ubicacionValue };
        }
        // Para los demás campos, actualizamos normalmente
        return { ...medida, [field]: value };
      }
      return medida;
    }));
  };

  const handleDeleteMedida = (id: string) => {
    setMedidas(medidas.filter(medida => medida.id !== id));
  };

  const handleGuardarNuevoCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
      setAlert({
        visible: true,
        message: "Nombre y teléfono son obligatorios",
        type: "error"
      });
      return;
    }

    try {
      setLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/clientes`;
      console.log("Enviando POST a:", apiUrl);
      console.log("Datos del cliente:", nuevoCliente);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error en la respuesta:", errorData);
        throw new Error("Error al crear el cliente");
      }
      
      const nuevoClienteCreado = await response.json();
      console.log("Cliente creado exitosamente:", nuevoClienteCreado);
      
      // Agregamos el cliente a la lista y lo seleccionamos automáticamente
      const clienteNuevo = {
        id: nuevoClienteCreado.data.id.toString(),
        nombre: nuevoClienteCreado.data.nombre,
        telefono: nuevoClienteCreado.data.telefono || '',
        email: nuevoClienteCreado.data.email || '',
        direccion: nuevoClienteCreado.data.direccion || '',
        cuil: nuevoClienteCreado.data.cuil || ''
      };
      
      setClientes(prev => [...prev, clienteNuevo]);
      setSelectedCliente([clienteNuevo.id]);
      setBusquedaCliente(clienteNuevo.nombre); // Actualizamos el campo de búsqueda
      setShowNuevoClienteModal(false);
      setMostrarResultados(false); // Ocultamos los resultados
      
      setAlert({
        visible: true,
        message: "Cliente creado exitosamente",
        type: "success"
      });
      
      // Limpiar formulario
      setNuevoCliente({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        cuil: "",
      });
      
    } catch (error) {
      console.error("Error al crear cliente:", error);
      setAlert({
        visible: true,
        message: "Error al crear el cliente",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const clienteId = selectedCliente[0];

    if (!clienteId) {
      setAlert({
        visible: true,
        message: "Por favor seleccione un cliente",
        type: "error"
      });
      return;
    }

    if (medidas.length === 0) {
      setAlert({
        visible: true,
        message: "Agregue al menos una medida",
        type: "error"
      });
      return;
    }

    setLoading(true);
    try {
      const promesas = medidas.map(async (medida) => {
        const ubicacionFinal = medida.ubicacion === "Otro" && medida.ubicacionPersonalizada 
          ? medida.ubicacionPersonalizada 
          : medida.ubicacion;

        // Redondeamos los valores de ancho y alto
        const medidaData = {
          elemento: medida.elemento,
          ancho: Math.round(parseFloat(medida.ancho.toString())),
          alto: Math.round(parseFloat(medida.alto.toString())),
          cantidad: parseInt(medida.cantidad.toString()),
          ubicacion: ubicacionFinal,
          detalles: medida.detalles,
          clienteId: parseInt(clienteId.toString()),
          medidoPor: medida.medidoPor || 'No especificado',
          fechaMedicion: new Date().toISOString()
        };

        console.log('Enviando medida:', {
          ...medidaData,
          dimensiones: `${medidaData.ancho}x${medidaData.alto} cm`,
          cliente: clienteId
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medidas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(medidaData),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          throw new Error("Error al guardar la medida");
        }

        return await response.json();
      });

      const resultados = await Promise.all(promesas);
      console.log('Medidas guardadas exitosamente:', resultados);
      
      setAlert({
        visible: true,
        message: "Medidas guardadas exitosamente",
        type: "success"
      });

      // Limpiar el formulario
      setMedidas([]);
      setSelectedCliente([]);
    } catch (error) {
      console.error("Error al guardar las medidas:", error);
      setAlert({
        visible: true,
        message: "Error al guardar las medidas",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Alert flotante para éxito */}
      {alert.visible && alert.type === 'success' && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <Alert
            title={alert.message}
            color="success"
            variant="solid"
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        </div>
      )}

      <div className="flex-1 p-4 w-full max-w-full px-1 sm:px-4 md:px-6 lg:px-8 space-y-6 overflow-y-auto pb-20 md:pb-6">
        {/* Alert de HeroUi solo en desktop */}
        {showHeroAlert && !isMobile && (
          <Alert
            color="success"
            description="Recordá que también podes usar este módulo para tomar medidas desde tu teléfono"
            isVisible={showHeroAlert}
            title="¡Tip!"
            variant="faded"
            onClose={() => setShowHeroAlert(false)}
          />
        )}
        
        {/* Alert para errores (mantiene el comportamiento original) */}
        {alert.visible && alert.type === 'error' && (
          <Alert
            title={alert.message}
            color="danger"
            isVisible={alert.visible}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}

        <Card className="p-6 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center">Tomar Medidas</h1>

          {/* Buscador de Cliente con NextUI */}
          <div className="mb-4 w-full" ref={buscadorRef}>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <Input
                  id="cliente-busqueda"
                  type="text"
                  placeholder="Nombre o teléfono del cliente..."
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setMostrarResultados(true);
                  }}
                  isDisabled={loading}
                  className="w-full"
                  variant="bordered"
                  size="md"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  }
                />
                
                {/* Resultados de búsqueda con estilo NextUI */}
                {mostrarResultados && busquedaCliente.trim() !== "" && clientesFiltrados.length > 0 && (
                  <div className="overflow-y-auto absolute z-50 mt-1 w-full max-h-60 bg-white rounded-lg border shadow-lg">
                    {clientesFiltrados.map((cliente) => (
                      <div 
                        key={cliente.id} 
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCliente.includes(cliente.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedCliente([cliente.id]);
                          setBusquedaCliente(cliente.nombre);
                          setMostrarResultados(false);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedCliente([cliente.id]);
                            setBusquedaCliente(cliente.nombre);
                            setMostrarResultados(false);
                          }
                        }}
                      >
                        <div className="font-medium">{cliente.nombre}</div>
                        <div className="text-sm text-gray-600">{cliente.telefono}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                color="primary"
                onClick={() => setShowNuevoClienteModal(true)}
                isDisabled={loading}
                className="w-full md:w-auto"
              >
                Nuevo Cliente
              </Button>
            </div>
            
            {/* Muestra el cliente seleccionado */}
            {selectedCliente.length > 0 && (
              <div className="p-3 mt-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-medium">
                  Cliente seleccionado: {clientes.find(c => c.id === selectedCliente[0])?.nombre}
                </div>
                <div className="text-sm text-gray-600">
                  Teléfono: {clientes.find(c => c.id === selectedCliente[0])?.telefono}
                </div>
              </div>
            )}
          </div>

          {/* Modal para nuevo cliente */}
          <Modal 
            isOpen={showNuevoClienteModal} 
            onClose={() => setShowNuevoClienteModal(false)}
            placement="center"
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">Agregar Nuevo Cliente</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nombre"
                    placeholder="Nombre completo"
                     
                    onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="Teléfono"
                    placeholder="Número de teléfono"
                    
                    onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                    isRequired
                  />
                  <Input
                    label="Email"
                    placeholder="Correo electrónico (opcional)"
                    type="email"
                    
                    onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                  />
                  <Input
                    label="Dirección"
                    placeholder="Dirección completa (opcional)"
                    
                    onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                  />
                  <Input
                    label="CUIL/CUIT"
                    placeholder="CUIL/CUIT (opcional)"
                   
                    onChange={(e) => setNuevoCliente({...nuevoCliente, cuil: e.target.value})}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => setShowNuevoClienteModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleGuardarNuevoCliente}
                  isLoading={loading}
                >
                  Guardar Cliente
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Lista de Medidas */}
          <div className="mt-6 space-y-4">
            {medidas.map((medida, index) => (
              <Card key={medida.id} className="p-2 md:p-4 shadow-sm rounded-md">
                <div className="space-y-2 md:space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <h3 className="text-base md:text-lg font-semibold">Medida {index + 1}</h3>
                    <div className="w-full md:w-auto flex justify-end">
                      <Button
                        color="danger"
                        variant="flat"
                        size="sm"
                        onClick={() => handleDeleteMedida(medida.id)}
                        className="mt-2 md:mt-0"
                        startContent={isMobile ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        ) : undefined}
                      >
                        {isMobile ? "" : "Eliminar"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    {/* Campo elemento que ocupa todo el espacio */}
                    <div className="w-full">
                      <Input
                        label="Elemento"
                        placeholder="Ej: Ventana comedor, Puerta principal"
                        
                        onChange={(e) => handleUpdateMedida(medida.id, "elemento", e.target.value)}
                        className="max-w-full"
                      />
                    </div>
                  </div>

                  {/* Selector de Ubicación */}
                  <Select
                    label="Ubicación"
                    placeholder="Seleccione ubicación"
                    className="max-w-full"
                    selectedKeys={medida.ubicacion ? new Set([medida.ubicacion]) : new Set([])}
                    onSelectionChange={(keys) => {
                      const selectedValues = Array.from(keys) as string[];
                      if (selectedValues.length > 0) {
                        handleUpdateMedida(medida.id, "ubicacion", selectedValues[0]);
                      }
                    }}
                  >
                    {UBICACIONES.map((ubicacion) => (
                      <SelectItem key={ubicacion} >
                        {ubicacion}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Campo adicional para cuando se selecciona "Otro" */}
                  {medida.ubicacion === "Otro" && (
                    <Input
                      label="Especifique ubicación"
                      placeholder="Ej: Balcón, Estudio"
                      key={medida.ubicacionPersonalizada || ""}
                      onChange={(e) => handleUpdateMedida(medida.id, "ubicacionPersonalizada", e.target.value)}
                      className="max-w-full"
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                    {/* Campo cantidad a la izquierda */}
                    <div>
                      <Input
                        label="Cantidad"
                        type="number"
                        size="sm"
                        min="1"
                        placeholder="1"
                        value={medida.cantidad === 0 ? '' : medida.cantidad.toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            handleUpdateMedida(medida.id, "cantidad", 0);
                          } else {
                            const num = parseInt(val);
                            handleUpdateMedida(medida.id, "cantidad", isNaN(num) || num < 1 ? 1 : num);
                          }
                        }}
                        onBlur={() => {
                          if (medida.cantidad === 0 || isNaN(medida.cantidad)) {
                            handleUpdateMedida(medida.id, "cantidad", 1);
                          }
                        }}
                        className="max-w-full"
                      />
                    </div>
                    <Input
                      label="Ancho (cm)"
                      type="number"
                      value={medida.ancho.toString()}
                      onChange={(e) => handleUpdateMedida(medida.id, "ancho", parseFloat(e.target.value) || 0)}
                      className="max-w-full"
                    />
                    <Input
                      label="Alto (cm)"
                      type="number"
                      value={medida.alto.toString()}
                      onChange={(e) => handleUpdateMedida(medida.id, "alto", parseFloat(e.target.value) || 0)}
                      className="max-w-full"
                    />
                  </div>

                  <Input
                    label="Detalles/Observaciones"
                    placeholder="Detalles adicionales..."
                    value={medida.detalles}
                    onChange={(e) => handleUpdateMedida(medida.id, "detalles", e.target.value)}
                    className="max-w-full"
                  />

                  <Input
                    label="Medido Por"
                    placeholder="Nombre de la persona que tomó las medidas"
                    value={medida.medidoPor}
                    onChange={(e) => handleUpdateMedida(medida.id, "medidoPor", e.target.value)}
                    className="max-w-full"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Botones de Acción - Solo en desktop */}
          <div className="hidden md:flex flex-col md:flex-row gap-2 md:gap-4 mt-6">
            <Button
              color="primary"
              variant="flat"
              fullWidth
              onClick={handleAddMedida}
            >
              Agregar Medida +
            </Button>
            <Button
              color="success"
              fullWidth
              onClick={handleSubmit}
              isLoading={loading}
            >
              Guardar Medidas
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer fijo para mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              fullWidth
              onClick={handleAddMedida}
            >
              Agregar Medida +
            </Button>
            <Button
              color="success"
              fullWidth
              onClick={handleSubmit}
              isLoading={loading}
            >
              Guardar Medidas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 