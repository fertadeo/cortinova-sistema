import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
} from "@nextui-org/react";
import abacoRoller from './utils/abacos/roller.json';

interface Sistema {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface Client {
  nombre: string;
  direccion?: string;
  telefono?: string;
}

interface GenerarPedidoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedClient: Client | null;
  productos: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

// Actualizar la interfaz para el JSON
interface SistemaRoller {
  ancho: number;
  alto: number;
  sistema: string;
  garantia?: string;
}

interface AbacoRoller {
  sistemas: SistemaRoller[];
}

// Función para determinar el sistema
const determinarSistemaRoller = (ancho: number, alto: number): string => {
  const sistemas = (abacoRoller as AbacoRoller).sistemas;

  // Ordenar los sistemas por ancho y alto
  const sortedSistemas = sistemas.sort((a, b) => {
    if (a.ancho === b.ancho) {
      return a.alto - b.alto;
    }
    return a.ancho - b.ancho;
  });

  for (const sistema of sortedSistemas) {
    if (sistema.ancho >= ancho && sistema.alto >= alto) {
      return sistema.sistema;
    }
  }
  
  return "No hay sistema disponible para estas medidas";
};

export default function GenerarPedidoModal({
  isOpen,
  onOpenChange,
  selectedClient,
  productos,
  total
}: GenerarPedidoModalProps) {
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [selectedSistema, setSelectedSistema] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [cantidad, setCantidad] = useState<string>("1");
  const [ancho, setAncho] = useState<string>("0");
  const [alto, setAlto] = useState<string>("0");
  const [selectedArticulo, setSelectedArticulo] = useState<string>("");
  const [sistemaRecomendado, setSistemaRecomendado] = useState<string>("");
  const [pedidoJSON, setPedidoJSON] = useState<string>("");

  // Función para resetear todos los inputs
  const resetInputs = () => {
    setSelectedSistema("");
    setCantidad("1");
    setAncho("0");
    setAlto("0");
    setSelectedArticulo("");
    setSistemaRecomendado("");
    setPedidoJSON("");
  };

  // Limpiar campos al abrir/cerrar el modal
  useEffect(() => {
    if (isOpen) {
      resetInputs();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSistemas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sistemas`);
        if (!response.ok) throw new Error('Error al cargar sistemas');
        const data = await response.json();
        setSistemas(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSistemas();
    }
  }, [isOpen]);

  // Actualizar el useEffect
  useEffect(() => {
    if (selectedSistema === "ROLLER" && ancho !== "" && alto !== "" && ancho !== "0" && alto !== "0") {
      // Convertir ancho y alto de cm a m
      const anchoEnMetros = Number(ancho) / 100;
      const altoEnMetros = Number(alto) / 100;
      
      const sistema = determinarSistemaRoller(anchoEnMetros, altoEnMetros);
      setSistemaRecomendado(sistema);
      setSelectedArticulo(sistema);
    } else {
      setSistemaRecomendado("");
      setSelectedArticulo("");
    }
  }, [ancho, alto, selectedSistema]);

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          resetInputs();
        }
        onOpenChange(open);
      }}
      size="2xl"
    >
      <ModalContent>
        {(onClose) => {
          const handleGenerarPedido = () => {
            if (!selectedClient) return;
            const pedido = {
              sistema: selectedSistema,
              detalles: {
                cantidad: Number(cantidad),
                ancho: Number(ancho),
                alto: Number(alto),
                sistemaRecomendado,
                articuloSeleccionado: selectedArticulo
              },
              fecha: new Date().toISOString(),
              total
            };
            setPedidoJSON(JSON.stringify(pedido, null, 2));
            console.log('Pedido generado:', pedido);
            onClose();
          };

          return (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Generar Pedido
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Select
                    label="Seleccionar Sistema"
                    placeholder="Elegir un sistema"
                    selectedKeys={selectedSistema ? [selectedSistema] : []}
                    onSelectionChange={(keys) => setSelectedSistema(Array.from(keys)[0] as string)}
                    className="mb-6"
                  >
                    <SelectItem key="ROLLER">ROLLER</SelectItem>
                    <SelectItem key="VENECIANAS">VENECIANAS</SelectItem>
                  </Select>

                  <div className="mb-2 text-sm text-gray-500">
                    Sistema seleccionado: {selectedSistema}
                    {selectedSistema === "ROLLER" && sistemaRecomendado && (
                      <div className="mt-1 font-medium text-blue-600">
                        Sistema recomendado: {sistemaRecomendado}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <Input
                        type="number"
                        label="Cantidad"
                        value={cantidad}
                        onValueChange={setCantidad}
                        variant="bordered"
                        size="sm"
                      />
                      <Input
                        type="number"
                        label="Ancho (cm)"
                        value={ancho}
                        onValueChange={setAncho}
                        variant="bordered"
                        size="sm"
                      />
                      <Input
                        type="number"
                        label="Alto (cm)"
                        value={alto}
                        onValueChange={setAlto}
                        variant="bordered"
                        size="sm"
                      />
                    </div>
                    <div className="flex gap-4 items-center">
                      <Input
                        type="number"
                        label="Cantidad"
                        value={cantidad}
                        onValueChange={setCantidad}
                        variant="bordered"
                        size="sm"
                        className="w-20"
                      />
                      <Select 
                        label="Articulo"
                        selectedKeys={selectedArticulo ? [selectedArticulo] : []}
                        onSelectionChange={(keys) => setSelectedArticulo(Array.from(keys)[0] as string)}
                        variant="bordered"
                      >
                        {(abacoRoller as unknown as { sistemas: SistemaRoller[] }).sistemas.map((sistema) => (
                          <SelectItem key={sistema.sistema} value={sistema.sistema}>
                            {sistema.sistema}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleGenerarPedido}
                  isDisabled={!selectedSistema || !cantidad || !ancho || !alto || !selectedArticulo}
                >
                  Generar Pedido
                </Button>
              </ModalFooter>
            </>
          );
        }}
      </ModalContent>
    </Modal>
  );
}