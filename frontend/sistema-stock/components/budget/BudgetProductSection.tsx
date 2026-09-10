import { useState, useRef, useEffect } from 'react';
import { Input, Button } from "@heroui/react";
import { Product, TableItem } from '../../types/budget';
import { useProductSearch } from '../../hooks/useProductSearch';

interface BudgetProductSectionProps {
  onProductSelect: (item: TableItem) => void;
  onShowPedidoModal: () => void;
  manualItemToEdit?: TableItem | null;
  onManualItemUpdate?: (item: TableItem) => void;
  onCancelManualEdit?: () => void;
}

export const BudgetProductSection = ({
  onProductSelect,
  onShowPedidoModal,
  manualItemToEdit = null,
  onManualItemUpdate,
  onCancelManualEdit
}: BudgetProductSectionProps) => {
  const [showProductsList, setShowProductsList] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualError, setManualError] = useState('');
  const productsListRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoading, products, searchProducts } = useProductSearch();
  const isEditingManual = Boolean(manualItemToEdit);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (manualItemToEdit) {
      setShowManualForm(true);
      setManualName(manualItemToEdit.name || '');
      setManualPrice(
        Number.isFinite(manualItemToEdit.price) ? String(manualItemToEdit.price) : ''
      );
      setManualError('');
    }
  }, [manualItemToEdit]);

  const resetManualForm = () => {
    setManualName('');
    setManualPrice('');
    setManualError('');
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setShowProductsList(false);
      return;
    }

    setShowProductsList(true);
    debounceRef.current = setTimeout(() => {
      searchProducts(value);
    }, 300);
  };

  const handleProductSelect = (product: Product) => {
    const newTableItem: TableItem = {
      id: Date.now(),
      productId: product.id,
      name: product.nombreProducto,
      description: product.descripcion,
      quantity: 1,
      price: typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio,
      total: typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio
    };

    onProductSelect(newTableItem);
    setProductSearch('');
    setShowProductsList(false);
  };

  const parseManualPrice = (value: string) => {
    const normalized = value.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const handleAddManualItem = () => {
    const nombre = manualName.trim();
    const precio = parseManualPrice(manualPrice);

    if (!nombre) {
      setManualError('Ingresá un nombre para el ítem.');
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      setManualError('Ingresá un precio válido.');
      return;
    }

    if (isEditingManual && manualItemToEdit && onManualItemUpdate) {
      onManualItemUpdate({
        ...manualItemToEdit,
        name: nombre,
        description: manualItemToEdit.description || 'Ítem manual',
        price: precio,
        total: precio * (manualItemToEdit.quantity || 1),
        esManual: true,
        detalles: {
          ...(manualItemToEdit.detalles || {
            sistema: '',
            detalle: '',
            caidaPorDelante: '',
            colorSistema: '',
            ladoComando: '',
            tipoTela: '',
            soporteIntermedio: false,
            soporteDoble: false
          }),
          esManual: true
        }
      });
    } else {
      const newTableItem: TableItem = {
        id: Date.now(),
        productId: 0,
        name: nombre,
        description: 'Ítem manual',
        quantity: 1,
        price: precio,
        total: precio,
        esManual: true,
        detalles: {
          sistema: '',
          detalle: '',
          caidaPorDelante: '',
          colorSistema: '',
          ladoComando: '',
          tipoTela: '',
          soporteIntermedio: false,
          soporteDoble: false,
          esManual: true
        }
      };

      onProductSelect(newTableItem);
    }

    resetManualForm();
    setShowManualForm(false);
    setShowProductsList(false);
    setProductSearch('');
  };

  const handleCancelManualForm = () => {
    resetManualForm();
    setShowManualForm(false);
    onCancelManualEdit?.();
  };

  const openManualForm = (presetName = '') => {
    setShowManualForm(true);
    setShowProductsList(false);
    setManualError('');
    if (presetName && !isEditingManual) {
      setManualName(presetName);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 items-end">
        <Input
          label="Buscar producto"
          placeholder="Escribe para buscar o * para ver todos..."
          value={productSearch}
          onChange={handleProductSearch}
          className="flex-1 min-w-[220px]"
          endContent={isLoading && <span className="animate-spin">⌛</span>}
        />
        <Button
          isIconOnly
          color="primary"
          aria-label="Generar pedido de sistema o cortina"
          className="min-w-10 h-10"
          onClick={onShowPedidoModal}
        >
          📄
        </Button>
        <Button
          color={showManualForm ? "secondary" : "default"}
          variant={showManualForm ? "solid" : "bordered"}
          aria-label="Agregar ítem manual"
          className="h-10 px-3"
          onClick={() => {
            if (showManualForm && !isEditingManual) {
              handleCancelManualForm();
            } else {
              openManualForm();
            }
          }}
        >
          + Ítem
        </Button>
      </div>

      {showManualForm && (
        <div className="mt-3 p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">
              {isEditingManual ? 'Editar ítem manual' : 'Ítem manual'}
            </h3>
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
              Nombre y precio libre, sin catálogo
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_auto] md:items-end">
            <Input
              label="Nombre"
              placeholder="Ej: Flete, instalación extra, cadena"
              value={manualName}
              onValueChange={(value) => {
                setManualName(value);
                setManualError('');
              }}
            />
            <Input
              type="number"
              label="Precio"
              placeholder="0"
              value={manualPrice}
              onValueChange={(value) => {
                setManualPrice(value);
                setManualError('');
              }}
              startContent={<span className="text-default-400 text-small">$</span>}
              onWheel={(e) => {
                e.currentTarget.blur();
                e.preventDefault();
              }}
            />
            <div className="flex gap-2">
              <Button color="primary" onClick={handleAddManualItem}>
                {isEditingManual ? 'Actualizar' : 'Agregar'}
              </Button>
              <Button variant="light" onClick={handleCancelManualForm}>
                Cancelar
              </Button>
            </div>
          </div>
          {manualError && (
            <p className="mt-2 text-sm text-red-500">{manualError}</p>
          )}
        </div>
      )}

      {showProductsList && products.length > 0 && (
        <div 
          ref={productsListRef}
          className="overflow-auto absolute z-50 mt-1 w-full max-h-60 bg-white dark:bg-dark-card rounded-md border border-gray-200 dark:border-dark-border shadow-lg"
        >
          {products.map((product) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              className="px-4 py-2 border-b border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 last:border-b-0"
              onClick={() => handleProductSelect(product)}
              onKeyDown={(e) => e.key === 'Enter' && handleProductSelect(product)}
            >
              <div className="font-semibold text-gray-900 dark:text-dark-text">{product.nombreProducto}</div>
              <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 dark:text-dark-text-secondary">
                {product.descripcion && <div>📝 {product.descripcion}</div>}
                <div>💰 ${typeof product.precio === 'number' ? 
                  product.precio.toFixed(2) : 
                  Number(product.precio).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showProductsList && !isLoading && productSearch.trim() && products.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 text-gray-500 dark:text-dark-text-secondary shadow-lg">
          <p>Sin resultados</p>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            className="mt-3"
            onClick={() => openManualForm(productSearch.trim())}
          >
            {`Agregar "${productSearch.trim()}" como ítem manual`}
          </Button>
        </div>
      )}
    </div>
  );
};
