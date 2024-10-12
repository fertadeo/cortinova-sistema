// src/components/ProductModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import EditableField from "./EditableField";

type Product = {
  id: number;
  nombreProducto: string;
  descripcion: string;
  proveedor: string;
  cantidadDisponible: number;
  precioCosto: number;
  precioLista: number;
  descuento: number;
  precioPublico: number;
  habilitado: boolean;
};

type ProductModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  onDelete: (productId: number) => void;
  onToggle: (productId: number) => void;
};

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onToggle,
}) => {
  const [editedProduct, setEditedProduct] = useState<Product | null>(product);

  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  // **Cálculo Automático del Precio al Público**
  useEffect(() => {
    if (editedProduct) {
      const precioPublicoCalculado =
        editedProduct.precioLista -
        (editedProduct.precioLista * editedProduct.descuento) / 100;
      setEditedProduct({
        ...editedProduct,
        precioPublico: Number(precioPublicoCalculado.toFixed(2)), // Redondeamos a 2 decimales
      });
    }
  }, [editedProduct?.precioLista, editedProduct?.descuento]);

  const handleSaveChanges = () => {
    if (editedProduct) {
      // Simulación de envío de datos al backend
      console.log("Guardar Cambios:", JSON.stringify(editedProduct, null, 2));
      onSave(editedProduct);
    }
  };

  const handleDelete = () => {
    if (editedProduct) {
      // Simulación de eliminación al backend
      console.log("Eliminar Producto ID:", editedProduct.id);
      onDelete(editedProduct.id);
    }
  };

  const handleToggle = () => {
    if (editedProduct) {
      // Simulación de habilitar/deshabilitar al backend
      console.log(
        `Toggle Habilitado para ID: ${editedProduct.id}, Nuevo Estado: ${
          !editedProduct.habilitado
        }`
      );
      onToggle(editedProduct.id);
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
              {/* ID/SKU (no editable) */}
              <EditableField
                label="ID/SKU"
                value={editedProduct.id}
                onChange={() => {}}
                isEditable={false}
              />

              {/* Campos editables */}
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
              <EditableField
                label="Proveedor"
                value={editedProduct.proveedor}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    proveedor: value.toString(),
                  })
                }
              />
              <EditableField
                label="Cantidad Disponible"
                value={editedProduct.cantidadDisponible}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    cantidadDisponible: Number(value),
                  })
                }
                type="number"
              />
              <EditableField
                label="Precio de Costo"
                value={editedProduct.precioCosto}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    precioCosto: Number(value),
                  })
                }
                type="number"
              />
              <EditableField
                label="Precio de Lista"
                value={editedProduct.precioLista}
                onChange={(value) =>
                  setEditedProduct({
                    ...editedProduct,
                    precioLista: Number(value),
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
              <EditableField
                label="Precio al Público"
                value={editedProduct.precioPublico}
                onChange={() => {
                  /* Precio al público calculado automáticamente */
                }}
                isEditable={false}
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
          <Button
            variant="flat"
            color={editedProduct?.habilitado ? "warning" : "success"}
            onClick={handleToggle}
          >
            {editedProduct?.habilitado ? "Deshabilitar" : "Habilitar"}
            {editedProduct?.habilitado ? (
              <FaToggleOff style={{ marginLeft: "5px" }} />
            ) : (
              <FaToggleOn style={{ marginLeft: "5px" }} />
            )}
          </Button>
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
