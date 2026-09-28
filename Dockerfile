FROM python:3.11-slim

# Create user to run the app (Hugging Face requires this)
RUN useradd -m -u 1000 user
USER user

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONOPTIMIZE=1 \
    FASTEMBED_CACHE_PATH=/home/user/.cache/fastembed

WORKDIR $HOME/app

# Copy the backend requirements first for caching
COPY --chown=user backend/requirements.txt $HOME/app/backend/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r $HOME/app/backend/requirements.txt

# Copy the entire backend directory
COPY --chown=user backend $HOME/app/backend

# Set the working directory to the backend so imports work correctly
WORKDIR $HOME/app/backend

# Run the FastAPI server on port 7860 (Hugging Face Space default port)
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
