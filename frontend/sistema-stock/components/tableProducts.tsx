// src/components/TableProducts.tsx
"use client";

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Pagination,
  Button,
} from "@nextui-org/react";
import { FaEye, FaFilter } from "react-icons/fa";
import ProductModal from "../components/ProductModal";
import MultifilterModal from "./MultifilterModal";

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

type BatchChanges = {
  precioCostoPercentage: number;
  precioListaPercentage: number;
};

// Definición de las columnas de la tabla
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

// Estilo para resaltar Precio al Público
const precioPublicoStyle = {
  fontWeight: "bold",
  color: "#0070f3", // Azul para resaltar
};

// Declaración del componente TableProducts con forwardRef
const TableProducts = forwardRef((props, ref) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultifilterOpen, setIsMultifilterOpen] = useState(false);
  const itemsPerPage = 10;

  // Simulación de datos de productos (puedes reemplazar esto con props o una llamada a la API)
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

  // Carga inicial de productos
  useEffect(() => {
    // Simulamos una llamada a la API
    setTimeout(() => {
      setProducts(productsData);
      setFilteredProducts(productsData);
    }, 500);
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

  // Funciones para Manejar Actualizaciones en Lote
  const handleBatchUpdate = (updatedProducts: Product[], changes: BatchChanges) => {
    const updatedList = products.map((product) => {
      if (updatedProducts.find((up) => up.id === product.id)) {
        const newPrecioCosto =
          changes.precioCostoPercentage !== 0
            ? Number(
                (
                  product.precioCosto *
                  (1 + changes.precioCostoPercentage / 100)
                ).toFixed(2)
              )
            : product.precioCosto;

        const newPrecioLista =
          changes.precioListaPercentage !== 0
            ? Number(
                (
                  product.precioLista *
                  (1 + changes.precioListaPercentage / 100)
                ).toFixed(2)
              )
            : product.precioLista;

        const newPrecioPublico =
          newPrecioLista - (newPrecioLista * product.descuento) / 100;

        const updatedProduct = {
          ...product,
          precioCosto: newPrecioCosto,
          precioLista: newPrecioLista,
          precioPublico: Number(newPrecioPublico.toFixed(2)),
        };

        // Console.log de las actualizaciones en lote
        console.log("Actualización en Lote:", JSON.stringify(updatedProduct, null, 2));

        return updatedProduct;
      }
      return product;
    });

    setProducts(updatedList);
    setFilteredProducts(updatedList);
  };

  // Exponer la función de actualización a través de ref
  useImperativeHandle(ref, () => ({
    updateTable: () => {
      setFilteredProducts(products);
    },
  }));

  // Definición de las funciones faltantes
  const handleSaveProduct = (updatedProduct: Product) => {
    const updatedList = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    setProducts(updatedList);
    setFilteredProducts(updatedList);
    console.log("Producto Actualizado:", JSON.stringify(updatedProduct, null, 2));
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: number) => {
    const updatedList = products.filter((product) => product.id !== productId);
    setProducts(updatedList);
    setFilteredProducts(updatedList);
    console.log("Producto Eliminado:", JSON.stringify({ id: productId }, null, 2));
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
    const toggledProduct = updatedList.find((p) => p.id === productId);
    if (toggledProduct) {
      console.log(
        "Producto Habilitado/Deshabilitado:",
        JSON.stringify({
          id: toggledProduct.id,
          habilitado: toggledProduct.habilitado,
        }, null, 2)
      );
    }
  };

  return (
    <>
      {/* Botón para Abrir el Modal de Multifiltro */}
      <div className="flex justify-between mb-5">
        <Input
          isClearable
          placeholder="Buscar producto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          color="secondary"
          onClick={() => setIsMultifilterOpen(true)}
          className="flex items-center"
        >
          <FaFilter className="mr-2" /> {/* Icono con margen derecho */}
          Multifiltro
        </Button>

      </div>

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
                  className="cursor-pointer"
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
        className="mt-5 flex justify-center"
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

      {/* Modal de Multifiltro */}
      <MultifilterModal
        isOpen={isMultifilterOpen}
        onClose={() => setIsMultifilterOpen(false)}
        products={products}
        onBatchUpdate={handleBatchUpdate}
      />
    </>
  );
});

TableProducts.displayName = "TableProducts";

export default TableProducts;
