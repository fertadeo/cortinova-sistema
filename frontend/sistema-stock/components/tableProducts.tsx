import React from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem,
  Chip, Pagination, Selection, ChipProps, SortDescriptor
} from "@nextui-org/react";
import { ChevronDownIcon } from "./utils/chevronDownIcon";
import { SearchIcon } from "./utils/searchIcon";
import { columns, statusOptions } from "./utils/data";
import { capitalize } from "./utils/utils";

const statusColorMap: Record<string, ChipProps["color"]> = {
  "En Stock": "success",
  "Stock Bajo": "warning",
  "Sin Stock": "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["id", "producto", "disponible", "descripcion", "precio", "divisa", "descuento"];

type Product = {
  id: number;
  producto: string;
  disponible: string;
  descripcion: string;
  precio: number;
  divisa: string;
  descuento: number;
};

export default function TableProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "id",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Usa la variable de entorno aquí
        const response = await fetch(`${apiUrl}/productos/importar-productos`);
        if (!response.ok) throw new Error('Error al obtener productos');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredProducts = [...products];

    if (hasSearchFilter) {
      filteredProducts = filteredProducts.filter((product) =>
        product.producto.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredProducts = filteredProducts.filter((product) =>
        Array.from(statusFilter).includes(product.disponible)
      );
    }

    return filteredProducts;
  }, [products, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Product, b: Product) => {
      const first = a[sortDescriptor.column as keyof Product] as number;
      const second = b[sortDescriptor.column as keyof Product] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((product: Product, columnKey: React.Key) => {
    const cellValue = product[columnKey as keyof Product];

    switch (columnKey) {
      case "disponible":
        return (
          <Chip className="capitalize" color={statusColorMap[product.disponible]} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      default:
        return <div className="text-left">{cellValue}</div>;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-md shadow-md">
      <div className="flex items-end justify-between gap-3">
        <Input
          isClearable
          className="w-full sm:max-w-[44%] shadow-sm"
          placeholder="Buscar por producto..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={onClear}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Estado
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Estado de producto"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                Categorías
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Columnas de tabla"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-default-400 text-small">Total {products.length} productos</span>
        <label className="flex items-center text-default-400 text-small">
          Filas por página:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    </div>
  ), [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    products.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => (
    <div className="flex items-center justify-between px-2 py-2">
      <span className="w-[30%] text-small text-default-400">
        {selectedKeys === "all"
          ? "Todos los productos seleccionados"
          : `${selectedKeys.size} de ${filteredItems.length} seleccionados`}
      </span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  ), [page, pages, selectedKeys, filteredItems.length]);

  return (
    <Table
      aria-label="Tabla de productos"
      style={{ height: "auto", minWidth: "100%" }}
      selectionMode="multiple"
      onSelectionChange={setSelectedKeys}
      isCompact
      topContent={topContent}
      bottomContent={bottomContent}
    >
      <TableHeader>
        {headerColumns.map((column) => (
          <TableColumn key={column.uid} allowsSorting>
            {column.name}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody items={sortedItems}>
        {(item: Product) => (
          <TableRow key={item.id}>
            {headerColumns.map((column) => (
              <TableCell key={column.uid}>{renderCell(item, column.uid)}</TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
