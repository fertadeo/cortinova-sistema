import React, { useEffect } from 'react'
import { Select, SelectItem, Input } from "@nextui-org/react";

interface VenecianasFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  detalle?: string;
  onDetalleChange?: (value: string) => void;
  onPedidoDetailsChange?: (detalles: any) => void;
}

export default function VenecianasForm(props: VenecianasFormProps) {
  const { onPedidoDetailsChange, onDetalleChange } = props;

  const [formData, setFormData] = React.useState({
    ladoComando: "",
    detalle: ""
  });

  useEffect(() => {
    if (onPedidoDetailsChange) {
      onPedidoDetailsChange({
        ...formData,
        sistema: "Venecianas"
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

        {/* Detalles */}
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