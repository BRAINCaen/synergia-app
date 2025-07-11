// ==========================================
// 📁 react-app/src/core/escapeGameRouteIntegration.js
// INTÉGRATION DES ROUTES POUR LE SYSTÈME ESCAPE GAME
// ==========================================

/**
 * 🎭 NOUVELLES ROUTES ESCAPE GAME
 * À ajouter dans votre routeur principal (App.js ou routes.js)
 */

// Import des nouveaux composants
import EscapeGameProgressionPage from '../pages/EscapeGameProgressionPage.jsx';
import EscapeGameRolesManagement from '../components/escapeGame/EscapeGameRolesManagement.jsx';
import EscapeGameBadgeCenter from '../components/escapeGame/EscapeGameBadgeCenter.jsx';
import EscapeGameDashboard from '../components/escapeGame/EscapeGameDashboard.jsx';

/**
 * 🛣️ CONFIGURATION DES ROUTES ESCAPE GAME
 */
export const ESCAPE_GAME_ROUTES = [
  {
    path: '/progression',
    component: EscapeGameProgressionPage,
    name: 'Progression',
    icon: '🎯',
    description: 'Suivez votre progression dans les rôles escape game',
    access: 'all', // Tous les utilisateurs
    category: 'gamification'
  },
  {
    path: '/escape-roles',
    component: EscapeGameRolesManagement,
    name: 'Gestion des Rôles',
    icon: '🎭',
    description: 'Gérer les rôles et assignations escape game',
    access: 'admin', // Admins seulement
    category: 'administration'
  },
  {
    path: '/badges',
    component: EscapeGameBadgeCenter,
    name: 'Centre des Badges',
    icon: '🏆',
    description: 'Consultez tous vos badges et réalisations',
    access: 'all',
    category: 'gamification'
  },
  {
    path: '/escape-dashboard',
    component: EscapeGameDashboard,
    name: 'Tableau de Bord Escape',
    icon: '📊',
    description: 'Vue d\'ensemble des métriques escape game',
    access: 'manager', // Managers et admins
    category: 'analytics'
  }
];

/**
 * 🧭 NAVIGATION ESCAPE GAME
 * À intégrer dans votre navigation principale
 */
export const ESCAPE_GAME_NAVIGATION = {
  gamification: {
    title: 'Progression & Gamification',
    icon: '🎮',
    routes: [
      {
        path: '/progression',
        name: 'Ma Progression',
        icon: '🎯',
        badge: 'new' // Nouveau système
      },
      {
        path: '/badges',
        name: 'Mes Badges',
        icon: '🏆',
        badge: null
      }
    ]
  },
  management: {
    title: 'Gestion Équipe',
    icon: '👥',
    routes: [
      {
        path: '/escape-roles',
        name: 'Rôles Équipe',
        icon: '🎭',
        adminOnly: true
      },
      {
        path: '/escape-dashboard',
        name: 'Métriques',
        icon: '📊',
        managerOnly: true
      }
    ]
  }
};

/**
 * 🎨 MISE À JOUR DE LA NAVIGATION PRINCIPALE
 * 
 * REMPLACER dans votre fichier de navigation :
 * 
 * ANCIEN :
 * {
 *   path: '/gamification',
 *   name: 'Gamification',
 *   icon: Trophy
 * }
 * 
 * NOUVEAU :
 */
export const UPDATED_MAIN_NAVIGATION = [
  {
    path: '/dashboard',
    name: 'Tableau de Bord',
    icon: 'BarChart3',
    access: 'all'
  },
  {
    path: '/tasks',
    name: 'Tâches',
    icon: 'CheckSquare',
    access: 'all'
  },
  {
    path: '/progression', // ← NOUVELLE ROUTE
    name: 'Ma Progression',
    icon: 'Trophy',
    access: 'all',
    badge: 'nouveau'
  },
  {
    path: '/badges', // ← NOUVELLE ROUTE
    name: 'Badges',
    icon: 'Award',
    access: 'all'
  },
  {
    path: '/team',
    name: 'Équipe',
    icon: 'Users',
    access: 'all'
  },
  {
    path: '/calendar',
    name: 'Planning',
    icon: 'Calendar',
    access: 'all'
  },
  {
    path: '/analytics',
    name: 'Analytics',
    icon: 'BarChart',
    access: 'manager'
  }
];

/**
 * 📱 INTÉGRATION DANS APP.JS
 */
export const APP_JS_INTEGRATION_EXAMPLE = `
// ==========================================
// 📁 react-app/src/App.js - EXEMPLE D'INTÉGRATION
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Imports existants
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TeamPage from './pages/TeamPage.jsx';

// ✨ NOUVEAUX IMPORTS ESCAPE GAME
import EscapeGameProgressionPage from './pages/EscapeGameProgressionPage.jsx';
import { ESCAPE_GAME_ROUTES } from './core/escapeGameRouteIntegration.js';

// Import du système d'intégration
import './core/escapeGameIntegration.js'; // Auto-initialisation

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        
        <Routes>
          {/* Routes existantes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/team" element={<TeamPage />} />
          
          {/* ✨ NOUVELLES ROUTES ESCAPE GAME */}
          <Route path="/progression" element={<EscapeGameProgressionPage />} />
          
          {/* Ou mapper toutes les routes automatiquement */}
          {ESCAPE_GAME_ROUTES.map(route => (
            <Route 
              key={route.path}
              path={route.path} 
              element={<route.component />} 
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
`;

/**
 * 🧭 INTÉGRATION DANS NAVIGATION.JSX
 */
export const NAVIGATION_JSX_INTEGRATION_EXAMPLE = `
// ==========================================
// 📁 react-app/src/components/Navigation.jsx - EXEMPLE D'INTÉGRATION
// ==========================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  CheckSquare, 
  Trophy,     // ← POUR PROGRESSION
  Award,      // ← POUR BADGES
  Users, 
  Calendar 
} from 'lucide-react';

// ✨ IMPORT NAVIGATION ESCAPE GAME
import { ESCAPE_GAME_NAVIGATION } from '../core/escapeGameRouteIntegration.js';

const Navigation = () => {
  // Navigation principale mise à jour
  const mainNavItems = [
    { path: '/', name: 'Tableau de Bord', icon: BarChart3 },
    { path: '/tasks', name: 'Tâches', icon: CheckSquare },
    { path: '/progression', name: 'Ma Progression', icon: Trophy, badge: 'nouveau' }, // ← NOUVEAU
    { path: '/badges', name: 'Badges', icon: Award }, // ← NOUVEAU
    { path: '/team', name: 'Équipe', icon: Users },
    { path: '/calendar', name: 'Planning', icon: Calendar }
  ];

  return (
    <nav className="navigation">
      {/* Navigation principale */}
      <div className="nav-section">
        <h3>Navigation</h3>
        {mainNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path}
              to={item.path}
              className="nav-item"
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="badge badge-new">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </div>
      
      {/* ✨ SECTION ESCAPE GAME */}
      <div className="nav-section">
        <h3>🎭 Escape Game</h3>
        {ESCAPE_GAME_NAVIGATION.gamification.routes.map(route => (
          <NavLink 
            key={route.path}
            to={route.path}
            className="nav-item"
          >
            <span className="nav-icon">{route.icon}</span>
            <span>{route.name}</span>
            {route.badge && (
              <span className="badge badge-new">{route.badge}</span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
`;

/**
 * 🎨 STYLES CSS POUR LES NOUVELLES FONCTIONNALITÉS
 */
export const ESCAPE_GAME_CSS = `
/* ==========================================
   STYLES ESCAPE GAME - À ajouter à votre CSS principal
   ========================================== */

/* Badge "nouveau" */
.badge-new {
  background: linear-gradient(135deg, #8B5CF6, #A855F7);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Section navigation escape game */
.nav-section h3 {
  color: #8B5CF6;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  padding: 0 12px;
}

/* Icônes emoji dans navigation */
.nav-item .nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

/* Animations pour les nouvelles fonctionnalités */
.escape-game-new {
  position: relative;
}

.escape-game-new::after {
  content: "✨";
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 12px;
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
`;

/**
 * 🔧 INSTRUCTIONS D'INSTALLATION
 */
export const INSTALLATION_INSTRUCTIONS = {
  step1: {
    title: "1. Remplacer les fichiers système",
    files: [
      "react-app/src/core/services/escapeGameBadgeEngine.js",
      "react-app/src/core/services/escapeGameRolesService.js", 
      "react-app/src/core/escapeGameIntegration.js",
      "react-app/src/core/migrationToEscapeGame.js"
    ],
    action: "Créer ces nouveaux fichiers avec le code fourni"
  },
  
  step2: {
    title: "2. Ajouter la nouvelle page",
    files: [
      "react-app/src/pages/EscapeGameProgressionPage.jsx"
    ],
    action: "Créer cette nouvelle page de progression"
  },
  
  step3: {
    title: "3. Mettre à jour App.js",
    action: "Ajouter les nouvelles routes selon l'exemple fourni"
  },
  
  step4: {
    title: "4. Mettre à jour Navigation.jsx", 
    action: "Intégrer les nouveaux liens de navigation"
  },
  
  step5: {
    title: "5. Ajouter les styles CSS",
    action: "Intégrer les styles Escape Game à votre CSS principal"
  },
  
  step6: {
    title: "6. Effectuer la migration",
    action: "Exécuter migrateAllUsers() dans la console pour migrer les données existantes"
  }
};

/**
 * 🧪 FONCTION DE TEST COMPLÈTE
 */
export const testEscapeGameIntegration = async () => {
  console.log('🧪 TEST COMPLET INTÉGRATION ESCAPE GAME');
  
  const tests = {
    systemLoaded: false,
    routesAvailable: false,
    navigationUpdated: false,
    migrationReady: false,
    errors: []
  };
  
  try {
    // Test 1: Système chargé
    tests.systemLoaded = typeof window.escapeGameSystem !== 'undefined';
    
    // Test 2: Routes disponibles  
    tests.routesAvailable = ESCAPE_GAME_ROUTES.length > 0;
    
    // Test 3: Navigation configurée
    tests.navigationUpdated = ESCAPE_GAME_NAVIGATION.gamification.routes.length > 0;
    
    // Test 4: Migration prête
    tests.migrationReady = typeof window.escapeGameMigration !== 'undefined';
    
    console.log('✅ Tests intégration:', tests);
    return tests;
    
  } catch (error) {
    tests.errors.push(error.message);
    console.error('❌ Erreur tests intégration:', error);
    return tests;
  }
};

// Auto-test au chargement
if (typeof window !== 'undefined') {
  window.testEscapeGameIntegration = testEscapeGameIntegration;
  
  console.log('🎭 Intégration routes Escape Game chargée !');
  console.log('📋 Instructions d\'installation disponibles dans INSTALLATION_INSTRUCTIONS');
  console.log('🧪 Test: testEscapeGameIntegration()');
}

// Exports
export default {
  routes: ESCAPE_GAME_ROUTES,
  navigation: ESCAPE_GAME_NAVIGATION,
  mainNav: UPDATED_MAIN_NAVIGATION,
  css: ESCAPE_GAME_CSS,
  installation: INSTALLATION_INSTRUCTIONS,
  examples: {
    appJs: APP_JS_INTEGRATION_EXAMPLE,
    navigationJsx: NAVIGATION_JSX_INTEGRATION_EXAMPLE
  }
};

console.log('🎭 Configuration routes Escape Game prête !');
