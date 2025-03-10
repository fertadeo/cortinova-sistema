import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface ModalConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalConfirmation: React.FC<ModalConfirmationProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="opaque">
      <ModalContent>
        <ModalHeader>Confirmación</ModalHeader>
        <ModalBody>
          <p>¿Está seguro que desea realizar esta acción?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={onConfirm}>
            Confirmar
          </Button>
          <Button color="default" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalConfirmation;
