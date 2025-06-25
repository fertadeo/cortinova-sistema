import React, { useState, useEffect, useRef } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Spinner
} from "@heroui/react";
import { Product } from "@/types/productos";
import { Proveedores } from "@/types/proveedores";
import type { Selection } from "@react-types/shared";

const ModalPriceUpdater: React.FC<{ isOpen: boolean; onClose: () => void; onRefreshProducts?: () => void }> = ({ isOpen, onClose, onRefreshProducts }) => {
  const [proveedores, setProveedores] = useState<Proveedores[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [porcentaje, setPorcentaje] = useState("");
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const lastKeysRef = useRef<any>(null);

  const handleModalClose = () => {
    resetModal();
    onClose(); 
  };

  const resetModal = () => {
    setSelectedProveedor("");
    setFilteredProducts([]);
    setPorcentaje("");
    setUpdatedProducts([]);
    setSelectedKeys(new Set());
    setErrorMessage(null);
    setShowAlert(false);
  };

  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proveedores/`);
      if (!response.ok) {
        throw new Error('Error al obtener proveedores');
      }
      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      console.error('Error fetching proveedores:', err);
      setErrorMessage('Error al obtener la data de proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductosPorProveedor = async (proveedorId: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/proveedor/${proveedorId}`);
      if (!response.ok) {
        throw new Error('Error al obtener productos del proveedor');
      }
      
      const data = await response.json();
  
      if (data.productos && data.productos.length === 0) {
        setFilteredProducts([]);
        setErrorMessage("No se encontraron productos para este proveedor.");
      } else if (data.productos) {
        setFilteredProducts(data.productos);
        setErrorMessage(null);
      } else {
        setFilteredProducts([]);
        setErrorMessage("No se obtuvieron productos, intente nuevamente.");
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
      setFilteredProducts([]);
      setErrorMessage("No se pudieron obtener los productos. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedProveedor && selectedProveedor !== 'all') {
      const proveedorId = selectedProveedor;
      if (proveedorId) {
        setTimeout(() => {
          fetchProductosPorProveedor(proveedorId);
          setSelectedKeys(new Set());
          setShowAlert(false);
        }, 100);
      }
    } else if (isOpen) {
      setFilteredProducts([]);
      setSelectedKeys(new Set());
      setShowAlert(false);
    }
  }, [selectedProveedor, isOpen]);

  const roundPrice = (price: number) => (price < 100 ? Math.ceil(price / 10) * 10 : Math.ceil(price / 100) * 100);

  const updatePrices = () => {
    if (!porcentaje || filteredProducts.length === 0) return;
    
    const percentage = parseFloat(porcentaje);
  
    const updated = filteredProducts.map((product) => {
      const precioOriginal = Number(product.precio);
      const newPrice = precioOriginal * (1 + percentage / 100);
      const roundedPrice = roundPrice(newPrice);

      return {
        ...product,
        precioOriginal: product.precio,
        precio: product.precio,
        precioNuevo: roundedPrice.toString()
      } as unknown as Product;
    });

    setUpdatedProducts(updated);
  };

  useEffect(() => {
    updatePrices();
  }, [porcentaje, filteredProducts]);

  const handlePorcentajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setPorcentaje(value);
      setErrorMessage(null);
    } else {
      setErrorMessage("Por favor, ingrese solo números.");
    }
  };

  const handleSelectionChange = (keys: Selection) => {
    if (typeof keys === "string" && keys === "all") {
      setSelectedKeys(new Set(filteredProducts.map(p => String(p.id))));
      setShowAlert(filteredProducts.length > 0);
    } else {
      setSelectedKeys(keys as unknown as Set<string>);
      setShowAlert((keys as unknown as Set<string>).size > 0);
    }
  };
  const handleSubmit = async () => {
    if (typeof selectedKeys === "string") {
      setErrorMessage("No hay productos seleccionados para actualizar.");
      return;
    }
    if (selectedKeys.size === 0) {
      setErrorMessage("No hay productos seleccionados para actualizar.");
      return;
    }

    const selectedArray = Array.from(selectedKeys as Set<React.Key>).map(String);
    const selectedProducts = filteredProducts.filter(product =>
      selectedArray.includes(String(product.id))
    );

    const productosParaGuardar = selectedProducts.map((product) => {
      const updatedProduct = updatedProducts.find((p) => p.id === product.id);
      const precioNuevo = updatedProduct?.precioNuevo || product.precio;

      return {
        id: product.id,
        Producto: product.nombreProducto,
        Precio: precioNuevo,
      };
    });

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/actualizar-precios/1`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productosParaGuardar),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los precios. Intenta nuevamente.");
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      setSelectedKeys(new Set());
      setShowAlert(false);

      if (onRefreshProducts) onRefreshProducts();

      handleModalClose();
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setErrorMessage("Ocurrió un error al actualizar los precios.");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: "nombreProducto", label: "NOMBRE" },
    { key: "precio", label: "PRECIO ACTUAL" },
    {
      key: "precioNuevo",
      label: "PRECIO NUEVO",
      cell: (product: Product) => product.precioNuevo ? `$${product.precioNuevo}` : "-",
    },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose}
      isDismissable={!isLoading}
      size="3xl" 
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh] overflow-y-auto p-4 md:p-8",
        wrapper: "p-0",
        body: "p-0",
        header: "p-0 pb-2",
        footer: "p-0 pt-2"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-lg md:text-xl">
          Actualizar Precios por Proveedor
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {isLoading && !filteredProducts.length ? (
              <div className="flex justify-center items-center h-32">
                <Spinner label="Cargando..." />
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="text-center text-danger p-2 bg-danger-50 rounded">
                    {errorMessage}
                  </div>
                )}
                <label htmlFor="proveedor" className="block text-sm font-medium mb-1">Seleccionar Proveedor</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedProveedor}
                  onChange={e => setSelectedProveedor(e.target.value)}
                >
                  <option value="">Seleccione un proveedor</option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombreProveedores}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  label="Porcentaje de aumento"
                  placeholder="Ingrese el porcentaje"
                  value={porcentaje}
                  onChange={handlePorcentajeChange}
                  startContent="%"
                  size="md"
                  className="w-full"
                />

                {filteredProducts.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table
                      aria-label="Tabla de productos"
                      selectionMode="multiple"
                      selectedKeys={selectedKeys}
                      onSelectionChange={handleSelectionChange}
                      className="min-w-full"
                    >
                      <TableHeader>
                        {columns.map((column) => (
                          <TableColumn key={column.key}>{column.label}</TableColumn>
                        ))}
                      </TableHeader>
                      <TableBody items={updatedProducts.length ? updatedProducts : filteredProducts}>
                        {(item: Product) => (
                          <TableRow key={String(item.id)}>
                            <TableCell>{item.nombreProducto}</TableCell>
                            <TableCell>${item.precio}</TableCell>
                            <TableCell>{item.precioNuevo ? `$${item.precioNuevo}` : '-'}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {!isLoading && filteredProducts.length === 0 && selectedProveedor !== 'all' && selectedProveedor !== "" && (
                  <div className="text-center text-gray-500 p-4">
                    No hay productos disponibles para este proveedor.
                  </div>
                )}
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col gap-2">
          {showAlert && (
            <div className="relative px-4 py-3 w-full text-teal-700 bg-teal-100 rounded border border-teal-300">
              <strong className="font-bold">
                Vas a modificar {typeof selectedKeys === 'object' ? selectedKeys.size : selectedKeys === 'all' ? filteredProducts.length : 0}{" "}
                {(typeof selectedKeys === 'object' ? selectedKeys.size : selectedKeys === 'all' ? filteredProducts.length : 0) === 1 ? "producto" : "productos"}.
              </strong>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              color="danger" 
              variant="light"
              onPress={handleModalClose}
              className="w-full sm:w-auto"
              size="md"
            >
              Cerrar
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmit} 
              disabled={isLoading || (typeof selectedKeys === 'object' ? selectedKeys.size === 0 : selectedKeys === 'all' ? filteredProducts.length === 0 : true)}
              className="w-full sm:w-auto"
              size="md"
            >
              {isLoading ? <Spinner size="sm" color="default"/> : "Guardar Cambios"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalPriceUpdater;