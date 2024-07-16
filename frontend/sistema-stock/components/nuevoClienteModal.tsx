import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner } from "@nextui-org/react";
import Notification from "./notification"; // Importa el componente de notificación

const NuevoClienteModal = ({ isOpen, onClose, onClienteAgregado }) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado para controlar la visibilidad del spinner

  const handleGuardar = async () => {
    const nuevoCliente = {
      nombre,
      telefono,
      email,
      direccion
    };

    try {
      setIsSaving(true); // Mostrar spinner al inicio del guardado

      const response = await fetch("http://localhost:8080/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoCliente)
      });

      if (!response.ok) {
        throw new Error("Error al guardar el nuevo cliente");
      }

      // Llama al callback para recargar los clientes
      onClienteAgregado();

      // Muestra la notificación
      setNotificationVisible(true);

      // Cierra el modal después de 3 segundos
      setTimeout(() => {
        setIsSaving(false); // Ocultar spinner después de 3 segundos
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error al guardar el nuevo cliente:", error);
      setIsSaving(false); // En caso de error, ocultar spinner
    }
  };

  return (
    <>
      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">Nuevo Cliente</ModalHeader>
            <ModalBody>
              <Input
                fullWidth
                label="Nombre"
                placeholder="Ingrese el nombre"
                value={nombre}
                required
                onChange={(e) => setNombre(e.target.value)}
              />
              <Input
                fullWidth
                label="Teléfono"
                placeholder="Ingrese el teléfono"
                value={telefono}
                required
                onChange={(e) => setTelefono(e.target.value)}
              />
              <Input
                fullWidth
                label="Email"
                placeholder="Ingrese el Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
                 <Input
                fullWidth
                label="Dirección"
                placeholder="Ingrese la dirección"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button color="success" onPress={handleGuardar} disabled={isSaving} style={{color:'white'}}>
                {isSaving ? <Spinner color="default" /> : "Guardar"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Notification
        message="¡Cliente guardado exitosamente!"
        description="El cliente ha sido agregado correctamente."
        isVisible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </>
  );
};

export default NuevoClienteModal;
