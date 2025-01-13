import React from 'react'

interface DubaiFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  detalle: string;
  onDetalleChange: (value: string) => void;
  onPedidoDetailsChange: (detalles: any) => void;
}

export default function DubaiForm(props: DubaiFormProps) {
  return (
    <div>DubaiForm en desarrollo...</div>
  )
}