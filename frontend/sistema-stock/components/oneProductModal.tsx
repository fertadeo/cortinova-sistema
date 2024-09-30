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

const OneProductModal: React.FC<OneProductModalProps> = ({ isOpen, onClose }) => {

  return (
    <Modal size={"lg"} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
            <ModalBody>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar
                risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                risus, sed porttitor quam.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar
                risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                risus, sed porttitor quam.
              </p>
              <p>
                Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit
                dolor adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis.
                Velit duis sit officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
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

export default OneProductModal;
