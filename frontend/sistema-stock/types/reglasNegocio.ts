export interface ReglaNegocio {
  id: number;
  nombreSistema: string;
  matchKey: string;
  areaMinimaM2: number;
  anchoMinimoCm: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ReglaNegocioInput = Omit<ReglaNegocio, 'id' | 'createdAt' | 'updatedAt'>;
