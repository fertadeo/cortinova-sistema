import { useState, useEffect } from "react";
import { Card, Spacer } from "@heroui/react";
import { Client, TableItem, PresupuestoResumen, BudgetOption } from '../../types/budget';
import { BudgetClientSection } from "./BudgetClientSection";
import { BudgetProductSection } from "./BudgetProductSection";
import { BudgetTable } from "./BudgetTable";
import { BudgetSummary } from "./BudgetSummary";
import { LoadingButton } from "../shared/LoadingButton";
import { useBudgetCalculations } from "../../hooks/useBudgetCalculations";
import GenerarPedidoModal from "../GenerarPedidoModal";
import BudgetResume from "../budgetResume";
import { useSearchParams, useRouter } from 'next/navigation';

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
    incluirMotorizacion?: boolean;
    precioMotorizacion?: number;
    tipoApertura?: string;
    ladoApertura?: string;
    // Información de segunda tela
    tela2?: any;
    multiplicadorTela2?: number;
    cantidadTelaManual2?: number | null;
  };
  id: number;
  productId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  espacio?: string; // Agregar campo espacio
}

const calcularPrecioTela = (ancho: number, alto: number, precioTela: number, esRotable: boolean, sistema?: string): number => {
  let area = ((ancho / 100) * (alto / 100));
  
  // Aplicar mínimos específicos por sistema
  if (sistema) {
    const sistemaLower = sistema.toLowerCase();
    if (sistemaLower.includes('roller')) {
      // Roller: mínimo 1 metro cuadrado
      area = Math.max(area, 1.0);
    } else if (sistemaLower.includes('barcelona') || sistemaLower.includes('bandas verticales')) {
      // Bandas verticales: mínimo 1.5 metros cuadrados
      area = Math.max(area, 1.5);
    }
    // Otros sistemas: sin mínimo (mantener área original)
  }
  
  return area * precioTela;
};

export const BudgetGenerator = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Estados del cliente
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Estados de productos y tabla
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TableItem | null>(null);
  
  // Estados de descuento y cálculos
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [shouldRound, setShouldRound] = useState(false);
  const [showMeasuresInPDF, setShowMeasuresInPDF] = useState(false);
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
  const [presupuestoId, setPresupuestoId] = useState<number | null>(null);

  // Estados de presupuesto estimativo
  const [esEstimativo, setEsEstimativo] = useState(false);
  const [checkboxesCargados, setCheckboxesCargados] = useState(false);

  // Efecto para manejar la precarga desde URL
  useEffect(() => {
    // Resetear el flag de checkboxes cargados al iniciar
    setCheckboxesCargados(false);
    
    const loadPresetData = async () => {
      const clienteId = searchParams.get('clienteId');
      const medidasIds = searchParams.getAll('medidas');
      const editId = searchParams.get('editId');

      // Si hay un editId, cargar el presupuesto para editar
      if (editId) {
        try {
          const presupuestoResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/${editId}?include=clientes,producto`
          );
          
          if (!presupuestoResponse.ok) {
            throw new Error('Error al cargar el presupuesto');
          }

          const presupuestoData = await presupuestoResponse.json();
          const presupuesto = presupuestoData.data || presupuestoData;

          // Cargar cliente
          if (presupuesto.cliente_id) {
            const clientResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/clientes/${presupuesto.cliente_id}`
            );
            
            if (clientResponse.ok) {
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
            }
          }

          // Parsear presupuesto_json si existe
          // Tipamos como any porque la estructura puede variar entre versiones de presupuesto
          let presupuestoJson: any = null;
          if (presupuesto.presupuesto_json) {
            try {
              presupuestoJson = typeof presupuesto.presupuesto_json === 'string' 
                ? JSON.parse(presupuesto.presupuesto_json) 
                : presupuesto.presupuesto_json;
            } catch (error) {
              console.error('Error al parsear presupuesto_json:', error);
            }
          }

          // Cargar configuración del presupuesto
          // IMPORTANTE: Recuperar valores de checkboxes desde presupuesto_json
          // Función helper para convertir valores a booleanos (maneja strings, números, booleanos)
          const toBoolean = (value: any): boolean => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
            if (typeof value === 'number') return value === 1 || value > 0;
            return false;
          };
          
          if (presupuestoJson) {
            // Recuperar valores booleanos, convirtiendo explícitamente
            const esEstimativoValue = toBoolean(presupuestoJson.esEstimativo);
            const shouldRoundValue = toBoolean(presupuestoJson.shouldRound);
            const applyDiscountValue = toBoolean(presupuestoJson.applyDiscount);
            const showMeasuresInPDFValue = toBoolean(presupuestoJson.showMeasuresInPDF);
            
            // Establecer valores de checkboxes
            setEsEstimativo(esEstimativoValue);
            setShouldRound(shouldRoundValue);
            setApplyDiscount(applyDiscountValue);
            setShowMeasuresInPDF(showMeasuresInPDFValue);
            
            // Marcar que los checkboxes han sido cargados
            setCheckboxesCargados(true);
            
            console.log('✅ Checkboxes recuperados desde presupuesto_json:', {
              esEstimativo: esEstimativoValue,
              applyDiscount: applyDiscountValue,
              showMeasuresInPDF: showMeasuresInPDFValue,
              shouldRound: shouldRoundValue,
              valoresOriginales: {
                esEstimativo: presupuestoJson.esEstimativo,
                applyDiscount: presupuestoJson.applyDiscount,
                showMeasuresInPDF: presupuestoJson.showMeasuresInPDF,
                shouldRound: presupuestoJson.shouldRound
              }
            });
            
            if (applyDiscountValue) {
              // Determinar tipo de descuento
              if (presupuestoJson.descuento > 0 && presupuestoJson.subtotal > 0) {
                const porcentaje = (presupuestoJson.descuento / presupuestoJson.subtotal) * 100;
                if (porcentaje === Math.round(porcentaje)) {
                  setDiscountType("percentage");
                  setDiscountValue(porcentaje.toString());
                } else {
                  setDiscountType("amount");
                  setDiscountValue(presupuestoJson.descuento.toString());
                }
              }
            }
          } else {
            // Si no hay presupuesto_json, establecer valores por defecto explícitamente
            console.log('ℹ️ No hay presupuesto_json, usando valores por defecto');
            setEsEstimativo(false);
            setShouldRound(false);
            setApplyDiscount(false);
            setShowMeasuresInPDF(false);
            setCheckboxesCargados(true); // Marcar como cargados incluso si no hay JSON
          }

          // Convertir items del presupuesto a TableItem
          const tableItems: TableItem[] = (presupuesto.items || []).map((item: any, index: number) => {
            const productoJson = presupuestoJson?.productos?.[index] || {};
            
            // Calcular precio unitario base (sin motorización)
            const cantidad = Number(item.cantidad) || 0;
            const subtotalTotal = Number(item.subtotal) || 0;
            const incluirMotorizacion = Boolean(
              productoJson.incluirMotorizacion || 
              item.detalles?.incluirMotorizacion
            );
            const precioMotorizacionUnitario = incluirMotorizacion 
              ? Number(productoJson.precioMotorizacion || item.detalles?.precioMotorizacion || 0) 
              : 0;
            const subtotalMotorizacion = precioMotorizacionUnitario * cantidad;
            const precioUnitarioBase = subtotalTotal - subtotalMotorizacion;
            const precioUnitario = cantidad > 0 ? precioUnitarioBase / cantidad : precioUnitarioBase;

            return {
              id: item.id || Date.now() + index,
              productId: item.producto_id || Date.now() + index,
              name: item.nombre,
              description: item.descripcion || '',
              quantity: cantidad,
              price: precioUnitario,
              total: subtotalTotal,
              espacio: productoJson.espacio || item.espacio || 'Sin especificar',
              detalles: {
                sistema: item.detalles?.sistema || productoJson.sistema || '',
                sistemaId: item.detalles?.sistemaId || productoJson.sistemaId || null, // IMPORTANTE: ID del sistema para identificación precisa
                detalle: item.detalles?.detalle || productoJson.detalle || '',
                caidaPorDelante: item.detalles?.caidaPorDelante || '', // Checkbox booleano (no necesita ID)
                colorSistema: item.detalles?.colorSistema || productoJson.colorSistema || '',
                ladoComando: item.detalles?.ladoComando || productoJson.ladoComando || '',
                tipoTela: item.detalles?.tipoTela || productoJson.tipoTela || '',
                soporteIntermedio: item.detalles?.soporteIntermedio || false,
                soporteDoble: item.detalles?.soporteDoble || false,
                // IMPORTANTE: Restaurar objetos completos y IDs de productos
                soporteIntermedioTipo: item.detalles?.soporteIntermedioTipo || productoJson.soporteIntermedioTipo || null,
                soporteIntermedioId: item.detalles?.soporteIntermedioId || productoJson.soporteIntermedioId || item.detalles?.soporteIntermedioTipo?.id || null,
                soporteDobleProducto: item.detalles?.soporteDobleProducto || productoJson.soporteDobleProducto || null,
                soporteDobleProductoId: item.detalles?.soporteDobleProductoId || productoJson.soporteDobleProductoId || item.detalles?.soporteDobleProducto?.id || null,
                selectedRielBarral: item.detalles?.selectedRielBarral || productoJson.selectedRielBarral || item.detalles?.productoSeleccionado || productoJson.productoSeleccionado || null,
                selectedRielBarralId: item.detalles?.selectedRielBarralId || productoJson.selectedRielBarralId || item.detalles?.selectedRielBarral?.id || item.detalles?.productoSeleccionado?.id || null,
                accesorios: item.detalles?.accesorios || [],
                accesoriosAdicionales: item.detalles?.accesoriosAdicionales || [],
                ancho: productoJson.ancho || item.detalles?.ancho,
                alto: productoJson.alto || item.detalles?.alto,
                incluirMotorizacion,
                precioMotorizacion: precioMotorizacionUnitario,
                // IMPORTANTE: Restaurar el objeto completo de la tela desde productoJson o item.detalles
                // Si está disponible en productoJson (desde presupuesto_json), usar ese
                // Si no, intentar desde item.detalles
                // Si tampoco, usar null (se buscará por nombre más tarde)
                tela: productoJson.tela || item.detalles?.tela || null,
                // También restaurar segunda tela si existe
                tela2: productoJson.tela2 || item.detalles?.tela2 || null,
                multiplicadorTela: productoJson.multiplicadorTela || item.detalles?.multiplicadorTela || null,
                multiplicadorTela2: productoJson.multiplicadorTela2 || item.detalles?.multiplicadorTela2 || null,
                cantidadTelaManual: productoJson.cantidadTelaManual || item.detalles?.cantidadTelaManual || null,
                cantidadTelaManual2: productoJson.cantidadTelaManual2 || item.detalles?.cantidadTelaManual2 || null,
                ...(item.detalles || {})
              } as any
            };
          });

          setTableData(tableItems);
          
          // Guardar el ID del presupuesto para actualizar después
          setPresupuestoId(parseInt(editId));
          
        } catch (error) {
          console.error('Error al cargar presupuesto para editar:', error);
          mostrarErrorToast(error instanceof Error ? error.message : "Error al cargar el presupuesto");
        }
        return;
      }

      // Código original para cargar medidas precargadas
      // Si no hay editId ni medidas para cargar, marcar checkboxes como cargados (valores por defecto)
      if (!clienteId || !medidasIds.length) {
        setCheckboxesCargados(true);
        return;
      }

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
              description: `Alto: ${medida.alto}cm | Ancho: ${medida.ancho}cm - ${medida.ubicacion}`,
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
        setCheckboxesCargados(true); // Marcar como cargados después de cargar medidas

      } catch (error) {
        console.error('Error detallado:', error);
        mostrarErrorToast(error instanceof Error ? error.message : "Error al cargar los datos preestablecidos");
        setCheckboxesCargados(true); // Marcar como cargados incluso si hay error
      }
    };

    loadPresetData();
  }, [searchParams]);

  // Efecto para verificar que los valores de checkboxes se establezcan correctamente
  useEffect(() => {
    console.log('🔍 [DEBUG] Estados actuales de checkboxes:', {
      esEstimativo,
      applyDiscount,
      showMeasuresInPDF,
      shouldRound
    });
  }, [esEstimativo, applyDiscount, showMeasuresInPDF, shouldRound]);

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
            total: (() => {
              const baseTotal = item.price * quantity;
              const motorizacion = item.detalles?.incluirMotorizacion 
                ? (item.detalles.precioMotorizacion || 0) * quantity 
                : 0;
              return baseTotal + motorizacion;
            })()
          } : item
        )
      );
    }
  };

  const handleRemoveProduct = (id: number) => {
    setTableData(prevData => prevData.filter(item => item.id !== id));
  };

  // Manejador de pedido personalizado
  const handleAddPedido = (pedido: any, editingItemId?: number) => {
    console.log('=== PEDIDO RECIBIDO EN BUDGETGENERATOR ===');
    console.log('Pedido completo:', pedido);
    console.log('Detalles del pedido:', pedido.detalles);
    console.log('Accesorios:', pedido.detalles?.accesorios);
    console.log('Accesorios adicionales:', pedido.detalles?.accesoriosAdicionales);
    console.log('Editando item ID:', editingItemId);
    
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
    
    // Usar exactamente el precio total que se muestra en el resumen del modal
    // Este precio ya incluye sistema, tela, colocación, motorización y accesorios
    const precioTotalDelModal = pedido.precioTotal;
    
    // Calcular el precio unitario dividiendo por la cantidad
    // Esto permite que al cambiar cantidad en la tabla, se recalcule proporcionalmente
    const cantidadDelPedido = pedido.detalles?.cantidad || 1;
    const precioUnitarioCalculado = precioTotalDelModal / cantidadDelPedido;
    
    console.log('🎯 PRECIO EXACTO DEL MODAL:', {
      precioTotalDelModal: precioTotalDelModal,
      cantidadDelPedido: cantidadDelPedido,
      precioUnitarioCalculado: precioUnitarioCalculado
    });
    
    console.log('Motorización:', {
      incluirMotorizacion: pedido.detalles?.incluirMotorizacion,
      precioMotorizacion: pedido.detalles?.precioMotorizacion,
      cantidad: pedido.detalles?.cantidad
    });
    console.log('Cálculos:', {
      precioTotalDelModal: precioTotalDelModal,
      cantidadDelPedido: cantidadDelPedido,
      precioUnitarioCalculado: precioUnitarioCalculado
    });
    // Crear el objeto del item actualizado
    const itemActualizado = {
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
        // Para otros sistemas, incluir información de segunda tela si existe
        const telaPrincipal = pedido.detalles?.tela?.nombreProducto || pedido.tela?.nombreProducto || '';
        const telaSecundaria = pedido.detalles?.tela2?.nombreProducto || '';
        
        if (telaSecundaria) {
          return `${telaPrincipal} + ${telaSecundaria}`;
        }
        return telaPrincipal;
      })(),
      quantity: cantidadDelPedido,
      price: precioUnitarioCalculado,
      total: precioTotalDelModal,
      espacio: pedido.espacio === "Otro" ? pedido.espacioPersonalizado : pedido.espacio,
      detalles: {
        sistema: pedido.sistema || "",
        sistemaId: pedido.sistemaId || pedido.detalles?.sistemaId || null, // IMPORTANTE: ID del sistema para identificación precisa
        detalle: pedido.detalles?.detalle || "",
        caidaPorDelante: pedido.detalles?.caidaPorDelante ? "Si" : "No", // Checkbox booleano (no necesita ID)
        colorSistema: pedido.detalles?.colorSistema || "",
        ladoComando: pedido.detalles?.ladoComando || "",
        tipoTela: pedido.detalles?.tela?.nombreProducto || pedido.tela?.nombreProducto || "",
        // IMPORTANTE: Si hay producto de soporte guardado, el booleano debe ser true
        soporteIntermedio: Boolean(pedido.detalles?.soporteIntermedioTipo) || Boolean(pedido.detalles?.soporteIntermedioId) || pedido.detalles?.soporteIntermedio || false,
        soporteDoble: Boolean(pedido.detalles?.soporteDobleProducto) || Boolean(pedido.detalles?.soporteDobleProductoId) || pedido.detalles?.soporteDoble || false,
        // IMPORTANTE: Guardar objetos completos y IDs de productos
        soporteIntermedioTipo: pedido.detalles?.soporteIntermedioTipo || null,
        soporteIntermedioId: pedido.detalles?.soporteIntermedioId || pedido.detalles?.soporteIntermedioTipo?.id || null,
        soporteDobleProducto: pedido.detalles?.soporteDobleProducto || null,
        soporteDobleProductoId: pedido.detalles?.soporteDobleProductoId || pedido.detalles?.soporteDobleProducto?.id || null,
        selectedRielBarral: pedido.detalles?.selectedRielBarral || pedido.detalles?.productoSeleccionado || null,
        selectedRielBarralId: pedido.detalles?.selectedRielBarralId || pedido.detalles?.selectedRielBarral?.id || pedido.detalles?.productoSeleccionado?.id || null,
        accesorios: pedido.detalles?.accesorios || [],
        accesoriosAdicionales: pedido.detalles?.accesoriosAdicionales || [],
        medidaId: pedido.medidaId,
        ancho: pedido.detalles?.ancho,
        alto: pedido.detalles?.alto,
        ubicacion: pedido.detalles?.ubicacion,
        // Información específica para tela tradicional
        multiplicadorTela: pedido.detalles?.multiplicadorTela || null,
        metrosTotalesTela: pedido.detalles?.metrosTotalesTela || null,
        // Información específica para segunda tela
        tela2: pedido.detalles?.tela2 || null,
        multiplicadorTela2: pedido.detalles?.multiplicadorTela2 || null,
        cantidadTelaManual2: pedido.detalles?.cantidadTelaManual2 || null,
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
        }),
        // Información de motorización
        incluirMotorizacion: pedido.detalles?.incluirMotorizacion || false,
        precioMotorizacion: pedido.detalles?.precioMotorizacion || 0,
        // Incluir otros campos que puedan estar en los detalles
        // IMPORTANTE: Guardar el objeto completo de la tela con ID, nombre, precio, etc.
        tela: pedido.detalles?.tela || pedido.tela || null,
        incluirColocacion: pedido.incluirColocacion || false,
        precioColocacion: pedido.precioColocacion || 0
      } as any
    };

    // Si estamos editando un item existente, actualizarlo
    if (editingItemId !== undefined) {
      setTableData(prev => prev.map(item => 
        item.id === editingItemId
          ? {
              ...item,
              ...itemActualizado
            }
          : item
      ));
      // Limpiar el item a editar
      setItemToEdit(null);
    } else if (pedido.medidaId) {
      // Si el pedido viene de una medida precargada, actualizar ese item
      setTableData(prev => prev.map(item => 
        item.detalles && 'medidaId' in item.detalles && item.detalles.medidaId === pedido.medidaId
          ? {
              ...item,
              ...itemActualizado
            }
          : item
      ));
    } else {
      // Código para nuevo item
      const newTableItem: TableItem = {
        id: Date.now(),
        productId: Date.now(),
        ...itemActualizado
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
    // Guardar el item a editar para pasarlo al modal
    setItemToEdit(item);
    
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

  const handleShowMeasuresChange = (checked: boolean) => {
    setShowMeasuresInPDF(checked);
  };

  const handleEstimativoChange = (checked: boolean) => {
    setEsEstimativo(checked);
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
      
      // Generar ID basado en la fecha actual solo si no estamos editando
      let presupuestoIdString = null;
      if (!presupuestoId) {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        presupuestoIdString = `${year}${month}${day}-${hours}${minutes}${seconds}`;
      }
      
      const { subtotal, discount, finalTotal } = calculateTotals(
        tableData, 
        applyDiscount,
        discountType === "percentage" ? Number(discountValue) : undefined,
        discountType === "amount" ? Number(discountValue) : undefined,
        shouldRound
      );

      // Crear el objeto de presupuesto para enviar al backend
      const presupuestoData: any = {
        estado: "Emitido",
        clienteId: selectedClient.id,
        // IMPORTANTE: Guardar valores booleanos explícitamente (incluso si son false)
        esEstimativo: Boolean(esEstimativo),
        showMeasuresInPDF: Boolean(showMeasuresInPDF),
        shouldRound: Boolean(shouldRound),
        applyDiscount: Boolean(applyDiscount),
        subtotal: subtotal,
        descuento: discount,
        total: finalTotal,
        productos: tableData.map(item => {
          console.log('Item detalles antes de enviar:', item.detalles);
          console.log('Item espacio:', item.espacio);
          
          const cantidad = Number(item.quantity);
          const precioUnitario = Number(item.price);
          const precioMotorizacionUnitario = item.detalles?.incluirMotorizacion 
            ? (item.detalles.precioMotorizacion || 0) 
            : 0;
          const subtotalTotal = precioUnitario * cantidad;
          
          return {
            id: item.productId || Date.now(),
            nombre: item.name,
            descripcion: item.description,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            subtotal: subtotalTotal,
            espacio: item.espacio,
            incluirMotorizacion: item.detalles?.incluirMotorizacion || false,
            precioMotorizacion: precioMotorizacionUnitario,
            // Usamos cast a any porque la propiedad 'tela' no está definida en el tipo base de detalles
            tipoTela: item.detalles?.tipoTela || (item.detalles as any)?.tela?.nombreProducto || '',
            // Cast a any porque 'sistemaId' no existe en el tipo base de detalles pero sí en tiempo de ejecución
            sistemaId: (item.detalles as any)?.sistemaId || null, // IMPORTANTE: ID del sistema para identificación precisa
            tipoApertura: item.detalles?.tipoApertura || '',
            colorSistema: item.detalles?.colorSistema || '',
            ladoComando: item.detalles?.ladoComando || '',
            ladoApertura: item.detalles?.ladoApertura || '',
            detalle: item.detalles?.detalle || '',
            // Incluir medidas del producto en el JSON
            ancho: item.detalles?.ancho,
            alto: item.detalles?.alto,
            // IMPORTANTE: Guardar el objeto completo de la tela con ID, nombre, precio, etc.
            tela: (item.detalles as any)?.tela || null,
            // Información de segunda tela
            tela2: (item.detalles as any)?.tela2 || null,
            multiplicadorTela2: (item.detalles as any)?.multiplicadorTela2 || null,
            cantidadTelaManual2: (item.detalles as any)?.cantidadTelaManual2 || null,
            // IMPORTANTE: Guardar objetos completos y IDs de productos de soportes
            // Si hay producto de soporte guardado, el booleano debe ser true
            soporteIntermedio: Boolean((item.detalles as any)?.soporteIntermedioTipo) || Boolean((item.detalles as any)?.soporteIntermedioId) || (item.detalles as any)?.soporteIntermedio || false,
            soporteIntermedioTipo: (item.detalles as any)?.soporteIntermedioTipo || null,
            soporteIntermedioId: (item.detalles as any)?.soporteIntermedioId || (item.detalles as any)?.soporteIntermedioTipo?.id || null,
            soporteDoble: Boolean((item.detalles as any)?.soporteDobleProducto) || Boolean((item.detalles as any)?.soporteDobleProductoId) || (item.detalles as any)?.soporteDoble || false,
            soporteDobleProducto: (item.detalles as any)?.soporteDobleProducto || null,
            soporteDobleProductoId: (item.detalles as any)?.soporteDobleProductoId || (item.detalles as any)?.soporteDobleProducto?.id || null,
            selectedRielBarral: (item.detalles as any)?.selectedRielBarral || (item.detalles as any)?.productoSeleccionado || null,
            selectedRielBarralId: (item.detalles as any)?.selectedRielBarralId || (item.detalles as any)?.selectedRielBarral?.id || (item.detalles as any)?.productoSeleccionado?.id || null
          };
        })
      };

      // Solo agregar numeroPresupuesto si estamos creando uno nuevo
      if (presupuestoIdString) {
        presupuestoData.numeroPresupuesto = presupuestoIdString;
      }

      // Si estamos editando, agregar la fecha de última modificación
      if (presupuestoId) {
        presupuestoData.fecha_ultima_modificacion = new Date().toISOString();
        console.log('📅 Fecha de última modificación agregada:', presupuestoData.fecha_ultima_modificacion);
      }

      console.log('PresupuestoData completo con espacios:', presupuestoData.productos.map((p: any) => ({ nombre: p.nombre, espacio: p.espacio })));
      console.log('📋 PresupuestoData completo enviado:', {
        estado: presupuestoData.estado,
        fecha_ultima_modificacion: presupuestoData.fecha_ultima_modificacion,
        presupuestoId: presupuestoId,
        metodo: presupuestoId ? 'PUT' : 'POST'
      });

      tableData.forEach((item, index) => {
        console.log(`Producto ${index + 1}:`, {
          nombre: item.name,
          descripcion: item.description,
          cantidad: item.quantity,
          precio: item.price,
          total: item.total,
          espacio: item.espacio,
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

      // Si estamos editando, hacer PUT, sino POST
      const url = presupuestoId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/${presupuestoId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/presupuestos`;
      
      const method = presupuestoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presupuestoData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(presupuestoId ? 'Error al actualizar el presupuesto' : 'Error al guardar el presupuesto');
      }

      const presupuestoGuardado = await response.json();
      console.log('Presupuesto guardado:', presupuestoGuardado);
      
      // Si estamos editando, usar el número existente del presupuesto guardado
      const numeroPresupuestoFinal = presupuestoId 
        ? (presupuestoGuardado.data?.numero_presupuesto || presupuestoGuardado.numero_presupuesto)
        : presupuestoIdString;
      
      const presupuestoResumen = {
        numeroPresupuesto: numeroPresupuestoFinal || '',
        fecha: new Date().toLocaleDateString(),
        cliente: selectedClient,
        // IMPORTANTE: Guardar valores booleanos explícitamente (incluso si son false)
        showMeasuresInPDF: Boolean(showMeasuresInPDF),
        esEstimativo: Boolean(esEstimativo),
        shouldRound: Boolean(shouldRound),
        applyDiscount: Boolean(applyDiscount),
        productos: tableData.map(item => {
          const cantidad = Number(item.quantity);
          const precioUnitario = Number(item.price);
          const precioMotorizacionUnitario = item.detalles?.incluirMotorizacion 
            ? (item.detalles.precioMotorizacion || 0) 
            : 0;
          const subtotalTotal = precioUnitario * cantidad;
          
          return {
            nombre: item.name,
            descripcion: item.description,
            tipoTela: item.detalles?.tipoTela || '',
            precioUnitario: precioUnitario,
            cantidad: cantidad,
            subtotal: subtotalTotal,
            espacio: item.espacio,
            incluirMotorizacion: item.detalles?.incluirMotorizacion || false,
            precioMotorizacion: precioMotorizacionUnitario,
            tipoApertura: item.detalles?.tipoApertura || '',
            colorSistema: item.detalles?.colorSistema || '',
            ladoComando: item.detalles?.ladoComando || '',
            ladoApertura: item.detalles?.ladoApertura || '',
            detalle: item.detalles?.detalle || '',
            // Medidas del producto
            ancho: item.detalles?.ancho || undefined,
            alto: item.detalles?.alto || undefined,
            // Información de segunda tela
            tela2: (item.detalles as any)?.tela2 || null,
            multiplicadorTela2: (item.detalles as any)?.multiplicadorTela2 || null,
            cantidadTelaManual2: (item.detalles as any)?.cantidadTelaManual2 || null
          };
        }),
        subtotal: subtotal,
        descuento: discount,
        total: finalTotal
      };

      setPresupuestoGenerado(presupuestoResumen);
      setShowResume(true);
      setSubmitStatus('success');
      setIsSubmitted(true);
      
      // Si estamos editando, redirigir a home (donde está la tabla de presupuestos) después de un delay
      if (presupuestoId) {
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error al emitir presupuesto:', error);
      mostrarErrorToast(error instanceof Error ? error.message : (presupuestoId ? 'Error al actualizar el presupuesto' : 'Error al emitir el presupuesto'));
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
      <h1 style={{ fontSize: "200" }}>{presupuestoId ? "Editar Presupuesto" : "Generar Presupuesto"}</h1>
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
      
      {/* Solo renderizar BudgetSummary después de que los checkboxes se hayan cargado */}
      {checkboxesCargados && (
        <BudgetSummary
          key={`summary-${applyDiscount}-${showMeasuresInPDF}-${esEstimativo}-${shouldRound}`}
          items={tableData}
          applyDiscount={applyDiscount}
          onDiscountChange={handleDiscountChange}
          shouldRound={shouldRound}
          showMeasuresInPDF={showMeasuresInPDF}
          onShowMeasuresChange={handleShowMeasuresChange}
          esEstimativo={esEstimativo}
          onEstimativoChange={handleEstimativoChange}
          opciones={[]}
          onOpcionesChange={() => {}}
        />
      )}
      
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
                ? (presupuestoId 
                    ? '¡Presupuesto actualizado exitosamente!'
                    : 'Recordá que al emitir el presupuesto el mismo queda guardado en el historial del cliente para su posterior uso!'
                  )
                : (presupuestoId 
                    ? 'No se pudo actualizar el presupuesto'
                    : 'No se pudo emitir el presupuesto'
                  )}
            </strong>
          </div>
        )}

        <div className="flex gap-2 justify-start mt-4">
          <LoadingButton
            color="success"
            type="submit"
            isLoading={isLoading}
            loadingText={presupuestoId ? "Actualizando..." : "Emitiendo..."}
          >
            {presupuestoId ? "Actualizar Presupuesto" : "Emitir Presupuesto"}
          </LoadingButton>
        </div>
      </form>

      <GenerarPedidoModal
        isOpen={showPedidoModal}
        onOpenChange={(isOpen) => {
          setShowPedidoModal(isOpen);
          // Limpiar el item a editar cuando se cierra el modal
          if (!isOpen) {
            setItemToEdit(null);
          }
        }}
        selectedClient={selectedClient}
        productos={tableData}
        total={calculateTotals(tableData, applyDiscount, discountType === "percentage" ? Number(discountValue) : undefined, discountType === "amount" ? Number(discountValue) : undefined, shouldRound).finalTotal}
        onPedidoCreated={handleAddPedido}
        medidasPrecargadas={undefined}
        itemToEdit={itemToEdit}
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
