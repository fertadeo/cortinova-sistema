import { useState } from 'react';
import { Product } from '../types/budget';

export const useProductSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const searchProducts = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/productos?search=${searchTerm}`);
      
      if (!response.ok) throw new Error('Error al buscar productos');
      const data = await response.json();
      
      const filteredData = data.filter((product: Product) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.nombreProducto?.toLowerCase().includes(searchLower) ||
          product.descripcion?.toLowerCase().includes(searchLower)
        );
      });
      
      setProducts(filteredData);
      return filteredData;
    } catch (error) {
      console.error('Error:', error);
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