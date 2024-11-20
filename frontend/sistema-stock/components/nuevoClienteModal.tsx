import React, { useState, ChangeEvent, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "@nextui-org/react";
import Notification from "./notification"; // Importa el componente de notificación

interface NuevoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteAgregado: () => void;
}

const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({
  isOpen,
  onClose,
  onClienteAgregado,
}) => {
  const [idCliente, setIdCliente] = useState<number | null>(null); // Estado para el ID del cliente
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationDescription, setNotificationDescription] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({
    nombre: false,
    telefono: false,
  });

  // Fetch para obtener el próximo ID
  const fetchNextClienteId = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/getNextClienteId`);
      if (!response.ok) {
        throw new Error("Error al obtener el próximo ID");
      }
      const data = await response.json();
      setIdCliente(data.nextId); // Actualiza el estado con el ID obtenido
    } catch (error) {
      // console.error("Error al obtener el próximo ID de cliente:", error);
      setIdCliente(null); // Reinicia el estado en caso de error
    }
  };

  // Efecto para cargar el ID cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      fetchNextClienteId();
    }
  }, [isOpen]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;

    switch (field) {
      case "nombre":
        setNombre(value);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          nombre: value.trim() === "",
        }));
        break;
      case "telefono":
        setTelefono(value);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          telefono: value.trim() === "",
        }));
        break;
      case "direccion":
        setDireccion(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "dni":
        setDni(value);
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    const errors = {
      nombre: nombre.trim() === "",
      telefono: telefono.trim() === "",
    };

    setFormErrors(errors);

    return !Object.values(errors).some((error) => error);
  };

  const handleGuardar = async () => {
    if (!validateForm()) {
      return;
    }

    const nuevoCliente = {
      id: idCliente, // Incluye el ID en el cliente
      nombre,
      telefono,
      email: email || null,
      direccion: direccion || null,
      dni: dni || null,
    };

    try {
      setIsSaving(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.message === "El cliente con este DNI ya existe") {
          setNotificationMessage("Error: Cliente duplicado");
          setNotificationDescription("No se puede registrar un cliente con un DNI ya registrado.");
          setNotificationType("error");
        } else {
          setNotificationMessage("Error al guardar el cliente");
          setNotificationDescription("Ocurrió un problema al intentar guardar el cliente.");
          setNotificationType("error");
        }

        setNotificationVisible(true);
        setIsSaving(false);
        return;
      }

      onClienteAgregado();

      setNotificationMessage("¡Cliente guardado exitosamente!");
      setNotificationDescription("El cliente ha sido agregado correctamente.");
      setNotificationType("success");
      setNotificationVisible(true);

      setTimeout(() => {
        setDni("");
        setNombre("");
        setTelefono("");
        setEmail("");
        setDireccion("");
        setIsSaving(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error al guardar el nuevo cliente:", error);
      setNotificationMessage("Error inesperado");
      setNotificationDescription("Ocurrió un error inesperado al intentar guardar el cliente.");
      setNotificationType("error");
      setNotificationVisible(true);
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Nuevo Cliente
            </ModalHeader>

            <ModalBody>
              <Input
                fullWidth
                label="ID del Cliente"
                value={idCliente ? idCliente.toString() : "Cargando..."} // Muestra el ID o un mensaje de carga
                readOnly
                disabled
              />
              <Input
                fullWidth
                label="Nombre completo"
                placeholder="Ingrese el nombre"
                value={nombre}
                required
                onChange={(e) => handleInputChange(e, "nombre")}
                color={formErrors.nombre ? "danger" : "default"}
              />
              <Input
                fullWidth
                label="DNI / CUIL (opcional)"
                placeholder="Ingrese el DNI o  CUIL del cliente"
                value={dni}
                onChange={(e) => handleInputChange(e, "dni")}
              />
              <Input
                fullWidth
                label="Teléfono"
                placeholder="Ingrese el teléfono"
                value={telefono}
                required
                onChange={(e) => handleInputChange(e, "telefono")}
                color={formErrors.telefono ? "danger" : "default"}
              />
              <Input
                fullWidth
                label="Email (opcional)"
                placeholder="Ingrese el Email"
                value={email}
                onChange={(e) => handleInputChange(e, "email")}
              />
              <Input
                fullWidth
                label="Dirección (opcional)"
                placeholder="Ingrese la dirección"
                value={direccion}
                onChange={(e) => handleInputChange(e, "direccion")}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button
                color="success"
                onPress={handleGuardar}
                disabled={isSaving || idCliente === null}
                style={{ color: "white" }}
              >
                {isSaving ? <Spinner color="default" /> : "Guardar"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Notification
        message={notificationMessage}
        description={notificationDescription}
        isVisible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        type={notificationType}
      />
    </>
  );
};

export default NuevoClienteModal;
