import React from 'react'

interface BarcelonaFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
}

export default function BarcelonaForm(props: BarcelonaFormProps) {
  return (
    <div>Desde BarcelonaForm</div>
  )
}