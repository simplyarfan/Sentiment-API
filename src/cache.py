"""
Redis cache layer for sentiment analysis API

Caches ML inference results to avoid redundant model calls
Uses Redis for sub-millisecond lookup times
"""

import redis
import hashlib
import json
import os
from typing import Optional, Dict, Any

# Get Redis URL from environment variable
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Create Redis client
# decode_responses=True converts bytes to strings automatically
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

# Cache TTL (Time To Live) - how long to keep cached results
CACHE_TTL_SECONDS = 3600  # 1 hour


def generate_cache_key(text: str) -> str:
    """
    Generate a unique cache key for the input text
    
    Uses SHA-256 hash to create consistent keys
    Same text always generates same key
    
    Args:
        text: Input text to analyze
        
    Returns:
        Cache key string (e.g., "sentiment:abc123...")
    """
    # Create hash of the text (consistent for same input)
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    return f"sentiment:{text_hash}"


def get_cached_result(text: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve cached sentiment analysis result
    
    Args:
        text: Input text to look up
        
    Returns:
        Cached result dict if found, None if cache miss
    """
    try:
        cache_key = generate_cache_key(text)
        cached_data = redis_client.get(cache_key)
        
        if cached_data:
            # Parse JSON string back to dict
            return json.loads(cached_data)
        
        return None
    except Exception as e:
        # If Redis fails, log but don't crash
        print(f"Cache retrieval error: {e}")
        return None


def cache_result(text: str, result: Dict[str, Any]) -> bool:
    """
    Store sentiment analysis result in cache
    
    Args:
        text: Input text that was analyzed
        result: Analysis result to cache
        
    Returns:
        True if cached successfully, False otherwise
    """
    try:
        cache_key = generate_cache_key(text)
        
        # Convert dict to JSON string
        result_json = json.dumps(result)
        
        # Store in Redis with TTL
        redis_client.setex(
            cache_key,
            CACHE_TTL_SECONDS,
            result_json
        )
        
        return True
    except Exception as e:
        print(f"Cache storage error: {e}")
        return False


def get_cache_stats() -> Dict[str, Any]:
    """
    Get Redis cache statistics
    
    Returns:
        Dict with cache info (memory usage, keys, hits, etc.)
    """
    try:
        info = redis_client.info("stats")
        memory = redis_client.info("memory")
        
        # Count sentiment-related keys
        sentiment_keys = len(redis_client.keys("sentiment:*"))
        
        return {
            "status": "connected",
            "total_keys": redis_client.dbsize(),
            "sentiment_keys": sentiment_keys,
            "memory_used_mb": round(memory["used_memory"] / 1024 / 1024, 2),
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "hit_rate": round(
                info.get("keyspace_hits", 0) / 
                max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1) * 100,
                2
            )
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


def clear_cache() -> bool:
    """
    Clear all sentiment cache entries
    
    WARNING: This removes all cached results
    
    Returns:
        True if cleared successfully
    """
    try:
        # Get all sentiment keys
        keys = redis_client.keys("sentiment:*")
        
        if keys:
            redis_client.delete(*keys)
        
        return True
    except Exception as e:
        print(f"Cache clear error: {e}")
        return False