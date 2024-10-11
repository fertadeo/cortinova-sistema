// src/components/EditableField.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@nextui-org/react";
import { FaEdit } from "react-icons/fa";

type EditableFieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  isEditable?: boolean;
  type?: string; // Añadimos un prop para especificar el tipo de input
};

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditable = true,
  type = "text", // Por defecto, el tipo es texto
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div style={{ position: "relative", marginBottom: "15px" }}>
      <Input
        label={label}
        value={String(value)} // Convertimos el valor a string
        readOnly={!isEditing}
        onChange={handleInputChange}
        type={type} // Especificamos el tipo de input
      />
      {isEditable && (
        <FaEdit
          style={{
            position: "absolute",
            right: "10px",
            top: "35px",
            cursor: "pointer",
            color: isEditing ? "green" : "gray",
          }}
          onClick={() => setIsEditing(!isEditing)}
        />
      )}
    </div>
  );
};

export default EditableField;
