# AFAAQ CONNECT — Backend

API NestJS + PostgreSQL (Prisma). Voir le [README racine](../README.md) pour l'architecture
d'ensemble, Docker et les variables d'environnement.

## Commandes utiles

```bash
npm install
npx prisma migrate deploy   # ou `migrate dev` en développement pour créer une nouvelle migration
npm run start:dev           # serveur de dev avec rechargement à chaud
npm run build                # compilation TypeScript -> dist/
npm run test                 # tests unitaires
npm run make-admin           # promeut un utilisateur existant en ADMIN (voir scripts/promote-admin.ts)
```

`GET /health` (hors préfixe `/api`) vérifie la connexion à PostgreSQL — utilisé par le
`HEALTHCHECK` Docker.
