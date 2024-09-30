'use client';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner } from '@nextui-org/react';
import { AiOutlineUpload } from 'react-icons/ai';
import handleFileUpload from '../../components/utils/excelUtil'; // Importa la función desde excelUtil.ts
import TableProducts from '../../components/tableProducts'; // Importa la tabla correctamente
import OneProductModal from '@/components/oneProductModal';




const ProductosPage = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [showSpinner, setShowSpinner] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<any>(null);
  const [showProdModal, setShowProdModal] = useState(false)




  const handleOpenModal = () => setShowProdModal(true);
  const handleCloseModal = () => setShowProdModal(false);


  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejamos la subida del archivo
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setStatus('loading');
      setMessage(null);

      try {
        // Llamamos a la función de excelUtil.ts para parsear y enviar el archivo
        await handleFileUpload(file);
        setLoading(false);
        setStatus('success');
        setMessage('Archivo importado exitosamente!');
        setShowSpinner(true); // Mostrar el spinner

        // Después de 3 segundos, ocultar el spinner y actualizar la tabla
        setTimeout(() => {
          setShowSpinner(false);
          tableRef.current.updateTable(); // Actualiza la tabla
        }, 3000);
      } catch (error) {
        console.error("Error al procesar el archivo:", error);
        setLoading(false);
        setStatus('error');
        setMessage(null);
      }
    }
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
    <div className='flex-col justify-center w-full h-full m-2 align-middle columns-1'>
      <TopBar>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange} // Usamos handleFileChange
              />
              <Button
                onClick={handleButtonClick}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md ${getButtonColor()}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color='white' />
                    Procesando...
                  </>
                ) : (
                  <>
                    <AiOutlineUpload className='size-14' />
                    {fileName ? fileName : 'Cargar archivo Excel'}
                  </>
                )}
              </Button>
            </div>
          <Button onPress={handleOpenModal}> Agregar Producto + </Button>
          <OneProductModal isOpen={showProdModal} onClose={handleCloseModal}/>
          <Button className='m-2 bg-green-700' style={{ color: 'white' }}>Modificar Precios</Button>
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
          <div className="flex items-center justify-center">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <TableProducts ref={tableRef} /> // Aquí es donde la tabla se renderiza o actualiza
        )}
      </div>
    </div>
  );
};

export default ProductosPage;
