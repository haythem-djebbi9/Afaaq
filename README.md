# AFAAQ CONNECT

Portail de candidature pour Tunisiens vers l'Allemagne, l'Autriche, l'Italie et la France (visa,
formation, travail, reconnaissance de diplômes).

**Stack** : React + TypeScript (Vite) · NestJS · PostgreSQL (Prisma) · Groq (traduction et chatbot).

## Structure du dépôt

```
.
├── backend/     API NestJS — un module par domaine métier
│   └── src/
│       ├── auth/            inscription, connexion, JWT, guards de rôles
│       ├── applications/    dossiers candidats + documents
│       ├── form-config/     configuration dynamique du formulaire (9 étapes)
│       ├── review/          revue admin + suivi côté candidat
│       ├── translation/     traduction FR/AR → DE via Groq (avec cache)
│       ├── notifications/   notifications utilisateur
│       ├── chatbot/         assistant conversationnel (Groq, streaming)
│       └── prisma/          client Prisma partagé
├── frontend/    App React — un dossier par feature (pas par type de fichier)
│   └── src/
│       ├── features/
│       │   ├── auth/            connexion, inscription, contexte d'authentification
│       │   ├── applications/    formulaire de candidature en 9 étapes, upload de documents
│       │   ├── admin/           espace admin (liste, détail, revue des dossiers)
│       │   ├── notifications/   cloche de notifications
│       │   ├── marketing/       page d'accueil, page services
│       │   └── chatbot/         widget de chat flottant
│       └── shared/          composants UI, client API, i18n/RTL, hooks, types communs
├── docker-compose.yml
└── .env.example  source unique des variables d'environnement (front + back + docker)
```

## Démarrage en local (développement)

### Avec Docker (recommandé)

```bash
cp .env.example .env
# éditer .env : au minimum GROQ_API_KEY et les mots de passe

docker compose up --build
```

- Frontend : http://localhost:8080
- Backend : http://localhost:3000/api (healthcheck : http://localhost:3000/health)
- Les migrations Prisma sont appliquées automatiquement au démarrage du conteneur backend.
- Les documents téléversés et les données PostgreSQL sont conservés dans des volumes Docker
  nommés (`postgres_data`, `backend_uploads`).

### Sans Docker

```bash
# Terminal 1 — backend
cd backend
cp ../.env.example .env   # puis adapter DATABASE_URL à un Postgres local (127.0.0.1)
npm install
npx prisma migrate deploy
npm run start:dev

# Terminal 2 — frontend
cd frontend
cp ../.env.example .env   # puis mettre VITE_API_URL=http://localhost:3000/api
npm install
npm run dev
```

## Déploiement en production

```bash
cp .env.example .env
# renseigner des secrets forts : JWT_SECRET, POSTGRES_PASSWORD, GROQ_API_KEY
# ajuster CORS_ORIGIN et VITE_API_URL pour le domaine réel si le front n'est pas
# servi derrière le proxy nginx du conteneur frontend

docker compose up --build -d
```

- Le backend n'utilise jamais `synchronize` : les migrations Prisma versionnées
  (`backend/prisma/migrations`) sont rejouées via `prisma migrate deploy` à chaque démarrage.
- Sécurité API : `helmet`, CORS restreint par `CORS_ORIGIN`, rate limiting (`@nestjs/throttler`,
  120 req/min/IP par défaut).
- Logs : niveau configurable via `LOG_LEVEL` (`error` | `warn` | `log` | `debug` | `verbose`).
- Healthcheck : `GET /health` (hors préfixe `/api`, vérifie la connexion à PostgreSQL) — utilisé
  par le `HEALTHCHECK` du conteneur backend.

## Variables d'environnement

Toutes les variables (frontend + backend + PostgreSQL + docker-compose) sont documentées dans
[`.env.example`](.env.example), qui fait office de source unique. Ne jamais committer de fichier
`.env` — les secrets (`JWT_SECRET`, `POSTGRES_PASSWORD`, `GROQ_API_KEY`) doivent rester locaux ou
gérés par votre plateforme de déploiement.

## Chatbot

Le module `backend/src/chatbot` appelle l'API Groq (`llama-3.3-70b-versatile`) avec un prompt
système décrivant AFAAQ CONNECT (4 services, 4 pays, documents et étapes du processus) et
injectant le statut réel de la candidature en cours de l'utilisateur connecté (étape, documents
manquants, statut de revue), afin de répondre précisément à « où en est mon dossier ? ». La
réponse est streamée au fil de l'eau et l'historique est conservé par utilisateur
(table `chatbot_messages`). Le widget (`frontend/src/features/chatbot/ChatWidget.tsx`) est une
bulle flottante visible sur toutes les pages d'un utilisateur connecté, absente de l'espace admin.

## Charte graphique & RTL

Bleu `#0D47A1`, doré `#FFC107`, polices Montserrat/Poppins (Cairo en arabe) — définis une fois
dans `frontend/tailwind.config.js`. Le sens de lecture (`dir="ltr"|"rtl"`) est appliqué globalement
par `LocaleProvider` (`frontend/src/shared/i18n/LocaleContext.tsx`), et tous les composants
utilisent des classes Tailwind logiques (`ms-`, `me-`, `start-`, `end-`) plutôt que `ml-`/`mr-`,
ce qui garantit le support RTL sur l'ensemble des pages, pas seulement le formulaire.
