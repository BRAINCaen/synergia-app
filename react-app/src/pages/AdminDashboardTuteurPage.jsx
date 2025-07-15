// ==========================================
// 📁 react-app/src/pages/AdminDashboardTuteurPage.jsx
// DASHBOARD TUTEUR AVEC VRAIES DONNÉES FIREBASE
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
        usersData,
        tasksData,
        validationsData,
        projectsData,
        badgesData,
        activityData
      ] = await Promise.all([
        loadUsersData(),
        loadTasksData(), 
        loadValidationsData(),
        loadProjectsData(),
        loadBadgesData(),
        loadRecentActivity()
      ]);

      setSystemData({
        totalUsers: usersData.total,
        activeUsers: usersData.active,
        totalTasks: tasksData.total,
        pendingValidations: validationsData.pending,
        completedTasks: tasksData.completed,
        totalProjects: projectsData.total,
        totalBadges: badgesData.total,
        recentActivity: activityData
      });

      // Vérifier la santé du système
      checkSystemHealth();
      
      setLastUpdate(new Date());
      console.log('✅ Données système chargées avec succès');
      
    } catch (error) {
      console.error('❌ Erreur chargement données système:', error);
      checkSystemHealth(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 👥 CHARGER LES DONNÉES UTILISATEURS
   */
  const loadUsersData = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let total = 0;
      let active = 0;
      const now = Date.now();
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      snapshot.forEach((doc) => {
        total++;
        const userData = doc.data();
        
        // Considérer comme actif si connecté dans les 7 derniers jours
        if (userData.lastLoginDate && userData.lastLoginDate.toMillis && 
            userData.lastLoginDate.toMillis() > weekAgo) {
          active++;
        }
      });
      
      return { total, active };
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      return { total: 0, active: 0 };
    }
  };

  /**
   * ✅ CHARGER LES DONNÉES TÂCHES
   */
  const loadTasksData = async () => {
    try {
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      
      let total = 0;
      let completed = 0;
      
      snapshot.forEach((doc) => {
        total++;
        const taskData = doc.data();
        if (taskData.status === 'completed' || taskData.status === 'done') {
          completed++;
        }
      });
      
      return { total, completed };
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      return { total: 0, completed: 0 };
    }
  };

  /**
   * 🛡️ CHARGER LES VALIDATIONS EN ATTENTE
   */
  const loadValidationsData = async () => {
    try {
      const validationsRef = collection(db, 'task_validations');
      const pendingQuery = query(validationsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(pendingQuery);
      
      return { pending: snapshot.size };
    } catch (error) {
      console.error('❌ Erreur chargement validations:', error);
      return { pending: 0 };
    }
  };

  /**
   * 📁 CHARGER LES DONNÉES PROJETS
   */
  const loadProjectsData = async () => {
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      
      return { total: snapshot.size };
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
      return { total: 0 };
    }
  };

  /**
   * 🏆 CHARGER LES DONNÉES BADGES
   */
  const loadBadgesData = async () => {
    try {
      const badgesRef = collection(db, 'badges');
      const snapshot = await getDocs(badgesRef);
      
      return { total: snapshot.size };
    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
      return { total: 0 };
    }
  };

  /**
   * 📈 CHARGER L'ACTIVITÉ RÉCENTE
   */
  const loadRecentActivity = async () => {
    try {
      const activities = [];
      
      // Récupérer les validations récentes
      const validationsRef = collection(db, 'task_validations');
      const recentValidations = query(
        validationsRef, 
        orderBy('submittedAt', 'desc'), 
        limit(5)
      );
      const validationsSnapshot = await getDocs(recentValidations);
      
      validationsSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'validation',
          message: `Nouvelle validation de tâche: ${data.taskTitle}`,
          timestamp: data.submittedAt?.toDate() || new Date(),
          priority: 'high'
        });
      });
      
      // Récupérer les tâches récemment créées
      const tasksRef = collection(db, 'tasks');
      const recentTasks = query(
        tasksRef,
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const tasksSnapshot = await getDocs(recentTasks);
      
      tasksSnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'task',
          message: `Nouvelle tâche créée: ${data.title}`,
          timestamp: data.createdAt?.toDate() || new Date(),
          priority: 'medium'
        });
      });
      
      // Trier par date décroissante
      activities.sort((a, b) => b.timestamp - a.timestamp);
      
      return activities.slice(0, 6); // Garder les 6 plus récentes
      
    } catch (error) {
      console.error('❌ Erreur chargement activité récente:', error);
      return [];
    }
  };

  /**
   * 🔍 VÉRIFIER LA SANTÉ DU SYSTÈME
   */
  const checkSystemHealth = (firebaseOk = true) => {
    setSystemHealth({
      firebase: firebaseOk ? 'healthy' : 'error',
      netlify: 'healthy', // Présumé sain si l'app tourne
      authentication: user ? 'healthy' : 'warning',
      database: firebaseOk ? 'healthy' : 'error'
    });
  };

  // Composant Status Badge
  const StatusBadge = ({ status, label }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'healthy':
          return { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle, text: 'OK' };
        case 'warning':
          return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertCircle, text: 'Attention' };
        case 'error':
          return { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, text: 'Erreur' };
        default:
          return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: AlertCircle, text: 'Inconnu' };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs px-2 py-1 rounded font-semibold">
          {config.text}
        </span>
      </div>
    );
  };

  // Composant Metric Card
  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${color}-50 rounded-lg`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
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
            <p className="text-gray-600">Supervision et monitoring de Synergia</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Mise à jour: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={loadRealSystemData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* État du Système */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-green-600" />
          État du Système
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusBadge status={systemHealth.firebase} label="Firebase" />
          <StatusBadge status={systemHealth.netlify} label="Netlify" />
          <StatusBadge status={systemHealth.authentication} label="Authentification" />
          <StatusBadge status={systemHealth.database} label="Base de données" />
        </div>
      </div>

      {/* Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Utilisateurs"
          value={systemData.totalUsers}
          subtitle={`${systemData.activeUsers} actifs cette semaine`}
          icon={Users}
          color="blue"
        />
        
        <MetricCard
          title="Tâches"
          value={systemData.totalTasks}
          subtitle={`${systemData.completedTasks} terminées`}
          icon={Target}
          color="green"
        />
        
        <MetricCard
          title="Validations"
          value={systemData.pendingValidations}
          subtitle="En attente"
          icon={FileCheck}
          color="orange"
        />
        
        <MetricCard
          title="Projets"
          value={systemData.totalProjects}
          subtitle="Projets actifs"
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Activité Récente et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Activité Récente
          </h3>
          
          <div className="space-y-3">
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
