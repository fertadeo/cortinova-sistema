// export interface Product {
//     id: number | string; 
//     nombreProducto: string;
//     cantidad_stock: number; 
//     descripcion: string;
//     precio: number; 
//     precioNuevo?: number; 
//     precioCosto: number;
//     descuento: number;
//     rubro_id: number | null;
//     sistema_id: number | null;
//     habilitado?: boolean; 
//   }

  export type Product = {
    id: number;
    nombreProducto: string;
    descripcion: string;
    proveedor: { id: number; nombreProveedores: string };
    cantidadDisponible?: number;
    cantidad_stock: number;
    precio: number;
    precioCosto: number;
    precioNuevo?: number;  
    descuento: number;
    habilitado: boolean;
  };