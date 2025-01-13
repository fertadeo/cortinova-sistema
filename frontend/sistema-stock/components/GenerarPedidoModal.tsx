import React, { useEffect, useState } from "react";
import {Modal, ModalContent,ModalHeader,ModalBody,ModalFooter,Button,Select,SelectItem,Input,Checkbox,
} from "@nextui-org/react";
import abacoData from './utils/abacos/abacos.json';
import { RollerForm } from "./utils/abacos/forms/RollerForm";
import DubaiForm from "./utils/abacos/forms/DubaiForm";
import PanelesForm from "./utils/abacos/forms/PanelesForm";
import FitForm from "./utils/abacos/forms/FitForm";
import VenecianasForm from "./utils/abacos/forms/VenecianasForm";
import BarcelonaForm from "./utils/abacos/forms/BarcelonaForm";

interface MedidasPermitidas {
  medidasPermitidas: {
    min: { ancho: number; alto: null };
    max: {
      ancho: number | null;
      alto: number | null;
    };
    "sup min": number;
    "sup max": number | null;
  };
}

interface Sistema {
  id: string | number;
  nombreSistemas: string | number | readonly string[] | undefined;
  ancho: number;
  alto: number;
  sistema: string;
  garantia?: string;
}

interface SistemaData {
  "medidas permitidas": MedidasPermitidas;
  sistemas: Sistema[];
}

interface AbacoData {
  Roller: SistemaData;
  Barcelona: SistemaData;
  Manhattan: SistemaData;
  [key: string]: SistemaData;
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
  onPedidoCreated: (pedido: any) => void;
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
const determinarSistema = (tipo: string, ancho: number, alto: number): string => {
  const tipoSistema = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase() as keyof typeof abacoData;
  const sistemaData = abacoData[tipoSistema];

  if (!sistemaData || !("medidas permitidas" in sistemaData)) {
    return "Tipo de sistema no encontrado";
  }

  const medidasPermitidas = sistemaData["medidas permitidas"];

  // Validar ancho mínimo si existe
  if (medidasPermitidas.min?.ancho && ancho < medidasPermitidas.min.ancho) {
    return `El ancho mínimo permitido es ${medidasPermitidas.min.ancho}m`;
  }

  // Validar superficie mínima si existe
  const superficie = ancho * alto;
  if (medidasPermitidas["sup min"] && superficie < medidasPermitidas["sup min"]) {
    return `La superficie mínima permitida es ${medidasPermitidas["sup min"]}m²`;
  }

  // Si pasa las validaciones, buscar el sistema correspondiente
  const sistemas = sistemaData.sistemas;

  // Ordenar los sistemas por dimensiones
  const sortedSistemas = sistemas.sort((a, b) => {
    if (a.ancho === b.ancho) {
      return a.alto - b.alto;
    }
    return a.ancho - b.ancho;
  });

  // Encontrar el sistema adecuado
  for (const sistema of sortedSistemas) {
    if (sistema.ancho >= ancho && sistema.alto >= alto) {
      return sistema.sistema;
    }
  }

  return "No hay sistema disponible para estas medidas";
};

// Actualizar la función helper
const getUniqueSistemas = (sistemaData: SistemaData): string[] => {
  if (!sistemaData?.sistemas) return [];
  return Array.from(new Set(sistemaData.sistemas.map(sistema => sistema.sistema)));
};

// Agregar cerca de la parte superior del archivo, antes del componente
const MOCK_TELAS = [
  {
    id: 1,
    nombre: "Screen 5% White/Pearl",
    tipo: "Screen",
    color: "Blanco/Perla",
    precio: 15000
  },
  {
    id: 2,
    nombre: "Screen 3% Black/Grey",
    tipo: "Screen",
    color: "Negro/Gris",
    precio: 16500
  },
  {
    id: 3,
    nombre: "Blackout Premium White",
    tipo: "Blackout",
    color: "Blanco",
    precio: 18000
  },
  {
    id: 4,
    nombre: "Blackout Premium Beige",
    tipo: "Blackout",
    color: "Beige",
    precio: 18000
  },
  {
    id: 5,
    nombre: "Sunscreen 10% Ivory",
    tipo: "Sunscreen",
    color: "Marfil",
    precio: 17000
  },
  {
    id: 6,
    nombre: "Sunscreen 10% Grey",
    tipo: "Sunscreen",
    color: "Gris",
    precio: 17000
  }
];

// Función helper para normalizar el nombre del sistema
const normalizarNombreSistema = (nombre: string): string => {
  // Primero convertimos todo a minúsculas y luego capitalizamos la primera letra
  const nombreNormalizado = nombre.toLowerCase();
  return nombreNormalizado.charAt(0).toUpperCase() + nombreNormalizado.slice(1);
};

// Función helper para obtener el nombre del sistema por ID
const getSistemaNombreById = (id: number | string): string | null => {
  // Buscar en el JSON de abacos el sistema que corresponde al ID
  const sistema = Object.entries(abacoData).find(([_, value]) => value.id === Number(id));
  return sistema ? sistema[0] : null;
};

export default function GenerarPedidoModal({
  isOpen,
  onOpenChange,
  selectedClient,
  productos,
  total,
  onPedidoCreated
}: GenerarPedidoModalProps) {
  // Estado para controlar el paso actual
  const [currentStep, setCurrentStep] = useState(1);

  // Estados del primer paso
  const [selectedSistema, setSelectedSistema] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("1");
  const [ancho, setAncho] = useState<string>("");
  const [alto, setAlto] = useState<string>("");
  const [selectedArticulo, setSelectedArticulo] = useState<string>("");

  // Estados específicos de Roller
  const [detalle, setDetalle] = useState("");
  const [caidaPorDelante, setCaidaPorDelante] = useState(false);
  const [colorSistema, setColorSistema] = useState("");
  const [ladoComando, setLadoComando] = useState("");
  const [tipoTela, setTipoTela] = useState("");
  const [soporteIntermedio, setSoporteIntermedio] = useState(false);
  const [soporteDoble, setSoporteDoble] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);

  const [sistemaRecomendado, setSistemaRecomendado] = useState<string>("");
  const [pedidoJSON, setPedidoJSON] = useState<string>("");

  // Agregar nuevos estados para el buscador de telas
  const [searchTela, setSearchTela] = useState("");
  const [telasFiltradas, setTelasFiltradas] = useState<Array<{
    id: number;
    nombre: string;
    tipo: string;
    color: string;
    precio: number;
  }>>([]);
  const [selectedTela, setSelectedTela] = useState<string>("");
  const [showTelasList, setShowTelasList] = useState(false);

  // Define state to hold calculated prices
  const [precioSistema, setPrecioSistema] = useState(0);
  const [precioTela, setPrecioTela] = useState(0);

  // Agregar este estado
  const [incluirColocacion, setIncluirColocacion] = useState(true);

  // Nuevo estado para manejar los detalles específicos del sistema
  const [sistemaPedidoDetalles, setSistemaPedidoDetalles] = useState<any>(null);

  const resetInputs = () => {
    setCurrentStep(1);
    setSelectedSistema("");
    setCantidad("1");
    setAncho("");
    setAlto("");
    setSelectedArticulo("");
    setDetalle("");
    setCaidaPorDelante(false);
    setColorSistema("");
    setLadoComando("");
    setTipoTela("");
    setSoporteIntermedio(false);
    setSoporteDoble(false);
    setSearchTela("");
    setTelasFiltradas([]);
    setSelectedTela("");
    setShowTelasList(false);
  };

  // Actualizar la función canProceedToNextStep
  const canProceedToNextStep = () => {
    if (!selectedSistema) return false;
    if (!cantidad || Number(cantidad) <= 0) return false;
    if (!ancho || Number(ancho) <= 0) return false;
    if (!alto || Number(alto) <= 0) return false;

    // Verificar si hay sistema disponible para las medidas
    const anchoMetros = Number(ancho) / 100;
    const altoMetros = Number(alto) / 100;
    const sistemasDisponibles = abacoData[selectedSistema as keyof typeof abacoData]?.abacos;

    return sistemasDisponibles?.some(
      (sistema: { ancho: number; alto: number }) => sistema.ancho >= anchoMetros && sistema.alto >= altoMetros
    ) ?? false;
  };

  const handleClose = () => {
    if (selectedSistema || cantidad !== "1" || ancho !== "0" || alto !== "0" || selectedArticulo) {
      setShowConfirmModal(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    onOpenChange(false);
  };

  useEffect(() => {
    const fetchSistemas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sistemas`);
        if (!response.ok) throw new Error('Error al cargar sistemas');
        const data = await response.json();
        
        // Verificar que data.data existe y es un array
        if (Array.isArray(data.data)) {
          setSistemas(data.data);
        } else {
          console.error("Los datos recibidos no son un array:", data);
          setSistemas([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setSistemas([]);
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
    if (selectedSistema && ancho !== "" && alto !== "" && ancho !== "0" && alto !== "0") {
      // Convertir ancho y alto de cm a m
      const anchoEnMetros = Number(ancho) / 100;
      const altoEnMetros = Number(alto) / 100;

      const sistema = determinarSistema(selectedSistema, anchoEnMetros, altoEnMetros);

      // Si el resultado es un mensaje de error, mostrarlo
      if (sistema.includes("mínimo") || sistema.includes("No hay sistema")) {
        setSistemaRecomendado("");
        setSelectedArticulo("");
        // Aquí podrías mostrar el mensaje de error al usuario
        console.error(sistema);
      } else {
        setSistemaRecomendado(sistema);
        setSelectedArticulo(sistema);
      }
    } else {
      setSistemaRecomendado("");
      setSelectedArticulo("");
    }
  }, [ancho, alto, selectedSistema]);

  // Agregar función de búsqueda de telas
  const handleTelaSearch = async (value: string) => {
    setSearchTela(value);
    setShowTelasList(true);

    if (!value.trim()) {
      setTelasFiltradas([]);
      setShowTelasList(false);
      return;
    }

    // Simular búsqueda local
    const searchTerms = value.toLowerCase().split(' ');
    const filtered = MOCK_TELAS.filter(tela => {
      const searchString = `${tela.nombre} ${tela.tipo} ${tela.color}`.toLowerCase();
      return searchTerms.every(term => searchString.includes(term));
    });

    setTelasFiltradas(filtered);
  };

  // Update the calcularPrecioTotal function to set these values
  const calcularPrecioTotal = () => {
    if (!ancho || !alto || !cantidad || !selectedTela) return 0;

    const anchoMetros = Number(ancho) / 100; // Convert to meters
    const precioSistemaPorMetro = 12000; // Example price
    const telaSeleccionada = MOCK_TELAS.find(t => t.nombre === selectedTela);
    const precioTelaPorMetro = telaSeleccionada ? telaSeleccionada.precio : 0;

    const nuevoPrecioSistema = precioSistemaPorMetro * anchoMetros;
    const nuevoPrecioTela = precioTelaPorMetro * anchoMetros;

    setPrecioSistema(nuevoPrecioSistema);
    setPrecioTela(nuevoPrecioTela);

    const costoColocacion = 5000; // Fixed cost
    return (nuevoPrecioSistema + nuevoPrecioTela + costoColocacion) * Number(cantidad);
  };

  const getValidationMessage = (tipo: 'ancho' | 'alto', value: number) => {
    if (!selectedSistema) return undefined;

    const medidas = abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"];
    if (!medidas) return undefined;

    // Validación de dimensiones
    const minValue = medidas.min?.[tipo];
    const maxValue = medidas.max?.[tipo];

    if (minValue && value < minValue * 100) {
      return `El ${tipo} mínimo permitido es ${minValue * 100}cm`;
    }

    if (maxValue && value > maxValue * 100) {
      return `El ${tipo} máximo permitido es ${maxValue * 100}cm`;
    }

    // Validación de superficie y sistema disponible
    if (ancho && alto) {
      const superficie = (Number(ancho) * Number(alto)) / 10000; // convertir a m²
      if (medidas["sup min"] && superficie < medidas["sup min"]) {
        return `La superficie mínima permitida es ${medidas["sup min"]}m²`;
      }
      if (medidas["sup max"] && superficie > medidas["sup max"]) {
        return `La superficie máxima permitida es ${medidas["sup max"]}m²`;
      }

      // Verificar si hay sistema disponible
      const anchoMetros = Number(ancho) / 100;
      const altoMetros = Number(alto) / 100;
      const sistemasDisponibles = abacoData[selectedSistema as keyof typeof abacoData]?.sistemas;
      const haySistemaDisponible = sistemasDisponibles?.some(
        (sistema: { ancho: number; alto: number; sistema: string }) => 
          sistema.ancho >= anchoMetros && sistema.alto >= altoMetros
      );

      if (!haySistemaDisponible) {
        return "No hay sistema disponible para estas medidas";
      }
    }

    return undefined;
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent className="max-h-[90vh] rounded-lg">
        {(onClose) => {
          const handleGenerarPedido = () => {
            if (!selectedClient) return;

            const pedido = {
              sistema: selectedSistema,
              detalles: {
                cantidad: parseFloat(cantidad),
                ancho: Number(ancho),
                alto: Number(alto),
                sistemaRecomendado,
                articuloSeleccionado: selectedArticulo,
                tela: selectedTela,
                caidaPorDelante,
                colorSistema,
                ladoComando,
                tipoTela,
                soporteIntermedio,
                soporteDoble,
                detalle
              },
              fecha: new Date().toISOString(),
              precioTotal: calcularPrecioTotal()
            };

            // Agregar console.log detallado
            console.log('=== DETALLE DEL PEDIDO ===');
            console.log('Cliente:', selectedClient.nombre);
            console.log('Sistema:', selectedSistema);
            console.log('Medidas:', `${ancho}cm x ${alto}cm`);
            console.log('Sistema recomendado:', sistemaRecomendado);
            console.log('Cantidad:', cantidad);
            console.log('Tela seleccionada:', selectedTela);
            console.log('Detalles de instalación:', {
              'Caída por delante': caidaPorDelante ? 'Sí' : 'No',
              'Color del sistema': colorSistema,
              'Lado del comando': ladoComando,
              'Tipo de tela': tipoTela,
              'Soporte intermedio': soporteIntermedio ? 'Sí' : 'No',
              'Soporte doble': soporteDoble ? 'Sí' : 'No'
            });
            console.log('Observaciones:', detalle || 'Sin observaciones');
            console.log('Precio total:', `$${calcularPrecioTotal().toLocaleString()}`);
            console.log('========================');

            setPedidoJSON(JSON.stringify(pedido, null, 2));
            onPedidoCreated(pedido);
            onClose();
          };

          return (
            <>
              <ModalHeader className="sticky top-0 z-20 bg-white rounded-t-lg border-b">
                Generar Pedido
              </ModalHeader>
              
              <ModalBody className="overflow-y-auto">
                <div className="space-y-6">
                  {/* PARTE 1: Inputs generales */}
                  <div className="space-y-4">
                    <Select
                      label="Seleccionar Sistema"
                      placeholder="Elegir un sistema"
                      selectedKeys={sistemas.some(sistema => sistema.nombreSistemas === selectedSistema) ? [selectedSistema] : []}
                      onSelectionChange={(keys) => {
                        const sistemaId = Array.from(keys)[0] as string;
                        const sistemaNombre = getSistemaNombreById(sistemaId);
                        
                        console.log("ID seleccionado:", sistemaId);
                        console.log("Nombre del sistema:", sistemaNombre);
                        
                        if (sistemaNombre) {
                          setSelectedSistema(sistemaNombre);
                          console.log("Sistema encontrado en abacos");

                          // Agregar console.log para el sistema "Barcelona"
                          if (sistemaNombre === "Barcelona") {
                            console.log("Detalles del sistema Barcelona:", {
                              ancho,
                              alto,
                              cantidad,
                              selectedArticulo,
                            });
                          }
                        }
                      }}
                    >
                      {sistemas?.map((sistema) => (
                        <SelectItem 
                          key={sistema.id} 
                          value={sistema.nombreSistemas}
                          textValue={String(sistema.nombreSistemas)}
                        >
                          {sistema.nombreSistemas} 
                        </SelectItem>
                      ))}
                    </Select>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        type="number"
                        label="Cantidad"
                        value={cantidad}
                        onValueChange={setCantidad}
                        variant="bordered"
                        size="sm"
                      />
                      <div className="relative">
                        <Input
                          type="number"
                          label="Ancho (cm)"
                          value={ancho}
                          onValueChange={setAncho}
                          variant="bordered"
                          size="sm"
                          placeholder="0"
                          isInvalid={!!(selectedSistema && ancho && Number(ancho) < (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.ancho || 0) * 100)}
                          errorMessage={
                            selectedSistema && ancho && Number(ancho) < (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.ancho || 0) * 100
                              ? `El ancho mínimo permitido es ${(abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.ancho || 0) * 100}cm`
                              : undefined
                          }
                        />
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          label="Alto (cm)"
                          value={alto}
                          onValueChange={setAlto}
                          variant="bordered"
                          size="sm"
                          placeholder="0"
                          isInvalid={!!getValidationMessage('alto', Number(alto))}
                          errorMessage={getValidationMessage('alto', Number(alto))}
                        />
                      </div>
                    </div>

                    <Select
                      label="Artículo"
                      selectedKeys={selectedArticulo ? [selectedArticulo] : []}
                      onSelectionChange={(keys) => setSelectedArticulo(Array.from(keys)[0] as string)}
                    >
                      {selectedSistema ?
                        getUniqueSistemas(abacoData[selectedSistema as keyof typeof abacoData] as unknown as SistemaData).map((sistema) => (
                          <SelectItem key={sistema} value={sistema}>
                            {sistema}
                          </SelectItem>
                        ))
                        : <SelectItem key="empty" value="">Seleccione un sistema primero</SelectItem>
                      }
                    </Select>
                  </div>

                  {/* PARTE 2: Formulario específico del sistema */}
                  {selectedSistema && (
                    <div className="pt-4 mt-4 border-t">
                      {/* Renderizado condicional según el sistema seleccionado */}
                      {(() => {
                        switch (selectedSistema) {
                          case "Roller":
                            return (
                              <RollerForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                caidaPorDelante={caidaPorDelante}
                                colorSistema={colorSistema}
                                ladoComando={ladoComando}
                                tipoTela={tipoTela}
                                soporteIntermedio={soporteIntermedio}
                                soporteDoble={soporteDoble}
                                onDetalleChange={setDetalle}
                                onCaidaChange={setCaidaPorDelante}
                                onColorChange={setColorSistema}
                                onLadoComandoChange={setLadoComando}
                                onTipoTelaChange={setTipoTela}
                                onSoporteIntermedioChange={setSoporteIntermedio}
                                onSoporteDobleChange={setSoporteDoble}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          case "Dubai":
                            return (
                              <DubaiForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                onDetalleChange={setDetalle}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          case "Fit":
                            return (
                              <FitForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                              />
                            );
                          case "Paneles":
                            return (
                              <PanelesForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                              />
                            );
                          case "Venecianas":
                            return (
                              <VenecianasForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                              />
                            );
                            case "Barcelona":
                              return (
                                <BarcelonaForm
                                  ancho={ancho}
                                  alto={alto}
                                  cantidad={cantidad}
                                  selectedArticulo={selectedArticulo}
                                />
                              );
                          default:
                            return (
                              <div className="p-4 text-center text-gray-500">
                                Formulario para {selectedSistema} en desarrollo...
                              </div>
                            );
                        }
                      })()}
                    </div>
                  )}

                  {/* Tercer paso - Buscador de telas */}
                  {canProceedToNextStep() && selectedSistema === "Roller" && (
                    <div className="pt-4 mt-4 border-t">
                      <div className="relative">
                        <Input
                          label="Buscar Tela"
                          placeholder="Escribe para buscar telas..."
                          value={searchTela}
                          onValueChange={handleTelaSearch}
                          variant="bordered"
                          className="mb-2"
                        />

                        {showTelasList && telasFiltradas.length > 0 && (
                          <div className="overflow-auto absolute z-50 w-full max-h-60 bg-white rounded-lg border shadow-lg">
                            {telasFiltradas.map((tela) => (
                              <button
                                key={tela.id}
                                className="p-3 w-full text-left border-b hover:bg-gray-50 last:border-b-0"
                                onClick={() => {
                                  setSelectedTela(tela.nombre);
                                  setSearchTela(tela.nombre);
                                  setShowTelasList(false);
                                }}

                                tabIndex={0}
                              >
                                <div className="font-medium">{tela.nombre}</div>
                                <div className="text-sm text-gray-600">
                                  <span className="mr-2">Tipo: {tela.tipo}</span>
                                  <span className="mr-2">Color: {tela.color}</span>
                                  <span>Precio: ${tela.precio}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {showTelasList && searchTela && telasFiltradas.length === 0 && (
                          <div className="absolute z-50 p-3 w-full text-center text-gray-500 bg-white rounded-lg border">
                            No se encontraron telas
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cuarto paso - Resumen de precios */}
                  {canProceedToNextStep() && selectedSistema === "Roller" && (
                    <div className="pt-4 mt-4 border-t">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Resumen de Precios</h3>
                        {selectedTela && ancho && alto && cantidad && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Metros cuadrados:</span>
                              <span>{((Number(ancho) / 100) * (Number(alto) / 100)).toFixed(2)} m²</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Precio sistema:</span>
                              <span>${precioSistema.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Precio tela:</span>
                              <span>${precioTela.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Cantidad:</span>
                              <span>{cantidad}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Total:</span>
                              <span>${calcularPrecioTotal().toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedSistema && ancho && alto && (
                    <div className="p-4 mt-4 bg-gray-50 rounded-lg border">
                      <h3 className="mb-3 text-lg font-semibold">Resumen de Precios</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Sistema ({ancho}cm):</span>
                          <span className="font-medium">
                            ${(Number(ancho) / 100 * 12000).toLocaleString()}
                          </span>
                        </div>

                        {selectedTela && (
                          <div className="flex justify-between items-center">
                            <span>Tela ({ancho}cm):</span>
                            <span className="font-medium">
                              ${(Number(ancho) / 100 * precioTela).toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex gap-2 items-center">
                            <Checkbox
                              isSelected={incluirColocacion}
                              onValueChange={setIncluirColocacion}
                            >
                              Incluir colocación
                            </Checkbox>
                            <span className="text-sm text-gray-600">($10,000)</span>
                          </div>
                          {incluirColocacion && (
                            <span className="font-medium">$10,000</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 mt-2 border-t">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold">
                            ${((Number(ancho) / 100 * 12000) +
                              (selectedTela ? Number(ancho) / 100 * precioTela : 0) +
                              (incluirColocacion ? 10000 : 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}


              
                </div>
              </ModalBody>
              <ModalFooter className="sticky bottom-0 z-20 bg-white rounded-b-lg border-t">
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    const pedido = {
                      sistema: selectedSistema,
                      detalles: {
                        cantidad: parseFloat(cantidad),
                        ancho: Number(ancho),
                        alto: Number(alto),
                        sistemaRecomendado,
                        articuloSeleccionado: selectedArticulo,
                        ...sistemaPedidoDetalles // Incluimos los detalles específicos del sistema
                      },
                      fecha: new Date().toISOString(),
                      precioTotal: calcularPrecioTotal()
                    };
                    onPedidoCreated(pedido);
                    onClose();
                  }}
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