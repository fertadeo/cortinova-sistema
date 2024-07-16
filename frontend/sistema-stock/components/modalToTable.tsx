import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

type ModalComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Adjust this type according to your User type
};

const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen, onClose, user }) => {
  return (
    <Modal backdrop="opaque" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{user?.name}</ModalHeader>
            <ModalBody>
              <p>Email: {user?.email}</p>
              <p>Role: {user?.role}</p>
              <p>Team: {user?.team}</p>
              {/* Add more user details here as needed */}
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

export default ModalComponent;
