
import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";


interface ModalEditarProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
  }

  const ModalEditar: React.FC<ModalEditarProps> = ({ isOpen, onClose, onSave }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} backdrop="opaque">
        <ModalContent>
          <ModalHeader>ModalEditar</ModalHeader>
          <ModalBody>
        
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={onSave}>
              Modificar Datos
            </Button>
            <Button color="danger" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default ModalEditar;
