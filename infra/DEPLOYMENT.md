# 🏗️ INFRA — Déploiement du serveur d'inférence

## Choix technique : **Ollama** (recommandé), Triton en bonus, FastAPI en passerelle

### Décision

| Option              | Verdict          | Raison                                                                                                                                               |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ollama** ✅ | **Retenu** | Clé en main, API REST native sur`:11434`, quantization auto (Q4), CPU **ou** GPU, déploiement en 2 commandes. Idéal pour un hackathon 7h. |
| Triton              | Bonus            | Puissant mais lourd : image NVIDIA ~10 Go, GPU quasi obligatoire, backend Python à câbler. Config fournie, dockerisée dans`infra/triton/`.      |
| Serveur maison      | Passerelle       | FastAPI**devant** Ollama (`infra/fastapi_server/`) : API REST propre + CORS + `/health` pour l'UI. Pas un moteur d'inférence, un proxy.   |

### ⚠️ Note sur le modèle `models/phi3_financial/`

C'est un **adapter LoRA PEFT** (`adapter_config.json` + `adapter_model.safetensors`) pour base `microsoft/Phi-3-mini-4k-instruct`, **pas** un modèle complet ni un GGUF.

- Dans ce dépôt les fichiers sont des **pointeurs git-LFS non résolus** (≈130 octets). Faire `git lfs pull` pour récupérer les vrais poids.
- Ollama charge le base `phi3.5` + le **system prompt** financier (spécialisation par prompt). Fusionner l'adapter LoRA dans Ollama exige une conversion GGUF (`ADAPTER` directive) → hors scope 7h.
- Pour servir l'adapter LoRA tel quel : voir `scripts/simple_chat.py` (transformers + peft, nécessite GPU + `git lfs pull`).

---

## 🚀 Démarrage rapide

### Option A — Ollama natif (le plus simple)

```bash
# 1. Installer : https://ollama.com/download
# 2. Créer + servir le modèle
bash infra/ollama/start.sh          # Linux/macOS/Git-Bash
# ou sous PowerShell :
infra\ollama\start.ps1
```

### Option B — Docker Compose (tout-en-un)

```bash
docker compose up -d                # lance ollama + crée le modèle + gateway
docker compose logs -f ollama-init  # suivre la création du modèle
```

---

## ✅ Vérifications

```bash
# Serveur répond
curl http://localhost:11434/api/tags

# Génération
curl http://localhost:11434/api/generate \
  -d '{"model":"phi35-financial","prompt":"What is EBITDA?","stream":false}'

# Passerelle FastAPI (si lancée)
curl http://localhost:8080/health
```

---

## 🌐 Accès pour l'équipe DEV WEB

- **Ollama direct** : `http://<IP_INFRA>:11434` — endpoints `/api/generate`, `/api/chat`.
- **Passerelle** : `http://<IP_INFRA>:8080` — `POST /chat`, `GET /health` (indicateur connecté/déconnecté).
- Le bind `0.0.0.0` (via `OLLAMA_HOST`) rend le serveur joignable sur le LAN.
- Trouver l'IP : `ipconfig` (Windows) / `ip a` (Linux). Ouvrir le port 11434 (et 8080) dans le pare-feu.

## ⚙️ Paramètres d'inférence (`infra/ollama/Modelfile`)

`temperature 0.3` (finance = factuel, anti-hallucination), `top_p 0.9`, `top_k 40`,
`repeat_penalty 1.1`, `num_predict 512`, `num_ctx 4096`. Quantization Q4 par défaut côté Ollama.