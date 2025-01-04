import { Checkbox } from "@nextui-org/react";
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { TableItem } from '../../types/budget';

interface BudgetSummaryProps {
  items: TableItem[];
  applyDiscount: boolean;
  onDiscountChange: (checked: boolean) => void;
}

export const BudgetSummary = ({ items, applyDiscount, onDiscountChange }: BudgetSummaryProps) => {
  const { calculateTotals } = useBudgetCalculations();
  const { subtotal, discount, finalTotal } = calculateTotals(items, applyDiscount);

  return (
    <div className="flex justify-start mt-4">
      <div className="p-4 w-80 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex gap-2 items-center mb-3">
          <Checkbox
            checked={applyDiscount}
            onChange={(e) => onDiscountChange(e.target.checked)}
          >
            Pago en efectivo (10% descuento)
          </Checkbox>
        </div>
        
        <div className="pt-2 space-y-2 border-t">
          <div className="flex justify-between text-base">
            <span>Total:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          
          {applyDiscount && (
            <>
              <div className="flex justify-between text-base text-green-600">
                <span>Descuento (10%):</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold text-green-700 border-t">
                <span>Total con descuento:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 