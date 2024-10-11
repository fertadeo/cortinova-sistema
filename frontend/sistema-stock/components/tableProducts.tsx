// src/components/TableProducts.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
} from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import ProductModal from "./productModal";

// **Definición del tipo Product**
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

// **Simulación de datos de productos**
const productsData: Product[] = [
  {
    id: 1,
    nombreProducto: "Producto A",
    descripcion: "Descripción del Producto A",
    proveedor: "Proveedor X",
    cantidadDisponible: 10,
    precioCosto: 50.0,
    precioLista: 120.0,
    descuento: 0,
    precioPublico: 120.0,
    habilitado: true,
  },
  {
    id: 2,
    nombreProducto: "Producto B",
    descripcion: "Descripción del Producto B",
    proveedor: "Proveedor Y",
    cantidadDisponible: 3,
    precioCosto: 75.0,
    precioLista: 150.0,
    descuento: 5,
    precioPublico: 142.5,
    habilitado: true,
  },
  {
    id: 3,
    nombreProducto: "Producto C",
    descripcion: "Descripción del Producto C",
    proveedor: "Proveedor Z",
    cantidadDisponible: 0,
    precioCosto: 100.0,
    precioLista: 200.0,
    descuento: 10,
    precioPublico: 180.0,
    habilitado: false, // Deshabilitado automáticamente por cantidad 0
  },
  // Puedes agregar más productos simulados aquí
];

// **Definición de las columnas de la tabla**
const columns = [
  { name: "ID/SKU", uid: "id" },
  { name: "Producto", uid: "nombreProducto" },
  { name: "Descripción", uid: "descripcion" },
  { name: "Cantidad Disponible", uid: "cantidadDisponible" },
  { name: "Precio de Lista", uid: "precioLista" },
  { name: "Descuento", uid: "descuento" },
  { name: "Precio al Público", uid: "precioPublico" },
  { name: "Acciones", uid: "acciones" },
];

// **Estilo para resaltar Precio al Público**
const precioPublicoStyle = {
  fontWeight: "bold",
  color: "#0070f3", // Azul para resaltar
};

// **Declaración del componente TableProducts**
const TableProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  // **Simulación de obtención de productos**
  const fetchProducts = () => {
    // Simulamos una llamada a la API con un retraso
    setTimeout(() => {
      // Actualizamos el estado de habilitado según la cantidad disponible
      const updatedProducts = productsData.map((product) => ({
        ...product,
        habilitado:
          product.cantidadDisponible === 0 ? false : product.habilitado,
      }));
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
    }, 500);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product) =>
        product.nombreProducto
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getCantidadStyle = (cantidad: number) => {
    if (cantidad > 5) return { color: "green" };
    if (cantidad >= 1 && cantidad <= 5) return { color: "orange" };
    return { color: "red" };
  };

  const getRowStyle = (product: Product) => {
    return product.habilitado
      ? {}
      : { backgroundColor: "#f0f0f0", color: "#a0a0a0", opacity: 0.6 }; // Color gris claro y opacidad
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    // Simulamos la actualización del producto en el frontend
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);

    // Console.log del producto actualizado
    console.log("Producto Actualizado:", JSON.stringify(updatedProduct, null, 2));

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: number) => {
    // Simulamos la eliminación del producto
    const productToDelete = products.find((p) => p.id === productId);
    if (!productToDelete) return;

    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);

    // Console.log de la eliminación del producto
    console.log("Producto Eliminado:", JSON.stringify({ id: productId }, null, 2));

    setIsModalOpen(false);
  };

  const handleToggleProduct = (productId: number) => {
    // Simulamos el cambio de estado habilitado/deshabilitado
    const updatedProducts = products.map((product) =>
      product.id === productId
        ? { ...product, habilitado: !product.habilitado }
        : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);

    const toggledProduct = updatedProducts.find((p) => p.id === productId);
    if (toggledProduct) {
      // Console.log del cambio de estado
      console.log("Producto Habilitado/Deshabilitado:", JSON.stringify({
        id: toggledProduct.id,
        habilitado: toggledProduct.habilitado,
      }, null, 2));
    }
  };

  return (
    <>
      {/* Input de búsqueda */}
      <Input
        isClearable
        placeholder="Buscar producto"
        value={searchTerm}
        style={{ marginBottom: "20px" }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabla de productos */}
      <Table aria-label="Tabla de productos">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id} style={getRowStyle(product)}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.nombreProducto}</TableCell>
              <TableCell>{product.descripcion}</TableCell>
              <TableCell style={getCantidadStyle(product.cantidadDisponible)}>
                {product.cantidadDisponible}
              </TableCell>
              <TableCell>{product.precioLista}</TableCell>
              <TableCell>{product.descuento}%</TableCell>
              <TableCell style={precioPublicoStyle}>
                {product.precioPublico}
              </TableCell>
              <TableCell>
                <FaEye
                  style={{ cursor: "pointer" }}
                  onClick={() => handleViewProduct(product)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <Pagination
        initialPage={1}
        onChange={handlePageChange}
        page={currentPage}
        style={{ marginTop: "20px", justifyContent: "center" }}
        total={Math.ceil(filteredProducts.length / itemsPerPage)}
      />

      {/* Modal para ver/editar producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        onToggle={handleToggleProduct}
      />
    </>
  );
};

export default TableProducts;
