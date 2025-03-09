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
  SelectItem
} from "@nextui-org/react";
import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import EditableField from "./EditableField";


export type Product = {
  precio: number;
  cantidad_stock: number;
  id: number;
  nombreProducto: string;
  descripcion: string;
  proveedor: {
    id: number;
    nombreProveedores: string;
  };
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
              <EditableField
                label="ID/SKU"
                value={editedProduct.id}
                onChange={() => { }}
                isEditable={false}
              />
              <EditableField
                label="Producto"
                value={editedProduct.nombreProducto}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    nombreProducto: value.toString(),
                  })
                }
              />
              <EditableField
                label="Descripción"
                value={editedProduct.descripcion}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    descripcion: value.toString(),
                  })
                }
              />

              {/* Proveedor como Select */}
              <div className="mb-4">
                <label htmlFor="proveedor-select" className="block mb-1 font-medium">
                  Proveedor
                </label>
                <Select
                  id="proveedor-select"
                  value={editedProduct.proveedor.nombreProveedores}
                  onChange={(event) => handleProveedorChange(event.target.value)}
                  aria-label="Seleccionar proveedor"
                >
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.nombreProveedores}>
                      {proveedor.nombreProveedores}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <EditableField
                label="Cantidad Disponible"
                value={editedProduct.cantidadDisponible ?? 0}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    cantidadDisponible: Number(value),
                  })
                }
                type="number"
              />
              <EditableField
                label="Precio"
                value={editedProduct.precio}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    precio: Number(value),
                  })
                }
                type="number"
              />
              <EditableField
                label="Descuento (%)"
                value={editedProduct.descuento}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    descuento: Number(value),
                  })
                }
                type="number"
              />
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
              <FaTrash style={{ marginRight: "5px" }} />
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

