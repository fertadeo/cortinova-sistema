import { useState, useRef, useEffect } from 'react';
import { Input, Button } from "@heroui/react";
import { Client } from '../../types/budget';
import { useClientSearch } from '../../hooks/useClientSearch';

interface BudgetClientSectionProps {
  onClientSelect: (client: Client | null) => void;
  selectedClient: Client | null;
}

export const BudgetClientSection = ({ onClientSelect, selectedClient }: BudgetClientSectionProps) => {
  const [showClientsList, setShowClientsList] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState<Client>({ id: 0, nombre: '', direccion: '', telefono: '', email: '', dni: '' });
  const clientsListRef = useRef<HTMLDivElement>(null);
  const { isLoading, clients, searchClients } = useClientSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientsListRef.current && !clientsListRef.current.contains(event.target as Node)) {
        setShowClientsList(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowClientsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Sincronizar el campo de búsqueda con el cliente seleccionado
  useEffect(() => {
    if (selectedClient) {
      setClientSearch(selectedClient.nombre);
    } else {
      setClientSearch('');
    }
  }, [selectedClient]);

  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientSearch(value);
    
    // Si el usuario está escribiendo y hay un cliente seleccionado, deseleccionarlo
    if (selectedClient && value !== selectedClient.nombre) {
      onClientSelect(null);
    }
    
    if (!value.trim()) {
      setShowClientsList(false);
      return;
    }

    setShowClientsList(true);
    const timeoutId = setTimeout(() => {
      searchClients(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setClientSearch(client.nombre);
    setShowClientsList(false);
  };

  const handleNewClientChange = (field: keyof Client, value: string) => {
    setNewClient(prev => ({ ...prev, [field]: value }));
  };

  const handleNewClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.nombre && newClient.telefono) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newClient)
        });

        if (!response.ok) {
          throw new Error('Error al crear el cliente');
        }

        const responseData = await response.json();
        
        // Verificar que la respuesta tenga la estructura correcta
        let createdClient: Client;
        if (responseData.data && responseData.data.id) {
          // Si la respuesta viene envuelta en un objeto data
          createdClient = responseData.data;
        } else if (responseData.id) {
          // Si la respuesta es directamente el cliente
          createdClient = responseData;
        } else {
          // Si no hay datos válidos, usar los datos del formulario con un ID temporal
          createdClient = {
            ...newClient,
            id: Date.now() // ID temporal para evitar errores
          };
        }

        // Validar que el cliente tenga los datos mínimos necesarios
        if (!createdClient.nombre || !createdClient.telefono) {
          console.error('Cliente creado con datos incompletos:', createdClient);
          throw new Error('El cliente se creó pero con datos incompletos');
        }

        // Seleccionar el cliente y actualizar la UI
        onClientSelect(createdClient);
        setClientSearch(createdClient.nombre);
        setShowNewClientForm(false);
        setShowClientsList(false);
        
        // Limpiar el formulario
        setNewClient({ id: 0, nombre: '', direccion: '', telefono: '', email: '', dni: '' });
        
        console.log('Cliente creado y seleccionado exitosamente:', createdClient);
      } catch (error) {
        console.error('Error al crear el cliente:', error);
        // Mostrar un mensaje de error al usuario (opcional)
        alert('Error al crear el cliente. Por favor, inténtalo de nuevo.');
      }
    }
  };

  function handleSort(arg0: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="mb-4">
      <Input
        label="Buscar Cliente"
        placeholder="Nombre del cliente"
        value={clientSearch}
        onChange={handleClientSearch}
        className="w-full"
      />
      
      {/* Lista de clientes */}
      {showClientsList && (
        <div 
          ref={clientsListRef}
          className="overflow-auto absolute z-50 mt-1 w-full max-h-60 bg-white dark:bg-dark-card rounded-md border border-gray-200 dark:border-dark-border shadow-lg"
        >
          {clients.length > 0 ? (
            clients.map(client => (
              <div
                key={client.id}
                role="button"
                tabIndex={0}
                className="px-4 py-2 border-b border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 last:border-b-0"
                onClick={() => handleClientSelect(client)}
                onKeyDown={(e) => e.key === 'Enter' && handleClientSelect(client)}
              >
                <div className="font-semibold text-gray-900 dark:text-dark-text">
                  <span className="mr-2">👤</span>
                  {client.nombre}
                </div>
                <div className="ml-6 text-sm text-gray-600 dark:text-dark-text-secondary">
                  {client.telefono && (
                    <div>
                      <span className="mr-2">📞</span>
                      {client.telefono}
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <span className="mr-2">✉️</span>
                      {client.email}
                    </div>
                  )}
                  {client.direccion && (
                    <div>
                      <span className="mr-2">🏠</span>
                      {client.direccion}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <p className="mb-2 text-gray-600 dark:text-dark-text-secondary">No hemos encontrado este resultado...</p>
              <Button 
                color="primary" 
                size="sm"
                onClick={() => {
                  setShowNewClientForm(true);
                  setShowClientsList(false);
                }}
              >
                Agregar nuevo cliente
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cliente seleccionado */}
      {selectedClient && (
        <div className="relative p-3 mt-2 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border shadow-sm">
          <div className="absolute top-2 right-2">
            <Button
              color="danger"
              variant="solid"
              size="sm"
              isIconOnly
              style={{ padding: 5 }}
              onClick={() => onClientSelect(null)}
            >
              ✕
            </Button>
          </div>
          <h3 className="flex justify-between items-center font-semibold text-gray-900 dark:text-dark-text">
            Cliente Seleccionado:
            <div className="flex space-x-2">
              <button onClick={() => handleSort('nombre')}>
             
              </button>
              <button onClick={() => handleSort('telefono')}>
              
              </button>
            </div>
          </h3>
          <p className="text-gray-700 dark:text-dark-text-secondary">
            <span>👤</span> {selectedClient.nombre} {/* Emoji de persona junto al nombre */}
          </p>
          <p className="text-gray-700 dark:text-dark-text-secondary">
            <span>📞</span> {selectedClient.telefono} {/* Emoji de teléfono junto al número */}
          </p>
          {selectedClient.direccion && (
            <p className="text-gray-700 dark:text-dark-text-secondary">
              <span>🏠</span> {selectedClient.direccion} {/* Emoji de dirección junto a la dirección */}
            </p>
          )}
          {selectedClient.email && (
            <p className="text-gray-700 dark:text-dark-text-secondary">
              <span>✉️</span> {selectedClient.email} {/* Emoji de email junto al email */}
            </p>
          )}
        </div>
      )}


      {/* Formulario para nuevo cliente */}
      {showNewClientForm && (
        <form onSubmit={handleNewClientSubmit} className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label="Nombre *"
            value={newClient.nombre}
            onChange={(e) => handleNewClientChange('nombre', e.target.value)}
            required
            className="w-full"
          />
          <Input
            label="Teléfono *"
            value={newClient.telefono}
            onChange={(e) => handleNewClientChange('telefono', e.target.value)}
            required
            className="w-full"
          />
          <Input
            label="Email"
            value={newClient.email}
            onChange={(e) => handleNewClientChange('email', e.target.value)}
            className="w-full"
          />
          <Input
            label="Dirección"
            value={newClient.direccion}
            onChange={(e) => handleNewClientChange('direccion', e.target.value)}
            className="w-full"
          />
          <div className="flex col-span-2 gap-2 justify-end">
            <Button 
              color="danger" 
              variant="light"
              onClick={() => setShowNewClientForm(false)}
            >
              Cancelar
            </Button>
            <Button 
              color="primary" 
              type="submit"
            >
              Guardar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}; 