# AFAAQ CONNECT — Frontend

Application React (TypeScript, Vite). Voir le [README racine](../README.md) pour l'architecture
d'ensemble, Docker et les variables d'environnement.

## Structure (`src/`)

- `features/` — un dossier par feature (`auth`, `applications`, `admin`, `notifications`,
  `marketing`, `chatbot`), chacun regroupant ses pages, composants et client API.
- `shared/` — composants UI communs, client API centralisé (`shared/api/client.ts`), i18n/RTL,
  hooks réutilisables, types partagés.

## Commandes utiles

```bash
npm install
npm run dev       # serveur de développement (Vite)
npm run build     # build de production -> dist/
npm run lint
```

`VITE_API_URL` doit pointer vers l'API backend (`http://localhost:3000/api` en local sans
Docker, `/api` derrière le proxy nginx en Docker).
