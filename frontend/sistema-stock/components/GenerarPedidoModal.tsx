import React, { useEffect, useState } from "react";
import {Modal, ModalContent,ModalHeader,ModalBody,ModalFooter,Button,Select,SelectItem,Input,Checkbox} from "@heroui/react";
import { RollerForm } from "./utils/abacos/forms/RollerForm";
import DubaiForm from "./utils/abacos/forms/DubaiForm";
import DunesForm from "./utils/abacos/forms/DunesForm";
import PanelesForm from "./utils/abacos/forms/PanelesForm";
import FitForm from "./utils/abacos/forms/FitForm";
import VenecianasForm from "./utils/abacos/forms/VenecianasForm";
import BarcelonaForm from "./utils/abacos/forms/BarcelonaForm";
import RomanasForm from "./utils/abacos/forms/RomanasForm";
import { TelasSearch } from "./utils/TelasSearch";
import { type Tela } from '@/types/telas';


interface MedidasPermitidas {
  min: { ancho: number; alto: number | null };
  max: { ancho: number | null; alto: number | null };
  "sup min": number | null;
  "sup max": number | null;
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
  id: number;
  "medidas permitidas": MedidasPermitidas;
  sistemas: Sistema[];
}

type AbacoDataType = {
  [key: string]: SistemaData;
};

const abacoData: AbacoDataType = require('./utils/abacos/abacos.json');

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
  medidasPrecargadas?: {
    ancho: number;
    alto: number;
    cantidad: number;
    ubicacion: string;
    medidaId: number;
  };
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

// Función para normalizar el nombre del sistema
const normalizarNombreSistema = (tipo: string): string => {
  // Mapeo de nombres de sistemas
  const sistemasMap: { [key: string]: string } = {
    "BARCELONA - BANDAS VERTICALES": "Barcelona",
    "BARCELONA": "Barcelona",
    "ROLLER": "ROLLER",
    "DUNES": "Dunes",
    "DUNES - CORTINA TRADICIONAL": "Dunes",
    "ROMANAS": "Romanas",
    // Añade más mappings según sea necesario
  };

  const tipoNormalizado = tipo.toUpperCase().trim();
  console.log('Tipo original:', tipo);
  console.log('Tipo normalizado:', tipoNormalizado);
  
  const tipoMapeado = sistemasMap[tipoNormalizado] || tipoNormalizado;
  console.log('Tipo mapeado:', tipoMapeado);
  console.log('Sistemas disponibles en abacoData:', Object.keys(abacoData));

  return tipoMapeado;
};

// Actualizar la función determinarSistema
const determinarSistema = (tipo: string, ancho: number, alto: number): string => {
  const tipoNormalizado = normalizarNombreSistema(tipo);
  // console.log(`Determinando sistema para: tipo=${tipoNormalizado}, ancho=${ancho}m, alto=${alto}m`);
  
  const sistemaData = abacoData[tipoNormalizado];
  
  if (!sistemaData || !sistemaData["medidas permitidas"]) {
    // console.error(`Sistema no encontrado o sin medidas permitidas: ${tipoNormalizado}`);
    return "";
  }

  const medidasPermitidas = sistemaData["medidas permitidas"];

  // Validar límites máximos
  if (medidasPermitidas.max?.ancho && ancho > medidasPermitidas.max.ancho) {
    console.warn(`Ancho ${ancho}m excede el máximo permitido de ${medidasPermitidas.max.ancho}m`);
    return "EXCEDE_MAXIMO";
  }

  if (medidasPermitidas.max?.alto && alto > medidasPermitidas.max.alto) {
    console.warn(`Alto ${alto}m excede el máximo permitido de ${medidasPermitidas.max.alto}m`);
    return "EXCEDE_MAXIMO";
  }

  // Validar superficie máxima
  const superficie = ancho * alto;
  if (medidasPermitidas["sup max"] && superficie > medidasPermitidas["sup max"]) {
    console.warn(`Superficie ${superficie}m² excede el máximo permitido de ${medidasPermitidas["sup max"]}m²`);
    return "EXCEDE_MAXIMO";
  }

  // Validar ancho mínimo
  if (medidasPermitidas.min?.ancho && ancho < medidasPermitidas.min.ancho) {
    // console.log(`Ancho ${ancho}m es menor que el mínimo ${medidasPermitidas.min.ancho}m`);
    return ""; // Retornar string vacío en lugar de mensaje de error
  }

  // Validar alto mínimo si existe
  if (medidasPermitidas.min?.alto && alto < medidasPermitidas.min.alto) {
    // console.log(`Alto ${alto}m es menor que el mínimo ${medidasPermitidas.min.alto}m`);
    return ""; // Retornar string vacío en lugar de mensaje de error
  }

  // Validar superficie mínima
  if (medidasPermitidas["sup min"] && superficie < medidasPermitidas["sup min"]) {
    // console.log(`Superficie ${superficie}m² es menor que el mínimo ${medidasPermitidas["sup min"]}m²`);
    return ""; // Retornar string vacío en lugar de mensaje de error
  }

  // Ordenar los sistemas por dimensiones
  const sortedSistemas = [...sistemaData.sistemas].sort((a, b) => {
    if (a.ancho === b.ancho) {
      return a.alto - b.alto;
    }
    return a.ancho - b.ancho;
  });

  // Encontrar el sistema adecuado
  const sistemaEncontrado = sortedSistemas.find(sistema => 
    sistema.ancho >= ancho && sistema.alto >= alto
  );

  if (sistemaEncontrado) {
    // console.log('Sistema encontrado:', sistemaEncontrado.sistema);
    return sistemaEncontrado.sistema;
  }

  // console.warn('No se encontró sistema adecuado para estas medidas:', { ancho, alto });
  return "MEDIDAS_INVALIDAS";
};

// Actualizar la función helper
const getUniqueSistemas = (sistemaData: SistemaData): string[] => {
  if (!sistemaData?.sistemas) {
    // console.log('No hay sistemas disponibles para:', sistemaData);
    return [];
  }
  
  // Usar Set para eliminar duplicados inmediatamente
  const sistemasUnicos = new Set(
    sistemaData.sistemas
      .filter(sistema => sistema.sistema && typeof sistema.sistema === 'string')
      .map(sistema => sistema.sistema)
  );
  
  const sistemasArray = Array.from(sistemasUnicos);
  // console.log('Sistemas únicos disponibles:', sistemasArray);
  return sistemasArray;
};

// Función helper para obtener el nombre del sistema por ID
const getSistemaNombreById = (id: number | string): string | null => {
  // Buscar en el JSON de abacos el sistema que corresponde al ID
  const sistema = Object.entries(abacoData).find(([_, value]) => value.id === Number(id));
  return sistema ? sistema[0] : null;
};

// Función para calcular el área de tela necesaria
const calcularAreaTela = (ancho: number, alto: number, telaRotable: boolean = true): number => {
  // Convertir cm a metros
  const anchoMetros = Number(ancho) / 100;
  const altoMetros = Number(alto) / 100;
  
  if (telaRotable) {
    // Para telas que se pueden rotar, usamos el área mínima posible
    return Math.min(anchoMetros, altoMetros) * Math.max(anchoMetros, altoMetros);
  } else {
    // Para telas con patrón direccional, respetamos las dimensiones originales
    return anchoMetros * altoMetros;
  }
};

// Actualizar el cálculo del precio en el resumen
const calcularPrecioTela = (ancho: number, alto: number, precioTela: number, esRotable: boolean): number => {
  const area = calcularAreaTela(ancho, alto, esRotable);
  return area * precioTela;
};

// Función helper para procesar los sistemas únicos con su garantía
const procesarSistemasUnicos = (sistemas: Sistema[]) => {
  const sistemasMap = new Map<string, string>();
  
  sistemas.forEach(sistema => {
    const nombreBase = sistema.sistema.trim();
    const garantia = sistema.garantia ? ' - SG' : '';
    const nombreCompleto = `${nombreBase}${garantia}`;
    
    // Solo actualiza si no existe o si este tiene garantía y el anterior no
    if (!sistemasMap.has(nombreBase) || sistema.garantia) {
      sistemasMap.set(nombreBase, nombreCompleto);
    }
  });

  return Array.from(sistemasMap.values());
};

export default function GenerarPedidoModal({
  isOpen,
  onOpenChange,
  selectedClient,
  productos,
  total,
  onPedidoCreated,
  medidasPrecargadas
}: GenerarPedidoModalProps) {
  // Estado para controlar el paso actual
  const [currentStep, setCurrentStep] = useState(1);

  // Estados del primer paso
  const [selectedSistema, setSelectedSistema] = useState<string>("");
  const [selectedArticulo, setSelectedArticulo] = useState<string>("");

  // Estados específicos de Roller
  const [detalle, setDetalle] = useState("");
  const [caidaPorDelante, setCaidaPorDelante] = useState(false);
  const [colorSistema, setColorSistema] = useState<string>("");
  const [ladoComando, setLadoComando] = useState<string>("");
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
  const [selectedTela, setSelectedTela] = useState<Tela | null>(null);
  const [showTelasList, setShowTelasList] = useState(false);

  // Define state to hold calculated prices
  const [precioSistema, setPrecioSistema] = useState(0);
  const [precioTela, setPrecioTela] = useState(0);

  // Agregar este estado
  const [incluirColocacion, setIncluirColocacion] = useState(true);

  // Nuevo estado para manejar los detalles específicos del sistema
  const [sistemaPedidoDetalles, setSistemaPedidoDetalles] = useState<any>(null);

  // Agregar estado para manejar errores
  const [error, setError] = useState("");

  // Agregar nuevo estado para el precio de colocación
  const [precioColocacion, setPrecioColocacion] = useState<number>(0);

  // Agregar nuevo estado para manejar el input manual
  const [showManualPrecioInput, setShowManualPrecioInput] = useState(false);

  // Inicializar los estados con las medidas precargadas si existen
  const [ancho, setAncho] = useState(medidasPrecargadas?.ancho?.toString() || '');
  const [alto, setAlto] = useState(medidasPrecargadas?.alto?.toString() || '');
  const [cantidad, setCantidad] = useState(medidasPrecargadas?.cantidad?.toString() || '1');
  
  // Actualizar los valores cuando cambian las medidas precargadas
  useEffect(() => {
    if (medidasPrecargadas) {
      setAncho(medidasPrecargadas.ancho.toString());
      setAlto(medidasPrecargadas.alto.toString());
      setCantidad(medidasPrecargadas.cantidad.toString());
      // También podemos precargar otros campos si es necesario
    }
  }, [medidasPrecargadas]);

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
    setSelectedTela(null);
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
    const sistemasDisponibles = abacoData[selectedSistema as keyof typeof abacoData]?.sistemas;

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
      const anchoEnMetros = Number(ancho) / 100;
      const altoEnMetros = Number(alto) / 100;
      
      const resultado = determinarSistema(selectedSistema, anchoEnMetros, altoEnMetros);
      
      if (resultado === "EXCEDE_MAXIMO") {
        // Mostrar mensaje de error en la UI
        setError("Las medidas exceden los límites máximos permitidos para este sistema");
        setSistemaRecomendado("");
        setSelectedArticulo("");
      } else if (resultado === "MEDIDAS_INVALIDAS") {
        setError("No hay un sistema disponible para estas medidas");
        setSistemaRecomendado("");
        setSelectedArticulo("");
      } else {
        setError("");
        setSistemaRecomendado(resultado);
        if (resultado) {
          setSelectedArticulo(resultado);
        }
      }
    } else {
      setSistemaRecomendado("");
      setSelectedArticulo("");
      setError("");
    }
  }, [ancho, alto, selectedSistema]);

  // Actualizar la función handleTelaSearch para no usar MOCK_TELAS
  const handleTelaSearch = async (value: string) => {
    setSearchTela(value);
    setShowTelasList(true);

    if (!value.trim()) {
      setTelasFiltradas([]);
      setShowTelasList(false);
      return;
    }

    // Aquí deberías hacer la llamada a tu API o base de datos
    // Por ejemplo:
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/telas/search?q=${value}`);
    // const filtered = await response.json();
    // setTelasFiltradas(filtered);
  };

  // Actualizar calcularPrecioTotal para no usar MOCK_TELAS
  const calcularPrecioTotal = () => {
    if (!ancho || !alto || !cantidad || !selectedTela) return 0;

    const anchoMetros = Number(ancho) / 100;
    const precioSistemaPorMetro = 12000;
    
    // Calcular precio del sistema
    const nuevoPrecioSistema = precioSistemaPorMetro * anchoMetros;

    // Calcular precio de la tela
    const nuevoPrecioTela = calcularPrecioTela(
      Number(ancho),
      Number(alto),
      selectedTela?.precio ? Number(selectedTela.precio) : 0,
      selectedTela?.nombre === 'ROLLER'
    );

    // Incluir precio de colocación si está seleccionado
    const costoColocacionFinal = incluirColocacion ? precioColocacion : 0;

    setPrecioSistema(nuevoPrecioSistema);
    setPrecioTela(nuevoPrecioTela);

    return (nuevoPrecioSistema + nuevoPrecioTela + costoColocacionFinal) * Number(cantidad);
  };

  // Función para validar medidas
  const getValidationMessage = (tipo: 'ancho' | 'alto', value: number) => {
    // console.log(`Validando ${tipo}: ${value}cm`);
    
    if (!selectedSistema) return undefined;

    const medidas = abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"];
    if (!medidas) {
      // console.log('No se encontraron medidas permitidas');
      return undefined;
    }

    // Convertir a metros para la validación
    const valueInMeters = value / 100;

    // Validación de dimensiones
    const minValue = medidas.min?.[tipo];
    const maxValue = medidas.max?.[tipo];

    if (minValue && valueInMeters < minValue) {
      // console.log(`${tipo} ${valueInMeters}m es menor que el mínimo ${minValue}m`);
      return `El ${tipo} mínimo permitido es ${minValue * 100}cm`;
    }

    if (maxValue && valueInMeters > maxValue) {
      // console.log(`${tipo} ${valueInMeters}m es mayor que el máximo ${maxValue}m`);
      return `El ${tipo} máximo permitido es ${maxValue * 100}cm`;
    }

    // Validación de superficie
    if (ancho && alto) {
      const superficie = (Number(ancho) * Number(alto)) / 10000; // convertir a m²
      if (medidas["sup min"] && superficie < medidas["sup min"]) {
        // console.log(`Superficie ${superficie}m² es menor que el mínimo ${medidas["sup min"]}m²`);
        return `La superficie mínima permitida es ${medidas["sup min"]}m²`;
      }
      if (medidas["sup max"] && superficie > medidas["sup max"]) {
        // console.log(`Superficie ${superficie}m² es mayor que el máximo ${medidas["sup max"]}m²`);
        return `La superficie máxima permitida es ${medidas["sup max"]}m²`;
      }
    }

    return undefined;
  };

  // Agregar useEffect para obtener el precio de colocación
  useEffect(() => {
    const fetchPrecioColocacion = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/4`);
        if (!response.ok) throw new Error('Error al obtener precio de colocación');
        const data = await response.json();
        
        // Validar que el producto sea el correcto
        const nombreProducto = data.nombreProducto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!nombreProducto?.includes('colocacion')) {
          // console.error('El producto no corresponde a colocación');
          setShowManualPrecioInput(true);
          return;
        }

        const precio = Number(data.precio);
        if (isNaN(precio)) {
          setShowManualPrecioInput(true);
          return;
        }

        setPrecioColocacion(precio);
        setShowManualPrecioInput(false);

      } catch (error) {
        // console.error('Error al obtener precio de colocación:', error);
        setShowManualPrecioInput(true);
      }
    };

    fetchPrecioColocacion();
  }, []);

  const handleSubmit = () => {
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
        detalle,
        incluirColocacion
      },
      fecha: new Date().toISOString(),
      precioTotal: calcularPrecioTotal(),
      medidaId: medidasPrecargadas?.medidaId,
      incluirColocacion,
      precioColocacion
    };
    
    onPedidoCreated(pedido);
    onOpenChange(false);
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
                      selectedKeys={selectedSistema ? [selectedSistema] : []}
                      onSelectionChange={(keys) => {
                        const sistemaSeleccionado = Array.from(keys)[0] as string;
                        setSelectedSistema(sistemaSeleccionado);
                        
                        console.log("Sistema seleccionado:", sistemaSeleccionado);
                      }}
                    >
                      {sistemas?.map((sistema) => (
                        <SelectItem 
                          key={String(sistema.nombreSistemas)} 
                          value={String(sistema.nombreSistemas)}
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
                          isInvalid={
                            selectedSistema && ancho ? (
                              Number(ancho) < (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.ancho || 0) * 100 ||
                              Number(ancho) > (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.max?.ancho || Infinity) * 100
                            ) : false
                          }
                          errorMessage={
                            selectedSistema && ancho && (
                              Number(ancho) < (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.ancho || 0) * 100
                                ? `El ancho mínimo permitido es ${(abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.ancho || 0) * 100}cm`
                                : Number(ancho) > (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.max?.ancho || Infinity) * 100
                                  ? `El ancho máximo permitido es ${(abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.max?.ancho || Infinity) * 100}cm`
                                  : undefined
                            )
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
                          isInvalid={
                            selectedSistema && alto ? (
                              Number(alto) < (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.alto || 0) * 100 ||
                              Number(alto) > (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.max?.alto || Infinity) * 100
                            ) : false
                          }
                          errorMessage={
                            selectedSistema && alto && (
                              Number(alto) < (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.alto || 0) * 100
                                ? `El alto mínimo permitido es ${(abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.min?.alto || 0) * 100}cm`
                                : Number(alto) > (abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.max?.alto || Infinity) * 100
                                  ? `El alto máximo permitido es ${(abacoData[selectedSistema as keyof typeof abacoData]?.["medidas permitidas"]?.max?.alto || Infinity) * 100}cm`
                                  : undefined
                            )
                          }
                        />
                      </div>
                    </div>

                    <Select
                      label="Artículo"
                      placeholder="Seleccione un artículo"
                      selectedKeys={selectedArticulo ? [selectedArticulo] : new Set()}
                      onSelectionChange={(keys) => {
                        const articulo = Array.from(keys)[0] as string;
                        setSelectedArticulo(articulo || "");
                      }}
                    >
                      {selectedSistema && abacoData[normalizarNombreSistema(selectedSistema)]?.sistemas ? (
                        procesarSistemasUnicos(abacoData[normalizarNombreSistema(selectedSistema)].sistemas)
                          .filter(sistema => sistema !== "NINGUNO") // Filtrar "NINGUNO" si no quieres mostrarlo
                          .map((sistemaNombre) => (
                            <SelectItem key={sistemaNombre} value={sistemaNombre}>
                              {sistemaNombre}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem key="empty" value="">
                          Seleccione un sistema primero
                        </SelectItem>
                      )}
                    </Select>
                  </div>

                  {/* PARTE 2: Formulario específico del sistema */}
                  {selectedSistema && (
                    <div className="pt-4 mt-4 border-t">
                      {(() => {
                        const sistemaNormalizado = selectedSistema
                          .split('-')[0]
                          .trim()
                          .toLowerCase();
                        
                        switch (sistemaNormalizado) {
                          case "roller":
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
                          case "dubai":
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
                          case "dunes":
                          case "dunes - cortina tradicional":
                            return (
                              <DunesForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                onDetalleChange={setDetalle}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          case "fit":
                            return (
                              <FitForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                onDetalleChange={setDetalle}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          case "paneles":
                            return (
                              <PanelesForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          case "venecianas":
                            return (
                              <VenecianasForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                onDetalleChange={setDetalle}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          case "barcelona":
                            return (
                              <BarcelonaForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                ladoComando={ladoComando}
                                colorSistema={colorSistema}
                                onDetalleChange={setDetalle}
                                onLadoComandoChange={setLadoComando}
                                onColorChange={setColorSistema}
                              />
                            );
                          case "romanas":
                            return (
                              <RomanasForm
                                ancho={ancho}
                                alto={alto}
                                cantidad={cantidad}
                                selectedArticulo={selectedArticulo}
                                detalle={detalle}
                                onDetalleChange={setDetalle}
                                onPedidoDetailsChange={setSistemaPedidoDetalles}
                              />
                            );
                          default:
                            // console.log('Sistema no coincide:', selectedSistema);
                            return (
                              <div className="p-4 text-center text-gray-500">
                                Formulario para {selectedSistema} en desarrollo...
                              </div>
                            );
                        }
                      })()}
                    </div>
                  )}

                  {/* PARTE 3: Buscador de telas (siempre visible) */}
                  {selectedSistema && (
                    <TelasSearch
                      searchTela={searchTela}
                      onSearchChange={handleTelaSearch}
                      telasFiltradas={telasFiltradas as unknown as Tela[]}
                      showTelasList={showTelasList}
                      onTelaSelect={(tela: Tela) => {
                        setSelectedTela(tela);
                        setSearchTela(tela.nombre);
                        setShowTelasList(false);
                      }}
                    />
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
                              <span>${calcularPrecioTela(
                                Number(ancho),
                                Number(alto),
                                selectedTela?.precio ? Number(selectedTela.precio) : 0,
                                selectedTela?.nombre === 'ROLLER'
                              ).toLocaleString()}</span>
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
                            <span>
                              Tela ({calcularAreaTela(Number(ancho), Number(alto), selectedTela?.nombre === 'ROLLER').toFixed(2)}m²):
                              {selectedTela?.nombre !== 'ROLLER' && (
                                <span className="ml-1 text-xs text-gray-500">(Patrón direccional)</span>
                              )}
                            </span>
                            <span className="font-medium">
                              ${calcularPrecioTela(
                                Number(ancho),
                                Number(alto),
                                selectedTela?.precio ? Number(selectedTela.precio) : 0,
                                selectedTela?.nombre === 'ROLLER'
                              ).toLocaleString()}
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
                            {showManualPrecioInput ? (
                              <div className="flex gap-2 items-center">
                                <Input
                                  type="number"
                                  placeholder="Ingrese precio"
                                  size="sm"
                                  className="w-32"
                                  value={precioColocacion.toString()}
                                  onValueChange={(value) => setPrecioColocacion(Number(value))}
                                  startContent={
                                    <div className="flex items-center pointer-events-none">
                                      <span className="text-default-400 text-small">$</span>
                                    </div>
                                  }
                                />
                                <span className="w-36 text-xs font-bold text-red-500">
                                  No se encontró el precio de colocación, por favor ingrese el precio manualmente
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-600">
                                (${precioColocacion.toLocaleString()})
                              </span>
                            )}
                          </div>
                          {incluirColocacion && (
                            <span className="font-medium">${precioColocacion.toLocaleString()}</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 mt-2 border-t">
                          <span className="font-bold">Total:</span>
                          <span className="font-bold">
                            ${((Number(ancho) / 100 * 12000) + 
                               (selectedTela ? calcularPrecioTela(
                                 Number(ancho),
                                 Number(alto),
                                 selectedTela?.precio ? Number(selectedTela.precio) : 0,
                                 selectedTela?.nombre === 'ROLLER'
                               ) : 0) +
                               (incluirColocacion ? precioColocacion : 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-2 text-sm text-red-500">
                      {error}
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
                  onPress={handleSubmit}
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