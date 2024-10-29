//tableProducts.tsx

"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Pagination, Button
} from "@nextui-org/react";
import { FaEye, FaFilter } from "react-icons/fa";
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

type BatchChanges = {
  precioCostoPercentage: number;
  precioListaPercentage: number;
};

const columns = [
  { name: "ID/SKU", uid: "id" },
  { name: "Producto", uid: "nombreProducto" },
  { name: "Descripción", uid: "descripcion" },
  { name: "Cantidad Disponible", uid: "cantidadDisponible" },
  { name: "Precio Costo", uid: "precioCosto" },
  { name: "Descuento", uid: "descuento" },
  { name: "Precio", uid: "precio" },
  { name: "Acciones", uid: "acciones" },
];

const precioPublicoStyle = {
  fontWeight: "bold",
  color: "#0070f3", 
};

const TableProducts = forwardRef((props, ref) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultifilterOpen, setIsMultifilterOpen] = useState(false);
  const itemsPerPage = 10;

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

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      
      fetchProducts();  // Refresca los datos al guardar
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    const updatedList = products.filter((product) => product.id !== productId);
    setProducts(updatedList);
    setFilteredProducts(updatedList);
    setIsModalOpen(false);
  };

  const handleToggleProduct = (productId: number) => {
    const updatedList = products.map((product) =>
      product.id === productId
        ? { ...product, habilitado: !product.habilitado }
        : product
    );
    setProducts(updatedList);
    setFilteredProducts(updatedList);
  };

  return (
    <>
      <div className="flex justify-between mb-5">
        <Input
          placeholder="Buscar producto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          color="secondary"
          onClick={() => setIsMultifilterOpen(true)}
          className="flex items-center"
        >
          <FaFilter className="mr-2" />
          Multifiltro
        </Button>
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
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.nombreProducto}</TableCell>
              <TableCell>{product.descripcion}</TableCell>
              <TableCell style={getCantidadStyle(product.cantidad_stock)}>
                {product.cantidad_stock}
              </TableCell>
              <TableCell>{product.precioCosto}</TableCell>
              <TableCell>{product.descuento}%</TableCell>
              <TableCell style={precioPublicoStyle}>
                {product.precio}
              </TableCell>
              <TableCell>
                <FaEye className="cursor-pointer" onClick={() => handleViewProduct(product)} />
              </TableCell>
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
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        onToggle={handleToggleProduct}
      />
    </>
  );
});

TableProducts.displayName = "TableProducts";

export default TableProducts;
