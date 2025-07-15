// ==========================================
// 📁 react-app/src/pages/AdminDashboardManagerPage.jsx
// PAGE ADMIN DASHBOARD MANAGER - NOUVELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  Users, 
  Settings, 
  Monitor, 
  Database,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock
} from 'lucide-react';

/**
 * 🎛️ PAGE ADMIN DASHBOARD MANAGER
 * Panel central de contrôle pour les administrateurs
 */
const AdminDashboardManagerPage = () => {
  const [systemStatus, setSystemStatus] = useState({
    firebase: 'healthy',
    netlify: 'healthy',
    users: 'healthy',
    tasks: 'warning'
  });
  
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingValidations: 0,
    systemUptime: '99.9%',
    responseTime: '145ms'
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simuler le chargement des données admin
  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées pour la démo
      setMetrics({
        totalUsers: 47,
        activeTasks: 128,
        completedTasks: 892,
        pendingValidations: 12,
        systemUptime: '99.9%',
        responseTime: '145ms'
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Composant Status Badge
  const StatusBadge = ({ status, label }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'healthy':
          return { color: 'green', icon: CheckCircle, text: 'Opérationnel' };
        case 'warning':
          return { color: 'yellow', icon: AlertCircle, text: 'Attention' };
        case 'error':
          return { color: 'red', icon: XCircle, text: 'Problème' };
        default:
          return { color: 'gray', icon: AlertCircle, text: 'Inconnu' };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-${config.color}-50 border border-${config.color}-200`}>
        <Icon className={`w-4 h-4 text-${config.color}-600`} />
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs px-2 py-1 rounded bg-${config.color}-100 text-${config.color}-700`}>
          {config.text}
        </span>
      </div>
    );
  };

  // Composant Metric Card
  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Manager</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Manager</h1>
            <p className="text-gray-600">Panel de contrôle système et métriques</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={loadSystemData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Status System */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-green-600" />
          État du Système
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusBadge status={systemStatus.firebase} label="Firebase" />
          <StatusBadge status={systemStatus.netlify} label="Netlify" />
          <StatusBadge status={systemStatus.users} label="Utilisateurs" />
          <StatusBadge status={systemStatus.tasks} label="Tâches" />
        </div>
      </div>

      {/* Métriques Clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Utilisateurs Totaux"
          value={metrics.totalUsers}
          subtitle="Comptes actifs"
          icon={Users}
          trend={12}
        />
        
        <MetricCard
          title="Tâches Actives"
          value={metrics.activeTasks}
          subtitle="En cours"
          icon={Activity}
          trend={-3}
        />
        
        <MetricCard
          title="Tâches Terminées"
          value={metrics.completedTasks}
          subtitle="Ce mois-ci"
          icon={CheckCircle}
          trend={8}
        />
        
        <MetricCard
          title="Validations en Attente"
          value={metrics.pendingValidations}
          subtitle="Nécessitent une action"
          icon={Clock}
          trend={-15}
        />
      </div>

      {/* Performance Système */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Temps de réponse</span>
              <span className="font-semibold text-green-600">{metrics.responseTime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Disponibilité</span>
              <span className="font-semibold text-green-600">{metrics.systemUptime}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Charge serveur</span>
              <span className="font-semibold text-yellow-600">Modérée</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Activité Récente
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Nouvelle tâche validée</p>
                <p className="text-xs text-gray-600">Il y a 2 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Nouvel utilisateur inscrit</p>
                <p className="text-xs text-gray-600">Il y a 15 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Tâche nécessite validation</p>
                <p className="text-xs text-gray-600">Il y a 30 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Actions Rapides
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-sm">Utilisateurs</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Activity className="w-6 h-6 text-green-600" />
            <span className="text-sm">Tâches</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span className="text-sm">Analytics</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Database className="w-6 h-6 text-red-600" />
            <span className="text-sm">Base de données</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Wifi className="w-6 h-6 text-orange-600" />
            <span className="text-sm">Connectivité</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-6 h-6 text-gray-600" />
            <span className="text-sm">Paramètres</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardManagerPage;
