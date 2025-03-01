"use client"
import { useState, useEffect } from "react";
import { Button, Input, Select, SelectItem, Card, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Alert } from "@/components/shared/alert";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
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
  const [selectedCliente, setSelectedCliente] = useState<string>("");
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
  }>({
    nombre: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (busquedaCliente.trim() === "") {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.telefono.includes(busquedaCliente)
      );
      setClientesFiltrados(filtrados);
    }
  }, [busquedaCliente, clientes]);

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`);
      const data = await response.json();
      setClientes(data);
      setClientesFiltrados(data);
    } catch (error) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      });

      if (!response.ok) throw new Error("Error al crear el cliente");
      
      const nuevoClienteCreado = await response.json();
      
      setClientes(prev => [...prev, nuevoClienteCreado]);
      setSelectedCliente(nuevoClienteCreado.id);
      setShowNuevoClienteModal(false);
      
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
      });
      
    } catch (error) {
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
    if (!selectedCliente) {
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
      // Crear un array de promesas para enviar cada medida individualmente
      const promesas = medidas.map(async (medida) => {
        // Determinar la ubicación final (normal o personalizada)
        const ubicacionFinal = medida.ubicacion === "Otro" && medida.ubicacionPersonalizada 
          ? medida.ubicacionPersonalizada 
          : medida.ubicacion;

        // Crear el objeto de medida en el formato requerido
        const medidaData = {
          elemento: medida.elemento,
          ancho: parseFloat(medida.ancho.toString()),
          alto: parseFloat(medida.alto.toString()),
          cantidad: parseInt(medida.cantidad.toString()),
          ubicacion: ubicacionFinal,
          detalles: medida.detalles,
          clienteId: parseInt(selectedCliente),
          medidoPor: medida.medidoPor
        };

        // Enviar la medida al backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medidas/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(medidaData),
        });

        if (!response.ok) throw new Error("Error al guardar la medida");
        return response.json();
      });

      // Esperar a que todas las medidas se guarden
      await Promise.all(promesas);
      
      setAlert({
        visible: true,
        message: "Medidas guardadas exitosamente",
        type: "success"
      });
      setMedidas([]);
      setSelectedCliente("");
    } catch (error) {
      setAlert({
        visible: true,
        message: "Error al guardar las medidas",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSelectChange = (value: string) => {
    if (value === "nuevo_cliente") {
      setShowNuevoClienteModal(true);
    } else {
      setSelectedCliente(value);
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

      <h1 className="mb-6 text-2xl font-bold text-center">Tomar Medidas</h1>

      {/* Selector de Cliente con búsqueda */}
      <Select
        label="Seleccionar Cliente"
        placeholder="Buscar cliente..."
        className="max-w-full"
        value={selectedCliente}
        onValueChange={handleClienteSelectChange}
        isDisabled={loading}
        startContent={
          <i className="text-sm text-gray-500 pi pi-search"></i>
        }
        onSelectionChange={() => {}}
        onOpenChange={() => {}}
        onSearchChange={(value) => setBusquedaCliente(value)}
      >
        {clientesFiltrados.map((cliente) => (
          <SelectItem key={cliente.id} value={cliente.id}>
            {cliente.nombre} - {cliente.telefono}
          </SelectItem>
        ))}
        <SelectItem key="nuevo_cliente" value="nuevo_cliente" className="font-bold text-primary">
          + Crear nuevo cliente
        </SelectItem>
      </Select>

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
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                isRequired
              />
              <Input
                label="Teléfono"
                placeholder="Número de teléfono"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                isRequired
              />
              <Input
                label="Email"
                placeholder="Correo electrónico (opcional)"
                type="email"
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
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
      <div className="space-y-4">
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
                    value={medida.elemento}
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
                value={medida.ubicacion}
                onChange={(e) => handleUpdateMedida(medida.id, "ubicacion", e.target.value)}
              >
                {UBICACIONES.map((ubicacion) => (
                  <SelectItem key={ubicacion} value={ubicacion}>
                    {ubicacion}
                  </SelectItem>
                ))}
              </Select>

              {/* Campo adicional para cuando se selecciona "Otro" */}
              {medida.ubicacion === "Otro" && (
                <Input
                  label="Especifique ubicación"
                  placeholder="Ej: Balcón, Estudio"
                  value={medida.ubicacionPersonalizada || ""}
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
      <div className="fixed right-0 bottom-0 left-0 p-4 bg-white border-t shadow-lg md:relative md:border-none md:shadow-none md:p-0">
        <div className="flex gap-4 mx-auto max-w-3xl">
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
      </div>
    </div>
  );
} 