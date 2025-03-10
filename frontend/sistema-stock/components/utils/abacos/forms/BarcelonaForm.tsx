import React from 'react';
import { Input, Select, SelectItem } from "@heroui/react";

interface BarcelonaFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  detalle?: string;
  ladoComando?: string;
  colorSistema?: string;
  onDetalleChange?: (value: string) => void;
  onLadoComandoChange?: (value: string) => void;
  onColorChange?: (value: string) => void;
}

export default function BarcelonaForm({
  ancho,
  alto,
  cantidad,
  selectedArticulo,
  detalle = '',
  ladoComando = '',
  colorSistema = '',
  onDetalleChange = () => {},
  onLadoComandoChange = () => {},
  onColorChange = () => {},
}: BarcelonaFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="w-1/2">
          <Select 
            label="Color del Sistema"
            selectedKeys={colorSistema ? [colorSistema] : []}
            onSelectionChange={(keys) => {
              const color = Array.from(keys)[0] as string;
              onColorChange(color);
              console.log("Color del sistema seleccionado:", color);
            }}
          >
            <SelectItem key="blanco" >Blanco</SelectItem>
            <SelectItem key="negro" >Negro</SelectItem>
            <SelectItem key="gris" >Gris</SelectItem>
          </Select>
        </div>

        <div className="w-1/2">
          <Select
            label="Lado del Comando"
            selectedKeys={ladoComando ? [ladoComando] : []}
            onSelectionChange={(keys) => {
              const lado = Array.from(keys)[0] as string;
              onLadoComandoChange(lado);
              console.log("Lado del comando seleccionado:", lado);
            }}
          >
            <SelectItem key="izquierda" >Izquierda</SelectItem>
            <SelectItem key="derecha" >Derecha</SelectItem>
          </Select>
        </div>
      </div>

      <div className="w-full">
        <Input
          label="Detalles adicionales"
          value={detalle}
          onValueChange={onDetalleChange}
        />
      </div>
    </div>
  );
}

