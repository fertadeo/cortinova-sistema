import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Checkbox, Textarea } from "@heroui/react";

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
  soporteIntermedioTipo?: any;
  soportesIntermedios?: any[];
  onSoporteIntermedioTipoChange?: (item: any) => void;
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
  onSoporteDobleChange,
  soporteIntermedioTipo,
  soportesIntermedios,
  onSoporteIntermedioTipoChange
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
            }}
          >
            <SelectItem key="izquierda" >Izquierda</SelectItem>
            <SelectItem key="derecha" >Derecha</SelectItem>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
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
        {soportesIntermedios && soportesIntermedios.length > 0 && (
          <div className="w-56">
            <Select
              label="Soporte intermedio"
              placeholder="Seleccionar tipo"
              selectedKeys={soporteIntermedioTipo ? new Set([String(soporteIntermedioTipo.id)]) : new Set(["none"])}
              onSelectionChange={(keys) => {
                const id = Array.from(keys)[0];
                if (id === "none") {
                  if (onSoporteIntermedioTipoChange) onSoporteIntermedioTipoChange(null);
                  return;
                }
                const found = soportesIntermedios.find((s) => String(s.id) === String(id));
                if (found && onSoporteIntermedioTipoChange) onSoporteIntermedioTipoChange(found);
              }}
            >
              {[<SelectItem key="none">Sin soporte intermedio</SelectItem>,
                ...soportesIntermedios.map((s) => (
                  <SelectItem key={String(s.id)}>
                    {s.nombre} (${Number(s.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </SelectItem>
                ))
              ]}
            </Select>
          </div>
        )}
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