"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination, Card } from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import ProductModal from "./productModal";
import { SearchIcon } from "@nextui-org/shared-icons";
import { Product } from './productModal';



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
  const itemsPerPage = 13;
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Configuración de columnas según nivel de usuario
  const columns = [
    { name: "ID/SKU", uid: "id" },
    { name: "Producto", uid: "nombreProducto" },
    { name: "Descripción", uid: "descripcion" },
    // ...(userLevel > 1 ? [{ name: "Precio Costo", uid: "precioCosto" }] : []), // Agregar columna condicionalmente
    { name: "Descuento", uid: "descuento" },
    { name: "Precio", uid: "precio" },
    // { name: "Acciones", uid: "acciones" },
  ];

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos`);

      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();

      const updatedData = data.map((product: Product) => ({
        ...product,
        proveedor: {
          id: product.proveedor.id,
          nombre: product.proveedor.nombreProveedores
        },
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
      setCurrentPage(1); // Nuevo: reset a página 1
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


  const handleSave = (updatedProduct: Product) => {
    // Lógica para guardar un producto actualizado
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };
  
  const handleDelete = (productId: number) => {
    // Lógica para eliminar un producto
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };
  
  const handleToggle = (productId: number, enabled: boolean) => {
    // Lógica para habilitar/deshabilitar un producto
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, habilitado: enabled } : product
      )
    );
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex justify-between mb-5">
          <Input
            placeholder="Buscar producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={
              <SearchIcon className="flex-shrink-0 pointer-events-none text-default-400" />
            }
          />
        </div>

        <Table aria-label="Tabla de productos">
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.uid}>{column.name}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className={`cursor-pointer ${selectedRowId === product.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedRowId(product.id)}
                >
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
              ))
            ) : (
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index} style={{ textAlign: "center", fontStyle: "italic" }}>
                    {index === Math.floor(columns.length / 2) ? "No encontramos más resultados..." : ""}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination
        initialPage={1}
        page={currentPage}
        onChange={handlePageChange}
        total={Math.ceil(filteredProducts.length / itemsPerPage)}
        className="flex justify-center mt-5"
      />

      <ProductModal
        product={selectedProduct}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggle={handleToggle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
});

TableProducts.displayName = "TableProducts";

export default TableProducts;
