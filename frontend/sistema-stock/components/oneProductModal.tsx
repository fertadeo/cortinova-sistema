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
  const [productData, setProductData] = useState({
    id: "",
    nombreProducto: "",
    descripcion: "",
    precio: "",
    stock: "",
    proveedor: "",
    descuento: ""
  });

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountEnabled(event.target.checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log(JSON.stringify(productData, null, 2));
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
                  name="id"
                  value={productData.id}
                  onChange={handleInputChange}
                  labelPlacement="outside"
                />

                {/* Nombre del Producto */}
                <Input
                  label="Nombre del Producto"
                  placeholder="Nombre del producto"
                  name="nombreProducto"
                  value={productData.nombreProducto}
                  onChange={handleInputChange}
                  labelPlacement="outside"
                />
              </div>

              <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                {/* Descripción */}
                <Input
                  label="Descripción"
                  placeholder="Descripción del producto"
                  name="descripcion"
                  value={productData.descripcion}
                  onChange={handleInputChange}
                  labelPlacement="outside"
                />

                {/* Precio */}
                <Input
                  type="number"
                  label="Precio"
                  placeholder="0.00"
                  name="precio"
                  value={productData.precio}
                  onChange={handleInputChange}
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
                  name="stock"
                  value={productData.stock}
                  onChange={handleInputChange}
                  labelPlacement="outside"
                />

                {/* Proveedor */}
                <Select
                  label="Proveedor"
                  placeholder="Seleccione un proveedor"
                  name="proveedor"
                  value={productData.proveedor}
                  onChange={handleInputChange}
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
                  name="descuento"
                  value={productData.descuento}
                  onChange={handleInputChange}
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
              <Button color="primary" onPress={handleSubmit}>
                Guardar Producto
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OneProductModal;
