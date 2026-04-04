FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2 and shapely
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev libgeos-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train ML model if training data exists
RUN if [ -f /app/../ml-model/train.py ]; then echo "ML model will be trained at runtime"; fi

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "src"]
