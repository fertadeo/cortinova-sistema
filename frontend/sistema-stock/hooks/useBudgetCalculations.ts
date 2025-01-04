import { TableItem } from '../types/budget';

export const useBudgetCalculations = () => {
  const calculateSubtotal = (quantity: number, price: number) => quantity * price;

  const calculateTotals = (tableData: TableItem[], applyDiscount: boolean) => {
    const subtotal = tableData.reduce((sum, item) => 
      sum + calculateSubtotal(item.quantity, item.price), 0
    );
    
    const discount = applyDiscount ? subtotal * 0.10 : 0;
    const finalTotal = subtotal - discount;

    return {
      subtotal,
      discount,
      finalTotal
    };
  };

  return {
    calculateSubtotal,
    calculateTotals
  };
}; 