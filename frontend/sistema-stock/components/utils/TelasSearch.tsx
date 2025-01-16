import React, { useEffect, useState } from 'react';
import { Input, Spinner } from "@nextui-org/react";
import { Tela, TelaResponse } from '@/types/telas';

interface TelasSearchProps {
  searchTela: string;
  onSearchChange: (value: string) => void;
  telasFiltradas: Tela[];
  showTelasList: boolean;
  onTelaSelect: (tela: Tela) => void;
}

export const TelasSearch = ({
  searchTela,
  onSearchChange,
  telasFiltradas,
  showTelasList,
  onTelaSelect
}: TelasSearchProps) => {
  const [telas, setTelas] = useState<Tela[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTelas, setFilteredTelas] = useState<Tela[]>([]);

  // Opción "Sin tela" estática
  const sinTelaOption: Tela = {
    id: 0,
    nombre: "Sin tela",
    tipo: "",
    color: "",
    precio: "0"
  };

  useEffect(() => {
    console.log('Componente montado, cargando telas...');
    fetchTelas();
  }, []);

  const fetchTelas = async () => {
    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/productos/telas/`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las telas');
      }
      
      const data: TelaResponse = await response.json();
      
      if (data.productos && Array.isArray(data.productos)) {
        const telasFormateadas = data.productos.map(producto => ({
          id: producto.id,
          nombre: producto.nombreProducto,
          tipo: producto.descripcion || '',
          color: '',
          precio: Number(producto.precio) || 0
        }));
        // Agregar "Sin tela" como primera opción
        const telasConPrecioString = telasFormateadas.map(tela => ({
          ...tela,
          precio: tela.precio.toString()
        }));
        setTelas([sinTelaOption, ...telasConPrecioString]);
        setFilteredTelas([sinTelaOption, ...telasConPrecioString]); 
      }
    } catch (error) {
      console.error('Error al cargar telas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    
    if (value === '*') {
      // Mostrar todas las telas, incluyendo "Sin tela"
      setFilteredTelas([sinTelaOption, ...telas.slice(1)]);
    } else if (value.trim() !== '') {
      const searchTerm = value.toLowerCase().trim();
      // Filtrar telas pero mantener "Sin tela" como primera opción
      const filtered = telas
        .slice(1) // Excluir "Sin tela" de la búsqueda
        .filter(tela => 
          tela.nombre.toLowerCase().includes(searchTerm) ||
          (tela.tipo && tela.tipo.toLowerCase().includes(searchTerm))
        );
      setFilteredTelas([sinTelaOption, ...filtered]);
    } else {
      // Cuando no hay búsqueda, mostrar todas las telas con "Sin tela" primero
      setFilteredTelas([sinTelaOption, ...telas.slice(1)]);
    }
  };

  return (
    <div className="pt-4 mt-4 border-t">
      <div className="relative">
        <Input
          label="Buscar Tela"
          placeholder="Escribe para buscar telas o * para ver todas..."
          value={searchTela}
          onValueChange={handleSearchChange}
          variant="bordered"
          className="mb-2"
          endContent={isLoading && <Spinner size="sm" />}
        />

        {showTelasList && (
          <div className="overflow-auto absolute z-50 w-full max-h-60 bg-white rounded-lg border shadow-lg">
            {filteredTelas.length > 0 ? (
              filteredTelas.map((tela) => (
                <button
                  key={tela.id}
                  className="p-3 w-full text-left border-b hover:bg-gray-50 last:border-b-0"
                  onClick={() => {
                    console.log('Tela seleccionada:', tela);
                    onTelaSelect(tela);
                  }}
                  tabIndex={0}
                >
                  <div className="font-medium">{tela.nombre}</div>
                  {tela.id !== 0 && ( // Solo mostrar detalles si no es "Sin tela"
                    <div className="text-sm text-gray-600">
                      {tela.color && <span className="mr-2">Color: {tela.color}</span>}
                      {tela.precio && Number(tela.precio) > 0 && <span>Precio: ${Number(tela.precio).toFixed(2)}</span>}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No se encontraron resultados...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 