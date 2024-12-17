import React from 'react';
import { Modal, ModalContent, ModalBody } from "@nextui-org/react";
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
    total: number;
  };
}

const BudgetPDFModal: React.FC<BudgetPDFModalProps> = ({ isOpen, onClose, presupuestoData }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        body: "p-12",
        base: "m-12",
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