import React, { useState, useEffect } from "react";
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
import Notification from "./notification";





interface Proveedor {
  id: string;
  nombreProveedores: string;
}

interface OneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OneProductModal: React.FC<OneProductModalProps> = ({ isOpen, onClose }) => {
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productData, setProductData] = useState({
    id: "",
    Producto: "",
    Cantidad_stock: "",
    Descripción: "",
    Precio: "",
    Divisa: "USD",
    Descuento: "",
    proveedor_id: "",
  });



  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    description: '',
    type: 'success' as 'success' | 'error',
  });

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
      if (!isNaN(lastId)) {
        const nextId = lastId + 1;
        setProductData((prevState) => ({ ...prevState, id: nextId.toString() }));
      } else {
        console.error("El valor de 'ultimoID' no es un número válido:", data.ultimoID);
        setProductData((prevState) => ({ ...prevState, id: "1" }));
      }
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
  };

  const handleSubmit = async () => {
    try {
        const productToSend = [{
            id: parseInt(productData.id, 10),
            Producto: productData.Producto,
            Cantidad_stock: productData.Cantidad_stock,
            Descripción: productData.Descripción,
            Precio: productData.Precio,
            Divisa: productData.Divisa,
            Descuento: discountEnabled ? `${productData.Descuento}%` : "0%",
            proveedor_id: parseInt(productData.proveedor_id, 10),
        }];
        console.log(productToSend);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/productos/importar-productos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productToSend),
        });
        console.log(response);
     
        if (!response.ok) throw new Error("Error al guardar producto");
      
        // Muestra notificación de éxito
        setNotification({
            isVisible: true,
            message: 'Producto agregado correctamente',
            description: '',
            type: 'success',
        });
        
        // Cierra la notificación automáticamente después de 3 segundos
        setTimeout(handleNotificationClose, 3000);
        
        // Es importante que el cierre del modal se realice después de la notificación
        // Puedes decidir cuándo cerrar el modal, tal vez al cierre de la notificación
        // onClose(); // Si deseas cerrar el modal aquí, asegúrate de que no interrumpa la notificación

    } catch (error) {
        console.error("Error al enviar producto:", error);
        // Muestra notificación de error
        setNotification({
            isVisible: true,
            message: 'Ocurrió un error',
            description: 'No se pudo agregar tu producto.',
            type: 'error',
        });

        // Cierra la notificación automáticamente después de 3 segundos
        setTimeout(handleNotificationClose, 3000);
    }
};




  const handleProveedorChange = (id: string) => {
    setProductData((prevState) => ({
      ...prevState,
      proveedor_id: id,
    }));
  };


    // Manejo de cierre de notificación
    const handleNotificationClose = () => {
      setNotification((prevState) => ({ ...prevState, isVisible: false }));
    };
  

  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Cargar un producto</ModalHeader>
            <div className="flex flex-col gap-4 m-6">
              <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                <Input
                  label="ID/SKU"
                  placeholder="Generando ID..."
                  name="id"
                  value={productData.id}
                  readOnly
                  labelPlacement="outside"
                />

                <Input
                  label="Nombre del Producto"
                  placeholder="Nombre del producto"
                  name="Producto"
                  value={productData.Producto}
                  onChange={handleInputChange}
                  labelPlacement="outside"
                />
              </div>

              <div className="flex flex-wrap w-full gap-4 mb-6 md:flex-nowrap md:mb-0">
                <Input
                  label="Descripción"
                  placeholder="Descripción del producto"
                  name="Descripción"
                  value={productData.Descripción}
                  onChange={handleInputChange}
                  labelPlacement="outside"
                />

                <Input
                  type="number"
                  label="Precio"
                  placeholder="0.00"
                  name="Precio"
                  value={productData.Precio}
                  onChange={handleInputChange}
                  labelPlacement="outside"
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
                  labelPlacement="outside"
                />

                <Select
                  label="Proveedor"
                  placeholder="Seleccione un proveedor"
                  name="proveedor_id"
                  value={productData.proveedor_id}
                  onChange={(e) => handleProveedorChange(e.target.value)}
                  labelPlacement="outside"
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
                  placeholder="0%"
                  name="Descuento"
                  value={productData.Descuento}
                  onChange={handleInputChange}
                  labelPlacement="outside"
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
                Close
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Guardar Producto
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
