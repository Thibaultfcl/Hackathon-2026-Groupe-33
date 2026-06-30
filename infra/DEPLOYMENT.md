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

- 🔴 **Décision sécurité (reco CYBER) : on NE charge PAS `models/phi3_financial/`.** Adapter hérité de l'équipe licenciée, suspecté de compromission/poisoning. La stack tire une base **phi3.5 propre** depuis le registre Ollama officiel (`ollama pull phi3.5`). Aucune directive `ADAPTER` dans le Modelfile.
- ⛔ De toute façon irrécupérable : objets git-LFS = `404 Object does not exist on the server`, aucun `.safetensors` réel en local. Les deux raisons (sécu + absence) vont dans le même sens : adapter écarté.
- Spécialisation finance assurée par le **system prompt** sur base saine (modèle Ollama `phi3-financial`).
- Réintégrer l'adapter plus tard exigerait : poids refournis **+ audit/scan sécurité validé** par CYBER, puis merge PEFT → GGUF (`convert_hf_to_gguf.py` llama.cpp) → `FROM ./merged.gguf`. À ne PAS faire sans feu vert sécu.

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

### Option B — Docker Compose (tout-en-un) ✅ recommandé

Lance **toute la stack d'un coup** : Ollama → création du modèle `phi3-financial` → interface web + passerelle.

```bash
docker compose up -d --build        # ollama + ollama-init + web + gateway
docker compose logs -f ollama-init  # suivre la création du modèle
```

| Service | URL | Rôle |
|---------|-----|------|
| `ollama` | http://localhost:11434 | Moteur d'inférence |
| `web` | http://localhost:3000 | Interface chat (attend que le modèle soit prêt) |
| `gateway` | http://localhost:8080 | API REST + `/health` (optionnel) |

Le service `web` démarre seulement après `ollama-init` (`service_completed_successfully`) → pas de chat sur un modèle inexistant.

---

## ✅ Vérifications

```bash
# Serveur répond
curl http://localhost:11434/api/tags

# Génération (Git-Bash / Linux : single-quotes OK)
curl http://localhost:11434/api/generate \
  -d '{"model":"phi3-financial","prompt":"What is EBITDA?","stream":false}'

# Passerelle FastAPI (si lancée)
curl http://localhost:8080/health
```

> ⚠️ **Windows `cmd.exe`** ne gère pas les single-quotes → `invalid character '\''`.
> Échapper avec des double-quotes :
> ```cmd
> curl http://localhost:11434/api/generate -d "{\"model\":\"phi3-financial\",\"prompt\":\"What is EBITDA?\",\"stream\":false}"
> ```
> **PowerShell** : `Invoke-RestMethod http://localhost:11434/api/generate -Method Post -Body '{"model":"phi3-financial","prompt":"What is EBITDA?","stream":false}'`

---

## 🌐 Accès pour l'équipe DEV WEB

- **Interface web** : `http://<IP_INFRA>:3000` (incluse dans la stack compose).
- **Ollama direct** : `http://<IP_INFRA>:11434` — endpoints `/api/generate`, `/api/chat`. Modèle = `phi3-financial`.
- **Passerelle** : `http://<IP_INFRA>:8080` — `POST /chat`, `GET /health` (indicateur connecté/déconnecté).
- Le bind `0.0.0.0` (via `OLLAMA_HOST`) rend le serveur joignable sur le LAN.
- Trouver l'IP : `ipconfig` (Windows) / `ip a` (Linux). Ouvrir le port 11434 (et 8080) dans le pare-feu.

## ⚙️ Paramètres d'inférence (`infra/ollama/Modelfile`)

`temperature 0.3` (finance = factuel, anti-hallucination), `top_p 0.9`, `top_k 40`,
`repeat_penalty 1.1`, `num_predict 512`, `num_ctx 4096`. Quantization Q4 par défaut côté Ollama.