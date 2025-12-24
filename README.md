# Synergia v4.1.0

**Plateforme de Gamification RH et Engagement Collaborateur**

Synergia est une application web moderne qui transforme l'expérience collaborateur en intégrant des mécaniques de jeu (gamification) pour booster l'engagement, la productivité et le bien-être au travail.

---

## Fonctionnalités Principales

### Gamification & Progression
- **Système XP & Niveaux** : Gagnez de l'expérience en accomplissant des tâches et débloquez des rangs
- **Badges & Récompenses** : Collection de badges pour célébrer vos accomplissements
- **Arbre de Compétences** : Développez vos skills façon RPG
- **Défis Personnels & d'Équipe** : Challenges motivants avec récompenses

### Gestion des Tâches (Quêtes)
- **Tableau Kanban** : Organisation visuelle des tâches
- **Attribution & Suivi** : Assignation aux membres de l'équipe
- **Récompenses XP** : Points d'expérience pour les tâches complétées
- **Filtres & Recherche** : Navigation facile dans les quêtes

### Module Alternance
- **Parcours Scolaire** : Suivi des alternants par leurs tuteurs
- **Objectifs Personnalisables** : Création, modification, suppression d'objectifs
- **Validation XP** : Attribution de points pour les réussites scolaires
- **Multi-alternants** : Gestion de plusieurs alternants par tuteur

### Pointage & Présence (Pulse)
- **Badgeuse Digitale** : Pointage entrée/sortie avec géolocalisation
- **Export Excel** : Rapports de présence exportables
- **Historique Complet** : Suivi des heures travaillées

### Boutique de Récompenses
- **Catalogue Personnalisable** : Récompenses définies par l'entreprise
- **Achat avec XP** : Échangez vos points contre des avantages
- **Liste de Souhaits** : Sauvegardez vos objectifs d'économie

### Communication & Social
- **Chat en Temps Réel** : Messagerie instantanée
- **Notifications Push** : Alertes en temps réel
- **Système de Parrainage** : Intégration des nouveaux collaborateurs
- **Boîte à Idées** : Suggestions et innovations

### Mentorat & Formation
- **Sessions de Coaching** : Planification et suivi des séances
- **Parcours de Formation** : Catalogue de formations
- **Certifications** : Suivi des diplômes et certificats

### Administration
- **Gestion des Rôles** : Permissions granulaires par module
- **Paramètres Système** : Configuration complète de l'application
- **Analytics Manager** : Tableaux de bord et statistiques

---

## Stack Technique

- **Frontend** : React 18 + Vite
- **UI** : Tailwind CSS + Framer Motion
- **Backend** : Firebase (Firestore, Auth, Storage)
- **État** : Zustand
- **Icônes** : Lucide React
- **Export** : jsPDF, ExcelJS

---

## Installation

```bash
# Cloner le repository
git clone https://github.com/BRAINCaen/synergia-app.git

# Accéder au dossier
cd synergia-app/react-app

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

---

## Configuration Firebase

1. Créez un projet Firebase
2. Activez Authentication (Google, Email/Password)
3. Créez une base Firestore
4. Copiez votre configuration dans `src/core/firebase.js`

---

## Structure du Projet

```
react-app/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── core/           # Services et configuration
│   │   └── services/   # Services Firebase et métier
│   ├── pages/          # Pages de l'application
│   ├── shared/
│   │   ├── hooks/      # Hooks React personnalisés
│   │   ├── stores/     # Stores Zustand
│   │   └── providers/  # Context Providers
│   └── modules/        # Modules fonctionnels
├── public/             # Assets statiques
└── index.html
```

---

## Changelog v4.1.0

### Nouveautés
- **Module Alternance amélioré** : Gestion complète des parcours d'alternants
- **Objectifs personnalisables** : Les tuteurs peuvent créer, modifier et supprimer des objectifs
- **Validation XP pour alternants** : Attribution correcte des points aux alternants (pas aux tuteurs)
- **Dropdown multi-alternants** : Sélection facile de l'alternant à gérer

### Corrections
- Fix du chargement des alternants (permissions en tableau)
- Fix de la validation d'objectifs (import `where` manquant)
- Fix de l'attribution XP au bon utilisateur
- Amélioration de la gestion des erreurs

---

## Licence

Propriétaire - BRAIN Caen © 2024-2025

---

## Contact

- **Entreprise** : BRAIN Caen
- **Application** : Synergia v4.1.0
