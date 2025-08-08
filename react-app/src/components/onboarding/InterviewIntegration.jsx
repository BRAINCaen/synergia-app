// ==========================================
// 📁 react-app/src/components/onboarding/InterviewIntegration.jsx
// COMPOSANT D'INTÉGRATION POUR L'ONGLET ENTRETIENS - MISE À JOUR
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Crown,
  UserCheck,
  RefreshCw,
  User
} from 'lucide-react';

import EntretiensReferent from './EntretiensReferent.jsx';
import InterviewService from '../../core/services/interviewService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🎯 COMPOSANT PRINCIPAL D'INTÉGRATION DES ENTRETIENS
 */
const InterviewIntegration = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullInterface, setShowFullInterface] = useState(false);

  // 📊 Charger les statistiques au montage
  useEffect(() => {
    loadStats();
  }, [user?.uid]);

  const loadStats = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await InterviewService.getInterviewStats(user.uid, '30days');
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  // Affichage complet si demandé
  if (showFullInterface) {
    return (
      <div className="space-y-6">
        {/* Bouton retour */}
        <button
          onClick={() => setShowFullInterface(false)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Retour à l'aperçu
        </button>
        
        {/* Interface complète */}
        <EntretiensReferent />
      </div>
    );
  }

  // Interface d'aperçu par défaut
  return (
    <div className="space-y-6">
      {/* 📊 En-tête avec statistiques */}
      <InterviewOverview 
        stats={stats} 
        onOpenFullInterface={() => setShowFullInterface(true)}
        onRefresh={loadStats}
      />
      
      {/* 🎯 Actions rapides */}
      <QuickActions 
        stats={stats}
        onOpenFullInterface={() => setShowFullInterface(true)}
      />
      
      {/* 📅 Prochains entretiens */}
      {stats?.upcoming && stats.upcoming.length > 0 && (
        <UpcomingInterviews 
          interviews={stats.upcoming}
          onOpenFullInterface={() => setShowFullInterface(true)}
        />
      )}
    </div>
  );
};

/**
 * 📊 COMPOSANT APERÇU DES ENTRETIENS
 */
const InterviewOverview = ({ stats, onOpenFullInterface, onRefresh }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Système d'Entretiens</h3>
            <p className="text-gray-400">Suivi personnalisé et entretiens Game Master</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </button>
          
          <button
            onClick={onOpenFullInterface}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            Ouvrir l'interface complète
          </button>
        </div>
      </div>

      {/* Statistiques en grille */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          title="Total"
          value={stats?.total || 0}
          color="blue"
        />
        <StatCard
          icon={Clock}
          title="Planifiés"
          value={stats?.planned || 0}
          color="orange"
        />
        <StatCard
          icon={CheckCircle}
          title="Terminés"
          value={stats?.completed || 0}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Taux réussite"
          value={`${stats?.completionRate || 0}%`}
          color="purple"
        />
      </div>

      {/* Répartition par type */}
      {stats && (stats.integration > 0 || stats.gamemaster > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-4">Répartition par type</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
              <UserCheck className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">{stats.integration}</p>
                <p className="text-blue-300 text-sm">Intégration</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <Crown className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">{stats.gamemaster}</p>
                <p className="text-yellow-300 text-sm">Game Master</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 🎯 COMPOSANT ACTIONS RAPIDES
 */
const QuickActions = ({ stats, onOpenFullInterface }) => {
  const actions = [
    {
      id: 'schedule_integration',
      title: 'Entretien d\'Intégration',
      description: 'Pour nouveaux employés',
      icon: UserCheck,
      color: 'from-blue-500 to-cyan-500',
      action: () => onOpenFullInterface()
    },
    {
      id: 'schedule_gamemaster',
      title: 'Entretien Game Master', 
      description: 'Pour employés expérimentés',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      action: () => onOpenFullInterface()
    },
    {
      id: 'view_history',
      title: 'Historique Complet',
      description: 'Voir tous les entretiens',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      action: () => onOpenFullInterface()
    }
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white">🚀 Actions Rapides</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={action.action}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h5 className="font-medium text-white">{action.title}</h5>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 📅 COMPOSANT PROCHAINS ENTRETIENS
 */
const UpcomingInterviews = ({ interviews, onOpenFullInterface }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">📅 Prochains Entretiens</h4>
        <button
          onClick={onOpenFullInterface}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          Voir tous →
        </button>
      </div>

      <div className="space-y-3">
        {interviews.slice(0, 3).map((interview) => (
          <div
            key={interview.id}
            className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-400" />
            </div>
            
            <div className="flex-1">
              <h5 className="font-medium text-white text-sm">{interview.title}</h5>
              <p className="text-gray-400 text-xs">
                {new Date(`${interview.date}T${interview.time}`).toLocaleDateString('fr-FR')} à {interview.time}
              </p>
              {interview.participantIds && interview.participantIds.length > 0 && (
                <p className="text-gray-500 text-xs">
                  👥 {interview.participantIds.length} participant(s)
                </p>
              )}
            </div>
            
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              {interview.templateName}
            </span>
          </div>
        ))}

        {interviews.length > 3 && (
          <div className="text-center pt-2">
            <button
              onClick={onOpenFullInterface}
              className="text-gray-400 hover:text-white text-sm"
            >
              +{interviews.length - 3} autres entretiens
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 📊 COMPOSANT CARTE STATISTIQUE
 */
const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    orange: 'text-orange-400', 
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400'
  };

  return (
    <div className="text-center p-4 bg-gray-700/30 rounded-lg">
      <Icon className={`h-6 w-6 mx-auto mb-2 ${colorClasses[color]}`} />
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-xs text-gray-400">{title}</div>
    </div>
  );
};

/**
 * 🔔 COMPOSANT NOTIFICATIONS ENTRETIENS
 */
export const InterviewNotifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Charger les notifications d'entretiens
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      // Récupérer les entretiens à venir dans les 7 prochains jours
      const result = await InterviewService.getUserInterviews(userId, { status: 'planned' });
      if (result.success) {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingInterviews = result.data.filter(interview => {
          const interviewDate = new Date(`${interview.date}T${interview.time}`);
          return interviewDate >= now && interviewDate <= nextWeek;
        });

        setNotifications(upcomingInterviews);
      }
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-orange-300">Entretiens à venir</h4>
          <div className="mt-2 space-y-1">
            {notifications.map(interview => (
              <p key={interview.id} className="text-orange-200 text-sm">
                • {interview.title} - {new Date(`${interview.date}T${interview.time}`).toLocaleDateString('fr-FR')} à {interview.time}
                {interview.participantIds && interview.participantIds.length > 0 && (
                  <span className="text-orange-300"> ({interview.participantIds.length} participant(s))</span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewIntegration;
