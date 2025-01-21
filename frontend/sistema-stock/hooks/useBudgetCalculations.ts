import { TableItem } from '../types/budget';

export const useBudgetCalculations = () => {
  const calculateTotals = (
    items: TableItem[], 
    applyDiscount: boolean,
    discountPercentage?: number,
    discountAmount?: number
  ) => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    
    let discount = 0;
    if (applyDiscount) {
      if (discountPercentage) {
        discount = (subtotal * discountPercentage) / 100;
      } else if (discountAmount) {
        discount = discountAmount;
      }
    }
    
    const finalTotal = subtotal - discount;

    return {
      subtotal,
      discount,
      finalTotal
    };
  };

  return { calculateTotals };
}; 