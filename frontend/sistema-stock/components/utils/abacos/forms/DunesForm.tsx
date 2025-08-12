import React, { useEffect } from 'react'
import { Select, SelectItem, Input, Tabs, Tab } from "@heroui/react";

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
    tipoApertura: "cadena_cordon", // "cadena_cordon" o "baston"
    colorSistema: "",
    ladoComando: "",
    ladoApertura: "",
    detalle: ""
  });

  useEffect(() => {
    // Determinar el ID del producto según el tipo de apertura
    const productoId = formData.tipoApertura === "cadena_cordon" ? 256 : 255;
    
    // Función para obtener datos del producto desde la API
    const obtenerDatosProducto = async (id: number) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`);
        if (response.ok) {
          const producto = await response.json();
          console.log(`✅ [DUNES] Producto ${id} obtenido:`, producto);
          return producto;
        }
      } catch (error) {
        console.error(`❌ [DUNES] Error al obtener producto ${id}:`, error);
      }
      return null;
    };

    // Función para obtener datos de la tela Aurora
    const obtenerDatosTela = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/257`);
        if (response.ok) {
          const tela = await response.json();
          console.log('✅ [DUNES] Tela Aurora obtenida:', tela);
          return tela;
        }
      } catch (error) {
        console.error('❌ [DUNES] Error al obtener Tela Aurora:', error);
      }
      return null;
    };

    // Obtener datos del producto y tela
    const obtenerDatos = async () => {
      const [producto, tela] = await Promise.all([
        obtenerDatosProducto(productoId),
        obtenerDatosTela()
      ]);

      onPedidoDetailsChange({
        ...formData,
        sistema: "Dunes",
        productoId: productoId,
        producto: producto,
        telaId: 257,
        tela: tela,
        telaNombre: tela?.nombreProducto || "TELA AURORA",
        // Incluir todos los detalles del formulario
        colorSistema: formData.colorSistema,
        ladoComando: formData.ladoComando,
        ladoApertura: formData.ladoApertura,
        detalle: formData.detalle
      });
      onDetalleChange(formData.detalle);
    };

    obtenerDatos();
  }, [formData, onPedidoDetailsChange, onDetalleChange]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Pestañas de tipo de apertura */}
      <Tabs 
        selectedKey={formData.tipoApertura}
        onSelectionChange={(key) => handleChange('tipoApertura', key)}
        className="w-full"
      >
        <Tab key="cadena_cordon" title="Apertura con Cadena y Cordón" />
        <Tab key="baston" title="Apertura con Bastón" />
      </Tabs>

      {/* Primera fila */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Color Sistema */}
        <Select 
          label="Color Sistema" 
          value={formData.colorSistema}
          onChange={(e) => handleChange('colorSistema', e.target.value)}
        >
           <SelectItem key="blanco" >Blanco</SelectItem>
           <SelectItem key="negro" >Negro</SelectItem>
          <SelectItem key="beige" >Beige</SelectItem>
         
        </Select>

        {/* Lado Comando */}
        <Select 
          label="Lado Comando" 
          value={formData.ladoComando}
          onChange={(e) => handleChange('ladoComando', e.target.value)}
        >
          <SelectItem key="derecho" >Derecho</SelectItem>
          <SelectItem key="izquierdo" >Izquierdo</SelectItem>
        </Select>
      </div>

      {/* Segunda fila */}
      <div className="w-full">
        {/* Lado Apertura */}
        <Select 
          label="Lado Apertura" 
          value={formData.ladoApertura}
          onChange={(e) => handleChange('ladoApertura', e.target.value)}
        >
          <SelectItem key="izquierdo" >Izquierdo</SelectItem>
          <SelectItem key="derecho" >Derecho</SelectItem>
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