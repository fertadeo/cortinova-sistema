import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Checkbox, Textarea } from "@nextui-org/react";

interface RollerFormProps {
  // Props generales que necesitamos mantener
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  onPedidoDetailsChange: (detalles: any) => void;
  
  // Props específicas de Roller
  detalle: string;
  caidaPorDelante: boolean;
  colorSistema: string;
  ladoComando: string;
  tipoTela: string;
  soporteIntermedio: boolean;
  soporteDoble: boolean;
  onDetalleChange: (value: string) => void;
  onCaidaChange: (value: boolean) => void;
  onColorChange: (value: string) => void;
  onLadoComandoChange: (value: string) => void;
  onTipoTelaChange: (value: string) => void;
  onSoporteIntermedioChange: (value: boolean) => void;
  onSoporteDobleChange: (value: boolean) => void;
}

export const RollerForm = ({
  ancho,
  alto,
  cantidad,
  selectedArticulo,
  onPedidoDetailsChange,
  detalle,
  caidaPorDelante,
  colorSistema,
  ladoComando,
  tipoTela,
  soporteIntermedio,
  soporteDoble,
  onDetalleChange,
  onCaidaChange,
  onColorChange,
  onLadoComandoChange,
  onTipoTelaChange,
  onSoporteIntermedioChange,
  onSoporteDobleChange
}: RollerFormProps) => {
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
            }}
          >
            <SelectItem key="blanco" value="blanco">Blanco</SelectItem>
            <SelectItem key="negro" value="negro">Negro</SelectItem>
            <SelectItem key="gris" value="gris">Gris</SelectItem>
          </Select>
        </div>

        <div className="w-1/2">
          <Select
            label="Lado del Comando"
            selectedKeys={ladoComando ? [ladoComando] : []}
            onSelectionChange={(keys) => {
              const lado = Array.from(keys)[0] as string;
              onLadoComandoChange(lado);
            }}
          >
            <SelectItem key="izquierda" value="izquierda">Izquierda</SelectItem>
            <SelectItem key="derecha" value="derecha">Derecha</SelectItem>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <Select
            label="Tipo de Tela"
            selectedKeys={tipoTela ? [tipoTela] : []}
            onSelectionChange={(keys) => {
              const tipo = Array.from(keys)[0] as string;
              onTipoTelaChange(tipo);
            }}
          >
            <SelectItem key="screen" value="screen">Screen</SelectItem>
            <SelectItem key="blackout" value="blackout">Blackout</SelectItem>
            <SelectItem key="sunscreen" value="sunscreen">Sunscreen</SelectItem>
          </Select>
        </div>

        <div className="w-1/2">
          <Input
            label="Detalles adicionales"
            value={detalle}
            onValueChange={onDetalleChange}
           
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Checkbox
          isSelected={caidaPorDelante}
          onValueChange={onCaidaChange}
        >
          Caída por delante
        </Checkbox>
      </div>

      <div className="flex gap-4">
        <Checkbox
          isSelected={soporteIntermedio}
          onValueChange={onSoporteIntermedioChange}
        >
          Soporte intermedio
        </Checkbox>
        
        <Checkbox
          isSelected={soporteDoble}
          onValueChange={onSoporteDobleChange}
        >
          Soporte doble
        </Checkbox>
      </div>
    </div>
  );
}; 