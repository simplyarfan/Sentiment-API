# Base image with Python pre-installed
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Document the port (informational)
EXPOSE 8000

# Health check for production monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:8000/health || exit 1

# Command to run when container starts
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]