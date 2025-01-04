import { useState, useRef } from 'react';
import { Input, Button } from "@nextui-org/react";
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

  const handleClientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientSearch(value);
    setShowClientsList(true);

    if (!value.trim()) {
      setShowClientsList(false);
      return;
    }

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

        const createdClient = await response.json();
        onClientSelect(createdClient);
        setClientSearch(createdClient.nombre);
        setShowNewClientForm(false);
        setNewClient({ id: 0, nombre: '', direccion: '', telefono: '', email: '', dni: '' });
      } catch (error) {
        console.error('Error al crear el cliente:', error);
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
          className="overflow-auto absolute z-50 mt-1 w-full max-h-60 bg-white rounded-md border border-gray-200 shadow-lg"
        >
          {clients.length > 0 ? (
            clients.map(client => (
              <div
                key={client.id}
                role="button"
                tabIndex={0}
                className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 last:border-b-0"
                onClick={() => handleClientSelect(client)}
                onKeyDown={(e) => e.key === 'Enter' && handleClientSelect(client)}
              >
                <div className="font-semibold">{client.nombre}</div>
                <div className="text-sm text-gray-600">{client.telefono}</div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <p className="mb-2 text-gray-600">No hemos encontrado este resultado...</p>
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
        <div className="relative p-3 mt-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
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
          <h3 className="flex justify-between items-center font-semibold">
            Cliente Seleccionado:
            <div className="flex space-x-2">
              <button onClick={() => handleSort('nombre')}>
             
              </button>
              <button onClick={() => handleSort('telefono')}>
              
              </button>
            </div>
          </h3>
          <p>
            <span>👤</span> {selectedClient.nombre} {/* Emoji de persona junto al nombre */}
          </p>
          <p>
            <span>📞</span> {selectedClient.telefono} {/* Emoji de teléfono junto al número */}
          </p>
          {selectedClient.direccion && (
            <p>
              <span>🏠</span> {selectedClient.direccion} {/* Emoji de dirección junto a la dirección */}
            </p>
          )}
          {selectedClient.email && (
            <p>
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