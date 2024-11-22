import React, { useState, useEffect } from "react";
import { Modal,ModalContent,ModalHeader,ModalFooter,Button,Input,Checkbox,Select,SelectItem,Spinner,} from "@nextui-org/react";
import Notification from "./notification";
import { Proveedores } from "@/types/proveedores";



interface OneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void; 
}

const OneProductModal: React.FC<OneProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedores[]>([]);
  const [productData, setProductData] = useState({
    id: "",
    Producto: "",
    Cantidad_stock: "",
    Descripción: "",
    PrecioCosto: "",
    Precio: "",
    Divisa: "ARS",
    Descuento: "",
    proveedor_id: "",
  });
  const [inputValidity, setInputValidity] = useState({
    Producto: true,
    Precio: true,
    proveedor_id: true,
  });
  
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    description: '',
    type: 'success' as 'success' | 'error',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
      fetchNextProductId();
    }
  }, [isOpen]);

  const fetchProveedores = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/proveedores`);
      if (!response.ok) throw new Error("Error al obtener proveedores");
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
    }
  };

  const fetchNextProductId = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos/last-id/obtener`);
      if (!response.ok) throw new Error("Error al obtener el último ID de producto");
      const data = await response.json();
      const lastId = parseInt(data.ultimoId, 10);
      setProductData((prevState) => ({ ...prevState, id: isNaN(lastId) ? "1" : (lastId + 1).toString() }));
    } catch (error) {
      console.error("Error fetching next product ID:", error);
      setProductData((prevState) => ({ ...prevState, id: "1" }));
    }
  };

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountEnabled(event.target.checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setInputValidity((prevValidity) => ({
      ...prevValidity,
      [name]: value.trim() !== "" || name === "Descuento",
    }));
  };

  const validateInputs = () => {
    const newValidity = {
      Producto: productData.Producto.trim() !== "",
      Precio: productData.Precio.trim() !== "",
      proveedor_id: productData.proveedor_id.trim() !== "",
    };
    setInputValidity(newValidity);
    return Object.values(newValidity).every((valid) => valid);
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setIsSaving(true);
    try {
      const productToSend = [{
        id: parseInt(productData.id, 10),
        Producto: productData.Producto,
        Cantidad_stock: productData.Cantidad_stock,
        Descripción: productData.Descripción,
        PrecioCosto: productData.PrecioCosto,
        Precio: productData.Precio,
        Divisa: productData.Divisa,
        Descuento: discountEnabled ? `${productData.Descuento}%` : "0%",
        proveedor_id: parseInt(productData.proveedor_id, 10),
      }];
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos/importar-productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSend),
      });

      if (!response.ok) throw new Error("Error al guardar producto");

      setNotification({
        isVisible: true,
        message: 'Producto agregado correctamente',
        description: '',
        type: 'success',
      });
      setTimeout(handleNotificationClose, 3000);
      onProductAdded();
    } catch (error) {
      console.error("Error al enviar producto:", error);
      setNotification({
        isVisible: true,
        message: 'Ocurrió un error',
        description: 'No se pudo agregar tu producto.',
        type: 'error',
      });
      setTimeout(handleNotificationClose, 3000);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 2000);
    }
  };

  const handleProveedorChange = (id: string) => {
    setProductData((prevState) => ({
      ...prevState,
      proveedor_id: id,
    }));
    setInputValidity((prevValidity) => ({
      ...prevValidity,
      proveedor_id: id.trim() !== "",
    }));
  };

  const handleNotificationClose = () => {
    setNotification((prevState) => ({ ...prevState, isVisible: false }));
  };

  return (
    <Modal size={"2xl"} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Cargar un producto</ModalHeader>
            <div className="flex flex-col gap-4 m-6">
              <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                <Input
                  label="ID/SKU"
                  placeholder="ID Producto Nuevo"
                  name="id"
                  value={productData.id}
                  readOnly
                  labelPlacement="inside"
                />
       </div>
       <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                <Input
                  label="Nombre del Producto"
                  placeholder="Nombre del producto"
                  name="Producto"
                  value={productData.Producto}
                  onChange={handleInputChange}
                  isInvalid={!inputValidity.Producto}
                  labelPlacement="inside"
                />
</div>
<div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                 <Input
                  label="Descripción"
                  placeholder="Descripción del producto"
                  name="Descripción"
                  value={productData.Descripción}
                  onChange={handleInputChange}
                  labelPlacement="inside"
                />
       </div>

              <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
              <Input
                  type="number"
                  label="Precio de Costo/Proveedor"
                  placeholder="0.00"
                  name="PrecioCosto"
                  value={productData.PrecioCosto}
                  onChange={handleInputChange}
                  labelPlacement="inside"
                  startContent={
                    <div className="flex items-center pointer-events-none">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                />

                <Input
                  type="number"
                  label="Precio de Venta"
                  placeholder="0.00"
                  name="Precio"
                  value={productData.Precio}
                  onChange={handleInputChange}
                  isInvalid={!inputValidity.Precio}
                  labelPlacement="inside"
                  startContent={
                    <div className="flex items-center pointer-events-none">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                />
               
              </div>

              <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                <Input
                  type="number"
                  label="Stock Ingresante"
                  placeholder="Cantidad"
                  name="Cantidad_stock"
                  value={productData.Cantidad_stock}
                  onChange={handleInputChange}
                  labelPlacement="inside"
                />

                <Select
                  label="Proveedor"
                  placeholder="Seleccione un proveedor"
                  name="proveedor_id"
                  value={productData.proveedor_id}
                  onChange={(e) => handleProveedorChange(e.target.value)}
                  isInvalid={!inputValidity.proveedor_id}
                  labelPlacement="inside"
                >
                  {proveedores.map((prov) => (
                    <SelectItem key={prov.id} textValue={`${prov.id} ${prov.nombreProveedores}`}>
                      {prov.id} {prov.nombreProveedores}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="flex flex-wrap items-center w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                <Checkbox isSelected={discountEnabled} onChange={handleDiscountChange}>
                  ¿Aplicar descuento?
                </Checkbox>

                <Input
                  type="number"
                  label="Porcentaje de Descuento"
                  placeholder="0"
                  name="Descuento"
                  value={productData.Descuento}
                  onChange={handleInputChange}
                  labelPlacement="inside"
                  disabled={!discountEnabled}
                  startContent={
                    <div className="flex items-center pointer-events-none">
                      <span className="text-default-400 text-small">%</span>
                    </div>
                  }
                />
              </div>
            </div>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button color="primary" onPress={handleSubmit} isDisabled={isSaving}>
                {isSaving ? <Spinner size="sm" color="default"/> : "Guardar Producto"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
      <Notification
        message={notification.message}
        description={notification.description}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
        type={notification.type}
      />
    </Modal>
  );
};

export default OneProductModal;
