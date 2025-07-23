// ==========================================
// 📁 react-app/src/pages/AdminDashboardTuteurPage.jsx
// DASHBOARD ADMIN TUTEUR
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, TrendingUp } from 'lucide-react';

const AdminDashboardTuteurPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🎓 Dashboard Tuteur
          </h1>
          <p className="text-gray-400 text-lg">
            Interface de gestion pour les tuteurs et formateurs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Apprenants</h3>
            <p className="text-3xl font-bold text-blue-400">24</p>
            <p className="text-gray-400 text-sm">Actifs ce mois</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <BookOpen className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Formations</h3>
            <p className="text-3xl font-bold text-green-400">8</p>
            <p className="text-gray-400 text-sm">En cours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Progression</h3>
            <p className="text-3xl font-bold text-purple-400">87%</p>
            <p className="text-gray-400 text-sm">Moyenne</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
          >
            <GraduationCap className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Certifiés</h3>
            <p className="text-3xl font-bold text-yellow-400">12</p>
            <p className="text-gray-400 text-sm">Ce trimestre</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <GraduationCap className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Interface Tuteur Avancée</h2>
          <p className="text-gray-400">
            Fonctionnalités complètes de gestion des formations en cours de développement
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardTuteurPage;

// ==========================================
// 📁 react-app/src/pages/AdminRolePermissionsPage.jsx
// GESTION DES PERMISSIONS DE RÔLES
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Users } from 'lucide-react';

const AdminRolePermissionsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
            🔐 Permissions des Rôles
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez les permissions et accès pour chaque rôle utilisateur
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Système de Permissions Avancé</h2>
          <p className="text-gray-400 mb-6">
            Interface de gestion granulaire des permissions en développement
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Lock className="w-6 h-6 text-red-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Contrôle d'Accès</h3>
              <p className="text-gray-400 text-sm">Définissez qui peut accéder à quoi</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Key className="w-6 h-6 text-yellow-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Rôles Personnalisés</h3>
              <p className="text-gray-400 text-sm">Créez des rôles sur mesure</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Users className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Assignation</h3>
              <p className="text-gray-400 text-sm">Assignez facilement les permissions</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRolePermissionsPage;

// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// GESTION DES RÉCOMPENSES
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Zap } from 'lucide-react';

const AdminRewardsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🎁 Gestion des Récompenses
          </h1>
          <p className="text-gray-400 text-lg">
            Créez et gérez les récompenses pour motiver vos équipes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <Gift className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Système de Récompenses</h2>
          <p className="text-gray-400 mb-6">
            Interface complète de gestion des récompenses en préparation
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Star className="w-6 h-6 text-yellow-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Récompenses Personnalisées</h3>
              <p className="text-gray-400 text-sm">Créez des récompenses uniques</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Trophy className="w-6 h-6 text-gold-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Niveaux de Prestige</h3>
              <p className="text-gray-400 text-sm">Définissez des niveaux de récompenses</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Zap className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Distribution Auto</h3>
              <p className="text-gray-400 text-sm">Automatisez l'attribution des prix</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRewardsPage;

// ==========================================
// 📁 react-app/src/pages/AdminBadgesPage.jsx
// GESTION DES BADGES
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Medal, Shield, Crown } from 'lucide-react';

const AdminBadgesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
            🏆 Gestion des Badges
          </h1>
          <p className="text-gray-400 text-lg">
            Créez et gérez les badges pour reconnaître les accomplissements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Système de Badges Avancé</h2>
          <p className="text-gray-400 mb-6">
            Interface complète pour créer et attribuer des badges
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Medal className="w-6 h-6 text-gold-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Badges Personnalisés</h3>
              <p className="text-gray-400 text-sm">Concevez vos propres badges</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Critères d'Attribution</h3>
              <p className="text-gray-400 text-sm">Définissez les conditions d'obtention</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Crown className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Badges Exclusifs</h3>
              <p className="text-gray-400 text-sm">Créez des badges rares et prestigieux</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminBadgesPage;

// ==========================================
// 📁 react-app/src/pages/AdminUsersPage.jsx
// GESTION DES UTILISATEURS
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Settings } from 'lucide-react';

const AdminUsersPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            👥 Gestion des Utilisateurs
          </h1>
          <p className="text-gray-400 text-lg">
            Administrez les comptes utilisateurs et leurs permissions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Interface d'Administration Utilisateurs</h2>
          <p className="text-gray-400 mb-6">
            Outils complets de gestion des utilisateurs en développement
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Activation/Désactivation</h3>
              <p className="text-gray-400 text-sm">Gérez l'accès des utilisateurs</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Settings className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Profils Complets</h3>
              <p className="text-gray-400 text-sm">Consultez et modifiez les profils</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <UserX className="w-6 h-6 text-red-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Modération</h3>
              <p className="text-gray-400 text-sm">Outils de modération avancés</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsersPage;

// ==========================================
// 📁 react-app/src/pages/AdminAnalyticsPage.jsx
// ANALYTICS ADMIN
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

const AdminAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            📊 Analytics Admin
          </h1>
          <p className="text-gray-400 text-lg">
            Analyses avancées et métriques de performance pour les administrateurs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard Analytics Avancé</h2>
          <p className="text-gray-400 mb-6">
            Métriques et analyses détaillées pour les administrateurs
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Tendances</h3>
              <p className="text-gray-400 text-sm">Analysez les évolutions dans le temps</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Répartitions</h3>
              <p className="text-gray-400 text-sm">Visualisez la distribution des données</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Activity className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Activité Temps Réel</h3>
              <p className="text-gray-400 text-sm">Surveillez l'activité en direct</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

// ==========================================
// 📁 react-app/src/pages/AdminSettingsPage.jsx
// PARAMÈTRES ADMIN
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Cog, Database, Shield } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent mb-4">
            ⚙️ Paramètres Admin
          </h1>
          <p className="text-gray-400 text-lg">
            Configuration système et paramètres avancés
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
        >
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Configuration Système</h2>
          <p className="text-gray-400 mb-6">
            Interface de configuration avancée pour les administrateurs
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Cog className="w-6 h-6 text-gray-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Paramètres Généraux</h3>
              <p className="text-gray-400 text-sm">Configuration de l'application</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Database className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Base de Données</h3>
              <p className="text-gray-400 text-sm">Gestion et maintenance des données</p>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <Shield className="w-6 h-6 text-red-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Sécurité</h3>
              <p className="text-gray-400 text-sm">Paramètres de sécurité avancés</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
