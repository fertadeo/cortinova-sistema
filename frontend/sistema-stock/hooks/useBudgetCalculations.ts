import { TableItem } from '../types/budget';

export const useBudgetCalculations = () => {
  const roundToHundred = (num: number): number => {
    return Math.round(num / 100) * 100;
  };

  const calculateTotals = (
    items: TableItem[], 
    applyDiscount: boolean,
    discountPercentage?: number,
    discountAmount?: number,
    shouldRound: boolean = false
  ) => {
    const subtotal = items.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;
      return acc + itemTotal;
    }, 0);
    
    let discount = 0;
    if (applyDiscount) {
      if (discountPercentage !== undefined) {
        discount = shouldRound 
          ? roundToHundred((subtotal * discountPercentage) / 100)
          : (subtotal * discountPercentage) / 100;
      } else if (discountAmount !== undefined) {
        discount = shouldRound 
          ? roundToHundred(discountAmount)
          : discountAmount;
      }
    }
    
    const finalTotal = shouldRound 
      ? roundToHundred(subtotal - discount)
      : subtotal - discount;

    return {
      subtotal: Math.round(subtotal),
      discount: shouldRound ? Math.round(discount) : discount,
      finalTotal: shouldRound ? Math.round(finalTotal) : finalTotal
    };
  };

  return { calculateTotals };
}; 