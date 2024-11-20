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

        // Inicializa los datos de clientes y pedidos
        const monthlyClientData = Array(12).fill(0);
        const monthlyOrderData = Array(12).fill(0).map(() =>
          Math.floor(Math.random() * 50) + 20
        );

        // Llenar los datos de clientes basados en el mes
        data.forEach((monthData) => {
          if (monthData.mes >= 1 && monthData.mes <= 12) {
            monthlyClientData[monthData.mes - 1] = monthData.cantidad;
          }
        });

        // Configura los datos para el gráfico
        setChartData({
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
            },
          ],
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

  return <canvas ref={chartRef}></canvas>;
};

export default BarChart;
