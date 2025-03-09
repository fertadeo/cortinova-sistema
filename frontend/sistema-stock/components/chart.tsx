'use client';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { useEffect, useRef, useState } from 'react';

interface BarChartProps {
  options: ChartOptions;
}

interface ClienteData {
  mes: number;
  cantidad: number;
}

interface PresupuestoData {
  mes: string;
  total_presupuestos: number;
  suma_total: number;
  total_clientes: number;
}

interface APIResponse {
  data: PresupuestoData[];
}

const BarChart = ({ options }: BarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [chartData, setChartData] = useState<ChartData<'bar', number[], string>>({
    labels: [],
    datasets: [
      {
        label: 'Clientes Nuevos',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pedidos Realizados',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        label: 'Presupuestos Emitidos',
        data: [],
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      }
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesResponse, presupuestosResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/clientes-por-mes`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/presupuestos/presupuestos-por-mes`)
        ]);

        const clientesData: ClienteData[] = await clientesResponse.json();
        const presupuestosData: APIResponse = await presupuestosResponse.json();

        // Extraer años únicos de los datos
        const years = new Set<number>();
        presupuestosData.data.forEach((data) => {
          const year = parseInt(data.mes.split('-')[0]);
          years.add(year);
        });
        setAvailableYears(Array.from(years).sort());

        // Inicializa los datos
        const monthlyClientData = Array(12).fill(0);
        const monthlyPresupuestoPendienteData = Array(12).fill(0);
        const monthlyPresupuestoEmitidoData = Array(12).fill(0);

        // Filtrar y llenar los datos según el año seleccionado
        presupuestosData.data
          .filter((data) => data.mes.startsWith(selectedYear.toString()))
          .forEach((monthData: PresupuestoData) => {
            const [_, month] = monthData.mes.split('-');
            const monthIndex = parseInt(month) - 1;
            
            if (monthIndex >= 0 && monthIndex < 12) {
              monthlyPresupuestoEmitidoData[monthIndex] = monthData.total_presupuestos;
              monthlyClientData[monthIndex] = monthData.total_clientes;
            }
          });

        console.log('=== DATOS DEL GRÁFICO ===');
        console.log('Clientes por mes:', monthlyClientData);
        console.log('Presupuestos por mes:', monthlyPresupuestoEmitidoData);

        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Configura los datos para el gráfico
        setChartData({
          labels: monthNames,
          datasets: [
            {
              label: 'Clientes Nuevos',
              data: monthlyClientData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Pedidos Realizados',
              data: monthlyPresupuestoPendienteData,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
            {
              label: 'Presupuestos Emitidos',
              data: monthlyPresupuestoEmitidoData,
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
            }
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = new Chart(chartRef.current, {
        type: 'bar',
        data: chartData,
        options: {
          ...options,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      return () => {
        myChart.destroy();
      };
    }
  }, [chartData, options]);

  return (
    <div>
      <div className="mb-4">
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="p-2 rounded border"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default BarChart;
