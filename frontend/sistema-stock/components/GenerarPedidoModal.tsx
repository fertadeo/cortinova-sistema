import React, { useEffect, useState } from "react";
import {Modal, ModalContent,ModalHeader,ModalBody,ModalFooter,Button,Select,SelectItem,Input,Checkbox, Popover, PopoverTrigger, PopoverContent, Alert} from "@heroui/react";
import { RollerForm } from "./utils/abacos/forms/RollerForm";
import DubaiForm from "./utils/abacos/forms/DubaiForm";
import DunesForm from "./utils/abacos/forms/DunesForm";
import PanelesForm from "./utils/abacos/forms/PanelesForm";
import FitForm from "./utils/abacos/forms/FitForm";
import VenecianasForm from "./utils/abacos/forms/VenecianasForm";
import BarcelonaForm from "./utils/abacos/forms/BarcelonaForm";
import RomanasForm from "./utils/abacos/forms/RomanasForm";
import PropiosForm from "./utils/abacos/forms/PropiosForm";
import { TelasSearch } from "./utils/TelasSearch";
import { type Tela } from '@/types/telas';
import AbacoCohorteTable from "./utils/abacos/AbacoCohorteTable";


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
    "PROPIOS": "Propios",
    "TRADICIONAL": "Propios",
    "TRADICIONAL/ PROPIO": "Propios",
    // Añade más mappings según sea necesario
  };

  const tipoNormalizado = tipo.toUpperCase().trim();
  // console.log('Tipo original:', tipo);
  // console.log('Tipo normalizado:', tipoNormalizado);
  
  const tipoMapeado = sistemasMap[tipoNormalizado] || tipoNormalizado;
  // console.log('Tipo mapeado:', tipoMapeado);
  // console.log('Sistemas disponibles en abacoData:', Object.keys(abacoData));

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

// Mapeo de parámetros para cada sistema
const sistemaToApiParams: Record<string, { sistemaId: number; rubroId: number; proveedorId: number }> = {
  "bandas verticales": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "barcelona - bandas verticales": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "barcelona": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "roller": { sistemaId: 1, rubroId: 9, proveedorId: 2 },
  "dubai": { sistemaId: 6, rubroId: 9, proveedorId: 2 },
  "venecianas": { sistemaId: 4, rubroId: 9, proveedorId: 2 },
  "paneles": { sistemaId: 2, rubroId: 9, proveedorId: 2 },
  "propios": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "tradicional": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "tradicional/ propio": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  // Agrega aquí otros sistemas según corresponda
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

  // Agregar nuevos estados para rieles y barrales
  const [rielesBarrales, setRielesBarrales] = useState<Array<{
    id: number;
    nombreProducto: string;
    cantidad_stock: string;
    descripcion: string;
    precioCosto: string;
    precio: string;
    divisa: string;
    descuento: number;
    rubro_id: string;
    sistema_id: string;
    disponible: boolean;
    proveedor: {
      id: number;
      nombreProveedores: string;
    };
  }>>([]);
  const [selectedRielBarral, setSelectedRielBarral] = useState<any>(null);
  const [searchRielBarral, setSearchRielBarral] = useState("");
  const [isLoadingRielesBarrales, setIsLoadingRielesBarrales] = useState(false);
  const [showRielesBarralesList, setShowRielesBarralesList] = useState(false);

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

  // Estado para soportes intermedios
  const [soportesIntermedios, setSoportesIntermedios] = useState<any[]>([]);
  const [selectedSoporteIntermedio, setSelectedSoporteIntermedio] = useState<any>(null);

  // Buscar soportes intermedios al abrir el modal si se selecciona Roller
  useEffect(() => {
    if (isOpen && selectedSistema?.toLowerCase().includes('roller')) {
      const fetchSoportes = async () => {
        try {
          // Buscar ambos por id
          const resCorto = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/148`);
          const resLargo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/149`);
          const dataCorto = await resCorto.json();
          const dataLargo = await resLargo.json();
          setSoportesIntermedios([
            { id: dataCorto.id, nombre: 'CORTO/INTERMEDIO', precio: dataCorto.precio },
            { id: dataLargo.id, nombre: 'LARGO/INTERMEDIO', precio: dataLargo.precio }
          ]);
          setSelectedSoporteIntermedio({ id: dataCorto.id, nombre: 'CORTO/INTERMEDIO', precio: dataCorto.precio });
        } catch (e) {
          setSoportesIntermedios([]);
          setSelectedSoporteIntermedio(null);
        }
      };
      fetchSoportes();
    }
  }, [isOpen, selectedSistema]);

  // Cuando se tilda soporte intermedio, seleccionar por defecto el corto
  useEffect(() => {
    if (soporteIntermedio && soportesIntermedios.length > 0 && !selectedSoporteIntermedio) {
      setSelectedSoporteIntermedio(soportesIntermedios[0]);
    }
    if (!soporteIntermedio) {
      setSelectedSoporteIntermedio(null);
    }
  }, [soporteIntermedio, soportesIntermedios]);

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
    setSearchRielBarral("");
    setRielesBarrales([]);
    setSelectedRielBarral(null);
    setShowRielesBarralesList(false);
  };

  // Actualizar la función canProceedToNextStep
  const canProceedToNextStep = () => {
    if (!selectedSistema) return false;
    if (!cantidad || Number(cantidad) <= 0) return false;
    if (!ancho || Number(ancho) <= 0) return false;
    if (!alto || Number(alto) <= 0) return false;

    // Para todos los sistemas, requerimos artículo
    if (!selectedArticulo) return false;

    // Para todos los sistemas, requerimos un producto específico seleccionado
    if (!selectedRielBarral || !selectedRielBarral.precio) return false;

    // Para todos los sistemas excepto Venecianas, requerimos tela
    if (!selectedSistema.toLowerCase().includes('veneciana') && !selectedTela) return false;

    // Verificar si hay sistema disponible para las medidas
    const anchoMetros = Number(ancho) / 100;
    const altoMetros = Number(alto) / 100;
    const sistemasDisponibles = abacoData[selectedSistema as keyof typeof abacoData]?.sistemas;

    // Si no hay sistemas disponibles en el ábaco, permitir continuar (validación mínima)
    if (!sistemasDisponibles || sistemasDisponibles.length === 0) {
      return true;
    }

    // Si hay sistemas en el ábaco, verificar que las medidas sean válidas
    return sistemasDisponibles.some(
      (sistema: { ancho: number; alto: number }) => sistema.ancho >= anchoMetros && sistema.alto >= altoMetros
    );
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

  // Actualizar la función handleTelaSearch para usar el endpoint dinámico
  const handleTelaSearch = async (value: string) => {
    console.log('🔍 [TELAS] Iniciando búsqueda de telas...');
    console.log('🔍 [TELAS] Valor buscado:', value);
    console.log('🔍 [TELAS] Sistema seleccionado:', selectedSistema);
    
    setSearchTela(value);
    setShowTelasList(true);

    if (!value.trim()) {
      console.log('🔍 [TELAS] Valor vacío, limpiando resultados');
      setTelasFiltradas([]);
      setShowTelasList(false);
      return;
    }

    try {
      // Usar el endpoint dinámico para telas según el sistema seleccionado
      const sistemaKey = selectedSistema?.toLowerCase();
      console.log('🔍 [TELAS] Sistema key:', sistemaKey);
      
      if (!sistemaKey || !sistemaToApiParams[sistemaKey]) {
        console.log('[DEBUG] No sistema seleccionado para búsqueda de telas:', selectedSistema);
        console.log('[DEBUG] SistemaToApiParams disponibles:', Object.keys(sistemaToApiParams));
        setTelasFiltradas([]);
        return;
      }

      const { sistemaId, rubroId, proveedorId } = sistemaToApiParams[sistemaKey];
      console.log('🔍 [TELAS] Parámetros del sistema:', { sistemaId, rubroId, proveedorId });
      
      // Endpoint dinámico para telas del sistema seleccionado
      const url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${encodeURIComponent(value)}`;
      
      console.log('🔍 [TELAS] URL completa:', url);
      console.log('🔍 [TELAS] Base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(url);
      console.log('🔍 [TELAS] Status de la respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al buscar telas');
      }
      
      const data = await response.json();
      console.log('🔍 [TELAS] Respuesta completa:', data);
      console.log('🔍 [TELAS] Cantidad de resultados:', data.data?.length || 0);
      
      // Formatear las telas para que coincidan con la interfaz Tela
      const telasFormateadas = Array.isArray(data.data) ? data.data.map((tela: any) => ({
        id: tela.id,
        nombre: tela.nombreProducto || tela.nombre,
        tipo: tela.descripcion || tela.tipo || '',
        color: tela.color || '',
        precio: tela.precio ? Number(tela.precio).toString() : '0'
      })) : [];
      
      console.log('🔍 [TELAS] Telas formateadas:', telasFormateadas);
      setTelasFiltradas(telasFormateadas);
    } catch (error) {
      console.error('❌ [TELAS] Error al buscar telas:', error);
      setTelasFiltradas([]);
    }
  };

  // Buscar el producto correspondiente al sistema seleccionado
  const productoSistema = sistemas.find(s => String(s.nombreSistemas) === selectedSistema);

  // Calcular precio del sistema
  const calcularPrecioSistema = () => {
    if (!ancho || !alto) return 0;
    
    const anchoMetros = Number(ancho) / 100;
    const altoMetros = Number(alto) / 100;
    
    // Solo calcular precio si hay un producto específico seleccionado
    if (!selectedRielBarral || !selectedRielBarral.precio) {
      console.log('⚠️ No hay producto seleccionado, no se puede calcular precio del sistema');
      return 0;
    }
    
    const precioBase = Number(selectedRielBarral.precio);
    console.log('🎯 Usando precio del producto seleccionado:', precioBase);
    
    // Para Roller y Veneciana, calcular por área (ancho × alto)
    if (selectedSistema?.toLowerCase().includes('roller') || selectedSistema?.toLowerCase().includes('veneciana')) {
      const precioCalculado = precioBase * anchoMetros * altoMetros;
      console.log('🏗️ Cálculo por m² (Roller/Veneciana):', {
        sistema: selectedSistema,
        precioBase: precioBase,
        anchoMetros: anchoMetros,
        altoMetros: altoMetros,
        area: anchoMetros * altoMetros,
        precioCalculado: precioCalculado
      });
      return precioCalculado;
    }
    
    // Para otros sistemas, calcular por metro lineal (ancho)
    const precioCalculado = precioBase * anchoMetros;
    console.log('📏 Cálculo por metro lineal:', {
      sistema: selectedSistema,
      precioBase: precioBase,
      anchoMetros: anchoMetros,
      precioCalculado: precioCalculado
    });
    return precioCalculado;
  };

  const nuevoPrecioSistema = calcularPrecioSistema();

  // Calcular precio total
  const calcularPrecioTotal = () => {
    if (!ancho || !alto || !cantidad || !selectedTela) return 0;

    const anchoMetros = Number(ancho) / 100;
    // Usar el precio del producto correspondiente
    const nuevoPrecioSistema = calcularPrecioSistema();

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
          console.error('El producto no corresponde a colocación');
          return;
        }

        const precio = Number(data.precio);
        if (!isNaN(precio)) {
          setPrecioColocacion(precio);
        }

      } catch (error) {
        console.error('Error al obtener precio de colocación:', error);
      }
    };

    fetchPrecioColocacion();
  }, []);

  // useEffect para recalcular precio del sistema cuando cambien ancho o alto
  useEffect(() => {
    if (selectedSistema && ancho && alto) {
      console.log('🔄 Recalculando precio del sistema:', {
        sistema: selectedSistema,
        ancho: ancho,
        alto: alto,
        esVeneciana: selectedSistema.toLowerCase().includes('veneciana')
      });
      
      const nuevoPrecioSistema = calcularPrecioSistema();
      console.log('💰 Nuevo precio del sistema:', nuevoPrecioSistema);
      setPrecioSistema(nuevoPrecioSistema);
      
      // Si hay tela seleccionada y no es Veneciana, recalcular precio de tela también
      if (selectedTela && !selectedSistema.toLowerCase().includes('veneciana')) {
        const nuevoPrecioTela = calcularPrecioTela(
          Number(ancho),
          Number(alto),
          selectedTela?.precio ? Number(selectedTela.precio) : 0,
          selectedTela?.nombre === 'ROLLER'
        );
        setPrecioTela(nuevoPrecioTela);
      }
    }
  }, [ancho, alto, selectedSistema, selectedTela]);

  // Limpia todos los campos menos ancho y alto
  const resetCamposSistema = () => {
    setSelectedArticulo("");
    setSelectedRielBarral(null);
    setSearchRielBarral("");
    setShowRielesBarralesList(false);
    setRielesBarrales([]);
    setSelectedTela(null);
    setSearchTela("");
    setTelasFiltradas([]);
    setShowTelasList(false);
    setDetalle("");
    setCaidaPorDelante(false);
    setColorSistema("");
    setLadoComando("");
    setTipoTela("");
    setSoporteIntermedio(false);
    setSoporteDoble(false);
    setSelectedSoporteIntermedio(null);
    setSistemaRecomendado("");
    setPedidoJSON("");
    setError("");
    // Puedes agregar aquí cualquier otro estado que deba limpiarse
  };

  const handleSubmit = () => {
    // Calcular el precio unitario según la lógica del resumen
    let precioUnitario = 0;
    if (selectedRielBarral && selectedRielBarral.precio) {
      console.log('selectedRielBarral:', selectedRielBarral, 'selectedSistema:', selectedSistema);
      if (selectedSistema?.toLowerCase().includes('veneciana')) {
        if (Number(ancho) > 0 && Number(alto) > 0) {
          console.log('Precio base del producto (selectedRielBarral.precio):', selectedRielBarral.precio);
          precioUnitario = (Number(ancho) / 100) * (Number(alto) / 100) * Number(selectedRielBarral.precio);
        } else {
          precioUnitario = 0;
        }
      } else {
        precioUnitario = (Number(ancho) / 100) * Number(selectedRielBarral.precio);
      }
    } else {
      console.log('⚠️ No hay producto seleccionado, precio unitario será 0');
      precioUnitario = 0;
    }
    // Sumar tela, soporte intermedio y colocación al total (no incluir tela para Veneciana)
    const precioTelaTotal = (selectedTela && !selectedSistema.toLowerCase().includes('veneciana')) ? calcularPrecioTela(
      Number(ancho),
      Number(alto),
      selectedTela?.precio ? Number(selectedTela.precio) : 0,
      selectedTela?.nombre === 'ROLLER'
    ) : 0;
    const soporteIntermedioTotal = selectedSoporteIntermedio ? Number(selectedSoporteIntermedio.precio) : 0;
    const colocacionTotal = incluirColocacion ? precioColocacion : 0;
    const cantidadNum = Number(cantidad) || 1;
    // El precio unitario debe incluir todos los extras
    const precioUnitarioCompleto = precioUnitario + precioTelaTotal + soporteIntermedioTotal + colocacionTotal;
    const precioTotal = precioUnitarioCompleto * cantidadNum;

    const pedido = {
      sistema: selectedSistema,
      detalles: {
        cantidad: parseFloat(cantidad),
        ancho: Number(ancho),
        alto: Number(alto),
        sistemaRecomendado,
        articuloSeleccionado: selectedArticulo,
        tela: selectedSistema.toLowerCase().includes('veneciana') ? null : selectedTela,
        caidaPorDelante,
        colorSistema,
        ladoComando,
        tipoTela,
        soporteIntermedio,
        soporteDoble,
        detalle,
        incluirColocacion,
        precioColocacion: incluirColocacion ? precioColocacion : 0,
        soporteIntermedioTipo: selectedSoporteIntermedio,
        accesorios: [
          selectedSoporteIntermedio ? {
            nombre: selectedSoporteIntermedio.nombre,
            precio: selectedSoporteIntermedio.precio
          } : null
          // Aquí puedes agregar otros accesorios según el sistema
        ].filter(Boolean)
      },
      fecha: new Date().toISOString(),
      precioUnitario: precioUnitarioCompleto,
      precioTotal: precioTotal,
      medidaId: medidasPrecargadas?.medidaId,
      incluirColocacion,
      precioColocacion
    };
    onPedidoCreated(pedido);
    onOpenChange(false);
  };

  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);
  const [loadingProductosFiltrados, setLoadingProductosFiltrados] = useState(false);

  // Consultar productos filtrados cuando cambia el sistema
  useEffect(() => {
    const fetchProductosFiltrados = async () => {
      const sistemaKey = selectedSistema?.toLowerCase();
      if (sistemaKey && sistemaToApiParams[sistemaKey]) {
        setLoadingProductosFiltrados(true);
        const { sistemaId, rubroId, proveedorId } = sistemaToApiParams[sistemaKey];
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}`);
          const data = await res.json();
          console.log('Respuesta productos-filtrados:', data);
          setProductosFiltrados(data);
        } catch (e) {
          setProductosFiltrados([]);
        } finally {
          setLoadingProductosFiltrados(false);
        }
      } else {
        setProductosFiltrados([]);
        console.log('[DEBUG] No se ejecuta fetch: selectedSistema=', selectedSistema, 'key usado:', sistemaKey);
      }
    };
    fetchProductosFiltrados();
  }, [selectedSistema]);

  const handleBuscarProducto = async (value: string) => {
    console.log('[DEBUG] handleBuscarProducto called with:', value, selectedSistema);
    setSearchRielBarral(value);
    setShowRielesBarralesList(true);
    const sistemaKey = selectedSistema?.toLowerCase();
    if (!sistemaKey || !sistemaToApiParams[sistemaKey] || !value.trim()) {
      console.log('[DEBUG] No sistema seleccionado o no hay mapeo o valor vacío', selectedSistema, 'key usado:', sistemaKey, value);
      setRielesBarrales([]);
      setShowRielesBarralesList(false);
      return;
    }
    const { sistemaId, rubroId, proveedorId } = sistemaToApiParams[sistemaKey];
    const url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${encodeURIComponent(value)}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`[Busqueda Sistema] Input: "${value}" | Ruta: ${url} | Respuesta:`, data);
    console.log('[PRODUCTOS OBTENIDOS] Productos encontrados:', data);
    setRielesBarrales(Array.isArray(data.data) ? data.data : []);
    setShowTelasList(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowRielesBarralesList(false);
    }
  };

  // Justo después de los useState existentes
  const [showCambioSistema, setShowCambioSistema] = useState(false);
  const [nombreSistemaCambio, setNombreSistemaCambio] = useState("");

  // Justo antes del return principal de GenerarPedidoModal
  const sugerenciasFiltradas = rielesBarrales.filter(item =>
    item.nombreProducto.toLowerCase().includes(searchRielBarral.toLowerCase()) ||
    (item.descripcion && item.descripcion.toLowerCase().includes(searchRielBarral.toLowerCase()))
  );

  useEffect(() => {
    if (selectedRielBarral) {
      setSoporteDoble(selectedRielBarral.detalles?.soporteDoble || false);
      
      // Recalcular precio del sistema cuando se selecciona un producto
      if (selectedSistema && ancho && alto) {
        console.log('🎯 Producto seleccionado:', {
          producto: selectedRielBarral.nombreProducto,
          precio: selectedRielBarral.precio,
          sistema: selectedSistema,
          ancho: ancho,
          alto: alto
        });
        
        const nuevoPrecioSistema = calcularPrecioSistema();
        setPrecioSistema(nuevoPrecioSistema);
      }
    }
  }, [selectedRielBarral, selectedSistema, ancho, alto]);


  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      hideCloseButton={false}
      isDismissable={false}
      shouldBlockScroll={true}
    >
      <ModalContent className="max-h-[90vh] rounded-lg h-98">
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
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select
                          label="Seleccionar Sistema"
                          placeholder="Elegir un sistema"
                          selectedKeys={selectedSistema ? [selectedSistema] : []}
                          onSelectionChange={(keys) => {
                            const sistemaSeleccionado = Array.from(keys)[0] as string;
                            setSelectedSistema(sistemaSeleccionado);
                            resetCamposSistema();
                            setSelectedTela(null);
                            setSearchTela("");
                            setShowTelasList(false);
                            setNombreSistemaCambio(sistemaSeleccionado);
                            setShowCambioSistema(true);
                            setTimeout(() => setShowCambioSistema(false), 2500);
                            console.log("Sistema seleccionado:", sistemaSeleccionado);
                          }}
                          disallowEmptySelection={false}
                          selectionMode="single"
                          className="w-full"
                          onClose={() => {
                            // Prevenir el cierre del modal
                            return false;
                          }}
                        >
                          {sistemas?.map((sistema) => (
                            <SelectItem 
                              key={String(sistema.nombreSistemas)}
                              textValue={String(sistema.nombreSistemas)}
                            >
                              {sistema.nombreSistemas} 
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      <Popover placement="bottom" color="foreground">
                        <PopoverTrigger>
                          <Button
                            color="default"
                            variant="bordered"
                            className="h-12"
                          >
                            Consultar Ábaco de Medidas
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="px-1 py-2">
                            <div className="font-bold text-small">Aún estamos desarrollando esto!</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

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

                    {selectedArticulo && (
                      <Alert color="primary" className="my-2 flex items-center">
                        <span>Artículo recomendado: <b className="ml-1">{selectedArticulo}</b></span>
                      </Alert>
                    )}

                    {/* Input de rieles y barrales debajo del select de artículo */}
                    <div className="mt-4">
                      <Input
                        label="Agregar Producto"
                        placeholder="Buscar por nombre o ID..."
                        value={searchRielBarral}
                        onValueChange={handleBuscarProducto}
                        onKeyDown={handleKeyDown}
                        size="sm"
                        startContent={
                          <div className="flex items-center pointer-events-none">
                            <span className="text-default-400 text-small">🔍</span>
                          </div>
                        }
                        endContent={
                          selectedRielBarral && (
                            <button
                              type="button"
                              className="px-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                              aria-label="Quitar producto"
                              onClick={() => {
                                setSelectedRielBarral(null);
                                setSearchRielBarral("");
                                setShowRielesBarralesList(false);
                              }}
                            >
                              ×
                            </button>
                          )
                        }
                      />
                      {showRielesBarralesList && searchRielBarral.length > 1 && (
                        sugerenciasFiltradas.length > 0 ? (
                          <div className="overflow-y-auto mt-2 max-h-48 rounded-lg border bg-gray-100 z-[1050] relative">
                            {sugerenciasFiltradas.map(item => (
                              <button
                                key={item.id}
                                className="p-2 w-full text-left border-b cursor-pointer hover:bg-gray-200 last:border-b-0"
                                onClick={() => {
                                  setSelectedRielBarral(item);
                                  setShowRielesBarralesList(false);
                                  setSearchRielBarral(item.nombreProducto);
                                  console.log('[PRODUCTO SELECCIONADO]', item);
                                  setShowTelasList(false);
                                }}
                                role="option"
                                aria-selected={selectedRielBarral?.id === item.id}
                              >
                                <div className="font-medium">{item.nombreProducto}</div>
                                <div className="text-sm text-gray-600">
                                  {item.descripcion && <span className="text-gray-500">{item.descripcion}</span>}
                                  {item.precio && <span className="ml-2">Precio: ${item.precio}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 max-h-48 rounded-lg border bg-gray-100 z-[1050] relative flex items-center justify-center p-4 text-gray-500">
                            Sin resultados
                          </div>
                        )
                      )}
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
                                  soporteIntermedioTipo={selectedSoporteIntermedio}
                                  soportesIntermedios={soportesIntermedios}
                                  onSoporteIntermedioTipoChange={setSelectedSoporteIntermedio}
                                  productosFiltrados={productosFiltrados}
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
                                  productosFiltrados={productosFiltrados}
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
                            case "propios":
                            case "tradicional":
                            case "tradicional/ propio":
                              return (
                                <PropiosForm
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

                    {/* PARTE 3: Buscador de telas (no visible para Veneciana) */}
                    {selectedSistema && !selectedSistema.toLowerCase().includes('veneciana') && (
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
                                <span>{selectedTela ? `${selectedTela.nombre} - $${Number(selectedTela.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}</span>
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
                      <div className="sticky bottom-0 z-30 p-4 mt-4 bg-white rounded-t-lg border-t shadow">
                        <h3 className="mb-3 text-lg font-semibold">Resumen de Precios</h3>
                        <div className="space-y-2">
                          {selectedSistema.toLowerCase().includes('veneciana') ? (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="flex gap-2 items-center">
                                  {selectedRielBarral?.nombreProducto || selectedSistema.toUpperCase()} ({ancho}cm x {alto}cm)
                                </span>
                                <span className="font-medium">
                                  ${((calcularPrecioSistema() || 0) * Number(cantidad || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Fórmula: (ancho/100) × (alto/100) × precio base × cantidad</span>
                                <span>
                                  ({Number(ancho)/100} × {Number(alto)/100} × {selectedRielBarral?.precio || 0} × {cantidad})
                                </span>
                              </div>
                            </>
                          ) : selectedRielBarral ? (
                            <div className="flex justify-between items-center">
                              <span className="flex gap-2 items-center">
                                {selectedRielBarral.nombreProducto} ({ancho}cm){Number(cantidad) > 1 ? ` x${cantidad}` : ''}
                                <button
                                  type="button"
                                  className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                  aria-label="Quitar riel/barral"
                                  onClick={() => {
                                    setSelectedRielBarral(null);
                                    setSearchRielBarral("");
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                              <span className="font-medium">
                                ${((Number(ancho) / 100) * Number(selectedRielBarral.precio) * Number(cantidad)).toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span>
                                {selectedSistema.toLowerCase().includes('veneciana')
                                  ? `Sistema (${ancho}cm × ${alto}cm):`
                                  : `Sistema (${ancho}cm):`}
                              </span>
                              <span className="font-medium text-gray-500">
                                Seleccione un producto para ver el precio
                              </span>
                            </div>
                          )}

                          {selectedTela && !selectedSistema.toLowerCase().includes('veneciana') && (
                            <div className="flex justify-between items-center">
                              <span>
                                {selectedTela.nombre} - ${Number(selectedTela.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({ancho}cm x {alto}cm){Number(cantidad) > 1 ? ` x${cantidad}` : ''}
                              </span>
                              <span className="font-medium">
                                ${(
                                  calcularPrecioTela(
                                    Number(ancho),
                                    Number(alto),
                                    selectedTela?.precio ? Number(selectedTela.precio) : 0,
                                    selectedTela?.nombre === 'ROLLER'
                                  ) * Number(cantidad || 1)
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {selectedSoporteIntermedio && (
                            <div className="flex justify-between items-center">
                              <span>Soporte Intermedio ({selectedSoporteIntermedio.nombre}):</span>
                              <span className="font-medium">
                                ${Number(selectedSoporteIntermedio?.precio || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                              {incluirColocacion && (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="number"
                                    placeholder="Precio de colocación"
                                    size="sm"
                                    className="w-32"
                                    value={precioColocacion.toString()}
                                    onValueChange={(value) => setPrecioColocacion(Number(value) || 0)}
                                    startContent={
                                      <div className="flex items-center pointer-events-none">
                                        <span className="text-default-400 text-small">$</span>
                                      </div>
                                    }
                                  />
                                 
                                </div>
                              )}
                            </div>
                            {incluirColocacion && (
                              <span className="font-medium">${precioColocacion.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center pt-3 mt-2 border-t">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold">
                              ${(
                                selectedSistema.toLowerCase().includes('veneciana')
                                  ? (selectedRielBarral ? (Number(ancho) / 100) * (Number(alto) / 100) * Number(selectedRielBarral.precio) * Number(cantidad) : 0) + (incluirColocacion ? precioColocacion : 0)
                                  : (selectedRielBarral
                                      ? (Number(ancho) / 100) * Number(selectedRielBarral.precio) * Number(cantidad)
                                      : 0
                                    ) +
                                    ((selectedTela && !selectedSistema.toLowerCase().includes('veneciana')) ? calcularPrecioTela(
                                      Number(ancho),
                                      Number(alto),
                                      selectedTela?.precio ? Number(selectedTela.precio) : 0,
                                      selectedTela?.nombre === 'ROLLER'
                                    ) : 0) +
                                    (selectedSoporteIntermedio ? Number(selectedSoporteIntermedio.precio) : 0) +
                                    (incluirColocacion ? precioColocacion : 0)
                              ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                </div>
              </ModalBody>
              <ModalFooter className="sticky bottom-0 z-20 bg-white rounded-b-lg border-t">
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isDisabled={!canProceedToNextStep()}
                >
                  Generar Pedido
                </Button>
              </ModalFooter>
            </>
          );
        }}
      </ModalContent>
      {/* Overlay de cambio de sistema */}
      {showCambioSistema && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem 3rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '1.3rem',
            fontWeight: 500,
          }}>
            <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#1976d2" strokeWidth="4" strokeLinecap="round"/></svg>
            Cambiando a sistema <span style={{color:'#1976d2'}}>{nombreSistemaCambio}</span>...
          </div>
        </div>
      )}
    </Modal>
  );
}