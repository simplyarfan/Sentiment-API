import { useState, useCallback, useEffect } from 'react';
import { getCacheStats } from '../services/api';
import type { CacheStats } from '../types';

interface UseCacheStatsReturn {
  stats: CacheStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useCacheStats = (autoRefreshInterval: number = 30000): UseCacheStatsReturn => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCacheStats();
      setStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cache stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(fetchStats, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefreshInterval]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
};
