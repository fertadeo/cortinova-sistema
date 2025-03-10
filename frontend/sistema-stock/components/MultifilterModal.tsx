// src/components/MultifilterModal.tsx
"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import { FaFilter } from "react-icons/fa";

type Product = {
  id: number;
  nombreProducto: string;
  descripcion: string;
  proveedor: string;
  cantidad_stock: number;
  precioCosto: number;
  descuento: number;
  precio: number;
  habilitado: boolean;
};

type MultifilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onBatchUpdate: (updatedProducts: Product[], changes: BatchChanges) => void;
};

type FilterCriteria = {
  proveedor: string;
  nombreProducto: string;
  // Puedes añadir más criterios de filtro aquí
};

type FilterNegations = {
  proveedor: boolean;
  nombreProducto: boolean;
  // Añadir negaciones para más criterios
};

type BatchChanges = {
  precioCostoPercentage: number;
  precioListaPercentage: number;
};

const MultifilterModal: React.FC<MultifilterModalProps> = ({
  isOpen,
  onClose,
  products,
  onBatchUpdate,
}) => {
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    proveedor: "",
    nombreProducto: "",
  });

  const [filterNegations, setFilterNegations] = useState<FilterNegations>({
    proveedor: false,
    nombreProducto: false,
  });

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [batchChanges, setBatchChanges] = useState<BatchChanges>({
    precioCostoPercentage: 0,
    precioListaPercentage: 0,
  });

  // Función para aplicar los filtros
  const applyFilters = () => {
    let result = [...products];

    // Filtrar por proveedor
    if (filterCriteria.proveedor.trim() !== "") {
      if (filterNegations.proveedor) {
        result = result.filter(
          (product) =>
            !product.proveedor
              .toLowerCase()
              .includes(filterCriteria.proveedor.toLowerCase())
        );
      } else {
        result = result.filter((product) =>
          product.proveedor
            .toLowerCase()
            .includes(filterCriteria.proveedor.toLowerCase())
        );
      }
    }

    // Filtrar por nombre de producto
    if (filterCriteria.nombreProducto.trim() !== "") {
      if (filterNegations.nombreProducto) {
        result = result.filter(
          (product) =>
            !product.nombreProducto
              .toLowerCase()
              .includes(filterCriteria.nombreProducto.toLowerCase())
        );
      } else {
        result = result.filter((product) =>
          product.nombreProducto
            .toLowerCase()
            .includes(filterCriteria.nombreProducto.toLowerCase())
        );
      }
    }

    // Puedes añadir más filtros aquí

    setFilteredProducts(result);
  };

  // Función para seleccionar/deseleccionar productos filtrados
  const toggleSelectProduct = (product: Product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  // Función para seleccionar todos los productos filtrados
  const selectAllFiltered = () => {
    const newSelections = filteredProducts.filter(
      (fp) => !selectedProducts.find((sp) => sp.id === fp.id)
    );
    setSelectedProducts([...selectedProducts, ...newSelections]);
  };

  // Función para deselectar todos los productos filtrados
  const deselectAllFiltered = () => {
    setSelectedProducts(
      selectedProducts.filter(
        (p) => !filteredProducts.find((fp) => fp.id === p.id)
      )
    );
  };

  // Función para aplicar cambios en lote
  const applyBatchChanges = () => {
    if (selectedProducts.length === 0) {
      alert("No hay productos seleccionados para actualizar.");
      return;
    }

    onBatchUpdate(selectedProducts, batchChanges);

    // Resetear los cambios y selección
    setBatchChanges({
      precioCostoPercentage: 0,
      precioListaPercentage: 0,
    });
    setSelectedProducts([]);
    setFilteredProducts([]);
    setFilterCriteria({
      proveedor: "",
      nombreProducto: "",
    });
    setFilterNegations({
      proveedor: false,
      nombreProducto: false,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent className="w-[90%]">
        <ModalHeader>
          <h2>
            <FaFilter style={{ marginRight: "10px" }} />
            Multifiltro de Productos
          </h2>
        </ModalHeader>
        <ModalBody>
          {/* Sección de Filtros */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* Filtro por Proveedor */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Input
               
                label="Proveedor"
                placeholder="Buscar por proveedor"
                value={filterCriteria.proveedor}
                onChange={(e) =>
                  setFilterCriteria({
                    ...filterCriteria,
                    proveedor: e.target.value,
                  })
                }
              />
              <Checkbox
                isSelected={filterNegations.proveedor}
                onChange={() =>
                  setFilterNegations({
                    ...filterNegations,
                    proveedor: !filterNegations.proveedor,
                  })
                }
              >
                Buscar lo contrario
              </Checkbox>
            </div>

            {/* Filtro por Nombre del Producto */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Input
             
                label="Nombre del Producto"
                placeholder="Buscar por nombre"
                value={filterCriteria.nombreProducto}
                onChange={(e) =>
                  setFilterCriteria({
                    ...filterCriteria,
                    nombreProducto: e.target.value,
                  })
                }
              />
              <Checkbox
                isSelected={filterNegations.nombreProducto}
                onChange={() =>
                  setFilterNegations({
                    ...filterNegations,
                    nombreProducto: !filterNegations.nombreProducto,
                  })
                }
              >
                Buscar lo contrario
              </Checkbox>
            </div>

            {/* Puedes añadir más filtros aquí */}

            {/* Botón para Aplicar Filtros */}
            <Button onClick={applyFilters} color="primary">
              Filtrar
            </Button>
          </div>

          {/* Tabla de Resultados Filtrados */}
          {filteredProducts.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3>Resultados Filtrados</h3>
              <Table aria-label="Tabla de resultados filtrados">
                <TableHeader>
                  <TableColumn>
                    <Checkbox
                      isSelected={
                        filteredProducts.length > 0 &&
                        filteredProducts.every((fp) =>
                          selectedProducts.find((sp) => sp.id === fp.id)
                        )
                      }
                      onChange={(isSelected) => {
                        if (isSelected) {
                          selectAllFiltered();
                        } else {
                          deselectAllFiltered();
                        }
                      }}
                    />
                  </TableColumn>
                  <TableColumn>ID/SKU</TableColumn>
                  <TableColumn>Producto</TableColumn>
                  <TableColumn>Proveedor</TableColumn>
                  <TableColumn>Precio de Costo</TableColumn>
                  <TableColumn>Precio de Lista</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          isSelected={
                            selectedProducts.find((sp) => sp.id === product.id)
                              ? true
                              : false
                          }
                          onChange={() => toggleSelectProduct(product)}
                        />
                      </TableCell>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.nombreProducto}</TableCell>
                      <TableCell>{product.proveedor}</TableCell>
                      <TableCell>{product.precioCosto}</TableCell>
                      <TableCell>{product.precio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Tabla de Selección (Productos a Modificar) */}
          {selectedProducts.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <h3>Productos Seleccionados para Modificación</h3>
              <Table aria-label="Tabla de selección">
                <TableHeader>
                  <TableColumn>ID/SKU</TableColumn>
                  <TableColumn>Producto</TableColumn>
                  <TableColumn>Proveedor</TableColumn>
                  <TableColumn>Precio de Costo</TableColumn>
                  <TableColumn>Precio de Lista</TableColumn>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.nombreProducto}</TableCell>
                      <TableCell>{product.proveedor}</TableCell>
                      <TableCell>{product.precioCosto}</TableCell>
                      <TableCell>{product.precio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Campos para Modificaciones en Lote */}
          {selectedProducts.length > 0 && (
            <div
              style={{
                marginTop: "30px",
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <Input
                isClearable
                label="Modificar Precio de Costo (%)"
                placeholder="Ingrese el % de cambio"
                type="number"
                value={String(batchChanges.precioCostoPercentage)}
                onChange={(e) =>
                  setBatchChanges({
                    ...batchChanges,
                    precioCostoPercentage: Number(e.target.value),
                  })
                }
              />
              <Input
                isClearable
                label="Modificar Precio de Lista (%)"
                placeholder="Ingrese el % de cambio"
                type="number"
                value={String(batchChanges.precioListaPercentage)}
                onChange={(e) =>
                  setBatchChanges({
                    ...batchChanges,
                    precioListaPercentage: Number(e.target.value),
                  })
                }
              />
              <Button onClick={applyBatchChanges} color="secondary">
                Aplicar Cambios
              </Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultifilterModal;
