"""
Database connection and models for sentiment API

Uses SQLAlchemy ORM for clean database interactions
PostgreSQL for persistent storage (runs in Docker container - FREE!)
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Get database URL from environment variable
# Set by docker-compose.yml
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:pass@localhost:5432/sentiment"  # Fallback for local dev
)

# Create database engine
# This connects to PostgreSQL container
engine = create_engine(DATABASE_URL)

# Create session factory
# Sessions are like "conversations" with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for database models
Base = declarative_base()


# Database Model (Table Definition)
class SentimentAnalysis(Base):
    """
    Stores sentiment analysis results
    
    Table: sentiment_analyses
    """
    __tablename__ = "sentiment_analyses"
    
    # Primary key (auto-incrementing ID)
    id = Column(Integer, primary_key=True, index=True)
    
    # The text that was analyzed
    text = Column(String(512), nullable=False)
    
    # Sentiment result (POSITIVE or NEGATIVE)
    sentiment = Column(String(50), nullable=False)
    
    # Confidence score (0.0 to 1.0)
    confidence = Column(Float, nullable=False)
    
    # Processing time in milliseconds
    processing_time_ms = Column(Integer, nullable=False)
    
    # When this analysis was created
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# Create all tables in the database
# This runs when the app starts
def init_db():
    """
    Initialize database tables
    
    Creates sentiment_analyses table if it doesn't exist
    Safe to call multiple times (won't recreate existing tables)
    """
    Base.metadata.create_all(bind=engine)


# Dependency for FastAPI routes
# Provides a database session to each request
def get_db():
    """
    FastAPI dependency that provides a database session
    
    Usage in routes:
        @app.post("/analyze")
        def analyze(db: Session = Depends(get_db)):
            # Use db here
            pass
    
    Automatically closes session after request
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()