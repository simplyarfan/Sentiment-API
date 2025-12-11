import { useState, useCallback, useEffect } from 'react';
import { getHistory } from '../services/api';
import type { HistoryItem } from '../types';

interface UseHistoryReturn {
  history: HistoryItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useHistory = (initialLimit: number = 10): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (fetchLimit: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getHistory(fetchLimit);
      setHistory(response.analyses);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load history';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchHistory(limit);
  }, [fetchHistory, limit]);

  const loadMore = useCallback(async () => {
    const newLimit = limit + 10;
    setLimit(newLimit);
    await fetchHistory(newLimit);
  }, [fetchHistory, limit]);

  useEffect(() => {
    fetchHistory(initialLimit);
  }, [fetchHistory, initialLimit]);

  return {
    history,
    total,
    isLoading,
    error,
    refresh,
    loadMore,
  };
};
