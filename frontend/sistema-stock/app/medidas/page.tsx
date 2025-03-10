"use client"
import { useState, useEffect, useRef } from "react";
import { Button, Input, Select, SelectItem, Card, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Selection, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Alert } from "@/components/shared/alert";

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
    <div className="p-4 mx-auto space-y-6 max-w-3xl">
      <Alert
        message={alert.message}
        variant={alert.type as "success" | "error"}
        onClose={() => setAlert({ ...alert, visible: false })}
        className={alert.visible ? "block" : "hidden"}
      />

      <Card className="p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Tomar Medidas</h1>

        {/* Buscador de Cliente con NextUI */}
        <div className="mb-4 w-full" ref={buscadorRef}>
          <div className="flex flex-col mb-2">
            <label htmlFor="cliente-busqueda" className="mb-1 text-sm font-medium">Buscar Cliente</label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                id="cliente-busqueda"
                type="text"
                placeholder="Nombre o teléfono del cliente..."
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setMostrarResultados(true);
                }}
                onFocus={() => setMostrarResultados(true)}
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
            <Card key={medida.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Medida {index + 1}</h3>
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onClick={() => handleDeleteMedida(medida.id)}
                  >
                    Eliminar
                  </Button>
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

                <div className="grid grid-cols-3 gap-4">
                  {/* Campo cantidad a la izquierda */}
                  <div>
                    <Input
                      label="Cantidad"
                      type="number"
                      size="sm"
                      min="1"
                      value={medida.cantidad.toString()}
                      onChange={(e) => handleUpdateMedida(medida.id, "cantidad", parseInt(e.target.value) || 1)}
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

        {/* Botones de Acción */}
        <div className="flex gap-4 mt-6">
          <Button
            color="primary"
            variant="light"
            fullWidth
            onClick={handleAddMedida}
          >
            Agregar Medida
          </Button>
          <Button
            color="primary"
            fullWidth
            onClick={handleSubmit}
            isLoading={loading}
          >
            Guardar Medidas
          </Button>
        </div>
      </Card>
    </div>
  );
} 