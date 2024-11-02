import React, { useState, useEffect } from "react";
import {Modal,ModalContent, ModalHeader, ModalBody, ModalFooter, Table,  TableHeader,  TableColumn,  TableBody,  TableRow,  TableCell, Select, SelectItem, Input, Button ,Spinner,} from "@nextui-org/react";
import { Proveedores } from "@/types/proveedores";
import { Productos } from "@/types/productos"


const productos = [
  { id: "1", nombre: "Producto 1", precio: 266, proveedorId: "1" },
  { id: "2", nombre: "Producto 2", precio: 500, proveedorId: "1" },
  { id: "3", nombre: "Producto 3", precio: 750, proveedorId: "2" },
  { id: "4", nombre: "Producto 4", precio: 1200, proveedorId: "2" },
  { id: "5", nombre: "Producto 5", precio: 180, proveedorId: "3" },
];

type ModalPriceUpdaterProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalPriceUpdater: React.FC<ModalPriceUpdaterProps> = ({ isOpen, onClose }) => {
  // Estados
  const [proveedores, setProveedores] = useState<Proveedores[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [porcentaje, setPorcentaje] = useState("");

  // Función para obtener proveedores
  const fetchProveedores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proveedores/`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los proveedores');
      }

      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching proveedores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar proveedores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchProveedores();
    }
  }, [isOpen]);

  // Resetear estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedProveedor("");
      setFilteredProducts([]);
      setSelectedKeys(new Set([]));
      setPorcentaje("");
      setError(null);
    }
  }, [isOpen]);

  // Filtrar productos cuando se selecciona un proveedor
  useEffect(() => {
    if (selectedProveedor) {
      const filtered = productos.filter(p => p.proveedorId === selectedProveedor);
      setFilteredProducts(filtered);
      setSelectedKeys(new Set(filtered.map(p => p.id)));
    } else {
      setFilteredProducts([]);
      setSelectedKeys(new Set([]));
    }
  }, [selectedProveedor]);

  // Función para redondear precio
  const roundPrice = (price) => {
    if (price < 100) return Math.ceil(price / 10) * 10;
    return Math.ceil(price / 100) * 100;
  };

  // Función para actualizar precios
  const updatePrices = () => {
    if (!porcentaje || selectedKeys.size === 0) return;

    const percentage = parseFloat(porcentaje);
    const selectedProducts = Array.from(selectedKeys).map(key => {
      const product = filteredProducts.find(p => p.id === key);
      const newPrice = product.precio * (1 + percentage / 100);
      return {
        ...product,
        precioOriginal: product.precio,
        precioNuevo: roundPrice(newPrice)
      };
    });

    console.log('Productos actualizados:', selectedProducts);
    onClose();
  };

  const columns = [
    { key: "nombre", label: "NOMBRE" },
    { key: "precio", label: "PRECIO ACTUAL" },
    { 
      key: "precioNuevo", 
      label: "PRECIO NUEVO",
      cell: (product) => {
        if (!porcentaje) return "-";
        const newPrice = product.precio * (1 + parseFloat(porcentaje) / 100);
        return `$${roundPrice(newPrice)}`;
      }
    },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Actualizar Precios por Proveedor
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <Spinner label="Cargando proveedores..." />
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-danger">
                    {error}
                    <Button 
                      color="primary" 
                      variant="light" 
                      size="sm" 
                      className="ml-2"
                      onPress={fetchProveedores}
                    >
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <Select 
                    label="Seleccionar Proveedor" 
                    placeholder="Seleccione un proveedor"
                    onChange={(e) => setSelectedProveedor(e.target.value)}
                  >
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombreProveedores}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <Input
                  type="number"
                  label="Porcentaje de aumento"
                  placeholder="Ingrese el porcentaje"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  endContent="%"
                  isDisabled={isLoading || !!error}
                />

                {filteredProducts.length > 0 ? (
                  <Table
                    aria-label="Tabla de productos"
                    selectionMode="multiple"
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                  >
                    <TableHeader>
                      {columns.map((column) => (
                        <TableColumn key={column.key}>{column.label}</TableColumn>
                      ))}
                    </TableHeader>
                    <TableBody items={filteredProducts}>
                      {(item) => (
                        <TableRow key={item.id}>
                          {(columnKey) => (
                            <TableCell>
                              {columns.find(col => col.key === columnKey)?.cell?.(item) || 
                               columnKey === 'precio' ? `$${item[columnKey]}` : item[columnKey]}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  selectedProveedor && (
                    <div className="py-4 text-center text-gray-500">
                      No hay productos disponibles para este proveedor
                    </div>
                  )
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button 
                color="primary"
                onPress={updatePrices}
                disabled={!selectedProveedor || !porcentaje || selectedKeys.size === 0 || isLoading || !!error}
              >
                Actualizar Precios
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalPriceUpdater;