'use client'
import React, { useRef, useState } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner } from '@nextui-org/react';
import { AiOutlineUpload } from 'react-icons/ai';
import TableProducts from '@/components/tableProducts';

const ProductosPage = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Simula el clic en el input file
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setFileName(file.name); // Establece el nombre del archivo seleccionado
      setLoading(true); // Inicia el spinner de carga

      // Simula el procesamiento del archivo durante 3 segundos
      setTimeout(() => {
        setLoading(false); // Detiene el spinner después de 3 segundos
        console.log('Archivo procesado:', file);
      }, 3000);
    }
  };

  return (
    <div className='flex-col justify-center w-full h-full m-2 align-middle columns-1'>
      <TopBar>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div >
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                onClick={handleButtonClick}
                className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                disabled={loading} // Desactiva el botón mientras se carga
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
            <Button className='m-2 bg-secondary-100'> Agregar producto + </Button>
          </div>
          <Button className='m-2 bg-green-700' style={{color:'white'}}>Modificar Precios</Button>
        </div>
      </TopBar>
      <div>
        <TableProducts />
      </div>
    </div>
  );
};

export default ProductosPage;
