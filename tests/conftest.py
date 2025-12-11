"""
Test configuration and fixtures

Sets up test environment BEFORE importing app modules.
Uses SQLite in-memory database and mocks Redis.
"""

import os
import sys

# Set environment variables BEFORE importing any app modules
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["REDIS_URL"] = "redis://localhost:6379"  # Will be mocked

# Now mock Redis before importing cache module
from unittest.mock import MagicMock, patch

mock_redis_client = MagicMock()
mock_redis_client.get.return_value = None
mock_redis_client.setex.return_value = True
mock_redis_client.keys.return_value = []
mock_redis_client.delete.return_value = True
mock_redis_client.dbsize.return_value = 0
mock_redis_client.info.return_value = {"used_memory": 0, "keyspace_hits": 0, "keyspace_misses": 0}

# Patch redis before any app imports
redis_patcher = patch('redis.from_url', return_value=mock_redis_client)
redis_patcher.start()

import pytest
from fastapi.testclient import TestClient

# Now we can safely import app modules
from src.database import Base, engine
from src.main import app

# Create tables in test database
Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    """Create test client"""
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def cleanup_db():
    """Clean up database after each test"""
    yield
    # Could add cleanup logic here if needed
