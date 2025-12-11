"""
Unit tests for sentiment analysis API

These tests verify:
- All endpoints work correctly
- Sentiment analysis returns expected results
- Input validation catches errors
- Error handling works properly
"""

import pytest


# ============================================
# Health Check Tests
# ============================================

def test_root_endpoint(client):
    """Test the root endpoint returns health status"""
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "sentiment-api"
    assert "version" in data


def test_health_endpoint(client):
    """Test the /health endpoint for Kubernetes"""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ============================================
# Sentiment Analysis Tests
# ============================================

def test_analyze_positive_sentiment(client):
    """Test sentiment analysis with clearly positive text"""
    response = client.post(
        "/analyze",
        json={"text": "I absolutely love this product! It's amazing and wonderful!"}
    )

    assert response.status_code == 200
    data = response.json()

    # Verify response structure
    assert "text" in data
    assert "sentiment" in data
    assert "confidence" in data
    assert "processing_time_ms" in data

    # Verify sentiment detection
    assert data["sentiment"] == "POSITIVE"
    assert data["confidence"] > 0.9  # Should be very confident
    assert data["processing_time_ms"] >= 0  # Should take some time


def test_analyze_negative_sentiment(client):
    """Test sentiment analysis with clearly negative text"""
    response = client.post(
        "/analyze",
        json={"text": "This is terrible, horrible, and awful. I hate it."}
    )

    assert response.status_code == 200
    data = response.json()

    assert data["sentiment"] == "NEGATIVE"
    assert data["confidence"] > 0.9


def test_analyze_neutral_text(client):
    """Test sentiment analysis with neutral text"""
    response = client.post(
        "/analyze",
        json={"text": "The item is blue."}
    )

    assert response.status_code == 200
    data = response.json()

    # Neutral text might be classified as either POSITIVE or NEGATIVE
    # with lower confidence
    assert data["sentiment"] in ["POSITIVE", "NEGATIVE"]
    assert "confidence" in data


# ============================================
# Input Validation Tests
# ============================================

def test_empty_text_rejected(client):
    """Test that empty text is rejected"""
    response = client.post(
        "/analyze",
        json={"text": ""}
    )

    assert response.status_code == 422  # Validation error
    # FastAPI returns detailed validation errors


def test_missing_text_field(client):
    """Test that missing text field is rejected"""
    response = client.post(
        "/analyze",
        json={}
    )

    assert response.status_code == 422


def test_text_too_long(client):
    """Test that text exceeding max length is rejected"""
    long_text = "a" * 513  # Max is 512 characters

    response = client.post(
        "/analyze",
        json={"text": long_text}
    )

    assert response.status_code == 422


def test_non_string_text(client):
    """Test that non-string text is rejected"""
    response = client.post(
        "/analyze",
        json={"text": 12345}  # Number instead of string
    )

    assert response.status_code == 422


# ============================================
# Response Format Tests
# ============================================

def test_response_contains_all_fields(client):
    """Test that response has all required fields"""
    response = client.post(
        "/analyze",
        json={"text": "Great product!"}
    )

    assert response.status_code == 200
    data = response.json()

    # Check all required fields exist
    required_fields = ["text", "sentiment", "confidence", "processing_time_ms"]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"


def test_confidence_is_valid_probability(client):
    """Test that confidence is between 0 and 1"""
    response = client.post(
        "/analyze",
        json={"text": "Excellent!"}
    )

    assert response.status_code == 200
    data = response.json()
    confidence = data["confidence"]

    assert 0 <= confidence <= 1, "Confidence must be between 0 and 1"


def test_sentiment_is_valid_label(client):
    """Test that sentiment is either POSITIVE or NEGATIVE"""
    response = client.post(
        "/analyze",
        json={"text": "Test text"}
    )

    assert response.status_code == 200
    data = response.json()
    sentiment = data["sentiment"]

    assert sentiment in ["POSITIVE", "NEGATIVE"], "Invalid sentiment label"


# ============================================
# Edge Case Tests
# ============================================

def test_special_characters(client):
    """Test handling of special characters"""
    response = client.post(
        "/analyze",
        json={"text": "Wow!!! This is #amazing @company"}
    )

    assert response.status_code == 200
    # Should handle special chars gracefully


def test_multiple_languages_english_only(client):
    """Test that non-English text still gets processed"""
    # Note: DistilBERT is trained on English
    # This test just verifies it doesn't crash
    response = client.post(
        "/analyze",
        json={"text": "Hola mundo"}
    )

    assert response.status_code == 200
    # May not be accurate, but shouldn't crash


def test_very_short_text(client):
    """Test analysis of very short text"""
    response = client.post(
        "/analyze",
        json={"text": "Good"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["sentiment"] == "POSITIVE"


def test_maximum_length_text(client):
    """Test analysis of text at maximum allowed length"""
    max_text = "a" * 512  # Exactly at max

    response = client.post(
        "/analyze",
        json={"text": max_text}
    )

    assert response.status_code == 200


# ============================================
# Performance Tests
# ============================================

def test_response_time_reasonable(client):
    """Test that response time is reasonable (< 30 seconds for CI)"""
    import time

    start = time.time()
    response = client.post(
        "/analyze",
        json={"text": "Test performance"}
    )
    elapsed = time.time() - start

    assert response.status_code == 200
    assert elapsed < 30.0, f"Response took {elapsed}s, should be < 30s"


# ============================================
# API Documentation Tests
# ============================================

def test_openapi_docs_available(client):
    """Test that API documentation is available"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_openapi_json_available(client):
    """Test that OpenAPI JSON schema is available"""
    response = client.get("/openapi.json")
    assert response.status_code == 200

    schema = response.json()
    assert "openapi" in schema
    assert "info" in schema
    assert "paths" in schema