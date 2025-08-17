// ==========================================
// 📁 react-app/src/pages/AnalyticsPage.jsx
// ANALYTICS PAGE AVEC SYNCHRONISATION XP UNIFIÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users,
  Calendar,
  Star,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Zap,
  Trophy,
  Activity,
  CheckCircle2,
  AlertCircle,
  Gauge,
  PieChart,
  LineChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalTasks: 42,
      completedTasks: 38,
      productivity: 85,
      streakDays: 7
    },
    performance: {
      weeklyXp: 340,
      monthlyXp: 1250,
      totalXp: 3420
    },
    trends: {
      tasksCompletion: '+12%',
      productivityScore: '+8%',
      engagement: '+15%'
    }
  });

  const headerStats = [
    { 
      label: "Tâches complétées", 
      value: `${analyticsData.overview.completedTasks}/${analyticsData.overview.totalTasks}`, 
      icon: CheckCircle2, 
      color: "text-green-400" 
    },
    { 
      label: "Score productivité", 
      value: `${analyticsData.overview.productivity}%`, 
      icon: TrendingUp, 
      color: "text-blue-400" 
    },
    { 
      label: "XP cette semaine", 
      value: analyticsData.performance.weeklyXp.toLocaleString(), 
      icon: Star, 
      color: "text-yellow-400" 
    },
    { 
      label: "Série de connexions", 
      value: `${analyticsData.overview.streakDays} jours`, 
      icon: Activity, 
      color: "text-purple-400" 
    }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={Filter}>
        Filtrer
      </PremiumButton>
      <PremiumButton variant="secondary" icon={Download}>
        Exporter
      </PremiumButton>
      <PremiumButton variant="primary" icon={RefreshCw}>
        Actualiser
      </PremiumButton>
    </div>
  );

  const refreshData = () => {
    setLoading(true);
    // Simulation de rechargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <PremiumLayout
      title="Analytics"
      subtitle="Analyse de performance et statistiques personnelles"
      icon={BarChart3}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Filtres de période */}
      <div className="mb-6">
        <PremiumCard>
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Période d'analyse
            </h3>
            <div className="flex space-x-2">
              {['week', 'month', 'quarter'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === period
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {period === 'week' ? '7 jours' : period === 'month' ? '30 jours' : '3 mois'}
                </button>
              ))}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Graphiques et métriques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Progression des tâches */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-semibold flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-green-400" />
              Progression des tâches
            </h3>
            <div className="flex items-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{analyticsData.trends.tasksCompletion}</span>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Tâches complétées</span>
              <span className="text-white font-medium">
                {analyticsData.overview.completedTasks}/{analyticsData.overview.totalTasks}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(analyticsData.overview.completedTasks / analyticsData.overview.totalTasks) * 100}%` 
                }}
              />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-white">
                {Math.round((analyticsData.overview.completedTasks / analyticsData.overview.totalTasks) * 100)}%
              </span>
              <p className="text-gray-400 text-sm">Taux de completion</p>
            </div>
          </div>
        </PremiumCard>

        {/* Evolution XP */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-semibold flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-yellow-400" />
              Évolution XP
            </h3>
            <div className="flex items-center text-yellow-400">
              <Star className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">XP Total: {analyticsData.performance.totalXp}</span>
            </div>
          </div>
          
          {/* Graphique simulé */}
          <div className="space-y-4">
            <div className="h-32 bg-gray-800 rounded-lg flex items-end justify-center p-4">
              <div className="flex items-end gap-2 h-full w-full max-w-sm">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t flex-1"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-yellow-400 font-bold">{analyticsData.performance.weeklyXp}</p>
                <p className="text-gray-400 text-xs">Cette semaine</p>
              </div>
              <div>
                <p className="text-yellow-400 font-bold">{analyticsData.performance.monthlyXp}</p>
                <p className="text-gray-400 text-xs">Ce mois</p>
              </div>
              <div>
                <p className="text-yellow-400 font-bold">{analyticsData.performance.totalXp}</p>
                <p className="text-gray-400 text-xs">Total</p>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score de productivité */}
        <PremiumCard>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="w-20 h-20 rounded-full border-4 border-gray-700 flex items-center justify-center">
                <div className="text-2xl font-bold text-white">
                  {analyticsData.overview.productivity}
                </div>
              </div>
              <div 
                className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent transform -rotate-90"
                style={{
                  background: `conic-gradient(from 0deg, #3b82f6 ${analyticsData.overview.productivity * 3.6}deg, transparent 0deg)`
                }}
              />
            </div>
            <h3 className="text-white font-semibold mb-1">Score de productivité</h3>
            <p className="text-gray-400 text-sm">
              {analyticsData.overview.productivity >= 80 ? 'Excellent' : 
               analyticsData.overview.productivity >= 60 ? 'Bon' : 'À améliorer'}
            </p>
          </div>
        </PremiumCard>

        {/* Série de connexions */}
        <PremiumCard>
          <div className="text-center">
            <Activity className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-1">
              {analyticsData.overview.streakDays}
            </h3>
            <p className="text-gray-400 text-sm mb-2">Jours consécutifs</p>
            <div className="flex items-center justify-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">Série active</span>
            </div>
          </div>
        </PremiumCard>

        {/* Tendances */}
        <PremiumCard>
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Tendances
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Completion tâches</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="w-3 h-3 mr-1" />
                <span className="text-sm font-medium">{analyticsData.trends.tasksCompletion}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Productivité</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="w-3 h-3 mr-1" />
                <span className="text-sm font-medium">{analyticsData.trends.productivityScore}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Engagement</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="w-3 h-3 mr-1" />
                <span className="text-sm font-medium">{analyticsData.trends.engagement}</span>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
};

export default AnalyticsPage;
