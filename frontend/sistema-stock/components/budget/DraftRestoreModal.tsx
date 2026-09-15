import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import type { PresupuestoDraft } from '../../hooks/useDraftAutosave';
import { formatRelativeTime } from '../../hooks/useDraftAutosave';

interface DraftRestoreModalProps {
  isOpen: boolean;
  draft: PresupuestoDraft | null;
  onRestore: () => void;
  onDiscard: () => void;
}

export const DraftRestoreModal: React.FC<DraftRestoreModalProps> = ({
  isOpen,
  draft,
  onRestore,
  onDiscard,
}) => {
  if (!draft) return null;

  return (
    <Modal isOpen={isOpen} onClose={onDiscard} isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">📄 Borrador encontrado</h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-700 mb-3">
            Tienes un borrador sin guardar de este presupuesto:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="font-medium min-w-[100px]">Cliente:</span>
              <span className="text-gray-600">
                {draft.selectedClient?.nombre || 'No especificado'}
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium min-w-[100px]">Productos:</span>
              <span className="text-gray-600">
                {draft.tableData.length} producto{draft.tableData.length !== 1 ? 's' : ''}
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium min-w-[100px]">Guardado:</span>
              <span className="text-gray-600">
                {formatRelativeTime(draft.lastSaved)}
              </span>
            </li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            ¿Deseas continuar donde lo dejaste?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onDiscard}>
            Descartar y empezar de nuevo
          </Button>
          <Button color="primary" onPress={onRestore}>
            Restaurar borrador
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
