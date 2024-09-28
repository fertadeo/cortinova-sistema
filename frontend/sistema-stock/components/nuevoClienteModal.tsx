import React, { useState, ChangeEvent } from "react";
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

// Define los tipos de las props
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
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [notificationMessage, setNotificationMessage] = useState(""); // Mensaje dinámico de la notificación
  const [notificationDescription, setNotificationDescription] = useState(""); // Descripción dinámica de la notificación
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success'); // Tipo de notificación
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({
    dni: false,
    nombre: false,
    telefono: false,
    direccion: false,
    email: false,
  });

  // Función para manejar cambios en los inputs
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;

    // Actualizar el estado del campo y resetear el error si se escribe algo
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
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          direccion: value.trim() === "",
        }));
        break;
      case "email":
        setEmail(value);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          email: value.trim() === "",
        }));
        break;
      case "dni":
        setDni(value);
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          dni: value.trim() === "",
        }));
        break;
      default:
        break;
    }
  };

  // Función para validar el formulario antes de enviar
  const validateForm = () => {
    const errors = {
      nombre: nombre.trim() === "",
      telefono: telefono.trim() === "",
      direccion: direccion.trim() === "",
      email: email.trim() === "",
      dni: dni.trim() === "",
    };

    setFormErrors(errors);

    // Retorna true si no hay errores
    return !Object.values(errors).some((error) => error);
  };

  const handleGuardar = async () => {
    if (!validateForm()) {
      return; // Detener el guardado si hay errores en el formulario
    }

    const nuevoCliente = {
      nombre,
      telefono,
      email,
      direccion,
      dni,
    };

    try {
      setIsSaving(true); // Mostrar spinner al inicio del guardado

      const response = await fetch("http://localhost:8080/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Manejar el caso de duplicación de cliente por DNI
        if (errorData.message === "El cliente con este DNI ya existe") {
          setNotificationMessage("Error: Cliente duplicado");
          setNotificationDescription("No se puede registrar un cliente con un DNI ya registrado.");
          setNotificationType("error"); // Establece la notificación como error
        } else {
          setNotificationMessage("Error al guardar el cliente");
          setNotificationDescription("Ocurrió un problema al intentar guardar el cliente.");
          setNotificationType("error"); // Error genérico
        }

        setNotificationVisible(true);
        setIsSaving(false);
        return; // Detener la ejecución aquí si hay un error
      }

      // Llama al callback para recargar los clientes
      onClienteAgregado();

      // Muestra la notificación de éxito
      setNotificationMessage("¡Cliente guardado exitosamente!");
      setNotificationDescription("El cliente ha sido agregado correctamente.");
      setNotificationType("success"); // Notificación de éxito
      setNotificationVisible(true);

      // Cierra el modal después de 3 segundos
      setTimeout(() => {
        // Actualiza los campos a strings vacíos
        setDni("");
        setNombre("");
        setTelefono("");
        setEmail("");
        setDireccion("");

        setIsSaving(false); // Ocultar spinner después de 3 segundos
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error al guardar el nuevo cliente:", error);
      setNotificationMessage("Error inesperado");
      setNotificationDescription("Ocurrió un error inesperado al intentar guardar el cliente.");
      setNotificationType("error"); // Error inesperado
      setNotificationVisible(true);
      setIsSaving(false); // En caso de error, ocultar spinner
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
                label="Nombre completo"
                placeholder="Ingrese el nombre"
                value={nombre}
                required
                onChange={(e) => handleInputChange(e, "nombre")}
                color={formErrors.nombre ? "danger" : "default"}
              />
              <Input
                fullWidth
                label="DNI (el campo es obligatorio)"
                placeholder="Ingrese el DNI del cliente"
                value={dni}
                required
                onChange={(e) => handleInputChange(e, "dni")}
                color={formErrors.dni ? "danger" : "default"}
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
                label="Email"
                placeholder="Ingrese el Email"
                value={email}
                required
                onChange={(e) => handleInputChange(e, "email")}
                color={formErrors.email ? "danger" : "default"}
              />
              <Input
                fullWidth
                label="Dirección"
                placeholder="Ingrese la dirección"
                required
                value={direccion}
                onChange={(e) => handleInputChange(e, "direccion")}
                color={formErrors.direccion ? "danger" : "default"}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button
                color="success"
                onPress={handleGuardar}
                disabled={isSaving}
                style={{ color: "white" }}
              >
                {isSaving ? <Spinner color="default" /> : "Guardar"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      {/* Aquí renderizamos el componente Notification fuera del modal */}
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
