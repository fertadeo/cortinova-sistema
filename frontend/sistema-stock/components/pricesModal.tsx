import React, { useState, useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Select, SelectItem, Input, Button, Spinner
} from "@nextui-org/react";
import { Productos } from "@/types/productos";
import { Proveedores } from "@/types/proveedores";

const ModalPriceUpdater: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [proveedores, setProveedores] = useState<Proveedores[]>([]);
  const [productos, setProductos] = useState<Productos[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Productos[]>([]);
  const [porcentaje, setPorcentaje] = useState("");
  const [updatedProducts, setUpdatedProducts] = useState<Productos[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Productos[]>([]); // Productos seleccionados
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proveedores/`);
      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      setError('No se pudo obtener la data de proveedores');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductosPorProveedor = async (proveedorId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/proveedor/${proveedorId}`);
      const data = await response.json();
      setProductos(data.productos);
      setFilteredProducts(data.productos); // Muestra todos los productos al seleccionar el proveedor
    } catch (err) {
      setError('No se pudo obtener los productos con ID de este proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchProveedores();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedProveedor("");
      setFilteredProducts([]);
      setPorcentaje("");
      setUpdatedProducts([]);
      setSelectedProducts([]);
      setShowAlert(false)
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProveedor) {
      fetchProductosPorProveedor(selectedProveedor);
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
      const precio = Number(product.precio);
      const newPrice = precio * (1 + percentage / 100);
      return {
        ...product,
        precioOriginal: precio,
        precioNuevo: roundPrice(newPrice),
      };
    });

    setUpdatedProducts(updated);
    console.log("Productos recalculados:", updated); // Mostrar productos recalculados en la consola
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

  const handleSelectionChange = (selectedKeys: Set<string> | string[]) => {
    const selectedArray = Array.isArray(selectedKeys) ? selectedKeys : Array.from(selectedKeys);

    // Verificar si se seleccionaron todos los productos
    if (selectedArray.join("") === "all") {
      if (selectedProducts.length !== filteredProducts.length) {
        setSelectedProducts(filteredProducts);
        setShowAlert(true);
      }
    } else {
      // Filtrar los productos seleccionados por sus IDs
      const selected = filteredProducts.filter(product => selectedArray.includes(String(product.id)));

      // Actualizar solo si el número de productos seleccionados cambia
      if (selected.length !== selectedProducts.length) {
        setSelectedProducts(selected);
        setShowAlert(selected.length > 0);
      }
    }
    console.log("Productos seleccionados en tiempo real:", selectedProducts);
  };


  const handleSubmit = () => {
    console.log("Productos seleccionados para guardar:", selectedProducts);
  };

  const columns = [
    { key: "nombreProducto", label: "NOMBRE" },
    { key: "precio", label: "PRECIO ACTUAL" },
    {
      key: "precioNuevo",
      label: "PRECIO NUEVO",
      cell: (product: Productos) => product.precioNuevo ? `$${product.precioNuevo}` : "-",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
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
                <Select label="Seleccionar Proveedor" placeholder="Seleccione un proveedor" onChange={(e) => setSelectedProveedor(e.target.value)}>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.id}>{proveedor.nombreProveedores}</SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  label="Porcentaje de aumento/disminución"
                  placeholder="Ingrese el porcentaje"
                  value={porcentaje}
                  onChange={handlePorcentajeChange}
                  startContent="%"
                />
                {errorMessage && <p color="error">{errorMessage}</p>}

                {filteredProducts.length > 0 ? (
                  <>
                    <Table
                      aria-label="Tabla de productos"
                      selectionMode="multiple"
                      onSelectionChange={handleSelectionChange}
                    >
                      <TableHeader>
                        {columns.map((column) => <TableColumn key={column.key}>{column.label}</TableColumn>)}
                      </TableHeader>
                      <TableBody items={updatedProducts.length ? updatedProducts : filteredProducts}>
                        {(item: Productos) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.nombreProducto}</TableCell>
                            <TableCell>{item.precio}</TableCell>
                            <TableCell>{item.precioNuevo || '-'}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {showAlert && (
                      <div
                        className="relative px-4 py-3 text-teal-700 bg-teal-200 border border-teal-500 rounded bg-opacity-30 border-opacity-30"
                        role="alert"
                      >
                        <strong className="font-bold">
                          Vas a modificar {selectedProducts.length}{" "}
                          {selectedProducts.length === 1 ? "producto" : "productos"}.
                        </strong>
                      </div>
                    )}

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

            <Button color="danger" onPress={onClose}>
              Cerrar
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              Guardar Cambios
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalPriceUpdater;
