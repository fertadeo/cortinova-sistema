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
    // [PedidoEstado.EMITIDO]: "warning",
    [PedidoEstado.CONFIRMADO]: "primary",
    [PedidoEstado.EN_PRODUCCION]: "secondary",
    [PedidoEstado.CANCELADO]: "danger",
    [PedidoEstado.LISTO_ENTREGA]: "success",
    [PedidoEstado.ENTREGADO]: "default"
}; 