import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";

type ModalToTableProps = {
  isOpen: boolean;
  onClose: () => void;
  cliente: any;
  presupuestos?: any[]; // Agregamos esta prop para manejar los datos de la tabla
};

const ModalToTable: React.FC<ModalToTableProps> = ({ 
  isOpen, 
  onClose, 
  cliente,
  presupuestos = [] // Valor por defecto array vacío
}) => {
  return (
    <Modal backdrop="opaque" isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{cliente?.nombre}</ModalHeader>
        <ModalBody>
          <p>Teléfono: {cliente?.telefono}</p>
          <p>Dirección: {cliente?.direccion}</p>
          <p>Email: {cliente?.email}</p>
          <div className="flex flex-col w-full gap-3">
            {presupuestos.length === 0 ? (
              // Mensaje de alerta cuando no hay datos
              <div
                className="relative px-4 py-3 text-teal-700 bg-teal-200 border border-teal-500 rounded bg-opacity-30 border-opacity-30"
                role="alert"
              >
                <strong className="font-bold">Aún no hay presupuestos cargados!</strong>
              </div>
            ) : (
              // Tabla cuando hay datos
              <Table 
                color={"primary"}
                selectionMode="single" 
                defaultSelectedKeys={["2"]} 
                aria-label="Example static collection table"
              >
                <TableHeader>
                  <TableColumn>Num Pedido</TableColumn>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Articulos</TableColumn>
                  <TableColumn>Monto</TableColumn>
                  <TableColumn>Estado</TableColumn>
                </TableHeader>
                <TableBody>
                  {presupuestos.map((presupuesto, index) => (
                    <TableRow key={presupuesto.id || index}>
                      <TableCell>{presupuesto.numPedido}</TableCell>
                      <TableCell>{presupuesto.fecha}</TableCell>
                      <TableCell>{presupuesto.articulos}</TableCell>
                      <TableCell>{presupuesto.monto}</TableCell>
                      <TableCell>{presupuesto.estado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalToTable;