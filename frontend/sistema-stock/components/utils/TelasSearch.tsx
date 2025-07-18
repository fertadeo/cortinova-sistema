import React, { useEffect, useState } from 'react';
import { Input, Spinner } from "@heroui/react";
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
  const [selectedTela, setSelectedTela] = useState<Tela | null>(null);
  const [localFilteredTelas, setLocalFilteredTelas] = useState<Tela[]>([]);

  // Opción "Sin tela" estática
  const sinTelaOption: Tela = {
    id: 0,
    nombre: "Sin tela",
    tipo: "",
    color: "",
    precio: "0"
  };

  useEffect(() => {
    console.log('🔍 [TELASSEARCH] Telas filtradas recibidas:', telasFiltradas);
    console.log('🔍 [TELASSEARCH] Cantidad de telas:', telasFiltradas.length);
    
    // Solo aplicar filtro local si no hay término de búsqueda activo
    if (!searchTela || searchTela.trim() === '') {
      setLocalFilteredTelas([sinTelaOption, ...telasFiltradas]);
    }
  }, [telasFiltradas]);

  useEffect(() => {
    // Si el valor del input es vacío, limpiar la selección interna
    if (searchTela === "" || searchTela == null) {
      setSelectedTela(null);
    }
  }, [searchTela]);



  const handleSearchChange = (value: string) => {
    console.log('🔍 [TELASSEARCH] Buscando:', value);
    onSearchChange(value);
    
    // Si el usuario está escribiendo, limpiar la tela seleccionada
    if (value !== searchTela) {
      setSelectedTela(null);
    }

    // Si se presiona "*", mostrar todas las telas
    if (value === '*') {
      console.log('🔍 [TELASSEARCH] Mostrando todas las telas (comando *)');
      setLocalFilteredTelas([sinTelaOption, ...telasFiltradas]);
      return;
    }

    // Aplicar filtro local inmediatamente mientras escribes
    if (!value || value.trim() === '') {
      // Si no hay término de búsqueda, mostrar todas las telas
      setLocalFilteredTelas([sinTelaOption, ...telasFiltradas]);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    console.log('🔍 [TELASSEARCH] Filtro en tiempo real con término:', searchTerm);

    // Filtrar las telas que vienen del backend
    const filtered = telasFiltradas.filter(tela => {
      const nombreMatch = tela.nombre.toLowerCase().includes(searchTerm);
      const tipoMatch = tela.tipo && tela.tipo.toLowerCase().includes(searchTerm);
      const colorMatch = tela.color && tela.color.toLowerCase().includes(searchTerm);
      
      return nombreMatch || tipoMatch || colorMatch;
    });

    console.log('🔍 [TELASSEARCH] Telas filtradas en tiempo real:', filtered.length);
    setLocalFilteredTelas([sinTelaOption, ...filtered]);
  };

  const handleTelaSelect = (tela: Tela) => {
    console.log('Tela seleccionada:', tela);
    setSelectedTela(tela);
    
    // Formatear el texto del input para mostrar nombre y precio
    let displayText = tela.nombre;
    if (tela.id !== 0 && tela.precio && Number(tela.precio) > 0) {
      displayText += ` - $${Number(tela.precio).toFixed(2)}`;
    }
    
    onSearchChange(displayText);
    onTelaSelect(tela);
  };

  // Función para obtener el texto a mostrar en el input
  const getInputDisplayValue = () => {
    if (selectedTela) {
      let displayText = selectedTela.nombre;
      if (selectedTela.id !== 0 && selectedTela.precio && Number(selectedTela.precio) > 0) {
        displayText += ` - $${Number(selectedTela.precio).toFixed(2)}`;
      }
      return displayText;
    }
    return searchTela;
  };

  return (
    <div className="pt-4 mt-4 border-t">
      <div className="relative">
        <Input
          label="Buscar Tela"
          placeholder="Escribe para buscar telas o * para ver todas..."
          value={getInputDisplayValue()}
          onValueChange={handleSearchChange}
          variant="bordered"
          className="mb-2"
        />

        {showTelasList && (
          <div className="overflow-auto absolute z-50 w-full max-h-60 bg-white rounded-lg border shadow-lg">
            {localFilteredTelas.length > 0 ? (
              localFilteredTelas.map((tela: Tela) => (
                <button
                  key={tela.id}
                  className="p-3 w-full text-left border-b hover:bg-gray-50 last:border-b-0"
                  onClick={() => handleTelaSelect(tela)}
                  tabIndex={0}
                >
                  <div className="font-medium">{tela.nombre}</div>
                  {tela.id !== 0 && ( // Solo mostrar detalles si no es "Sin tela"
                    (<div className="text-sm text-gray-600">
                      {tela.color && <span className="mr-2">Color: {tela.color}</span>}
                      {tela.precio && Number(tela.precio) > 0 && <span className="mr-2">Precio: ${Number(tela.precio).toFixed(2)}</span>}
                      {tela.tipo && <span>Descripción: {tela.tipo}</span>}
                    </div>)
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