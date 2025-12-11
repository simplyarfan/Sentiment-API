# Sentiment Analysis Frontend

A modern React frontend for the Sentiment Analysis API, featuring real-time sentiment analysis, history tracking, and cache performance monitoring.

## Features

- **Real-time Sentiment Analysis**: Analyze text sentiment instantly
- **Visual Feedback**: Beautiful emoji-based sentiment indicators
- **Confidence Scores**: Progress bars showing prediction confidence
- **Analysis History**: Browse and filter previous analyses
- **Cache Statistics**: Monitor Redis cache performance
- **Responsive Design**: Works on all devices (320px+)
- **Accessibility**: WCAG AA compliant

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- The Sentiment API backend running (see main README)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8000
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # App header
│   ├── Footer.tsx       # App footer
│   ├── SentimentAnalyzer.tsx  # Main input/analysis
│   ├── ResultCard.tsx   # Result display
│   ├── HistoryList.tsx  # Analysis history
│   └── CacheStats.tsx   # Cache dashboard
├── hooks/               # Custom React hooks
│   ├── useSentimentAnalysis.ts
│   ├── useHistory.ts
│   └── useCacheStats.ts
├── services/            # API services
│   └── api.ts           # Axios instance & endpoints
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utility functions
│   ├── formatters.ts    # Date/number formatting
│   └── validators.ts    # Input validation
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Deployment

### GitHub Pages

The frontend is configured for GitHub Pages deployment. Push to `main` branch and the GitHub Actions workflow will automatically build and deploy.

Live URL: `https://simplyarfan.github.io/Sentiment-API/`

### Other Platforms

- **Vercel**: Connect your GitHub repo
- **Netlify**: Connect your GitHub repo
- **Manual**: Run `npm run build` and upload `dist/` folder

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Analyze text sentiment |
| `/history` | GET | Get analysis history |
| `/cache/stats` | GET | Get cache statistics |

## License

MIT
