'use client';
import React, { useRef, useState } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner } from "@heroui/react";
import { AiOutlineUpload } from 'react-icons/ai';
import TableProducts from '../../components/tableProducts'; // Importa la tabla correctamente
import OneProductModal from '@/components/oneProductModal';
import PricesModal from '@/components/pricesModal';




const ProductosPage = () => {
  const tableRef = useRef<any>(null);
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
    <div className='flex-col justify-center m-2 w-full h-full align-middle columns-1'>
      <TopBar>
        <div className="flex gap-4 justify-between items-center">
          <div className="hidden gap-4 items-center md:flex">
         
      
            <Button onPress={handleOpenModal}> Agregar Producto + </Button>
            <OneProductModal
              isOpen={showProdModal}
              onClose={handleCloseModal} 
              onProductAdded={handleProductAdded}  
              />
            <Button
              className='m-2 bg-green-700'
              style={{ color: 'white' }}
              onPress={handleOpenPricesModal}
            >
              Modificar Precios
            </Button>
            <PricesModal 
              isOpen={showPricesModal}
              onClose={handleClosePricesModal}
              />

          </div>
        </div>
      </TopBar>
      {message && (
        <div className="m-2 mt-4 font-bold text-green-600">
          {message}
        </div>
      )}
      <div>
        {showSpinner ? (
          <div className="flex justify-center items-center">
            <Spinner
              color="primary"
              size="lg"
            />
          </div>
        ) : (
          (<TableProducts ref={tableRef} userLevel={2} />) // Aquí es donde la tabla se renderiza o actualiza
        )}
      </div>
    </div>
  );
};

export default ProductosPage;
