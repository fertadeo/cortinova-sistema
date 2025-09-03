export enum PedidoEstado {
    EMITIDO = 'Emitido',
    CONFIRMADO = 'Confirmado',
    EN_PRODUCCION = 'En Produccion',
    CANCELADO = 'Cancelado',
    LISTO_ENTREGA = 'Listo para entrega',
    ENTREGADO = 'Entregado'
}

// También podemos agregar los colores asociados
export const estadoColors: Record<PedidoEstado, string> = {
     [PedidoEstado.EMITIDO]: "warning",
    [PedidoEstado.CONFIRMADO]: "primary",
    [PedidoEstado.EN_PRODUCCION]: "secondary",
    [PedidoEstado.CANCELADO]: "danger",
    [PedidoEstado.LISTO_ENTREGA]: "success",
    [PedidoEstado.ENTREGADO]: "default",
    
}; 

export interface Pedido {
  sistema: string;
  espacio: string;
  detalles: {
    cantidad: number;
    ancho: number;
    alto: number;
    sistemaRecomendado: string;
    articuloSeleccionado: string;
    tela: any;
    caidaPorDelante: boolean;
    colorSistema: string;
    ladoComando: string;
    tipoTela: string;
    soporteIntermedio: boolean;
    soporteDoble: boolean;
    detalle: string;
    incluirColocacion: boolean;
    precioColocacion: number;
    incluirMotorizacion: boolean;
    precioMotorizacion: number;
    soporteIntermedioTipo: any;
    soporteDobleProducto: any;
    accesorios: string[];
    accesoriosAdicionales: string[];
    multiplicadorTela?: number;
    metrosTotalesTela?: number;
    // Campos específicos para Dunes
    productoDunes?: any;
    telaDunes?: any;
    precioSistemaDunes?: number;
    precioTelaDunes?: number;
    ladoApertura?: string;
    instalacion?: string;
    tipoApertura?: string;
  };
  fecha: string;
  precioUnitario: number;
  precioTotal: number;
  medidaId?: number;
}