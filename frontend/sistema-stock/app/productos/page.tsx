'use client'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner } from '@nextui-org/react';
import { AiOutlineUpload } from 'react-icons/ai';
import handleFileUpload from '../../components/utils/excelUtil'; // Importa la función desde excelUtil.ts

const ProductosPage = () => { 
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<any>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const TableProducts = forwardRef((props, ref) => {
    const [data, setData] = useState([]);

    // Exponer métodos que puedes invocar desde el padre utilizando el ref
    useImperativeHandle(ref, () => ({
      updateTable() {
        console.log("Tabla actualizada");
        // Lógica para actualizar la tabla aquí
      }
    }));

    return (
      <table>
        {/* Renderiza la tabla aquí */}
        <tbody>
          {/* Ejemplo de datos, puedes modificar */}
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item}</td>
              <td>{item}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  });

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
        tableRef.current.updateTable(); // Actualiza la tabla
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
            <Button className='m-2 bg-secondary-100'> Agregar producto + </Button>
          </div>
          <Button className='m-2 bg-green-700' style={{color:'white'}}>Modificar Precios</Button>
        </div>
      </TopBar>

      {message && (
        <div className="m-2 mt-4 font-bold text-green-600">
          {message}
        </div>
      )}

      <div>
        <TableProducts ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductosPage;
