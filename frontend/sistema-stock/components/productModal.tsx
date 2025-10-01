// src/components/ProductModal.tsx
"use client";

import React, { useState, useEffect, ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input
} from "@heroui/react";
import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

export type Product = {
  precio: number;
  cantidad_stock: number;
  id: number;
  nombreProducto: string;
  descripcion: string;
  proveedor: {
    id: number;
    nombreProveedores: string;
  } | null;
  cantidadDisponible: number;
  precioCosto: number;
  precioLista: number;
  descuento: number;
  precioPublico: number;
  habilitado: boolean;
};

type Proveedor = {
  id: number;
  nombreProveedores: string;
};

type ProductModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete: (productId: number) => void;
  onToggle: (productId: number, enabled: boolean) => void;
};

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
  // onToggle,
}) => {
  if (!product) return null;
  // const [editedProduct, setEditedProduct] = useState<Product | null>(product);
  // const [proveedores, setProveedores] = useState<Proveedor[]>([]);
// Estados iniciales definidos correctamente
/* eslint-disable */
const [editedProduct, setEditedProduct] = useState<Product | null>(null);
const [proveedores, setProveedores] = useState<Proveedor[]>([]);
/* eslint-enable */

// Sincronizar el producto editado con el estado cuando cambien las props
/* eslint-disable */
useEffect(() => {
  setEditedProduct(product || null); // Asegúrate de manejar el caso en el que product sea null o undefined
}, [product]);


// Efecto para cargar proveedores al montar el componente
useEffect(() => {
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

  fetchProveedores(); // Llamada a la función
}, []); // Solo se ejecuta al montar el componente

/* eslint-enable */
  const handleSaveChanges = async () => {
    if (editedProduct) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/productos/${editedProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedProduct),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el producto");
        }

        const updatedProduct = await response.json();
        onSave(updatedProduct);
      } catch (error) {
        console.error("Error al guardar los cambios:", error);
      }
    }
  };

  const handleDelete = () => {
    if (editedProduct) {
      onDelete(editedProduct.id);
    }
  };

  const handleToggle = (productId: number, enabled: boolean) => {
    setProducts((prevProducts) =>
      prevProducts.map((product: { id: number; }) =>
        product.id === productId ? { ...product, habilitado: enabled } : product
      )
    );
  };
  

  const handleProveedorChange = (value: string) => {
    const selectedProveedor = proveedores.find(
      (p) => p.nombreProveedores === value
    );
    if (selectedProveedor) {
      setEditedProduct((prevProduct) =>
        prevProduct ? { ...prevProduct, proveedor: selectedProveedor } : prevProduct
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2>
            {editedProduct ? editedProduct.nombreProducto : "Detalles del Producto"}
          </h2>
        </ModalHeader>
        <ModalBody>
          {editedProduct && (
            <div>
              <div className="mb-4">
                <label htmlFor="id-input" className="block mb-1 font-medium">ID/SKU</label>
                <Input
                  id="id-input"
                  value={editedProduct.id.toString()}
                  disabled
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label htmlFor="nombreProducto-input" className="block mb-1 font-medium">Producto</label>
                <Input
                  id="nombreProducto-input"
                  value={editedProduct.nombreProducto}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      nombreProducto: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-4">
                <label htmlFor="descripcion-input" className="block mb-1 font-medium">Descripción</label>
                <Input
                  id="descripcion-input"
                  value={editedProduct.descripcion}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      descripcion: e.target.value,
                    })
                  }
                />
              </div>

              {/* Mantenemos el Select de Proveedor sin cambios */}
              <div className="mb-4">
                <label htmlFor="proveedor-select" className="block mb-1 font-medium">
                  Proveedor
                </label>
                <Select
                  id="proveedor-select"
                  value={editedProduct.proveedor?.nombreProveedores || ""}
                  onChange={(event) => handleProveedorChange(event.target.value)}
                  aria-label="Seleccionar proveedor"
                >
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} >
                      {proveedor.nombreProveedores}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="mb-4">
                <label htmlFor="cantidadDisponible-input" className="block mb-1 font-medium">Cantidad Disponible</label>
                <Input
                  type="number"
                  value={editedProduct.cantidadDisponible.toString()}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      cantidadDisponible: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label htmlFor="precio-input" className="block mb-1 font-medium">Precio</label>
                <Input
                  id="precio-input"
                  type="number"
                  value={editedProduct.precio.toString()}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      precio: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label htmlFor="descuento-input" className="block mb-1 font-medium">Descuento (%)</label>
                <Input
                  id="descuento-input"
                  type="number"
                  value={editedProduct.descuento.toString()}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      descuento: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" color="danger" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="solid" color="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
          {/* <Button
            variant="flat"
            color={editedProduct?.habilitado ? "warning" : "success"}
            onClick={handleToggle}
          > */}
            {/* {editedProduct?.habilitado ? "Deshabilitar" : "Habilitar"}
            {editedProduct?.habilitado ? (
              <FaToggleOff style={{ marginLeft: "5px" }} />
            ) : (
              <FaToggleOn style={{ marginLeft: "5px" }} />
            )}
          </Button> */}
          {editedProduct?.cantidadDisponible === 0 && (
            <Button
              variant="flat"
              color="danger"
              onClick={handleDelete}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="currentColor" 
                className="mr-2 size-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" 
                />
              </svg>
              Eliminar
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductModal;
function setProducts(arg0: (prevProducts: any) => any) {
  throw new Error("Function not implemented.");
}

