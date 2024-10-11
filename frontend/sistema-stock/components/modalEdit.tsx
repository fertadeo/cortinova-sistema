'use client'
import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure } from "@nextui-org/react";

type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
};

type ModalEditProps = {
  cliente: Cliente | null;
  onUpdateCliente: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const ModalEdit: React.FC<ModalEditProps> = ({ cliente, onUpdateCliente, isOpen, onClose }) => {
  const [nombre, setNombre] = useState(cliente?.nombre || "");
  const [telefono, setTelefono] = useState(cliente?.telefono || "");
  const [email, setEmail] = useState(cliente?.email || "");
  const [direccion, setDireccion] = useState(cliente?.direccion || "");

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono);
      setEmail(cliente.email);
      setDireccion(cliente.direccion);
    }
    console.log('desde modalEdit', cliente)
  }, [cliente]);

  const handleSave = async () => {
    if (cliente) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${cliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, telefono, email, direccion }),
          
        });
        if (!response.ok) {
          throw new Error('Error al actualizar el cliente');
        }
        onUpdateCliente();
        onClose();
      } catch (error) {
         console.error('Error al actualizar el cliente:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="absolute z-50 max-w-lg">
      <ModalHeader> <p>Edita el Cliente</p></ModalHeader>
      <ModalBody>
        <Input
          isClearable
          fullWidth
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <Input
          isClearable
          fullWidth
          label="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <Input
          isClearable
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          isClearable
          fullWidth
          label="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalEdit;