FROM python:3.11-slim

WORKDIR /app

# Dépendances système légères
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code source
COPY proxy.py .

# Railway injecte la variable PORT automatiquement
ENV PORT=8000

EXPOSE 8000

# Gunicorn pour la production (timeout 120s car les Spaces HF peuvent être lents)
CMD gunicorn proxy:app \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --timeout 120 \
    --log-level info
