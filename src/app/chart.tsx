import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { BenchmarkResult } from '@/app/benchmark';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

// Define the props for BenchmarkChart
interface BenchmarkChartProps {
  benchmarkData: (BenchmarkResult | null)[][];
}

const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ benchmarkData }) => {
  /**
   * Assigns a distinct color to each dataset.
   */
  const getColor = (index: number) => {
    const colors = [
      'rgba(75,192,192,1)',
      'rgba(255,99,132,1)',
      'rgba(54, 162, 235,1)',
      'rgba(255, 206, 86,1)',
      'rgba(153, 102, 255,1)',
      'rgba(255, 159, 64,1)',
      'rgba(199, 199, 199,1)',
      'rgba(83,102,255,1)',
      'rgba(255,102,255,1)',
      'rgba(255,255,102,1)',
    ];
    return colors[index % colors.length];
  };

  /**
   * Prepares the data for the Line chart.
   */
  const prepareChartData = () => {
    const datasets = benchmarkData.map((endpointResults, idx) => {
      const validResults = endpointResults.filter(
        (result): result is BenchmarkResult => result !== null
      );

      return {
        label: endpointResults[0]?.endpoint || `Endpoint ${idx + 1}`,
        data: validResults.map(result => ({
          x: result.timestamp,
          y: result.responseTime,
        })),
        borderColor: getColor(idx),
        backgroundColor: getColor(idx),
        fill: false,
        tension: 0.1,
      };
    });

    console.log("datasets", datasets);
    return {
      datasets,
    };
  };

  return (
    <div>
      {benchmarkData.length === 0 ? (
        <p>No benchmark data available to display.</p>
      ) : (
        <Line data={prepareChartData()} options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Endpoint Response Times',
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'second',
                tooltipFormat: 'PPpp',
              },
              title: {
                display: true,
                text: 'Time',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Response Time (ms)',
              },
              beginAtZero: true,
            },
          }
        }}
        />
      )}
    </div>
  );
};

  export default BenchmarkChart;

