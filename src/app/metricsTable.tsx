import React from 'react';
import { BenchmarkResult } from '@/app/benchmark';
import { calculatePercentile } from '@/app/utils/sloMetrics';

interface SREMetricsTableProps {
  benchmarkData: (BenchmarkResult | null)[][];
}

const SREMetricsTable: React.FC<SREMetricsTableProps> = ({ benchmarkData }) => {
  /**
   * Processes the benchmark data to calculate p50, p90, p99 for each endpoint.
   */
  const processSREMetrics = () => {
    return benchmarkData.map((endpointResults) => {
      const endpoint = endpointResults[0]?.endpoint || 'Unknown Endpoint';
      const responseTimes = endpointResults
        .filter((result): result is BenchmarkResult => result !== null)
        .map((result) => result.responseTime);

      const p50 = calculatePercentile(responseTimes, 50);
      const p90 = calculatePercentile(responseTimes, 90);
      const p99 = calculatePercentile(responseTimes, 99);

      return {
        endpoint,
        p50: p50 !== null ? p50.toFixed(2) : 'N/A',
        p90: p90 !== null ? p90.toFixed(2) : 'N/A',
        p99: p99 !== null ? p99.toFixed(2) : 'N/A',
      };
    });
  };

  const sreMetrics = processSREMetrics();

  return (
    <div className="overflow-x-auto">
      <h2>Quality of Service</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="bg-purple-medium border-purple-medium scroll-py-3 border-b px-4 text-left text-xs font-semibold uppercase tracking-wider text-white">Endpoint</th>
            <th className="bg-purple-medium border-purple-medium scroll-py-3 border-b px-4 text-left text-xs font-semibold uppercase tracking-wider text-white">p50 (ms)</th>
            <th className="bg-purple-medium border-purple-medium scroll-py-3 border-b px-4 text-left text-xs font-semibold uppercase tracking-wider text-white">p90 (ms)</th>
            <th className="bg-purple-medium border-purple-medium scroll-py-3 border-b px-4 text-left text-xs font-semibold uppercase tracking-wider text-white">p99 (ms)</th>
          </tr>
        </thead>
        <tbody>
          {sreMetrics.map((metric, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? 'bg-purple-light' : 'bg-white'}
            >
              <td className="border-purple-medium border-b px-4 py-2 text-sm text-gray-700">{metric.endpoint}</td>
              <td className="border-purple-medium border-b px-4 py-2 text-sm text-gray-700">{metric.p50}</td>
              <td className="border-purple-medium border-b px-4 py-2 text-sm text-gray-700">{metric.p90}</td>
              <td className="border-purple-medium border-b px-4 py-2 text-sm text-gray-700">{metric.p99}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SREMetricsTable;

