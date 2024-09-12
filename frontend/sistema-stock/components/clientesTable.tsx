import '../styles/globals.css';
import React, { useState, useCallback, useEffect } from "react";
import { Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, useDisclosure, Pagination, Button, User } from "@nextui-org/react";
import ModalToTable from "@/components/modalToTable";
import NuevoClienteModal from "@/components/nuevoClienteModal";
import ModalConfirmation from "@/components/modalConfirmation";
import { columns } from "@/components/utils/dataclientes";
import { EyeIcon } from "@/components/utils/eyeIcon";
import { EditIcon } from "@/components/utils/editIcon";
import { DeleteIcon } from "@/components/utils/deleteIcon";
import  EditarComponent from  "@/components/editarComponent"

type User = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
};

interface Props {
  initialUsers: User[];
}

const ClientesTable: React.FC<Props> = ({ initialUsers }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editarModal, setEditarModal] = useState(false);
  const itemsPerPage = 10;


  const handleEditarModal = (user: User) => {
    setEditarModal(true);
    setSelectedUser(user);
    console.log('User seleccionado', user)
  };

  const handleSave = async () => {
 
    await fetchClientes(); 
  };

  const handleCloseEditarModal = () => {
    setEditarModal(false)
  }


  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleNuevoClienteModalOpen = () => {
    setIsNuevoClienteModalOpen(true);
  };

  const handleNuevoClienteModalClose = () => {
    setIsNuevoClienteModalOpen(false);
  };

  const handleOpenDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/clientes/${userToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el cliente');
      }
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete.id));
      handleCloseDeleteModal(); // Cierra el modal después de eliminar
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/clientes");
      if (!response.ok) {
        throw new Error("Error al obtener los clientes");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);



  const renderCell = useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <span className="cursor-pointer" onClick={() => handleOpenModal(user)}>
            <User
            avatarProps={{radius: "lg"}}
            description={user.email}
            name={user.nombre}
          >
            {user.email}
          </User>

          </span>
        );
      case "telefono":
        return (
          <div className="flex flex-col">
            <p className="text-sm capitalize text-bold">{user.telefono}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex gap-2">
            <Tooltip content="Ver">
              <span className="text-lg cursor-pointer text-default-400 active:opacity-50" onClick={() => handleOpenModal(user)}>
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Editar">
              <span className="text-lg cursor-pointer text-default-400 active:opacity-50" onClick={() => handleEditarModal(user)}>
                <EditIcon />
                
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Eliminar">
              <span className="text-lg cursor-pointer text-danger active:opacity-50" onClick={() => handleOpenDeleteModal(user)}>
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return user[columnKey as keyof User];
    }
  }, []);

  const filteredColumns = columns.filter((column) => column.uid !== "status");

  const filteredUsers = users.filter((user) => {
    const name = user.nombre.toLowerCase() || "";
    const telefono = user.telefono.toLowerCase() || "";
    const email = user.email.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return name.includes(search) || telefono.includes(search) || email.includes(search);
  });

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = filteredUsers.slice(startIdx, endIdx);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between h-20 p-4 bg-white rounded-lg shadow-medium">
        <Input
          isClearable
          placeholder="Buscar"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="pr-4"
        />
        <Button color="primary" variant="shadow" className="pr-4" onClick={handleNuevoClienteModalOpen}>
          Agregar Nuevo +
        </Button>
      </div>

      <div className="flex-1 mt-4 overflow-auto">
        <Table aria-label="Tabla de Clientes" className="w-full">
          <TableHeader columns={filteredColumns}>
            {(column) => (
              <TableColumn key={column.uid} align={column.uid === "actions" ? "start" : "center"}>
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={currentItems}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <Pagination
          total={Math.ceil(filteredUsers.length / itemsPerPage)}
          initialPage={1}
          page={currentPage}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      {editarModal && <EditarComponent cliente={selectedUser} isOpen={true} onClose={handleCloseEditarModal} onSave={handleSave} />}
      {selectedUser && <ModalToTable isOpen={isOpen} onClose={onClose} cliente={selectedUser} />}
      <NuevoClienteModal
        isOpen={isNuevoClienteModalOpen}
        onClose={handleNuevoClienteModalClose}
        onClienteAgregado={fetchClientes}
      />
      <ModalConfirmation
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
};
 
export default ClientesTable; 