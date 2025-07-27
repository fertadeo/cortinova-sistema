import { Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { TableItem } from '../../types/budget';
import { useState, useEffect } from 'react';

interface BudgetSummaryProps {
  items: TableItem[];
  applyDiscount: boolean;
  onDiscountChange: (checked: boolean, type?: "percentage" | "amount", value?: string, round?: boolean) => void;
  shouldRound: boolean;
}

export const BudgetSummary = ({ items, applyDiscount, onDiscountChange, shouldRound }: BudgetSummaryProps) => {
  const { calculateTotals } = useBudgetCalculations();
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState("10");

  // Calcular el subtotal primero
  const subtotal = items.reduce((acc, item) => {
    const itemTotal = Number(item.total);
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
    return Math.round(num / 100) * 100;
  };

  // Calcular valores finales sin actualizar el estado
  const calculateFinalValues = () => {
    const baseDiscount = calculateBaseDiscount();
    let finalTotal = subtotal - baseDiscount;
    
    if (shouldRound && applyDiscount) {
      const roundedTotal = roundToHundred(finalTotal);
      const adjustedDiscount = roundToHundred(subtotal - roundedTotal);
      
      return {
        discount: adjustedDiscount,
        total: roundedTotal,
        adjustedDiscountValue: discountType === "percentage" 
          ? ((adjustedDiscount / subtotal) * 100).toFixed(0)
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
  useEffect(() => {
    onDiscountChange(applyDiscount, discountType, discountValue, shouldRound);
  }, [applyDiscount, discountType, discountValue, shouldRound, onDiscountChange]);

  // Console.log para debugging
  // console.log('=== RESUMEN DEL PRESUPUESTO (Desglosado) ===', {
  //   items: items.map(item => ({
  //     ...item,
  //     itemTotal: Number(item.price) * Number(item.quantity)
  //   })),
  //   calculoSubtotal: {
  //     valores: items.map(item => Number(item.price) * Number(item.quantity)),
  //     subtotalFinal: subtotal
  //   },
  //   subtotal: subtotal.toFixed(2),
  //   descuento: discount.toFixed(2),
  //   total: total.toFixed(2),
  //   tipoDescuento: discountType,
  //   valorDescuento: discountValue,
  //   aplicarDescuento: applyDiscount,
  //   redondear: shouldRound
  // });

  return (
    <div className="flex justify-start mt-4">
      <div className="p-4 w-80 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2 items-center">
            <Checkbox
              checked={applyDiscount}
              onChange={(e) => onDiscountChange(e.target.checked, discountType, discountValue, shouldRound)}
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
                  Redondear a centenas
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