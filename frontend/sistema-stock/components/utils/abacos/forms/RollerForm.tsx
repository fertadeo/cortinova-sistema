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
  productosFiltrados?: any[];
  soporteDobleProducto?: any;
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
  onSoporteIntermedioTipoChange,
  soporteDobleProducto
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
          <div className="w-84">
            <label htmlFor="soporte-intermedio-select" className="block text-sm font-medium mb-1">Soporte intermedio</label>
            <select
              id="soporte-intermedio-select"
              className="w-full border rounded px-2 py-2 text-sm"
              value={soporteIntermedioTipo ? String(soporteIntermedioTipo.id) : "none"}
              onChange={e => {
                const id = e.target.value;
                if (id === "none") {
                  if (onSoporteIntermedioTipoChange) onSoporteIntermedioTipoChange(null);
                  return;
                }
                const found = soportesIntermedios.find((s) => String(s.id) === String(id));
                if (found && onSoporteIntermedioTipoChange) onSoporteIntermedioTipoChange(found);
              }}
            >
              <option value="none">Sin soporte intermedio</option>
              {soportesIntermedios.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>
                  {s.nombre} (${Number(s.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            isSelected={soporteDoble}
            onValueChange={onSoporteDobleChange}
          >
            Soporte doble
          </Checkbox>
          {soporteDobleProducto && (
            <span className="text-sm text-gray-600">
              (${Number(soporteDobleProducto.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
          )}
        </div>
      </div>
      
      {/* Mensaje informativo sobre la validación mutuamente excluyente */}
      {(soporteIntermedioTipo || soporteDoble) && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <strong>Nota:</strong> El soporte intermedio y el soporte doble son opciones mutuamente excluyentes. 
          Al seleccionar uno, se desactivará automáticamente el otro.
        </div>
      )}
    </div>
  );
}; 