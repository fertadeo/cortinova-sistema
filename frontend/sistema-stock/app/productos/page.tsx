'use client'
import React, { useRef, useState } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Input, Spinner } from '@nextui-org/react';
import { AiOutlineUpload } from 'react-icons/ai';

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
    <div className='flex justify-center w-full h-full align-middle'>
      <TopBar>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Buscar..."
            className="w-40 px-4 py-2 m-2 border rounded-md"
          />
          <div className="relative">
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
                  {fileName ? fileName : 'Cargar desde Excel'}
                </>
              )}
            </Button>
          </div>
          <Button className='m-2 bg-secondary-100'>Carga Manual</Button>
        </div>
      </TopBar>
    </div>
  );
};

export default ProductosPage;
