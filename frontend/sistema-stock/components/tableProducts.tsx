"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination, Card, addToast } from "@heroui/react";
import { FaEye } from "react-icons/fa";
import ProductModal from "./productModal";
import { SearchIcon } from "@heroui/shared-icons";
import { Product } from "./productModal";



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
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>("");

  // Configuración de columnas según nivel de usuario
  const columns = [
    { name: "ID/SKU", uid: "id" },
    { name: "Producto", uid: "nombreProducto" },
    { name: "Descripción", uid: "descripcion" },
    // ...(userLevel > 1 ? [{ name: "Precio Costo", uid: "precioCosto" }] : []), // Agregar columna condicionalmente
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

  const handlePriceEdit = (product: Product) => {
    setEditingPriceId(product.id);
    setEditingPriceValue(""); // Inicializar vacío para usar placeholder
  };

  const handlePriceSave = async (productId: number) => {
    try {
      // Si el valor está vacío o es 0, no actualizar
      if (!editingPriceValue.trim() || parseFloat(editingPriceValue) === 0) {
        setEditingPriceId(null);
        setEditingPriceValue("");
        return;
      }

      const newPrice = parseFloat(editingPriceValue);
      if (isNaN(newPrice) || newPrice < 0) {
        alert("Por favor ingrese un precio válido mayor a 0");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/productos/${productId}`;
      const body = JSON.stringify({ precio: newPrice });
      
      console.log('Actualizando precio:', { url, body, productId, newPrice });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al actualizar el precio: ${response.status} ${response.statusText}`);
      }

      // Actualizar el estado local
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, precio: newPrice } : product
        )
      );

      setFilteredProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, precio: newPrice } : product
        )
      );

      setEditingPriceId(null);
      setEditingPriceValue("");
      addToast({
        title: "¡Éxito!",
        description: "Precio actualizado correctamente",
        color: "success",
      });
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
      alert("Error al actualizar el precio. Intente nuevamente.");
    }
  };

  const handlePriceCancel = () => {
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent, productId: number) => {
    if (e.key === 'Enter') {
      handlePriceSave(productId);
    } else if (e.key === 'Escape') {
      handlePriceCancel();
    }
    // Las flechas izquierda y derecha se manejan automáticamente por el input
    // No necesitamos hacer nada especial para ellas
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
                      {column.uid === "precio" && (
                        editingPriceId === product.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                // Permitir que las flechas funcionen normalmente
                                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                  return; // No hacer nada, dejar que el input maneje las flechas
                                }
                                handlePriceKeyDown(e, product.id);
                              }}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-24"
                              size="sm"
                              min="0"
                              step="1"
                              placeholder={product.precio.toString()}
                            />
                            <button
                              tabIndex={0}
                              onClick={() => handlePriceSave(product.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handlePriceSave(product.id);
                                }
                              }}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              ✓
                            </button>
                            <button
                              tabIndex={0}
                              onClick={handlePriceCancel}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handlePriceCancel();
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span 
                            role="button"
                            tabIndex={0}
                            style={{ fontWeight: "bold", color: "#0070f3", cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePriceEdit(product);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handlePriceEdit(product);
                              }
                            }}
                            title="Haz clic para editar el precio"
                          >
                            ${product.precio}
                          </span>
                        )
                      )}
                      {column.uid === "acciones" && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth="1.5" 
                          stroke="currentColor" 
                          className="cursor-pointer size-6"
                          onClick={() => handleViewProduct(product)}
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" 
                          />
                        </svg>
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
