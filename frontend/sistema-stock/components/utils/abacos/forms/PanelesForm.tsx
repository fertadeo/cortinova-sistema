import React, { useEffect } from 'react'
import { Select, SelectItem } from "@nextui-org/react";

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
          <SelectItem key="derecho" value="derecho">Derecho</SelectItem>
          <SelectItem key="izquierdo" value="izquierdo">Izquierdo</SelectItem>
        </Select>

        {/* Lado Apertura */}
        <Select 
          label="Lado Apertura" 
          value={formData.ladoApertura}
          onChange={(e) => handleChange('ladoApertura', e.target.value)}
        >
          <SelectItem key="derecha" value="derecha">Derecha</SelectItem>
          <SelectItem key="izquierda" value="izquierda">Izquierda</SelectItem>
        </Select>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 gap-4">
        {/* Tipo de Tela */}
        <Select 
          label="Tipo de Tela" 
          value={formData.tipoTela}
          onChange={(e) => handleChange('tipoTela', e.target.value)}
        >
          <SelectItem key="black_out" value="black_out">BLACK OUT POLIESTER</SelectItem>
          <SelectItem key="dubai" value="dubai">DUBAI PARA ROLLER</SelectItem>
          <SelectItem key="poliester" value="poliester">POLIESTER</SelectItem>
          <SelectItem key="screen" value="screen">SCREEN</SelectItem>
          <SelectItem key="sin_tela" value="sin_tela">SIN TELA</SelectItem>
        </Select>
      </div>
    </div>
  )
}