import { useState } from "react";
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
  // Estados del cliente
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Estados de productos y tabla
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  
  // Estados de descuento y cálculos
  const [applyDiscount, setApplyDiscount] = useState(false);
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
    // Inspeccionar el pedido completo
    console.log('Pedido recibido:', pedido);
    console.log('Tela del pedido:', pedido.tela);
    console.log('Precio de la tela:', pedido.tela?.precio);
    console.log('Incluir colocación:', pedido.incluirColocacion);

    // Asegurar que los valores sean números válidos
    const anchoNum = Number(pedido.detalles.ancho) || 0;  // Cambiado a pedido.detalles.ancho
    const altoNum = Number(pedido.detalles.alto) || 0;    // Cambiado a pedido.detalles.alto
    const cantidadNum = Number(pedido.detalles.cantidad) || 1;  // Cambiado a pedido.detalles.cantidad
    const precioTelaNum = pedido.tela?.precio ? Number(pedido.tela.precio) : 0;

    const precioTotal = (
      (anchoNum / 100 * 12000) + // Precio del sistema
      (pedido.tela ? calcularPrecioTela(
        anchoNum,
        altoNum,
        precioTelaNum,
        pedido.tela?.nombre === 'ROLLER'
      ) : 0) +
      (pedido.incluirColocacion ? 10000 : 0)
    ) * cantidadNum;

    console.log('Valores del pedido:', {
      ancho: anchoNum,
      alto: altoNum,
      cantidad: cantidadNum,
      precioTela: precioTelaNum,
      precioTotal
    });

    const newTableItem: TableItem = {
      id: Date.now(),
      productId: Date.now(),
      name: `Cortina ${pedido.sistema}`,
      description: pedido.detalle || 'Sin detalle',
      quantity: pedido.cantidad || 1,
      price: precioTotal / (pedido.cantidad || 1), // Precio unitario
      total: precioTotal, // Precio total
      detalles: {
        sistema: pedido.sistema || "",
        detalle: pedido.detalle || "",
        caidaPorDelante: pedido.caidaPorDelante || "",
        colorSistema: pedido.colorSistema || "",
        ladoComando: pedido.ladoComando || "",
        tipoTela: pedido.tipoTela || "",
        soporteIntermedio: pedido.soporteIntermedio || false,
        soporteDoble: pedido.soporteDoble || false
      }
    };

    setTableData(prev => [...prev, newTableItem]);
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
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación de carga
      
      const year = new Date().getFullYear();
      const newNumeroPresupuesto = numeroPresupuesto + 1;
      const presupuestoId = `PRES-${year}-${newNumeroPresupuesto.toString().padStart(3, '0')}`;
      
      const { finalTotal } = calculateTotals(tableData, applyDiscount);
      
      const presupuestoData = {
        estado: "Emitido",
        numeroPresupuesto: presupuestoId,
        clienteId: selectedClient.id,
        productos: tableData.map(item => ({
          id: item.productId,
          nombre: item.name,
          descripcion: item.description,
          cantidad: item.quantity,
          precioUnitario: item.price,
          subtotal: item.price * item.quantity,
          detalles: item.detalles || {
            sistema: "Roller",
            detalle: "",
            caidaPorDelante: "No",
            colorSistema: "",
            ladoComando: "",
            tipoTela: "",
            soporteIntermedio: false,
            soporteDoble: false
          }
        })),
        total: finalTotal
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presupuestoData)
      });

      if (!response.ok) throw new Error('Error al guardar el presupuesto');
      
      const { subtotal, discount } = calculateTotals(tableData, applyDiscount);
      
      const presupuestoResumen = {
        numeroPresupuesto: presupuestoId,
        fecha: new Date().toLocaleDateString(),
        cliente: selectedClient,
        productos: tableData.map(item => ({
          nombre: item.name,
          descripcion: item.description,
          precioUnitario: item.price,
          cantidad: item.quantity,
          subtotal: item.price * item.quantity
        })),
        subtotal,
        descuento: applyDiscount ? discount : undefined,
        total: finalTotal
      };

      setPresupuestoGenerado(presupuestoResumen);
      setShowResume(true);
      setSubmitStatus('success');
      setIsSubmitted(true);
      
    } catch (error) {
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
      />
      
      <Spacer y={1} />
      
      <BudgetSummary
        items={tableData}
        applyDiscount={applyDiscount}
        onDiscountChange={setApplyDiscount}
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
      />

      {showResume && presupuestoGenerado && (
        <BudgetResume presupuestoData={presupuestoGenerado} />
      )}
    </Card>
  );
}; 