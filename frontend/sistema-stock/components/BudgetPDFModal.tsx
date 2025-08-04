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
    productos: Array<{
      nombre: string;
      descripcion: string;
      precioUnitario: number;
      cantidad: number;
      subtotal: number;
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