// pages/api/benchmark.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { benchmarkEndpoints, BenchmarkResult } from '@/app/utils/benchmarkEndpoints';

// Define the response structure
interface BenchmarkApiResponse {
  success: boolean;
  data?: BenchmarkResult[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BenchmarkApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res
      .status(405)
      .json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { endpoints } = req.body;

  if (!endpoints || !Array.isArray(endpoints)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request payload. "endpoints" must be an array of URLs.',
    });
  }

  try {
    const results = await benchmarkEndpoints(endpoints);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: 'An unexpected error occurred.' });
  }
}

