import React, { useEffect } from 'react'
import { Select, SelectItem, Input } from "@heroui/react";

interface RomanasFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  detalle?: string;
  onDetalleChange?: (value: string) => void;
  onPedidoDetailsChange?: (detalles: any) => void;
}

export default function RomanasForm(props: RomanasFormProps) {
  const { onPedidoDetailsChange, onDetalleChange } = props;

  const [formData, setFormData] = React.useState({
    ladoComando: "",
    tipoTela: "",
    detalle: ""
  });

  useEffect(() => {
    if (onPedidoDetailsChange) {
      onPedidoDetailsChange({
        ...formData,
        sistema: "Romanas"
      });
    }
    if (onDetalleChange) {
      onDetalleChange(formData.detalle);
    }
  }, [formData, onPedidoDetailsChange, onDetalleChange]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Primera fila */}
      <div className="grid grid-cols-2 gap-4">
        {/* Lado Comando */}
        <Select 
          label="Lado Comando" 
          value={formData.ladoComando}
          onChange={(e) => handleChange('ladoComando', e.target.value)}
        >
          <SelectItem key="derecho" value="derecho">Derecho</SelectItem>
          <SelectItem key="izquierdo" value="izquierdo">Izquierdo</SelectItem>
        </Select>

        {/* Tipo de Tela */}
        <Select 
          label="Tipo de Tela" 
          value={formData.tipoTela}
          onChange={(e) => handleChange('tipoTela', e.target.value)}
        >
          <SelectItem key="black_out" value="black_out">BLACK OUT POLIESTER</SelectItem>
          <SelectItem key="poliester" value="poliester">POLIESTER</SelectItem>
          <SelectItem key="screen" value="screen">SCREEN</SelectItem>
          <SelectItem key="sin_tela" value="sin_tela">SIN TELA</SelectItem>
        </Select>
      </div>

      {/* Segunda fila */}
      <div className="w-full">
        <Input
          label="Detalles"
          placeholder="Ingrese detalles adicionales"
          value={formData.detalle}
          onChange={(e) => handleChange('detalle', e.target.value)}
        />
      </div>
    </div>
  )
}