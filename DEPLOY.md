# Déploiement production — AFAAQ CONNECT

Stack : **Neon** (PostgreSQL) → **Render** (backend NestJS, Docker) → **Vercel** (frontend React/Vite) → **Strato** (DNS pour `afaaq.de`).

Suivre cet ordre — chaque étape a besoin d'une info produite par la précédente.

---

## 1. Neon (déjà fait)

La base est déjà créée sur le plan gratuit. Il ne reste rien à faire côté Neon lui-même — juste récupérer la connection string :

1. Dashboard Neon → le projet → **Connection Details**.
2. Copier la **connection string "pooled"** (format `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`). C'est cette valeur qui ira dans `DATABASE_URL` sur Render.

Rien à configurer côté SSL ou pooling manuellement — [prisma.service.ts](backend/src/prisma/prisma.service.ts) détecte automatiquement qu'il ne s'agit pas d'une base locale et active `ssl: { rejectUnauthorized: false }` + un pool avec un timeout de connexion de 15s et 5 tentatives de reconnexion, pour absorber le cold start "scale to zero" de Neon.

---

## 2. Render (backend)

1. Dashboard Render → **New → Blueprint** → sélectionner ce repo GitHub. Render lit [render.yaml](render.yaml) automatiquement et propose de créer le service `afaaq-backend`.
2. Avant de valider, remplir les variables marquées `sync: false` (Render les demande à la création du Blueprint) :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | La connection string Neon copiée à l'étape 1 |
   | `GROQ_API_KEY` | Clé depuis [console.groq.com/keys](https://console.groq.com/keys) |
   | `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_...` en prod) |
   | `STRIPE_WEBHOOK_SECRET` | Voir étape 5 ci-dessous — provisoire pour l'instant |
   | `FRONTEND_URL` | Provisoire : mettre l'URL Render par défaut, ex. `https://afaaq-backend.onrender.com` — **à corriger après l'étape 3** |
   | `APP_URL` | Même valeur provisoire que `FRONTEND_URL` — **à corriger après l'étape 3** |

   `JWT_SECRET` est généré automatiquement par le Blueprint (`generateValue: true`) — rien à saisir.

3. Déployer. Render build l'image Docker (backend/Dockerfile) puis démarre le conteneur. Les migrations Prisma (`prisma migrate deploy`) tournent automatiquement à chaque démarrage via [docker-entrypoint.sh](backend/docker-entrypoint.sh) — pas besoin de les lancer à la main.
4. Vérifier que `https://afaaq-backend.onrender.com/health` répond `200 OK`.

Noter l'URL du service (`https://afaaq-backend.onrender.com` ou équivalent) — nécessaire pour Vercel à l'étape suivante.

---

## 3. Vercel (frontend)

1. Dashboard Vercel → **Add New → Project** → importer ce repo GitHub.
2. Dans les réglages du projet (ou l'écran d'import) :
   - **Root Directory** : `frontend` (obligatoire — le repo est un monorepo, sans ça Vercel essaie de builder à la racine). [frontend/vercel.json](frontend/vercel.json) gère le reste (build command, SPA routing).
   - **Framework Preset** : Vite (devrait être détecté automatiquement une fois le Root Directory posé).
3. Ajouter la variable d'environnement :
   - `VITE_API_URL` = `https://afaaq-backend.onrender.com/api` (l'URL notée à l'étape 2, avec `/api` à la fin).
4. Déployer. Vercel donne une URL du type `https://afaaq-connect.vercel.app`.

---

## 4. Retour sur Render — corriger CORS

Maintenant que l'URL Vercel est connue :

1. Render → service `afaaq-backend` → **Environment**.
2. Mettre à jour :
   - `FRONTEND_URL` = `https://afaaq-connect.vercel.app` (l'URL réelle du projet Vercel — pas besoin d'y ajouter les URLs de preview `*.vercel.app`, elles sont acceptées automatiquement par le backend)
   - `APP_URL` = même valeur
3. Sauvegarder → Render redéploie automatiquement.

À ce stade l'app est fonctionnelle en production sur l'URL Vercel temporaire. Teste le parcours complet (inscription, connexion, paiement Stripe test) avant de brancher le domaine.

---

## 5. Stripe — mettre à jour le webhook

1. [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**.
2. URL : `https://afaaq-backend.onrender.com/api/payments/webhook`.
3. Événement à écouter : `checkout.session.completed`.
4. Copier le **Signing secret** (`whsec_...`) généré → le coller dans Render, variable `STRIPE_WEBHOOK_SECRET` → sauvegarder (redéploie automatiquement).

---

## 6. Domaine `afaaq.de` (Strato → Vercel)

1. Vercel → le projet → **Settings → Domains** → ajouter `afaaq.de` (et `www.afaaq.de` si besoin).
2. Vercel affiche les enregistrements DNS à créer. Généralement :
   - Domaine apex (`afaaq.de`) → enregistrement **A** vers `76.76.21.21`
   - `www.afaaq.de` → enregistrement **CNAME** vers `cname.vercel-dns.com`
   (Vercel affiche les valeurs exactes à jour — s'y fier plutôt qu'à ces valeurs si elles diffèrent.)
3. Chez Strato : espace client → gestion du domaine `afaaq.de` → zone DNS → ajouter les enregistrements indiqués par Vercel.
4. Attendre la propagation DNS (jusqu'à 24-48h, souvent < 1h). Vercel valide et provisionne automatiquement le certificat SSL une fois le DNS propagé.

### Dernière étape — reboucler CORS avec le domaine final

Une fois `afaaq.de` actif sur Vercel :

1. Render → `afaaq-backend` → **Environment**.
2. `FRONTEND_URL` = `https://afaaq-connect.vercel.app,https://afaaq.de,https://www.afaaq.de`
3. `APP_URL` = `https://afaaq.de`
4. Sauvegarder → redéploiement automatique.

---

## Récapitulatif — ce qu'il reste à faire à la main

- **Neon** : rien — la `DATABASE_URL` est déjà disponible dans le dashboard.
- **Render** : créer le Blueprint depuis `render.yaml`, coller `DATABASE_URL` / `GROQ_API_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `FRONTEND_URL` / `APP_URL` dans l'onglet Environment (deux passages : une valeur provisoire au départ, la valeur finale une fois Vercel puis le domaine connus).
- **Vercel** : importer le repo avec Root Directory = `frontend`, ajouter `VITE_API_URL`, puis ajouter le domaine custom `afaaq.de` dans Settings → Domains.
- **Strato** : créer les enregistrements DNS (A + CNAME) donnés par Vercel dans la zone DNS de `afaaq.de`.
- **Stripe** : ajouter l'endpoint webhook pointant vers l'URL Render, récupérer le signing secret.

## Sécurité — avant de pousser en public

- `.env` (racine, `backend/`, `frontend/`) ne sont jamais commit — protégés par `.gitignore` à chaque niveau. Seuls les `.env.example` (sans vraies valeurs) sont versionnés.
- Ne jamais coller de vraies clés (Stripe, Groq, DATABASE_URL) dans `render.yaml`, `vercel.json` ou un commit — elles vont uniquement dans les dashboards Render/Vercel via les champs d'environnement.
