import React, { useEffect, useState } from "react";
import {Modal, ModalContent,ModalHeader,ModalBody,ModalFooter,Button,Select,SelectItem,Input,Checkbox, Alert} from "@heroui/react";
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
  onPedidoCreated: (pedido: any, editingItemId?: number) => void;
  medidasPrecargadas?: {
    ancho: number;
    alto: number;
    cantidad: number;
    ubicacion: string;
    ubicacionPersonalizada?: string;
    medidaId: number;
  };
  itemToEdit?: {
    id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
    espacio?: string;
    detalles?: any;
  } | null;
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

// Función helper para extraer el nombre del sistema eliminando "Cortina" si está presente
const extraerNombreSistema = (nombre: string): string => {
  // Eliminar "Cortina" del inicio del nombre (case insensitive)
  const nombreLimpio = nombre.replace(/^cortina\s+/i, '').trim();
  return nombreLimpio;
};

// Función helper para buscar sistema por nombre, manejando variaciones con "Cortina"
const buscarSistemaPorNombre = (sistemaBuscado: string, sistemas: Sistema[]): Sistema | null => {
  // Normalizar el nombre buscado: eliminar "Cortina" si está presente
  const sistemaNormalizado = extraerNombreSistema(sistemaBuscado);
  const sistemaBuscadoLower = sistemaNormalizado.toLowerCase();
  
  // Intentar encontrar el sistema exacto primero
  let sistemaEncontrado = sistemas.find(s => {
    const nombreSistema = String(s.nombreSistemas).toLowerCase();
    return nombreSistema === sistemaBuscadoLower;
  });
  
  // Si no se encuentra exacto, buscar por coincidencia parcial
  if (!sistemaEncontrado) {
    sistemaEncontrado = sistemas.find(s => {
      const nombreSistema = String(s.nombreSistemas).toLowerCase();
      // Buscar si el sistema normalizado está contenido en el nombre del sistema
      // o viceversa (por ejemplo "Roller" vs "ROLLER" o "BARCELONA - BANDAS VERTICALES")
      return nombreSistema.includes(sistemaBuscadoLower) || 
             sistemaBuscadoLower.includes(nombreSistema) ||
             nombreSistema.split(' - ')[0] === sistemaBuscadoLower ||
             sistemaBuscadoLower.split(' - ')[0] === nombreSistema.split(' - ')[0];
    });
  }
  
  return sistemaEncontrado || null;
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

// Función para calcular el área de tela necesaria con mínimos específicos por sistema
const calcularAreaTela = (ancho: number, alto: number, telaRotable: boolean = true, sistema?: string): number => {
  // Convertir cm a metros
  const anchoMetros = Number(ancho) / 100;
  const altoMetros = Number(alto) / 100;
  
  let area: number;
  
  if (telaRotable) {
    // Para telas que se pueden rotar, usamos el área mínima posible
    area = Math.min(anchoMetros, altoMetros) * Math.max(anchoMetros, altoMetros);
  } else {
    // Para telas con patrón direccional, respetamos las dimensiones originales
    area = anchoMetros * altoMetros;
  }
  
  // Aplicar mínimos específicos por sistema
  if (sistema) {
    const sistemaLower = sistema.toLowerCase();
    if (sistemaLower.includes('roller')) {
      // Roller: mínimo 1 metro cuadrado
      return Math.max(area, 1.0);
    } else if (sistemaLower.includes('barcelona') || sistemaLower.includes('bandas verticales')) {
      // Bandas verticales: mínimo 1.5 metros cuadrados
      return Math.max(area, 1.5);
    }
  }
  
  // Otros sistemas: sin mínimo
  return area;
};

// Función helper para procesar los sistemas únicos con su garantía

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

// Mapeo de parámetros para cada sistema (usado para telas)
const sistemaToApiParams: Record<string, { sistemaId: number; rubroId: number; proveedorId: number }> = {
  "bandas verticales": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "barcelona - bandas verticales": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "barcelona": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "roller": { sistemaId: 1, rubroId: 9, proveedorId: 2 },
  "dubai": { sistemaId: 6, rubroId: 9, proveedorId: 2 },
  "venecianas": { sistemaId: 4, rubroId: 9, proveedorId: 2 },
  // Paneles usa sistemaId: 1 (mismo que Roller) para mostrar las mismas telas que Roller
  "paneles": { sistemaId: 1, rubroId: 9, proveedorId: 2 },
  "propios": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "tradicional": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "tradicional/ propio": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "riel": { sistemaId: 10, rubroId: 5, proveedorId: 7 },
  "barral": { sistemaId: 10, rubroId: 6, proveedorId: 8 },
  // Agrega aquí otros sistemas según corresponda
};

// Mapeo de parámetros para productos/sistemas/soportes (campo "Agregar Producto")
// Paneles usa sistemaId: 2 para mostrar sistemas/soportes (no telas)
const sistemaToApiParamsProductos: Record<string, { sistemaId: number; rubroId: number; proveedorId: number }> = {
  "bandas verticales": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "barcelona - bandas verticales": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "barcelona": { sistemaId: 5, rubroId: 9, proveedorId: 2 },
  "roller": { sistemaId: 1, rubroId: 9, proveedorId: 2 },
  "dubai": { sistemaId: 6, rubroId: 9, proveedorId: 2 },
  "venecianas": { sistemaId: 4, rubroId: 9, proveedorId: 2 },
  // Paneles usa sistemaId: 2 para buscar productos/sistemas/soportes (no telas)
  "paneles": { sistemaId: 2, rubroId: 9, proveedorId: 2 },
  "propios": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "tradicional": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "tradicional/ propio": { sistemaId: 7, rubroId: 9, proveedorId: 2 },
  "riel": { sistemaId: 10, rubroId: 5, proveedorId: 7 },
  "barral": { sistemaId: 10, rubroId: 6, proveedorId: 8 },
  // Agrega aquí otros sistemas según corresponda
};

export default function GenerarPedidoModal({
  isOpen,
  onOpenChange,
  selectedClient,
  productos,
  total,
  onPedidoCreated,
  medidasPrecargadas,
  itemToEdit
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

  // Estado para controlar cuándo se pueden precargar los campos después del sistema
  const [sistemaCargado, setSistemaCargado] = useState(false);

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

  // Estados para la segunda tela (solo para cortinas tradicionales)
  const [searchTela2, setSearchTela2] = useState("");
  const [telasFiltradas2, setTelasFiltradas2] = useState<Array<{
    id: number;
    nombre: string;
    tipo: string;
    color: string;
    precio: number;
  }>>([]);
  const [selectedTela2, setSelectedTela2] = useState<Tela | null>(null);
  const [showTelasList2, setShowTelasList2] = useState(false);
  const [multiplicadorTela2, setMultiplicadorTela2] = useState(1);
  const [cantidadTelaManual2, setCantidadTelaManual2] = useState<number | null>(null);

  // Estados para el segundo cabezal
  const [segundosCabezales, setSegundosCabezales] = useState<Array<{
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
  const [selectedSegundoCabezal, setSelectedSegundoCabezal] = useState<any>(null);
  const [searchSegundoCabezal, setSearchSegundoCabezal] = useState("");
  const [showSegundosCabezalesList, setShowSegundosCabezalesList] = useState(false);

  // Define state to hold calculated prices
  const [precioSistema, setPrecioSistema] = useState(0);
  const [precioTela, setPrecioTela] = useState(0);
  const [precioTela2, setPrecioTela2] = useState(0);
  const [precioSegundoCabezal, setPrecioSegundoCabezal] = useState(0);

  // Agregar este estado
  const [incluirColocacion, setIncluirColocacion] = useState(true);

  // Estado para el redondeo de precios
  const [aplicarRedondeo, setAplicarRedondeo] = useState(false);

  // Nuevo estado para manejar los detalles específicos del sistema
  const [sistemaPedidoDetalles, setSistemaPedidoDetalles] = useState<any>(null);

  // Agregar estado para manejar errores
  const [error, setError] = useState("");
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  // Estado para el modal de confirmación de cierre
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  // Agregar nuevo estado para el precio de colocación
  const [precioColocacion, setPrecioColocacion] = useState<number>(0);

  const [accesoriosAdicionales, setAccesoriosAdicionales] = useState<any[]>([]);

  // Estado para el multiplicador de tela
  const [multiplicadorTelaLocal, setMultiplicadorTelaLocal] = useState(1);

  // Inicializar los estados con las medidas precargadas si existen
  const [ancho, setAncho] = useState(medidasPrecargadas?.ancho?.toString() || '');
  const [alto, setAlto] = useState(medidasPrecargadas?.alto?.toString() || '');
  const [cantidad, setCantidad] = useState(medidasPrecargadas?.cantidad?.toString() || '1');
  
  // Agregar estado para el espacio
  const [espacio, setEspacio] = useState(medidasPrecargadas?.ubicacion || "");
  
  // Estado para espacio personalizado cuando se selecciona "Otro"
  const [espacioPersonalizado, setEspacioPersonalizado] = useState(medidasPrecargadas?.ubicacionPersonalizada || "");

  // Lista de espacios predefinidos (reutilizar las mismas opciones que en medidas)
  const ESPACIOS = ["Comedor", "Cocina", "Dormitorio", "Living", "Baño", "Oficina", "Garage", "Galeria", "Otro"];
  
  // Event listener para ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  // Actualizar los valores cuando cambian las medidas precargadas
  useEffect(() => {
    if (medidasPrecargadas) {
      setAncho(medidasPrecargadas.ancho.toString());
      setAlto(medidasPrecargadas.alto.toString());
      setCantidad(medidasPrecargadas.cantidad.toString());
      setEspacio(medidasPrecargadas.ubicacion || "");
      setEspacioPersonalizado(medidasPrecargadas.ubicacionPersonalizada || "");
      // También podemos precargar otros campos si es necesario
    }
  }, [medidasPrecargadas]);

  // EFECTO 1: Precargar datos básicos y establecer el sistema
  // Este efecto precarga datos que no dependen del sistema (medidas, cantidad, espacio)
  // y establece el sistema, lo que dispara la carga de productos filtrados
  useEffect(() => {
    if (itemToEdit && isOpen && sistemas.length > 0) {
      console.log('🔄 Precargando datos básicos del item a editar:', itemToEdit);
      
      // Resetear el flag cuando empieza la precarga
      setSistemaCargado(false);
      
      // Precargar medidas básicas primero (no dependen del sistema)
      if (itemToEdit.detalles?.ancho) {
        setAncho(itemToEdit.detalles.ancho.toString());
      }
      if (itemToEdit.detalles?.alto) {
        setAlto(itemToEdit.detalles.alto.toString());
      }
      
      // Precargar cantidad
      setCantidad(itemToEdit.quantity.toString());
      
      // Precargar espacio
      if (itemToEdit.espacio) {
        setEspacio(itemToEdit.espacio);
        const espaciosPredefinidos = ["Comedor", "Cocina", "Dormitorio", "Living", "Baño", "Oficina", "Garage", "Galeria", "Otro"];
        if (!espaciosPredefinidos.includes(itemToEdit.espacio)) {
          setEspacio("Otro");
          setEspacioPersonalizado(itemToEdit.espacio);
        }
      }
      
      // Establecer sistema PRIMERO - esto dispara la carga de productos filtrados
      // Buscar el sistema por ID primero (más confiable), luego por nombre como fallback
      let sistemaEncontrado: Sistema | null = null;
      let sistemaParaSeleccionar: string | null = null;
      
      if (itemToEdit.detalles?.sistemaId) {
        // Buscar sistema por ID (más confiable y preciso)
        sistemaEncontrado = sistemas.find(s => {
          const sistemaIdGuardado = Number(itemToEdit.detalles.sistemaId);
          const sistemaIdActual = typeof s.id === 'number' ? s.id : Number(s.id);
          return sistemaIdActual === sistemaIdGuardado;
        }) || null;
        
        if (sistemaEncontrado) {
          sistemaParaSeleccionar = String(sistemaEncontrado.nombreSistemas);
          console.log('✅ Sistema establecido por ID:', sistemaParaSeleccionar, 'ID:', sistemaEncontrado.id);
        } else {
          console.warn('⚠️ Sistema no encontrado por ID:', itemToEdit.detalles.sistemaId, 'intentando por nombre...');
        }
      }
      
      // Si no se encontró por ID, intentar por nombre desde detalles.sistema
      if (!sistemaEncontrado && itemToEdit.detalles?.sistema) {
        const sistemaGuardado = itemToEdit.detalles.sistema;
        console.log('🔍 Buscando sistema por nombre desde detalles.sistema:', sistemaGuardado);
        sistemaEncontrado = buscarSistemaPorNombre(sistemaGuardado, sistemas);
        
        if (sistemaEncontrado) {
          sistemaParaSeleccionar = String(sistemaEncontrado.nombreSistemas);
          console.log('✅ Sistema establecido por nombre (detalles.sistema):', sistemaParaSeleccionar, 'ID:', sistemaEncontrado.id);
        }
      }
      
      // Si aún no se encontró, intentar extraer desde itemToEdit.name (que puede tener "Cortina ROLLER")
      if (!sistemaEncontrado && itemToEdit.name) {
        const sistemaDesdeNombre = extraerNombreSistema(itemToEdit.name);
        console.log('🔍 Buscando sistema por nombre desde item.name:', itemToEdit.name, '-> extraído:', sistemaDesdeNombre);
        sistemaEncontrado = buscarSistemaPorNombre(sistemaDesdeNombre, sistemas);
        
        if (sistemaEncontrado) {
          sistemaParaSeleccionar = String(sistemaEncontrado.nombreSistemas);
          console.log('✅ Sistema establecido por nombre (item.name):', sistemaParaSeleccionar, 'ID:', sistemaEncontrado.id);
        }
      }
      
      // Si se encontró un sistema, establecerlo
      if (sistemaParaSeleccionar) {
        setSelectedSistema(sistemaParaSeleccionar);
      } else {
        // Si no se encuentra, intentar usar el valor guardado directamente (por si acaso)
        const sistemaFallback = itemToEdit.detalles?.sistema || extraerNombreSistema(itemToEdit.name || '');
        if (sistemaFallback) {
          console.warn('⚠️ Sistema no encontrado en la lista, usando valor guardado:', sistemaFallback);
          setSelectedSistema(sistemaFallback);
        }
      }
      // No continuar aquí, esperar a que sistemaCargado sea true
    }
  }, [itemToEdit, isOpen, sistemas]);

  // Estado para soportes intermedios y soporte doble
  const [soportesIntermedios, setSoportesIntermedios] = useState<any[]>([]);
  const [selectedSoporteIntermedio, setSelectedSoporteIntermedio] = useState<any>(null);
  const [soporteDobleProducto, setSoporteDobleProducto] = useState<any>(null);
  // Estado para almacenar el producto de soporte doble cuando se carga desde la API (sin establecerlo automáticamente)
  const [soporteDobleProductoDisponible, setSoporteDobleProductoDisponible] = useState<any>(null);

  // Buscar soportes intermedios y soporte doble al abrir el modal si se selecciona Roller
  useEffect(() => {
    if (isOpen && selectedSistema?.toLowerCase().includes('roller')) {
      const fetchSoportes = async () => {
        try {
          // Preservar el valor actual de selectedSoporteIntermedio si estamos editando
          const soporteIntermedioActual = selectedSoporteIntermedio;
          
          // Buscar soportes intermedios por ID (236 y 237)
          const resIntermedio1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/236`);
          const resIntermedio2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/237`);
          const dataIntermedio1 = await resIntermedio1.json();
          const dataIntermedio2 = await resIntermedio2.json();
          
          // Buscar soporte doble por ID (238) - solo para tenerlo disponible, no establecerlo automáticamente
          const resSoporteDoble = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/238`);
          const dataSoporteDoble = await resSoporteDoble.json();
          
          const soportesIntermediosList = [
            { id: dataIntermedio1.id, nombre: dataIntermedio1.nombreProducto, precio: dataIntermedio1.precio },
            { id: dataIntermedio2.id, nombre: dataIntermedio2.nombreProducto, precio: dataIntermedio2.precio }
          ];
          
          setSoportesIntermedios(soportesIntermediosList);
          
          // Guardar el producto de soporte doble disponible, pero NO establecerlo automáticamente
          // Solo se establecerá cuando el checkbox esté marcado o cuando se esté editando un pedido con soporte doble
          setSoporteDobleProductoDisponible({
            id: dataSoporteDoble.id,
            nombre: dataSoporteDoble.nombreProducto,
            precio: dataSoporteDoble.precio
          });
          
          // Si estamos editando y ya hay un soporte intermedio precargado, preservarlo
          // o buscar el correspondiente en la lista recién cargada
          if (itemToEdit && soporteIntermedioActual) {
            // Buscar el soporte en la lista recién cargada por ID
            const soporteEncontrado = soportesIntermediosList.find(
              s => s.id === soporteIntermedioActual.id || 
                   Number(s.id) === Number(soporteIntermedioActual.id)
            );
            if (soporteEncontrado) {
              setSelectedSoporteIntermedio(soporteEncontrado);
              console.log('✅ Soporte intermedio preservado después de cargar lista:', soporteEncontrado.nombre);
            } else {
              // Si no se encuentra, mantener el valor actual
              setSelectedSoporteIntermedio(soporteIntermedioActual);
            }
          } else if (!itemToEdit) {
            // Solo resetear si NO estamos editando
            setSelectedSoporteIntermedio(null);
            setSoporteDobleProducto(null);
          }
        } catch (e) {
          console.error('Error al obtener soportes:', e);
          setSoportesIntermedios([]);
          // Solo resetear si NO estamos editando
          if (!itemToEdit) {
            setSelectedSoporteIntermedio(null);
            setSoporteDobleProducto(null);
          }
          setSoporteDobleProductoDisponible(null);
        }
      };
      fetchSoportes();
    }
  }, [isOpen, selectedSistema]);

  // Handlers personalizados para soporte intermedio y doble con validación mutuamente excluyente
  const handleSoporteIntermedioChange = (value: boolean) => {
    if (value && soporteDoble) {
      // Si se activa soporte intermedio y soporte doble está activo, desactivar soporte doble
      setSoporteDoble(false);
    }
    setSoporteIntermedio(value);
  };

  const handleSoporteDobleChange = (value: boolean) => {
    if (value) {
      // Si se activa soporte doble, limpiar soporte intermedio (tanto checkbox como dropdown)
      setSoporteIntermedio(false);
      setSelectedSoporteIntermedio(null);
      // Establecer el producto de soporte doble disponible cuando se marca el checkbox
      if (soporteDobleProductoDisponible) {
        setSoporteDobleProducto(soporteDobleProductoDisponible);
      }
    } else {
      // Si se desactiva soporte doble, limpiar el producto y la segunda tela (si es Roller)
      setSoporteDobleProducto(null);
      if (selectedSistema?.toLowerCase().includes('roller')) {
        setSelectedTela2(null);
        setSearchTela2("");
        setShowTelasList2(false);
        setMultiplicadorTela2(1);
        setCantidadTelaManual2(null);
        setPrecioTela2(0);
        setSelectedSegundoCabezal(null);
        setSearchSegundoCabezal("");
        setShowSegundosCabezalesList(false);
        setPrecioSegundoCabezal(0);
      }
    }
    setSoporteDoble(value);
  };

  // Handler para cuando se selecciona un soporte intermedio del dropdown
  const handleSoporteIntermedioTipoChange = (soporte: any) => {
    if (soporte) {
      // Si se selecciona un soporte intermedio, desactivar soporte doble
      setSoporteDoble(false);
    }
    setSelectedSoporteIntermedio(soporte);
  };

  // Función para determinar qué soporte mostrar en el resumen de precios
  const getSoporteResumen = () => {
    if (soporteDoble && soporteDobleProducto) {
      return {
        tipo: 'doble',
        nombre: soporteDobleProducto.nombre,
        precio: soporteDobleProducto.precio
      };
    } else if (selectedSoporteIntermedio) {
      return {
        tipo: 'intermedio',
        nombre: selectedSoporteIntermedio.nombre,
        precio: selectedSoporteIntermedio.precio
      };
    }
    return null;
  };

  // Cuando se desactiva soporte intermedio, limpiar la selección
  useEffect(() => {
    if (!soporteIntermedio) {
      setSelectedSoporteIntermedio(null);
    }
  }, [soporteIntermedio]);

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
    setIncluirMotorizacion(false);
    setPrecioMotorizacion(0);
    
    // Limpiar campos adicionales que no estaban en la función original
    setSearchTela2("");
    setTelasFiltradas2([]);
    setSelectedTela2(null);
    setShowTelasList2(false);
    setMultiplicadorTela2(1);
    setCantidadTelaManual2(null);
    setSearchSegundoCabezal("");
    setSegundosCabezales([]);
    setSelectedSegundoCabezal(null);
    setShowSegundosCabezalesList(false);
    setPrecioSistema(0);
    setPrecioTela(0);
    setPrecioTela2(0);
    setPrecioSegundoCabezal(0);
    setIncluirColocacion(true);
    setError("");
    setShowValidationAlert(false);
    setShowCloseConfirmModal(false);
    setMultiplicadorTelaLocal(1);
    setEspacio("");
    setEspacioPersonalizado("");
    setShowCambioSistema(false);
    setNombreSistemaCambio("");
    setSistemaRecomendado("");
    setPedidoJSON("");
    setSelectedSoporteIntermedio(null);
    setSoporteDobleProducto(null);
    setSistemaPedidoDetalles(null);
    setAccesoriosAdicionales([]);
    setAplicarRedondeo(false);
    // NO resetear precioColocacion aquí - se obtiene del API
    setCantidadTelaManual(null);
    setSistemaCargado(false); // Resetear el flag de sistema cargado
  };

  // Función para validar si se puede proceder al siguiente paso
  const canProceedToNextStep = () => {
    // Validaciones básicas obligatorias para todos los sistemas
    if (!selectedSistema) {
      // console.log('❌ Validación fallida: No hay sistema seleccionado');
      return false;
    }
    
    if (!cantidad || Number(cantidad) <= 0) {
      // console.log('❌ Validación fallida: Cantidad inválida');
      return false;
    }
    
    if (!ancho || Number(ancho) <= 0) {
      // console.log('❌ Validación fallida: Ancho inválido');
      return false;
    }
    
    if (!alto || Number(alto) <= 0) {
      // console.log('❌ Validación fallida: Alto inválido');
      return false;
    }

    // Validación de medidas mínimas (al menos 10cm x 10cm)
    if (Number(ancho) < 10 || Number(alto) < 10) {
      // console.log('❌ Validación fallida: Medidas muy pequeñas');
      return false;
    }

    // Validación específica por tipo de sistema
    const sistemaLower = selectedSistema.toLowerCase();
    
    // Para sistemas que requieren producto específico (no Propios/Tradicional)
    if (!sistemaLower.includes('tradicional') && !sistemaLower.includes('propios')) {
      if (!selectedRielBarral || !selectedRielBarral.precio) {
        // console.log('❌ Validación fallida: No hay producto seleccionado para sistema', selectedSistema);
        return false;
      }
    }

    // Para sistemas Propios/Tradicional, validar que haya detalles del sistema y producto
    if (sistemaLower.includes('tradicional') || sistemaLower.includes('propios')) {
      if (!sistemaPedidoDetalles) {
        // console.log('❌ Validación fallida: No hay detalles del sistema para Propios/Tradicional');
        return false;
      }
      if (!sistemaPedidoDetalles.productoSeleccionado) {
        // console.log('❌ Validación fallida: No hay producto seleccionado para sistema Propios/Tradicional');
        return false;
      }
    }

    // Para todos los sistemas excepto Venecianas, requerimos tela
    if (!sistemaLower.includes('veneciana') && !selectedTela) {
      // console.log('❌ Validación fallida: No hay tela seleccionada');
      return false;
    }

    // Validación de medidas según ábaco (si existe)
    const anchoMetros = Number(ancho) / 100;
    const altoMetros = Number(alto) / 100;
    const sistemasDisponibles = abacoData[selectedSistema as keyof typeof abacoData]?.sistemas;

    if (sistemasDisponibles && sistemasDisponibles.length > 0) {
      const medidasValidas = sistemasDisponibles.some(
        (sistema: { ancho: number; alto: number }) => 
          sistema.ancho >= anchoMetros && sistema.alto >= altoMetros
      );
      
      if (!medidasValidas) {
        // console.log('❌ Validación fallida: Medidas no válidas según ábaco');
        return false;
      }
    }

    // Validación de errores del sistema
    if (error) {
      // console.log('❌ Validación fallida: Hay errores en el sistema');
      return false;
    }

    // Validación de precio total
    const precioTotal = calcularPrecioTotal();
    if (precioTotal <= 0) {
      // console.log('❌ Validación fallida: Precio total inválido');
      return false;
    }

    // console.log('✅ Todas las validaciones pasaron');
    return true;
  };

  const handleClose = () => {
    // Verificar si hay datos ingresados
    if (selectedSistema || cantidad !== "1" || ancho !== "" || alto !== "" || selectedArticulo || selectedTela || selectedRielBarral) {
      setShowCloseConfirmModal(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirmModal(false);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowCloseConfirmModal(false);
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
      // Solo resetear inputs si NO estamos editando un item
      if (!itemToEdit) {
        resetInputs(); // Limpiar todos los campos al abrir el modal
      }
    }
  }, [isOpen, itemToEdit]);

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
    // console.log('🔍 [TELAS] Iniciando búsqueda de telas...');
    // console.log('🔍 [TELAS] Valor buscado:', value);
    // console.log('🔍 [TELAS] Sistema seleccionado:', selectedSistema);
    
    setSearchTela(value);
    setShowTelasList(true);

    // Permitir búsqueda si es '*' (con o sin espacios) o si hay texto
    const isAsterisk = value.trim() === '*';
    if (!value.trim() && !isAsterisk) {
      // console.log('🔍 [TELAS] Valor vacío, limpiando resultados');
      setTelasFiltradas([]);
      setShowTelasList(false);
      return;
    }

    try {
      // Usar el endpoint dinámico para telas según el sistema seleccionado
      const sistemaKey = selectedSistema?.toLowerCase();
      // console.log('🔍 [TELAS] Sistema key:', sistemaKey);
      
      if (!sistemaKey || !sistemaToApiParams[sistemaKey]) {
        console.log('[DEBUG] No sistema seleccionado para búsqueda de telas:', selectedSistema);
        console.log('[DEBUG] SistemaToApiParams disponibles:', Object.keys(sistemaToApiParams));
        setTelasFiltradas([]);
        return;
      }

      const { sistemaId, rubroId, proveedorId } = sistemaToApiParams[sistemaKey];
      // console.log('🔍 [TELAS] Parámetros del sistema:', { sistemaId, rubroId, proveedorId });
      
      // Si el valor es '*', buscar todas las telas (q=*)
      const queryParam = isAsterisk ? '*' : encodeURIComponent(value);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${queryParam}`;
      
      // console.log('🔍 [TELAS] URL completa:', url);
      // console.log('🔍 [TELAS] Base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(url);
      // console.log('🔍 [TELAS] Status de la respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al buscar telas');
      }
      
      const data = await response.json();
      // console.log('🔍 [TELAS] Respuesta completa:', data);
      // console.log('🔍 [TELAS] Cantidad de resultados:', data.data?.length || 0);
      
      // Formatear las telas para que coincidan con la interfaz Tela
      const telasFormateadas = Array.isArray(data.data) ? data.data.map((tela: any) => ({
        id: tela.id,
        nombreProducto: tela.nombreProducto || tela.nombre,
        tipo: tela.descripcion || tela.tipo || '',
        color: tela.color || '',
        precio: tela.precio ? Number(tela.precio).toString() : '0'
      })) : [];
      
      // console.log('🔍 [TELAS] Telas formateadas:', telasFormateadas);
      setTelasFiltradas(telasFormateadas);
    } catch (error) {
      console.error('❌ [TELAS] Error al buscar telas:', error);
      setTelasFiltradas([]);
    }
  };

  // Función para manejar la búsqueda de la segunda tela
  const handleTelaSearch2 = async (value: string) => {
    // console.log('🔍 [TELAS2] Iniciando búsqueda de segunda tela...');
    // console.log('🔍 [TELAS2] Valor buscado:', value);
    // console.log('🔍 [TELAS2] Sistema seleccionado:', selectedSistema);
    
    setSearchTela2(value);
    setShowTelasList2(true);

    // Permitir búsqueda si es '*' (con o sin espacios) o si hay texto
    const isAsterisk = value.trim() === '*';
    if (!value.trim() && !isAsterisk) {
      // console.log('🔍 [TELAS2] Valor vacío, limpiando resultados');
      setTelasFiltradas2([]);
      setShowTelasList2(false);
      return;
    }

    try {
      // Usar el endpoint dinámico para telas según el sistema seleccionado
      const sistemaKey = selectedSistema?.toLowerCase();
      // console.log('🔍 [TELAS2] Sistema key:', sistemaKey);
      
      if (!sistemaKey || !sistemaToApiParams[sistemaKey]) {
        console.log('[DEBUG] No sistema seleccionado para búsqueda de segunda tela:', selectedSistema);
        console.log('[DEBUG] SistemaToApiParams disponibles:', Object.keys(sistemaToApiParams));
        setTelasFiltradas2([]);
        return;
      }

      const { sistemaId, rubroId, proveedorId } = sistemaToApiParams[sistemaKey];
      // console.log('🔍 [TELAS2] Parámetros del sistema:', { sistemaId, rubroId, proveedorId });
      
      // Si el valor es '*', buscar todas las telas (q=*)
      const queryParam = isAsterisk ? '*' : encodeURIComponent(value);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${queryParam}`;
      
      // console.log('🔍 [TELAS2] URL completa:', url);
      
      const response = await fetch(url);
      // console.log('🔍 [TELAS2] Status de la respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al buscar segunda tela');
      }
      
      const data = await response.json();
      // console.log('🔍 [TELAS2] Respuesta completa:', data);
      // console.log('🔍 [TELAS2] Cantidad de resultados:', data.data?.length || 0);
      
      // Formatear las telas para que coincidan con la interfaz Tela
      const telasFormateadas = Array.isArray(data.data) ? data.data.map((tela: any) => ({
        id: tela.id,
        nombreProducto: tela.nombreProducto || tela.nombre,
        tipo: tela.descripcion || tela.tipo || '',
        color: tela.color || '',
        precio: tela.precio ? Number(tela.precio).toString() : '0'
      })) : [];
      
      // console.log('🔍 [TELAS2] Telas formateadas:', telasFormateadas);
      setTelasFiltradas2(telasFormateadas);
    } catch (error) {
      console.error('❌ [TELAS2] Error al buscar segunda tela:', error);
      setTelasFiltradas2([]);
    }
  };

  // Buscar el producto correspondiente al sistema seleccionado
  const productoSistema = sistemas.find(s => String(s.nombreSistemas) === selectedSistema);

  // Función para obtener el ancho mínimo por sistema
  const getAnchoMinimo = (sistema: string): number => {
    const sistemaLower = sistema?.toLowerCase();
    if (sistemaLower?.includes('roller')) return 100; // 100cm para Roller
    if (sistemaLower?.includes('barcelona') || sistemaLower?.includes('bandas verticales')) return 150; // 150cm para Banda Vertical
    return 0; // Sin mínimo para otros sistemas
  };

  // Función para calcular el ancho efectivo (aplicando mínimos)
  const getAnchoEfectivo = (sistema: string, anchoIngresado: number): { anchoEfectivo: number; aplicaMinimo: boolean } => {
    const anchoMinimo = getAnchoMinimo(sistema);
    if (anchoMinimo > 0 && anchoIngresado < anchoMinimo) {
      return { anchoEfectivo: anchoMinimo, aplicaMinimo: true };
    }
    return { anchoEfectivo: anchoIngresado, aplicaMinimo: false };
  };

  // Calcular precio del sistema
  const calcularPrecioSistema = () => {
    if (!ancho || !alto) return 0;
    
    const anchoIngresado = Number(ancho);
    const { anchoEfectivo } = getAnchoEfectivo(selectedSistema, anchoIngresado);
    const anchoMetros = anchoEfectivo / 100;
    const altoMetros = Number(alto) / 100;
    
    // Lógica específica para Dunes
    if (selectedSistema?.toLowerCase().includes('dunes')) {
      // Obtener el producto desde sistemaPedidoDetalles
      const productoDunes = sistemaPedidoDetalles?.producto;
      if (productoDunes && productoDunes.precio) {
        const precioBase = Number(productoDunes.precio);
        const precioCalculado = precioBase * anchoMetros; // Solo por metro lineal (ancho)
        // console.log('🏗️ Cálculo Dunes por metro lineal:', {
        //   sistema: selectedSistema,
        //   producto: productoDunes.nombreProducto,
        //   precioBase: precioBase,
        //   anchoMetros: anchoMetros,
        //   precioCalculado: precioCalculado
        // });
        return precioCalculado;
      }
      // console.log('⚠️ No hay producto Dunes disponible');
      return 0;
    }
    
    // Lógica específica para Venecianas - calcular por metro cuadrado (ancho × alto)
    if (selectedSistema?.toLowerCase().includes('veneciana')) {
      // Obtener el producto seleccionado
      let productoSeleccionado = selectedRielBarral;
      
      // Para sistemas Venecianas, verificar si hay producto en sistemaPedidoDetalles
      if (sistemaPedidoDetalles?.productoSeleccionado) {
        productoSeleccionado = sistemaPedidoDetalles.productoSeleccionado;
      }
      
      if (!productoSeleccionado || !productoSeleccionado.precio) {
        // console.log('⚠️ No hay producto seleccionado para Venecianas');
        return 0;
      }
      
      const precioBase = Number(productoSeleccionado.precio);
      const areaMetrosCuadrados = anchoMetros * altoMetros;
      const precioCalculado = precioBase * areaMetrosCuadrados;
      
      // console.log('🪟 Cálculo Venecianas por metro cuadrado:', {
      //   sistema: selectedSistema,
      //   producto: productoSeleccionado.nombreProducto,
      //   precioBase: precioBase,
      //   anchoMetros: anchoMetros,
      //   altoMetros: altoMetros,
      //   areaMetrosCuadrados: areaMetrosCuadrados,
      //   precioCalculado: precioCalculado
      // });
      
      return precioCalculado;
    }
    
    // Obtener el producto seleccionado (puede venir de selectedRielBarral o de sistemaPedidoDetalles)
    let productoSeleccionado = selectedRielBarral;
    
    // Para sistemas Tradicional/Propios, verificar si hay producto en sistemaPedidoDetalles
    if ((selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios')) && 
        sistemaPedidoDetalles?.productoSeleccionado) {
      productoSeleccionado = sistemaPedidoDetalles.productoSeleccionado;
    }
    
    // Solo calcular precio si hay un producto específico seleccionado
    if (!productoSeleccionado || !productoSeleccionado.precio) {
      // console.log('⚠️ No hay producto seleccionado, no se puede calcular precio del sistema');
      return 0;
    }
    
    const precioBase = Number(productoSeleccionado.precio);
    // console.log('🎯 Usando precio del producto seleccionado:', precioBase);
    
    // Para otros sistemas (Roller, Barcelona, etc.), calcular por metro lineal (ancho) con mínimos aplicados
    const precioCalculado = precioBase * anchoMetros;
    // console.log('📏 Cálculo por metro lineal:', {
    //   sistema: selectedSistema,
    //   precioBase: precioBase,
    //   anchoMetros: anchoMetros,
    //   precioCalculado: precioCalculado
    // });
    return precioCalculado;
  };

  // Función para calcular precio de tela con lógica específica para Propios/Tradicional y Dunes
  const calcularPrecioTela = (ancho: number, alto: number, precioTela: number, esRotable: boolean, sistema?: string, multiplicador?: number): number => {
    // NO aplicar ancho mínimo a las telas - usar el ancho ingresado originalmente
    // Lógica específica para Dunes - Tela por m²
    if (sistema && sistema.toLowerCase().includes('dunes')) {
      const telaDunes = sistemaPedidoDetalles?.tela;
      if (telaDunes && telaDunes.precio) {
        const precioBase = Number(telaDunes.precio);
        const anchoMetros = Number(ancho) / 100;
        const altoMetros = Number(alto) / 100;
        const area = anchoMetros * altoMetros;
        const precioCalculado = area * precioBase;
        console.log('🧵 Cálculo tela Dunes por m²:', {
          sistema: sistema,
          tela: telaDunes.nombreProducto,
          precioBase: precioBase,
          anchoMetros: anchoMetros,
          altoMetros: altoMetros,
          area: area,
          precioCalculado: precioCalculado
        });
        return precioCalculado;
      }
      console.log('⚠️ No hay tela Dunes disponible');
      return 0;
    }
    
    // Para sistemas Propios/Tradicional, calcular solo con ancho × multiplicador × precio
    if (sistema && (sistema.toLowerCase().includes('propios') || sistema.toLowerCase().includes('tradicional'))) {
      const anchoMetros = Number(ancho) / 100;
      // Usar el multiplicador pasado como parámetro o el local si no se especifica
      const multiplicadorFinal = multiplicador || multiplicadorTelaLocal || 1;
      return anchoMetros * multiplicadorFinal * precioTela;
    }
    
    // Para otros sistemas, mantener la lógica original con mínimos específicos por sistema
    const area = calcularAreaTela(ancho, alto, esRotable, sistema);
    return area * precioTela;
  };

  const nuevoPrecioSistema = calcularPrecioSistema();

  // Función para redondear a la centena más cercana (de 100 en 100)
  const redondearACentena = (valor: number): number => {
    return Math.round(valor / 100) * 100;
  };

  // Calcular precio total basado en los items del resumen
  const calcularPrecioTotal = () => {
    if (!ancho || !alto || !cantidad) return 0;

    const cantidadNum = Number(cantidad) || 1;
    const anchoIngresado = Number(ancho);
    const { anchoEfectivo } = getAnchoEfectivo(selectedSistema, anchoIngresado);
    let total = 0;

    // 1. Sistema - calcular según el tipo de sistema
    let precioSistema = 0;
    if (selectedSistema?.toLowerCase().includes('dunes')) {
      precioSistema = calcularPrecioSistema();
    } else if (selectedSistema?.toLowerCase().includes('veneciana') || selectedSistema?.toLowerCase().includes('roller')) {
      precioSistema = calcularPrecioSistema();
    } else {
      // Para otros sistemas (tradicional, propios, etc.)
      if (selectedRielBarral && selectedRielBarral.precio) {
        precioSistema = (anchoEfectivo / 100) * Number(selectedRielBarral.precio);
      }
    }

    // 2. Tela - solo para sistemas que no sean Veneciana
    let precioTela = 0;
    if (selectedTela && !selectedSistema?.toLowerCase().includes('veneciana') && !selectedSistema?.toLowerCase().includes('dunes')) {
      precioTela = calcularPrecioTelaMultiplicada();
    } else if (selectedSistema?.toLowerCase().includes('dunes')) {
      precioTela = calcularPrecioTela(
        Number(ancho),
        Number(alto),
        0,
        false,
        selectedSistema
      );
    }

    // 2.1 Segunda tela - para cortinas tradicionales (riel/barral) o Roller con soporte doble
    let precioTela2 = 0;
    const esTradicionalPropios = selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios');
    const esRollerConSoporteDoble = selectedSistema?.toLowerCase().includes('roller') && soporteDoble;
    
    if (selectedTela2 && (esTradicionalPropios || esRollerConSoporteDoble)) {
      // Si hay cantidad manual ingresada, usar esa directamente
      if (cantidadTelaManual2 && cantidadTelaManual2 > 0) {
        precioTela2 = cantidadTelaManual2 * (selectedTela2?.precio ? Number(selectedTela2.precio) : 0);
      } else {
        // Si no, usar la lógica normal del cálculo
        precioTela2 = calcularPrecioTela(
          anchoEfectivo,
          Number(alto),
          selectedTela2?.precio ? Number(selectedTela2.precio) : 0,
          false,
          selectedSistema,
          multiplicadorTela2
        );
      }
    }

    // 2.2 Segundo cabezal - para cortinas tradicionales (riel/barral) o Roller con soporte doble
    let precioSegundoCabezal = 0;
    if (selectedSegundoCabezal && (esTradicionalPropios || esRollerConSoporteDoble)) {
      if (selectedSegundoCabezal.precio) {
        precioSegundoCabezal = (anchoEfectivo / 100) * Number(selectedSegundoCabezal.precio);
      }
    }

    // Regla de negocio:
    // Cortinas Tradicional con tela doble => deben sumarse 2 confecciones,
    // usando SIEMPRE el precio más costoso, pero aplicado igual a ambas.
    if (selectedTela2 && esTradicionalPropios) {
      const precioConfeccionMax = Math.max(precioSistema, precioSegundoCabezal);
      precioSistema = precioConfeccionMax;
      precioSegundoCabezal = precioConfeccionMax;
    }

    // 3. Soporte intermedio/doble - calcular por metro lineal (ancho)
    let precioSoporte = 0;
    if (getSoporteResumen() && getSoporteResumen()?.precio) {
      const soporteResumen = getSoporteResumen();
      const esRoller = selectedSistema?.toLowerCase().includes('roller');
      const soporteEsDoble = soporteResumen?.tipo === 'doble';

      // En Roller, el soporte doble es UNA unidad (no se cobra por metro/lineal).
      if (esRoller && soporteEsDoble) {
        precioSoporte = Number(soporteResumen?.precio);
      } else {
        precioSoporte = (anchoEfectivo / 100) * Number(soporteResumen?.precio);
      }
    }

    // 4. Colocación
    const precioColocacionFinal = incluirColocacion ? precioColocacion : 0;

    // 5. Motorización (NUEVO)
    const precioMotorizacionFinal = incluirMotorizacion ? precioMotorizacion : 0;

    // 6. Accesorios adicionales
    // Calcular el precio base de los accesorios (sin multiplicar por cantidad)
    const totalAccesoriosAdicionales = accesoriosAdicionales.reduce(
      (sum, acc) => sum + (Number(acc.precio) * (acc.cantidad || 1)),
      0
    );

    // Calcular total: (sistema + tela + tela2 + segundo cabezal + soporte + colocación + motorización + accesorios) * cantidad
    total = (precioSistema + precioTela + precioTela2 + precioSegundoCabezal + precioSoporte + precioColocacionFinal + precioMotorizacionFinal + totalAccesoriosAdicionales) * cantidadNum;

    // Aplicar redondeo si está activado
    if (aplicarRedondeo) {
      total = redondearACentena(total);
    }

    // Actualizar estados para el resumen
    setPrecioSistema(precioSistema);
    setPrecioTela(precioTela);
    setPrecioTela2(precioTela2);
    setPrecioSegundoCabezal(precioSegundoCabezal);

    return total;
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
        console.log('🔧 [COLOCACIÓN] API URL:', apiUrl);
        
        const url = `${apiUrl}/productos/4`;
        console.log('🔧 [COLOCACIÓN] URL completa:', url);
        
        const response = await fetch(url);
        console.log('🔧 [COLOCACIÓN] Status response:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔧 [COLOCACIÓN] Error response:', errorText);
          throw new Error(`Error al obtener precio de colocación: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🔧 [COLOCACIÓN] Data recibida:', data);
        
        // Validar que el producto sea el correcto (más flexible)
        const nombreProducto = data.nombreProducto?.toLowerCase()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "");
        console.log('🔧 [COLOCACIÓN] Nombre producto normalizado:', nombreProducto);
        
        if (!nombreProducto?.includes('colocacion') && !nombreProducto?.includes('instalacion') && !nombreProducto?.includes('instalación')) {
          console.warn('🔧 [COLOCACIÓN] El producto ID 4 no parece ser de colocación/instalación:', data.nombreProducto);
          // No retornar, continuar con el precio aunque no coincida exactamente el nombre
        }

        const precioString = data.precio;
        console.log('🔧 [COLOCACIÓN] Precio como string:', precioString, 'Tipo:', typeof precioString);
        
        const precio = Number(precioString);
        console.log('🔧 [COLOCACIÓN] Precio convertido a número:', precio, 'isNaN:', isNaN(precio));
        
        if (!isNaN(precio) && precio > 0) {
          setPrecioColocacion(precio);
          console.log('✅ [COLOCACIÓN] Precio de colocación establecido en estado:', precio);
          
          // Verificar que el estado se actualizó correctamente
          setTimeout(() => {
            console.log('🔧 [COLOCACIÓN] Estado después de 100ms:', precioColocacion);
          }, 100);
        } else {
          console.warn('⚠️ [COLOCACIÓN] Precio inválido o cero:', precio);
          // Establecer un precio por defecto si no se puede obtener del API
          setPrecioColocacion(5000); // $5000 por defecto
          console.log('🔧 [COLOCACIÓN] Estableciendo precio por defecto: 5000');
        }

      } catch (error) {
        console.error('❌ [COLOCACIÓN] Error al obtener precio de colocación:', error);
        // En caso de error, establecer un precio por defecto
        setPrecioColocacion(5000); // $5000 por defecto
        console.log('🔧 [COLOCACIÓN] Error en fetch, estableciendo precio por defecto: 5000');
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
      // console.log('💰 Nuevo precio del sistema:', nuevoPrecioSistema);
      setPrecioSistema(nuevoPrecioSistema);
      
      // Si hay tela seleccionada y no es Veneciana, recalcular precio de tela también
      if (selectedTela && !selectedSistema.toLowerCase().includes('veneciana')) {
        const nuevoPrecioTela = calcularPrecioTela(
          Number(ancho),
          Number(alto),
          selectedTela?.precio ? Number(selectedTela.precio) : 0,
          selectedTela?.nombreProducto === 'ROLLER',
          selectedSistema
        );
        setPrecioTela(nuevoPrecioTela);
      }
    }
  }, [ancho, alto, selectedSistema, selectedTela]);

  // useEffect específico para recalcular precio cuando cambien los detalles del sistema Dunes
  useEffect(() => {
    if (selectedSistema?.toLowerCase().includes('dunes') && ancho && alto && sistemaPedidoDetalles) {
      console.log('🔄 Recalculando precio Dunes:', {
        sistema: selectedSistema,
        ancho: ancho,
        alto: alto,
        producto: sistemaPedidoDetalles.producto,
        tela: sistemaPedidoDetalles.tela
      });
      
      const nuevoPrecioSistema = calcularPrecioSistema();
      const nuevoPrecioTela = calcularPrecioTela(
        Number(ancho),
        Number(alto),
        0,
        false,
        selectedSistema
      );
      
      // console.log('💰 Nuevos precios Dunes:', {
      //   precioSistema: nuevoPrecioSistema,
      //   precioTela: nuevoPrecioTela
      // });
      
      setPrecioSistema(nuevoPrecioSistema);
      setPrecioTela(nuevoPrecioTela);
    }
  }, [sistemaPedidoDetalles, selectedSistema, ancho, alto]);

  // useEffect para recalcular precio cuando cambie la segunda tela
  useEffect(() => {
    const esTradicionalPropios = selectedSistema && (selectedSistema.toLowerCase().includes('tradicional') || selectedSistema.toLowerCase().includes('propios'));
    const esRollerConSoporteDoble = selectedSistema && selectedSistema.toLowerCase().includes('roller') && soporteDoble;
    
    if ((esTradicionalPropios || esRollerConSoporteDoble) && ancho && alto) {
      // console.log('🔄 Recalculando precio por cambio de segunda tela:', {
      //   sistema: selectedSistema,
      //   ancho: ancho,
      //   alto: alto,
      //   selectedTela2: selectedTela2,
      //   multiplicadorTela2: multiplicadorTela2
      // });
      
      // Calcular precio de la segunda tela
      let nuevoPrecioTela2 = 0;
      if (selectedTela2) {
        if (cantidadTelaManual2 && cantidadTelaManual2 > 0) {
          nuevoPrecioTela2 = cantidadTelaManual2 * (selectedTela2?.precio ? Number(selectedTela2.precio) : 0);
        } else {
          nuevoPrecioTela2 = calcularPrecioTela(
            Number(ancho),
            Number(alto),
            selectedTela2?.precio ? Number(selectedTela2.precio) : 0,
            false,
            selectedSistema,
            multiplicadorTela2
          );
        }
      }
      
      setPrecioTela2(nuevoPrecioTela2);
      // console.log('💰 Nuevo precio de segunda tela:', nuevoPrecioTela2);
      
      // Recalcular el precio total que incluye la segunda tela
      const nuevoPrecioTotal = calcularPrecioTotal();
      // console.log('💰 Nuevo precio total con segunda tela:', nuevoPrecioTotal);
    }
  }, [selectedTela2, multiplicadorTela2, cantidadTelaManual2, selectedSistema, ancho, alto, soporteDoble]);

  // useEffect para recalcular precio cuando cambie el segundo cabezal
  useEffect(() => {
    const esTradicionalPropios = selectedSistema && (selectedSistema.toLowerCase().includes('tradicional') || selectedSistema.toLowerCase().includes('propios'));
    const esRollerConSoporteDoble = selectedSistema && selectedSistema.toLowerCase().includes('roller') && soporteDoble;
    
    if ((esTradicionalPropios || esRollerConSoporteDoble) && ancho && selectedSegundoCabezal) {
      const { anchoEfectivo } = getAnchoEfectivo(selectedSistema, Number(ancho));
      const nuevoPrecioSegundoCabezal = selectedSegundoCabezal.precio 
        ? (anchoEfectivo / 100) * Number(selectedSegundoCabezal.precio)
        : 0;
      
      setPrecioSegundoCabezal(nuevoPrecioSegundoCabezal);
      
      // Recalcular el precio total que incluye el segundo cabezal
      const nuevoPrecioTotal = calcularPrecioTotal();
    }
  }, [selectedSegundoCabezal, selectedSistema, ancho, soporteDoble]);

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
    setSelectedTela2(null);
    setSearchTela2("");
    setTelasFiltradas2([]);
    setShowTelasList2(false);
    setMultiplicadorTela2(1);
    setCantidadTelaManual2(null);
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
    setAplicarRedondeo(false);
    // Puedes agregar aquí cualquier otro estado que deba limpiarse
  };

  const handleSubmit = () => {
    const cantidadNum = Number(cantidad) || 1;
    
    // Usar exactamente la misma función que se usa en el resumen para garantizar consistencia
    // Esto elimina la lógica duplicada y asegura que todos los sistemas usen el mismo cálculo
    const precioTotal = calcularPrecioTotal();
    
    // Calcular el precio unitario dividiendo el total por la cantidad
    const precioUnitarioCompleto = precioTotal / cantidadNum;
    
    console.log('🎯 PRECIO ENVIADO AL BUDGETTABLE:', {
      precioTotal: precioTotal,
      precioTotalFormateado: precioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    });
    
    // console.log('💰 [PRECIO FINAL] Desglose completo:', {
    //   precioUnitario: precioUnitario,
    //   precioTelaTotal: precioTelaTotal,
    //   precioTela2Total: precioTela2Total,
    //   soporteIntermedioTotal: soporteIntermedioTotal,
    //   colocacionTotal: colocacionTotal,
    //   precioUnitarioCompleto: precioUnitarioCompleto,
    //   cantidadNum: cantidadNum,
    //   totalAccesoriosAdicionales: totalAccesoriosAdicionales,
    //   precioTotal: precioTotal
    // });

    console.log('📊 RESUMEN DEL PEDIDO:', {
      sistema: selectedSistema,
      medidas: { ancho: Number(ancho), alto: Number(alto) },
      cantidad: cantidadNum,
      precioUnitarioCompleto: precioUnitarioCompleto,
      precioTotal: precioTotal
    });
    
    // Calcular información de tela para sistemas tradicionales
    let multiplicadorTelaInfo = null;
    let metrosTotalesTela = null;
    
    if (selectedSistema && (selectedSistema.toLowerCase().includes('tradicional') || selectedSistema.toLowerCase().includes('propios')) && selectedTela) {
      const multiplicador = multiplicadorTelaLocal || 1;
      const anchoMetros = Number(ancho) / 100;
      const metrosTotales = anchoMetros * multiplicador;
      
      multiplicadorTelaInfo = multiplicador;
      metrosTotalesTela = metrosTotales;
    }
    

    
    // Obtener el ID del sistema seleccionado
    const sistemaSeleccionado = sistemas.find(s => String(s.nombreSistemas) === selectedSistema);
    const sistemaId = sistemaSeleccionado ? (typeof sistemaSeleccionado.id === 'number' ? sistemaSeleccionado.id : Number(sistemaSeleccionado.id)) : null;
    
    const pedido = {
      sistema: selectedSistema,
      sistemaId: sistemaId, // Guardar ID del sistema para identificación precisa
      espacio: espacio, // Agregar el espacio seleccionado
      espacioPersonalizado: espacio === "Otro" ? espacioPersonalizado : "", // Agregar espacio personalizado
      detalles: {
        // Preservar TODOS los campos del formulario específico (Propios/Roller/etc.)
        ...(sistemaPedidoDetalles || {}),
        cantidad: parseFloat(cantidad),
        ancho: ancho && !isNaN(Number(ancho)) ? Number(ancho) : null,
        alto: alto && !isNaN(Number(alto)) ? Number(alto) : null,
        ubicacion: espacio === "Otro" ? espacioPersonalizado : espacio, // Ubicación final (espacio o personalizado)
        sistemaRecomendado,
        articuloSeleccionado: selectedArticulo,
        tela: selectedSistema.toLowerCase().includes('veneciana') ? null : selectedTela,
        caidaPorDelante, // Checkbox booleano (no necesita ID)
        colorSistema,
        ladoComando,
        tipoTela,
        // IMPORTANTE: Si hay producto de soporte guardado, el booleano debe ser true
        soporteIntermedio: soporteIntermedio || Boolean(selectedSoporteIntermedio),
        soporteDoble: soporteDoble || Boolean(soporteDobleProducto),
        detalle,
        incluirColocacion,
        precioColocacion: incluirColocacion ? precioColocacion : 0,
        // IMPORTANTE: Guardar el objeto completo y el ID de soporte intermedio
        soporteIntermedioTipo: selectedSoporteIntermedio,
        soporteIntermedioId: selectedSoporteIntermedio?.id || null,
        // IMPORTANTE: Guardar el objeto completo y el ID de soporte doble
        soporteDobleProducto: soporteDobleProducto,
        soporteDobleProductoId: (soporteDoble || soporteDobleProducto) ? (soporteDobleProducto?.id || null) : null,
        // IMPORTANTE: Guardar el objeto completo y el ID del producto cabezal (riel/barral)
        // Para sistemas Tradicional/Propios, usar productoSeleccionado de sistemaPedidoDetalles
        // Para otros sistemas, usar selectedRielBarral
        selectedRielBarral: (selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios'))
          ? (sistemaPedidoDetalles?.productoSeleccionado || selectedRielBarral || null)
          : selectedRielBarral,
        selectedRielBarralId: (selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios'))
          ? (sistemaPedidoDetalles?.productoSeleccionado?.id || selectedRielBarral?.id || null)
          : (selectedRielBarral?.id || null),
        accesorios: [
          getSoporteResumen() ? getSoporteResumen()?.nombre : null
          // Aquí puedes agregar otros accesorios según el sistema
        ].filter(Boolean),
        accesoriosAdicionales: accesoriosAdicionales.map(acc => acc.nombre || acc),
        // Información específica para tela tradicional
        multiplicadorTela: multiplicadorTelaInfo,
        metrosTotalesTela: metrosTotalesTela,
        cantidadTelaManual: cantidadTelaManual,
        // Información específica para segunda tela tradicional
        tela2: selectedTela2,
        multiplicadorTela2: multiplicadorTela2,
        cantidadTelaManual2: cantidadTelaManual2,
        // Información específica para segundo cabezal
        selectedSegundoCabezal: selectedSegundoCabezal,
        selectedSegundoCabezalId: selectedSegundoCabezal?.id || null,
        // Información específica para Dunes
        ...(selectedSistema?.toLowerCase().includes('dunes') && {
          productoDunes: sistemaPedidoDetalles?.producto,
          telaDunes: sistemaPedidoDetalles?.tela,
          // Incluir todos los detalles del formulario de Dunes
          colorSistema: sistemaPedidoDetalles?.colorSistema,
          ladoComando: sistemaPedidoDetalles?.ladoComando,
          ladoApertura: sistemaPedidoDetalles?.ladoApertura,
          instalacion: sistemaPedidoDetalles?.instalacion,
          detalle: sistemaPedidoDetalles?.detalle,
          tipoApertura: sistemaPedidoDetalles?.tipoApertura
        }),
        incluirMotorizacion,
        precioMotorizacion: incluirMotorizacion ? precioMotorizacion : 0,
        aplicarRedondeo,
      },
      fecha: new Date().toISOString(),
      precioUnitario: precioUnitarioCompleto,
      precioTotal: precioTotal,
      medidaId: medidasPrecargadas?.medidaId,
      incluirColocacion,
      precioColocacion
    };
    console.log('Pedido creado con accesorios:', pedido);
    
    // Log específico para Dunes
    if (selectedSistema?.toLowerCase().includes('dunes')) {
      // console.log('🏗️ [DUNES] Pedido final creado:');
      console.log('Precio Unitario Completo:', precioUnitarioCompleto);
      console.log('Precio Total:', precioTotal);
      console.log('Cantidad:', cantidadNum);
      console.log('Producto Dunes:', sistemaPedidoDetalles?.producto);
      console.log('Tela Dunes:', sistemaPedidoDetalles?.tela);
    }
    
    // Si estamos editando, pasar el ID del item
    const editingItemId = itemToEdit?.id;
    onPedidoCreated(pedido, editingItemId);
    resetInputs(); // Limpiar todos los campos antes de cerrar el modal
    onOpenChange(false);
  };

  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);
  const [loadingProductosFiltrados, setLoadingProductosFiltrados] = useState(false);

  // Consultar productos filtrados cuando cambia el sistema
  useEffect(() => {
    const fetchProductosFiltrados = async () => {
      const sistemaKey = selectedSistema?.toLowerCase();
      // Usar sistemaToApiParamsProductos para buscar productos/sistemas/soportes
      if (sistemaKey && sistemaToApiParamsProductos[sistemaKey]) {
        setLoadingProductosFiltrados(true);
        const { sistemaId, rubroId, proveedorId } = sistemaToApiParamsProductos[sistemaKey];
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

  // EFECTO 2: Esperar a que los productos filtrados se carguen después de seleccionar el sistema
  // Este efecto verifica cuando loadingProductosFiltrados termina y marca sistemaCargado como true
  useEffect(() => {
    if (selectedSistema && itemToEdit && !loadingProductosFiltrados && !sistemaCargado) {
      // Los productos filtrados están listos, ahora podemos continuar precargando
      console.log('✅ Sistema cargado completamente, productos filtrados listos');
      setSistemaCargado(true);
    }
  }, [selectedSistema, loadingProductosFiltrados, itemToEdit, sistemaCargado]);

  // EFECTO 3: Precargar el resto de los campos cuando el sistema esté completamente cargado
  // Este efecto precarga todos los campos que dependen del sistema y productos filtrados
  useEffect(() => {
    if (sistemaCargado && itemToEdit && isOpen) {
      console.log('🔄 Precargando detalles del sistema:', itemToEdit);
      
      const precargarDetalles = async () => {
          // Precargar detalles específicos del sistema
          if (itemToEdit.detalles) {
            if (itemToEdit.detalles.detalle) {
              setDetalle(itemToEdit.detalles.detalle);
            }
            // Precargar caida por delante (checkbox booleano)
            if (itemToEdit.detalles.caidaPorDelante !== undefined) {
              setCaidaPorDelante(itemToEdit.detalles.caidaPorDelante === true || itemToEdit.detalles.caidaPorDelante === "Si");
            }
            if (itemToEdit.detalles.colorSistema) {
              setColorSistema(itemToEdit.detalles.colorSistema);
            }
            if (itemToEdit.detalles.ladoComando) {
              setLadoComando(itemToEdit.detalles.ladoComando);
            }
            if (itemToEdit.detalles.tipoTela) {
              setTipoTela(itemToEdit.detalles.tipoTela);
            }
            // Precargar soporte intermedio y soporte doble (mutuamente excluyentes)
            // IMPORTANTE: Solo activar el checkbox si el booleano es true en los detalles del pedido
            console.log('🔍 [DEBUG] Soportes en itemToEdit.detalles:', {
              soporteIntermedio: itemToEdit.detalles.soporteIntermedio,
              soporteIntermedioId: itemToEdit.detalles.soporteIntermedioId,
              soporteIntermedioTipo: itemToEdit.detalles.soporteIntermedioTipo,
              soporteDoble: itemToEdit.detalles.soporteDoble,
              soporteDobleProductoId: itemToEdit.detalles.soporteDobleProductoId,
              soporteDobleProducto: itemToEdit.detalles.soporteDobleProducto
            });
            
            // Determinar si hay soporte intermedio guardado (por booleano o por existencia de producto)
            const tieneSoporteIntermedioGuardado = itemToEdit.detalles.soporteIntermedio === true || 
                                                   Boolean(itemToEdit.detalles.soporteIntermedioId) || 
                                                   Boolean(itemToEdit.detalles.soporteIntermedioTipo);
            
            // IMPORTANTE: Solo considerar soporte doble guardado si el booleano es explícitamente true
            // Esto evita que se marque automáticamente solo porque existe el producto disponible
            const tieneSoporteDobleGuardado = itemToEdit.detalles.soporteDoble === true;
            
            // Aplicar lógica mutuamente excluyente: solo uno puede estar activo
            if (tieneSoporteIntermedioGuardado && tieneSoporteDobleGuardado) {
              console.log('⚠️ Detectado conflicto: ambos soportes guardados, priorizando soporte intermedio');
              // Priorizar soporte intermedio si ambos están guardados
              setSoporteIntermedio(true);
              setSoporteDoble(false);
              setSoporteDobleProducto(null);
            } else if (tieneSoporteIntermedioGuardado) {
              setSoporteIntermedio(true);
              setSoporteDoble(false);
              setSoporteDobleProducto(null);
              console.log('✅ Soporte intermedio activado (checkbox):', true);
            } else if (tieneSoporteDobleGuardado) {
              setSoporteDoble(true);
              setSoporteIntermedio(false);
              setSelectedSoporteIntermedio(null);
              console.log('✅ Soporte doble activado (checkbox):', true);
            } else {
              // Ninguno está guardado
              setSoporteIntermedio(false);
              setSoporteDoble(false);
              setSoporteDobleProducto(null);
            }
          
          // Precargar tela - buscar desde API si solo tenemos el nombre
          if (itemToEdit.detalles.tela && typeof itemToEdit.detalles.tela === 'object') {
            // Si ya tenemos el objeto completo de la tela
            setSelectedTela(itemToEdit.detalles.tela);
            setSearchTela(itemToEdit.detalles.tela.nombreProducto || itemToEdit.detalles.tela.nombre || '');
          } else if (itemToEdit.detalles.tipoTela) {
            // Si solo tenemos el nombre, intentar buscarlo
            setTipoTela(itemToEdit.detalles.tipoTela);
            setSearchTela(itemToEdit.detalles.tipoTela);
            // Intentar buscar la tela completa desde la API usando la misma lógica que TelasSearch
            try {
              // Usar selectedSistema que ya está normalizado (sin "Cortina")
              const sistemaKey = selectedSistema?.toLowerCase();
              const isTradicional = sistemaKey && (sistemaKey.includes('tradicional') || sistemaKey.includes('propios'));
              
              let url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados`;
              
              if (isTradicional || !sistemaKey || !sistemaToApiParams[sistemaKey]) {
                // Para sistemas Tradicional/Propios, usar filtro fijo
                url += `?rubroId=4&q=${encodeURIComponent(itemToEdit.detalles.tipoTela)}`;
              } else {
                // Para otros sistemas, usar filtros dinámicos
                const { sistemaId, rubroId, proveedorId } = sistemaToApiParams[sistemaKey];
                url += `?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${encodeURIComponent(itemToEdit.detalles.tipoTela)}`;
              }
              
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                  // Buscar la tela que coincida con el nombre
                  const telaEncontrada = data.data.find((t: any) => 
                    t.nombreProducto?.toLowerCase().includes(itemToEdit.detalles.tipoTela.toLowerCase()) ||
                    itemToEdit.detalles.tipoTela.toLowerCase().includes(t.nombreProducto?.toLowerCase() || '')
                  );
                  if (telaEncontrada) {
                    setSelectedTela({
                      id: telaEncontrada.id,
                      nombreProducto: telaEncontrada.nombreProducto,
                      tipo: telaEncontrada.descripcion || '',
                      color: telaEncontrada.color || '',
                      precio: telaEncontrada.precio ? Number(telaEncontrada.precio).toString() : '0'
                    });
                  }
                }
              }
            } catch (error) {
              console.error('Error al buscar tela:', error);
            }
          }
          
          // Precargar segunda tela si existe
          if (itemToEdit.detalles.tela2) {
            if (typeof itemToEdit.detalles.tela2 === 'object') {
              setSelectedTela2(itemToEdit.detalles.tela2);
              setSearchTela2(itemToEdit.detalles.tela2.nombreProducto || itemToEdit.detalles.tela2.nombre || '');
            } else {
              setSearchTela2(itemToEdit.detalles.tela2);
            }
            if (itemToEdit.detalles.multiplicadorTela2) {
              setMultiplicadorTela2(itemToEdit.detalles.multiplicadorTela2);
            }
            if (itemToEdit.detalles.cantidadTelaManual2) {
              setCantidadTelaManual2(itemToEdit.detalles.cantidadTelaManual2);
            }
          }
          
          // Precargar motorización
          if (itemToEdit.detalles.incluirMotorizacion) {
            setIncluirMotorizacion(true);
            if (itemToEdit.detalles.precioMotorizacion) {
              setPrecioMotorizacion(itemToEdit.detalles.precioMotorizacion);
            }
          }
          
          // Precargar colocación
          if (itemToEdit.detalles.incluirColocacion !== undefined) {
            setIncluirColocacion(itemToEdit.detalles.incluirColocacion);
          }
          if (itemToEdit.detalles.precioColocacion) {
            setPrecioColocacion(itemToEdit.detalles.precioColocacion);
          }
          
          // Precargar multiplicador de tela
          if (itemToEdit.detalles.multiplicadorTela) {
            setMultiplicadorTelaLocal(itemToEdit.detalles.multiplicadorTela);
          }
          if (itemToEdit.detalles.cantidadTelaManual) {
            setCantidadTelaManual(itemToEdit.detalles.cantidadTelaManual);
          }
          if (itemToEdit.detalles.aplicarRedondeo !== undefined) {
            setAplicarRedondeo(Boolean(itemToEdit.detalles.aplicarRedondeo));
          }
          
          // Precargar accesorios adicionales
          if (itemToEdit.detalles.accesoriosAdicionales && Array.isArray(itemToEdit.detalles.accesoriosAdicionales)) {
            setAccesoriosAdicionales(itemToEdit.detalles.accesoriosAdicionales);
          }
          
          // Establecer sistemaPedidoDetalles con TODOS los datos disponibles para que los formularios específicos los usen
          const detallesCompletos: any = {
            detalle: itemToEdit.detalles.detalle || '',
            colorSistema: itemToEdit.detalles.colorSistema || '',
            ladoComando: itemToEdit.detalles.ladoComando || '',
            ladoApertura: itemToEdit.detalles.ladoApertura || '',
            instalacion: itemToEdit.detalles.instalacion || '',
            tipoApertura: itemToEdit.detalles.tipoApertura || '',
            caidaPorDelante: itemToEdit.detalles.caidaPorDelante || false,
            soporteIntermedio: itemToEdit.detalles.soporteIntermedio || false,
            soporteDoble: itemToEdit.detalles.soporteDoble || false,
            accesorios: itemToEdit.detalles.accesorios || [],
            accesoriosAdicionales: itemToEdit.detalles.accesoriosAdicionales || [],
            tela: itemToEdit.detalles.tela || null,
            tela2: itemToEdit.detalles.tela2 || null,
            multiplicadorTela: itemToEdit.detalles.multiplicadorTela || null,
            multiplicadorTela2: itemToEdit.detalles.multiplicadorTela2 || null,
            cantidadTelaManual: itemToEdit.detalles.cantidadTelaManual || null,
            cantidadTelaManual2: itemToEdit.detalles.cantidadTelaManual2 || null,
            incluirMotorizacion: itemToEdit.detalles.incluirMotorizacion || false,
            precioMotorizacion: itemToEdit.detalles.precioMotorizacion || 0,
            incluirColocacion: itemToEdit.detalles.incluirColocacion || false,
            precioColocacion: itemToEdit.detalles.precioColocacion || 0
          };
          
          // Para sistemas específicos como Dunes
          if (itemToEdit.detalles.productoDunes || itemToEdit.detalles.telaDunes) {
            detallesCompletos.producto = itemToEdit.detalles.productoDunes;
            detallesCompletos.tela = itemToEdit.detalles.telaDunes;
          }
          
          // Para sistemas Tradicional/Propios
          if (itemToEdit.detalles.sistema && 
              (itemToEdit.detalles.sistema.toLowerCase().includes('tradicional') || 
               itemToEdit.detalles.sistema.toLowerCase().includes('propios'))) {
            detallesCompletos.productoSeleccionado =
              itemToEdit.detalles.productoSeleccionado ||
              itemToEdit.detalles.selectedRielBarral ||
              null;
          }
          
          setSistemaPedidoDetalles(detallesCompletos);
          
          // Precargar producto cabezal (riel/barral) - buscar por ID primero
          const precargarProductoCabezal = async () => {
            const productoId = itemToEdit.detalles.selectedRielBarralId || itemToEdit.detalles.productoSeleccionado?.id;
            const productoObj = itemToEdit.detalles.productoSeleccionado || itemToEdit.detalles.selectedRielBarral;
            
            if (productoObj && typeof productoObj === 'object' && productoObj.id) {
              // Si ya tenemos el objeto completo
              setSelectedRielBarral(productoObj);
              setSearchRielBarral(productoObj.nombreProducto || '');
              console.log('✅ Producto cabezal precargado por objeto:', productoObj.nombreProducto, 'ID:', productoObj.id);
            } else if (productoId) {
              // Si tenemos el ID, buscar el producto por ID desde la API
              try {
                console.log('🔍 Buscando producto cabezal por ID:', productoId);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${productoId}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data && data.id) {
                    setSelectedRielBarral(data);
                    setSearchRielBarral(data.nombreProducto || '');
                    console.log('✅ Producto cabezal encontrado por ID:', data.nombreProducto);
                  }
                }
              } catch (error) {
                console.error('Error al buscar producto cabezal por ID:', error);
              }
            } else if (productoObj && (typeof productoObj === 'string' || productoObj.nombreProducto)) {
              // Fallback: buscar por nombre si no hay ID
              const nombreProducto = typeof productoObj === 'string' ? productoObj : productoObj.nombreProducto;
              setSearchRielBarral(nombreProducto);
              console.log('🔍 Buscando producto cabezal por nombre:', nombreProducto);
              
              // Intentar encontrar el producto en productosFiltrados
              if (productosFiltrados && Array.isArray(productosFiltrados) && productosFiltrados.length > 0) {
                const productoEncontrado = productosFiltrados.find((p: any) => 
                  p.nombreProducto?.toLowerCase().includes(nombreProducto.toLowerCase()) ||
                  nombreProducto.toLowerCase().includes(p.nombreProducto?.toLowerCase() || '')
                );
                if (productoEncontrado) {
                  setSelectedRielBarral(productoEncontrado);
                  console.log('✅ Producto cabezal encontrado en productosFiltrados:', productoEncontrado.nombreProducto);
                }
              }
            }
          };
          
          await precargarProductoCabezal();
          
          // Precargar soporte intermedio - buscar por ID primero, luego en la lista de soportesIntermedios
          const precargarSoporteIntermedio = async () => {
            // Precargar si hay ID o producto guardado (aunque el booleano sea false)
            const tieneSoporteIntermedioGuardado = itemToEdit.detalles.soporteIntermedio === true || 
                                                   Boolean(itemToEdit.detalles.soporteIntermedioId) || 
                                                   Boolean(itemToEdit.detalles.soporteIntermedioTipo);
            
            if (!tieneSoporteIntermedioGuardado) {
              console.log('ℹ️ Soporte intermedio no está guardado, no se precarga');
              return;
            }
            
            const soporteId = itemToEdit.detalles.soporteIntermedioId;
            const soporteObj = itemToEdit.detalles.soporteIntermedioTipo;
            
            // Primero intentar buscar en la lista de soportesIntermedios si ya está cargada
            if (soportesIntermedios.length > 0 && soporteId) {
              const soporteEncontrado = soportesIntermedios.find(
                s => Number(s.id) === Number(soporteId)
              );
              if (soporteEncontrado) {
                setSelectedSoporteIntermedio(soporteEncontrado);
                console.log('✅ Soporte intermedio precargado desde lista:', soporteEncontrado.nombre, 'ID:', soporteEncontrado.id);
                return; // Ya encontramos el soporte, no necesitamos buscar más
              }
            }
            
            if (soporteObj && typeof soporteObj === 'object' && soporteObj.id) {
              // Si ya tenemos el objeto completo, verificar si está en la lista
              if (soportesIntermedios.length > 0) {
                const soporteEncontrado = soportesIntermedios.find(
                  s => Number(s.id) === Number(soporteObj.id)
                );
                if (soporteEncontrado) {
                  setSelectedSoporteIntermedio(soporteEncontrado);
                  console.log('✅ Soporte intermedio precargado por objeto (encontrado en lista):', soporteEncontrado.nombre, 'ID:', soporteEncontrado.id);
                  return;
                }
              }
              // Si no está en la lista, usar el objeto directamente
              setSelectedSoporteIntermedio(soporteObj);
              console.log('✅ Soporte intermedio precargado por objeto:', soporteObj.nombre || soporteObj.nombreProducto, 'ID:', soporteObj.id);
            } else if (soporteId) {
              // Si tenemos el ID, buscar el producto por ID desde la API
              try {
                console.log('🔍 Buscando soporte intermedio por ID:', soporteId);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${soporteId}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data && data.id) {
                    // Verificar si está en la lista de soportesIntermedios
                    if (soportesIntermedios.length > 0) {
                      const soporteEncontrado = soportesIntermedios.find(
                        s => Number(s.id) === Number(data.id)
                      );
                      if (soporteEncontrado) {
                        setSelectedSoporteIntermedio(soporteEncontrado);
                        console.log('✅ Soporte intermedio encontrado por ID (encontrado en lista):', soporteEncontrado.nombre);
                        return;
                      }
                    }
                    // Si no está en la lista, usar el objeto de la API
                    setSelectedSoporteIntermedio(data);
                    console.log('✅ Soporte intermedio encontrado por ID:', data.nombreProducto);
                  }
                }
              } catch (error) {
                console.error('Error al buscar soporte intermedio por ID:', error);
              }
            }
          };
          
          await precargarSoporteIntermedio();
          
          // Precargar soporte doble - solo si el booleano es true
          const precargarSoporteDoble = async () => {
            // IMPORTANTE: Solo precargar si el booleano soporteDoble es explícitamente true
            if (itemToEdit.detalles.soporteDoble !== true) {
              console.log('ℹ️ Soporte doble no está guardado (booleano false o undefined), no se precarga');
              return;
            }
            
            const soporteId = itemToEdit.detalles.soporteDobleProductoId;
            const soporteObj = itemToEdit.detalles.soporteDobleProducto;
            
            // Si el soporte doble está guardado, asegurar que el soporte intermedio esté desactivado
            if (itemToEdit.detalles.soporteIntermedio || itemToEdit.detalles.soporteIntermedioId || itemToEdit.detalles.soporteIntermedioTipo) {
              console.log('⚠️ Desactivando soporte intermedio porque soporte doble está guardado');
              setSoporteIntermedio(false);
              setSelectedSoporteIntermedio(null);
            }
            
            if (soporteObj && typeof soporteObj === 'object' && soporteObj.id) {
              // Si ya tenemos el objeto completo
              setSoporteDobleProducto(soporteObj);
              console.log('✅ Soporte doble precargado por objeto:', soporteObj.nombre || soporteObj.nombreProducto, 'ID:', soporteObj.id);
            } else if (soporteId) {
              // Si tenemos el ID, buscar el producto por ID desde la API
              try {
                console.log('🔍 Buscando soporte doble por ID:', soporteId);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${soporteId}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data && data.id) {
                    setSoporteDobleProducto(data);
                    console.log('✅ Soporte doble encontrado por ID:', data.nombreProducto);
                  }
                }
              } catch (error) {
                console.error('Error al buscar soporte doble por ID:', error);
              }
            } else if (soporteDobleProductoDisponible) {
              // Si no hay producto guardado pero el booleano es true, usar el producto disponible
              setSoporteDobleProducto(soporteDobleProductoDisponible);
              console.log('✅ Soporte doble precargado usando producto disponible:', soporteDobleProductoDisponible.nombre);
            }
          };
          
          await precargarSoporteDoble();
          
          // Precargar segundo cabezal si existe
          const precargarSegundoCabezal = async () => {
            const segundoCabezalId = itemToEdit.detalles.selectedSegundoCabezalId;
            const segundoCabezalObj = itemToEdit.detalles.selectedSegundoCabezal;
            
            if (segundoCabezalObj && typeof segundoCabezalObj === 'object' && segundoCabezalObj.id) {
              // Si ya tenemos el objeto completo
              setSelectedSegundoCabezal(segundoCabezalObj);
              setSearchSegundoCabezal(segundoCabezalObj.nombreProducto || '');
              console.log('✅ Segundo cabezal precargado por objeto:', segundoCabezalObj.nombreProducto, 'ID:', segundoCabezalObj.id);
            } else if (segundoCabezalId) {
              // Si tenemos el ID, buscar el producto por ID desde la API
              try {
                console.log('🔍 Buscando segundo cabezal por ID:', segundoCabezalId);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${segundoCabezalId}`);
                if (response.ok) {
                  const data = await response.json();
                  if (data && data.id) {
                    setSelectedSegundoCabezal(data);
                    setSearchSegundoCabezal(data.nombreProducto || '');
                    console.log('✅ Segundo cabezal encontrado por ID:', data.nombreProducto);
                  }
                }
              } catch (error) {
                console.error('Error al buscar segundo cabezal por ID:', error);
              }
            }
          };
          
          await precargarSegundoCabezal();
        }
        
        console.log('✅ Precarga de detalles completada');
      };
      
      precargarDetalles();
    }
  }, [sistemaCargado, itemToEdit, isOpen, productosFiltrados, soportesIntermedios, soporteDobleProductoDisponible]);

  const handleBuscarProducto = async (value: string) => {
    console.log('[DEBUG] handleBuscarProducto called with:', value, selectedSistema);
    setSearchRielBarral(value);
    setShowRielesBarralesList(true);
    
    // Permitir búsqueda si es '*' (con o sin espacios) o si hay texto
    const isAsterisk = value.trim() === '*';
    
    const sistemaKey = selectedSistema?.toLowerCase();
    // Usar sistemaToApiParamsProductos para buscar productos/sistemas/soportes
    if (!sistemaKey || !sistemaToApiParamsProductos[sistemaKey]) {
      console.log('[DEBUG] No sistema seleccionado o no hay mapeo', selectedSistema, 'key usado:', sistemaKey);
      setRielesBarrales([]);
      setShowRielesBarralesList(false);
      return;
    }
    
    // Si no hay valor y no es '*', limpiar resultados
    if (!value.trim() && !isAsterisk) {
      setRielesBarrales([]);
      setShowRielesBarralesList(false);
      return;
    }
    
    const { sistemaId, rubroId, proveedorId } = sistemaToApiParamsProductos[sistemaKey];
    // Si el valor es '*', buscar todos los productos (q=*)
    const queryParam = isAsterisk ? '*' : encodeURIComponent(value);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${queryParam}`;
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

  // Función para buscar segundo cabezal (similar a handleBuscarProducto)
  const handleBuscarSegundoCabezal = async (value: string) => {
    console.log('[DEBUG] handleBuscarSegundoCabezal called with:', value, selectedSistema);
    setSearchSegundoCabezal(value);
    setShowSegundosCabezalesList(true);
    
    // Permitir búsqueda si es '*' (con o sin espacios) o si hay texto
    const isAsterisk = value.trim() === '*';
    
    const sistemaKey = selectedSistema?.toLowerCase();
    // Usar sistemaToApiParamsProductos para buscar productos/sistemas/soportes
    if (!sistemaKey || !sistemaToApiParamsProductos[sistemaKey]) {
      console.log('[DEBUG] No sistema seleccionado o no hay mapeo', selectedSistema, 'key usado:', sistemaKey);
      setSegundosCabezales([]);
      setShowSegundosCabezalesList(false);
      return;
    }
    
    // Si no hay valor y no es '*', limpiar resultados
    if (!value.trim() && !isAsterisk) {
      setSegundosCabezales([]);
      setShowSegundosCabezalesList(false);
      return;
    }

    // Para cortinas Tradicional/Propios, usar exactamente la misma lógica de búsqueda
    // que el input de Riel/Barral del PropiosForm (según tipoArmado).
    const sistemaLower = selectedSistema?.toLowerCase() || '';
    const esTradicionalPropios =
      sistemaLower.includes('tradicional') || sistemaLower.includes('propios');
    if (esTradicionalPropios) {
      const tipoArmado = (sistemaPedidoDetalles?.tipoArmado || '').toString().toLowerCase();
      const queryParam = isAsterisk ? '*' : encodeURIComponent(value);

      try {
        let url = '';

        if (tipoArmado === 'riel') {
          // Igual que PropiosForm.handleBuscarRiel cuando selectedTab === 'riel'
          url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?rubroId=5&q=${queryParam}`;
        } else if (tipoArmado === 'barral') {
          // Igual que PropiosForm.handleBuscarRiel cuando selectedTab === 'barral'
          url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=10&rubroId=6&proveedorId=8&q=${queryParam}`;
        } else {
          // Fallback: inferir rubro desde el cabezal seleccionado si no hay tipoArmado
          const rubroIdRaw = (selectedRielBarral as any)?.rubro_id ?? (selectedRielBarral as any)?.rubroId;
          const rubroId = rubroIdRaw !== undefined && rubroIdRaw !== null ? String(rubroIdRaw) : null;
          if (!rubroId) {
            setSegundosCabezales([]);
            setShowSegundosCabezalesList(false);
            return;
          }
          url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?rubroId=${rubroId}&q=${queryParam}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        console.log(`[Busqueda Segundo Cabezal][Trad/Propios] Input: "${value}" | Ruta: ${url} | Respuesta:`, data);
        setSegundosCabezales(Array.isArray(data.data) ? data.data : []);
        return;
      } catch (err) {
        console.error('Error al buscar segundo cabezal (Trad/Propios):', err);
        setSegundosCabezales([]);
        setShowSegundosCabezalesList(false);
        return;
      }
    }

    const { sistemaId, rubroId, proveedorId } = sistemaToApiParamsProductos[sistemaKey];
    // Si el valor es '*', buscar todos los productos (q=*)
    const queryParam = isAsterisk ? '*' : encodeURIComponent(value);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/presupuestos/productos-filtrados?sistemaId=${sistemaId}&rubroId=${rubroId}&proveedorId=${proveedorId}&q=${queryParam}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`[Busqueda Segundo Cabezal] Input: "${value}" | Ruta: ${url} | Respuesta:`, data);
    setSegundosCabezales(Array.isArray(data.data) ? data.data : []);
  };

  const handleKeyDownSegundoCabezal = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSegundosCabezalesList(false);
    }
  };

  // Justo después de los useState existentes
  const [showCambioSistema, setShowCambioSistema] = useState(false);
  const [nombreSistemaCambio, setNombreSistemaCambio] = useState("");

  // Justo antes del return principal de GenerarPedidoModal
  // Si el valor de búsqueda es '*', mostrar todos los productos sin filtrar
  const sugerenciasFiltradas = searchRielBarral.trim() === '*' 
    ? rielesBarrales
    : rielesBarrales.filter(item =>
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

  // Escuchar cambios de productos desde PropiosForm
  useEffect(() => {
    if (sistemaPedidoDetalles?.productoSeleccionado && 
        (selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios'))) {
      console.log('🎯 Producto seleccionado desde PropiosForm:', sistemaPedidoDetalles.productoSeleccionado);
      setSelectedRielBarral(sistemaPedidoDetalles.productoSeleccionado);
    }
  }, [sistemaPedidoDetalles?.productoSeleccionado, selectedSistema]);

  // Función para agrupar accesorios por nombre y sumar cantidades
  const agruparAccesorios = (accesorios: any[]) => {
    const accesoriosAgrupados = new Map();
    
    accesorios.forEach(acc => {
      const nombre = acc.nombreProducto;
      const precio = Number(acc.precio);
      const cantidadAccesorio = acc.cantidad || 1;
      
      if (accesoriosAgrupados.has(nombre)) {
        // Si ya existe, sumar cantidades
        const existente = accesoriosAgrupados.get(nombre);
        existente.cantidad += cantidadAccesorio;
        existente.precioTotal = existente.precioUnitario * existente.cantidad;
      } else {
        // Si es nuevo, agregarlo
        accesoriosAgrupados.set(nombre, {
          nombreProducto: nombre,
          precioUnitario: precio,
          cantidad: cantidadAccesorio,
          precioTotal: precio * cantidadAccesorio
        });
      }
    });
    
    return Array.from(accesoriosAgrupados.values());
  };

  // Calcular total de accesorios (esta es la versión para el resumen)
  // Para el resumen, mostramos el precio base de los accesorios (sin multiplicar por cantidad)
  const totalAccesoriosAdicionales = accesoriosAdicionales.reduce(
    (sum, acc) => sum + (Number(acc.precio) * (acc.cantidad || 1)),
    0
  );

  // Usar el multiplicador local de tela
  const multiplicadorTela = multiplicadorTelaLocal;

  // Calcular la cantidad de tela multiplicada
  const anchoTelaMultiplicado = ancho && multiplicadorTela ? (Number(ancho) * multiplicadorTela) : Number(ancho);

  // Calcular el precio de la tela usando el ancho multiplicado
  const calcularPrecioTelaMultiplicada = () => {
    if (!selectedTela) return 0;
    if (cantidadTelaManual && cantidadTelaManual > 0) {
      return cantidadTelaManual * (selectedTela.precio ? Number(selectedTela.precio) : 0);
    }
    if (!ancho || !alto) return 0;
    
    // NO aplicar ancho mínimo a las telas - usar el ancho ingresado originalmente
    const anchoIngresado = Number(ancho);
    
    // Para sistemas Propios/Tradicional, usar el ancho original con multiplicador
    // Para otros sistemas, usar el ancho multiplicado
    const anchoACalcular = (selectedSistema && (selectedSistema.toLowerCase().includes('propios') || selectedSistema.toLowerCase().includes('tradicional'))) 
      ? anchoIngresado 
      : anchoTelaMultiplicado;
    
    return calcularPrecioTela(
      anchoACalcular,
      Number(alto),
      selectedTela?.precio ? Number(selectedTela.precio) : 0,
      selectedTela?.nombreProducto === 'ROLLER',
      selectedSistema
    );
  };

  // 1. Agrega el estado en el componente principal:
  const [cantidadTelaManual, setCantidadTelaManual] = useState<number | null>(null);

  // Agregar estos estados junto a los otros estados existentes
  const [incluirMotorizacion, setIncluirMotorizacion] = useState(false);
  const [precioMotorizacion, setPrecioMotorizacion] = useState<number>(0);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleClose}
      size="4xl"
      scrollBehavior="inside"
      hideCloseButton={true}
      isDismissable={false}
      shouldBlockScroll={true}
    >
      <ModalContent className="max-h-[90vh] rounded-lg h-98 m-2 w-[85vw] max-w-[1400px]">
        {(onClose) => {
          return (
            <>
              <ModalHeader className="sticky top-0 z-20 bg-white dark:bg-dark-card rounded-t-lg border-b dark:border-dark-border flex justify-between items-center">
                <span>{itemToEdit ? "Modificar Pedido" : "Generar Pedido"}</span>
                <Button
                  isIconOnly
                  variant="flat"
                  color="danger"
                  size="sm"
                  onPress={handleClose}
                  aria-label="Cerrar modal"
                >
                  ×
                </Button>
              </ModalHeader>
              
              <ModalBody className="overflow-y-auto px-10 py-4">
                <div className="space-y-6">
                  {/* PARTE 1: Inputs generales */}
                  <div className="space-y-4">
                    <div>
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

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        type="number"
                        label="Cantidad"
                        value={cantidad}
                        onValueChange={setCantidad}
                        variant="bordered"
                        size="sm"
                        onWheel={(e) => {
                          e.currentTarget.blur();
                          e.preventDefault();
                        }}
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
                          onWheel={(e) => {
                            e.currentTarget.blur();
                            e.preventDefault();
                          }}
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
                          onWheel={(e) => {
                            e.currentTarget.blur();
                            e.preventDefault();
                          }}
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

                    {/* Selector de Espacio/Ambiente */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Select
                        label="Espacio/Ambiente"
                        placeholder="Seleccione el espacio"
                        selectedKeys={espacio ? new Set([espacio]) : new Set([])}
                        onSelectionChange={(keys) => {
                          const selectedValues = Array.from(keys) as string[];
                          if (selectedValues.length > 0) {
                            setEspacio(selectedValues[0]);
                          }
                        }}
                      >
                        {ESPACIOS.map((esp) => (
                          <SelectItem key={esp} textValue={esp}>
                            {esp}
                          </SelectItem>
                        ))}
                      </Select>
                      
                      {/* Campo adicional para cuando se selecciona "Otro" */}
                      {espacio === "Otro" && (
                        <Input
                          label="Especifique espacio"
                          placeholder="Ej: Balcón, Estudio, Terraza"
                          value={espacioPersonalizado || ""}
                          onValueChange={(value) => setEspacioPersonalizado(value)}
                          className="max-w-full"
                        />
                      )}
                    </div>

                    {selectedArticulo && (
                      <Alert color="primary" className="my-2 flex items-center">
                        <span>Artículo recomendado: <b className="ml-1">{selectedArticulo}</b></span>
                      </Alert>
                    )}

                    {/* Input de rieles y barrales debajo del select de artículo */}
                    {selectedSistema && !selectedSistema.toLowerCase().includes('tradicional / propios') && !selectedSistema.toLowerCase().includes('riel') && !selectedSistema.toLowerCase().includes('dunes') && (
                      <div className="mt-4">
                        <Input
                          label="Agregar Producto"
                          placeholder="Escribe para buscar productos o * para ver todos..."
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
                        {showRielesBarralesList && searchRielBarral.trim().length > 0 && (
                          sugerenciasFiltradas.length > 0 ? (
                            <div className="overflow-y-auto mt-2 max-h-48 rounded-lg border bg-gray-100 dark:bg-dark-card z-[1050] relative">
                              {sugerenciasFiltradas.map(item => (
                                <button
                                  key={item.id}
                                  className="p-2 w-full text-left border-b border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 last:border-b-0"
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
                                  <div className="font-medium text-gray-900 dark:text-dark-text">{item.nombreProducto} ${Number(item.precio).toLocaleString()}</div>
                                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                    {item.descripcion && <span className="text-gray-500 dark:text-dark-text-secondary">{item.descripcion}</span>}
                                    {item.precio && <span className="ml-2">Precio: ${item.precio}</span>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 max-h-48 rounded-lg border bg-gray-100 dark:bg-dark-card z-[1050] relative flex items-center justify-center p-4 text-gray-500 dark:text-dark-text-secondary">
                              Sin resultados
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Input específico para sistema Riel */}
                    {selectedSistema && selectedSistema.toLowerCase().includes('riel') && !selectedSistema.toLowerCase().includes('dunes') && (
                      <div className="mt-4">
                        <Input
                          label="Buscar Productos de Riel"
                          placeholder="Escribe para buscar rieles o * para ver todos..."
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
                        {showRielesBarralesList && searchRielBarral.trim().length > 0 && (
                          sugerenciasFiltradas.length > 0 ? (
                            <div className="overflow-y-auto mt-2 max-h-48 rounded-lg border bg-gray-100 dark:bg-dark-card z-[1050] relative">
                              {sugerenciasFiltradas.map(item => (
                                <button
                                  key={item.id}
                                  className="p-2 w-full text-left border-b border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 last:border-b-0"
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
                                  <div className="font-medium text-gray-900 dark:text-dark-text">{item.nombreProducto} ${Number(item.precio).toLocaleString()}</div>
                                  <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                    {item.descripcion && <span className="text-gray-500 dark:text-dark-text-secondary">{item.descripcion}</span>}
                                    {item.precio && <span className="ml-2">Precio: ${item.precio}</span>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 max-h-48 rounded-lg border bg-gray-100 dark:bg-dark-card z-[1050] relative flex items-center justify-center p-4 text-gray-500 dark:text-dark-text-secondary">
                              Sin resultados
                            </div>
                          )
                        )}
                      </div>
                    )}

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
                                  onSoporteIntermedioChange={handleSoporteIntermedioChange}
                                  onSoporteDobleChange={handleSoporteDobleChange}
                                  onPedidoDetailsChange={setSistemaPedidoDetalles}
                                  soporteIntermedioTipo={selectedSoporteIntermedio}
                                  soportesIntermedios={soportesIntermedios}
                                  onSoporteIntermedioTipoChange={handleSoporteIntermedioTipoChange}
                                  productosFiltrados={productosFiltrados}
                                  soporteDobleProducto={soporteDobleProducto}
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
                            case "tradicional / propios":
                              return (
                                <PropiosForm
                                  ancho={ancho}
                                  alto={alto}
                                  cantidad={cantidad}
                                  selectedArticulo={selectedArticulo}
                                  detalle={detalle}
                                  onDetalleChange={setDetalle}
                                  onPedidoDetailsChange={setSistemaPedidoDetalles}
                                  onProductoSelect={setSelectedRielBarral}
                                  onAccesoriosAdicionalesChange={setAccesoriosAdicionales}
                                />
                              );
                            case "tradicional":
                              return (
                                <PropiosForm
                                  ancho={ancho}
                                  alto={alto}
                                  cantidad={cantidad}
                                  selectedArticulo={selectedArticulo}
                                  detalle={detalle}
                                  onDetalleChange={setDetalle}
                                  onPedidoDetailsChange={setSistemaPedidoDetalles}
                                  onProductoSelect={setSelectedRielBarral}
                                  onAccesoriosAdicionalesChange={setAccesoriosAdicionales}
                                />
                              );
                            default:
                              // console.log('Sistema no coincide:', selectedSistema);
                              return (
                                <div className="p-4 text-center text-gray-500 dark:text-dark-text-secondary">
                                  Formulario para {selectedSistema} en desarrollo...
                                </div>
                              );
                          }
                        })()}
                      </div>
                    )}

                    {/* PARTE 3: Buscador de telas (no visible para Veneciana ni Dunes) */}
                    {selectedSistema && !selectedSistema.toLowerCase().includes('veneciana') && !selectedSistema.toLowerCase().includes('dunes') && (
                      <TelasSearch
                        searchTela={searchTela}
                        onSearchChange={handleTelaSearch}
                        telasFiltradas={telasFiltradas as unknown as Tela[]}
                        showTelasList={showTelasList}
                        onTelaSelect={(tela: Tela) => {
                          setSelectedTela(tela);
                          setSearchTela(tela.nombreProducto);
                          setShowTelasList(false);
                        }}
                        multiplicadorTela={multiplicadorTelaLocal}
                        onMultiplicadorChange={setMultiplicadorTelaLocal}
                        cantidadTelaManual={cantidadTelaManual}
                        onCantidadTelaManualChange={setCantidadTelaManual}
                        selectedSistema={selectedSistema}
                        sistemaId={sistemaToApiParams[selectedSistema?.toLowerCase() || '']?.sistemaId}
                        rubroId={sistemaToApiParams[selectedSistema?.toLowerCase() || '']?.rubroId}
                        proveedorId={sistemaToApiParams[selectedSistema?.toLowerCase() || '']?.proveedorId}
                      />
                    )}

                    {/* PARTE 3.1: Buscador de segunda tela (para cortinas tradicionales/propios o Roller con soporte doble) */}
                    {selectedSistema && (
                      (selectedSistema.toLowerCase().includes('tradicional') || selectedSistema.toLowerCase().includes('propios')) ||
                      (selectedSistema.toLowerCase().includes('roller') && soporteDoble)
                    ) && (
                      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-dark-border">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text">Segunda Tela (Opcional)</h4>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                          {selectedSistema.toLowerCase().includes('roller') && soporteDoble
                            ? "Agregue una segunda tela para el soporte doble."
                            : "Agregue una segunda tela si necesita una tela fina y otra que oscurezca el ambiente."}
                        </p>
                        <TelasSearch
                          searchTela={searchTela2}
                          onSearchChange={handleTelaSearch2}
                          telasFiltradas={telasFiltradas2 as unknown as Tela[]}
                          showTelasList={showTelasList2}
                          onTelaSelect={(tela: Tela) => {
                            setSelectedTela2(tela);
                            setSearchTela2(tela.nombreProducto);
                            setShowTelasList2(false);
                          }}
                          multiplicadorTela={multiplicadorTela2}
                          onMultiplicadorChange={setMultiplicadorTela2}
                          cantidadTelaManual={cantidadTelaManual2}
                          onCantidadTelaManualChange={setCantidadTelaManual2}
                          selectedSistema={selectedSistema}
                          sistemaId={sistemaToApiParams[selectedSistema?.toLowerCase() || '']?.sistemaId}
                          rubroId={sistemaToApiParams[selectedSistema?.toLowerCase() || '']?.rubroId}
                          proveedorId={sistemaToApiParams[selectedSistema?.toLowerCase() || '']?.proveedorId}
                        />
                      </div>
                    )}

                    {/* PARTE 3.2: Buscador de segundo cabezal (para cortinas tradicionales/propios o Roller con soporte doble) */}
                    {selectedSistema && (
                      (selectedSistema.toLowerCase().includes('tradicional') || selectedSistema.toLowerCase().includes('propios')) ||
                      (selectedSistema.toLowerCase().includes('roller') && soporteDoble)
                    ) && (
                      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-dark-border">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text">Segundo Cabezal (Opcional)</h4>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                          {selectedSistema.toLowerCase().includes('roller') && soporteDoble
                            ? "Agregue un segundo cabezal para el soporte doble."
                            : "Agregue un segundo cabezal si necesita un cabezal adicional."}
                        </p>
                        <Input
                          label="Segundo Cabezal"
                          placeholder="Escribe para buscar productos o * para ver todos..."
                          value={searchSegundoCabezal}
                          onValueChange={handleBuscarSegundoCabezal}
                          onKeyDown={handleKeyDownSegundoCabezal}
                          size="sm"
                          startContent={
                            <div className="flex items-center pointer-events-none">
                              <span className="text-default-400 text-small">🔍</span>
                            </div>
                          }
                          endContent={
                            selectedSegundoCabezal && (
                              <button
                                type="button"
                                className="px-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                aria-label="Quitar segundo cabezal"
                                onClick={() => {
                                  setSelectedSegundoCabezal(null);
                                  setSearchSegundoCabezal("");
                                  setShowSegundosCabezalesList(false);
                                }}
                              >
                                ×
                              </button>
                            )
                          }
                        />
                        {showSegundosCabezalesList && searchSegundoCabezal.trim().length > 0 && (
                          (() => {
                            const sugerenciasFiltradasSegundoCabezal = searchSegundoCabezal.trim() === '*' 
                              ? segundosCabezales
                              : segundosCabezales.filter(item =>
                                  item.nombreProducto.toLowerCase().includes(searchSegundoCabezal.toLowerCase()) ||
                                  (item.descripcion && item.descripcion.toLowerCase().includes(searchSegundoCabezal.toLowerCase()))
                                );
                            
                            return sugerenciasFiltradasSegundoCabezal.length > 0 ? (
                              <div className="overflow-y-auto mt-2 max-h-48 rounded-lg border bg-gray-100 dark:bg-dark-card z-[1050] relative">
                                {sugerenciasFiltradasSegundoCabezal.map((item) => (
                                  <div
                                    key={item.id}
                                    role="option"
                                    tabIndex={0}
                                    className="px-4 py-2 border-b border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/50 last:border-b-0"
                                    onClick={() => {
                                      setSelectedSegundoCabezal(item);
                                      setSearchSegundoCabezal(item.nombreProducto);
                                      setShowSegundosCabezalesList(false);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setSelectedSegundoCabezal(item);
                                        setSearchSegundoCabezal(item.nombreProducto);
                                        setShowSegundosCabezalesList(false);
                                      }
                                    }}
                                    aria-selected={selectedSegundoCabezal?.id === item.id}
                                  >
                                    <div className="font-semibold text-gray-900 dark:text-dark-text">{item.nombreProducto}</div>
                                    {item.descripcion && (
                                      <div className="text-sm text-gray-600 dark:text-dark-text-secondary">{item.descripcion}</div>
                                    )}
                                    <div className="text-sm text-blue-600 dark:text-primary font-medium">
                                      ${Number(item.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null;
                          })()
                        )}
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
                                <span>
                                  {(() => {
                                    const areaReal = (Number(ancho) / 100) * (Number(alto) / 100);
                                    const areaConMinimo = Math.max(areaReal, 1.0);
                                    return areaConMinimo > areaReal 
                                      ? `${areaConMinimo.toFixed(2)} m² (mínimo aplicado)`
                                      : `${areaReal.toFixed(2)} m²`;
                                  })()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Precio sistema:</span>
                                <span>${precioSistema.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Precio tela:</span>
                                <span>{selectedTela ? `${selectedTela.nombreProducto} - $${Number(selectedTela.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}</span>
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

                                        {/* Resumen de precios específico para Dunes */}


                    {/* Resumen de precios general */}
                    {selectedSistema && ancho && alto && (() => {
                      // Verificar si se aplica ancho mínimo (declarar fuera de los condicionales)
                      const anchoIngresado = Number(ancho);
                      const { anchoEfectivo, aplicaMinimo } = getAnchoEfectivo(selectedSistema, anchoIngresado);
                      const anchoMinimo = getAnchoMinimo(selectedSistema);
                      
                      return (
                            <div className="p-4 mt-4 bg-gray-50 dark:bg-dark-card rounded-lg border dark:border-dark-border">
                                                              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-dark-text">Resumen de Precios</h3>
                              <div className="space-y-2">
                                {(() => {
                                  // Lógica específica para Dunes
                                  if (selectedSistema?.toLowerCase().includes('dunes')) {
                                    const productoDunes = sistemaPedidoDetalles?.producto;
                                    const telaDunes = sistemaPedidoDetalles?.tela;
                                    
                                    if (productoDunes && telaDunes) {
                                      return (
                                        <>
                                          {/* Producto Dunes */}
                                          <div className="flex justify-between items-center">
                                            <span className="flex gap-2 items-center">
                                              {productoDunes.nombreProducto} ${Number(productoDunes.precio).toLocaleString()} ({ancho}cm)
                                              <button
                                                type="button"
                                                className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                                aria-label="Quitar producto Dunes"
                                                onClick={() => {
                                                  setSistemaPedidoDetalles(null);
                                                }}
                                              >
                                                ×
                                              </button>
                                            </span>
                                            <span className="font-medium">
                                              ${precioSistema.toLocaleString()}
                                            </span>
                                          </div>
                                          
                                          {/* Detalle del precio del sistema */}
                                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-dark-text-secondary">
                                            <span>Sistema: ({Number(ancho)/100}) × ${Number(productoDunes.precio).toLocaleString()}/m = ${precioSistema.toLocaleString()}</span>
                                          </div>
                                          
                                          {/* Tela Dunes */}
                                          <div className="flex justify-between items-center">
                                            <span className="flex gap-2 items-center">
                                              {telaDunes.nombreProducto} ({ancho}cm × {alto}cm)
                                              <button
                                                type="button"
                                                className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                                aria-label="Quitar tela Dunes"
                                                onClick={() => {
                                                  setSistemaPedidoDetalles(null);
                                                }}
                                              >
                                                ×
                                              </button>
                                            </span>
                                            <span className="font-medium">
                                              ${precioTela.toLocaleString()}
                                            </span>
                                          </div>
                                          
                                          {/* Detalle del precio de la tela */}
                                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-dark-text-secondary">
                                            <span>Tela: ({Number(ancho)/100} × {Number(alto)/100}) × ${Number(telaDunes.precio).toLocaleString()}/m² = ${precioTela.toLocaleString()}</span>
                                          </div>
                                        </>
                                      );
                                    }
                                  }
                                  
                                  // Obtener el producto seleccionado (puede venir de selectedRielBarral o de sistemaPedidoDetalles)
                                  let productoSeleccionado = selectedRielBarral;
                                  if ((selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios')) && 
                                      sistemaPedidoDetalles?.productoSeleccionado) {
                                    productoSeleccionado = sistemaPedidoDetalles.productoSeleccionado;
                                  }
                                  
                                  return selectedSistema.toLowerCase().includes('veneciana') ? (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="flex gap-2 items-center">
                                          {productoSeleccionado?.nombreProducto ? `${productoSeleccionado.nombreProducto} $${Number(productoSeleccionado.precio).toLocaleString()}` : selectedSistema.toUpperCase()} ({ancho}cm x {alto}cm)
                                          {aplicaMinimo && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                              Ancho mínimo: {anchoMinimo}cm
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                            aria-label="Quitar sistema Veneciana"
                                            onClick={() => {
                                              if (productoSeleccionado && sistemaPedidoDetalles?.productoSeleccionado) {
                                                setSistemaPedidoDetalles(null);
                                              } else {
                                                setSelectedRielBarral(null);
                                                setSearchRielBarral("");
                                              }
                                            }}
                                          >
                                            ×
                                          </button>
                                        </span>
                                        <span className="font-medium">
                                          ${((calcularPrecioSistema() || 0) * Number(cantidad || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-dark-text-secondary">
                                        <span>Fórmula: (ancho/100 × alto/100) × precio base × cantidad</span>
                                        <span>
                                          ({(Number(ancho)/100).toFixed(2)} × {(Number(alto)/100).toFixed(2)}) × {productoSeleccionado?.precio || 0} × {cantidad}
                                        </span>
                                      </div>
                                      {aplicaMinimo && (
                                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                          ⚠️ Se aplica ancho mínimo de {anchoMinimo}cm (ingresado: {ancho}cm)
                                        </div>
                                      )}
                                    </>
                                  ) : productoSeleccionado ? (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex justify-between items-center">
                                        <span className="flex gap-2 items-center">
                                          {productoSeleccionado.nombreProducto} ${Number(productoSeleccionado.precio).toLocaleString()} ({ancho}cm){Number(cantidad) > 1 ? ` x${cantidad}` : ''}
                                          {aplicaMinimo && (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                              Ancho mínimo: {anchoMinimo}cm
                                            </span>
                                          )}
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
                                          ${(() => {
                                            const precioBase1 = Number(productoSeleccionado.precio);
                                            const esTradicionalPropios =
                                              selectedSistema?.toLowerCase().includes('tradicional') ||
                                              selectedSistema?.toLowerCase().includes('propios');
                                            const aplicaTelaDoble = !!selectedTela2 && esTradicionalPropios;
                                            const precioBase2 = selectedSegundoCabezal?.precio ? Number(selectedSegundoCabezal.precio) : 0;
                                            const precioBaseUsado = aplicaTelaDoble ? Math.max(precioBase1, precioBase2) : precioBase1;
                                            const anchoMetros = anchoEfectivo / 100;
                                            const altoMetros = Number(alto) / 100;
                                            
                                            // Para todos los sistemas, calcular por metro lineal (ancho) con mínimos aplicados
                                            return (precioBaseUsado * anchoMetros * Number(cantidad)).toLocaleString();
                                          })()}
                                        </span>
                                      </div>
                                      {aplicaMinimo && (
                                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                          ⚠️ Se aplica ancho mínimo de {anchoMinimo}cm (ingresado: {ancho}cm)
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex justify-between items-center">
                                      <span>
                                        {selectedSistema.toLowerCase().includes('veneciana')
                                          ? `Sistema (${ancho}cm × ${alto}cm):`
                                          : `Sistema (${ancho}cm):`}
                                      </span>
                                      <span className="font-medium text-gray-500 dark:text-dark-text-secondary">
                                        Seleccione un producto para ver el precio
                                      </span>
                                    </div>
                                  );
                                })()}

                          {/* Mostrar tela para sistemas que no sean Veneciana (excluyendo Dunes que ya se muestra arriba) */}
                          {(() => {
                            // Para otros sistemas, mostrar selectedTela si existe
                            if (selectedTela && !selectedSistema.toLowerCase().includes('veneciana') && !selectedSistema.toLowerCase().includes('dunes')) {
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <span className="flex gap-2 items-center">
                                      {selectedTela.nombreProducto} - ${Number(selectedTela.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      {(() => {
                                        // Para sistemas Propios/Tradicional, mostrar el ancho multiplicado
                                        if (selectedSistema && (selectedSistema.toLowerCase().includes('propios') || selectedSistema.toLowerCase().includes('tradicional'))) {
                                          const anchoMultiplicado = Number(ancho) * (multiplicadorTelaLocal || 1);
                                          return `(${ancho}cm x ${multiplicadorTelaLocal || 1} = ${anchoMultiplicado}cm)`;
                                        } else {
                                          return `(${ancho}cm x ${alto}cm)`;
                                        }
                                      })()}
                                      {(() => {
                                        // Mostrar información de mínimo aplicado para Roller y Bandas Verticales
                                        const sistemaLower = selectedSistema?.toLowerCase() || '';
                                        if (sistemaLower.includes('roller') || sistemaLower.includes('barcelona') || sistemaLower.includes('bandas verticales')) {
                                          const areaReal = (Number(ancho) / 100) * (Number(alto) / 100);
                                          let areaMinima = 0;
                                          if (sistemaLower.includes('roller')) {
                                            areaMinima = 1.0;
                                          } else if (sistemaLower.includes('barcelona') || sistemaLower.includes('bandas verticales')) {
                                            areaMinima = 1.5;
                                          }
                                          
                                          if (areaMinima > 0 && areaReal < areaMinima) {
                                            return (
                                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                Mínimo: {areaMinima}m²
                                              </span>
                                            );
                                          }
                                        }
                                        return null;
                                      })()}
                                      {Number(cantidad) > 1 ? ` x${cantidad}` : ''}
                                      <button
                                        type="button"
                                        className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                        aria-label="Quitar tela"
                                        onClick={() => {
                                          setSelectedTela(null);
                                          setSearchTela("");
                                          setShowTelasList(false);
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                    <span className="font-medium">
                                      ${cantidadTelaManual && cantidadTelaManual > 0
                                        ? (cantidadTelaManual * Number(selectedTela.precio)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : (calcularPrecioTelaMultiplicada() * Number(cantidad || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  {selectedSistema && (selectedSistema.toLowerCase().includes('propios') || selectedSistema.toLowerCase().includes('tradicional')) && (
                                    <div className="text-xs text-blue-700 dark:text-primary pl-2">
                                      {cantidadTelaManual && cantidadTelaManual > 0 ? (
                                        <>Cálculo: {cantidadTelaManual}m × ${Number(selectedTela.precio).toFixed(2)}/m = ${(cantidadTelaManual * Number(selectedTela.precio)).toFixed(2)}</>
                                      ) : (
                                        <>Cálculo: {ancho}cm x {multiplicadorTelaLocal} = {Number(ancho) * multiplicadorTelaLocal}cm × ${Number(selectedTela.precio).toFixed(2)}/m = ${((Number(ancho) * multiplicadorTelaLocal / 100) * Number(selectedTela.precio)).toFixed(2)}</>
                                      )}
                                    </div>
                                  )}
                                  {(() => {
                                    // Mostrar cálculo detallado para Roller y Bandas Verticales cuando se aplica mínimo
                                    const sistemaLower = selectedSistema?.toLowerCase() || '';
                                    if (sistemaLower.includes('roller') || sistemaLower.includes('barcelona') || sistemaLower.includes('bandas verticales')) {
                                      const areaReal = (Number(ancho) / 100) * (Number(alto) / 100);
                                      let areaMinima = 0;
                                      if (sistemaLower.includes('roller')) {
                                        areaMinima = 1.0;
                                      } else if (sistemaLower.includes('barcelona') || sistemaLower.includes('bandas verticales')) {
                                        areaMinima = 1.5;
                                      }
                                      
                                      if (areaMinima > 0 && areaReal < areaMinima) {
                                        return (
                                          <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded mt-1">
                                            ⚠️ Cálculo: {ancho}cm × {alto}cm = {areaReal.toFixed(2)}m² → Mínimo aplicado: {areaMinima}m² × ${Number(selectedTela.precio).toFixed(2)}/m² = ${(areaMinima * Number(selectedTela.precio)).toFixed(2)}
                                          </div>
                                        );
                                      } else if (areaMinima > 0) {
                                        return (
                                          <div className="text-xs text-green-700 dark:text-green-400 pl-2">
                                            Cálculo: {ancho}cm × {alto}cm = {areaReal.toFixed(2)}m² × ${Number(selectedTela.precio).toFixed(2)}/m² = ${(areaReal * Number(selectedTela.precio)).toFixed(2)}
                                          </div>
                                        );
                                      }
                                    }
                                    return null;
                                  })()}
                                </div>
                              );
                            }
                            
                            return null;
                          })()}

                          {/* Mostrar segunda tela para cortinas tradicionales/propios o Roller con soporte doble */}
                          {(() => {
                            const esTradicionalPropios = selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios');
                            const esRollerConSoporteDoble = selectedSistema?.toLowerCase().includes('roller') && soporteDoble;
                            
                            // Mostrar segunda tela para sistemas tradicionales/propios o Roller con soporte doble
                            if (selectedTela2 && (esTradicionalPropios || esRollerConSoporteDoble)) {
                              const precioTela2Calculado = calcularPrecioTela(
                                Number(ancho),
                                Number(alto),
                                selectedTela2?.precio ? Number(selectedTela2.precio) : 0,
                                false,
                                selectedSistema,
                                multiplicadorTela2
                              );
                              
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <span className="flex gap-2 items-center">
                                      <span className="text-blue-600 dark:text-primary font-medium">2ª Tela:</span>
                                      {selectedTela2.nombreProducto} - ${Number(selectedTela2.precio).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      {(() => {
                                        // Para sistemas Propios/Tradicional o Roller con soporte doble, mostrar el ancho multiplicado
                                        if (selectedSistema && (selectedSistema.toLowerCase().includes('propios') || selectedSistema.toLowerCase().includes('tradicional'))) {
                                          const anchoMultiplicado = Number(ancho) * (multiplicadorTela2 || 1);
                                          return `(${ancho}cm x ${multiplicadorTela2 || 1} = ${anchoMultiplicado}cm)`;
                                        } else if (selectedSistema?.toLowerCase().includes('roller') && soporteDoble) {
                                          const anchoMultiplicado = Number(ancho) * (multiplicadorTela2 || 1);
                                          return `(${ancho}cm x ${multiplicadorTela2 || 1} = ${anchoMultiplicado}cm)`;
                                        } else {
                                          return `(${ancho}cm x ${alto}cm)`;
                                        }
                                      })()}
                                      {Number(cantidad) > 1 ? ` x${cantidad}` : ''}
                                      <button
                                        type="button"
                                        className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                        aria-label="Quitar segunda tela"
                                        onClick={() => {
                                          setSelectedTela2(null);
                                          setSearchTela2("");
                                          setShowTelasList2(false);
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                    <span className="font-medium">
                                      ${cantidadTelaManual2 && cantidadTelaManual2 > 0
                                        ? (cantidadTelaManual2 * Number(selectedTela2.precio)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : (precioTela2Calculado * Number(cantidad || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  {(selectedSistema && (selectedSistema.toLowerCase().includes('propios') || selectedSistema.toLowerCase().includes('tradicional'))) || 
                                    (selectedSistema?.toLowerCase().includes('roller') && soporteDoble) ? (
                                    <div className="text-xs text-blue-700 dark:text-primary pl-2">
                                      {cantidadTelaManual2 && cantidadTelaManual2 > 0 ? (
                                        <>Cálculo: {cantidadTelaManual2}m × ${Number(selectedTela2.precio).toFixed(2)}/m = ${(cantidadTelaManual2 * Number(selectedTela2.precio)).toFixed(2)}</>
                                      ) : (
                                        <>Cálculo: {ancho}cm x {multiplicadorTela2} = {Number(ancho) * multiplicadorTela2}cm × ${Number(selectedTela2.precio).toFixed(2)}/m = ${((Number(ancho) * multiplicadorTela2 / 100) * Number(selectedTela2.precio)).toFixed(2)}</>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            }
                            
                            return null;
                          })()}

                          {/* Mostrar segundo cabezal para cortinas tradicionales/propios o Roller con soporte doble */}
                          {(() => {
                            const esTradicionalPropios = selectedSistema?.toLowerCase().includes('tradicional') || selectedSistema?.toLowerCase().includes('propios');
                            const esRollerConSoporteDoble = selectedSistema?.toLowerCase().includes('roller') && soporteDoble;
                            
                            // Mostrar segundo cabezal para sistemas tradicionales/propios o Roller con soporte doble
                            if (selectedSegundoCabezal && (esTradicionalPropios || esRollerConSoporteDoble)) {
                              const { anchoEfectivo } = getAnchoEfectivo(selectedSistema, Number(ancho));
                              const aplicaTelaDobleTradicional = !!selectedTela2 && esTradicionalPropios;

                              const productoCabezal1 = (esTradicionalPropios && sistemaPedidoDetalles?.productoSeleccionado)
                                ? sistemaPedidoDetalles.productoSeleccionado
                                : selectedRielBarral;

                              const precioBaseCabezal1 = productoCabezal1?.precio ? Number(productoCabezal1.precio) : 0;
                              const precioBaseCabezal2 = selectedSegundoCabezal.precio ? Number(selectedSegundoCabezal.precio) : 0;
                              const precioBaseUsado = aplicaTelaDobleTradicional
                                ? Math.max(precioBaseCabezal1, precioBaseCabezal2)
                                : precioBaseCabezal2;

                              const precioSegundoCabezalCalculado = (anchoEfectivo / 100) * precioBaseUsado;
                              const nombreUsado =
                                aplicaTelaDobleTradicional && precioBaseCabezal1 > precioBaseCabezal2
                                  ? productoCabezal1?.nombreProducto
                                  : selectedSegundoCabezal.nombreProducto;
                              
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <span className="flex gap-2 items-center">
                                      <span className="text-blue-600 dark:text-primary font-medium">2º Cabezal:</span>
                                      {nombreUsado} - ${precioBaseUsado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      ({anchoEfectivo}cm)
                                      {Number(cantidad) > 1 ? ` x${cantidad}` : ''}
                                      <button
                                        type="button"
                                        className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                        aria-label="Quitar segundo cabezal"
                                        onClick={() => {
                                          setSelectedSegundoCabezal(null);
                                          setSearchSegundoCabezal("");
                                          setShowSegundosCabezalesList(false);
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                    <span className="font-medium">
                                      ${(precioSegundoCabezalCalculado * Number(cantidad || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <div className="text-xs text-blue-700 dark:text-primary pl-2">
                                    Cálculo: {anchoEfectivo}cm × ${precioBaseUsado.toFixed(2)}/m = ${precioSegundoCabezalCalculado.toFixed(2)}
                                  </div>
                                </div>
                              );
                            }
                            
                            return null;
                          })()}

                          {getSoporteResumen() && (
                            <div className="flex justify-between items-center">
                              <span className="flex gap-2 items-center">
                                {getSoporteResumen()?.tipo === 'doble' ? 'Soporte Doble' : 'Soporte Intermedio'} 
                                ({getSoporteResumen()?.nombre}):
                                <button
                                  type="button"
                                  className="ml-2 text-lg font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                  aria-label="Quitar soporte"
                                  onClick={() => {
                                    if (getSoporteResumen()?.tipo === 'doble') {
                                      setSoporteDoble(false);
                                      setSoporteDobleProducto(null);
                                    } else {
                                      setSelectedSoporteIntermedio(null);
                                    }
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                              <span className="font-medium">
                                ${(() => {
                                  const precioBase = Number(getSoporteResumen()?.precio || 0);
                                  const soporteResumen = getSoporteResumen();
                                  const esRoller = selectedSistema?.toLowerCase().includes('roller');
                                  const soporteEsDoble = soporteResumen?.tipo === 'doble';

                                  // En Roller, el soporte doble es unidad (no lineal por ancho).
                                  if (esRoller && soporteEsDoble) {
                                    return precioBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                  }

                                  const anchoIngresado = Number(ancho);
                                  const { anchoEfectivo } = getAnchoEfectivo(selectedSistema, anchoIngresado);
                                  return ((anchoEfectivo / 100) * precioBase).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                })()}
                              </span>
                            </div>
                          )}

                          {accesoriosAdicionales.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span>Accesorios adicionales:</span>
                                <span className="font-medium">
                                  ${totalAccesoriosAdicionales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <ul className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1">
                                {agruparAccesorios(accesoriosAdicionales).map((acc, idx) => (
                                  <li key={idx} className="flex items-center">
                                    <span className="flex gap-2 items-center">
                                      {acc.nombreProducto} x{acc.cantidad} = ${acc.precioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      <button
                                        type="button"
                                        className="ml-2 text-sm font-bold text-red-500 hover:text-red-700 focus:outline-none"
                                        aria-label={`Quitar ${acc.nombreProducto}`}
                                        onClick={() => {
                                          // Remover todos los accesorios con este nombre
                                          setAccesoriosAdicionales(prev => 
                                            prev.filter(item => item.nombreProducto !== acc.nombreProducto)
                                          );
                                        }}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  </li>
                                ))}
                              </ul>
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
                                    onWheel={(e) => {
                                      e.currentTarget.blur();
                                      e.preventDefault();
                                    }}
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
                              <span className="font-medium">
                                ${precioColocacion.toLocaleString()}{Number(cantidad) > 1 ? ` x${cantidad}` : ''} = ${(precioColocacion * (Number(cantidad) || 1)).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex gap-2 items-center">
                              <Checkbox
                                isSelected={incluirMotorizacion}
                                onValueChange={setIncluirMotorizacion}
                              >
                                Incluir motorización
                              </Checkbox>
                              {incluirMotorizacion && (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="number"
                                    placeholder="Precio de motorización"
                                    size="sm"
                                    className="w-32"
                                    value={precioMotorizacion.toString()}
                                    onValueChange={(value) => setPrecioMotorizacion(Number(value) || 0)}
                                    onWheel={(e) => {
                                      e.currentTarget.blur();
                                      e.preventDefault();
                                    }}
                                    startContent={
                                      <div className="flex items-center pointer-events-none">
                                        <span className="text-default-400 text-small">$</span>
                                      </div>
                                    }
                                  />
                                </div>
                              )}
                            </div>
                            {incluirMotorizacion && (
                              <span className="font-medium">${precioMotorizacion.toLocaleString()}</span>
                            )}
                          </div>

                          {/* Checkbox para redondeo */}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <Checkbox
                                isSelected={aplicarRedondeo}
                                onValueChange={setAplicarRedondeo}
                              >
                                Redondear total (de 100 en 100)
                              </Checkbox>
                            </div>
                            {aplicarRedondeo && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                Ej: $186.912 → $186.900
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center pt-3 mt-2 border-t">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold">
                              ${calcularPrecioTotal().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      );
                    })()}

                    {error && (
                      <div className="mt-2 text-sm text-red-500">
                        {error}
                      </div>
                    )}

                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="sticky bottom-0 z-20 bg-white dark:bg-dark-card rounded-b-lg border-t dark:border-dark-border">
                <div className="flex flex-col w-full gap-3">
                  {/* Mensajes de validación */}
                   {/* {validationMessages.length > 0 && ( */}
                    {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"> */}
                      {/* <div className="flex items-center gap-2 mb-2"> */}
                        {/* <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg> */}
                         {/* <span className="text-sm font-medium text-yellow-800">
                          Completa los siguientes campos:
                        </span> */}
                      {/* </div> */}
                        {/* <ul className="text-xs text-yellow-700 space-y-1"> */}
                         {/* {validationMessages.map((message, index) => (
                          <li key={index}>{message}</li>
                        ))} */}
                      {/* </ul> */}
                    {/* </div> */}
                  {/* )} */}
                  
                  {/* Botones */}
                  <div className="flex justify-between items-center">
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancelar
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleSubmit}
                      className="min-w-[140px]"
                    >
                      {itemToEdit ? "Actualizar Pedido" : "Generar Pedido"}
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          );
        }}
      </ModalContent>
      {/* Overlay de cambio de sistema */}
      {showCambioSistema && (
        <div className="fixed inset-0 w-screen h-screen bg-white/70 dark:bg-black/70 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-8 md:p-12 shadow-lg dark:shadow-2xl flex flex-row items-center gap-4 text-xl font-medium">
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="4" opacity="0.2"/>
              <path d="M22 12a10 10 0 0 1-10 10" stroke="#1976d2" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            Cambiando a sistema <span className="text-blue-600 dark:text-blue-400">{nombreSistemaCambio}</span>...
          </div>
        </div>
      )}

      {/* Modal de confirmación de cierre */}
      <Modal isOpen={showCloseConfirmModal} onOpenChange={setShowCloseConfirmModal}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar cierre
          </ModalHeader>
          <ModalBody>
            <p>¿Estás seguro que deseas cerrar?</p>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-2">
              Los datos ingresados se perderán.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCancelClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleConfirmClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}