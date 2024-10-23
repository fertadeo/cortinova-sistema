'use client';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { useEffect, useRef, useState } from 'react';

interface BarChartProps {
  options: ChartOptions;
}

interface ClienteData {
  mes: number; // Suponiendo que 'mes' es un número del 1 al 12
  cantidad: number; // La cantidad de clientes para ese mes
}

const BarChart = ({ options }: BarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const [chartData, setChartData] = useState<ChartData<'bar', number[], string>>({
    labels: [], // Inicializa labels como un arreglo vacío
    datasets: [{
      label: 'Clientes por mes',
      data: [], // Inicializa data como un arreglo vacío
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes/clientes-por-mes`); // Cambia esta URL según tu API
        const data: ClienteData[] = await response.json(); // Usa la interfaz definida

        // Nombres de los meses
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Inicializa un arreglo de datos con ceros para los 12 meses
        const monthlyData = Array(12).fill(0);

        // Llenar los datos del gráfico
        data.forEach(monthData => {
          if (monthData.mes >= 1 && monthData.mes <= 12) {
            monthlyData[monthData.mes - 1] = monthData.cantidad; // Ajusta el índice para que coincida con el mes
          }
        });

        // Procesar datos para el gráfico
        const processedData: ChartData<'bar', number[], string> = {
          labels: monthNames, // Usa los nombres de los meses
          datasets: [{
            label: 'Clientes por mes',
            data: monthlyData, // Usa los datos procesados
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }]
        };

        // Ajustar la posición para centrar el mes actual
        const currentMonth = new Date().getMonth(); // Mes actual (0-11)
        const adjustedLabels = processedData.labels.slice(currentMonth).concat(processedData.labels.slice(0, currentMonth));
        const adjustedData = processedData.datasets[0].data.slice(currentMonth).concat(processedData.datasets[0].data.slice(0, currentMonth));

        setChartData({
          labels: adjustedLabels,
          datasets: [{
            ...processedData.datasets[0],
            data: adjustedData // Asegúrate de que este es un arreglo de números
          }]
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
        options: options
      });

      // Cleanup to avoid memory leaks
      return () => {
        myChart.destroy();
      };
    }
  }, [chartData, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default BarChart;
