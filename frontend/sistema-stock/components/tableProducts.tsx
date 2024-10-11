import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
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

const columns = [
  { name: "ID/SKU", uid: "id", sortable: true },
  { name: "Producto", uid: "nombreProducto", sortable: true },
  { name: "Disponible", uid: "cantidad_stock", sortable: true },
  { name: "Descripción", uid: "descripcion" },
  { name: "Precio", uid: "precio", sortable: true },
  { name: "Divisa", uid: "divisa" },
  { name: "Descuento", uid: "descuento", sortable: true },
];

// const statusOptions = [
//   { name: "Active", uid: "active" },
//   { name: "Paused", uid: "paused" },
//   { name: "Vacation", uid: "vacation" },
// ];

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
  const [searchTerm, setSearchTerm] = useState(""); // Estado para búsqueda
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Productos filtrados
  const [currentPage, setCurrentPage] = useState(1); // Paginación
  const itemsPerPage = 10;

  useImperativeHandle(ref, () => ({
    updateTable: async () => {
      console.log("Tabla actualizada");
      await fetchProducts();
    },
  }));

  const fetchProducts = async () => {

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos/importar-productos`);
      
      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Inicialmente, sin filtros
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Actualiza los productos filtrados cuando cambia la búsqueda
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

  // Paginación
  const handlePageChange = (page: React.SetStateAction<number>) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <Input
        isClearable
        placeholder="Buscar producto"
        value={searchTerm}
        style={{ marginBottom: "20px" }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
              <TableCell>{product.cantidad_stock}</TableCell>
              <TableCell>{product.descripcion}</TableCell>
              <TableCell>{product.precio}</TableCell>
              <TableCell>{product.divisa}</TableCell>
              <TableCell>{product.descuento}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>


      <Pagination
        initialPage={1}
        onChange={handlePageChange}
        page={currentPage}
        style={{ marginTop: "20px", justifyContent: "center" }}
        total={Math.ceil(filteredProducts.length / itemsPerPage)}
      />

    </>
  );
});

TableProducts.displayName = "TableProducts";


export default TableProducts;
