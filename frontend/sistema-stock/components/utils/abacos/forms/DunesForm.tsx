import React, { useEffect, useRef } from 'react'
import { Select, SelectItem, Input, Tabs, Tab } from "@heroui/react";

interface DunesFormProps {
  ancho: string;
  alto: string;
  cantidad: string;
  selectedArticulo: string;
  detalle: string;
  onDetalleChange: (value: string) => void;
  onPedidoDetailsChange: (detalles: any) => void;
  /** Tela seleccionada en el modal (para presupuesto) */
  selectedTelaId?: number | null;
  onTelaSelect?: (tela: any | null) => void;
  initialTipoApertura?: string | null;
  initialColorSistema?: string | null;
  initialLadoComando?: string | null;
  initialLadoApertura?: string | null;
}

/** Telas del sistema Dunes: Aurora (257), Solana/Nibia (404, 405) */
const TELAS_DUNES_IDS = [257, 404, 405] as const;
const TELA_DEFAULT_ID = 257;

export default function DunesForm(props: DunesFormProps) {
  const {
    onPedidoDetailsChange,
    onDetalleChange,
    selectedTelaId,
    onTelaSelect,
    initialTipoApertura,
    initialColorSistema,
    initialLadoComando,
    initialLadoApertura,
    detalle,
  } = props;

  const [formData, setFormData] = React.useState({
    tipoApertura: initialTipoApertura === 'baston' ? 'baston' : 'cadena_cordon',
    colorSistema: initialColorSistema || '',
    ladoComando: initialLadoComando || '',
    ladoApertura: initialLadoApertura || '',
    detalle: detalle || '',
  });

  const [telasDisponibles, setTelasDisponibles] = React.useState<any[]>([]);
  const [telaId, setTelaId] = React.useState<number>(TELA_DEFAULT_ID);
  const [loadingTelas, setLoadingTelas] = React.useState(true);
  const defaultAppliedRef = useRef(false);
  const onTelaSelectRef = useRef(onTelaSelect);
  onTelaSelectRef.current = onTelaSelect;

  // Cargar Aurora (257), Solana/Nibia (404, 405) una sola vez
  useEffect(() => {
    let cancelled = false;

    const cargarTelas = async () => {
      setLoadingTelas(true);
      const resultados = await Promise.all(
        TELAS_DUNES_IDS.map(async (id) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`);
            if (!response.ok) {
              console.warn(`⚠️ [DUNES] Tela ${id} no encontrada`);
              return null;
            }
            const producto = await response.json();
            console.log(`✅ [DUNES] Tela ${id} obtenida:`, producto);
            return producto;
          } catch (error) {
            console.error(`❌ [DUNES] Error al obtener tela ${id}:`, error);
            return null;
          }
        })
      );

      if (cancelled) return;

      const disponibles = resultados.filter(Boolean);
      setTelasDisponibles(disponibles);
      setLoadingTelas(false);
    };

    cargarTelas();
    return () => {
      cancelled = true;
    };
  }, []);

  // Aplicar tela inicial / default cuando ya hay catálogo cargado
  useEffect(() => {
    if (telasDisponibles.length === 0) return;

    if (selectedTelaId && telasDisponibles.some((t) => Number(t.id) === Number(selectedTelaId))) {
      setTelaId(Number(selectedTelaId));
      defaultAppliedRef.current = true;
      return;
    }

    if (!defaultAppliedRef.current && !selectedTelaId) {
      const aurora =
        telasDisponibles.find((t) => Number(t.id) === TELA_DEFAULT_ID) || telasDisponibles[0];
      if (aurora) {
        setTelaId(Number(aurora.id));
        onTelaSelectRef.current?.(aurora);
        defaultAppliedRef.current = true;
      }
    }
  }, [telasDisponibles, selectedTelaId]);

  useEffect(() => {
    const productoId = formData.tipoApertura === 'cadena_cordon' ? 256 : 255;

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

    const obtenerDatos = async () => {
      const producto = await obtenerDatosProducto(productoId);
      const tela = telasDisponibles.find((t) => Number(t.id) === Number(telaId)) || null;

      onPedidoDetailsChange({
        ...formData,
        sistema: 'Dunes',
        productoId,
        producto,
        telaId: tela?.id ?? telaId,
        tela,
        telaNombre: tela?.nombreProducto || '',
        tipoTela: tela?.nombreProducto || '',
        colorSistema: formData.colorSistema,
        ladoComando: formData.ladoComando,
        ladoApertura: formData.ladoApertura,
        detalle: formData.detalle,
      });
      onDetalleChange(formData.detalle);
    };

    obtenerDatos();
  }, [formData, telaId, telasDisponibles, onPedidoDetailsChange, onDetalleChange]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTelaChange = (id: number) => {
    setTelaId(id);
    const tela = telasDisponibles.find((t) => Number(t.id) === Number(id)) || null;
    if (tela) {
      onTelaSelectRef.current?.(tela);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        selectedKey={formData.tipoApertura}
        onSelectionChange={(key) => handleChange('tipoApertura', key)}
        className="w-full"
      >
        <Tab key="cadena_cordon" title="Apertura con Cadena y Cordón" />
        <Tab key="baston" title="Apertura con Bastón" />
      </Tabs>

      <div className="w-full">
        <Select
          label="Tela"
          placeholder={loadingTelas ? 'Cargando telas...' : 'Seleccione tela'}
          selectedKeys={telaId ? [String(telaId)] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0];
            if (key != null) handleTelaChange(Number(key));
          }}
          isDisabled={loadingTelas || telasDisponibles.length === 0}
        >
          {telasDisponibles.map((tela) => (
            <SelectItem key={String(tela.id)} textValue={tela.nombreProducto}>
              {tela.nombreProducto}
              {tela.precio != null
                ? ` — $${Number(tela.precio).toLocaleString()}/m²`
                : ''}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Color Sistema"
          selectedKeys={formData.colorSistema ? [formData.colorSistema] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string | undefined;
            handleChange('colorSistema', key || '');
          }}
        >
          <SelectItem key="blanco">Blanco</SelectItem>
          <SelectItem key="negro">Negro</SelectItem>
          <SelectItem key="beige">Beige</SelectItem>
        </Select>

        <Select
          label="Lado Comando"
          selectedKeys={formData.ladoComando ? [formData.ladoComando] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string | undefined;
            handleChange('ladoComando', key || '');
          }}
        >
          <SelectItem key="derecho">Derecho</SelectItem>
          <SelectItem key="izquierdo">Izquierdo</SelectItem>
        </Select>
      </div>

      <div className="w-full">
        <Select
          label="Lado Apertura"
          selectedKeys={formData.ladoApertura ? [formData.ladoApertura] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string | undefined;
            handleChange('ladoApertura', key || '');
          }}
        >
          <SelectItem key="izquierdo">Izquierdo</SelectItem>
          <SelectItem key="derecho">Derecho</SelectItem>
        </Select>
      </div>

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
