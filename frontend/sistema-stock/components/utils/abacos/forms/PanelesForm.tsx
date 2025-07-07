import React, { useEffect } from 'react'
import { Select, SelectItem } from "@heroui/react";

interface PanelesFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  onPedidoDetailsChange?: (detalles: any) => void;
}

export default function PanelesForm(props: PanelesFormProps) {
  const { onPedidoDetailsChange } = props;

  const [formData, setFormData] = React.useState({
    ladoComando: "",
    ladoApertura: "",
    tipoTela: ""
  });

  useEffect(() => {
    if (onPedidoDetailsChange) {
      onPedidoDetailsChange({
        ...formData,
        sistema: "Paneles"
      });
    }
  }, [formData, onPedidoDetailsChange]);

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
          <SelectItem key="derecho" >Derecho</SelectItem>
          <SelectItem key="izquierdo" >Izquierdo</SelectItem>
        </Select>

        {/* Lado Apertura */}
        <Select 
          label="Lado Apertura" 
          value={formData.ladoApertura}
          onChange={(e) => handleChange('ladoApertura', e.target.value)}
        >
          <SelectItem key="derecha" >Derecha</SelectItem>
          <SelectItem key="izquierda" >Izquierda</SelectItem>
        </Select>
      </div>
    </div>
  )
}