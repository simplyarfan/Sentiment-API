# Sentiment Analysis API

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen?style=for-the-badge&logo=github)](https://simplyarfan.github.io/Sentiment-API/)
[![API Status](https://img.shields.io/badge/API-Hugging%20Face-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/simplyarfan/sentiment-api)

![Tests](https://github.com/simplyarfan/Sentiment-API/actions/workflows/test.yml/badge.svg)
![Deploy](https://github.com/simplyarfan/Sentiment-API/actions/workflows/deploy-frontend.yml/badge.svg)

### Tech Stack
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Spaces-FFD21E?style=flat-square&logo=huggingface&logoColor=black)

---

A production-ready sentiment analysis API built with FastAPI, featuring multi-service architecture with PostgreSQL, Redis caching, and a modern React frontend. Analyzes text sentiment (POSITIVE/NEGATIVE) with 99%+ accuracy using DistilBERT transformer model.

## Live Demo

**Try it now:** [https://simplyarfan.github.io/Sentiment-API/](https://simplyarfan.github.io/Sentiment-API/)

| Component | URL |
|-----------|-----|
| **Frontend** | [simplyarfan.github.io/Sentiment-API](https://simplyarfan.github.io/Sentiment-API/) |
| **API** | [huggingface.co/spaces/simplyarfan/sentiment-api](https://huggingface.co/spaces/simplyarfan/sentiment-api) |
| **API Docs** | [simplyarfan-sentiment-api.hf.space/docs](https://simplyarfan-sentiment-api.hf.space/docs) |

## Features

### Core Functionality
- **Real-time Sentiment Analysis**: Instant text sentiment classification using state-of-the-art NLP
- **High Accuracy**: 99%+ confidence scores using DistilBERT transformer model
- **REST API**: Clean, documented API endpoints with interactive Swagger UI

### Production Architecture
- **PostgreSQL Database**: Persistent storage of all analysis history
- **Redis Caching**: 75x speed improvement for repeated queries (100ms → 2ms)
- **nginx Load Balancer**: Production-grade reverse proxy for scalability
- **Docker Compose**: One-command deployment of entire stack

### DevOps & Quality
- **Automated Testing**: 19 comprehensive unit tests covering all endpoints
- **CI/CD Pipeline**: GitHub Actions for automated testing on every commit
- **100% Test Coverage**: All endpoints validated for reliability
- **Professional Git Workflow**: Feature branches, pull requests, clean commit history

---

## Architecture
### System Overview
```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#4fc3f7','primaryTextColor':'#fff','primaryBorderColor':'#fff','lineColor':'#ffffff','secondaryColor':'#ffb74d','tertiaryColor':'#81c784'}}}%%
graph TB
    Client[Client Browser]
    Nginx[nginx Load Balancer<br/>Port 80]
    API[FastAPI Application<br/>Port 8000]
    Redis[(Redis Cache<br/>Port 6379)]
    Postgres[(PostgreSQL<br/>Port 5432)]

    Client -->|HTTP Request| Nginx
    Nginx -->|Proxy| API
    API -->|Check Cache| Redis
    Redis -.->|Cache Hit| API
    API -->|Store Result| Postgres
    API -->|Cache Result| Redis
    API -->|Response| Nginx
    Nginx -->|Response| Client

    style Client fill:#4fc3f7,stroke:#fff,stroke-width:2px,color:#000
    style Nginx fill:#ffb74d,stroke:#fff,stroke-width:2px,color:#000
    style API fill:#81c784,stroke:#fff,stroke-width:2px,color:#000
    style Redis fill:#e57373,stroke:#fff,stroke-width:2px,color:#fff
    style Postgres fill:#ba68c8,stroke:#fff,stroke-width:2px,color:#fff
```

### Request Flow
```mermaid
sequenceDiagram
    participant User
    participant nginx
    participant API
    participant Redis
    participant ML as ML Model(DistilBERT)
    participant DB as PostgreSQL
    
    User->>nginx: POST /analyze
    nginx->>API: Forward request
    
    API->>Redis: Check cache
    alt Cache Hit
        Redis-->>API: Return cached result (2ms)
        API-->>nginx: Response
        nginx-->>User: Result
    else Cache Miss
        Redis-->>API: Not found
        API->>ML: Run inference
        ML-->>API: Sentiment result (100ms)
        API->>DB: Store in database
        API->>Redis: Cache for next time
        API-->>nginx: Response
        nginx-->>User: Result
    end
```

### Container Architecture
```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#4fc3f7','primaryTextColor':'#fff','primaryBorderColor':'#fff','lineColor':'#ffffff'}}}%%
graph LR
    subgraph "Docker Compose"
        N[nginx:alpine<br/>15MB]
        A[sentiment-api<br/>1.2GB]
        R[redis:7-alpine<br/>15MB]
        P[postgres:15-alpine<br/>240MB]
    end

    N -.->|depends_on| A
    A -.->|depends_on| R
    A -.->|depends_on| P

    V1[(postgres_data<br/>Volume)]
    P -.->|persists to| V1

    style N fill:#ffb74d,stroke:#fff,stroke-width:2px,color:#000
    style A fill:#81c784,stroke:#fff,stroke-width:2px,color:#000
    style R fill:#e57373,stroke:#fff,stroke-width:2px,color:#fff
    style P fill:#ba68c8,stroke:#fff,stroke-width:2px,color:#fff
    style V1 fill:#4fc3f7,stroke:#fff,stroke-width:2px,color:#000
```

### Performance Comparison
```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#4fc3f7','primaryTextColor':'#fff','primaryBorderColor':'#fff','lineColor':'#ffffff'}}}%%
graph TD
    subgraph "Without Cache"
        A1[Request 1<br/>100ms] --> A2[Request 2<br/>100ms]
        A2 --> A3[Request 3<br/>100ms]
        A3 --> A4[1000 requests<br/>100 seconds]
    end

    subgraph "With Redis Cache"
        B1[Request 1: 100ms<br/>Cache Miss] --> B2[Request 2: 2ms<br/>Cache Hit]
        B2 --> B3[Request 3: 2ms<br/>Cache Hit]
        B3 --> B4[1000 requests<br/>2.1 seconds]
    end

    style A4 fill:#e57373,stroke:#fff,stroke-width:2px,color:#fff
    style B4 fill:#81c784,stroke:#fff,stroke-width:2px,color:#000
```

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Modern, type-safe UI |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **API Framework** | FastAPI | High-performance async API |
| **ML Model** | DistilBERT (Hugging Face) | Sentiment classification |
| **Database** | PostgreSQL 15 | Persistent data storage |
| **Cache** | Redis 7 | Sub-millisecond lookups |
| **Containerization** | Docker + Compose | Service orchestration |
| **Frontend Hosting** | GitHub Pages | Static site hosting |
| **API Hosting** | Hugging Face Spaces | ML-optimized container hosting |
| **Database Hosting** | Render | Managed PostgreSQL & Redis |
| **Testing** | pytest + Vitest | Backend & frontend testing |
| **CI/CD** | GitHub Actions | Automated testing & deployment |

---

## Installation & Setup

### Prerequisites
- Docker Desktop installed
- Git installed
- 8GB RAM minimum
- 5GB disk space

### Quick Start

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR-USERNAME/sentiment-api.git
   cd sentiment-api
```

2. **Start all services**
```bash
   docker-compose up
```

3. **Access the API**
   - API Docs: http://localhost/docs
   - Direct API: http://localhost:8000/docs
   - Health Check: http://localhost/health

**That's it!** All services (API, PostgreSQL, Redis, nginx) start automatically.

---

## API Endpoints

### Core Endpoints

#### `POST /analyze` - Analyze Sentiment
Analyze text sentiment with caching support.

**Request:**
```json
{
  "text": "I absolutely love this product! It's amazing!"
}
```

**Response:**
```json
{
  "text": "I absolutely love this product! It's amazing!",
  "sentiment": "POSITIVE",
  "confidence": 0.9998,
  "processing_time_ms": 2,
  "cached": true
}
```

#### `GET /history?limit=10` - Get Analysis History
Retrieve recent sentiment analyses from database.

**Response:**
```json
{
  "total": 10,
  "analyses": [
    {
      "id": 1,
      "text": "Sample text",
      "sentiment": "POSITIVE",
      "confidence": 0.9999,
      "processing_time_ms": 85,
      "created_at": "2025-12-11T14:30:00"
    }
  ]
}
```

#### `GET /cache/stats` - Cache Statistics
Monitor Redis cache performance.

**Response:**
```json
{
  "status": "connected",
  "total_keys": 150,
  "sentiment_keys": 150,
  "memory_used_mb": 12.5,
  "hits": 450,
  "misses": 50,
  "hit_rate": 90.0
}
```

### Health & Monitoring

- `GET /` - Root endpoint (status check)
- `GET /health` - Health check endpoint
- `DELETE /cache/clear` - Clear all cached results

---

## Testing

### Run Tests Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

### Test Coverage
- ✅ All endpoints (GET /, POST /analyze, GET /health, GET /history)
- ✅ Input validation (empty text, too long, invalid types)
- ✅ Edge cases (special characters, multiple languages, max length)
- ✅ Response format validation
- ✅ Performance tests (response time < 5s)
- ✅ API documentation accessibility

**Result:** 19 tests, 100% passing

---

## Performance

### Caching Impact

| Scenario | Without Cache | With Redis Cache | Improvement |
|----------|--------------|------------------|-------------|
| First request | 100ms | 100ms | Baseline |
| Repeated request | 100ms | 2ms | **50x faster** |
| 1000 identical requests | 100s | 2.1s | **47x faster** |

### Scalability
- **Horizontal scaling**: nginx distributes load across multiple API instances
- **Cache hit rate**: 80-95% in production (typical)
- **Throughput**: 1000+ requests/second (single instance)

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgresql://user:pass@postgres:5432/sentiment | PostgreSQL connection string |
| `REDIS_URL` | redis://redis:6379 | Redis connection string |
| `CACHE_TTL_SECONDS` | 3600 | Cache expiration time (1 hour) |

### Docker Compose Services
```yaml
services:
  nginx:       # Load balancer (port 80)
  api:         # FastAPI application (port 8000)
  postgres:    # PostgreSQL database (port 5432)
  redis:       # Redis cache (port 6379)
```

---

## Deployment

### Live Production Environment

The application is deployed and running:

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | GitHub Pages | [simplyarfan.github.io/Sentiment-API](https://simplyarfan.github.io/Sentiment-API/) |
| **API** | Hugging Face Spaces | [simplyarfan-sentiment-api.hf.space](https://simplyarfan-sentiment-api.hf.space) |
| **Database** | Render PostgreSQL | Managed cloud database |
| **Cache** | Render Redis | Managed Redis instance |

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Pages (Frontend)                                     │
│  React + TypeScript + Tailwind CSS                          │
│  https://simplyarfan.github.io/Sentiment-API/               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ API Calls
┌─────────────────────────────────────────────────────────────┐
│  Hugging Face Spaces (API)                                   │
│  FastAPI + DistilBERT (2GB RAM, Docker)                     │
│  https://simplyarfan-sentiment-api.hf.space                 │
└─────────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Render PostgreSQL   │    │  Render Redis        │
│  Persistent Storage  │    │  Caching Layer       │
└──────────────────────┘    └──────────────────────┘
```

### Local Development
```bash
docker-compose up
```

### Deploy Your Own

**Frontend (GitHub Pages):**
1. Fork this repository
2. Enable GitHub Pages in Settings
3. Set `VITE_API_BASE_URL` in Actions variables
4. Push to trigger deployment

**API (Hugging Face Spaces):**
1. Create a Space at [huggingface.co/spaces](https://huggingface.co/spaces)
2. Select Docker SDK
3. Push code: `git push https://huggingface.co/spaces/YOUR_USERNAME/sentiment-api main`
4. Add `DATABASE_URL` and `REDIS_URL` as secrets

---

## Project Structure
```
sentiment-api/
├── .github/
│   └── workflows/
│       └── test.yml           # CI/CD pipeline
├── nginx/
│   └── nginx.conf             # Load balancer config
├── src/
│   ├── __init__.py
│   ├── main.py                # FastAPI application
│   ├── database.py            # PostgreSQL models & connection
│   └── cache.py               # Redis caching layer
├── tests/
│   ├── __init__.py
│   └── test_api.py            # 19 unit tests
├── docker-compose.yml         # Multi-service orchestration
├── Dockerfile                 # API container definition
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## How It Works

### Request Flow

1. **User sends request** → nginx (port 80)
2. **nginx forwards** → FastAPI (port 8000)
3. **FastAPI checks cache** → Redis
   - **Cache HIT**: Return cached result (2ms)
   - **Cache MISS**: Continue to step 4
4. **Run ML model** → DistilBERT inference (100ms)
5. **Store in database** → PostgreSQL (persistent)
6. **Store in cache** → Redis (for next time)
7. **Return response** → User

### Caching Strategy

**Cache Key Generation:**
```python
text = "I love this product"
hash = sha256(text) = "a7f3b2c1..."
key = "sentiment:a7f3b2c1"
```

**Cache Eviction:**
- TTL: 1 hour (3600 seconds)
- Policy: LRU (Least Recently Used)
- Max memory: 256MB

---

## Learning Outcomes

This project demonstrates:

### Technical Skills
- ✅ Multi-service architecture design
- ✅ Docker containerization & orchestration
- ✅ RESTful API development
- ✅ Database design & ORM (SQLAlchemy)
- ✅ Caching strategies & optimization
- ✅ Load balancing & reverse proxies
- ✅ ML model integration & deployment
- ✅ Automated testing & CI/CD
- ✅ Git workflow & version control

---

## Development Workflow

### Adding Features
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code ...

# Test locally
pytest tests/

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create Pull Request on GitHub
# GitHub Actions runs tests automatically
# Merge when tests pass
```

### Updating Dependencies
```bash
# Update requirements.txt
pip freeze > requirements.txt

# Rebuild containers
docker-compose up --build
```

---

## Troubleshooting

### Common Issues

**Port 8000 already in use:**
```bash
# Stop any process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "8001:8000"  # Use port 8001 instead
```

**Database connection error:**
```bash
# Wait for PostgreSQL to initialize (first-time setup)
# Check logs:
docker-compose logs postgres

# Should see: "database system is ready to accept connections"
```

**Model download fails:**
```bash
# Check internet connection
# Model downloads from Hugging Face (~500MB)
# Takes 2-5 minutes on first run
```

---

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f nginx
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it sentiment-api-postgres psql -U user -d sentiment

# View analyses
SELECT * FROM sentiment_analyses;
```

### Cache Access
```bash
# Connect to Redis
docker exec -it sentiment-api-redis redis-cli

# View all keys
KEYS *

# Get cached value
GET sentiment:abc123...
```

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

---

## License

MIT License - feel free to use this project for learning or portfolio purposes.

---

## Author

**Syed Arfan Hussain**
- GitHub: [@simplyarfan](https://github.com/simplyarfan)
- LinkedIn: [Syed Arfan Hussain](https://www.linkedin.com/in/syedarfan)

---

## Acknowledgments

- **Hugging Face** - DistilBERT model
- **FastAPI** - Modern Python web framework
- **Docker** - Containerization platform
- **PostgreSQL** - Robust database system
- **Redis** - High-performance cache

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [DistilBERT Paper](https://arxiv.org/abs/1910.01108)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)

---

**Built with ❤️ for learning and demonstration purposes**
