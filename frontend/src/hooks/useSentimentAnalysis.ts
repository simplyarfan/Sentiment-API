import { useState, useCallback } from 'react';
import { analyzeSentiment } from '../services/api';
import type { SentimentResult } from '../types';

interface UseSentimentAnalysisReturn {
  result: SentimentResult | null;
  isLoading: boolean;
  error: string | null;
  analyze: (text: string) => Promise<void>;
  reset: () => void;
}

export const useSentimentAnalysis = (): UseSentimentAnalysisReturn => {
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeSentiment(text);
      setResult(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    result,
    isLoading,
    error,
    analyze,
    reset,
  };
};
