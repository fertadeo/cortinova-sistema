import React from 'react';
import { Modal, ModalContent, ModalBody, ModalFooter, Button } from "@heroui/react";
import BudgetResume from './budgetResume';

interface BudgetPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  presupuestoData: {
    numeroPresupuesto: string;
    fecha: string;
    cliente: {
      nombre: string;
      telefono?: string;
      email?: string;
    };
    showMeasuresInPDF?: boolean;
    esEstimativo?: boolean;
    opciones?: any[];
    shouldRound?: boolean;
    applyDiscount?: boolean;
    productos: Array<{
      nombre: string;
      descripcion: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
      espacio?: string;
      opcion?: string;
      tipoApertura?: string;
      colorSistema?: string;
      ladoComando?: string;
      ladoApertura?: string;
      detalle?: string;
      incluirMotorizacion?: boolean;
      precioMotorizacion?: number;
      ancho?: number;
      alto?: number;
    }>;
    subtotal: number;
    descuento: number;
    total: number;
  };
}

const BudgetPDFModal: React.FC<BudgetPDFModalProps> = ({ isOpen, onClose, presupuestoData }) => {
  const budgetResumeRef = React.useRef<{ handleDownloadPDF: () => void; handleSendWhatsApp: () => void } | null>(null);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        body: "p-3 sm:p-6",
        base: "m-2 sm:m-6 max-w-3xl max-h-[95vh]",
        wrapper: "items-end sm:items-center",
      }}
    >
      <ModalContent>
        <ModalBody className="max-h-[70vh] sm:max-h-[calc(95vh-8rem)] overflow-y-auto">
          <BudgetResume ref={budgetResumeRef} presupuestoData={presupuestoData} showButtons={false} />
        </ModalBody>
        <ModalFooter className="flex-col sm:flex-row gap-2 sticky bottom-0 bg-white dark:bg-gray-800 p-3 sm:p-4 border-t">
          <Button 
            color="primary"
            onClick={() => budgetResumeRef.current?.handleDownloadPDF()}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Descargar PDF
          </Button>
          <Button
            color="success"
            variant="bordered"
            onClick={() => budgetResumeRef.current?.handleSendWhatsApp()}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Enviar por WhatsApp
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BudgetPDFModal; 