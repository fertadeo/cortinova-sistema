import { useState, useEffect } from "react";
import { Card, Spacer } from "@heroui/react";
import { Client, TableItem, PresupuestoResumen } from '../../types/budget';
import { BudgetClientSection } from "./BudgetClientSection";
import { BudgetProductSection } from "./BudgetProductSection";
import { BudgetTable } from "./BudgetTable";
import { BudgetSummary } from "./BudgetSummary";
import { LoadingButton } from "../shared/LoadingButton";
import { useBudgetCalculations } from "../../hooks/useBudgetCalculations";
import GenerarPedidoModal from "../GenerarPedidoModal";
import BudgetResume from "../budgetResume";
import { useSearchParams } from 'next/navigation';

// Renombrar la declaración local
interface LocalTableItem {
  detalles: { 
    sistema: string; 
    detalle: string; 
    caidaPorDelante: string; 
    colorSistema: string; 
    ladoComando: string; 
    tipoTela: string; 
    soporteIntermedio: boolean; 
    soporteDoble: boolean; 
    accesorios?: any[];
    accesoriosAdicionales?: any[];
  };
  id: number;
  productId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

const calcularPrecioTela = (ancho: number, alto: number, precioTela: number, esRotable: boolean): number => {
  const area = ((ancho / 100) * (alto / 100));
  return area * precioTela;
};

export const BudgetGenerator = () => {
  const searchParams = useSearchParams();
  // Estados del cliente
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Estados de productos y tabla
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  
  // Estados de descuento y cálculos
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [shouldRound, setShouldRound] = useState(false);
  const { calculateTotals } = useBudgetCalculations();
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  
  // Estado para el toast de error
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Estados del presupuesto
  const [numeroPresupuesto, setNumeroPresupuesto] = useState<number>(0);
  const [showResume, setShowResume] = useState(false);
  const [presupuestoGenerado, setPresupuestoGenerado] = useState<PresupuestoResumen | null>(null);

  // Efecto para manejar la precarga desde URL
  useEffect(() => {
    const loadPresetData = async () => {
      const clienteId = searchParams.get('clienteId');
      const medidasIds = searchParams.getAll('medidas');

      if (!clienteId || !medidasIds.length) return;

      try {
        // 1. Cargar datos del cliente
        const clientResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/${clienteId}`);
        
        if (!clientResponse.ok) {
          console.error('Error en respuesta del servidor:', await clientResponse.text());
          throw new Error('Error al cargar cliente');
        }

        const clientData = await clientResponse.json();
        
        if (clientData && clientData.data) {
          setSelectedClient({
            id: clientData.data.id,
            nombre: clientData.data.nombre,
            direccion: clientData.data.direccion,
            telefono: clientData.data.telefono,
            email: clientData.data.email
          });
        }

        // 2. Cargar todas las medidas seleccionadas
        const medidasPromises = medidasIds.map(id => 
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/medidas/${id}`).then(res => res.json())
        );

        const medidasResults = await Promise.all(medidasPromises);
        const newTableItems = medidasResults
          .filter(medidaData => medidaData && medidaData.data)
          .map(medidaData => {
            const medida = medidaData.data;
            return {
              id: Date.now() + Math.random(),
              productId: Date.now(),
              name: `Cortina ${medida.elemento}`,
              description: `${medida.ancho}cm x ${medida.alto}cm - ${medida.ubicacion}`,
              quantity: medida.cantidad,
              price: 0,
              total: 0,
              detalles: {
                sistema: "",
                detalle: medida.detalles || "",
                caidaPorDelante: "",
                colorSistema: "",
                ladoComando: "",
                tipoTela: "",
                soporteIntermedio: false,
                soporteDoble: false,
                medidaId: medida.id,
                ancho: medida.ancho,
                alto: medida.alto,
                ubicacion: medida.ubicacion
              }
            };
          });

        setTableData(newTableItems);
        setShowPedidoModal(true);

      } catch (error) {
        console.error('Error detallado:', error);
        mostrarErrorToast(error instanceof Error ? error.message : "Error al cargar los datos preestablecidos");
      }
    };

    loadPresetData();
  }, [searchParams]);

  // Función para mostrar toast de error
  const mostrarErrorToast = (mensaje: string) => {
    setToastMessage(mensaje);
    setShowErrorToast(true);
    setTimeout(() => {
      setShowErrorToast(false);
    }, 5000);
  };

  // Manejadores de productos
  const handleProductSelect = (newItem: TableItem) => {
    setTableData(prevData => [...prevData, newItem]);
  };

  const handleQuantityChange = (id: number, newQuantity: string) => {
    const quantity = parseFloat(newQuantity) || 0;
    if (quantity >= 0) {
      setTableData(prevData =>
        prevData.map(item =>
          item.id === id ? { 
            ...item, 
            quantity,
            total: item.price * quantity
          } : item
        )
      );
    }
  };

  const handleRemoveProduct = (id: number) => {
    setTableData(prevData => prevData.filter(item => item.id !== id));
  };

  // Manejador de pedido personalizado
  const handleAddPedido = (pedido: any) => {
    console.log('=== PEDIDO RECIBIDO EN BUDGETGENERATOR ===');
    console.log('Pedido completo:', pedido);
    console.log('Detalles del pedido:', pedido.detalles);
    console.log('Accesorios:', pedido.detalles?.accesorios);
    console.log('Accesorios adicionales:', pedido.detalles?.accesoriosAdicionales);
    
    // Logs específicos para Dunes
    if (pedido.sistema?.toLowerCase().includes('dunes')) {
      console.log('🏗️ [DUNES] Información específica de Dunes:');
      console.log('Producto Dunes:', pedido.detalles?.productoDunes);
      console.log('Tela Dunes:', pedido.detalles?.telaDunes);
      console.log('Precio Sistema Dunes:', pedido.detalles?.precioSistemaDunes);
      console.log('Precio Tela Dunes:', pedido.detalles?.precioTelaDunes);
      console.log('Precio Unitario:', pedido.precioUnitario);
      console.log('Precio Total:', pedido.precioTotal);
      console.log('🏗️ [DUNES] Campos del formulario:');
      console.log('Color Sistema:', pedido.detalles?.colorSistema);
      console.log('Lado Comando:', pedido.detalles?.ladoComando);
      console.log('Lado Apertura:', pedido.detalles?.ladoApertura);
      console.log('Instalación:', pedido.detalles?.instalacion);
      console.log('Tipo Apertura:', pedido.detalles?.tipoApertura);
      console.log('Detalle:', pedido.detalles?.detalle);
    }
    
    console.log('=== FIN PEDIDO RECIBIDO ===');
    
    // Usar los precios calculados y pasados desde el modal
    const precioUnitario = pedido.precioUnitario;
    const precioTotal = pedido.precioTotal;
    // Si el pedido viene de una medida precargada, actualizar ese item
    if (pedido.medidaId) {
      setTableData(prev => prev.map(item => 
        item.detalles && 'medidaId' in item.detalles && item.detalles.medidaId === pedido.medidaId
          ? {
              ...item,
              name: `Cortina ${pedido.sistema}`,
              description: (() => {
                // Lógica específica para Dunes
                if (pedido.sistema?.toLowerCase().includes('dunes')) {
                  const productoDunes = pedido.detalles?.productoDunes;
                  const telaDunes = pedido.detalles?.telaDunes;
                  if (productoDunes && telaDunes) {
                    return `${productoDunes.nombreProducto} + ${telaDunes.nombreProducto}`;
                  }
                }
                // Para otros sistemas, usar la lógica original
                return `${pedido.detalles?.tela?.nombreProducto || pedido.tela?.nombreProducto || ''}`;
              })(),
              quantity: pedido.detalles?.cantidad || 1,
              price: precioTotal / (pedido.detalles?.cantidad || 1),
              total: precioTotal,
              detalles: {
                sistema: pedido.sistema || "",
                detalle: pedido.detalles?.detalle || "",
                caidaPorDelante: pedido.detalles?.caidaPorDelante ? "Si" : "No",
                colorSistema: pedido.detalles?.colorSistema || "",
                ladoComando: pedido.detalles?.ladoComando || "",
                tipoTela: pedido.detalles?.tela?.nombreProducto || pedido.tela?.nombreProducto || "",
                soporteIntermedio: pedido.detalles?.soporteIntermedio || false,
                soporteDoble: pedido.detalles?.soporteDoble || false,
                accesorios: pedido.detalles?.accesorios || [],
                accesoriosAdicionales: pedido.detalles?.accesoriosAdicionales || [],
                medidaId: pedido.medidaId,
                ancho: pedido.detalles?.ancho,
                alto: pedido.detalles?.alto,
                ubicacion: pedido.detalles?.ubicacion,
                // Información específica para tela tradicional
                multiplicadorTela: pedido.detalles?.multiplicadorTela || null,
                metrosTotalesTela: pedido.detalles?.metrosTotalesTela || null,
                // Información específica para Dunes
                ...(pedido.sistema?.toLowerCase().includes('dunes') && {
                  productoDunes: pedido.detalles?.productoDunes,
                  telaDunes: pedido.detalles?.telaDunes,
                  precioSistemaDunes: pedido.detalles?.precioSistemaDunes,
                  precioTelaDunes: pedido.detalles?.precioTelaDunes,
                  // Campos específicos del formulario de Dunes
                  colorSistema: pedido.detalles?.colorSistema || "",
                  ladoComando: pedido.detalles?.ladoComando || "",
                  ladoApertura: pedido.detalles?.ladoApertura || "",
                  instalacion: pedido.detalles?.instalacion || "",
                  tipoApertura: pedido.detalles?.tipoApertura || ""
                })
              }
            }
          : item
      ));
    } else {
      // Código para nuevo item
      const newTableItem: TableItem = {
        id: Date.now(),
        productId: Date.now(),
        name: `Cortina ${pedido.sistema}`,
        description: (() => {
          // Lógica específica para Dunes
          if (pedido.sistema?.toLowerCase().includes('dunes')) {
            const productoDunes = pedido.detalles?.productoDunes;
            const telaDunes = pedido.detalles?.telaDunes;
            if (productoDunes && telaDunes) {
              return `${productoDunes.nombreProducto} + ${telaDunes.nombreProducto}`;
            }
          }
          // Para otros sistemas, usar la lógica original
          return `${pedido.detalles?.tela?.nombreProducto || pedido.tela?.nombreProducto || ''}`;
        })(),
        quantity: pedido.detalles?.cantidad || 1,
        price: precioTotal / (pedido.detalles?.cantidad || 1),
        total: precioTotal,
        detalles: {
          sistema: pedido.sistema || "",
          detalle: pedido.detalles?.detalle || "",
          caidaPorDelante: pedido.detalles?.caidaPorDelante ? "Si" : "No",
          colorSistema: pedido.detalles?.colorSistema || "",
          ladoComando: pedido.detalles?.ladoComando || "",
          tipoTela: pedido.detalles?.tela?.nombreProducto || pedido.tela?.nombreProducto || "",
          soporteIntermedio: pedido.detalles?.soporteIntermedio || false,
          soporteDoble: pedido.detalles?.soporteDoble || false,
          accesorios: pedido.detalles?.accesorios || [],
          accesoriosAdicionales: pedido.detalles?.accesoriosAdicionales || [],
          medidaId: pedido.medidaId,
          ancho: pedido.detalles?.ancho,
          alto: pedido.detalles?.alto,
          ubicacion: pedido.detalles?.ubicacion,
          // Información específica para tela tradicional
          multiplicadorTela: pedido.detalles?.multiplicadorTela || null,
          metrosTotalesTela: pedido.detalles?.metrosTotalesTela || null,
          // Información específica para Dunes
          ...(pedido.sistema?.toLowerCase().includes('dunes') && {
            productoDunes: pedido.detalles?.productoDunes,
            telaDunes: pedido.detalles?.telaDunes,
            precioSistemaDunes: pedido.detalles?.precioSistemaDunes,
            precioTelaDunes: pedido.detalles?.precioTelaDunes,
            // Campos específicos del formulario de Dunes
            colorSistema: pedido.detalles?.colorSistema || "",
            ladoComando: pedido.detalles?.ladoComando || "",
            ladoApertura: pedido.detalles?.ladoApertura || "",
            instalacion: pedido.detalles?.instalacion || "",
            tipoApertura: pedido.detalles?.tipoApertura || ""
          })
        } as any
      };
      console.log('=== ITEM GUARDADO EN TABLEDATA ===');
      console.log('Nuevo item:', newTableItem);
      console.log('Detalles del item:', newTableItem.detalles);
      console.log('=== FIN ITEM GUARDADO ===');
      setTableData(prev => [...prev, newTableItem]);
    }
  };

  // Manejador para editar un pedido
  const handleEditItem = (item: TableItem) => {
    // Asegurarse de que el item seleccionado esté en el estado antes de abrir el modal
    setTableData(prevData => {
      const itemExists = prevData.some(prevItem => prevItem.id === item.id);
      if (!itemExists) {
        return [...prevData, item];
      }
      return prevData;
    });
    
    // Abrir el modal con los datos del item seleccionado
    setShowPedidoModal(true);
  };

  // Manejador de cambios en el descuento
  const handleDiscountChange = (checked: boolean, type?: "percentage" | "amount", value?: string, round?: boolean) => {
    setApplyDiscount(checked);
    if (type) setDiscountType(type);
    if (value) setDiscountValue(value);
    if (round !== undefined) setShouldRound(round);
  };

  // Manejador de emisión de presupuesto
  const handleEmitirPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      mostrarErrorToast("Falta elegir un cliente");
      return;
    }
    
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar ID basado en la fecha actual
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      const presupuestoId = `${year}${month}${day}-${hours}${minutes}${seconds}`;
      
      const { subtotal, discount, finalTotal } = calculateTotals(
        tableData, 
        applyDiscount,
        discountType === "percentage" ? Number(discountValue) : undefined,
        discountType === "amount" ? Number(discountValue) : undefined,
        shouldRound
      );

      // Crear el objeto de presupuesto para enviar al backend
      const presupuestoData = {
        estado: "Emitido",
        numeroPresupuesto: presupuestoId,
        clienteId: selectedClient.id,
        productos: tableData.map(item => {
          console.log('Item detalles antes de enviar:', item.detalles);
          return {
            id: item.productId || Date.now(),
            nombre: item.name,
            descripcion: item.description,
            cantidad: Number(item.quantity),
            precioUnitario: Number(item.price),
            subtotal: Number(item.price) * Number(item.quantity),
            detalles: item.detalles || {}
          };
        }),
        total: finalTotal,
        subtotal: subtotal,
        descuento: discount, // Agregar este campo para que el backend guarde el descuento redondeado
        descuentoPorcentaje: applyDiscount && discountType === "percentage" ? Number(discountValue) : 0,
        descuentoMonto: applyDiscount && discountType === "amount" ? Number(discountValue) : 0
      };

      tableData.forEach((item, index) => {
        console.log(`Producto ${index + 1}:`, {
          nombre: item.name,
          descripcion: item.description,
          cantidad: item.quantity,
          precio: item.price,
          total: item.total,
          detalles: item.detalles
        });
        
        // Logs específicos para Dunes
        if (item.detalles?.sistema?.toLowerCase().includes('dunes')) {
          console.log(`🏗️ [DUNES] Producto ${index + 1} - Campos específicos:`, {
            colorSistema: (item.detalles as any).colorSistema,
            ladoComando: (item.detalles as any).ladoComando,
            ladoApertura: (item.detalles as any).ladoApertura,
            instalacion: (item.detalles as any).instalacion,
            tipoApertura: (item.detalles as any).tipoApertura,
            detalle: item.detalles.detalle,
            productoDunes: (item.detalles as any).productoDunes,
            telaDunes: (item.detalles as any).telaDunes
          });
        }
      });

      // Realizar el POST al endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presupuestoData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Error al guardar el presupuesto');
      }

      const presupuestoGuardado = await response.json();
      console.log('Presupuesto guardado:', presupuestoGuardado);
      
      const presupuestoResumen = {
        numeroPresupuesto: presupuestoId,
        fecha: new Date().toLocaleDateString(),
        cliente: selectedClient,
        productos: tableData.map(item => ({
          nombre: item.name,
          descripcion: item.description,
          tipoTela: item.detalles?.tipoTela || '',
          precioUnitario: Number(item.price),
          cantidad: Number(item.quantity),
          subtotal: Number(item.price) * Number(item.quantity)
        })),
        subtotal: subtotal,
        descuento: discount, // Usar el descuento calculado
        total: finalTotal
      };

      setPresupuestoGenerado(presupuestoResumen);
      setShowResume(true);
      setSubmitStatus('success');
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error al emitir presupuesto:', error);
      mostrarErrorToast(error instanceof Error ? error.message : 'Error al emitir el presupuesto');
      setSubmitStatus('error');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Nueva función para actualizar el precio de un producto en la tabla por medidaId
  const actualizarPrecioPorMedidaId = (medidaId: number, nuevoPrecio: number) => {
    setTableData(prevData => prevData.map(item =>
      item.detalles && 'medidaId' in item.detalles && item.detalles.medidaId === medidaId
        ? { ...item, price: nuevoPrecio, total: nuevoPrecio * Number(item.quantity) }
        : item
    ));
  };

  return (
    <Card className="p-8">
      <h1 style={{ fontSize: "200" }}>Generar Presupuesto</h1>
      <Spacer y={6} />
      
      <BudgetClientSection
        onClientSelect={setSelectedClient}
        selectedClient={selectedClient}
      />
      
      <Spacer y={1} />
      
      <BudgetProductSection
        onProductSelect={handleProductSelect}
        onShowPedidoModal={() => setShowPedidoModal(true)}
      />
      
      <Spacer y={2} />
      
      <BudgetTable
        items={tableData}
        onQuantityChange={handleQuantityChange}
        onRemoveItem={handleRemoveProduct}
        onEditItem={handleEditItem}
      />
      
      <Spacer y={1} />
      
      <BudgetSummary
        items={tableData}
        applyDiscount={applyDiscount}
        onDiscountChange={handleDiscountChange}
        shouldRound={shouldRound}
      />
      
      <Spacer y={6} />
      
      <form onSubmit={handleEmitirPresupuesto}>

        {isSubmitted && (
          <div className={`relative flex-1 px-4 py-3 rounded border ${
            submitStatus === 'success' 
              ? 'text-teal-700 bg-teal-200 bg-opacity-30 border-teal-500 border-opacity-30'
              : 'text-red-700 bg-red-200 bg-opacity-30 border-red-500 border-opacity-30'
          }`}>
            <strong className="font-bold">
              {submitStatus === 'success' 
                ? 'Recordá que al emitir el presupuesto el mismo queda guardado en el historial del cliente para su posterior uso!'
                : 'No se pudo emitir el presupuesto'}
            </strong>
          </div>
        )}

        <div className="flex gap-2 justify-start mt-4">
          <LoadingButton
            color="success"
            type="submit"
            isLoading={isLoading}
            loadingText="Emitiendo..."
          >
            Emitir Presupuesto
          </LoadingButton>
        </div>
      </form>

      <GenerarPedidoModal
        isOpen={showPedidoModal}
        onOpenChange={setShowPedidoModal}
        selectedClient={selectedClient}
        productos={tableData}
        total={calculateTotals(tableData, applyDiscount, discountType === "percentage" ? Number(discountValue) : undefined, discountType === "amount" ? Number(discountValue) : undefined, shouldRound).finalTotal}
        onPedidoCreated={handleAddPedido}
        medidasPrecargadas={undefined}
      />

      {showResume && presupuestoGenerado && (
        <BudgetResume presupuestoData={presupuestoGenerado} />
      )}
      
      {/* Toast de error */}
      {showErrorToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{toastMessage}</p>
              </div>
              <button
                onClick={() => setShowErrorToast(false)}
                className="flex-shrink-0 text-white hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}; 