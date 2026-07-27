# Boutique API MongoDB

Projet pédagogique complet permettant de simuler une boutique en ligne avec :

- API REST Node.js / Express
- MongoDB / Mongoose
- Authentification JWT
- Rôles client et administrateur
- Produits et catégories
- Panier
- Commandes
- Paiement Mobile Money simulé
- Tableau de bord administrateur
- Interface web Bootstrap
- Documentation Swagger

## 1. Prérequis

- Node.js 18 ou supérieur
- MongoDB local ou MongoDB Atlas
- npm

## 2. Installation

```bash
npm install
```

Copiez le fichier d'environnement :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Modifiez au besoin `MONGODB_URI` dans `.env`.

## 3. Charger les données de démonstration

```bash
npm run seed
```

Comptes créés :

### Administrateur

- E-mail : `admin@boutique.ga`
- Mot de passe : `Admin123!`

### Client

- E-mail : `client@boutique.ga`
- Mot de passe : `Client123!`

## 4. Démarrage

Mode développement :

```bash
npm run dev
```

Mode normal :

```bash
npm start
```

## 5. Accès

- Boutique : http://localhost:3000
- Administration : http://localhost:3000/admin.html
- Swagger : http://localhost:3000/api-docs
- Santé de l'API : http://localhost:3000/api/health

## 6. Démonstration suggérée

1. Lancer MongoDB.
2. Exécuter `npm run seed`.
3. Lancer `npm run dev`.
4. Ouvrir la boutique.
5. Se connecter comme client.
6. Ajouter des produits au panier.
7. Créer une commande.
8. Simuler le paiement.
9. Ouvrir l'administration.
10. Se connecter comme administrateur.
11. Ajouter un produit.
12. Modifier le statut de la commande.
13. Ouvrir Swagger pour montrer les routes REST.

## 7. Principales routes

### Authentification

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Produits

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Catégories

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Panier

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`

### Commandes

- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status`

### Paiement

- `POST /api/payments/simulate`

## 8. Remarque

Le paiement est volontairement simulé. Aucune transaction réelle n'est effectuée.
