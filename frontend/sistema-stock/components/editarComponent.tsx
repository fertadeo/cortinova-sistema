import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";

interface ModalEditarProps {
  cliente: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ModalEditar: React.FC<ModalEditarProps> = ({ cliente, isOpen, onClose, onSave }) => {
  const [nombre, setNombre] = useState(cliente?.nombre || "");
  const [telefono, setTelefono] = useState(cliente?.telefono || "");
  const [email, setEmail] = useState(cliente?.email || "");
  const [direccion, setDireccion] = useState(cliente?.direccion || "");
  const [dni, setDni] = useState(cliente?.dni || ""); // Nuevo estado para DNI

  useEffect(() => {
    if (cliente) {
      setDni(cliente.dni); // Inicializar el estado de DNI
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono);
      setEmail(cliente.email);
      setDireccion(cliente.direccion);
    }
  }, [cliente]);

  const handleSave = async () => {
    if (cliente) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${cliente.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({dni, nombre, telefono, email, direccion }), // Incluir DNI en la solicitud
        });
        if (!response.ok) {
          throw new Error("Error al actualizar el cliente");
        }
        onSave();
        onClose();
      } catch (error) {
        console.error("Error al actualizar el cliente:", error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="opaque">
      <ModalContent>
        <ModalHeader>Editar datos de cliente</ModalHeader>
        <ModalBody>
        <Input
            fullWidth
            label="DNI o CUIL/CUIT"
            value={dni}
            onChange={(e) => setDni(e.target.value)} // Actualizar el estado del DNI
          />
          <Input
            fullWidth
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            fullWidth
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <Input
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            fullWidth
            label="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
         
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave}>
            Guardar Datos
          </Button>
          <Button color="danger" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalEditar;
