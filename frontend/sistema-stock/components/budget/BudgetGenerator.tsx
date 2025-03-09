import { useState, useEffect } from "react";
import { Card, Spacer } from "@nextui-org/react";
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
  detalles: { sistema: string; detalle: string; caidaPorDelante: string; colorSistema: string; ladoComando: string; tipoTela: string; soporteIntermedio: boolean; soporteDoble: boolean; };
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
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  
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
        setErrorMessage(error instanceof Error ? error.message : "Error al cargar los datos preestablecidos");
        setShowErrorAlert(true);
      }
    };

    loadPresetData();
  }, [searchParams]);

  // Manejadores de productos
  const handleProductSelect = (newItem: TableItem) => {
    setTableData(prevData => [...prevData, newItem]);
  };

  const handleQuantityChange = (id: number, newQuantity: string) => {
    const quantity = parseFloat(newQuantity) || 0;
    if (quantity >= 0) {
      setTableData(prevData =>
        prevData.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveProduct = (id: number) => {
    setTableData(prevData => prevData.filter(item => item.id !== id));
  };

  // Manejador de pedido personalizado
  const handleAddPedido = (pedido: any) => {
    // Log inicial con todos los datos recibidos
    console.log('=== DATOS INICIALES DEL PEDIDO ===');
    console.log('Pedido completo:', {
      sistema: pedido.sistema,
      tela: pedido.tela,
      detalles: pedido.detalles,
      colorSistema: pedido.colorSistema,
      ladoComando: pedido.ladoComando,
      soportes: {
        intermedio: pedido.soporteIntermedio,
        doble: pedido.soporteDoble
      },
      medidas: {
        ancho: pedido.detalles?.ancho,
        alto: pedido.detalles?.alto,
        cantidad: pedido.detalles?.cantidad
      },
      ubicacion: pedido.detalles?.ubicacion,
      observaciones: pedido.detalle,
      medidaId: pedido.medidaId,
      incluirColocacion: pedido.incluirColocacion,
      colocacionDetalles: pedido.detalles?.incluirColocacion
    });

    // Asegurar que los valores sean números válidos
    const anchoNum = Number(pedido.detalles.ancho) || 0;
    const altoNum = Number(pedido.detalles.alto) || 0;
    const cantidadNum = Number(pedido.detalles.cantidad) || 1;
    
    // Mejorar la obtención del precio de la tela
    const precioTelaNum = pedido.tela?.precio 
      ? Number(pedido.tela.precio) 
      : pedido.detalles?.tela?.precio 
        ? Number(pedido.detalles.tela.precio)
        : 0;

    // Calcular precio del sistema
    const precioSistema = (anchoNum / 100) * 12000;

    // Calcular precio de la tela
    const precioTela = precioTelaNum > 0 
      ? calcularPrecioTela(
          anchoNum,
          altoNum,
          precioTelaNum,
          pedido.tela?.nombre === 'ROLLER' || pedido.detalles?.tela?.nombre === 'ROLLER'
        )
      : 0;

    // Calcular precio de colocación - Mejorado para verificar en múltiples lugares
    const incluirColocacion = pedido.incluirColocacion || 
                            pedido.detalles?.incluirColocacion || 
                            false;
    const precioColocacion = incluirColocacion ? 10000 : 0;

    // Log específico para debug de colocación
    console.log('=== DEBUG COLOCACIÓN ===', {
      'pedido.incluirColocacion': pedido.incluirColocacion,
      'pedido.detalles.incluirColocacion': pedido.detalles?.incluirColocacion,
      'incluirColocacion final': incluirColocacion,
      'precioColocacion': precioColocacion
    });

    // Calcular precio total
    const precioTotal = (precioSistema + precioTela + precioColocacion) * cantidadNum;

    // Log de los cálculos de precio
    console.log('=== CÁLCULOS DE PRECIO ===');
    console.log('Valores calculados:', {
      dimensiones: `${anchoNum}cm x ${altoNum}cm`,
      cantidad: cantidadNum,
      precioTela: precioTelaNum,
      precioSistema: precioSistema,
      precioTelaCalculado: precioTela,
      costoColocacion: precioColocacion,
      precioTotalFinal: precioTotal,
      desglose: {
        sistema: precioSistema,
        tela: precioTela,
        colocacion: precioColocacion,
        subtotal: precioSistema + precioTela + precioColocacion,
        cantidadAplicada: `x${cantidadNum}`,
        total: precioTotal
      }
    });

    // Crear la descripción detallada
    const descripcionDetallada = `${anchoNum}cm x ${altoNum}cm - ${
      pedido.detalles?.tela?.nombre || pedido.tela?.nombre || ''
    }${
      pedido.detalles?.colorSistema ? ` - Color ${pedido.detalles.colorSistema}` : ''
    }${
      pedido.detalles?.ladoComando ? ` - Comando ${pedido.detalles.ladoComando}` : ''
    }${
      pedido.detalles?.caidaPorDelante ? ' - Caída por delante' : ''
    }${
      pedido.detalles?.soporteDoble ? ' - Soporte Doble' : 
      pedido.detalles?.soporteIntermedio ? ' - Soporte Intermedio' : ''
    }${
      pedido.detalles?.detalle ? ` - ${pedido.detalles.detalle}` : ''
    }`;

    // Si el pedido viene de una medida precargada, actualizar ese item
    if (pedido.medidaId) {
      setTableData(prev => prev.map(item => 
        item.detalles && 'medidaId' in item.detalles && item.detalles.medidaId === pedido.medidaId
          ? {
              ...item,
              name: `Cortina ${item.detalles.ubicacion || pedido.detalles?.ubicacion} - ${pedido.sistema}`,
              description: `${anchoNum}cm x ${altoNum}cm - ${
                pedido.detalles?.tela?.nombre || pedido.tela?.nombre || ''
              }${
                pedido.detalles?.colorSistema ? ` - Color ${pedido.detalles.colorSistema}` : ''
              }${
                pedido.detalles?.ladoComando ? ` - Comando ${pedido.detalles.ladoComando}` : ''
              }${
                pedido.detalles?.detalle ? ` - ${pedido.detalles.detalle}` : ''
              }`,
              quantity: pedido.detalles?.cantidad || 1,
              price: precioTotal / (pedido.detalles?.cantidad || 1),
              total: precioTotal,
              detalles: {
                sistema: pedido.sistema || "",
                detalle: pedido.detalles?.detalle || "",
                caidaPorDelante: pedido.detalles?.caidaPorDelante ? "Si" : "No",
                colorSistema: pedido.detalles?.colorSistema || "",
                ladoComando: pedido.detalles?.ladoComando || "",
                tipoTela: pedido.detalles?.tela?.nombre || pedido.tela?.nombre || "",
                soporteIntermedio: pedido.detalles?.soporteIntermedio || false,
                soporteDoble: pedido.detalles?.soporteDoble || false,
                medidaId: pedido.medidaId,
                ancho: anchoNum,
                alto: altoNum,
                ubicacion: pedido.detalles?.ubicacion
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
        description: `${anchoNum}cm x ${altoNum}cm - ${
          pedido.detalles?.tela?.nombre || pedido.tela?.nombre || ''
        }${
          pedido.detalles?.colorSistema ? ` - Color ${pedido.detalles.colorSistema}` : ''
        }${
          pedido.detalles?.ladoComando ? ` - Comando ${pedido.detalles.ladoComando}` : ''
        }${
          pedido.detalles?.detalle ? ` - ${pedido.detalles.detalle}` : ''
        }`,
        quantity: pedido.detalles?.cantidad || 1,
        price: precioTotal / (pedido.detalles?.cantidad || 1),
        total: precioTotal,
        detalles: {
          sistema: pedido.sistema || "",
          detalle: pedido.detalles?.detalle || "",
          caidaPorDelante: pedido.detalles?.caidaPorDelante ? "Si" : "No",
          colorSistema: pedido.detalles?.colorSistema || "",
          ladoComando: pedido.detalles?.ladoComando || "",
          tipoTela: pedido.detalles?.tela?.nombre || pedido.tela?.nombre || "",
          soporteIntermedio: pedido.detalles?.soporteIntermedio || false,
          soporteDoble: pedido.detalles?.soporteDoble || false
        }
      };
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
      setErrorMessage("Falta elegir un cliente");
      setShowErrorAlert(true);
      return;
    }
    
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const year = new Date().getFullYear();
      const newNumeroPresupuesto = numeroPresupuesto + 1;
      const presupuestoId = `PRES-${year}-${newNumeroPresupuesto.toString().padStart(3, '0')}`;
      
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
        productos: tableData.map(item => ({
          id: item.productId || Date.now(),
          nombre: item.name,
          descripcion: item.description,
          cantidad: Number(item.quantity),
          precioUnitario: Number(item.price),
          subtotal: Number(item.price) * Number(item.quantity),
          detalles: item.detalles || {}
        })),
        total: finalTotal,
        subtotal: subtotal,
        descuento: applyDiscount ? discount : 0
      };

      console.log('Enviando presupuesto al backend:', presupuestoData);

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
          precioUnitario: Number(item.price),
          cantidad: Number(item.quantity),
          subtotal: Number(item.price) * Number(item.quantity)
        })),
        subtotal: subtotal,
        descuento: applyDiscount ? discount : undefined,
        total: finalTotal
      };

      setPresupuestoGenerado(presupuestoResumen);
      setShowResume(true);
      setSubmitStatus('success');
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error al emitir presupuesto:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error al emitir el presupuesto');
      setShowErrorAlert(true);
      setSubmitStatus('error');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
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
        {showErrorAlert && (
          <div className="flex relative justify-between items-center px-4 py-3 mb-4 text-red-700 bg-red-200 bg-opacity-30 rounded border border-red-500 border-opacity-30">
            <strong className="font-bold">{errorMessage}</strong>
            <button
              type="button"
              onClick={() => setShowErrorAlert(false)}
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        )}

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
        total={calculateTotals(tableData, applyDiscount).finalTotal}
        onPedidoCreated={handleAddPedido}
        medidasPrecargadas={tableData.length > 0 && tableData[0].detalles && tableData[0].detalles.ancho && tableData[0].detalles.alto && tableData[0].detalles.ubicacion && tableData[0].detalles.medidaId ? {
          ancho: tableData[0].detalles.ancho,
          alto: tableData[0].detalles.alto,
          cantidad: tableData[0].quantity,
          ubicacion: tableData[0].detalles.ubicacion,
          medidaId: tableData[0].detalles.medidaId
        } : undefined}
      />

      {showResume && presupuestoGenerado && (
        <BudgetResume presupuestoData={presupuestoGenerado} />
      )}
    </Card>
  );
}; 