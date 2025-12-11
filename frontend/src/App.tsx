import { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import HistoryList from './components/HistoryList';
import CacheStats from './components/CacheStats';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnalysisComplete = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Sentiment Analyzer Section */}
          <section>
            <SentimentAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </section>

          {/* History and Stats Section */}
          <section className="grid lg:grid-cols-2 gap-8">
            <HistoryList refreshTrigger={refreshTrigger} />
            <CacheStats />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
