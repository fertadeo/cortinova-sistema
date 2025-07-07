export interface TableItem {
  id: number;
  productId: number;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
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

export interface PresupuestoResumen {
  numeroPresupuesto: string;
  fecha: string;
  cliente: Client;
  productos: {
    nombre: string;
    descripcion: string;
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
  }[];
  subtotal: number;
  descuento?: number;
  total: number;
} 