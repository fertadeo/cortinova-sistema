import { Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { TableItem } from '../../types/budget';
import { useState, useEffect } from 'react';

interface BudgetSummaryProps {
  items: TableItem[];
  applyDiscount: boolean;
  onDiscountChange: (checked: boolean) => void;
}

export const BudgetSummary = ({ items, applyDiscount, onDiscountChange }: BudgetSummaryProps) => {
  const { calculateTotals } = useBudgetCalculations();
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [shouldRound, setShouldRound] = useState(false);

  // Calcular el subtotal primero
  const subtotal = items.reduce((acc, item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    return acc + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  // Calcular el descuento base
  const calculateBaseDiscount = () => {
    if (!applyDiscount) return 0;
    
    if (discountType === "percentage") {
      return (subtotal * Number(discountValue)) / 100;
    } else {
      return Number(discountValue);
    }
  };

  // Función para redondear a la centena más cercana
  const roundToHundred = (num: number): number => {
    return Math.ceil(num / 100) * 100;
  };

  // Calcular valores finales sin actualizar el estado
  const calculateFinalValues = () => {
    const baseDiscount = calculateBaseDiscount();
    let finalTotal = subtotal - baseDiscount;
    
    if (shouldRound && applyDiscount) {
      const roundedTotal = roundToHundred(finalTotal);
      const adjustedDiscount = subtotal - roundedTotal;
      
      return {
        discount: adjustedDiscount,
        total: roundedTotal,
        adjustedDiscountValue: discountType === "percentage" 
          ? ((adjustedDiscount / subtotal) * 100).toFixed(2)
          : adjustedDiscount.toFixed(2)
      };
    }

    return {
      discount: baseDiscount,
      total: finalTotal,
      adjustedDiscountValue: discountValue
    };
  };

  const { discount, total, adjustedDiscountValue } = calculateFinalValues();

  // Actualizar el valor del descuento cuando cambie el redondeo
  useEffect(() => {
    if (shouldRound && applyDiscount && adjustedDiscountValue !== discountValue) {
      setDiscountValue(adjustedDiscountValue);
    }
  }, [shouldRound, applyDiscount, adjustedDiscountValue, discountValue]);

  // Console.log para debugging
  console.log('=== RESUMEN DEL PRESUPUESTO (Desglosado) ===', {
    items: items.map(item => ({
      ...item,
      itemTotal: Number(item.price) * Number(item.quantity)
    })),
    calculoSubtotal: {
      valores: items.map(item => Number(item.price) * Number(item.quantity)),
      subtotalFinal: subtotal
    },
    subtotal: subtotal.toFixed(2),
    descuento: discount.toFixed(2),
    total: total.toFixed(2),
    tipoDescuento: discountType,
    valorDescuento: discountValue,
    aplicarDescuento: applyDiscount,
    redondear: shouldRound
  });

  return (
    <div className="flex justify-start mt-4">
      <div className="p-4 w-80 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <Checkbox
              checked={applyDiscount}
              onChange={(e) => onDiscountChange(e.target.checked)}
            >
              Aplicar descuento
            </Checkbox>
          </div>
          
          {applyDiscount && (
            <>
              <div className="flex gap-2 items-center">
                <Select
                  size="sm"
                  className="w-32"
                  selectedKeys={[discountType]}
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "amount")}
                >
                  <SelectItem key="percentage" value="percentage">Porcentaje</SelectItem>
                  <SelectItem key="amount" value="amount">Monto</SelectItem>
                </Select>
                <Input
                  size="sm"
                  className="w-24"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  endContent={discountType === "percentage" ? "%" : "$"}
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={shouldRound}
                  onChange={(e) => setShouldRound(e.target.checked)}
                >
                  Redondear a centenas
                </Checkbox>
              </div>
            </>
          )}
        </div>
        
        <div className="pt-2 space-y-2 border-t">
          <div className="flex justify-between text-base">
            <span>Total:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          
          {applyDiscount && (
            <>
              <div className="flex justify-between text-base text-green-600">
                <span>
                  Descuento {discountType === "percentage" 
                    ? `(${discountValue}%)` 
                    : `($${discountValue})`
                  }:
                </span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold text-green-700 border-t">
                <span>Total con descuento:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 