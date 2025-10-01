export interface TableItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  espacio?: string; // Nuevo campo para el espacio/ambiente
  opcion?: string; // Nuevo campo para opciones de presupuesto (A, B, C, etc.)
  detalles?: {
    sistema: string;
    detalle: string;
    caidaPorDelante: string;
    colorSistema: string;
    ladoComando: string;
    tipoTela: string;
    soporteIntermedio: boolean;
    soporteDoble: boolean;
    medidaId?: number;
    ancho?: number;
    alto?: number;
    ubicacion?: string;
    accesorios?: any[];
    incluirMotorizacion?: boolean;
    precioMotorizacion?: number;
    tipoApertura?: string;
    ladoApertura?: string;
  };
}

export interface Client {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  dni?: string;
}

export interface Product {
  id: number;
  nombreProducto: string;
  descripcion: string;
  precio: string | number;
  proveedor?: {
    id: number;
    nombreProveedores: string;
  };
}

export interface BudgetOption {
  id: string;
  nombre: string;
  activa: boolean;
}

export interface PresupuestoResumen {
  numeroPresupuesto: string;
  fecha: string;
  cliente: Client;
  showMeasuresInPDF?: boolean;
  esEstimativo?: boolean; // Indica si es presupuesto estimativo con opciones
  opciones?: BudgetOption[]; // Configuración de opciones disponibles
  productos: {
    nombre: string;
    descripcion: string;
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
    espacio?: string; // Nuevo campo para el espacio/ambiente
    opcion?: string; // Nuevo campo para opciones de presupuesto
    incluirMotorizacion?: boolean;
    precioMotorizacion?: number;
    tipoTela?: string;
    tipoApertura?: string;
    colorSistema?: string;
    ladoComando?: string;
    ladoApertura?: string;
    detalle?: string;
    ancho?: number; // Medidas del producto
    alto?: number; // Medidas del producto
  }[];
  subtotal: number;
  descuento: number;
  total: number;
}
