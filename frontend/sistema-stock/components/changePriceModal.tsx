// ChangePriceModal.tsx

import React, { useState } from "react";
import { Modal, Input, Button, ModalFooter, ModalBody, ModalHeader } from "@nextui-org/react";

type ChangePriceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { proveedor_id: number; porcentaje: number }) => void;
};

const ChangePriceModal: React.FC<ChangePriceModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [proveedorId, setProveedorId] = useState<number>(1); // Proveedor por defecto
  const [porcentaje, setPorcentaje] = useState<number>(0);

  const handleSave = () => {
    // Crear el objeto para enviar
    const data = {
      proveedor_id: proveedorId,
      porcentaje,
    };

    // Llamar a la función onSave con los datos
    onSave(data);
    // Cerrar el modal
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
     
    >
      <ModalHeader>
        <h3>Cambiar Precios por Proveedor</h3>
      </ModalHeader>
      <ModalBody>
        <Input
          type="number"
          label="ID Proveedor"
          value={proveedorId.toString()} // Convert to string
          onChange={(e) => setProveedorId(Number(e.target.value))}
        />
        <Input
          type="number"
          label="Porcentaje (puede ser negativo)"
          value={porcentaje.toString()} // Convert to string
          onChange={(e) => setPorcentaje(Number(e.target.value))}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} >
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChangePriceModal;
