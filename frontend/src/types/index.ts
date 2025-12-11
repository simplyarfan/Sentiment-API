// API Response Types
export interface SentimentResult {
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE';
  confidence: number;
  processing_time_ms: number;
  cached: boolean;
  created_at?: string;
}

export interface HistoryItem {
  id: number;
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE';
  confidence: number;
  processing_time_ms: number;
  created_at: string;
}

export interface HistoryResponse {
  total: number;
  analyses: HistoryItem[];
}

export interface CacheStats {
  status: string;
  total_keys: number;
  sentiment_keys: number;
  memory_used_mb: number;
  hits: number;
  misses: number;
  hit_rate: number;
}

export interface ApiError {
  detail: string;
}

// Component Props Types
export interface ResultCardProps {
  result: SentimentResult;
}

export interface HistoryItemProps {
  item: HistoryItem;
  onClick?: () => void;
}
