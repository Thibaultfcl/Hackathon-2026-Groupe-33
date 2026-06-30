FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .

# Dans docker-compose, Ollama est joignable via le nom de service "ollama".
ENV OLLAMA_URL=http://ollama:11434
ENV MODEL_NAME=phi3-financial

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
