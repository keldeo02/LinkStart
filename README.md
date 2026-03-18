# LinkStart

LinkStart est une application réalisée pour un projet scolaire.  
Le projet utilise :
- `React + Vite` pour le front
- `react-router-dom` pour la navigation
- `json-server` pour simuler une API/base de données locale

## Prérequis

- `Node.js` (version récente recommandée)
- `npm`

## Installation

```bash
npm install
```

## Commandes disponibles

### Développement

- `npm run dev`  
	Lance uniquement le front Vite (généralement sur `http://localhost:5173`).

- `npm run api`  
	Lance uniquement `json-server` avec le fichier `db.json` sur le port `3001`.

- `npm run dev:full`  
	Lance **le front + l'API mock en même temps** (`vite` et `json-server`).

