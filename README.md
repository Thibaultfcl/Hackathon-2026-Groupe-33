# 🤖 TechCorp AI Chat — Assistant Financier Phi-3.5

Reprise du projet de l'équipe licenciée : valider l'héritage, corriger, **déployer l'assistant financier** Phi-3.5 derrière une interface chat.

## 📂 Structure

```
techcorp-ai-chat/
├── docker-compose.yml      # Orchestration (ollama + gateway)
├── infra/                  # 🏗️ INFRA — serveur d'inférence  ✅ FAIT
│   ├── ollama/             # Modelfile + start.sh / start.ps1   (choix retenu)
│   ├── triton/             # Config Triton dockerisée            (bonus)
│   ├── fastapi_server/     # Passerelle REST + CORS + /health
│   └── DEPLOYMENT.md       # Justification du choix technique
├── models/phi3_financial/  # Adapter LoRA hérité (pointeurs git-LFS)
├── ia/                     # 🤖 IA — validation + finetune médical
├── data/                   # 📊 DATA — datasets + nettoyage
├── web/                    # 🌐 DEV WEB — interface chat
├── security/               # 🔒 CYBER — audit + tests robustesse
├── scripts/                # Scripts hérités (train, chat CLI)
└── docs/                   # CONSIGNES.md, BRIEFING.md
```

## 🚀 Démarrage INFRA (état actuel)

```bash
# Natif
bash infra/ollama/start.sh
# ou Docker
docker compose up -d
```

Serveur : `http://localhost:11434` · Passerelle : `http://localhost:8080`
Détails et justification → [`infra/DEPLOYMENT.md`](infra/DEPLOYMENT.md)

## 📋 Avancement (CONSIGNES.md)

- [x] 🏗️ **INFRA** — Ollama configuré, Modelfile complété, accès LAN, docker-compose, Triton dockerisé (bonus)
- [ ] 🤖 IA — validation 10+ Q/R, finetune LoRA médical
- [ ] 📊 DATA — analyse/nettoyage datasets (⚠️ pointeurs git-LFS à `git lfs pull`)
- [ ] 🌐 DEV WEB — interface chat (connecter `:11434` ou gateway `:8080`)
- [ ] 🔒 CYBER — audit code hérité, prompt injection, rapport

## ⚠️ À savoir

Modèle et datasets hérités = **pointeurs git-LFS non résolus** (~130 o). `git lfs pull` requis pour les vrais poids/données. INFRA fonctionne sans : Ollama pull le base `phi3.5` lui-même.
