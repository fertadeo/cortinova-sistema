"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Pagination, Card, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { FaEye } from "react-icons/fa";
import ProductModal from "./productModal";
import ModalConfirmation from "./modalConfirmation";
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
  
  // Estados para edición de nombre y descripción
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>("");
  const [editingDescId, setEditingDescId] = useState<number | null>(null);
  const [editingDescValue, setEditingDescValue] = useState<string>("");

  // Estados para modal de confirmación de campos vacíos
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [pendingEmptyField, setPendingEmptyField] = useState<{
    type: 'name' | 'desc' | 'price';
    productId: number;
    value: string;
  } | null>(null);

  // Configuración de columnas según nivel de usuario
  const columns = [
    { name: "ID/SKU", uid: "id" },
    { name: "Producto", uid: "nombreProducto" },
    { name: "Descripción", uid: "descripcion" },
    // ...(userLevel > 1 ? [{ name: "Precio Costo", uid: "precioCosto" }] : []), // Agregar columna condicionalmente
    { name: "Precio", uid: "precio" },
    // { name: "Acciones", uid: "acciones" },
  ];

  const [sortMode, setSortMode] = useState<'id' | 'nombre'>('nombre');

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

  // Ordenar productos según el modo seleccionado
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortMode === 'id') {
      return a.id - b.id;
    } else {
      return a.nombreProducto.localeCompare(b.nombreProducto, 'es', { sensitivity: 'base' });
    }
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

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
      // Si el valor está vacío, no actualizar
      if (!editingPriceValue.trim()) {
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
      handlePriceSaveWithValidation(productId);
    } else if (e.key === 'Escape') {
      handlePriceCancel();
    }
    // Las flechas izquierda y derecha se manejan automáticamente por el input
    // No necesitamos hacer nada especial para ellas
  };

  // Funciones para edición de nombre
  const handleNameEdit = (product: Product) => {
    setEditingNameId(product.id);
    setEditingNameValue(""); // Inicializar vacío para usar placeholder
  };

  const handleNameSave = async (productId: number) => {
    try {
      // Si el valor está vacío, no actualizar
      if (!editingNameValue.trim()) {
        setEditingNameId(null);
        setEditingNameValue("");
        return;
      }

      const newName = editingNameValue.trim();
      if (newName.length < 2) {
        alert("El nombre del producto debe tener al menos 2 caracteres");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/productos/${productId}`;
      const body = JSON.stringify({ nombreProducto: newName });
      
      console.log('Actualizando nombre:', { url, body, productId, newName });

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
        throw new Error(`Error al actualizar el nombre: ${response.status} ${response.statusText}`);
      }

      // Actualizar el estado local
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, nombreProducto: newName } : product
        )
      );

      setFilteredProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, nombreProducto: newName } : product
        )
      );

      setEditingNameId(null);
      setEditingNameValue("");
      addToast({
        title: "¡Éxito!",
        description: "Nombre actualizado correctamente",
        color: "success",
      });
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
      alert("Error al actualizar el nombre. Intente nuevamente.");
    }
  };

  const handleNameSaveWithValidation = async (productId: number) => {
    const trimmedValue = editingNameValue.trim();
    
    // Si no se escribió nada, mantener el original
    if (editingNameValue === "") {
      setEditingNameId(null);
      setEditingNameValue("");
      return;
    }
    
    // Si se dejó vacío, mostrar modal de confirmación
    if (trimmedValue === "") {
      setPendingEmptyField({
        type: 'name',
        productId,
        value: trimmedValue
      });
      setIsConfirmationModalOpen(true);
      return;
    }
    
    // Si tiene contenido válido, guardar directamente
    if (trimmedValue.length < 2) {
      alert("El nombre del producto debe tener al menos 2 caracteres");
      return;
    }
    
    await handleNameSave(productId);
  };

  const handleNameCancel = () => {
    setEditingNameId(null);
    setEditingNameValue("");
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, productId: number) => {
    if (e.key === 'Enter') {
      handleNameSaveWithValidation(productId);
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  // Funciones para edición de descripción
  const handleDescEdit = (product: Product) => {
    setEditingDescId(product.id);
    setEditingDescValue(""); // Inicializar vacío para usar placeholder
  };

  const handleDescSave = async (productId: number) => {
    try {
      const newDesc = editingDescValue.trim();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/productos/${productId}`;
      const body = JSON.stringify({ descripcion: newDesc });
      
      console.log('Actualizando descripción:', { url, body, productId, newDesc });

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
        throw new Error(`Error al actualizar la descripción: ${response.status} ${response.statusText}`);
      }

      // Actualizar el estado local
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, descripcion: newDesc } : product
        )
      );

      setFilteredProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, descripcion: newDesc } : product
        )
      );

      setEditingDescId(null);
      setEditingDescValue("");
      addToast({
        title: "¡Éxito!",
        description: "Descripción actualizada correctamente",
        color: "success",
      });
    } catch (error) {
      console.error("Error al actualizar la descripción:", error);
      alert("Error al actualizar la descripción. Intente nuevamente.");
    }
  };

  const handleDescSaveWithValidation = async (productId: number) => {
    const trimmedValue = editingDescValue.trim();
    
    // Si no se escribió nada, mantener el original
    if (editingDescValue === "") {
      setEditingDescId(null);
      setEditingDescValue("");
      return;
    }
    
    // Si se dejó vacío, mostrar modal de confirmación
    if (trimmedValue === "") {
      setPendingEmptyField({
        type: 'desc',
        productId,
        value: trimmedValue
      });
      setIsConfirmationModalOpen(true);
      return;
    }
    
    // Si tiene contenido, guardar directamente
    await handleDescSave(productId);
  };

  const handleDescCancel = () => {
    setEditingDescId(null);
    setEditingDescValue("");
  };

  const handleDescKeyDown = (e: React.KeyboardEvent, productId: number) => {
    if (e.key === 'Enter') {
      handleDescSaveWithValidation(productId);
    } else if (e.key === 'Escape') {
      handleDescCancel();
    }
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

  const handlePriceSaveWithValidation = async (productId: number) => {
    const trimmedValue = editingPriceValue.trim();
    
    // Si no se escribió nada, mantener el original
    if (editingPriceValue === "") {
      setEditingPriceId(null);
      setEditingPriceValue("");
      return;
    }
    
    // Si se dejó vacío, mostrar modal de confirmación
    if (trimmedValue === "") {
      setPendingEmptyField({
        type: 'price',
        productId,
        value: trimmedValue
      });
      setIsConfirmationModalOpen(true);
      return;
    }
    
    // Si tiene contenido válido, guardar directamente
    const newPrice = parseFloat(trimmedValue);
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Por favor ingrese un precio válido mayor a 0");
      return;
    }
    
    await handlePriceSave(productId);
  };

  const handleConfirmEmptyField = async () => {
    if (!pendingEmptyField) return;
    
    const { type, productId, value } = pendingEmptyField;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = `${apiUrl}/productos/${productId}`;
      
      let body;
      if (type === 'name') {
        body = JSON.stringify({ nombreProducto: value });
      } else if (type === 'desc') {
        body = JSON.stringify({ descripcion: value });
      } else if (type === 'price') {
        body = JSON.stringify({ precio: 0 });
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el campo: ${response.status} ${response.statusText}`);
      }

      // Actualizar el estado local
      setProducts(prevProducts =>
        prevProducts.map(product => {
          if (product.id === productId) {
            if (type === 'name') return { ...product, nombreProducto: value };
            if (type === 'desc') return { ...product, descripcion: value };
            if (type === 'price') return { ...product, precio: 0 };
          }
          return product;
        })
      );

      setFilteredProducts(prevProducts =>
        prevProducts.map(product => {
          if (product.id === productId) {
            if (type === 'name') return { ...product, nombreProducto: value };
            if (type === 'desc') return { ...product, descripcion: value };
            if (type === 'price') return { ...product, precio: 0 };
          }
          return product;
        })
      );

      // Limpiar estados de edición
      setEditingNameId(null);
      setEditingNameValue("");
      setEditingDescId(null);
      setEditingDescValue("");
      setEditingPriceId(null);
      setEditingPriceValue("");
      
      addToast({
        title: "¡Éxito!",
        description: "Campo actualizado correctamente",
        color: "success",
      });
    } catch (error) {
      console.error("Error al actualizar el campo:", error);
      alert("Error al actualizar el campo. Intente nuevamente.");
    } finally {
      setIsConfirmationModalOpen(false);
      setPendingEmptyField(null);
    }
  };

  const handleCancelEmptyField = () => {
    setIsConfirmationModalOpen(false);
    setPendingEmptyField(null);
    
    // Limpiar estados de edición
    setEditingNameId(null);
    setEditingNameValue("");
    setEditingDescId(null);
    setEditingDescValue("");
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  // Función para determinar el estilo de un campo
  const getFieldStyle = (fieldType: 'name' | 'desc' | 'price', productId: number) => {
    const isEditing = 
      (fieldType === 'name' && editingNameId === productId) ||
      (fieldType === 'desc' && editingDescId === productId) ||
      (fieldType === 'price' && editingPriceId === productId);
    
    return {
      fontWeight: "bold" as const,
      color: isEditing ? "#0070f3" : "inherit",
      cursor: "pointer" as const
    };
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:justify-between mb-5 gap-2">
          <Input
            placeholder="Buscar producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={
              <SearchIcon className="flex-shrink-0 pointer-events-none text-default-400" />
            }
          />
          <div className="flex items-center gap-2">
            <label htmlFor="sortMode" className="text-sm font-medium">Ordenar por:</label>
            <select
              id="sortMode"
              className="border rounded px-2 py-1"
              value={sortMode}
              onChange={e => setSortMode(e.target.value as 'id' | 'nombre')}
            >
              <option value="id">ID/SKU</option>
              <option value="nombre">Nombre (A-Z)</option>
            </select>
          </div>
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
                      {column.uid === "nombreProducto" && (
                        editingNameId === product.id ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={editingNameValue}
                                onChange={(e) => setEditingNameValue(e.target.value)}
                                onKeyDown={(e) => handleNameKeyDown(e, product.id)}
                                className="w-32"
                                size="sm"
                                placeholder={product.nombreProducto}
                              />
                              <button
                                tabIndex={0}
                                onClick={() => handleNameSaveWithValidation(product.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleNameSaveWithValidation(product.id);
                                  }
                                }}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                ✓
                              </button>
                              <button
                                tabIndex={0}
                                onClick={handleNameCancel}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleNameCancel();
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="text-xs text-blue-600">
                              Para dejar el campo vacío escriba un espacio
                            </div>
                          </div>
                        ) : (
                          <span 
                            role="button"
                            tabIndex={0}
                            style={getFieldStyle('name', product.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNameEdit(product);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleNameEdit(product);
                              }
                            }}
                            title="Haz clic para editar el nombre"
                          >
                            {product.nombreProducto}
                          </span>
                        )
                      )}
                      {column.uid === "descripcion" && (
                        editingDescId === product.id ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={editingDescValue}
                                onChange={(e) => setEditingDescValue(e.target.value)}
                                onKeyDown={(e) => handleDescKeyDown(e, product.id)}
                                className="w-40"
                                size="sm"
                                placeholder={product.descripcion || "Sin descripción"}
                              />
                              <button
                                tabIndex={0}
                                onClick={() => handleDescSaveWithValidation(product.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleDescSaveWithValidation(product.id);
                                  }
                                }}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                ✓
                              </button>
                              <button
                                tabIndex={0}
                                onClick={handleDescCancel}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    handleDescCancel();
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="text-xs text-blue-600">
                              Para dejar el campo vacío escriba un espacio
                            </div>
                          </div>
                        ) : (
                          <span 
                            role="button"
                            tabIndex={0}
                            style={getFieldStyle('desc', product.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDescEdit(product);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleDescEdit(product);
                              }
                            }}
                            title="Haz clic para editar la descripción"
                          >
                            {product.descripcion || "Sin descripción"}
                          </span>
                        )
                      )}
                      {column.uid === "cantidad_stock" && (
                        <span style={getCantidadStyle(product.cantidad_stock)}>
                          {product.cantidad_stock}
                        </span>
                      )}
                      {column.uid === "precioCosto" && product.precioCosto}
                      {column.uid === "precio" && (
                        editingPriceId === product.id ? (
                          <div className="flex flex-col gap-1">
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
                                onClick={() => handlePriceSaveWithValidation(product.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handlePriceSaveWithValidation(product.id);
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
                            <div className="text-xs text-blue-600">
                              Para dejar el campo vacío escriba un espacio
                            </div>
                          </div>
                        ) : (
                          <span 
                            role="button"
                            tabIndex={0}
                            style={getFieldStyle('price', product.id)}
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

      <Modal isOpen={isConfirmationModalOpen} onClose={handleCancelEmptyField}>
        <ModalContent>
          <ModalHeader>Confirmación</ModalHeader>
          <ModalBody>
            <p>¿Estás seguro de que quieres actualizar el campo &quot;{pendingEmptyField?.type === 'name' ? 'nombre' : pendingEmptyField?.type === 'desc' ? 'descripción' : 'precio'}&quot;?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onPress={handleCancelEmptyField}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleConfirmEmptyField}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

TableProducts.displayName = "TableProducts";

export default TableProducts;
