import React, { useState, useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User as NextUser, Tooltip, useDisclosure, Pagination } from "@nextui-org/react";
import { EditIcon } from "../components/utils/editIcon";
import { DeleteIcon } from "../components/utils/deleteIcon";
import { EyeIcon } from "../components/utils/eyeIcon";
import Modal from "./modalToTable";
import { columns, users } from "../components/utils/dataclientes";

// Define the type of User based on the structure of 'users'
type User = typeof users[0];

export default function ClientesTable() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const renderCell = useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "name":
        return (
          <NextUser
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue as string}
          >
            {user.email}
          </NextUser>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Ver">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleOpenModal(user)}
              >
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Edit user">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  // Remove the 'status' column from the columns definition
  const filteredColumns = columns.filter(column => column.uid !== 'status');

  // Calculate the items to show on the current page
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = users.slice(startIdx, endIdx);

  return (
    <div style={{ height: '80%', width: '80%' }}>
      <Table aria-label="Example table with custom cells" style={{ height: '100%', width: '100%' }}>
        <TableHeader columns={filteredColumns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
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
      {selectedUser && (
        <Modal
        isOpen={isOpen}
        onClose={onClose}
        user={selectedUser}
        />
      )}
      <div className="flex justify-center mt-4">
      <Pagination
        total={Math.ceil(users.length / itemsPerPage)}
        initialPage={1}
        page={currentPage}
        onChange={(page) => setCurrentPage(page)}
      />
      </div>
    </div>
  );
}
