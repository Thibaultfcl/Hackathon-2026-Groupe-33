# TechCorp Financial Assistant — Frontend

Interface chat web pour Phi-3.5-Financial. Next.js (App Router) + Tailwind CSS, sans dépendance UI lourde (pas de shadcn installé : composants Tailwind faits main, dans le même esprit visuel).

## Lancer le projet

```bash
cd web/frontend
npm install
npm run dev
```

Ouvrir http://localhost:3000

Sans configuration supplémentaire, l'app tourne **en mode mock** : les réponses sont du Lorem Ipsum streamé mot par mot (Mission 1), avec génération occasionnelle de tableaux/blocs de code selon les mots-clés de la question, pour prévisualiser le rendu Markdown.

## Brancher l'API réelle (Mission 2)

Copier `.env.example` en `.env.local` et renseigner les infos fournies par l'équipe INFRA :

```bash
LLM_API_URL=http://localhost:11434/api/chat
LLM_MODEL=phi3-financial
```

Redémarrer `npm run dev`. La route `/api/chat` proxy alors les requêtes vers ce endpoint au format Ollama (`{model, messages, stream: true}`), parse le flux ndjson, et relaie le texte au client en streaming. Plus besoin de modifier le frontend.

Si le format réel diffère (payload, format de streaming), adapter uniquement `app/api/chat/route.js` — le frontend ne dépend que d'un flux texte brut, agnostique du backend.

## Gestion des erreurs déjà en place

- Timeout : abandon de la requête après 30s → message "trop de temps à répondre".
- Modèle indisponible (HTTP 503) ou erreur 500 : message explicite affiché dans le chat.
- Flux vide : message "aucune réponse" plutôt qu'une bulle vide.

## Fonctionnalités

- Header avec logo "TechCorp Financial Assistant".
- Sidebar : nouvelle conversation, historique (persisté en localStorage), réglages temperature / max_tokens.
- Bulles user/assistant avec scroll automatique.
- Indicateur "en train d'écrire" pendant la génération.
- Rendu Markdown des réponses (tableaux, blocs de code).
- Export de la conversation active en `.md` ou `.txt`.
- Mode sombre (persisté).
- Responsive : sidebar en drawer sur mobile (bouton hamburger dans le header).

## Structure

```
app/
  layout.jsx          # layout racine
  page.jsx             # orchestration (état, streaming, persistance)
  globals.css          # tokens de design + styles globaux
  api/chat/route.js    # endpoint mock (Mission 1) / proxy réel (Mission 2)
components/
  Header.jsx
  Sidebar.jsx
  ChatWindow.jsx
  MessageBubble.jsx
  TypingIndicator.jsx
  ChatInput.jsx
lib/
  mockStream.js         # génération du Lorem Ipsum en streaming
  storage.js             # localStorage : conversations, thème, export
```

## Notes design

Identité visuelle "registre financier" : navy (#0B1F3A) / papier (#F7F5F0) / accent or (#C9A227) / vert émeraude pour les actions. Un fin liseré animé façon ticker boursier sous le header est la signature visuelle de la page (désactivé si `prefers-reduced-motion`).
