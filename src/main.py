from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline
import time

app = FastAPI(
    title="Sentiment Analysis API",
    description="Analyze text sentiment using transformers",
    version="1.0.0"
)

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

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "sentiment-api",
        "version": "1.0.0"
    }

@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment(request: TextRequest):
    """
    Analyze sentiment of input text.
    Returns sentiment (POSITIVE/NEGATIVE) with confidence score.
    """
    start_time = time.time()
    
    try:
        # Run inference
        result = sentiment_analyzer(request.text)[0]
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return SentimentResponse(
            text=request.text,
            sentiment=result['label'],
            confidence=round(result['score'], 4),
            processing_time_ms=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    """Kubernetes-style health check"""
    return {"status": "ok"}