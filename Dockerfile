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

# HF Spaces requires port 7860
EXPOSE 7860

# Health check for production monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD curl -f http://localhost:7860/health || exit 1

# Command to run when container starts (HF Spaces uses port 7860)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]