'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Tooltip, Button, Tabs, Tab, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import '../../styles/globals.css'
import AreaChart6 from '@/components/tremor-ui/AreaChart6';

const metricas = [
  {
    title: 'Monto',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
      </svg>
    ),
    value: '$12.520,300',
    change: '+1.2%',
    changeType: 'up',
    subtext: '+$111,500 respecto al mes anterior',
    bgColor: 'bg-green-500',
  },
  {
    title: 'Gastos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
        <path d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Z" />
        <path d="M9 6a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" />
        <path d="M9 9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" />
        <path d="M9 12a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" />
        <path d="M9 15a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" />
      </svg>
    ),
    value: '$32,800',
    change: '-3.1%',
    changeType: 'down',
    subtext: '-$1,050 respecto al mes anterior',
    bgColor: 'bg-red-400',
  },
  {
    title: 'Ventas concretadas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
        <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z" clipRule="evenodd" />
      </svg>
    ),
    value: '47',
    change: '+5.4%',
    changeType: 'up',
    subtext: '+3 respecto al mes anterior',
    bgColor: 'bg-blue-500',
  },
  {
    title: 'Nuevos clientes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
        <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
      </svg>
    ),
    value: '12',
    change: '+9.2%',
    changeType: 'up',
    subtext: '+1 respecto al mes anterior',
    bgColor: 'bg-purple-500',
  },
];

const leyendaObjetivo = [
  { color: 'bg-green-100', label: 'Monto bajo' },
  { color: 'bg-green-300', label: 'Monto medio' },
  { color: 'bg-green-500', label: 'Monto alto' },
  { color: 'bg-green-700', label: 'Monto máximo' },
];

const leyendaGastos = [
  { color: 'bg-yellow-100', label: 'Gasto bajo' },
  { color: 'bg-yellow-300', label: 'Gasto medio' },
  { color: 'bg-yellow-500', label: 'Gasto alto' },
  { color: 'bg-yellow-700', label: 'Gasto máximo' },
];

const horas = ['12-16h', '8-12h', '4-8h', '0-4h'];
const dias = Array.from({ length: 31 }, (_, i) => i + 1);

// Función para saber si un día es domingo o sábado (algunos sábados)
const isWeekend = (day: number) => {
  // Suponiendo que el mes empieza en lunes (ajusta si tu mes empieza en otro día)
  // 0: lunes, 5: sábado, 6: domingo
  const weekDay = (day + 0) % 7; // 0 = lunes, 6 = domingo
  // Excluye domingos y algunos sábados (por ejemplo, el 2do y 4to sábado del mes)
  const isSaturday = weekDay === 5;
  const isSunday = weekDay === 6;
  const isSomeSaturdays = isSaturday && ([2, 4].includes(Math.ceil(day / 7)));
  return isSunday || isSomeSaturdays;
};

// Generar datos para "Objetivo" (cashflow actual)
const dataObjetivo = horas.map((_, rowIdx) =>
  dias.map((day) => {
    if (isWeekend(day)) return null;
    // Simula un flujo variado, pero menos gasto al inicio
    if (day <= 5) return Math.floor(Math.random() * 2); // 0-1
    if (day <= 20) return Math.floor(Math.random() * 3); // 0-2
    return Math.floor(Math.random() * 2); // 0-1
  })
);

// Generar datos para "Gastos" (más gasto al inicio de mes)
const dataGastos = horas.map((_, rowIdx) =>
  dias.map((day) => {
    if (isWeekend(day)) return null;
    // Más gasto al inicio, menos al final
    if (day <= 5) return 2 + Math.floor(Math.random() * 2); // 2-3
    if (day <= 10) return 1 + Math.floor(Math.random() * 2); // 1-2
    if (day <= 20) return Math.floor(Math.random() * 2); // 0-1
    return Math.random() > 0.7 ? 1 : 0; // mayoría 0, algunos 1
  })
);

// Función para obtener un monto aleatorio según el nivel
const getMontoPorNivel = (nivel: number | null) => {
  if (nivel === null) return 0;
  if (nivel === 0) return Math.floor(Math.random() * (15999 - 1000 + 1)) + 1000;
  if (nivel === 1) return Math.floor(Math.random() * (49000 - 16000 + 1)) + 16000;
  if (nivel === 2) return Math.floor(Math.random() * (99000 - 49001 + 1)) + 49001;
  if (nivel === 3) return Math.floor(Math.random() * (200000 - 99001 + 1)) + 99001;
  return 0;
};

const Cashflow = () => {
  const [tab, setTab] = useState('objetivo');
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);

  const leyenda = tab === 'objetivo' ? leyendaObjetivo : leyendaGastos;
  const data = tab === 'objetivo' ? dataObjetivo : dataGastos;

  return (
    <Card className=" mr-2 ml-0 w-[100%]">
      <CardHeader className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">Resumen de flujo diario</span>
          <Tooltip content="Resumen de ingresos y egresos diarios">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-white">
                <path fillRule="evenodd" d="M3.75 3.375c0-1.036.84-1.875 1.875-1.875H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375Zm10.5 1.875a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25ZM12 10.5a.75.75 0 0 1 .75.75v.028a9.727 9.727 0 0 1 1.687.28.75.75 0 1 1-.374 1.452 8.207 8.207 0 0 0-1.313-.226v1.68l.969.332c.67.23 1.281.85 1.281 1.704 0 .158-.007.314-.02.468-.083.931-.83 1.582-1.669 1.695a9.776 9.776 0 0 1-.561.059v.028a.75.75 0 0 1-1.5 0v-.029a9.724 9.724 0 0 1-1.687-.278.75.75 0 0 1 .374-1.453c.425.11.864.186 1.313.226v-1.68l-.968-.332C9.612 14.974 9 14.354 9 13.5c0-.158.007-.314.02-.468.083-.931.831-1.582 1.67-1.694.185-.025.372-.045.56-.06v-.028a.75.75 0 0 1 .75-.75Zm-1.11 2.324c.119-.016.239-.03.36-.04v1.166l-.482-.165c-.208-.072-.268-.211-.268-.285 0-.113.005-.225.015-.336.013-.146.14-.309.374-.34Zm1.86 4.392V16.05l.482.165c.208.072.268.211.268.285 0 .113-.005.225-.015.336-.012.146-.14.309-.374.34-.12.016-.24.03-.361.04Z" clipRule="evenodd" />
              </svg>
            </span>
          </Tooltip>
        </div>
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(String(key))}
          variant="solid"
          aria-label="Cashflow Tabs"
          classNames={{
            tabList: "bg-gray-100",
            tab: "data-[selected=true]:!bg-[#14b8a6] data-[selected=true]:!text-white !rounded-lg",
          }}
        >
          <Tab key="objetivo" title="Ingreso" />
          <Tab key="gastos" title="Gastos" />
        </Tabs>
      </CardHeader>
      <CardBody>
        {/* Leyenda */}
        <div className="flex gap-4 mb-4">
          {leyenda.map((l, i) => (
            <div key={i} className="flex gap-1 items-center">
              <div className={`w-4 h-4 rounded ${l.color}`} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="flex">
            {/* Eje Y */}
            <div className="flex flex-col justify-between mr-2">
              {horas.map((h, i) => (
                <div key={i} className="flex items-center h-6 text-xs text-gray-500" style={{ height: 32 }}>{h}</div>
              ))}
            </div>
            {/* Grid de días */}
            <div>
              <div className="flex gap-1 mb-1">
                {dias.map((d) => (
                  <div key={d} className="w-6 text-xs text-center text-gray-400">{d}</div>
                ))}
              </div>
              <div>
                {data.map((row, i) => (
                  <div key={i} className="flex gap-1 mb-1">
                    {row.map((cell, j) => {
                      if (cell === null) {
                        return (
                          <div
                            key={j}
                            className="w-6 h-6 bg-gray-200 rounded border border-gray-100 opacity-50"
                          />
                        );
                      }
                      const isSelected = selected && selected.row === i && selected.col === j;
                      const isDimmed = selected && !isSelected;
                      // Generar monto aleatorio para mostrar en el popover
                      const monto = getMontoPorNivel(cell);
                      return (
                        <Popover
                          key={j}
                          placement="top"
                          isOpen={!!isSelected}
                          onOpenChange={(open) => {
                            if (!open) setSelected(null);
                          }}
                        >
                          <PopoverTrigger>
                            <div
                              role="button"
                              tabIndex={0}
                              className={`w-6 h-6 rounded cursor-pointer border border-gray-100 ${leyenda[cell].color} transition-opacity duration-200 ${isSelected ? "opacity-100 ring-2 ring-[#14b8a6]" : isDimmed ? "opacity-40" : "opacity-100"}`}
                              onClick={() => setSelected(isSelected ? null : { row: i, col: j })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelected(isSelected ? null : { row: i, col: j });
                                }
                              }}
                            />
                          </PopoverTrigger>
                          <PopoverContent>
                            <div className="p-2 text-center">
                              <div className="font-semibold">Día {dias[j]}</div>
                              <div>Hora: {horas[i]}</div>
                              <div>
                                Monto: <span className="font-bold">${monto.toLocaleString()}</span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Page = () => {
  const [tab, setTab] = useState("kpis");

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-semibold">Métricas generales</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricas.map((m, idx) => (
          <Card key={idx} className="shadow-md">
            <CardHeader className="flex gap-3 items-center">
              <div className={`w-11 h-11 flex items-center justify-center rounded-lg ${m.bgColor}`}>
                {m.icon}
              </div>
              <span className="text-lg font-medium">{m.title}</span>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">{m.value}</div>
              <div className="flex gap-2 items-center mt-2">
                <span className={`text-sm font-semibold ${m.changeType === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {m.change}
                </span>
                <span className="text-xs text-gray-500">{m.subtext}</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="flex w-full min-h-[500px]">
        <div className="mt-8 mr-2 ml-0 w-[62%] h-full min-h-[500px]">
          <Cashflow />
        </div>
        <Card className="mt-8 ml-2 w-[36%] relative h-full min-h-[250px]">
          {/* Botón en la esquina superior derecha */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full transition hover:bg-[#14b8a6] group"
            aria-label="Ver gráficos"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-teal-600 transition group-hover:text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </button>
          <CardHeader>
            <span className="text-lg font-semibold">Resumen de ventas</span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div>
                <span className="font-medium">Ticket promedio:</span> <br />
                <span className="text-xl font-bold text-teal-600">$18,200</span>
              </div>
              <div>
                <span className="font-medium">Producto más vendido:</span> <br />
                <span className="text-base font-bold text-teal-600">Cortina Blackout Premium</span>
              </div>
              <div>
                <span className="font-medium">Vendedor destacado:</span> <br />
                <span className="text-base font-bold text-teal-800">María López</span>
              </div>
              <div> 
                <span className="font-medium">Cumplimiento de objetivo:</span> <br />
                <span className="text-base font-bold text-green-600">92%</span>
              </div>
              <div>
                <span className="font-medium">Días sin ventas:</span> <br />
                <span className="text-base font-bold text-red-500">2</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Page;