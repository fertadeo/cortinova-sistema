import React from 'react'

// Importa el tipo si es necesario
// import { AbacoDataType } from '...'; // Ajusta la ruta si es necesario

type AbacoCohorteTableProps = {
  columns: string[];
  rows: {
    label: string;
    sublabel?: string;
    cells: {
      value: string;
      subvalue?: string;
      intensity?: number; // 0 a 1 para el color de fondo
    }[];
  }[];
};

function getCellColor(intensity?: number) {
  if (intensity === undefined) return "bg-gray-100";
  if (intensity > 0.8) return "bg-blue-700 text-white";
  if (intensity > 0.6) return "bg-blue-600 text-white";
  if (intensity > 0.4) return "bg-blue-400 text-white";
  if (intensity > 0.2) return "bg-blue-200 text-blue-900";
  if (intensity > 0) return "bg-blue-100 text-blue-900";
  return "bg-gray-100";
}

const AbacoCohorteTable = ({ columns, rows }: AbacoCohorteTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-max border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 px-2 py-2 font-semibold text-left text-gray-700 bg-white">
              Cohort
              <br />
              <span className="text-xs font-normal text-gray-400">Initial customers</span>
            </th>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 font-semibold text-gray-700 bg-white">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="sticky left-0 z-10 px-2 py-2 bg-white border-r">
                <div className="font-medium">{row.label}</div>
                {row.sublabel && <div className="text-xs text-gray-400">{row.sublabel}</div>}
              </td>
              {row.cells.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`align-top px-2 py-1 text-center border ${getCellColor(cell.intensity)}`}
                  style={{ minWidth: 70, maxWidth: 90 }}
                >
                  <div className="text-sm font-semibold">{cell.value}</div>
                  {cell.subvalue && (
                    <div className="text-xs">{cell.subvalue}</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AbacoCohorteTable