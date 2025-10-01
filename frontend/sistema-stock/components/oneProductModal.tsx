import React, { useState, useEffect } from "react";
import { Modal,ModalContent,ModalHeader,ModalFooter,Button,Input,Checkbox,Select,SelectItem,Spinner,ModalBody} from "@heroui/react";
import { Proveedores } from "@/types/proveedores";



interface OneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  onShowNotification?: (message: string, description: string, type: 'success' | 'error') => void;
}

const OneProductModal: React.FC<OneProductModalProps> = ({ isOpen, onClose, onProductAdded, onShowNotification }) => {
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedores[]>([]);
  const [sistemas, setSistemas] = useState<{ id: number; nombreSistemas: string }[]>([]);
  const [rubros, setRubros] = useState<{ id: number; nombreRubros: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState({
    id: "",
    Producto: "",
    Cantidad_stock: "",
    Descripción: "",
    PrecioCosto: "",
    Precio: "",
    Divisa: "ARS",
    proveedor_id: "",
    rubro_id: "",
    sistema_id: "",
  });
  const [inputValidity, setInputValidity] = useState({
    Producto: true,
    Precio: true,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const fetchProveedores = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/proveedores`);
      if (!response.ok) {
        throw new Error(`Error al obtener proveedores: ${response.status}`);
      }
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
    }
  };

  const fetchSistemas = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/sistemas`);
      if (!response.ok) {
        throw new Error(`Error al obtener sistemas: ${response.status}`);
      }
      const data = await response.json();
      console.log("Respuesta de sistemas desde el backend:", data);
      const arraySistemas = Array.isArray(data.data) ? data.data : [];
      setSistemas(arraySistemas);
    } catch (error) {
      console.error("Error fetching sistemas:", error);
      setSistemas([]);
    }
  };

  const fetchRubros = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/rubros`);
      if (!response.ok) {
        throw new Error(`Error al obtener rubros: ${response.status}`);
      }
      const data = await response.json();
      console.log("Respuesta de rubros desde el backend:", data);
      const arrayRubros = Array.isArray(data.data) ? data.data : [];
      setRubros(arrayRubros);
    } catch (error) {
      console.error("Error fetching rubros:", error);
      setRubros([]);
    }
  };

  const fetchNextProductId = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos/last-id/obtener`);
      if (!response.ok) {
        throw new Error(`Error al obtener el último ID de producto: ${response.status}`);
      }
      const data = await response.json();
      const lastId = parseInt(data.ultimoId, 10);
      setProductData((prevState) => ({ ...prevState, id: isNaN(lastId) ? "1" : (lastId + 1).toString() }));
    } catch (error) {
      console.error("Error fetching next product ID:", error);
      setProductData((prevState) => ({ ...prevState, id: "1" }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchProveedores();
      fetchNextProductId();
      fetchSistemas();
      fetchRubros();
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountEnabled(event.target.checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Solo validar campos que están en inputValidity
    if (name === "Producto" || name === "Precio") {
      setInputValidity((prevValidity) => ({
        ...prevValidity,
        [name]: value.trim() !== "",
      }));
    }
  };

  const validateInputs = () => {
    const newValidity = {
      Producto: productData.Producto.trim() !== "",
      Precio: productData.Precio.trim() !== "",
    };
    setInputValidity(newValidity);
    return Object.values(newValidity).every((valid) => valid);
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setIsSaving(true);
    try {
      // Enviar como objeto simple de un solo producto
      const productToSend = {
        id: parseInt(productData.id, 10),
        nombreProducto: productData.Producto,
        cantidad_stock: productData.Cantidad_stock ? parseInt(productData.Cantidad_stock, 10) : 0,
        descripcion: productData.Descripción,
        precioCosto: productData.PrecioCosto ? parseFloat(productData.PrecioCosto) : 0,
        precio: parseFloat(productData.Precio),
        descuento: 0,
        proveedor_id: productData.proveedor_id ? parseInt(productData.proveedor_id, 10) : null,
        rubro_id: productData.rubro_id ? parseInt(productData.rubro_id, 10) : null,
        sistema_id: productData.sistema_id ? parseInt(productData.sistema_id, 10) : null,
      };
      
      console.log("Enviando producto al backend:", productToSend);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos/crear-producto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSend),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error("Error al guardar producto");
      }

      // Mostrar notificación de éxito
      if (onShowNotification) {
        onShowNotification(
          'Producto agregado correctamente',
          'El producto se ha guardado exitosamente.',
          'success'
        );
      }
      
      // Cerrar modal y refrescar productos
      onProductAdded();
      onClose();
      
    } catch (error) {
      console.error("Error al enviar producto:", error);
      // Mostrar notificación de error
      if (onShowNotification) {
        onShowNotification(
          'Ocurrió un error',
          'No se pudo agregar tu producto.',
          'error'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleProveedorChange = (id: string) => {
    setProductData((prevState) => ({
      ...prevState,
      proveedor_id: id,
    }));
  };

  return (
    <Modal 
      size="2xl" 
      isOpen={isOpen} 
      onClose={onClose}
      isDismissable={!isLoading}
      classNames={{
        base: "max-h-[90vh] overflow-y-auto",
        wrapper: "p-4",
        body: "p-0",
        header: "p-6 pb-2",
        footer: "p-6 pt-2"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-lg md:text-xl">
              Cargar un producto
            </ModalHeader>
            
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Spinner label="Cargando..." />
                </div>
              ) : (
                <div className="flex flex-col gap-4 px-6 pb-6">
                  {/* ID/SKU - Full width en mobile, half en desktop */}
                  <div className="w-full">
                    <Input
                      label="ID/SKU"
                      placeholder="ID Producto Nuevo"
                      name="id"
                      value={productData.id}
                      readOnly
                      labelPlacement="outside"
                      size="md"
                      className="w-full"
                    />
                  </div>

                  {/* Nombre del Producto - Full width */}
                  <div className="w-full">
                    <Input
                      label="Nombre del Producto"
                      placeholder="Nombre del producto"
                      name="Producto"
                      value={productData.Producto}
                      onChange={handleInputChange}
                      isInvalid={!inputValidity.Producto}
                      labelPlacement="outside"
                      size="md"
                      className="w-full"
                    />
                  </div>

                  {/* Descripción - Full width */}
                  <div className="w-full">
                    <Input
                      label="Descripción"
                      placeholder="Descripción del producto"
                      name="Descripción"
                      value={productData.Descripción}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                      size="md"
                      className="w-full"
                    />
                  </div>

                  {/* Precios - Stack en mobile, side by side en desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Precio de Costo/Proveedor"
                      placeholder="0.00"
                      name="PrecioCosto"
                      value={productData.PrecioCosto}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                      size="md"
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
                      labelPlacement="outside"
                      size="md"
                      startContent={
                        <div className="flex items-center pointer-events-none">
                          <span className="text-default-400 text-small">$</span>
                        </div>
                      }
                    />
                  </div>

                  {/* Stock y Proveedor - Stack en mobile, side by side en desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Stock Ingresante"
                      placeholder="Cantidad"
                      name="Cantidad_stock"
                      value={productData.Cantidad_stock}
                      onChange={handleInputChange}
                      labelPlacement="outside"
                      size="md"
                    />

                    {/* Proveedor - Full width */}
                    <div className="w-full">
                      <label htmlFor="proveedor" className="block text-sm font-medium mb-1">Proveedor</label>
                      <select
                        id="proveedor"
                        name="proveedor_id"
                        className="w-full border rounded px-3 py-2"
                        value={productData.proveedor_id}
                        onChange={e => handleProveedorChange(e.target.value)}
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map(prov => (
                          <option key={prov.id} value={prov.id}>
                            {prov.nombreProveedores}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Rubro y Sistema - Stack en mobile, side by side en desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                      <label htmlFor="rubro_id" className="block text-sm font-medium mb-1">Rubro</label>
                      <select
                        id="rubro_id"
                        name="rubro_id"
                        className="w-full border rounded px-3 py-2"
                        value={productData.rubro_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione un rubro</option>
                        {Array.isArray(rubros) && rubros
                          .slice()
                          .sort((a, b) => a.id - b.id)
                          .map(rubro => (
                            <option key={rubro.id} value={rubro.id}>{rubro.id} - {rubro.nombreRubros}</option>
                          ))}
                      </select>
                    </div>
                    <div className="w-full">
                      <label htmlFor="sistema_id" className="block text-sm font-medium mb-1">Sistema</label>
                      <select
                        id="sistema_id"
                        name="sistema_id"
                        className="w-full border rounded px-3 py-2"
                        value={productData.sistema_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccione un sistema</option>
                        {Array.isArray(sistemas) && sistemas
                          .slice()
                          .sort((a, b) => a.id - b.id)
                          .map(sis => (
                            <option key={sis.id} value={sis.id}>{sis.id} - {sis.nombreSistemas}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
                className="w-full sm:w-auto"
                size="md"
              >
                Cerrar
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit} 
                isDisabled={isSaving}
                className="w-full sm:w-auto"
                size="md"
              >
                {isSaving ? <Spinner size="sm" color="default"/> : "Guardar Producto"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default OneProductModal;
