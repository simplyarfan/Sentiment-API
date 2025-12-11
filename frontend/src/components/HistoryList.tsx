import { useState, useEffect } from 'react';
import { History, RefreshCw, ChevronDown, Smile, Frown, Filter } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import type { HistoryItem } from '../types';
import { formatConfidence, formatRelativeTime, truncateText } from '../utils/formatters';

type SentimentFilter = 'all' | 'POSITIVE' | 'NEGATIVE';

interface HistoryListProps {
  refreshTrigger?: number;
}

const HistoryList = ({ refreshTrigger }: HistoryListProps) => {
  const { history, total, isLoading, error, refresh, loadMore } = useHistory(10);
  const [filter, setFilter] = useState<SentimentFilter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(item => item.sentiment === filter);

  const handleItemClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Recent Analyses</h3>
          {total > 0 && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as SentimentFilter)}
              className="appearance-none pl-8 pr-8 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEGATIVE">Negative</option>
            </select>
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 px-4">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No analysis history yet</p>
            <p className="text-sm text-gray-400">
              Analyze your first text above!
            </p>
          </div>
        ) : (
          filteredHistory.map((item: HistoryItem) => (
            <HistoryItemRow
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {history.length < total && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4" />
            Load More ({total - history.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

interface HistoryItemRowProps {
  item: HistoryItem;
  isExpanded: boolean;
  onClick: () => void;
}

const HistoryItemRow = ({ item, isExpanded, onClick }: HistoryItemRowProps) => {
  const isPositive = item.sentiment === 'POSITIVE';

  return (
    <div
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Sentiment Icon */}
        <div
          className={`p-2 rounded-lg ${
            isPositive ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isPositive ? (
            <Smile className="w-4 h-4 text-green-600" />
          ) : (
            <Frown className="w-4 h-4 text-red-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 mb-1">
            {isExpanded ? item.text : truncateText(item.text, 60)}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {item.sentiment}
            </span>
            <span className="font-mono">{formatConfidence(item.confidence)}</span>
            <span className="text-gray-400">•</span>
            <span>{formatRelativeTime(item.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
