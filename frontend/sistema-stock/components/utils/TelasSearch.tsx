import React, { useEffect, useState } from 'react';
import { Input, Spinner } from "@heroui/react";
import { Tela } from '@/types/telas';

interface TelasSearchProps {
  searchTela: string;
  onSearchChange: (value: string) => void;
  telasFiltradas: Tela[];
  showTelasList: boolean;
  onTelaSelect: (tela: Tela) => void;
  multiplicadorTela?: number;
  onMultiplicadorChange?: (multiplicador: number) => void;
  cantidadTelaManual?: number | null;
  onCantidadTelaManualChange?: (cantidad: number | null) => void;
  // Nuevos props para filtros dinámicos
  sistemaId?: number;
  rubroId?: number;
  proveedorId?: number;
  selectedSistema?: string;
}

export const TelasSearch = ({
  searchTela,
  onSearchChange,
  telasFiltradas,
  showTelasList,
  onTelaSelect,
  multiplicadorTela = 1,
  onMultiplicadorChange,
  cantidadTelaManual = 0,
  onCantidadTelaManualChange,
  sistemaId,
  rubroId,
  proveedorId,
  selectedSistema
}: TelasSearchProps) => {
  const [selectedTela, setSelectedTela] = useState<Tela | null>(null);
  const [localFilteredTelas, setLocalFilteredTelas] = useState<Tela[]>([]);
  const [loading, setLoading] = useState(false);

  // Multiplicadores disponibles
  const multiplicadores = [1.5, 2, 2.5, 3];

  // Función para buscar telas usando la API de productos filtrados
  const buscarTelas = async (searchTerm: string) => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados`;
      
      // Determinar qué filtros usar basado en el sistema seleccionado
      const isTradicional = selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios');
      
      if (isTradicional || !sistemaId || !rubroId || !proveedorId) {
        // Para sistemas Tradicional/Propios o cuando no hay parámetros específicos, usar filtro fijo
        url += '?rubroId=4';
        console.log('🔍 [TELAS] Usando filtro fijo para sistema Tradicional/Propios');
      } else {
        // Para otros sistemas, usar filtros dinámicos
        url += `?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}`;
        console.log('🔍 [TELAS] Usando filtros dinámicos:', { sistemaId, rubroId, proveedorId });
      }
      
      // Si el término de búsqueda es '*', buscar todos los productos
      if (searchTerm.trim() === '*') {
        url += '&q=*';
      } else if (searchTerm.trim()) {
        // Si hay un término de búsqueda específico
        url += `&q=${encodeURIComponent(searchTerm)}`;
      }
      
      console.log('🔍 [TELAS] Buscando telas con URL:', url);
      console.log('🔍 [TELAS] Sistema seleccionado:', selectedSistema);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al buscar telas');
      }
      
      const data = await response.json();
      console.log('🔍 [TELAS] Respuesta de la API:', data);
      
      if (Array.isArray(data.data)) {
        setLocalFilteredTelas([sinTelaOption, ...data.data]);
      } else {
        setLocalFilteredTelas([sinTelaOption]);
      }
    } catch (error) {
      console.error('❌ [TELAS] Error al buscar telas:', error);
      setLocalFilteredTelas([sinTelaOption]);
    } finally {
      setLoading(false);
    }
  };

  // Opción "Sin tela" estática
  const sinTelaOption: Tela = {
    id: 0,
    nombreProducto: "Sin tela",
    tipo: "",
    color: "",
    precio: "0"
  };

  useEffect(() => {
    // Inicializar con la opción "Sin tela"
    setLocalFilteredTelas([sinTelaOption]);
  }, []);

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

    // Si se presiona "*" (con o sin espacios), buscar todas las telas
    if (value.trim() === '*') {
      buscarTelas('*');
      return;
    }

    // Si no hay término de búsqueda, limpiar resultados
    if (!value || value.trim() === '') {
      setLocalFilteredTelas([sinTelaOption]);
      return;
    }

    // Buscar telas usando la API
    buscarTelas(value);
  };

  const handleTelaSelect = (tela: Tela) => {
    console.log('Tela seleccionada:', tela);
    setSelectedTela(tela);
    
    // Formatear el texto del input para mostrar nombre y precio
    let displayText = tela.nombreProducto;
    if (tela.id !== 0 && tela.precio && Number(tela.precio) > 0) {
      displayText += ` - $${Number(tela.precio).toFixed(2)}`;
    }
    
    onSearchChange(displayText);
    onTelaSelect(tela);
  };

  // Función para obtener el texto a mostrar en el input
  const getInputDisplayValue = () => {
    if (selectedTela) {
      let displayText = selectedTela.nombreProducto;
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
          endContent={loading && <Spinner size="sm" />}
        />

        {showTelasList && (
          <div className="overflow-auto absolute z-50 w-full max-h-60 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border shadow-lg">
            {localFilteredTelas.length > 0 ? (
              localFilteredTelas.map((tela: Tela) => (
                <button
                  key={tela.id}
                  className="p-3 w-full text-left border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-700/50 last:border-b-0"
                  onClick={() => handleTelaSelect(tela)}
                  tabIndex={0}
                >
                  <div className="font-medium text-gray-900 dark:text-dark-text">{tela.nombreProducto}</div>
                  {tela.id !== 0 && ( // Solo mostrar detalles si no es "Sin tela"
                    (<div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      {tela.color && <span className="mr-2">Color: {tela.color}</span>}
                      {tela.precio && Number(tela.precio) > 0 && <span className="mr-2">Precio: ${Number(tela.precio).toFixed(2)}</span>}
                      {tela.tipo && <span>Descripción: {tela.tipo}</span>}
                    </div>)
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-dark-text-secondary">
                No se encontraron resultados...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multiplicador de tela - Solo para sistema Tradicional */}
      {(selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios')) && (
        <div className="mt-4">
          <label htmlFor="multiplicadorTela" className="block text-sm font-medium mb-2 text-gray-900 dark:text-dark-text">Multiplicador de tela</label>
          <div className="flex gap-4 items-center mt-2">
            {multiplicadores.map((mult) => (
              <label key={mult} className="flex items-center gap-1 cursor-pointer text-gray-900 dark:text-dark-text">
                <input
                  type="radio"
                  id={`multiplicadorTela-${mult}`}
                  name="multiplicadorTela"
                  value={mult}
                  checked={multiplicadorTela === mult}
                  onChange={() => {
                    // Limpiar el input manual cuando se selecciona un radio button
                    onCantidadTelaManualChange?.(null);
                    onMultiplicadorChange?.(mult);
                  }}
                />
                x{mult}
              </label>
            ))}
            {/* Campo manual */}
            <div className="flex items-center gap-1 ml-4">
              <label htmlFor="cantidadTelaManual" className="text-sm text-blue-700 dark:text-primary">o ingrese manualmente los metros cuadrados de tela:</label>
              <input
                type="number"
                id="cantidadTelaManual"
                name="cantidadTelaManual"
                min={0}
                step={0.01}
                value={cantidadTelaManual === undefined || cantidadTelaManual === null || Number.isNaN(cantidadTelaManual) ? '' : cantidadTelaManual}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || val === undefined) {
                    onCantidadTelaManualChange?.(null);
                  } else {
                    // Limpiar el radio button seleccionado cuando se escribe en el input manual
                    onMultiplicadorChange?.(1);
                    onCantidadTelaManualChange?.(parseFloat(val));
                  }
                }}
                className="w-24 border border-gray-300 dark:border-dark-border rounded px-2 py-1 text-sm bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
                placeholder="0"
              />
              <span className="text-xs text-gray-500 dark:text-dark-text-secondary">m²</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 