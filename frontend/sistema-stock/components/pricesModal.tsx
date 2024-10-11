import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner, // Importamos el Spinner de NextUI
} from "@nextui-org/react";
import { SearchIcon } from "./utils/searchIcon";

interface OneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

// Simulación de datos de productos
const initialProductsList: Product[] = [
  { id: 1, name: "Producto A", price: 100 },
  { id: 2, name: "Producto B", price: 200 },
  { id: 3, name: "Producto C", price: 300 },
];

const PricesModal: React.FC<OneProductModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<Product[]>(initialProductsList); // Estado local de los productos
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado para controlar el spinner

  // Filtrar productos a medida que el usuario escribe
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const results = productsList.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toString().includes(searchQuery)
    );

    setFilteredProducts(results);
  }, [searchQuery, productsList]);

  // Restablecer el estado cuando el modal se cierra o abre
  useEffect(() => {
    if (!isOpen) {
      // Restablecer los estados al cerrar el modal
      setSearchQuery("");
      setSelectedProduct(null);
      setFilteredProducts([]);
      setIsLoading(false); // Asegurarse de que el spinner también se restablezca
    }
  }, [isOpen]);

  // Manejar el cambio en los datos del producto seleccionado
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedProduct) {
      const { name, value } = event.target;
      setSelectedProduct((prevProduct) => {
        if (!prevProduct) return prevProduct;
        return {
          ...prevProduct,
          [name]: name === "price" ? parseFloat(value) || 0 : value,
        };
      });
    }
  };

  // Guardar los cambios y mostrar el spinner
  const handleSaveChanges = () => {
    if (selectedProduct) {
      // Mostrar el spinner durante 2 segundos
      setIsLoading(true);

      setTimeout(() => {
        // Actualizar el producto modificado en la lista
        setProductsList((prevProducts) =>
          prevProducts.map((product) =>
            product.id === selectedProduct.id ? selectedProduct : product
          )
        );

        // Detener el spinner y cerrar el modal
        setIsLoading(false);
        onClose();
      }, 2000); // Simula 2 segundos de carga
    }
  };

  return (
    <Modal size={"lg"} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Modificar producto
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {/* Buscador de productos */}
                <div className="flex flex-row gap-4 items-center">
                  <Input
                    label="Buscar producto"
                    placeholder="Buscar por nombre o ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={
                      <SearchIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </div>

                {/* Mostrar lista de productos filtrados */}
                {filteredProducts.length > 0 && !selectedProduct && (
                  <div className="flex flex-col gap-2 mt-4">
                    {filteredProducts.map((product) => (
                      <div
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      className="p-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedProduct(product);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedProduct(product);
                        }
                      }}
                    >
                      <p>{product.name}</p>
                      <p>ID: {product.id}</p>
                      <p>Precio: ${product.price.toFixed(2)}</p>
                    </div>
                    
                    ))}
                  </div>
                )}

                {/* Mostrar datos del producto seleccionado con inputs editables */}
                {selectedProduct && (
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-row gap-4">
                      <Input
                        readOnly
                        label="ID del Producto"
                        value={String(selectedProduct.id)}
                      />
                      <Input
                        name="name"
                        label="Nombre del Producto"
                        value={selectedProduct.name}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="price"
                        label="Precio del Producto"
                        value={selectedProduct.price.toString()}
                        type="number"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {/* Mensaje si no se encuentra el producto */}
                {filteredProducts.length === 0 && searchQuery && !selectedProduct && (
                  <p>No se encontró ningún producto con ese nombre o ID.</p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button color="primary" onPress={handleSaveChanges}>
                {isLoading ? <Spinner color="default"/> : "Guardar Cambios"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PricesModal;
