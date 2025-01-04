import { useState } from 'react';
import { Client } from '../types/budget';

export const useClientSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const searchClients = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/clientes?search=${searchTerm}`);
      
      if (!response.ok) throw new Error('Error al buscar clientes');
      const data = await response.json();
      
      const filteredData = data.filter((client: Client) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          client.nombre?.toLowerCase().includes(searchLower) ||
          client.direccion?.toLowerCase().includes(searchLower) ||
          client.telefono?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower)
        );
      });
      
      setClients(filteredData);
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
    clients,
    searchClients
  };
}; 