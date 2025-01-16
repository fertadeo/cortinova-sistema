export interface Tela {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  precio: string;
  descripcion?: string;
}

export interface TelaResponse {
  productos: ProductoTela[];
}

export interface ProductoTela {
  id: number;
  nombreProducto: string;
  descripcion: string;
  color?: string;
  precio: string | number;
  precioCosto?: string | number;
} 