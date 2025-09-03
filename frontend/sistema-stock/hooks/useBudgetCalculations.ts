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
      const itemTotal = item.total;
      // Agregar motorización al total del item si está habilitada
      const motorizacion = item.detalles?.incluirMotorizacion 
        ? (item.detalles.precioMotorizacion || 0) * item.quantity 
        : 0;
      return acc + itemTotal + motorizacion;
    }, 0);
    
    let discount = 0;
    if (applyDiscount) {
      if (discountPercentage !== undefined) {
        if (shouldRound) {
          // Calcular el descuento base
          const baseDiscount = (subtotal * discountPercentage) / 100;
          // Calcular el total base
          const baseTotal = subtotal - baseDiscount;
          // Redondear el total a centenas
          const roundedTotal = roundToHundred(baseTotal);
          // Calcular el descuento ajustado para lograr el total redondo
          discount = subtotal - roundedTotal;
        } else {
          discount = (subtotal * discountPercentage) / 100;
        }
      } else if (discountAmount !== undefined) {
        discount = shouldRound 
          ? roundToHundred(discountAmount)
          : discountAmount;
      }
    }
    
    const finalTotal = subtotal - discount; // NO redondear aquí

    return {
      subtotal: Math.round(subtotal),
      discount: shouldRound ? Math.round(discount) : discount,
      finalTotal: shouldRound ? Math.round(finalTotal) : finalTotal
    };
  };

  return { calculateTotals };
}; 