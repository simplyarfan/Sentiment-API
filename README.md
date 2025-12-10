# Sentiment Analysis API

A production-ready REST API for analyzing text sentiment using transformer models, containerized with Docker.

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)

## 🚀 Features

- **Fast sentiment analysis** using DistilBERT transformer model
- **RESTful API** with automatic interactive documentation
- **Docker containerized** for consistent deployment
- **Health check endpoints** for production monitoring
- **Input validation** with Pydantic models
- **Sub-100ms inference** after model warm-up

## 🛠️ Tech Stack

- **Backend:** FastAPI (async Python web framework)
- **ML Model:** DistilBERT via HuggingFace Transformers
- **Containerization:** Docker
- **API Documentation:** Auto-generated with Swagger UI

## 📦 Quick Start

### Prerequisites
- Docker Desktop installed
- 4GB RAM minimum

### Run with Docker
```bash
# Build image
docker build -t sentiment-api:v1.0 .

# Run container
docker run -d -p 8000:8000 --name sentiment-api sentiment-api:v1.0

# View logs
docker logs sentiment-api
```

### Access API

- **Interactive Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## 🔌 API Usage

### Example Request
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'
```

### Example Response
```json
{
  "text": "I love this product!",
  "sentiment": "POSITIVE",
  "confidence": 0.9998,
  "processing_time_ms": 45
}
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check with version info |
| POST | `/analyze` | Analyze text sentiment |
| GET | `/health` | Kubernetes-style health endpoint |

## 🏗️ Project Structure
```
sentiment-api/
├── src/
│   └── main.py          # FastAPI application
├── tests/               # Unit tests
├── Dockerfile           # Container definition
├── .dockerignore       # Docker build exclusions
├── requirements.txt     # Python dependencies
└── README.md
```

## 🧪 Development

### Local Setup (without Docker)
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn src.main:app --reload
```

### Run Tests
```bash
pytest tests/ -v
```

## 🐳 Docker Details

- **Base Image:** `python:3.11-slim`
- **Image Size:** ~1.2GB (includes PyTorch + transformers)
- **Health Check:** Configured for production monitoring
- **Multi-stage optimized** for faster rebuilds

## 📈 Performance

- **First request:** 30-60s (model download)
- **Subsequent requests:** < 100ms
- **Memory usage:** ~500MB (model in RAM)
- **Concurrent requests:** 10-20 (CPU-bound)

## 🔮 Future Enhancements

- [ ] GPU support for faster inference
- [ ] Model caching layer (Redis)
- [ ] Rate limiting
- [ ] Authentication
- [ ] Batch inference endpoint
- [ ] Multiple model support
- [ ] Kubernetes deployment configs

## 📝 License

MIT License - feel free to use for your projects!

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [HuggingFace](https://huggingface.co/) for the DistilBERT model
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent framework