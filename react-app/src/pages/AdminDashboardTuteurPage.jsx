// ==========================================
// 📁 react-app/src/pages/AdminDashboardTuteurPage.jsx
// DASHBOARD TUTEUR AVEC VRAIES DONNÉES FIREBASE - VERSION CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BarChart3, 
  Users, 
  CheckCircle, 
  Monitor, 
  Activity,
  Cpu,
  AlertCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 👨‍🏫 DASHBOARD TUTEUR AVEC VRAIES DONNÉES
 * Panel de supervision pour les tuteurs/administrateurs
 */
const AdminDashboardTuteurPage = () => {
  const { user } = useAuthStore();
  
  const [systemData, setSystemData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    pendingValidations: 0,
    completedTasks: 0,
    totalProjects: 0,
    totalBadges: 0,
    recentActivity: []
  });
  
  const [systemHealth, setSystemHealth] = useState({
    firebase: 'healthy',
    netlify: 'healthy',
    authentication: 'healthy',
    database: 'healthy'
  });
  
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Charger les vraies données au montage
  useEffect(() => {
    loadRealSystemData();
  }, []);

  /**
   * 📊 CHARGER LES VRAIES DONNÉES FIREBASE
   */
  const loadRealSystemData = async () => {
    setLoading(true);
    try {
      console.log('📊 Chargement des données système réelles...');
      
      // Paralléliser les requêtes pour optimiser les performances
      const [
        usersSnapshot,
        tasksSnapshot,
        projectsSnapshot,
        validationsSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'tasks')),
        getDocs(collection(db, 'projects')),
        getDocs(query(
          collection(db, 'taskValidations'),
          where('status', '==', 'pending')
        ))
      ]);

      // Calculer les utilisateurs actifs (connectés dans les 7 derniers jours)
      const activeThreshold = new Date();
      activeThreshold.setDate(activeThreshold.getDate() - 7);
      
      let activeUsersCount = 0;
      let completedTasksCount = 0;
      const recentActivities = [];

      // Analyser les utilisateurs
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.lastLogin && userData.lastLogin.toDate() > activeThreshold) {
          activeUsersCount++;
        }
      });

      // Analyser les tâches
      tasksSnapshot.forEach(doc => {
        const taskData = doc.data();
        if (taskData.status === 'completed') {
          completedTasksCount++;
        }
        
        // Ajouter aux activités récentes si récent
        if (taskData.updatedAt && taskData.updatedAt.toDate() > activeThreshold) {
          recentActivities.push({
            id: doc.id,
            type: 'task',
            message: `Tâche "${taskData.title}" mise à jour`,
            timestamp: taskData.updatedAt.toDate(),
            priority: taskData.priority || 'low'
          });
        }
      });

      // Ajouter les validations en attente aux activités
      validationsSnapshot.forEach(doc => {
        const validationData = doc.data();
        recentActivities.push({
          id: doc.id,
          type: 'validation',
          message: `Validation en attente pour "${validationData.taskTitle || 'Tâche'}"`,
          timestamp: validationData.createdAt.toDate(),
          priority: 'high'
        });
      });

      // Trier les activités par date décroissante
      recentActivities.sort((a, b) => b.timestamp - a.timestamp);

      // Mettre à jour l'état
      setSystemData({
        totalUsers: usersSnapshot.size,
        activeUsers: activeUsersCount,
        totalTasks: tasksSnapshot.size,
        pendingValidations: validationsSnapshot.size,
        completedTasks: completedTasksCount,
        totalProjects: projectsSnapshot.size,
        totalBadges: 12, // Nombre fixe pour l'instant
        recentActivity: recentActivities.slice(0, 10) // Garder seulement les 10 plus récentes
      });

      // Vérifier la santé du système
      setSystemHealth({
        firebase: 'healthy',
        netlify: 'healthy',
        authentication: user ? 'healthy' : 'warning',
        database: usersSnapshot.size > 0 ? 'healthy' : 'warning'
      });

      setLastUpdate(new Date());
      console.log('✅ Données système chargées avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setSystemHealth(prev => ({
        ...prev,
        database: 'error',
        firebase: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 RECHARGER LES DONNÉES
   */
  const refreshData = () => {
    loadRealSystemData();
  };

  // Composant Carte Métrique
  const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-700">{title}</h3>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 
            'text-green-600' : 'text-red-600'}`}>
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

  // Composant Activité
  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'validation': return FileCheck;
        case 'task': return Target;
        case 'user': return Users;
        default: return Activity;
      }
    };

    const Icon = getActivityIcon(activity.type);
    const timeAgo = new Date() - activity.timestamp;
    const minutesAgo = Math.floor(timeAgo / (1000 * 60));
    const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
    
    const timeString = hoursAgo > 0 
      ? `il y a ${hoursAgo}h`
      : `il y a ${minutesAgo}min`;

    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        activity.priority === 'high' ? 'bg-red-50' :
        activity.priority === 'medium' ? 'bg-blue-50' : 'bg-gray-50'
      }`}>
        <Icon className={`w-5 h-5 ${
          activity.priority === 'high' ? 'text-red-600' :
          activity.priority === 'medium' ? 'text-blue-600' : 'text-gray-600'
        }`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-600">{timeString}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Tuteur</h1>
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
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Tuteur</h1>
            <p className="text-gray-600">
              Supervision et gestion • Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Utilisateurs Totaux"
          value={systemData.totalUsers}
          icon={Users}
          color="bg-blue-600"
          subtitle={`${systemData.activeUsers} actifs`}
        />
        
        <MetricCard
          title="Tâches Totales"
          value={systemData.totalTasks}
          icon={Target}
          color="bg-green-600"
          subtitle={`${systemData.completedTasks} terminées`}
        />
        
        <MetricCard
          title="Validations En Attente"
          value={systemData.pendingValidations}
          icon={Clock}
          color="bg-orange-600"
          subtitle="Nécessitent attention"
        />
        
        <MetricCard
          title="Projets Actifs"
          value={systemData.totalProjects}
          icon={Monitor}
          color="bg-purple-600"
          subtitle="En cours"
        />
      </div>

      {/* Santé du système */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-blue-600" />
          État du Système
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(systemHealth).map(([service, status]) => (
            <div key={service} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                status === 'healthy' ? 'bg-green-500' :
                status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="font-medium text-gray-900 capitalize">{service}</p>
                <p className={`text-xs ${
                  status === 'healthy' ? 'text-green-600' :
                  status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {status === 'healthy' ? 'Opérationnel' :
                   status === 'warning' ? 'Attention' : 'Erreur'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Activité Récente
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {systemData.recentActivity.length > 0 ? (
              systemData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            Actions Rapides
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <FileCheck className="w-6 h-6 text-orange-600" />
              <span className="text-sm">Validations</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Utilisateurs</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Award className="w-6 h-6 text-yellow-600" />
              <span className="text-sm">Badges</span>
            </button>
            
            <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTuteurPage;
