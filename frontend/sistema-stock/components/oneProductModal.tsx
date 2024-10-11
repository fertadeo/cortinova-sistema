// components/OneProductModal.tsx

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input, 
  Checkbox, 
  Select, 
  SelectItem,
} from "@nextui-org/react";

interface OneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OneProductModal: React.FC<OneProductModalProps> = ({ isOpen, onClose }) => {
  const [discountEnabled, setDiscountEnabled] = useState(false);




  const handleDiscountChange = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
    setDiscountEnabled(event.target.checked);
  };

  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Cargar un producto</ModalHeader>
            <div className="flex flex-col gap-4 m-6">
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        {/* ID/SKU */}
        <Input
          label="ID/SKU"
          placeholder="123456"
          labelPlacement="outside"
        />

        {/* Nombre del Producto */}
        <Input
          label="Nombre del Producto"
          placeholder="Nombre del producto"
          labelPlacement="outside"
        />
      </div>

      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        {/* Descripción */}
        <Input
          label="Descripción"
          placeholder="Descripción del producto"
          labelPlacement="outside"
        />

        {/* Precio */}
        <Input
          type="number"
          label="Precio"
          placeholder="0.00"
          labelPlacement="outside"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">$</span>
            </div>
          }
        />
      </div>

      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        {/* Stock ingresante */}
        <Input
          type="number"
          label="Stock Ingresante"
          placeholder="Cantidad"
          labelPlacement="outside"
        />

        {/* Proveedor */}
        <Select
          label="Proveedor"
          placeholder="Seleccione un proveedor"
          labelPlacement="outside"
        >
          <SelectItem key="proveedor1">Proveedor 1</SelectItem>
          <SelectItem key="proveedor2">Proveedor 2</SelectItem>
          <SelectItem key="proveedor3">Proveedor 3</SelectItem>
        </Select>
      </div>

      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4 items-center">
        {/* Checkbox de descuento */}
        <Checkbox
          isSelected={discountEnabled}
          onChange={handleDiscountChange}
        >
          ¿Aplicar descuento?
        </Checkbox>

        {/* Input de porcentaje de descuento */}
        <Input
          type="number"
          label="Porcentaje de Descuento"
          placeholder="0%"
          labelPlacement="outside"
          disabled={!discountEnabled}
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">%</span>
            </div>
          }
        />
      </div>
    </div>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Action
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OneProductModal;
