#!/usr/bin/env bash
# Démarre le serveur d'inférence Ollama pour Phi-3.5-Financial.
# Rend le serveur accessible aux DEV WEB du groupe (bind 0.0.0.0:11434).
set -euo pipefail

MODEL_NAME="${MODEL_NAME:-phi3-financial}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 0.0.0.0 = accessible depuis le LAN (DEV WEB), pas seulement localhost.
export OLLAMA_HOST="${OLLAMA_HOST:-0.0.0.0:11434}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "❌ ollama introuvable. Installer : https://ollama.com/download" >&2
  exit 1
fi

# 1. Démarre le démon en arrière-plan s'il ne tourne pas déjà.
if ! curl -sf "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
  echo "▶️  Démarrage du démon ollama (OLLAMA_HOST=$OLLAMA_HOST)..."
  ollama serve >/tmp/ollama.log 2>&1 &
  # Attend que l'API réponde.
  for i in $(seq 1 30); do
    curl -sf "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1 && break
    sleep 1
  done
fi

# 2. Récupère le modèle de base puis crée le modèle personnalisé.
echo "⬇️  Pull du modèle de base (phi3.5)..."
ollama pull phi3.5

echo "🔧 Création du modèle '$MODEL_NAME' depuis le Modelfile..."
ollama create "$MODEL_NAME" -f "$SCRIPT_DIR/Modelfile"

# 3. Vérifie que le serveur répond.
echo "✅ Modèles disponibles :"
ollama list

echo ""
echo "🌐 Serveur prêt : http://localhost:11434  (LAN : http://<IP_INFRA>:11434)"
echo "   Test : curl http://localhost:11434/api/generate -d '{\"model\":\"$MODEL_NAME\",\"prompt\":\"What is EBITDA?\",\"stream\":false}'"
