"""
Test configuration and fixtures

Sets up test database (SQLite in-memory) and mocks Redis cache
so tests can run independently without external services.
"""

import pytest
import sys
from unittest.mock import MagicMock, patch

# Mock Redis BEFORE importing any app modules
mock_redis = MagicMock()
mock_redis.get.return_value = None
mock_redis.setex.return_value = True
mock_redis.keys.return_value = []
mock_redis.delete.return_value = True
mock_redis.dbsize.return_value = 0
mock_redis.info.return_value = {"used_memory": 0, "keyspace_hits": 0, "keyspace_misses": 0}

# Patch redis.from_url before cache module is imported
with patch('redis.from_url', return_value=mock_redis):
    # Now import the app modules
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    from src.database import Base, get_db
    from src.main import app

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Create tables
Base.metadata.create_all(bind=test_engine)


def override_get_db():
    """Provide test database session"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def client():
    """Create test client with mocked dependencies"""
    from fastapi.testclient import TestClient
    with TestClient(app) as c:
        yield c
