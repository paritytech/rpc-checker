'use client';

import { useState } from 'react';
import type { NextPage } from 'next';
import Benchmark, { BenchmarkResult } from '@/app/benchmark';
import { kusama, polkadot } from '@/app/endpoints';
import BenchmarkChart from '@/app/chart';
import SREMetricsTable from '@/app/metricsTable';

const Home: NextPage = () => {
  const [benchmarkData, setBenchmarkData] = useState<(BenchmarkResult | null)[][]>([]);
  const endpoints = kusama;

  /**
   * Handles incoming benchmark results.
   * Groups results by endpoint.
   */
  const handleBenchmarkResult = (result: BenchmarkResult | null) => {
    if (!result) return;

    setBenchmarkData(prevData => {
      // Find the index for the endpoint
      const endpointIndex = prevData.findIndex(
        (results) => results[0]?.endpoint === result.endpoint
      );

      if (endpointIndex !== -1) {
        // Append to existing endpoint's results
        const updatedData = [...prevData];
        updatedData[endpointIndex] = [...updatedData[endpointIndex], result];
        return updatedData;
      } else {
        // Add a new array for the new endpoint
        return [...prevData, [result]];
      }
    });
  };

  return (
    <div>
      <h1>Endpoint Benchmarking Tool</h1>

      <Benchmark endpoints={endpoints} onResult={handleBenchmarkResult} />

      <SREMetricsTable benchmarkData={benchmarkData} />
      <BenchmarkChart benchmarkData={benchmarkData} />

    </div>
  );
};

export default Home;

