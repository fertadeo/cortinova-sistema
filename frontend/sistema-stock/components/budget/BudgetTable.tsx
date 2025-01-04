import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from "@nextui-org/react";
import { TableItem } from '../../types/budget';

interface BudgetTableProps {
  items: TableItem[];
  onQuantityChange: (id: number, quantity: string) => void;
  onRemoveItem: (id: number) => void;
}

export const BudgetTable = ({ items, onQuantityChange, onRemoveItem }: BudgetTableProps) => {
  const columns = [
    { name: "PRODUCTO", uid: "name" },
    { name: "DESCRIPCIÓN", uid: "description" },
    { name: "PRECIO UNIDAD", uid: "price" },
    { name: "CANTIDAD", uid: "quantity" },
    { name: "SUBTOTAL", uid: "subtotal" },
    { name: "ACCIONES", uid: "actions" }
  ];

  const renderCell = (item: TableItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return <TableCell>{item.name}</TableCell>;
      case "description":
        return <TableCell>{item.description}</TableCell>;
      case "price":
        return <TableCell>${item.price.toFixed(2)}</TableCell>;
      case "quantity":
        return (
          <TableCell>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onQuantityChange(item.id, e.target.value)}
              className="p-1 w-20 rounded border"
              min="0"
              step="0.1"
            />
            <span className="text-xs italic text-gray-500">
              (usa coma para decimales)
            </span>
          </TableCell>
        );
      case "subtotal":
        return <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>;
      case "actions":
        return (
          <TableCell className="flex justify-end pr-0.5">
            <Button 
              color="danger"
              variant="solid"
              size="sm"
              isIconOnly
              onClick={() => onRemoveItem(item.id)}
            >
              ✕
            </Button>
          </TableCell>
        );
      default:
        return <TableCell>-</TableCell>;
    }
  };

  return (
    <Table aria-label="Budget Table">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid}>{column.name}</TableColumn>
        )}
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => renderCell(item, columnKey)}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}; 