// ==========================================
// react-app/src/components/analytics/ManagerAnalyticsDashboard.jsx
// DASHBOARD ANALYTICS MANAGER - SYNERGIA v4.0
// Graphiques, prédictions et alertes
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Target, Clock,
  AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronRight,
  Zap, Award, Calendar, Activity, ArrowUp, ArrowDown, Minus,
  Bell, Eye, Filter, Download
} from 'lucide-react';
import { managerAnalyticsService, ALERT_TYPES } from '../../core/services/managerAnalyticsService.js';

// ==========================================
// COMPOSANT GRAPHIQUE BARRES SIMPLE
// ==========================================

const SimpleBarChart = ({ data, maxValue, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500'
  };

  return (
    <div className="flex items-end justify-between gap-1 h-32">
      {data.map((item, index) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`w-full bg-gradient-to-t ${colors[color]} rounded-t-lg min-h-[4px]`}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// COMPOSANT GRAPHIQUE CIRCULAIRE
// ==========================================

const DonutChart = ({ data, total }) => {
  const colors = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'];
  let cumulativePercent = 0;

  const segments = data.map((item, index) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    return {
      ...item,
      percent,
      startPercent,
      color: colors[index % colors.length]
    };
  });

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        {segments.map((segment, index) => (
          <circle
            key={index}
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            stroke={segment.color}
            strokeWidth="3"
            strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
            strokeDashoffset={-segment.startPercent}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{total}</span>
        <span className="text-xs text-gray-400">tâches</span>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT CARTE STAT
// ==========================================

const StatCard = ({ title, value, icon: Icon, color, trend, subValue }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-pink-500'
  };

  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 text-white`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 opacity-80" />
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor} bg-white/20 px-2 py-0.5 rounded-full text-xs`}>
            <TrendIcon className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
      {subValue && <div className="text-xs opacity-60 mt-1">{subValue}</div>}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT CARTE EMPLOYÉ
// ==========================================

const EmployeeCard = ({ employee, rank }) => {
  const TrendIcon = employee.trend === 'up' ? TrendingUp :
                    employee.trend === 'down' ? TrendingDown : Minus;
  const trendColor = employee.trend === 'up' ? 'text-green-400' :
                     employee.trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
    >
      {/* Rang */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        rank === 0 ? 'bg-amber-500 text-white' :
        rank === 1 ? 'bg-gray-400 text-white' :
        rank === 2 ? 'bg-orange-600 text-white' :
        'bg-white/10 text-gray-400'
      }`}>
        {rank + 1}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
        {employee.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{employee.name}</div>
        <div className="text-xs text-gray-400">
          Niveau {employee.level} • {employee.completedTasks} tâches
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="text-lg font-bold text-purple-400">{employee.productivityScore}</div>
        <div className={`flex items-center justify-end gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{employee.completionRate}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT ALERTE
// ==========================================

const AlertCard = ({ alert }) => {
  const severityColors = {
    high: 'border-red-500 bg-red-500/10',
    medium: 'border-orange-500 bg-orange-500/10',
    low: 'border-blue-500 bg-blue-500/10',
    positive: 'border-green-500 bg-green-500/10'
  };

  const severityTextColors = {
    high: 'text-red-400',
    medium: 'text-orange-400',
    low: 'text-blue-400',
    positive: 'text-green-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-xl border ${severityColors[alert.severity]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{alert.type.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${severityTextColors[alert.severity]}`}>
            {alert.type.label}
          </div>
          <div className="text-sm text-gray-400 mt-0.5">{alert.message}</div>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT PRÉDICTION CHARGE
// ==========================================

const WorkloadPrediction = ({ predictions }) => {
  const levelColors = {
    low: 'bg-green-500',
    medium: 'bg-orange-500',
    high: 'bg-red-500'
  };

  return (
    <div className="space-y-2">
      {predictions.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
        >
          <div className="w-16 text-sm text-gray-400">{day.label}</div>
          <div className="flex-1">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(day.estimatedHours / 10 * 100, 100)}%` }}
                className={`h-full ${levelColors[day.workloadLevel]} rounded-full`}
              />
            </div>
          </div>
          <div className="w-20 text-right">
            <span className="text-sm font-medium text-white">{day.tasksCount}</span>
            <span className="text-xs text-gray-500 ml-1">tâches</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${levelColors[day.workloadLevel]}`} />
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const ManagerAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [tasksDistribution, setTasksDistribution] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, employees, alerts

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        metricsData,
        employeesData,
        weeklyDataResult,
        distributionData,
        predictionsData,
        alertsData
      ] = await Promise.all([
        managerAnalyticsService.getTeamMetrics(),
        managerAnalyticsService.getEmployeeProductivity(),
        managerAnalyticsService.getWeeklyProductivityData(),
        managerAnalyticsService.getTasksDistribution(),
        managerAnalyticsService.predictWorkload(),
        managerAnalyticsService.generateAlerts()
      ]);

      setMetrics(metricsData);
      setEmployees(employeesData);
      setWeeklyData(weeklyDataResult);
      setTasksDistribution(distributionData);
      setPredictions(predictionsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  const chartData = weeklyData.map(w => ({
    label: w.label,
    value: w.tasksCompleted
  }));
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  const donutData = tasksDistribution ? [
    { label: 'Terminées', value: tasksDistribution.completed },
    { label: 'En cours', value: tasksDistribution.inProgress },
    { label: 'En attente', value: tasksDistribution.pending },
    { label: 'En retard', value: tasksDistribution.overdue }
  ] : [];

  const totalTasks = donutData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-xl">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard Manager</h2>
            <p className="text-gray-400 text-sm">Analytics et alertes équipe</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={loadAllData}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
          { id: 'employees', label: 'Équipe', icon: Users },
          { id: 'alerts', label: `Alertes (${alerts.length})`, icon: Bell }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu selon l'onglet */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats principales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                title="Utilisateurs actifs"
                value={metrics?.activeUsers || 0}
                icon={Users}
                color="purple"
                subValue={`sur ${metrics?.totalUsers || 0} total`}
              />
              <StatCard
                title="Tâches complétées"
                value={metrics?.completedTasks || 0}
                icon={CheckCircle}
                color="green"
                trend="up"
              />
              <StatCard
                title="Taux complétion"
                value={`${metrics?.completionRate || 0}%`}
                icon={Target}
                color="blue"
              />
              <StatCard
                title="XP Total équipe"
                value={metrics?.totalXP?.toLocaleString() || 0}
                icon={Zap}
                color="orange"
                subValue={`Moy: ${metrics?.averageXP || 0}/user`}
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivité hebdomadaire */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Productivité hebdomadaire
                </h3>
                <SimpleBarChart data={chartData} maxValue={maxChartValue} color="purple" />
              </div>

              {/* Répartition des tâches */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Répartition des tâches
                </h3>
                <div className="flex items-center justify-around">
                  <DonutChart data={donutData} total={totalTasks} />
                  <div className="space-y-2">
                    {donutData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-purple-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prédiction charge de travail */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prédiction de charge (7 jours)
              </h3>
              <WorkloadPrediction predictions={predictions} />
            </div>
          </motion.div>
        )}

        {activeTab === 'employees' && (
          <motion.div
            key="employees"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Classement productivité
            </h3>
            <div className="space-y-2">
              {employees.slice(0, 10).map((employee, index) => (
                <EmployeeCard key={employee.id} employee={employee} rank={index} />
              ))}
              {employees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun employé trouvé
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {alerts.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Tout va bien !</h3>
                <p className="text-gray-400">Aucune alerte à signaler</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerAnalyticsDashboard;
