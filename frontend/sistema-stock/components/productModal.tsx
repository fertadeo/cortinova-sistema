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
  Select,
  SelectItem
} from "@nextui-org/react";
import { FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import EditableField from "./EditableField";

type Product = {
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
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  // Cargar proveedores desde la API
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

  useEffect(() => {
    fetchProveedores();
  }, []);

  useEffect(() => {
    if (editedProduct) {
      const precioPublicoCalculado =
        editedProduct.precioLista - 
        (editedProduct.precioLista * editedProduct.descuento) / 100;
      setEditedProduct({
        ...editedProduct,
        precioPublico: Number(precioPublicoCalculado.toFixed(2)),
      });
    }
  }, [editedProduct?.precioLista, editedProduct?.descuento]);

  const handleSaveChanges = () => {
    if (editedProduct) {
      onSave(editedProduct);
    }
  };

  const handleDelete = () => {
    if (editedProduct) {
      onDelete(editedProduct.id);
    }
  };

  const handleToggle = () => {
    if (editedProduct) {
      onToggle(editedProduct.id);
    }
  };

  const handleProveedorChange = (value: string) => {
    const selectedProveedor = proveedores.find(
      (p) => p.nombreProveedores === value
    );
    if (selectedProveedor) {
      console.log("Proveedor seleccionado:", selectedProveedor);
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
                <label className="block mb-1 font-medium">Proveedor</label>
                <Select
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
                onChange={() => { }}
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
