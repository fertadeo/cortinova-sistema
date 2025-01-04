import { useState, useRef } from 'react';
import { Input, Button } from "@nextui-org/react";
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
  const { isLoading, products, searchProducts } = useProductSearch();

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);
    setShowProductsList(true);

    if (!value.trim()) {
      setShowProductsList(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchProducts(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleProductSelect = (product: Product) => {
    const newTableItem: TableItem = {
      id: Date.now(),
      productId: product.id,
      name: product.nombreProducto,
      description: product.descripcion,
      quantity: 1,
      price: Number(product.precio)
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
          placeholder="Escribe para buscar..."
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
          className="overflow-auto absolute z-50 mt-1 w-full max-h-60 bg-white rounded-md border border-gray-200 shadow-lg"
        >
          {products.map((product) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 last:border-b-0"
              onClick={() => handleProductSelect(product)}
              onKeyDown={(e) => e.key === 'Enter' && handleProductSelect(product)}
            >
              <div className="font-semibold">{product.nombreProducto}</div>
              <div className="grid grid-cols-1 gap-1 text-sm text-gray-600">
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
    </div>
  );
}; 