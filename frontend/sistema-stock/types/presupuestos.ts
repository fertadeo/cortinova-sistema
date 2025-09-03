export interface ProductoPresupuesto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  espacio?: string;
  incluirMotorizacion?: boolean;
  precioMotorizacion?: number;
  tipoTela?: string;
  // Campos específicos para Dunes
  tipoApertura?: string;
  colorSistema?: string;
  ladoComando?: string;
  ladoApertura?: string;
  detalle?: string;
}
