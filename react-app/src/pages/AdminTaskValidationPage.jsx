// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// DASHBOARD ADMIN PRINCIPAL - ACCÈS VIA /admin
// ==========================================

console.log('🔄 [AdminDashboard] Rechargé à:', new Date().toLocaleTimeString());

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  User,
  Calendar,
  FileText,
  Star,
  Trophy,
  RefreshCw,
  AlertTriangle,
  Filter,
  Search,
  Shield,
  Settings,
  Users,
  BarChart3,
  Award,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Database,
  Lock,
  Unlock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 🎯 IMPORT DU LAYOUT STANDARD AVEC MENU HAMBURGER FONCTIONNEL
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎨 COMPOSANT CARTE PREMIUM AVEC GLASSMORPHISM
 */
const PremiumCard = ({ children, className = "", gradient = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      ${gradient 
        ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20' 
        : 'bg-white/80 backdrop-blur-sm'
      }
      rounded-2xl p-6 shadow-xl hover:shadow-2xl 
      transition-all duration-300 transform hover:-translate-y-1
      ${className}
    `}
  >
    {children}
  </motion.div>
);

/**
 * 🎨 COMPOSANT STAT CARD MODERNE
 */
const StatCard = ({ title, value, icon: Icon, color = "blue", trend, percentage }) => {
  const colorClasses = {
    yellow: {
      text: 'text-yellow-600',
      bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      light: 'bg-yellow-50'
    },
    green: {
      text: 'text-green-600',
      bg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      light: 'bg-green-50'
    },
    red: {
      text: 'text-red-600',
      bg: 'bg-gradient-to-br from-red-400 to-rose-500',
      light: 'bg-red-50'
    },
    blue: {
      text: 'text-blue-600',
      bg: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      light: 'bg-blue-50'
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-gradient-to-br from-purple-400 to-pink-500',
      light: 'bg-purple-50'
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-gradient-to-br from-orange-400 to-amber-500',
      light: 'bg-orange-50'
    }
  };

  return (
    <PremiumCard gradient>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-10 h-10 rounded-xl ${colorClasses[color].bg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">{trend}</p>
              {percentage && (
                <span className={`text-xs font-semibold ${percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage > 0 ? '↑' : '↓'} {Math.abs(percentage)}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </PremiumCard>
  );
};

/**
 * 🎨 COMPOSANT LIEN ADMIN MODERNE
 */
const AdminLink = ({ to, title, description, icon: Icon, color = "blue", badge = null }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
  };

  return (
    <Link to={to} className="block group">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        <div className="relative flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
              {badge && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
              <Eye className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

/**
 * 🛡️ DASHBOARD ADMIN PRINCIPAL - PAGE D'ACCÈS ADMIN
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États de base
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Données simulées pour les métriques
  const mockTasks = [
    { id: 1, status: 'pending' },
    { id: 2, status: 'pending' },
    { id: 3, status: 'pending' }
  ];

  // Initialiser les quêtes simulées
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPendingTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        
        {/* Header de la page avec effet glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Dashboard Admin
                </h1>
                <p className="text-gray-600 text-xl font-medium flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Bienvenue {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
                  <span className="ml-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    ADMIN ⚡
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Utilisateurs Actifs"
            value="127"
            icon={User}
            color="blue"
            trend="Connectés aujourd'hui"
            percentage={12}
          />
          <StatCard
            title="Quêtes Actives"
            value="1,543"
            icon={Target}
            color="green"
            trend="En cours de traitement"
            percentage={8}
          />
          <StatCard
            title="Validations Requises"
            value={pendingTasks.length}
            icon={Clock}
            color="orange"
            trend="Nécessitent validation"
            percentage={-5}
          />
          <StatCard
            title="Santé Système"
            value="98%"
            icon={Activity}
            color="purple"
            trend="Performances optimales"
            percentage={2}
          />
        </motion.div>

        {/* Alerte urgente - Validations en attente */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-orange-900 font-bold text-lg mb-1">
                  ⚠️ 23 validation(s) urgentes en attente
                </p>
                <p className="text-orange-700 text-sm">
                  Des quêtes nécessitent votre validation pour débloquer les utilisateurs et maintenir la progression.
                </p>
              </div>
              <Link 
                to="/admin/tasks-pending" 
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Traiter maintenant
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Métriques secondaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <PremiumCard gradient>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Quêtes Validées (7j)</p>
                <p className="text-3xl font-bold text-gray-900">847</p>
                <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% vs semaine précédente
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard gradient>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">XP Distribués (7j)</p>
                <p className="text-3xl font-bold text-gray-900">45.2K</p>
                <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Moyenne: 53 XP/quête
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard gradient>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Badges Débloqués</p>
                <p className="text-3xl font-bold text-gray-900">142</p>
                <p className="text-xs text-purple-600 font-semibold mt-1 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  23 nouveaux cette semaine
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Outils d'Administration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">Outils d'Administration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Validation Quêtes */}
            <AdminLink
              to="/admin/tasks-pending"
              title="Validation Quêtes"
              description="Approuver les quêtes en attente"
              icon={CheckCircle}
              color="green"
              badge="23"
            />

            {/* Validation Objectifs */}
            <AdminLink
              to="/admin/objective-validation"
              title="Validation Objectifs"
              description="Validation des objectifs utilisateur"
              icon={Target}
              color="purple"
            />

            {/* Gestion Utilisateurs */}
            <AdminLink
              to="/admin/users-management"
              title="Gestion Utilisateurs"
              description="Administration des comptes utilisateur"
              icon={Users}
              color="blue"
            />

            {/* Gestion Badges */}
            <AdminLink
              to="/admin/badges-management"
              title="Gestion Badges"
              description="Configuration du système de badges"
              icon={Award}
              color="orange"
            />

            {/* Analytics Avancées */}
            <AdminLink
              to="/admin/analytics-advanced"
              title="Analytics Avancées"
              description="Statistiques et rapports détaillés"
              icon={BarChart3}
              color="teal"
            />

            {/* Paramètres Système */}
            <AdminLink
              to="/admin/system-settings"
              title="Paramètres Système"
              description="Configuration globale de l'application"
              icon={Settings}
              color="red"
            />

            {/* Gestion Récompenses */}
            <AdminLink
              to="/admin/rewards-management"
              title="Gestion Récompenses"
              description="Configuration des récompenses et rewards"
              icon={Trophy}
              color="yellow"
            />

            {/* Permissions & Rôles */}
            <AdminLink
              to="/admin/permissions-roles"
              title="Permissions & Rôles"
              description="Gestion des droits d'accès utilisateur"
              icon={Lock}
              color="blue"
            />

            {/* Synchronisation */}
            <AdminLink
              to="/admin/sync"
              title="Synchronisation"
              description="Synchronisation Firebase et données"
              icon={Database}
              color="green"
            />
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
          >
            <RefreshCw className="w-5 h-5" />
            Actualiser les données
          </button>
          
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
          >
            <Shield className="w-5 h-5" />
            Retour Dashboard
          </Link>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Synergia v3.5 • Dashboard Admin • Connecté en tant que <span className="font-semibold">{user?.email}</span>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminTaskValidationPage;
