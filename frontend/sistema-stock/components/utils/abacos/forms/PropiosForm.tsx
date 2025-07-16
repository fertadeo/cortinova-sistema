import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem, Checkbox, Textarea, Tabs, Tab, Card, CardBody } from "@heroui/react";

interface PropiosFormProps {
  // Props generales
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  onPedidoDetailsChange: (detalles: any) => void;
  
  // Props específicas de Propios
  detalle: string;
  onDetalleChange: (value: string) => void;
  
  // Props para telas
  selectedTela?: any;
  onTelaSelect?: (tela: any) => void;
  searchTela?: string;
  onSearchTelaChange?: (value: string) => void;
  telasFiltradas?: any[];
  showTelasList?: boolean;
  onShowTelasListChange?: (show: boolean) => void;
}

export default function PropiosForm({
  ancho,
  alto,
  cantidad,
  selectedArticulo,
  onPedidoDetailsChange,
  detalle,
  onDetalleChange
}: PropiosFormProps) {
  // Estado para el tab seleccionado
  const [selectedTab, setSelectedTab] = useState<'riel' | 'barral'>('riel');
  
  // Estados específicos para Riel
  const [tipoRiel, setTipoRiel] = useState('');
  const [colorRiel, setColorRiel] = useState('');
  const [ladoComandoRiel, setLadoComandoRiel] = useState('');
  const [accesoriosRiel, setAccesoriosRiel] = useState<string[]>([]);
  
  // Estados específicos para Barral
  const [tipoBarral, setTipoBarral] = useState('');
  const [colorBarral, setColorBarral] = useState('');
  const [accesoriosBarral, setAccesoriosBarral] = useState<string[]>([]);
  
  // Estados compartidos
  const [telaSeleccionada, setTelaSeleccionada] = useState<any>(null);
  const [incluirColocacion, setIncluirColocacion] = useState(false);
  const [detallesAdicionales, setDetallesAdicionales] = useState('');

  // Opciones para los selects
  const tiposRiel = [
    "Riel de aluminio simple",
    "Riel de aluminio doble",
    "Riel de acero",
    "Riel telescópico",
    "Riel curvo"
  ];

  const tiposBarral = [
    "Barral de madera",
    "Barral de aluminio",
    "Barral de acero",
    "Barral telescópico",
    "Barral decorativo"
  ];

  const colores = ["Blanco", "Negro", "Gris", "Dorado", "Plateado", "Bronce"];
  
  const ladosComando = ["Izquierda", "Derecha", "Centro"];

  const accesoriosRielOptions = [
    "Soportes de pared",
    "Soportes de techo",
    "Carriles deslizantes",
    "Anillas",
    "Ganchos",
    "Cordones"
  ];

  const accesoriosBarralOptions = [
    "Soportes de pared",
    "Soportes de techo",
    "Anillas",
    "Ganchos",
    "Cordones",
    "Puntas decorativas"
  ];

  // Función para manejar cambios en accesorios
  const handleAccesorioChange = (accesorio: string, tipo: 'riel' | 'barral') => {
    if (tipo === 'riel') {
      setAccesoriosRiel(prev => 
        prev.includes(accesorio) 
          ? prev.filter(a => a !== accesorio)
          : [...prev, accesorio]
      );
    } else {
      setAccesoriosBarral(prev => 
        prev.includes(accesorio) 
          ? prev.filter(a => a !== accesorio)
          : [...prev, accesorio]
      );
    }
  };

  // Actualizar detalles del pedido cuando cambien los valores
  useEffect(() => {
    const detalles = {
      tipoArmado: selectedTab,
      ...(selectedTab === 'riel' ? {
        tipoRiel,
        colorRiel,
        ladoComandoRiel,
        accesoriosRiel
      } : {
        tipoBarral,
        colorBarral,
        accesoriosBarral
      }),
      telaSeleccionada,
      incluirColocacion,
      detallesAdicionales,
      detalle
    };
    
    onPedidoDetailsChange(detalles);
  }, [
    selectedTab,
    tipoRiel,
    colorRiel,
    ladoComandoRiel,
    accesoriosRiel,
    tipoBarral,
    colorBarral,
    accesoriosBarral,
    telaSeleccionada,
    incluirColocacion,
    detallesAdicionales,
    detalle,
    onPedidoDetailsChange
  ]);

  return (
    <div className="space-y-6">
      {/* Tabs para Riel vs Barral */}
      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={(key) => setSelectedTab(key as 'riel' | 'barral')}
        className="w-full"
      >
        <Tab key="riel" title="Riel">
          <Card>
            <CardBody className="space-y-4">
              {/* Tipo de Riel */}
              <Select
                label="Tipo de Riel"
                placeholder="Seleccione el tipo de riel"
                selectedKeys={tipoRiel ? [tipoRiel] : []}
                onSelectionChange={(keys) => {
                  const tipo = Array.from(keys)[0] as string;
                  setTipoRiel(tipo);
                }}
              >
                {tiposRiel.map((tipo) => (
                  <SelectItem key={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </Select>

              {/* Color y Lado del Comando */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Color del Riel"
                  placeholder="Seleccione color"
                  selectedKeys={colorRiel ? [colorRiel] : []}
                  onSelectionChange={(keys) => {
                    const color = Array.from(keys)[0] as string;
                    setColorRiel(color);
                  }}
                >
                  {colores.map((color) => (
                    <SelectItem key={color}>
                      {color}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Lado del Comando"
                  placeholder="Seleccione lado"
                  selectedKeys={ladoComandoRiel ? [ladoComandoRiel] : []}
                  onSelectionChange={(keys) => {
                    const lado = Array.from(keys)[0] as string;
                    setLadoComandoRiel(lado);
                  }}
                >
                  {ladosComando.map((lado) => (
                    <SelectItem key={lado}>
                      {lado}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Accesorios para Riel */}
              <div>
                <label htmlFor="accesoriosRiel" className="block text-sm font-medium mb-2">Accesorios para Riel</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {accesoriosRielOptions.map((accesorio) => (
                    <Checkbox
                      key={accesorio}
                      isSelected={accesoriosRiel.includes(accesorio)}
                      onValueChange={() => handleAccesorioChange(accesorio, 'riel')}
                    >
                      {accesorio}
                    </Checkbox>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="barral" title="Barral">
          <Card>
            <CardBody className="space-y-4">
              {/* Tipo de Barral */}
              <Select
                label="Tipo de Barral"
                placeholder="Seleccione el tipo de barral"
                selectedKeys={tipoBarral ? [tipoBarral] : []}
                onSelectionChange={(keys) => {
                  const tipo = Array.from(keys)[0] as string;
                  setTipoBarral(tipo);
                }}
              >
                {tiposBarral.map((tipo) => (
                  <SelectItem key={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </Select>

              {/* Color del Barral */}
              <Select
                label="Color del Barral"
                placeholder="Seleccione color"
                selectedKeys={colorBarral ? [colorBarral] : []}
                onSelectionChange={(keys) => {
                  const color = Array.from(keys)[0] as string;
                  setColorBarral(color);
                }}
              >
                {colores.map((color) => (
                  <SelectItem key={color}>
                    {color}
                  </SelectItem>
                ))}
              </Select>

              {/* Accesorios para Barral */}
              <div>
                <label htmlFor="accesoriosBarral" className="block text-sm font-medium mb-2">Accesorios para Barral</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {accesoriosBarralOptions.map((accesorio) => (
                    <Checkbox
                      key={accesorio}
                      isSelected={accesoriosBarral.includes(accesorio)}
                      onValueChange={() => handleAccesorioChange(accesorio, 'barral')}
                    >
                      {accesorio}
                    </Checkbox>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Sección compartida - Detalles adicionales */}
      <Card>
        <CardBody className="space-y-4">
          <Textarea
            label="Detalles adicionales"
            placeholder="Especificaciones especiales, notas de instalación, etc."
            value={detallesAdicionales}
            onValueChange={setDetallesAdicionales}
            minRows={3}
          />

          <Checkbox
            isSelected={incluirColocacion}
            onValueChange={setIncluirColocacion}
          >
            Incluir colocación
          </Checkbox>
        </CardBody>
      </Card>

      {/* Resumen de selección */}
      <Card>
        <CardBody>
          <h4 className="font-semibold mb-2">Resumen de selección:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Tipo de armado:</strong> {selectedTab === 'riel' ? 'Riel' : 'Barral'}</p>
            {selectedTab === 'riel' ? (
              <>
                {tipoRiel && <p><strong>Tipo de riel:</strong> {tipoRiel}</p>}
                {colorRiel && <p><strong>Color:</strong> {colorRiel}</p>}
                {ladoComandoRiel && <p><strong>Lado comando:</strong> {ladoComandoRiel}</p>}
                {accesoriosRiel.length > 0 && (
                  <p><strong>Accesorios:</strong> {accesoriosRiel.join(', ')}</p>
                )}
              </>
            ) : (
              <>
                {tipoBarral && <p><strong>Tipo de barral:</strong> {tipoBarral}</p>}
                {colorBarral && <p><strong>Color:</strong> {colorBarral}</p>}
                {accesoriosBarral.length > 0 && (
                  <p><strong>Accesorios:</strong> {accesoriosBarral.join(', ')}</p>
                )}
              </>
            )}
            {incluirColocacion && <p><strong>Incluye colocación</strong></p>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}