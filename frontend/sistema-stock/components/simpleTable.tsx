"use client";

import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";

export default function SimpleTable() {

  return (
    <div className="flex flex-col gap-3">
      <Table
        selectionMode="single" 
        defaultSelectedKeys={["2"]} 
        aria-label="Example static collection table"
      >
        <TableHeader>
          <TableColumn>PEDIDO</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>ESTADO</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Pedido #1203</TableCell>
            <TableCell>Fernando Tadeo</TableCell>
            <TableCell>Entregado</TableCell>
          </TableRow>
          <TableRow key="2">
            <TableCell>Pedido #1204</TableCell>
            <TableCell>Mariana Gómez</TableCell>
            <TableCell>En Proceso</TableCell>
          </TableRow>
          <TableRow key="3">
            <TableCell>Pedido #1205</TableCell>
            <TableCell>Carlos Pérez</TableCell>
            <TableCell>Cancelado</TableCell>
          </TableRow>
          <TableRow key="4">
            <TableCell>Pedido #1206</TableCell>
            <TableCell>Sofía López</TableCell>
            <TableCell>Pendiente</TableCell>
          </TableRow>
          <TableRow key="5">
            <TableCell>Pedido #1207</TableCell>
            <TableCell>Juan Rodríguez</TableCell>
            <TableCell>Entregado</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
