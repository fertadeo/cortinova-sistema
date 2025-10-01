import React from 'react';
import { Modal, ModalContent, ModalBody } from "@heroui/react";
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
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        body: "p-6",
        base: "m-6 max-w-3xl",
      }}
    >
      <ModalContent>
        <ModalBody>
          <BudgetResume presupuestoData={presupuestoData} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BudgetPDFModal; 