# ArticleSimy Frontend

Frontend React de la plateforme ArticleSimy. Il fournit les interfaces client et admin pour consulter les articles, gerer le panier, passer des commandes, suivre les commandes, consulter le dashboard, gerer les utilisateurs et recevoir les notifications.

## Technologies

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- Sonner
- React Icons
- STOMP / SockJS
- Tailwind CSS / CSS custom

## Prerequis

- Node.js
- npm
- Backend ArticleSimy lance sur `http://localhost:8080`

## Installation

Depuis le dossier frontend:

```powershell
cd C:\Users\Victus\Downloads\test\ArticleSimy-Frontend
npm install
```

## Lancement en developpement

```powershell
npm run dev
```

Par defaut, Vite lance l'application sur:

```text
http://localhost:5173
```

## Build production

```powershell
npm run build
```

Le resultat est genere dans:

```text
dist/
```

## Preview du build

```powershell
npm run preview
```

## Scripts disponibles

```text
npm run dev      Lance le serveur Vite
npm run build    Compile TypeScript et genere le build
npm run lint     Lance ESLint
npm run preview  Sert le build localement
```

## Configuration API

La configuration Axios se trouve dans:

```text
src/api/axiosConfig.ts
```

Base URL actuelle:

```text
http://localhost:8080/api
```

Le token JWT est lu depuis `localStorage` et ajoute automatiquement dans l'en-tete:

```text
Authorization: Bearer <token>
```

## Comptes de test

Le backend cree automatiquement:

```text
Admin  : admin@articlesimy.com / admin123
Client : client@articlesimy.com / client123
```

## Fonctionnalites principales

- Connexion et inscription
- Gestion des articles
- Upload et affichage des images produits
- Recherche et filtre des articles
- Panier client
- Validation de commande
- Historique des commandes
- Telechargement de facture PDF
- Suivi de commande
- Wishlist
- Notifications temps reel
- Dashboard admin avec statistiques
- Gestion des utilisateurs
- Journal d'audit
- Interface multilingue

## Structure utile

```text
src/api/              Configuration Axios
src/components/       Composants reutilisables
src/context/          Contextes React
src/hooks/            Hooks personnalises
src/pages/            Pages principales
src/styles/           Styles CSS
src/types/            Types TypeScript
```

## Lien avec le backend

Pour que l'application fonctionne correctement:

1. Lancer MySQL.
2. Lancer le backend sur `http://localhost:8080`.
3. Lancer le frontend sur `http://localhost:5173`.
4. Se connecter avec un compte admin ou client.
