import { Checkbox, Input, Select, SelectItem, Button } from "@heroui/react";
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { TableItem, BudgetOption } from '../../types/budget';
import { useState, useEffect } from 'react';

interface BudgetSummaryProps {
  items: TableItem[];
  applyDiscount: boolean;
  onDiscountChange: (checked: boolean, type?: "percentage" | "amount", value?: string, round?: boolean) => void;
  shouldRound: boolean;
  showMeasuresInPDF: boolean;
  onShowMeasuresChange: (checked: boolean) => void;
  esEstimativo: boolean;
  onEstimativoChange: (checked: boolean) => void;
  opciones: BudgetOption[];
  onOpcionesChange: (opciones: BudgetOption[]) => void;
}

export const BudgetSummary = ({ 
  items, 
  applyDiscount, 
  onDiscountChange, 
  shouldRound, 
  showMeasuresInPDF, 
  onShowMeasuresChange,
  esEstimativo,
  onEstimativoChange,
  opciones,
  onOpcionesChange
}: BudgetSummaryProps) => {
  const { calculateTotals } = useBudgetCalculations();
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("10");

  // Calcular el subtotal primero
  const subtotal = items.reduce((acc, item) => {
    const itemTotal = Number(item.total);
    return acc + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  // Calcular totales por opción si es estimativo
  const calcularTotalesPorOpcion = () => {
    if (!esEstimativo) return null;
    
    const totalesPorOpcion: Record<string, number> = {};
    opciones.filter(op => op.activa).forEach(opcion => {
      const itemsOpcion = items.filter(item => item.opcion === opcion.id);
      totalesPorOpcion[opcion.id] = itemsOpcion.reduce((acc, item) => acc + Number(item.total), 0);
    });
    
    return totalesPorOpcion;
  };

  // Calcular el descuento base
  const calculateBaseDiscount = () => {
    if (!applyDiscount) return 0;
    
    if (discountType === "percentage") {
      return (subtotal * Number(discountValue)) / 100;
    } else {
      return Number(discountValue);
    }
  };

  // Función para redondear al millar más cercano
  const roundToThousand = (num: number): number => {
    return Math.round(num / 1000) * 1000;
  };

  // Calcular valores finales sin actualizar el estado
  const calculateFinalValues = () => {
    const baseDiscount = calculateBaseDiscount();
    let finalTotal = subtotal - baseDiscount;
    
    if (shouldRound && applyDiscount) {
      const roundedTotal = roundToThousand(finalTotal);
      const adjustedDiscount = subtotal - roundedTotal;
      
      return {
        discount: adjustedDiscount,
        total: roundedTotal,
        adjustedDiscountValue: discountType === "percentage" 
          ? ((adjustedDiscount / subtotal) * 100).toFixed(2)
          : adjustedDiscount.toFixed(0)
      };
    }

    return {
      discount: baseDiscount,
      total: finalTotal,
      adjustedDiscountValue: discountValue
    };
  };

  const { discount, total, adjustedDiscountValue } = calculateFinalValues();
  const totalesPorOpcion = calcularTotalesPorOpcion();

  // Efecto para notificar cambios en el descuento
  useEffect(() => {
    onDiscountChange(applyDiscount, discountType, discountValue, shouldRound);
  }, [applyDiscount, discountType, discountValue, shouldRound]);

  // Agregar nueva opción
  const agregarOpcion = () => {
    const nextLetter = String.fromCharCode(65 + opciones.length); // A, B, C...
    const nuevaOpcion: BudgetOption = {
      id: nextLetter,
      nombre: `Opción ${nextLetter}`,
      activa: true
    };
    onOpcionesChange([...opciones, nuevaOpcion]);
  };

  // Actualizar nombre de opción
  const actualizarNombreOpcion = (id: string, nuevoNombre: string) => {
    const opcionesActualizadas = opciones.map(op => 
      op.id === id ? { ...op, nombre: nuevoNombre } : op
    );
    onOpcionesChange(opcionesActualizadas);
  };

  // Toggle activar/desactivar opción
  const toggleOpcion = (id: string) => {
    const opcionesActualizadas = opciones.map(op => 
      op.id === id ? { ...op, activa: !op.activa } : op
    );
    onOpcionesChange(opcionesActualizadas);
  };

  // Eliminar opción
  const eliminarOpcion = (id: string) => {
    const opcionesActualizadas = opciones.filter(op => op.id !== id);
    onOpcionesChange(opcionesActualizadas);
  };

  return (
    <div className="flex justify-start gap-4 mt-4">
      <div className="p-4 w-80 bg-gray-50 dark:bg-dark-card rounded-lg shadow-sm">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <Checkbox
              checked={applyDiscount}
              onChange={(e) => onDiscountChange(e.target.checked, discountType, discountValue, shouldRound)}
            >
              Aplicar descuento
            </Checkbox>
          </div>
          
          <div className="flex gap-2 items-center">
            <Checkbox
              checked={showMeasuresInPDF}
              onChange={(e) => onShowMeasuresChange(e.target.checked)}
            >
              Mostrar medidas en PDF
            </Checkbox>
          </div>

          <div className="flex gap-2 items-center">
            <Checkbox
              checked={esEstimativo}
              onChange={(e) => onEstimativoChange(e.target.checked)}
            >
              <strong>Presupuesto Estimativo</strong>
            </Checkbox>
          </div>
          
          {applyDiscount && (
            <>
              <div className="flex gap-2 items-center">
                <Select
                  size="sm"
                  className="w-32"
                  selectedKeys={[discountType]}
                  onChange={(e) => {
                    const newType = e.target.value as "percentage" | "amount";
                    setDiscountType(newType);
                    onDiscountChange(applyDiscount, newType, discountValue, shouldRound);
                  }}
                >
                  <SelectItem key="percentage" >Porcentaje</SelectItem>
                  <SelectItem key="amount">Monto</SelectItem>
                </Select>
                <Input
                  size="sm"
                  className="w-24"
                  type="number"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    onDiscountChange(applyDiscount, discountType, e.target.value, shouldRound);
                  }}
                  endContent={discountType === "percentage" ? "%" : "$"}
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={shouldRound}
                  onChange={(e) => onDiscountChange(applyDiscount, discountType, discountValue, e.target.checked)}
                >
                  Redondear a miles
                </Checkbox>
              </div>
            </>
          )}
        </div>
        
        <div className="pt-2 space-y-2 border-t">
          {esEstimativo && totalesPorOpcion ? (
            <>
              <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Totales por opción:
              </div>
              {opciones.filter(op => op.activa).map(opcion => (
                <div key={opcion.id} className="flex justify-between text-sm">
                  <span className="font-medium">{opcion.nombre}:</span>
                  <span className="font-semibold">${(totalesPorOpcion[opcion.id] || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex justify-between text-base">
                <span>Total:</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              
              {applyDiscount && (
                <>
                  <div className="flex justify-between text-base text-green-600">
                    <span>
                      Descuento {discountType === "percentage" 
                        ? shouldRound 
                          ? `(${((discount / subtotal) * 100).toFixed(2)}%)` 
                          : `(${discountValue}%)`
                        : `($${discountValue})`
                      }:
                    </span>
                    <span>-${discount.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold text-green-700 border-t">
                    <span>Total con descuento:</span>
                    <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Panel de gestión de opciones */}
      {esEstimativo && (
        <div className="p-4 w-96 bg-blue-50 dark:bg-dark-card rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Opciones del Presupuesto</h3>
            <Button 
              size="sm" 
              color="primary" 
              onClick={agregarOpcion}
              isDisabled={opciones.length >= 5}
            >
              + Agregar
            </Button>
          </div>

          <div className="space-y-2">
            {opciones.map(opcion => (
              <div key={opcion.id} className="flex gap-2 items-center p-2 bg-white dark:bg-gray-800 rounded border">
                <Checkbox
                  size="sm"
                  isSelected={opcion.activa}
                  onChange={() => toggleOpcion(opcion.id)}
                />
                <Input
                  size="sm"
                  className="flex-1"
                  value={opcion.nombre}
                  onChange={(e) => actualizarNombreOpcion(opcion.id, e.target.value)}
                  placeholder="Nombre de la opción"
                />
                <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded">
                  {opcion.id}
                </span>
                {opciones.length > 1 && (
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="light"
                    onClick={() => eliminarOpcion(opcion.id)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            <p>💡 Asigna productos a cada opción usando la columna -Opción- en la tabla.</p>
          </div>
        </div>
      )}
    </div>
  );
};
