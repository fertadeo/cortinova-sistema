import { useState } from 'react';
import { Product } from '../types/budget';

const normalizeProducts = (data: unknown): Product[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const nested = data as { data?: Product[]; productos?: Product[] };
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.productos)) return nested.productos;
  }
  return [];
};

export const useProductSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const searchProducts = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos`);

      if (!response.ok) throw new Error('Error al buscar productos');
      const data = await response.json();
      const productsList = normalizeProducts(data);

      const trimmed = searchTerm.trim();
      // '*' o vacío: devolver todos los productos de la base
      if (!trimmed || trimmed === '*') {
        setProducts(productsList);
        return productsList;
      }

      const searchLower = trimmed.toLowerCase();
      const filteredData = productsList.filter((product: Product) => {
        return (
          product.nombreProducto?.toLowerCase().includes(searchLower) ||
          product.descripcion?.toLowerCase().includes(searchLower) ||
          String(product.id).includes(trimmed)
        );
      });

      setProducts(filteredData);
      return filteredData;
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    products,
    searchProducts
  };
};
