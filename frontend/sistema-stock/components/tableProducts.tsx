import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

type Product = {
  id: number;
  nombreProducto: string;
  descripcion: string;
  precio: number;
  divisa: string;
  cantidad_stock: number;
  descuento: number;
};

const TableProducts = forwardRef((props, ref) => {
  const [products, setProducts] = useState<Product[]>([]);

  useImperativeHandle(ref, () => ({
    updateTable: async () => {
      console.log("Tabla actualizada");
      await fetchProducts(); // Llamar a la función para actualizar los productos
    },
  }));

  // Función para obtener los productos
  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Usa la variable de entorno aquí
      const response = await fetch(`${apiUrl}/productos/importar-productos`);
      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Table aria-label="Tabla de productos">
      <TableHeader>
        <TableColumn>ID/SKU</TableColumn>
        <TableColumn>Producto</TableColumn>
        <TableColumn>Disponible</TableColumn>
        <TableColumn>Descripción</TableColumn>
        <TableColumn>Precio</TableColumn>
        <TableColumn>Divisa</TableColumn>
        <TableColumn>Descuento</TableColumn>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>{product.id}</TableCell>
            <TableCell>{product.nombreProducto}</TableCell>
            <TableCell>{product.cantidad_stock}</TableCell>
            <TableCell>{product.descripcion}</TableCell>
            <TableCell>{product.precio}</TableCell>
            <TableCell>{product.divisa}</TableCell>
            <TableCell>{product.descuento}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
});

export default TableProducts;
