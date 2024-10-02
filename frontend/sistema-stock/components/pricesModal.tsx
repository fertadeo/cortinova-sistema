// components/OneProductModal.tsx

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

interface OneProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricesModal: React.FC<OneProductModalProps> = ({ isOpen, onClose }) => {

  return (
    <Modal size={"lg"} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Desde Prices Modal</ModalHeader>
            <ModalBody>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar
                risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                risus, sed porttitor quam.
              </p>

            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Action
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default PricesModal;
