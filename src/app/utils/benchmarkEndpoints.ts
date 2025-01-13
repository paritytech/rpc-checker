// utils/benchmarkEndpoints.ts

import https from 'https';
import { URL } from 'url';
import WebSocket from 'ws';

/**
 * Type definition for the benchmark result of an endpoint.
 */
export interface BenchmarkResult {
  endpoint: string;
  responseTime?: number; // in milliseconds
  error?: string;
}

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
 * Measures the response time for an HTTPS GET request.
 * @param urlString The HTTPS endpoint to benchmark.
 * @returns The response time in milliseconds.
 */
const benchmarkHttps = (urlString: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const options: https.RequestOptions = {
      method: 'GET',
      hostname: url.hostname,
      path: url.pathname + url.search,
      port: url.port || 443,
      timeout: 10000, // 10 seconds timeout
    };

    const startTime = Date.now();

    const req = https.request(options, (res) => {
      res.on('data', () => {
        // Consume data to ensure the request completes
      });
      res.on('end', () => {
        const endTime = Date.now();
        resolve(endTime - startTime);
      });
    });

    req.on('error', (err) => {
      reject(err.message);
    });

    req.on('timeout', () => {
      req.destroy();
      reject('Request timed out');
    });

    req.end();
  });
};

/**
 * Measures the time taken to establish a WebSocket connection.
 * @param urlString The WSS endpoint to benchmark.
 * @returns The connection time in milliseconds.
 */
const benchmarkWss = (urlString: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const ws = new WebSocket(urlString, {
      handshakeTimeout: 10000, // 10 seconds timeout
    });

    const timeout = setTimeout(() => {
      ws.terminate();
      reject('WebSocket connection timed out');
    }, 10000);

    ws.on('open', () => {
      clearTimeout(timeout);
      const endTime = Date.now();
      ws.close();
      resolve(endTime - startTime);
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(`WebSocket error: ${err.message}`);
    });
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

    return { endpoint, responseTime };
  } catch (error) {
    return { endpoint, error: String(error) };
  }
};

/**
 * Benchmarks multiple endpoints and returns their response times.
 * @param endpoints An array of endpoint URLs to benchmark.
 * @returns An array of benchmark results.
 */
export const benchmarkEndpoints = async (
  endpoints: string[]
): Promise<BenchmarkResult[]> => {
  // Limit the number of concurrent benchmarks to prevent resource exhaustion
  const concurrencyLimit = 10;
  const results: BenchmarkResult[] = [];
  let index = 0;

  const executeBatch = async () => {
    while (index < endpoints.length) {
      const currentIndex = index++;
      const endpoint = endpoints[currentIndex];
      const result = await benchmarkEndpoint(endpoint);
      results[currentIndex] = result;
    }
  };

  // Initialize workers based on the concurrency limit
  const workers = Array.from({ length: concurrencyLimit }, () => executeBatch());

  await Promise.all(workers);

  return results;
};

