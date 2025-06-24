'use client';
import React, { useRef, useState, useEffect } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { AiOutlineUpload, AiOutlineMenu, AiOutlinePlus, AiOutlineDollar } from 'react-icons/ai';
import TableProducts from '../../components/tableProducts'; // Importa la tabla correctamente
import OneProductModal from '@/components/oneProductModal';
import PricesModal from '@/components/pricesModal';

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
                startContent={<AiOutlinePlus />}
              > 
                Agregar Producto
              </Button>
              <Button
                className='flex-1 bg-green-700 hover:bg-green-800 text-white'
                onPress={handleOpenPricesModal}
                size="md"
                startContent={<AiOutlineDollar />}
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
                  startContent={<AiOutlineMenu />}
                  isDisabled
                >
                  Más opciones
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Acciones adicionales">
                <DropdownItem key="upload" startContent={<AiOutlineUpload />}>
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
