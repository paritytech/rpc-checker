import React, { useState, useEffect, useRef } from 'react';

/**
 * Type definition for the benchmark result of an endpoint.
 */
export interface BenchmarkResult {
  endpoint: string;
  timestamp: number;
  responseTime?: number; // in milliseconds
  error?: string;
}

interface BenchmarkProps {
  endpoints: string[];
  onResult: (result: BenchmarkResult) => void;
}

const Benchmark: React.FC<BenchmarkProps> = ({ endpoints, onResult }) => {
  const [benchmarking, setBenchmarking] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataToFetch = {
    method: 'chain_getBlock',
    params: [],
    id: 1,
    jsonrpc: '2.0',
  };

  /**
   * Determines if the given URL is a secure WebSocket endpoint.
   * @param urlString The URL string to evaluate.
   * @returns True if the URL uses the 'wss' protocol, else false.
   */
  const isWss = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'wss:';
    } catch (error) {
      return false;
    }
  };

  /**
   * Benchmarks an HTTPS endpoint by measuring the response time of a GET request.
   * @param urlString The HTTPS endpoint to benchmark.
   * @returns The response time in milliseconds.
   */
  const benchmarkHttps = async (urlString: string): Promise<number> => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, config.timeout);

    const startTime = performance.now();
    try {
      const response = await fetch(urlString, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(dataToFetch),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Validate that data is returned
      if (data && Object.keys(data).length > 0) {
        const endTime = performance.now();
        return endTime - startTime;
      } else {
        throw new Error('No data returned from the node.');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw new Error(error.message || 'Unknown error');
    } finally {
      clearTimeout(timeout);
    }
  };


  /**
   * Benchmarks a WSS endpoint by measuring the time to establish a WebSocket connection.
   * @param urlString The WSS endpoint to benchmark.
   * @returns The connection time in milliseconds.
   */
  const benchmarkWss = (urlString: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      let ws: WebSocket;

      try {
        ws = new WebSocket(urlString);
      } catch (error) {
        reject(new Error('Invalid WebSocket URL'));
        return;
      }

      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timed out'));
      }, 10000); // 10 seconds timeout

      // Define the JSON-RPC message
      const message = JSON.stringify(dataToFetch);

      // Handle incoming messages
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.id === 1) { // Match the id to ensure it's the response to our request
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            clearTimeout(timeout);
            ws.close();
            resolve(responseTime);
          }
        } catch (err) {
          // If response is not JSON or doesn't match, ignore or handle accordingly
        }
      };

      // Handle errors
      const handleError = () => {
        clearTimeout(timeout);
        ws.close();
        reject(new Error('WebSocket error'));
      };

      ws.onopen = () => {
        ws.send(message);
      };

      ws.onmessage = handleMessage;
      ws.onerror = handleError;
      ws.onclose = () => {
        clearTimeout(timeout);
      };
      });
  };


  /**
   * Benchmarks a single endpoint by measuring its response time.
   * @param endpoint The endpoint URL to benchmark.
   * @returns The benchmark result containing the response time or error.
   */
  const benchmarkEndpoint = async (endpoint: string): Promise<BenchmarkResult> => {
    if (!/^https?:\/\/|^wss?:\/\//.test(endpoint)) {
      return {
        endpoint,
        timestamp: Date.now(),
        error: 'Invalid URL protocol. Must start with http://, https://, ws://, or wss://',
      };
    }

    try {
      let responseTime: number;

      if (isWss(endpoint)) {
        responseTime = await benchmarkWss(endpoint);
      } else {
        responseTime = await benchmarkHttps(endpoint);
      }

      return { endpoint, timestamp: Date.now(), responseTime };
    } catch (error: any) {
      return { endpoint, timestamp: Date.now(), error: error.message };
    }
  };

  /**
   * Runs the benchmarking process for all endpoints.
   */
  const runBenchmark = async () => {
    for (const endpoint of endpoints) {
      const result = await benchmarkEndpoint(endpoint);
      onResult(result);
    }
  };

  /**
   * Schedules the next benchmark run with a random delay between 1 to 5 seconds.
   */
  const scheduleNextBenchmark = () => {
    const delay = Math.floor(Math.random() * (10000 - 5000 + 1)); // 1 to 5000 ms
    timeoutRef.current = setTimeout(async () => {
      if (benchmarking) {
        await runBenchmark();
        scheduleNextBenchmark();
      }
    }, delay);
  };

  /**
   * Starts the periodic benchmarking.
   */
  const startBenchmarking = () => {
    if (!benchmarking) {
      setBenchmarking(true);
    }
  };

  /**
   * Stops the periodic benchmarking.
   */
  const stopBenchmarking = () => {
    setBenchmarking(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (benchmarking) {
      runBenchmark();
      scheduleNextBenchmark();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benchmarking]);

  return (
    <div>
      {!benchmarking ? (
        <button onClick={startBenchmarking}>Start Benchmarking</button>
      ) : (
        <button onClick={stopBenchmarking}>Stop Benchmarking</button>
      )}
    </div>
  );
};

export default Benchmark;

