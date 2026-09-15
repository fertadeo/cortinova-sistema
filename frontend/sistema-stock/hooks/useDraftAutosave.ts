import { useEffect, useRef, useCallback } from 'react';
import type { Client, TableItem } from '../types/budget';

export interface PresupuestoDraft {
  version: number;
  lastSaved: string;
  createdAt: string;
  presupuestoId: number | null;
  originalEditId?: string;
  selectedClient: Client | null;
  tableData: TableItem[];
  esEstimativo: boolean;
  applyDiscount: boolean;
  discountValue: string;
  discountType: 'percentage' | 'amount';
  shouldRound: boolean;
  showMeasuresInPDF: boolean;
}

interface UseDraftAutosaveOptions {
  presupuestoId: number | null;
  editId: string | null;
  selectedClient: Client | null;
  tableData: TableItem[];
  esEstimativo: boolean;
  applyDiscount: boolean;
  discountValue: string;
  discountType: 'percentage' | 'amount';
  shouldRound: boolean;
  showMeasuresInPDF: boolean;
  isSubmitted: boolean;
  enabled: boolean;
}

const DRAFT_VERSION = 1;
const AUTOSAVE_DEBOUNCE_MS = 3000;

export const useDraftAutosave = (options: UseDraftAutosaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string | null>(null);

  const getDraftKey = useCallback((): string => {
    if (options.editId) {
      return `cortinova_draft_edit_${options.editId}`;
    }
    return 'cortinova_draft_new';
  }, [options.editId]);

  const saveDraft = useCallback(() => {
    if (!options.enabled || options.isSubmitted) {
      return;
    }

    // Solo guardar si hay algún dato significativo
    if (!options.selectedClient && options.tableData.length === 0) {
      return;
    }

    try {
      const draft: PresupuestoDraft = {
        version: DRAFT_VERSION,
        lastSaved: new Date().toISOString(),
        createdAt: lastSaveRef.current || new Date().toISOString(),
        presupuestoId: options.presupuestoId,
        originalEditId: options.editId || undefined,
        selectedClient: options.selectedClient,
        tableData: options.tableData,
        esEstimativo: options.esEstimativo,
        applyDiscount: options.applyDiscount,
        discountValue: options.discountValue,
        discountType: options.discountType,
        shouldRound: options.shouldRound,
        showMeasuresInPDF: options.showMeasuresInPDF,
      };

      const key = getDraftKey();
      localStorage.setItem(key, JSON.stringify(draft));
      
      if (!lastSaveRef.current) {
        lastSaveRef.current = draft.createdAt;
      }

      console.log(`💾 Borrador guardado: ${key}`, {
        cliente: draft.selectedClient?.nombre,
        productos: draft.tableData.length,
        presupuestoId: draft.presupuestoId
      });
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      // Si es QuotaExceededError, intentar limpiar borradores antiguos
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        cleanStaleDrafts();
      }
    }
  }, [
    options.enabled,
    options.isSubmitted,
    options.selectedClient,
    options.tableData,
    options.esEstimativo,
    options.applyDiscount,
    options.discountValue,
    options.discountType,
    options.shouldRound,
    options.showMeasuresInPDF,
    options.presupuestoId,
    options.editId,
    getDraftKey,
  ]);

  const clearDraft = useCallback(() => {
    try {
      const key = getDraftKey();
      localStorage.removeItem(key);
      console.log(`🗑️ Borrador eliminado: ${key}`);
    } catch (error) {
      console.error('Error al eliminar borrador:', error);
    }
  }, [getDraftKey]);

  const loadDraft = useCallback((key: string): PresupuestoDraft | null => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const draft = JSON.parse(stored) as PresupuestoDraft;
      
      // Validar versión
      if (draft.version !== DRAFT_VERSION) {
        console.warn('Versión de borrador incompatible, descartando');
        localStorage.removeItem(key);
        return null;
      }

      // Validar que no sea muy antiguo (7 días)
      const age = Date.now() - new Date(draft.lastSaved).getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (age > maxAge) {
        console.log('Borrador obsoleto (>7 días), descartando');
        localStorage.removeItem(key);
        return null;
      }

      return draft;
    } catch (error) {
      console.error('Error al cargar borrador:', error);
      // Borrador corrupto, eliminar
      try {
        localStorage.removeItem(key);
      } catch {}
      return null;
    }
  }, []);

  // Autosave con debounce
  useEffect(() => {
    if (!options.enabled || options.isSubmitted) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    options.selectedClient,
    options.tableData,
    options.esEstimativo,
    options.applyDiscount,
    options.discountValue,
    options.discountType,
    options.shouldRound,
    options.showMeasuresInPDF,
    options.enabled,
    options.isSubmitted,
    saveDraft,
  ]);

  // Guardar antes de cerrar ventana
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (options.enabled && !options.isSubmitted) {
        saveDraft();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [options.enabled, options.isSubmitted, saveDraft]);

  return {
    saveDraft,
    clearDraft,
    loadDraft,
    getDraftKey,
  };
};

// Función helper para limpiar borradores obsoletos
export const cleanStaleDrafts = () => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
  const keys: string[] = [];

  // Recolectar claves
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('cortinova_draft_')) {
      keys.push(key);
    }
  }

  // Procesar cada clave
  keys.forEach((key) => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return;

      const draft = JSON.parse(stored) as PresupuestoDraft;
      const age = Date.now() - new Date(draft.lastSaved).getTime();

      if (age > maxAge) {
        localStorage.removeItem(key);
        console.log(`🧹 Borrador obsoleto eliminado: ${key}`);
      }
    } catch (error) {
      // Borrador corrupto, eliminar
      localStorage.removeItem(key);
      console.log(`🧹 Borrador corrupto eliminado: ${key}`);
    }
  });
};

// Helper para formatear tiempo relativo
export const formatRelativeTime = (isoDate: string): string => {
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'hace unos segundos';
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return `hace ${days} día${days > 1 ? 's' : ''}`;
};
