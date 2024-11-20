"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination } from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import ProductModal from "./productModal";

type Product = {
  id: number;
  nombreProducto: string;
  descripcion: string;
  proveedor: string;
  cantidad_stock: number;
  precioCosto: number;
  precio: number;
  descuento: number;
  precioLista: number;
  habilitado: boolean;
};

type TableProductsProps = {
  userLevel: number; // Nivel del usuario (1: empleado, 2: dueño, 3: programador)
};

const TableProducts = forwardRef((props: TableProductsProps, ref) => {
  const { userLevel } = props;
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Configuración de columnas según nivel de usuario
  const columns = [
    { name: "ID/SKU", uid: "id" },
    { name: "Producto", uid: "nombreProducto" },
    { name: "Descripción", uid: "descripcion" },
    { name: "Cantidad Disponible", uid: "cantidad_stock" },
    ...(userLevel > 1 ? [{ name: "Precio Costo", uid: "precioCosto" }] : []), // Agregar columna condicionalmente
    { name: "Descuento", uid: "descuento" },
    { name: "Precio", uid: "precio" },
    { name: "Acciones", uid: "acciones" },
  ];

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos`);

      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();

      const updatedData = data.map((product: Product) => ({
        ...product,
        habilitado: product.cantidad_stock > 0,
      }));

      setProducts(updatedData);
      setFilteredProducts(updatedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshProducts: fetchProducts,
  }));

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter((product) =>
        product.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
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
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getCantidadStyle = (cantidad: number) => {
    if (cantidad > 5) return { color: "green" };
    if (cantidad >= 1 && cantidad <= 5) return { color: "orange" };
    return { color: "red" };
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-between mb-5">
        <Input
          placeholder="Buscar producto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table aria-label="Tabla de productos">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              {columns.map((column) => (
                <TableCell key={column.uid}>
                  {column.uid === "id" && product.id}
                  {column.uid === "nombreProducto" && product.nombreProducto}
                  {column.uid === "descripcion" && product.descripcion}
                  {column.uid === "cantidad_stock" && (
                    <span style={getCantidadStyle(product.cantidad_stock)}>
                      {product.cantidad_stock}
                    </span>
                  )}
                  {column.uid === "precioCosto" && product.precioCosto}
                  {column.uid === "descuento" && `${product.descuento}%`}
                  {column.uid === "precio" && (
                    <span style={{ fontWeight: "bold", color: "#0070f3" }}>
                      {product.precio}
                    </span>
                  )}
                  {column.uid === "acciones" && (
                    <FaEye className="cursor-pointer" onClick={() => handleViewProduct(product)} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        initialPage={1}
        onChange={handlePageChange}
        page={currentPage}
        className="flex justify-center mt-5"
        total={Math.ceil(filteredProducts.length / itemsPerPage)}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
});

TableProducts.displayName = "TableProducts";

export default TableProducts;
