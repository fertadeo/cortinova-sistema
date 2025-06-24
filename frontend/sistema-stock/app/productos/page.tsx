'use client';
import React, { useRef, useState, useEffect } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import TableProducts from '../../components/tableProducts'; // Importa la tabla correctamente
import OneProductModal from '@/components/oneProductModal';
import PricesModal from '@/components/pricesModal';

// Componentes SVG inline
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

// Hook personalizado para detectar el tamaño de pantalla
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const ProductosPage = () => {
  const tableRef = useRef<any>(null);
  const isMobile = useIsMobile();
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false)
  const [showPricesModal, setShowPricesModal] = useState(false)

  const handleOpenModal = () => setShowProdModal(true);
  const handleCloseModal = () => setShowProdModal(false);

  const handleOpenPricesModal = () => setShowPricesModal(true);
  const handleClosePricesModal = () => setShowPricesModal(false);

  const handleProductAdded = () => {
    // Llamamos a refreshProducts a través de la ref al guardar un producto
    tableRef.current?.refreshProducts();
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'loading':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className='flex flex-col m-2 w-full h-full'>
      <TopBar>
        {/* Vista Desktop */}
        <div className="hidden md:flex gap-4 justify-between items-center">
          <div className="flex gap-4 items-center">
            <Button 
              onPress={handleOpenModal}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="md"
            > 
              Agregar Producto + 
            </Button>
            <Button
              className='bg-green-700 hover:bg-green-800 text-white'
              onPress={handleOpenPricesModal}
              size="md"
            >
              Modificar Precios
            </Button>
          </div>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden">
          <div className="flex flex-col gap-3">
            {/* Botones principales en mobile */}
            <div className="flex gap-2">
              <Button 
                onPress={handleOpenModal}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="md"
                startContent={<PlusIcon />}
              > 
                Agregar Producto
              </Button>
              <Button
                className='flex-1 bg-green-700 hover:bg-green-800 text-white'
                onPress={handleOpenPricesModal}
                size="md"
                startContent={<DollarIcon />}
              >
                Modificar Precios
              </Button>
            </div>
            
            {/* Dropdown para acciones adicionales si las hubiera */}
            <Dropdown isDisabled>
              <DropdownTrigger>
                <Button 
                  variant="bordered" 
                  className="w-full opacity-50 cursor-not-allowed"
                  startContent={<MenuIcon />}
                  isDisabled
                >
                  Más opciones
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Acciones adicionales">
                <DropdownItem key="upload" startContent={<UploadIcon />}>
                  Subir archivo
                </DropdownItem>
                <DropdownItem key="export">
                  Exportar datos
                </DropdownItem>
                <DropdownItem key="settings">
                  Configuración
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </TopBar>

      {message && (
        <div className="m-2 mt-4 font-bold text-green-600">
          {message}
        </div>
      )}
      
      <div className="flex-1">
        {showSpinner ? (
          <div className="flex justify-center items-center h-64">
            <Spinner
              color="primary"
              size="lg"
            />
          </div>
        ) : (
          <TableProducts ref={tableRef} userLevel={2} />
        )}
      </div>

      {/* Modales */}
      <OneProductModal
        isOpen={showProdModal}
        onClose={handleCloseModal} 
        onProductAdded={handleProductAdded}  
      />
      <PricesModal 
        isOpen={showPricesModal}
        onClose={handleClosePricesModal}
      />
    </div>
  );
};

export default ProductosPage;
