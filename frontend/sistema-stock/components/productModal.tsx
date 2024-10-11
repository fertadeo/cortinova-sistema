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
  Input,
} from "@nextui-org/react";
import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import EditableField from "./EditableField";


type Product = {
  id: number;
  nombreProducto: string;
  proveedor: string;
  descripcion: string;
  precioCosto: number;
  precioPublico: number;
  precioLista: number;
  /*divisa: string;*/
  cantidadDisponible: number;
  descuento: number;
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

  const handleSaveChanges = () => {
    if (editedProduct) {
      onSave(editedProduct);
    }
  };

  useEffect(() => {
    if (editedProduct) {
      const precioPublicoCalculado =
        editedProduct.precioLista - (editedProduct.precioLista * editedProduct.descuento) / 100;
      setEditedProduct({
        ...editedProduct,
        precioPublico: precioPublicoCalculado,
      });
    }
  }, [editedProduct?.precioLista, editedProduct?.descuento]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2>{editedProduct ? editedProduct.nombreProducto : "Producto"}</h2>
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
                setEditedProduct({ ...editedProduct, nombreProducto: value.toString() })
                }
            />
            <EditableField
                label="Descripción"
                value={editedProduct.descripcion}
                onChange={(value) =>
                setEditedProduct({ ...editedProduct, descripcion: value.toString() })
                }
            />
            <EditableField
                label="Proveedor"
                value={editedProduct.proveedor}
                onChange={(value) =>
                setEditedProduct({ ...editedProduct, proveedor: value.toString() })
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
            />
            <EditableField
                label="Precio al Público"
                value={editedProduct.precioPublico}
                onChange={(value) =>
                setEditedProduct({
                    ...editedProduct,
                    precioPublico: Number(value),
                })
                }
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
            color="warning"
            onClick={() => onToggle(editedProduct!.id)}
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
              onClick={() => onDelete(editedProduct!.id)}
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
