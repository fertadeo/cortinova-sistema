import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Tooltip } from "@heroui/react";
import { TableItem as BaseTableItem } from '../../types/budget';
import { useState, useEffect } from 'react';

interface TableItem extends Omit<BaseTableItem, 'id'> {
  localId: string;
  parentId: number;
}

interface BudgetTableProps {
  items: BaseTableItem[];
  onQuantityChange: (id: number, quantity: string) => void;
  onRemoveItem: (id: number) => void;
  onEditItem: (item: BaseTableItem) => void;
  onItemsChange?: (items: BaseTableItem[]) => void;
}

export const BudgetTable = ({ items, onQuantityChange, onRemoveItem, onEditItem, onItemsChange }: BudgetTableProps) => {
  const generateLocalId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createTableItem = (baseItem: BaseTableItem): TableItem => {
    const { id, ...rest } = baseItem;
    return {
      ...rest,
      localId: generateLocalId(),
      parentId: id
    };
  };

  const [tableItems, setTableItems] = useState<TableItem[]>(() => 
    items.map(createTableItem)
  );

  useEffect(() => {
    setTableItems(items.map(createTableItem));
  }, [items]);

  const handleDuplicate = (item: TableItem) => {
    try {
      const duplicatedItem: TableItem = {
        ...JSON.parse(JSON.stringify(item)),
        localId: generateLocalId(),
        description: `${item.description} (copia)`,
      };

      const newItems = [...tableItems, duplicatedItem];
      setTableItems(newItems);

      // Convertir a formato BaseTableItem para el componente padre
      const baseItems = newItems.map(item => ({
        ...item,
        id: item.parentId
      }));
      onItemsChange?.(baseItems);
    } catch (error) {
      console.error("Error al duplicar el item:", error);
    }
  };

  const handleQuantityChange = (localId: string, quantity: string) => {
    try {
      const newQuantity = parseFloat(quantity) || 0;
      const newItems = tableItems.map(item => 
        item.localId === localId 
          ? {
              ...item,
              quantity: newQuantity,
              total: item.price * newQuantity
            }
          : item
      );
      setTableItems(newItems);
      
      // Notificar al padre solo del item modificado
      const modifiedItem = newItems.find(item => item.localId === localId);
      if (modifiedItem) {
        onQuantityChange(modifiedItem.parentId, quantity);
      }

      // Convertir a formato BaseTableItem para el componente padre
      const baseItems = newItems.map(item => ({
        ...item,
        id: item.parentId
      }));
      onItemsChange?.(baseItems);
    } catch (error) {
      console.error("Error al cambiar la cantidad:", error);
    }
  };

  const handleRemoveItem = (localId: string) => {
    try {
      const itemToRemove = tableItems.find(item => item.localId === localId);
      const newItems = tableItems.filter(item => item.localId !== localId);
      
      setTableItems(newItems);
      if (itemToRemove) {
        onRemoveItem(itemToRemove.parentId);
      }

      // Convertir a formato BaseTableItem para el componente padre
      const baseItems = newItems.map(item => ({
        ...item,
        id: item.parentId
      }));
      onItemsChange?.(baseItems);
    } catch (error) {
      console.error("Error al eliminar el item:", error);
    }
  };

  const handleEdit = (item: TableItem) => {
    try {
      const itemToEdit = {
        ...item,
        id: item.parentId
      };
      onEditItem(itemToEdit);
    } catch (error) {
      console.error("Error al editar el item:", error);
    }
  };

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
        return (
          <TableCell>
            <div>{item.description}</div>
          </TableCell>
        );
      case "price":
        return <TableCell>${item.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>;
      case "quantity":
        return (
          <TableCell>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.localId, e.target.value)}
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
        return <TableCell>${item.total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>;
      case "actions":
        return (
          <TableCell className="flex justify-end gap-2 pr-0.5">
            <Button 
              color="success"
              variant="flat"
              size="sm"
              onClick={() => handleEdit(item)}
            >
              Modificar pedido
            </Button>
            
            <Tooltip content="Duplicar pedido con las mismas medidas">
              <Button
                className="hidden"
                color="primary"
                variant="flat"
                size="sm"
                onClick={() => handleDuplicate(item)}
                isIconOnly
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </Button>
            </Tooltip>

            <Tooltip content="Eliminar pedido" color="danger">
              <Button 
                color="danger"
                variant="solid"
                size="sm"
                isIconOnly
                onClick={() => handleRemoveItem(item.localId)}
              >
                ✕
              </Button>
            </Tooltip>
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
      <TableBody items={tableItems}>
        {(item) => (
          <TableRow key={item.localId}>
            {(columnKey) => renderCell(item, columnKey)}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}; 