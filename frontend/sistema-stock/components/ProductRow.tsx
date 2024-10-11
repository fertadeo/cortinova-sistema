import React from "react";
import { TableRow, TableCell } from "@nextui-org/react";
import {
  FaPencilAlt,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

type Product = {
  id: number;
  nombreProducto: string;
  descripcion: string;
  precio: number;
  divisa: string;
  cantidad_stock: number;
  descuento: number;
  nombreProveedor: string;
  habilitado: boolean;
};

type ProductRowProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (productId: number) => void;
  onToggleEnable: (productId: number, habilitado: boolean) => void;
};

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onView,
  onDelete,
  onToggleEnable,
}) => {
  // Determinar el color del stock
  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-500";
    if (stock <= 2) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <TableRow key={product.id} className="md:flex md:flex-wrap">
      <TableCell>{product.id}</TableCell>
      <TableCell>{product.nombreProducto}</TableCell>
      <TableCell>{product.nombreProveedor}</TableCell>
      <TableCell className={getStockColor(product.cantidad_stock)}>
        {product.cantidad_stock}
      </TableCell>
      <TableCell>{product.descripcion}</TableCell>
      <TableCell>{product.precio}</TableCell>
      <TableCell>{product.divisa}</TableCell>
      <TableCell>{product.descuento}</TableCell>
      {/* Columna de acciones */}
      <TableCell>
        <div className="flex gap-2">
          {/* Botón para habilitar/deshabilitar */}
          {product.habilitado ? (
            <FaToggleOn
              className="cursor-pointer text-green-600"
              onClick={() => onToggleEnable(product.id, false)}
            />
          ) : (
            <FaToggleOff
              className="cursor-pointer text-gray-400"
              onClick={() => onToggleEnable(product.id, true)}
            />
          )}

          {/* Icono para editar */}
          <FaPencilAlt
            className="cursor-pointer"
            onClick={() => onEdit(product)}
          />

          {/* Icono para ver detalles */}
          <FaEye className="cursor-pointer" onClick={() => onView(product)} />

          {/* Icono para eliminar si el stock es 0 */}
          {product.cantidad_stock === 0 && (
            <FaTrash
              className="cursor-pointer text-red-600"
              onClick={() => onDelete(product.id)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
