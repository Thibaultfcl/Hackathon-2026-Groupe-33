"""
Passerelle API maison (FastAPI) devant Ollama.

But : exposer une API REST propre + CORS pour l'équipe DEV WEB, et un
endpoint /health pour l'indicateur "connecté / déconnecté" de l'interface.

Lance : uvicorn main:app --host 0.0.0.0 --port 8080
Env   : OLLAMA_URL (def http://localhost:11434), MODEL_NAME (def phi3-financial)
"""
import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434").rstrip("/")
MODEL_NAME = os.environ.get("MODEL_NAME", "phi3-financial")

app = FastAPI(title="TechCorp Financial Assistant Gateway", version="1.0.0")

# CORS ouvert : le front DEV WEB tourne sur un autre port/origine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []          # [{role: "user"|"assistant", content: "..."}]
    temperature: float | None = None


@app.get("/health")
async def health():
    """État du serveur d'inférence en aval (pour l'UI connecté/déconnecté)."""
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get(f"{OLLAMA_URL}/api/tags")
            r.raise_for_status()
            models = [m["name"] for m in r.json().get("models", [])]
        return {"status": "connected", "ollama": OLLAMA_URL, "models": models}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"ollama unreachable: {e}")


@app.post("/chat")
async def chat(req: ChatRequest):
    """Chat multi-tours via l'API /api/chat d'Ollama."""
    messages = list(req.history) + [{"role": "user", "content": req.message}]
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
    }
    if req.temperature is not None:
        payload["options"] = {"temperature": req.temperature}
    try:
        async with httpx.AsyncClient(timeout=120) as c:
            r = await c.post(f"{OLLAMA_URL}/api/chat", json=payload)
            r.raise_for_status()
            data = r.json()
        return {"reply": data["message"]["content"], "model": MODEL_NAME}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"inference error: {e}")


@app.get("/")
async def root():
    return {"service": "techcorp-gateway", "model": MODEL_NAME, "docs": "/docs"}
