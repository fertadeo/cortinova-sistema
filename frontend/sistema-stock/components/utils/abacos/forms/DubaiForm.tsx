import React, { useEffect } from 'react'
import { Select, SelectItem, Checkbox, Input } from "@heroui/react";

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
  const { onPedidoDetailsChange, onDetalleChange } = props;

  const [formData, setFormData] = React.useState({
    ladoComando: "",
    soporteIntermedio: false,
    cenefaCompartida: "",
    hermanada: "",
    caidaPorDelante: "",
    colorSistema: "",
    detalle: ""
  });

  useEffect(() => {
    onPedidoDetailsChange({
      ...formData,
      sistema: "Dubai"
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Lado Comando */}
        <Select 
          label="Lado Comando" 
          value={formData.ladoComando}
          onChange={(e) => handleChange('ladoComando', e.target.value)}
        >
          <SelectItem key="derecho" >Derecho</SelectItem>
          <SelectItem key="izquierdo" >Izquierdo</SelectItem>
        </Select>

        {/* Soporte Intermedio */}
        <div className="flex items-center">
          <Checkbox
            isSelected={formData.soporteIntermedio}
            onValueChange={(value) => handleChange('soporteIntermedio', value)}
          >
            Soporte Intermedio
          </Checkbox>
        </div>

        {/* Cenefa Compartida */}
        <Select 
          label="Cenefa Compartida"
          value={formData.cenefaCompartida}
          onChange={(e) => handleChange('cenefaCompartida', e.target.value)}
        >
          <SelectItem key="si" >Sí</SelectItem>
          <SelectItem key="no" >No</SelectItem>
        </Select>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Hermanada */}
        <Select 
          label="Hermanada" 
          value={formData.hermanada}
          onChange={(e) => handleChange('hermanada', e.target.value)}
        >
          <SelectItem key="no" >No, van en diferentes ambientes</SelectItem>
          <SelectItem key="enfrentadas" >No, van enfrentadas</SelectItem>
          <SelectItem key="separadas" >Sí, están separadas entre 20 cm y 30 cm, una de otra</SelectItem>
          <SelectItem key="pegadas" >Sí, van pegadas, una al lado de la otra</SelectItem>
        </Select>

        {/* Caída por delante */}
        <Select 
          label="Caída por delante"
          value={formData.caidaPorDelante}
          onChange={(e) => handleChange('caidaPorDelante', e.target.value)}
        >
          <SelectItem key="si" >Sí</SelectItem>
          <SelectItem key="no" >No</SelectItem>
        </Select>

        {/* Color de Sistema */}
        <Select 
          label="Color de Sistema" 
          value={formData.colorSistema}
          onChange={(e) => handleChange('colorSistema', e.target.value)}
        >
          <SelectItem key="blanco" >Blanco</SelectItem>
          <SelectItem key="beige" description="(solo caída por atrás)">Beige</SelectItem>
          <SelectItem key="gris" >Gris</SelectItem>
          <SelectItem key="negro" >Negro</SelectItem>
        </Select>
      </div>

      {/* Tercera fila - Detalle */}
      <div className="w-full">
        <Input
          label="Detalle"
          placeholder="Ingrese detalles adicionales"
          value={formData.detalle}
          onChange={(e) => handleChange('detalle', e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}