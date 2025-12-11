from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import init_db, get_db, SentimentAnalysis
import time
from . import cache

app = FastAPI(
    title="Sentiment Analysis API",
    description="Analyze text sentiment using transformers",
    version="1.0.0"
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    """Create database tables if they don't exist"""
    print("Initializing database...")
    init_db()
    print("Database ready!")

# Load model once at startup
print("Loading sentiment analysis model...")
sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)
print("Model loaded!")

class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=512,
                     example="I love this product!")

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float
    processing_time_ms: int
    cached: bool = False

class HistoryItem(BaseModel):
    id: int
    text: str
    sentiment: str
    confidence: float
    processing_time_ms: int
    created_at: str

class HistoryResponse(BaseModel):
    total: int
    analyses: list[HistoryItem]

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "sentiment-api",
        "version": "1.0.0"
    }

@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment(
    request: TextRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze sentiment of input text with caching.
    
    Returns sentiment (POSITIVE/NEGATIVE) with confidence score.
    Stores result in PostgreSQL database and Redis cache.
    """
    start_time = time.time()
    
    try:
        cached_result = cache.get_cached_result(request.text)
        
        if cached_result:
            # Cache HIT - return cached result
            print(f"Cache HIT for: {request.text[:50]}")
            
            # Add cache indicator
            cached_result["cached"] = True
            cached_result["processing_time_ms"] = int((time.time() - start_time) * 1000)
            
            return SentimentResponse(**cached_result)
        
        # Cache MISS - run ML model
        print(f"Cache MISS for: {request.text[:50]}")
        
        result = sentiment_analyzer(request.text)[0]
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Create response
        response_data = {
            "text": request.text,
            "sentiment": result['label'],
            "confidence": round(result['score'], 4),
            "processing_time_ms": processing_time,
            "cached": False  # NEW: indicate this wasn't cached
        }
        
        # Store in database
        db_analysis = SentimentAnalysis(
            text=request.text,
            sentiment=result['label'],
            confidence=round(result['score'], 4),
            processing_time_ms=processing_time
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        # ===== NEW: Store in cache =====
        cache.cache_result(request.text, response_data)
        # ===============================
        
        return SentimentResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    """Kubernetes-style health check"""
    return {"status": "ok"}

@app.get("/history", response_model=HistoryResponse)
def get_history(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get sentiment analysis history from database

    Returns recent analyses ordered by creation date (newest first)
    """
    try:
        # Get total count
        total = db.query(SentimentAnalysis).count()

        # Get recent analyses
        analyses = db.query(SentimentAnalysis)\
            .order_by(SentimentAnalysis.created_at.desc())\
            .limit(limit)\
            .all()

        # Convert to response format
        history_items = [
            HistoryItem(
                id=a.id,
                text=a.text,
                sentiment=a.sentiment,
                confidence=a.confidence,
                processing_time_ms=a.processing_time_ms,
                created_at=a.created_at.isoformat()
            )
            for a in analyses
        ]

        return HistoryResponse(total=total, analyses=history_items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cache/stats")
def get_cache_statistics():
    """
    Get Redis cache statistics
    
    Shows cache hit rate, memory usage, and key counts
    """
    return cache.get_cache_stats()


@app.delete("/cache/clear")
def clear_cache_endpoint():
    """
    Clear all cached sentiment results
    
    Use this to force fresh analysis for all requests
    """
    success = cache.clear_cache()
    
    if success:
        return {"message": "Cache cleared successfully"}
    else:
        return {"message": "Failed to clear cache"}