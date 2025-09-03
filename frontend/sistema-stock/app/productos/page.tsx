'use client';
import React, { useRef, useState, useEffect } from 'react';
import '@/styles/globals.css';
import TopBar from '@/components/topBar';
import { Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import TableProducts from '../../components/tableProducts'; // Importa la tabla correctamente
import OneProductModal from '@/components/oneProductModal';
import PricesModal from '@/components/pricesModal';
import GeneralNotification from '@/components/GeneralNotification';
import * as XLSX from 'xlsx';

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

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Elimina espacios, separadores de miles y convierte comas decimales a punto
    let clean = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    // Si después de limpiar queda vacío, retorna 0
    if (!clean) return 0;
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

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
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado para las notificaciones
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    description: '',
    type: 'success' as 'success' | 'error',
  });

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

  // Función para manejar la carga del archivo Excel
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      // Leer el archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      // Mapeo de campos para que coincidan con los del backend
      const mappedData = jsonData.map((item: any) => ({
        id: item.ID || item.Id || '',
        nombreProducto: item.Producto || item.NombreProducto || '',
        descripcion: item.Descripcion || item.Descripción || '',
        precio: item['Precio al Publico'] || item['Precio al Público'] || item['Precio'] || 0,
        precioCosto: item['Precio de Costo'] || item['PrecioCosto'] || 0,
        cantidad_stock: item.Stock || item.Cantidad || 0,
        proveedor_id: item.proveedor_id || item.Proveedor_id || item['Proveedor ID'] || '',
        rubro_id: item.rubro_id || item.Rubro_id || '',
        sistema_id: item.sistema_id || item.Sistema_id || '',
        descuento: item.descuento || item.Descuento || '',
        disponible: item.disponible || item.Disponible || '',
        // ...otros campos necesarios
      }));

      // LOG: Detalle de los productos formateados
      console.log("Productos formateados para importar:", mappedData);

      // Enviar los datos al backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/importar-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: mappedData }),
      });
      if (!response.ok) throw new Error('Error al importar productos');
      
      // Mostrar notificación de éxito
      setNotification({
        isVisible: true,
        message: '¡Importación exitosa!',
        description: `Se importaron ${mappedData.length} productos correctamente.`,
        type: 'success',
      });
      
      tableRef.current?.refreshProducts();
    } catch (error) {
      console.error('Error al importar:', error);
      // Mostrar notificación de error
      setNotification({
        isVisible: true,
        message: 'Error al importar',
        description: 'No se pudo importar el archivo. Verifica el formato y vuelve a intentar.',
        type: 'error',
      });
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleExportExcel = () => {
    if (!tableRef.current) return;
    const products = tableRef.current.getProducts ? tableRef.current.getProducts() : [];
    if (!products || products.length === 0) {
      alert("No hay productos para exportar.");
      return;
    }
    // Estructura y orden exacto de columnas para exportar
    const data = products.map((prod: any) => ({
      'ID': prod.id,
      'NombreProducto': prod.nombreProducto,
      'Descripcion': prod.descripcion,
      'Precio de Costo': prod.precioCosto,
      'Precio al Publico': prod.precio,
      'disponible': prod.disponible || 'SI',
      'descuento': prod.descuento || '',
      'Proveedor_id': prod.proveedor_id || prod.proveedor?.id || '',
      'Rubro_id': prod.rubro_id || '',
      'Sistema_id': prod.sistema_id || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    // Generar nombre de archivo con fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `productos cortinova export ${fecha}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
            <Button
              className='bg-orange-600 hover:bg-orange-700 text-white'
              size="md"
              onPress={() => fileInputRef.current?.click()}
              isDisabled={importLoading}
            >
              {importLoading ? <Spinner size="sm" color="default"/> : 'Importar lista Excel'}
            </Button>
            <Button
              className='bg-sky-600 hover:bg-sky-700 text-white'
              size="md"
              onPress={handleExportExcel}
            >
              Exportar lista Excel
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleExcelImport}
            />
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
            
            <Button
              className='bg-orange-600 hover:bg-orange-700 text-white w-full'
              size="md"
              onPress={() => fileInputRef.current?.click()}
              isDisabled={importLoading}
              startContent={importLoading ? <Spinner size="sm" color="default"/> : undefined}
            >
              {importLoading ? 'Importando...' : 'Importar lista Excel'}
            </Button>
            <Button
              className='bg-sky-600 hover:bg-sky-700 text-white'
              size="md"
              onPress={handleExportExcel}
            >
              Exportar lista Excel
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleExcelImport}
            />
            
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
        onRefreshProducts={() => tableRef.current?.refreshProducts()}
      />
      
      {/* Notificación */}
      <GeneralNotification
        message={notification.message} 
        description={notification.description}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
      />
    </div>
  );
};

export default ProductosPage;
