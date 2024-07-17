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
};

const ModalToTable: React.FC<ModalToTableProps> = ({ isOpen, onClose, cliente }) => {

  return (
    <Modal backdrop="opaque" isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{cliente?.nombre}</ModalHeader>
        <ModalBody>
          <p>Teléfono: {cliente?.telefono}</p>
          <p>Dirección: {cliente?.direccion}</p>
          <p>Email: {cliente?.email}</p>
          <div className="flex flex-col gap-3 w-full">
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
                <TableRow key="1">
                  <TableCell>1</TableCell>
                  <TableCell>17/07/2024</TableCell>
                  <TableCell>Cortina Roller Gris x 4 Mtrs</TableCell>
                  <TableCell>$15.600</TableCell>
                  <TableCell>Finalizado</TableCell>
                </TableRow>
                <TableRow key="2">
                  <TableCell>2</TableCell>
                  <TableCell>01/02/23</TableCell>
                  <TableCell>Cortina Roller Gris x 4 Mtrs</TableCell>
                  <TableCell>$9.000</TableCell>
                  <TableCell>Cancelado</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
