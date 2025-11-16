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
  
  // Log para depuración: verificar valores recibidos
  useEffect(() => {
    console.log('🔍 [BudgetSummary] Valores recibidos:', {
      applyDiscount: Boolean(applyDiscount),
      showMeasuresInPDF: Boolean(showMeasuresInPDF),
      esEstimativo: Boolean(esEstimativo),
      shouldRound: Boolean(shouldRound)
    });
  }, [applyDiscount, showMeasuresInPDF, esEstimativo, shouldRound]);

  // Calcular el subtotal primero
  const subtotal = items.reduce((acc, item) => {
    const itemTotal = Number(item.total);
    return acc + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  // Ya no se necesita calcular totales por opción

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

  // Efecto para notificar cambios en el descuento
  // IMPORTANTE: Solo notificar cuando hay cambios reales, no en el montaje inicial
  useEffect(() => {
    // No llamar en el montaje inicial si los valores son los por defecto
    // Esto evita que se sobrescriban los valores cargados desde presupuesto_json
    onDiscountChange(applyDiscount, discountType, discountValue, shouldRound);
  }, [applyDiscount, discountType, discountValue, shouldRound, onDiscountChange]);

  return (
    <div className="flex justify-start gap-4 mt-4">
      <div className="p-4 w-80 bg-gray-50 dark:bg-dark-card rounded-lg shadow-sm">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <Checkbox
              isSelected={Boolean(applyDiscount)}
              onValueChange={(isSelected) => onDiscountChange(isSelected, discountType, discountValue, shouldRound)}
            >
              Aplicar descuento
            </Checkbox>
          </div>
          
          <div className="flex gap-2 items-center">
            <Checkbox
              isSelected={Boolean(showMeasuresInPDF)}
              onValueChange={(isSelected) => onShowMeasuresChange(isSelected)}
            >
              Mostrar medidas en PDF
            </Checkbox>
          </div>

          <div className="flex gap-2 items-center">
            <Checkbox
              isSelected={Boolean(esEstimativo)}
              onValueChange={(isSelected) => onEstimativoChange(isSelected)}
            >
              <strong>Presupuesto Estimativo <br />  (no muestra el total)</strong>
            </Checkbox>
          </div>
          {esEstimativo && (
            <div className="p-2 text-xs text-orange-700 bg-orange-100 rounded dark:bg-orange-900/30 dark:text-orange-400">
              ℹ️ El presupuesto se generará sin mostrar el total del precio
            </div>
          )}
          
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
                  isSelected={Boolean(shouldRound)}
                  onValueChange={(isSelected) => onDiscountChange(applyDiscount, discountType, discountValue, isSelected)}
                >
                  Redondear a miles
                </Checkbox>
              </div>
            </>
          )}
        </div>
        
        <div className="pt-2 space-y-2 border-t">
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
        </div>
      </div>
    </div>
  );
};
