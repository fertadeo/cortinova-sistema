import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Tooltip, Select, SelectItem } from "@heroui/react";
import { TableItem as BaseTableItem, BudgetOption } from '../../types/budget';
import { useState, useEffect } from 'react';

interface LocalTableItem extends Omit<BaseTableItem, 'id' | 'detalles'> {
  localId: string;
  parentId: number;
  detalles?: {
    sistema: string;
    detalle: string;
    caidaPorDelante: string;
    colorSistema: string;
    ladoComando: string;
    tipoTela: string;
    soporteIntermedio: boolean;
    soporteDoble: boolean;
    medidaId?: number;
    ancho?: number;
    alto?: number;
    ubicacion?: string;
    accesorios?: any[];
    incluirMotorizacion?: boolean;
    precioMotorizacion?: number;
    tipoApertura?: string;
    ladoApertura?: string;
    // Propiedades de la segunda tela
    tela2?: any;
    multiplicadorTela2?: number;
    cantidadTelaManual2?: number | null;
  };
}

interface BudgetTableProps {
  items: BaseTableItem[];
  onQuantityChange: (id: number, quantity: string) => void;
  onRemoveItem: (id: number) => void;
  onEditItem: (item: BaseTableItem) => void;
  onItemsChange?: (items: BaseTableItem[]) => void;
  esEstimativo?: boolean;
  opciones?: BudgetOption[];
  onOpcionChange?: (itemId: number, opcionId: string) => void;
}

export const BudgetTable = ({ 
  items, 
  onQuantityChange, 
  onRemoveItem, 
  onEditItem, 
  onItemsChange,
  esEstimativo = false,
  opciones = [],
  onOpcionChange
}: BudgetTableProps) => {
  const generateLocalId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const createTableItem = (baseItem: BaseTableItem): LocalTableItem => {
    const { id, ...rest } = baseItem;
    return {
      ...rest,
      localId: generateLocalId(),
      parentId: id
    };
  };

  const [tableItems, setTableItems] = useState<LocalTableItem[]>(() => 
    items.map(createTableItem)
  );

  useEffect(() => {
    setTableItems(items.map(createTableItem));
  }, [items]);

  const handleDuplicate = (item: LocalTableItem) => {
    try {
      const duplicatedItem: LocalTableItem = {
        ...JSON.parse(JSON.stringify(item)),
        localId: generateLocalId(),
        description: `${item.description} (copia)`,
        detalles: {
          ...item.detalles,
          tela2: item.detalles?.tela2 || null,
          multiplicadorTela2: item.detalles?.multiplicadorTela2 || null,
          cantidadTelaManual2: item.detalles?.cantidadTelaManual2 || null,
        }
      };

      const newItems = [...tableItems, duplicatedItem];
      setTableItems(newItems);

      const baseItems = newItems.map(item => ({
        ...item,
        id: item.parentId
      })) as BaseTableItem[];
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
              total: (() => {
                const baseTotal = item.price * newQuantity;
                const motorizacion = item.detalles?.incluirMotorizacion 
                  ? (item.detalles.precioMotorizacion || 0) * newQuantity 
                  : 0;
                return baseTotal + motorizacion;
              })()
            }
          : item
      );
      setTableItems(newItems);
      
      const modifiedItem = newItems.find(item => item.localId === localId);
      if (modifiedItem) {
        onQuantityChange(modifiedItem.parentId, quantity);
      }

      const baseItems = newItems.map(item => ({
        ...item,
        id: item.parentId
      })) as BaseTableItem[];
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

      const baseItems = newItems.map(item => ({
        ...item,
        id: item.parentId
      })) as BaseTableItem[];
      onItemsChange?.(baseItems);
    } catch (error) {
      console.error("Error al eliminar el item:", error);
    }
  };

  const handleEdit = (item: LocalTableItem) => {
    try {
      const itemToEdit = {
        ...item,
        id: item.parentId
      } as BaseTableItem;
      onEditItem(itemToEdit);
    } catch (error) {
      console.error("Error al editar el item:", error);
    }
  };

  const handleOpcionChange = (localId: string, opcionId: string) => {
    const item = tableItems.find(i => i.localId === localId);
    if (item && onOpcionChange) {
      onOpcionChange(item.parentId, opcionId);
    }
  };

  const columns = esEstimativo 
    ? [
        { name: "PRODUCTO", uid: "name" },
        { name: "DESCRIPCIÓN", uid: "description" },
        { name: "OPCIÓN", uid: "opcion" },
        { name: "PRECIO UNIDAD", uid: "price" },
        { name: "CANTIDAD", uid: "quantity" },
        { name: "SUBTOTAL", uid: "subtotal" },
        { name: "ACCIONES", uid: "actions" }
      ]
    : [
        { name: "PRODUCTO", uid: "name" },
        { name: "DESCRIPCIÓN", uid: "description" },
        { name: "PRECIO UNIDAD", uid: "price" },
        { name: "CANTIDAD", uid: "quantity" },
        { name: "SUBTOTAL", uid: "subtotal" },
        { name: "ACCIONES", uid: "actions" }
      ];

  const renderCell = (item: LocalTableItem, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return <TableCell>{item.name}</TableCell>;
      case "description":
        return (
          <TableCell>
            <div>{item.description}</div>
          </TableCell>
        );
      case "opcion":
        return (
          <TableCell>
            <Select
              size="sm"
              className="w-24"
              selectedKeys={item.opcion ? [item.opcion] : []}
              onChange={(e) => handleOpcionChange(item.localId, e.target.value)}
              placeholder="Seleccionar"
              aria-label="Seleccionar opción"
            >
              {opciones.filter(op => op.activa).map(opcion => (
                <SelectItem key={opcion.id}>
                  {opcion.id}
                </SelectItem>
              ))}
            </Select>
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
