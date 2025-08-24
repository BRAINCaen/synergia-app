// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN - ACCÈS ADMIN AVEC LAYOUT STANDARD ET MENU HAMBURGER FONCTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 🎯 IMPORT DU LAYOUT STANDARD AVEC MENU HAMBURGER FONCTIONNEL
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎨 COMPOSANT CARTE PREMIUM
 */
const PremiumCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * 🎨 COMPOSANT STAT CARD
 */
const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
  const colorClasses = {
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <PremiumCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </PremiumCard>
  );
};

/**
 * 🎨 COMPOSANT LIEN ADMIN
 */
const AdminLink = ({ to, title, description, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
  };

  return (
    <Link to={to} className="block group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:bg-gray-50"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

/**
 * 🛡️ PAGE ADMIN - ACCÈS ADMIN (anciennement task-validation)
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États de base
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Données simulées pour les métriques
  const mockTasks = [
    { id: 1, status: 'pending' },
    { id: 2, status: 'pending' },
    { id: 3, status: 'pending' }
  ];

  // Initialiser les tâches simulées
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPendingTasks(mockTasks);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        
        {/* Header de la page */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Accès Admin
              </h1>
              <p className="text-gray-600 text-lg">
                Panneau de contrôle administrateur - Bienvenue {user?.displayName || user?.email?.split('@')[0] || 'Admin'} ⚡
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Utilisateurs Actifs"
            value="127"
            icon={User}
            color="blue"
            trend="Connectés aujourd'hui"
          />
          <StatCard
            title="Tâches Actives"
            value="1543"
            icon={CheckCircle}
            color="green"
            trend="En cours de traitement"
          />
          <StatCard
            title="En Attente"
            value={pendingTasks.length}
            icon={Clock}
            color="yellow"
            trend="Nécessitent validation"
          />
          <StatCard
            title="Santé Système"
            value="98%"
            icon={Shield}
            color="purple"
            trend="Performances optimales"
          />
        </motion.div>

        {/* Alerte - 23 validations en attente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-orange-800 font-medium">23 validation(s) en attente</p>
              <p className="text-orange-600 text-sm">Des tâches nécessitent votre validation pour débloquer les utilisateurs.</p>
            </div>
            <Link to="/admin/tasks-pending" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Traiter
            </Link>
          </div>
        </motion.div>

        {/* Outils d'Administration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Outils d'Administration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Validation Tâches */}
            <AdminLink
              to="/admin/tasks-pending"
              title="Validation Tâches"
              description="Approuver les tâches en attente"
              icon={CheckCircle}
              color="green"
            />

            {/* Validation Objectifs */}
            <AdminLink
              to="/admin/objective-validation"
              title="Validation Objectifs"
              description="Validation des objectifs utilisateur"
              icon={Star}
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

            {/* Analytics Admin */}
            <AdminLink
              to="/admin/analytics-advanced"
              title="Analytics Admin"
              description="Statistiques avancées"
              icon={BarChart3}
              color="teal"
            />

            {/* Paramètres Système */}
            <AdminLink
              to="/admin/system-settings"
              title="Paramètres Système"
              description="Configuration globale"
              icon={Settings}
              color="red"
            />

            {/* Gestion Récompenses */}
            <AdminLink
              to="/admin/rewards-management"
              title="Gestion Récompenses"
              description="Configuration des réwards"
              icon={Trophy}
              color="purple"
            />

            {/* Permissions & Rôles */}
            <AdminLink
              to="/admin/permissions-roles"
              title="Permissions & Rôles"
              description="Gestion des droits utilisateur"
              icon={Shield}
              color="blue"
            />

            {/* Test Complet */}
            <AdminLink
              to="/admin/system-test"
              title="Test Complet"
              description="Suite de tests système"
              icon={RefreshCw}
              color="green"
            />
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Retour Dashboard
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminTaskValidationPage;
