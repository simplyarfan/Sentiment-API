import { BarChart3, Zap, Database, HardDrive, RefreshCw, TrendingUp } from 'lucide-react';
import { useCacheStats } from '../hooks/useCacheStats';
import { formatMemory } from '../utils/formatters';

const CacheStats = () => {
  const { stats, isLoading, error, refresh } = useCacheStats(30000);

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-4">
          <p className="text-red-500 text-sm mb-2">{error}</p>
          <button
            onClick={refresh}
            className="text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hitRate = stats?.hit_rate ?? 0;
  const hitRateColor = hitRate >= 80 ? 'text-green-600' : hitRate >= 50 ? 'text-yellow-600' : 'text-red-600';
  const hitRateBg = hitRate >= 80 ? 'bg-green-500' : hitRate >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Cache Performance</h3>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {/* Total Analyses */}
        <StatCard
          icon={<Database className="w-5 h-5 text-blue-500" />}
          label="Total Keys"
          value={stats?.total_keys?.toLocaleString() ?? '-'}
          isLoading={isLoading}
        />

        {/* Cache Hit Rate */}
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          label="Hit Rate"
          value={stats ? `${hitRate.toFixed(1)}%` : '-'}
          valueClass={hitRateColor}
          isLoading={isLoading}
        >
          {stats && (
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${hitRateBg}`}
                style={{ width: `${hitRate}%` }}
              />
            </div>
          )}
        </StatCard>

        {/* Hits vs Misses */}
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          label="Hits / Misses"
          value={stats ? `${stats.hits} / ${stats.misses}` : '-'}
          isLoading={isLoading}
        />

        {/* Memory Used */}
        <StatCard
          icon={<HardDrive className="w-5 h-5 text-purple-500" />}
          label="Memory Used"
          value={stats ? formatMemory(stats.memory_used_mb) : '-'}
          isLoading={isLoading}
        />
      </div>

      {/* Status Indicator */}
      {stats && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span
              className={`w-2 h-2 rounded-full ${
                stats.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>
              Redis {stats.status === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-gray-300">•</span>
            <span>Auto-refreshes every 30s</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const StatCard = ({ icon, label, value, valueClass = '', isLoading, children }: StatCardProps) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      {isLoading ? (
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      ) : (
        <>
          <p className={`text-2xl font-bold font-mono ${valueClass || 'text-gray-900'}`}>
            {value}
          </p>
          {children}
        </>
      )}
    </div>
  );
};

export default CacheStats;
