import { useState, useRef, useEffect } from 'react';
import { Input, Button } from "@heroui/react";
import { Product, TableItem } from '../../types/budget';
import { useProductSearch } from '../../hooks/useProductSearch';

interface BudgetProductSectionProps {
  onProductSelect: (item: TableItem) => void;
  onShowPedidoModal: () => void;
}

export const BudgetProductSection = ({ onProductSelect, onShowPedidoModal }: BudgetProductSectionProps) => {
  const [showProductsList, setShowProductsList] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const productsListRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLoading, products, searchProducts } = useProductSearch();

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        <Input
          label="Buscar producto"
          placeholder="Escribe para buscar o * para ver todos..."
          value={productSearch}
          onChange={handleProductSearch}
          className="w-full"
          endContent={isLoading && <span className="animate-spin">⌛</span>}
        />
        <Button
          isIconOnly
          color="primary"
          aria-label="Generar pedido"
          className="min-w-unit-10 h-unit-10"
          onClick={onShowPedidoModal}
        >
          📄
        </Button>
      </div>

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
          Sin resultados
        </div>
      )}
    </div>
  );
};
