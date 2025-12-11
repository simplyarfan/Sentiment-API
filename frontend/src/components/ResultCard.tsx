import { Smile, Frown, Zap, Clock, CheckCircle } from 'lucide-react';
import type { SentimentResult } from '../types';
import { formatConfidence, formatProcessingTime, getConfidenceLevel, truncateText } from '../utils/formatters';

interface ResultCardProps {
  result: SentimentResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
  const isPositive = result.sentiment === 'POSITIVE';
  const confidencePercent = result.confidence * 100;

  return (
    <div className="animate-slide-up">
      <div
        className={`rounded-xl p-6 border-2 ${
          isPositive
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
        }`}
      >
        {/* Main Result */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`p-4 rounded-full animate-bounce-subtle ${
              isPositive ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isPositive ? (
              <Smile className="w-12 h-12 text-green-600" />
            ) : (
              <Frown className="w-12 h-12 text-red-600" />
            )}
          </div>
          <div>
            <span
              className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                isPositive
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {result.sentiment}
            </span>
            <p className="mt-2 text-sm text-gray-600">
              {getConfidenceLevel(result.confidence)}
            </p>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Confidence</span>
            <span className="text-lg font-bold font-mono">
              {formatConfidence(result.confidence)}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full animate-fill-bar ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {result.cached ? (
              <Zap className="w-4 h-4 text-yellow-500" />
            ) : (
              <Clock className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-sm text-gray-600">
              {result.cached ? (
                <span className="text-green-600 font-medium">
                  Cached ({formatProcessingTime(result.processing_time_ms)})
                </span>
              ) : (
                <span className="text-blue-600 font-medium">
                  Processed ({formatProcessingTime(result.processing_time_ms)})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {truncateText(result.text, 50)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
