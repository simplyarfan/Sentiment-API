import { useState, useCallback, useEffect } from 'react';
import { Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import { useSentimentAnalysis } from '../hooks/useSentimentAnalysis';
import { validateText, MAX_TEXT_LENGTH } from '../utils/validators';
import ResultCard from './ResultCard';

const SAMPLE_TEXTS = {
  positive: "I absolutely love this product! It exceeded all my expectations and the customer service was fantastic. Highly recommend to everyone!",
  negative: "This is terrible. I'm extremely disappointed with the quality and service. Complete waste of money and time. Do not buy!",
};

interface SentimentAnalyzerProps {
  onAnalysisComplete?: () => void;
}

const SentimentAnalyzer = ({ onAnalysisComplete }: SentimentAnalyzerProps) => {
  const [text, setText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { result, isLoading, error, analyze, reset } = useSentimentAnalysis();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (newText.trim()) {
      const validation = validateText(newText);
      setValidationError(validation.error);
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    const validation = validateText(text);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    await analyze(text.trim());
    onAnalysisComplete?.();
  }, [text, analyze, onAnalysisComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClear = () => {
    setText('');
    setValidationError(null);
    reset();
  };

  const handleSampleText = (type: 'positive' | 'negative') => {
    setText(SAMPLE_TEXTS[type]);
    setValidationError(null);
    reset();
  };

  // Scroll to result when analysis completes
  useEffect(() => {
    if (result) {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  const isValid = text.trim().length > 0 && !validationError;
  const charCount = text.length;
  const charCountClass = charCount > MAX_TEXT_LENGTH
    ? 'text-red-500'
    : charCount > MAX_TEXT_LENGTH * 0.9
      ? 'text-yellow-500'
      : 'text-gray-400';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Analyze Text Sentiment in Real-Time
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Powered by DistilBERT transformer model with 99%+ accuracy.
          Experience lightning-fast results with Redis caching.
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste your text here to analyze sentiment..."
            className={`w-full min-h-[150px] max-h-[400px] p-4 text-gray-900 bg-white border-2 rounded-xl resize-y focus:outline-none focus:ring-2 transition-all ${
              validationError
                ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
            }`}
            disabled={isLoading}
            aria-label="Text input for sentiment analysis"
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'validation-error' : undefined}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`text-sm font-mono ${charCountClass}`}>
              {charCount}/{MAX_TEXT_LENGTH}
            </span>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <p id="validation-error" className="text-sm text-red-500 animate-fade-in">
            {validationError}
          </p>
        )}

        {/* API Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Sample Text Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Try examples:</span>
          <button
            type="button"
            onClick={() => handleSampleText('positive')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <Sparkles className="w-3 h-3" />
            Positive
          </button>
          <button
            type="button"
            onClick={() => handleSampleText('negative')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <Sparkles className="w-3 h-3" />
            Negative
          </button>
          {text && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold rounded-xl transition-all ${
            isValid && !isLoading
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze Sentiment
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Enter</kbd> to analyze
        </p>
      </form>

      {/* Result Section */}
      {result && (
        <div id="result-section" className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
};

export default SentimentAnalyzer;
