// components/BarChart.js
'use client'
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const BarChart = ({ data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: options,
    });

    // Cleanup function to destroy chart instance when component unmounts
    return () => {
      chartInstance.destroy();
    };
  }, [data, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default BarChart;
