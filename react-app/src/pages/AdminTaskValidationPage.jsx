// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock, Search, Filter, Eye, AlertTriangle } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  const [pendingTasks, setPendingTasks] = useState([]);

  const mockTasks = [
    {
      id: 1,
      title: 'Développer nouvelle feature',
      user: 'Thomas Dubois',
      xpClaimed: 50,
      status: 'pending',
      description: 'Implémentation du système de badges',
      completedAt: new Date('2024-08-16'),
      evidence: 'Code committé sur GitHub'
    },
    {
      id: 2,
      title: 'Design interface utilisateur',
      user: 'Sophie Laurent',
      xpClaimed: 35,
      status: 'pending',
      description: 'Mockups pour la page analytics',
      completedAt: new Date('2024-08-15'),
      evidence: 'Fichiers Figma partagés'
    }
  ];

  useEffect(() => {
    setPendingTasks(mockTasks);
  }, []);

  const headerStats = [
    { label: "En attente", value: pendingTasks.length.toString(), icon: Clock, color: "text-yellow-400" },
    { label: "Validées", value: "15", icon: CheckCircle, color: "text-green-400" },
    { label: "Rejetées", value: "2", icon: XCircle, color: "text-red-400" }
  ];

  const validateTask = (taskId, approved) => {
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
    // Logic pour validation
  };

  return (
    <PremiumLayout
      title="Validation des Tâches"
      subtitle="Administration et validation des tâches complétées"
      icon={Shield}
      showStats={true}
      stats={headerStats}
    >
      <div className="space-y-6">
        {pendingTasks.map((task) => (
          <PremiumCard key={task.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                <p className="text-gray-400 mb-2">Par {task.user}</p>
                <p className="text-gray-300 mb-4">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>XP réclamés: {task.xpClaimed}</span>
                  <span>Complété le: {task.completedAt.toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div className="mt-3 p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm"><strong>Preuve:</strong> {task.evidence}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-6">
                <PremiumButton
                  variant="secondary"
                  icon={Eye}
                  size="sm"
                >
                  Détails
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  icon={CheckCircle}
                  size="sm"
                  onClick={() => validateTask(task.id, true)}
                >
                  Valider
                </PremiumButton>
                <PremiumButton
                  variant="danger"
                  icon={XCircle}
                  size="sm"
                  onClick={() => validateTask(task.id, false)}
                >
                  Rejeter
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumLayout>
  );
};

export default AdminTaskValidationPage;

// ==========================================
// 📁 react-app/src/pages/AdminRolePermissionsPage.jsx
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users, Shield, Crown, Key, Save } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

const AdminRolePermissionsPage = () => {
  const [roles, setRoles] = useState([
    {
      id: 'admin',
      name: 'Administrateur',
      color: 'red',
      permissions: ['read', 'write', 'delete', 'admin', 'validate'],
      userCount: 2
    },
    {
      id: 'manager',
      name: 'Manager',
      color: 'blue',
      permissions: ['read', 'write', 'validate'],
      userCount: 5
    },
    {
      id: 'user',
      name: 'Utilisateur',
      color: 'green',
      permissions: ['read', 'write'],
      userCount: 25
    }
  ]);

  const permissions = [
    { id: 'read', name: 'Lecture', description: 'Consulter les données' },
    { id: 'write', name: 'Écriture', description: 'Créer et modifier' },
    { id: 'delete', name: 'Suppression', description: 'Supprimer des éléments' },
    { id: 'validate', name: 'Validation', description: 'Valider les tâches' },
    { id: 'admin', name: 'Administration', description: 'Gestion complète' }
  ];

  return (
    <PremiumLayout
      title="Rôles et Permissions"
      subtitle="Gestion des droits d'accès utilisateurs"
      icon={Lock}
      headerActions={
        <PremiumButton variant="primary" icon={Save}>
          Sauvegarder
        </PremiumButton>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <PremiumCard key={role.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Crown className={`w-6 h-6 mr-3 text-${role.color}-400`} />
                <div>
                  <h3 className="text-white font-semibold">{role.name}</h3>
                  <p className="text-gray-400 text-sm">{role.userCount} utilisateurs</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{permission.name}</span>
                    <p className="text-gray-400 text-sm">{permission.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={role.permissions.includes(permission.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    readOnly
                  />
                </div>
              ))}
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumLayout>
  );
};

export { AdminRolePermissionsPage };

// ==========================================
// 📁 react-app/src/pages/AdminUsersPage.jsx
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Shield, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Alice Martin',
      email: 'alice.martin@brain.com',
      role: 'Admin',
      status: 'active',
      lastLogin: new Date('2024-08-17'),
      joinDate: new Date('2024-01-15'),
      avatar: '👩‍💼'
    }
    // ... autres utilisateurs
  ]);

  const headerStats = [
    { label: "Total", value: users.length.toString(), icon: Users, color: "text-blue-400" },
    { label: "Actifs", value: users.filter(u => u.status === 'active').length.toString(), icon: UserCheck, color: "text-green-400" }
  ];

  return (
    <PremiumLayout
      title="Gestion Utilisateurs"
      subtitle="Administration des comptes utilisateurs"
      icon={UserCheck}
      showStats={true}
      stats={headerStats}
    >
      <div className="space-y-4">
        {users.map((user) => (
          <PremiumCard key={user.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{user.avatar}</div>
                <div>
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <p className="text-gray-400">{user.email}</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'Admin' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <PremiumButton variant="secondary" icon={Edit} size="sm">
                  Modifier
                </PremiumButton>
                <PremiumButton variant="danger" icon={Trash2} size="sm">
                  Supprimer
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumLayout>
  );
};

export { AdminUsersPage };

// ==========================================
// 📁 react-app/src/pages/AdminAnalyticsPage.jsx
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, Download, RefreshCw } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    users: { total: 32, active: 28, newThisWeek: 3 },
    tasks: { total: 156, completed: 142, completionRate: 91 },
    xp: { total: 15420, thisWeek: 2340, average: 482 }
  });

  const headerStats = [
    { label: "Utilisateurs", value: analytics.users.total.toString(), icon: Users, color: "text-blue-400" },
    { label: "Tâches", value: analytics.tasks.total.toString(), icon: Activity, color: "text-green-400" },
    { label: "XP Total", value: analytics.xp.total.toLocaleString(), icon: TrendingUp, color: "text-yellow-400" }
  ];

  return (
    <PremiumLayout
      title="Analytics Admin"
      subtitle="Tableau de bord administrateur avec métriques avancées"
      icon={BarChart3}
      headerActions={
        <div className="flex space-x-3">
          <PremiumButton variant="secondary" icon={Download}>
            Exporter
          </PremiumButton>
          <PremiumButton variant="primary" icon={RefreshCw}>
            Actualiser
          </PremiumButton>
        </div>
      }
      showStats={true}
      stats={headerStats}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">Utilisateurs</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">{analytics.users.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Actifs</span>
              <span className="text-green-400 font-medium">{analytics.users.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nouveaux (7j)</span>
              <span className="text-blue-400 font-medium">{analytics.users.newThisWeek}</span>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">Tâches</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">{analytics.tasks.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Complétées</span>
              <span className="text-green-400 font-medium">{analytics.tasks.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taux completion</span>
              <span className="text-purple-400 font-medium">{analytics.tasks.completionRate}%</span>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">Experience (XP)</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">{analytics.xp.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cette semaine</span>
              <span className="text-yellow-400 font-medium">{analytics.xp.thisWeek.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Moyenne/user</span>
              <span className="text-blue-400 font-medium">{analytics.xp.average}</span>
            </div>
          </div>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
};

export { AdminAnalyticsPage };

// ==========================================
// 📁 react-app/src/pages/AdminSettingsPage.jsx
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Database, Shield, Bell } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    system: {
      maintenance: false,
      registrationOpen: true,
      defaultXpReward: 10
    },
    notifications: {
      emailEnabled: true,
      slackIntegration: false
    }
  });

  return (
    <PremiumLayout
      title="Paramètres Admin"
      subtitle="Configuration système et paramètres globaux"
      icon={Settings}
      headerActions={
        <PremiumButton variant="primary" icon={Save}>
          Sauvegarder
        </PremiumButton>
      }
    >
      <div className="space-y-6">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-400" />
            Paramètres Système
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Mode maintenance</span>
                <p className="text-gray-400 text-sm">Désactiver l'accès utilisateur</p>
              </div>
              <input
                type="checkbox"
                checked={settings.system.maintenance}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                readOnly
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Inscription ouverte</span>
                <p className="text-gray-400 text-sm">Permettre les nouvelles inscriptions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.system.registrationOpen}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                XP par défaut par tâche
              </label>
              <input
                type="number"
                value={settings.system.defaultXpReward}
                className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-yellow-400" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Notifications email</span>
                <p className="text-gray-400 text-sm">Système de notifications par email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailEnabled}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                readOnly
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium">Intégration Slack</span>
                <p className="text-gray-400 text-sm">Notifications vers Slack</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.slackIntegration}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
};

export { AdminSettingsPage };

// ==========================================
// 📁 react-app/src/pages/CompleteAdminTestPage.jsx
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

const CompleteAdminTestPage = () => {
  const [testResults, setTestResults] = useState([
    { id: 1, name: 'Connexion Firebase', status: 'success', message: 'Connexion réussie' },
    { id: 2, name: 'Authentication', status: 'success', message: 'Auth service fonctionnel' },
    { id: 3, name: 'Database Read/Write', status: 'warning', message: 'Latence élevée détectée' },
    { id: 4, name: 'XP System', status: 'error', message: 'Erreur calcul niveau' }
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return null;
    }
  };

  const headerStats = [
    { label: "Tests", value: testResults.length.toString(), icon: TestTube, color: "text-blue-400" },
    { label: "Réussis", value: testResults.filter(t => t.status === 'success').length.toString(), icon: CheckCircle, color: "text-green-400" },
    { label: "Erreurs", value: testResults.filter(t => t.status === 'error').length.toString(), icon: XCircle, color: "text-red-400" }
  ];

  return (
    <PremiumLayout
      title="Tests Système"
      subtitle="Diagnostic complet de l'état du système"
      icon={TestTube}
      headerActions={
        <div className="flex space-x-3">
          <PremiumButton variant="secondary" icon={RefreshCw}>
            Relancer
          </PremiumButton>
          <PremiumButton variant="primary" icon={Play}>
            Nouveau Test
          </PremiumButton>
        </div>
      }
      showStats={true}
      stats={headerStats}
    >
      <div className="space-y-4">
        {testResults.map((test) => (
          <PremiumCard key={test.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="text-white font-semibold">{test.name}</h3>
                  <p className="text-gray-400 text-sm">{test.message}</p>
                </div>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                test.status === 'success' ? 'bg-green-500/20 text-green-400' :
                test.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {test.status.toUpperCase()}
              </span>
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumLayout>
  );
};

export default CompleteAdminTestPage;
