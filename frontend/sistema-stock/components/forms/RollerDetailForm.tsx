import { Checkbox, Input, Select, SelectItem } from "@nextui-org/react";

interface RollerDetailFormProps {
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

export function RollerDetailForm(props: RollerDetailFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Input
          type="text"
          label="Detalle"
          value={props.detalle}
          onValueChange={props.onDetalleChange}
          variant="bordered"
          size="sm"
        />

        <Select 
          label="Color sistema"
          selectedKeys={props.colorSistema ? [props.colorSistema] : []}
          onSelectionChange={(keys) => props.onColorChange(Array.from(keys)[0] as string)}
          size="sm"
        >
          <SelectItem key="blanco">Blanco</SelectItem>
          <SelectItem key="negro">Negro</SelectItem>
          <SelectItem key="gris">Gris</SelectItem>
        </Select>

        <Select 
          label="Lado comando"
          selectedKeys={props.ladoComando ? [props.ladoComando] : []}
          onSelectionChange={(keys) => props.onLadoComandoChange(Array.from(keys)[0] as string)}
          size="sm"
        >
          <SelectItem key="izquierda">Izquierda</SelectItem>
          <SelectItem key="derecha">Derecha</SelectItem>
        </Select>

        <Select 
          label="Tipo de tela"
          selectedKeys={props.tipoTela ? [props.tipoTela] : []}
          onSelectionChange={(keys) => props.onTipoTelaChange(Array.from(keys)[0] as string)}
          size="sm"
        >
          <SelectItem key="screen">Screen</SelectItem>
          <SelectItem key="blackout">Blackout</SelectItem>
          <SelectItem key="sunscreen">Sunscreen</SelectItem>
        </Select>
      </div>

      <div className="flex gap-4">
        <Checkbox
          isSelected={props.soporteIntermedio}
          onValueChange={props.onSoporteIntermedioChange}
        >
          Soporte intermedio
        </Checkbox>
        <Checkbox
          isSelected={props.soporteDoble}
          onValueChange={props.onSoporteDobleChange}
        >
          Soporte doble
        </Checkbox>
        <Checkbox
          isSelected={props.caidaPorDelante}
          onValueChange={props.onCaidaChange}
        >
          Caída por delante
        </Checkbox>
      </div>
    </div>
  );
} 
   