import React, { useEffect } from 'react'
import { Select, SelectItem, Input } from "@nextui-org/react";

interface DunesFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  detalle: string;
  onDetalleChange: (value: string) => void;
  onPedidoDetailsChange: (detalles: any) => void;
}

export default function DunesForm(props: DunesFormProps) {
  const { onPedidoDetailsChange, onDetalleChange } = props;

  const [formData, setFormData] = React.useState({
    colorSistema: "",
    ladoComando: "",
    ladoApertura: "",
    instalacion: "",
    detalle: ""
  });

  useEffect(() => {
    onPedidoDetailsChange({
      ...formData,
      sistema: "Dunes"
    });
    onDetalleChange(formData.detalle);
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Color Sistema */}
        <Select 
          label="Color Sistema" 
          value={formData.colorSistema}
          onChange={(e) => handleChange('colorSistema', e.target.value)}
        >
          <SelectItem key="beige" value="beige">Beige</SelectItem>
          <SelectItem key="blanco" value="blanco">Blanco</SelectItem>
        </Select>

        {/* Lado Comando */}
        <Select 
          label="Lado Comando" 
          value={formData.ladoComando}
          onChange={(e) => handleChange('ladoComando', e.target.value)}
        >
          <SelectItem key="derecho" value="derecho">Derecho</SelectItem>
          <SelectItem key="izquierdo" value="izquierdo">Izquierdo</SelectItem>
        </Select>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Lado Apertura */}
        <Select 
          label="Lado Apertura" 
          value={formData.ladoApertura}
          onChange={(e) => handleChange('ladoApertura', e.target.value)}
        >
          <SelectItem key="izquierdo" value="izquierdo">Izquierdo</SelectItem>
          <SelectItem key="derecho" value="derecho">Derecho</SelectItem>
        </Select>

        {/* Instalación */}
        <Select 
          label="Instalación" 
          value={formData.instalacion}
          onChange={(e) => handleChange('instalacion', e.target.value)}
        >
          <SelectItem key="en_vano" value="en_vano">En vano</SelectItem>
          <SelectItem key="fuera_vano" value="fuera_vano">Fuera de vano</SelectItem>
        </Select>
      </div>

      {/* Tercera fila - Detalle */}
      <div className="w-full">
        <Input
          label="Detalles"
          placeholder="Ingrese detalles adicionales"
          value={formData.detalle}
          onChange={(e) => handleChange('detalle', e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}