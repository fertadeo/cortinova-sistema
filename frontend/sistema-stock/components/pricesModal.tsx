import React, { useState, useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Select, SelectItem, Input, Button, Spinner, Selection
} from "@nextui-org/react";
import { Product } from "@/types/productos";
import { Proveedores } from "@/types/proveedores";

const ModalPriceUpdater: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [proveedores, setProveedores] = useState<Proveedores[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<Selection>(new Set([]));
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [porcentaje, setPorcentaje] = useState("");
  const [updatedProducts, setUpdatedProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);



  const handleModalClose = () => {
    onClose(); 
    resetModal(); 
  };


  const resetModal = () => {
    setSelectedProveedor(new Set([]));
    setFilteredProducts([]);
    setPorcentaje("");
    setUpdatedProducts([]);
    setSelectedProducts([]);
    setErrorMessage(null);
    setShowAlert(false);
    setError(null);
  };


  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proveedores/`);
      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      setError('btener la data de proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductosPorProveedor = async (proveedorId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/proveedor/${proveedorId}`);
      const data = await response.json();
  
      if (data.productos.length === 0) {
        // Si no hay productos, mostrar el mensaje correspondiente
        setFilteredProducts([]);
        setErrorMessage("No se obtuvieron productos, cierre la ventana y realice una nueva búsqueda.");
  
        // Resetear el estado después de 4 segundos
        setTimeout(() => {
          setErrorMessage(null);
          setFilteredProducts([]);
          setSelectedProveedor(new Set([])); // Resetear la selección del proveedor
        }, 4000);
      } else {
        setFilteredProducts(data.productos);
        setErrorMessage(null);
      }
    } catch (err) {
      setError("No se obtuvieron productos, cierre la ventana y realice una nueva búsqueda.");
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
    } else {
      // Resetear todos los estados cuando se cierra el modal
      resetModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {

      setSelectedProveedor(new Set([]));
      setFilteredProducts([]);
      setPorcentaje("");
      setUpdatedProducts([]);
      setSelectedProducts([]);
      setErrorMessage(null);
      setShowAlert(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Convert the Selection (Set) to a string
    const proveedorId = selectedProveedor === 'all'
      ? ''
      : Array.from(selectedProveedor)[0] as string;

    if (proveedorId) {
      fetchProductosPorProveedor(proveedorId);
      setSelectedProducts([]); // Limpiar selección de productos al cambiar de proveedor
      setShowAlert(false); // Ocultar el alert al cambiar de proveedor
    } else {
      setFilteredProducts([]);
    }
  }, [selectedProveedor]);

  const roundPrice = (price: number) => (price < 100 ? Math.ceil(price / 10) * 10 : Math.ceil(price / 100) * 100);

  const updatePrices = () => {
    if (!porcentaje) return;
    const percentage = parseFloat(porcentaje);
  
    const updated = filteredProducts.map((product) => {
      const precioOriginal = Number(product.precio);
      const newPrice = precioOriginal * (1 + percentage / 100);
      const roundedPrice = roundPrice(newPrice);

      return {
        ...product,

        // Mantener el precio original sin cambios
        precioOriginal: product.precio, // Usar el precio original del producto
        precio: product.precio, // Mantener el precio actual
        precioNuevo: roundedPrice.toString() // Solo el nuevo precio se calcula

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
    if (keys === 'all') {
      setSelectedProducts(filteredProducts);
      setShowAlert(true);
    } else {
      // Convertir el Set a un array de strings
      const selectedArray = Array.from(keys).map(String);

      const selected = filteredProducts.filter(product =>
        selectedArray.includes(String(product.id))
      );

      setSelectedProducts(selected);
      setShowAlert(selectedArray.length > 0);

    }
  };
  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      setErrorMessage("No hay productos seleccionados para actualizar.");
      return;
    }

    // console.log("Productos seleccionados antes de enviar:", selectedProducts);

    // Asegurémonos de que estamos usando los productos con el precioNuevo
    const productosParaGuardar = selectedProducts.map((product) => {
      // Buscar el producto correspondiente en updatedProducts
      const updatedProduct = updatedProducts.find((p) => p.id === product.id);

      // Asegurarse de que el precioNuevo esté disponible
      const precioNuevo = updatedProduct?.precioNuevo || product.precio; // Usar el precioNuevo calculado, si no, usar el precio original

      return {
        id: product.id,
        Producto: product.nombreProducto,
        Precio: precioNuevo, // Asegurarse de que sea un número con 2 decimales
      };
    });

    // console.log("Enviando productos para guardar:", productosParaGuardar);

    try {
      setIsLoading(true); // Mostrar spinner mientras se carga
      setErrorMessage(null);

      // Realizar la solicitud PUT/POST
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/actualizar-precios/1`, {
        method: "PUT",  // Cambia a "POST" si es necesario
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productosParaGuardar),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los precios. Intenta nuevamente.");
      }

      // Confirmar éxito
      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      // Resetear estado tras éxito
      setSelectedProducts([]);
      setShowAlert(false);
      onClose(); // Cerrar el modal
    } catch (error) {
      setErrorMessage("Ocurrió un error al actualizar los precios.");
      console.error("Error en la solicitud:", error);
    } finally {
      setIsLoading(false); // Ocultar spinner al finalizar
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
    <Modal isOpen={isOpen} onClose={() => {
      handleModalClose();
      resetModal();
      onClose();
    }} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Actualizar Precios por Proveedor
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <Spinner label="Cargando..." />
            ) : error ? (
              <div className="text-danger">{error}</div>
            ) : (
              <>
                <Select
                  label="Seleccionar Proveedor"
                  placeholder="Seleccione un proveedor"
                  selectedKeys={selectedProveedor}
                  onSelectionChange={(keys) => {
                    setSelectedProveedor(new Set(keys)); // Convert to a Set if needed
                  }}
                >
                  {proveedores.map((proveedor) => (
                    <SelectItem
                      key={proveedor.id}
                      value={proveedor.id}
                    >
                      {proveedor.nombreProveedores}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  label="Porcentaje de aumento"
                  placeholder="Ingrese el porcentaje"
                  value={porcentaje}
                  onChange={handlePorcentajeChange}
                  startContent="%"
                />
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Spinner label="Cargando..." />
                  </div>
                ) : errorMessage ? (
                  <div className="text-center text-danger">{errorMessage}</div>
                ) : filteredProducts.length > 0 ? (
                  <>
                    <Table
                      aria-label="Tabla de productos"
                      selectionMode="multiple"
                      onSelectionChange={handleSelectionChange}
                    >
                      <TableHeader>
                        {columns.map((column) => (
                          <TableColumn key={column.key}>{column.label}</TableColumn>
                        ))}
                      </TableHeader>
                      <TableBody items={updatedProducts.length ? updatedProducts : filteredProducts}>
                        {(item: Product) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.nombreProducto}</TableCell>
                            <TableCell>{item.precio}</TableCell>
                            <TableCell>{item.precioNuevo || '-'}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="text-center">No hay productos disponibles.</div>
                )}
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex flex-col items-start gap-2">
          {/* Alert dentro del Footer */}
          {showAlert && (
            <div
              className="relative w-full px-4 py-3 text-teal-700 bg-teal-200 border border-teal-500 rounded bg-opacity-30 border-opacity-30"
              role="alert"
            >
              <strong className="font-bold">
                Vas a modificar {selectedProducts.length}{" "}
                {selectedProducts.length === 1 ? "producto" : "productos"}.
              </strong>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 mt-2">
          <Button 
              color="danger" 
              onPress={handleModalClose} 
              
            >
              Cerrar
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmit} 
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" label="Guardando..." /> : "Guardar Cambios"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalPriceUpdater;