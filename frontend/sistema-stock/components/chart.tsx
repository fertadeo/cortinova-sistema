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

const BarChart = ({ options }: BarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [chartData, setChartData] = useState<ChartData<'bar', number[], string>>({
    labels: [],
    datasets: [
      {
        label: 'Clientes por mes',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pedidos confirmados',
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/clientes-por-mes`);
        const data: ClienteData[] = await response.json();

        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Inicializa arreglos de datos con ceros para los 12 meses
        const monthlyClientData = Array(12).fill(0);
        // Datos de ejemplo para pedidos confirmados
        const monthlyOrderData = Array(12).fill(0).map(() => 
          Math.floor(Math.random() * 50) + 20
        ); // Genera números aleatorios entre 20 y 70

        // Llenar los datos de clientes
        data.forEach(monthData => {
          if (monthData.mes >= 1 && monthData.mes <= 12) {
            monthlyClientData[monthData.mes - 1] = monthData.cantidad;
          }
        });

        // Procesar datos para el gráfico
        const processedData: ChartData<'bar', number[], string> = {
          labels: monthNames,
          datasets: [
            {
              label: 'Clientes nuevos por mes',
              data: monthlyClientData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Pedidos confirmados',
              data: monthlyOrderData,
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
            }
          ]
        };

        // Ajustar la posición para centrar el mes actual
        const currentMonth = new Date().getMonth();
        const adjustedLabels = processedData.labels.slice(currentMonth).concat(processedData.labels.slice(0, currentMonth));
        const adjustedClientData = processedData.datasets[0].data.slice(currentMonth).concat(processedData.datasets[0].data.slice(0, currentMonth));
        const adjustedOrderData = processedData.datasets[1].data.slice(currentMonth).concat(processedData.datasets[1].data.slice(0, currentMonth));

        setChartData({
          labels: adjustedLabels,
          datasets: [
            {
              ...processedData.datasets[0],
              data: adjustedClientData
            },
            {
              ...processedData.datasets[1],
              data: adjustedOrderData
            }
          ]
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = new Chart(chartRef.current, {
        type: 'bar',
        data: chartData,
        options: {
          ...options,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      return () => {
        myChart.destroy();
      };
    }
  }, [chartData, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default BarChart;