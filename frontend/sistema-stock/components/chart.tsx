'use client'
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';
import { useEffect, useRef } from 'react';

interface BarChartProps {
  data: ChartData;
  options: ChartOptions;
}

const BarChart = ({ data, options }: BarChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = new Chart(chartRef.current, {
        type: 'bar',
        data: data,
        options: options
      });

      // Cleanup to avoid memory leaks
      return () => {
        myChart.destroy();
      };
    }
  }, [data, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default BarChart;
