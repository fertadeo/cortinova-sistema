import { useCallback, useEffect, useState } from 'react';
import { ReglaNegocio } from '@/types/reglasNegocio';

const FALLBACK_REGLAS: ReglaNegocio[] = [
  { id: 0, nombreSistema: 'Roller', matchKey: 'roller', areaMinimaM2: 1, anchoMinimoCm: 100, activo: true },
  { id: 0, nombreSistema: 'Dubai', matchKey: 'dubai', areaMinimaM2: 1, anchoMinimoCm: 100, activo: true },
  { id: 0, nombreSistema: 'Bandas Verticales', matchKey: 'bandas verticales', areaMinimaM2: 1.5, anchoMinimoCm: 150, activo: true },
  { id: 0, nombreSistema: 'Barcelona', matchKey: 'barcelona', areaMinimaM2: 1.5, anchoMinimoCm: 150, activo: true },
  { id: 0, nombreSistema: 'Venecianas', matchKey: 'veneciana', areaMinimaM2: 1, anchoMinimoCm: 0, activo: true },
];

export const findReglaForSistema = (reglas: ReglaNegocio[], sistema?: string | null): ReglaNegocio | null => {
  if (!sistema) return null;
  const sistemaLower = sistema.toLowerCase();
  const source = reglas.length > 0 ? reglas : FALLBACK_REGLAS;
  const activas = source.filter((r) => r.activo);
  return activas.find((r) => sistemaLower.includes(r.matchKey.toLowerCase())) || null;
};

export const getAreaMinimaM2 = (reglas: ReglaNegocio[], sistema?: string | null): number => {
  const regla = findReglaForSistema(reglas, sistema);
  return regla ? Number(regla.areaMinimaM2) || 0 : 0;
};

export const getAnchoMinimoCmFromReglas = (reglas: ReglaNegocio[], sistema?: string | null): number => {
  const regla = findReglaForSistema(reglas, sistema);
  return regla ? Number(regla.anchoMinimoCm) || 0 : 0;
};

export const useReglasNegocio = () => {
  const [reglas, setReglas] = useState<ReglaNegocio[]>(FALLBACK_REGLAS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReglas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/reglas-negocio`);
      if (!response.ok) throw new Error('Error al cargar reglas de negocio');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setReglas(data.map((r: ReglaNegocio) => ({
          ...r,
          areaMinimaM2: Number(r.areaMinimaM2),
          anchoMinimoCm: Number(r.anchoMinimoCm),
        })));
      } else {
        setReglas(FALLBACK_REGLAS);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setReglas(FALLBACK_REGLAS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReglas();
  }, [fetchReglas]);

  return {
    reglas,
    isLoading,
    error,
    refresh: fetchReglas,
    getAreaMinima: (sistema?: string | null) => getAreaMinimaM2(reglas, sistema),
    getAnchoMinimo: (sistema?: string | null) => getAnchoMinimoCmFromReglas(reglas, sistema),
  };
};
