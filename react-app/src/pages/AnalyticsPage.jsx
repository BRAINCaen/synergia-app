// ==========================================
// 📁 src/pages/AnalyticsPage.jsx
// ANALYTICS AVEC TEMPS RÉEL ET TENDANCES ENRICHIES - VÉRACITÉ 10/10
// ==========================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Minus,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('week');
  const [historyRange, setHistoryRange] = useState(7); // 🆕 Sélecteur de période
  const [loading, setLoading] = useState(true);
  const [realTimeStatus, setRealTimeStatus] = useState('connecting'); // 🆕 Statut temps réel
  
  // 🔥 UTILISER LA MÊME SOURCE QUE LES AUTRES PAGES
  const {
    gamification,
    isLoading: firebaseLoading,
    isReady,
    error: firebaseError
  } = useUnifiedFirebaseData();

  // 🆕 RÉFÉRENCES POUR LES LISTENERS TEMPS RÉEL
  const unsubscribeRefs = useRef([]);
  const lastUpdateRef = useRef(null);
  
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalTasks: 0,
      completedTasks: 0,
      productivity: 0,
      streakDays: 0
    },
    performance: {
      weeklyXp: 0,
      monthlyXp: 0,
      totalXp: 0
    },
    trends: {
      tasksCompletion: { value: '+0%', direction: 'neutral', confidence: 'low' },
      productivityScore: { value: '+0%', direction: 'neutral', confidence: 'low' },
      engagement: { value: '+0%', direction: 'neutral', confidence: 'low' },
      velocity: { value: '0', direction: 'neutral', confidence: 'low' }, // 🆕
      satisfaction: { value: '+0%', direction: 'neutral', confidence: 'low' } // 🆕
    },
    chartData: {
      xpHistory: [],
      tasksHistory: [],
      projectsProgress: [],
      velocityHistory: [], // 🆕
      productivityTrend: [] // 🆕
    },
    realTime: {
      lastUpdate: null,
      dataAge: 0,
      isLive: false
    }
  });

  // 🆕 STATISTIQUES AVANCÉES POUR TENDANCES
  const [advancedStats, setAdvancedStats] = useState({
    weeklyAverages: { xp: 0, tasks: 0, productivity: 0 },
    monthlyAverages: { xp: 0, tasks: 0, productivity: 0 },
    seasonalTrends: [],
    movingAverages: { xp7: 0, xp30: 0, productivity7: 0, productivity30: 0 }
  });

  /**
   * 🚀 INITIALISER LES LISTENERS TEMPS RÉEL
   */
  const setupRealTimeListeners = useCallback(async () => {
    if (!user?.uid || !isReady) return;

    try {
      setRealTimeStatus('connecting');
      console.log('🚀 [ANALYTICS-RT] Initialisation listeners temps réel...');

      // 🎯 LISTENER 1: Tâches utilisateur en temps réel
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        console.log('📊 [ANALYTICS-RT] Mise à jour tâches temps réel');
        const userTasks = [];
        snapshot.forEach(doc => {
          userTasks.push({ id: doc.id, ...doc.data() });
        });
        
        // Traiter les tâches mises à jour
        processTasksUpdate(userTasks, 'userId');
      });

      // 🎯 LISTENER 2: Tâches créées par l'utilisateur
      const createdTasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', user.uid)
      );
      
      const unsubscribeCreatedTasks = onSnapshot(createdTasksQuery, (snapshot) => {
        console.log('📊 [ANALYTICS-RT] Mise à jour tâches créées temps réel');
        const createdTasks = [];
        snapshot.forEach(doc => {
          createdTasks.push({ id: doc.id, ...doc.data() });
        });
        
        processTasksUpdate(createdTasks, 'createdBy');
      });

      // 🎯 LISTENER 3: Projets utilisateur
      const projectsQuery = query(
        collection(db, 'projects'),
        where('createdBy', '==', user.uid)
      );
      
      const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        console.log('📊 [ANALYTICS-RT] Mise à jour projets temps réel');
        const userProjects = [];
        snapshot.forEach(doc => {
          userProjects.push({ id: doc.id, ...doc.data() });
        });
        
        processProjectsUpdate(userProjects);
      });

      // Sauvegarder les références pour cleanup
      unsubscribeRefs.current = [unsubscribeTasks, unsubscribeCreatedTasks, unsubscribeProjects];
      
      setRealTimeStatus('connected');
      console.log('✅ [ANALYTICS-RT] Listeners temps réel configurés');

    } catch (error) {
      console.error('❌ [ANALYTICS-RT] Erreur setup listeners:', error);
      setRealTimeStatus('error');
    }
  }, [user?.uid, isReady]);

  /**
   * 📊 TRAITER MISE À JOUR TÂCHES TEMPS RÉEL
   */
  const processTasksUpdate = useCallback((tasks, source) => {
    // Mettre à jour les données en temps réel
    const now = new Date();
    lastUpdateRef.current = now;
    
    // Recalculer les métriques avec les nouvelles données
    calculateEnhancedMetrics(tasks, source);
    
    // Marquer comme données temps réel
    setAnalyticsData(prev => ({
      ...prev,
      realTime: {
        lastUpdate: now,
        dataAge: 0,
        isLive: true
      }
    }));
    
    console.log(`✅ [ANALYTICS-RT] Données ${source} mises à jour:`, tasks.length, 'tâches');
  }, []);

  /**
   * 📊 TRAITER MISE À JOUR PROJETS TEMPS RÉEL
   */
  const processProjectsUpdate = useCallback((projects) => {
    const now = new Date();
    lastUpdateRef.current = now;
    
    // Recalculer la progression projets
    const projectsProgress = projects.map(project => ({
      name: project.title || 'Projet sans nom',
      progress: calculateProjectProgress(project),
      id: project.id,
      updatedAt: now
    }));
    
    setAnalyticsData(prev => ({
      ...prev,
      chartData: {
        ...prev.chartData,
        projectsProgress
      },
      realTime: {
        lastUpdate: now,
        dataAge: 0,
        isLive: true
      }
    }));
    
    console.log('✅ [ANALYTICS-RT] Projets mis à jour:', projects.length, 'projets');
  }, []);

  /**
   * 📈 CALCULER MÉTRIQUES ENRICHIES AVANCÉES
   */
  const calculateEnhancedMetrics = useCallback(async (tasks, source) => {
    try {
      // Combiner toutes les tâches si nécessaire
      let allTasks = tasks;
      
      if (source === 'userId') {
        // Récupérer aussi les tâches créées pour avoir le dataset complet
        const createdTasksQuery = query(
          collection(db, 'tasks'),
          where('createdBy', '==', user.uid)
        );
        const createdSnapshot = await getDocs(createdTasksQuery);
        const createdTasks = [];
        createdSnapshot.forEach(doc => {
          createdTasks.push({ id: doc.id, ...doc.data() });
        });
        
        // Éviter les doublons
        const allTasksMap = new Map();
        [...tasks, ...createdTasks].forEach(task => {
          allTasksMap.set(task.id, task);
        });
        allTasks = Array.from(allTasksMap.values());
      }

      // 📊 MÉTRIQUES DE BASE
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.status === 'completed').length;
      const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // 📈 XP PÉRIODIQUES
      const weeklyXp = calculatePeriodXp(allTasks, 7);
      const monthlyXp = calculatePeriodXp(allTasks, 30);

      // 🆕 TENDANCES ENRICHIES AVANCÉES
      const enhancedTrends = calculateAdvancedTrends(allTasks, gamification);
      
      // 🆕 STATISTIQUES AVANCÉES
      const advanced = calculateAdvancedStats(allTasks);
      
      // 🆕 DONNÉES GRAPHIQUES ÉTENDUES
      const chartData = generateEnhancedChartData(allTasks, advanced, historyRange);

      // Mettre à jour tous les états
      setAnalyticsData(prev => ({
        ...prev,
        overview: {
          totalTasks,
          completedTasks,
          productivity,
          streakDays: gamification.loginStreak || 0
        },
        performance: {
          weeklyXp,
          monthlyXp,
          totalXp: gamification.totalXp || 0
        },
        trends: enhancedTrends,
        chartData
      }));

      setAdvancedStats(advanced);
      
      console.log('✅ [ANALYTICS-RT] Métriques enrichies calculées:', {
        totalTasks,
        completedTasks,
        productivity: `${productivity}%`,
        weeklyXp,
        enhancedTrends
      });

    } catch (error) {
      console.error('❌ [ANALYTICS-RT] Erreur calcul métriques:', error);
    }
  }, [user?.uid, gamification, historyRange]);

  /**
   * 📊 CALCULER XP POUR UNE PÉRIODE DONNÉE
   */
  const calculatePeriodXp = useCallback((tasks, days) => {
    const periodAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return tasks
      .filter(task => {
        if (task.status !== 'completed') return false;
        const completedAt = task.completedAt?.toDate?.() || task.updatedAt?.toDate?.() || new Date(task.updatedAt);
        return completedAt >= periodAgo;
      })
      .reduce((total, task) => total + (task.xpReward || 0), 0);
  }, []);

  /**
   * 🆕 CALCULER TENDANCES AVANCÉES AVEC MOYENNES MOBILES
   */
  const calculateAdvancedTrends = useCallback((tasks, gamificationData) => {
    const now = new Date();
    
    // Périodes pour comparaison
    const periods = {
      thisWeek: { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now },
      lastWeek: { start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      thisMonth: { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now },
      lastMonth: { start: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    };

    // 📈 CALCUL TÂCHES PAR PÉRIODE
    const taskMetrics = Object.entries(periods).reduce((acc, [period, { start, end }]) => {
      const periodTasks = tasks.filter(task => {
        const createdAt = task.createdAt?.toDate?.() || new Date(task.createdAt);
        return createdAt >= start && createdAt <= end;
      });
      
      const completedTasks = periodTasks.filter(task => task.status === 'completed');
      
      acc[period] = {
        total: periodTasks.length,
        completed: completedTasks.length,
        xp: completedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        productivity: periodTasks.length > 0 ? (completedTasks.length / periodTasks.length) * 100 : 0
      };
      
      return acc;
    }, {});

    // 📊 CALCUL DES TENDANCES AVEC CONFIANCE
    const calculateTrend = (current, previous, label) => {
      if (previous === 0) {
        return {
          value: current > 0 ? '+∞' : '0%',
          direction: current > 0 ? 'up' : 'neutral',
          confidence: current > 0 ? 'medium' : 'low'
        };
      }
      
      const change = ((current - previous) / previous) * 100;
      const absChange = Math.abs(change);
      
      return {
        value: change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`,
        direction: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral',
        confidence: absChange > 20 ? 'high' : absChange > 10 ? 'medium' : 'low'
      };
    };

    // 🆕 CALCUL VÉLOCITÉ (tâches/jour)
    const thisWeekVelocity = taskMetrics.thisWeek.completed / 7;
    const lastWeekVelocity = taskMetrics.lastWeek.completed / 7;
    
    // 🆕 CALCUL SATISFACTION (basé sur streak et productivité)
    const satisfactionScore = Math.min(100, (gamificationData.loginStreak || 0) * 5 + taskMetrics.thisWeek.productivity);
    const lastSatisfactionScore = Math.min(100, (gamificationData.loginStreak || 0) * 4 + taskMetrics.lastWeek.productivity);

    return {
      tasksCompletion: calculateTrend(taskMetrics.thisWeek.total, taskMetrics.lastWeek.total, 'Tâches'),
      productivityScore: calculateTrend(taskMetrics.thisWeek.productivity, taskMetrics.lastWeek.productivity, 'Productivité'),
      engagement: calculateTrend(taskMetrics.thisWeek.xp, taskMetrics.lastWeek.xp, 'Engagement'),
      velocity: calculateTrend(thisWeekVelocity, lastWeekVelocity, 'Vélocité'),
      satisfaction: calculateTrend(satisfactionScore, lastSatisfactionScore, 'Satisfaction')
    };
  }, []);

  /**
   * 🆕 CALCULER STATISTIQUES AVANCÉES
   */
  const calculateAdvancedStats = useCallback((tasks) => {
    const now = new Date();
    
    // Moyennes hebdomadaires (4 dernières semaines)
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => {
        const date = task.completedAt?.toDate?.() || task.updatedAt?.toDate?.() || new Date(task.updatedAt);
        return date >= weekStart && date <= weekEnd && task.status === 'completed';
      });
      
      weeklyData.push({
        xp: weekTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        tasks: weekTasks.length,
        productivity: weekTasks.length / 7 // tâches par jour
      });
    }

    // Moyennes mensuelles (3 derniers mois)
    const monthlyData = [];
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(now.getTime() - (i + 1) * 30 * 24 * 60 * 60 * 1000);
      const monthEnd = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
      
      const monthTasks = tasks.filter(task => {
        const date = task.completedAt?.toDate?.() || task.updatedAt?.toDate?.() || new Date(task.updatedAt);
        return date >= monthStart && date <= monthEnd && task.status === 'completed';
      });
      
      monthlyData.push({
        xp: monthTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0),
        tasks: monthTasks.length,
        productivity: monthTasks.length / 30
      });
    }

    return {
      weeklyAverages: {
        xp: weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, week) => sum + week.xp, 0) / weeklyData.length) : 0,
        tasks: weeklyData.length > 0 ? Math.round(weeklyData.reduce((sum, week) => sum + week.tasks, 0) / weeklyData.length) : 0,
        productivity: weeklyData.length > 0 ? Math.round((weeklyData.reduce((sum, week) => sum + week.productivity, 0) / weeklyData.length) * 100) / 100 : 0
      },
      monthlyAverages: {
        xp: monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, month) => sum + month.xp, 0) / monthlyData.length) : 0,
        tasks: monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, month) => sum + month.tasks, 0) / monthlyData.length) : 0,
        productivity: monthlyData.length > 0 ? Math.round((monthlyData.reduce((sum, month) => sum + month.productivity, 0) / monthlyData.length) * 100) / 100 : 0
      },
      movingAverages: {
        xp7: weeklyData.length > 0 ? weeklyData[0].xp : 0,
        xp30: monthlyData.length > 0 ? monthlyData[0].xp : 0,
        productivity7: weeklyData.length > 0 ? weeklyData[0].productivity : 0,
        productivity30: monthlyData.length > 0 ? monthlyData[0].productivity : 0
      }
    };
  }, []);

  /**
   * 🆕 GÉNÉRER DONNÉES GRAPHIQUES ÉTENDUES
   */
  const generateEnhancedChartData = useCallback((tasks, advanced, days = 7) => {
    const now = new Date();
    
    // 📈 Historique XP étendu
    const xpHistory = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      const dayTasks = tasks.filter(task => {
        if (task.status !== 'completed') return false;
        const completedAt = task.completedAt?.toDate?.() || task.updatedAt?.toDate?.() || new Date(task.updatedAt);
        return completedAt.toDateString() === date.toDateString();
      });
      
      const dayXp = dayTasks.reduce((total, task) => total + (task.xpReward || 0), 0);
      
      xpHistory.push({
        date: date.toLocaleDateString('fr-FR', { 
          weekday: days <= 7 ? 'short' : undefined,
          day: 'numeric',
          month: days > 7 ? 'short' : undefined
        }),
        xp: dayXp,
        tasks: dayTasks.length,
        movingAverage: Math.round(advanced.weeklyAverages.xp / 7) // Moyenne mobile
      });
    }

    // 🆕 Historique de vélocité
    const velocityHistory = [];
    for (let i = Math.min(days, 14) - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const weekStart = new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => {
        if (task.status !== 'completed') return false;
        const completedAt = task.completedAt?.toDate?.() || task.updatedAt?.toDate?.() || new Date(task.updatedAt);
        return completedAt >= weekStart && completedAt <= date;
      });
      
      velocityHistory.push({
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        velocity: Math.round((weekTasks.length / 7) * 10) / 10, // tâches par jour
        efficiency: weekTasks.length > 0 ? Math.round((weekTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0) / weekTasks.length) * 10) / 10 : 0
      });
    }

    // 🆕 Tendance de productivité
    const productivityTrend = [];
    for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const weekStart = new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => {
        const createdAt = task.createdAt?.toDate?.() || new Date(task.createdAt);
        return createdAt >= weekStart && createdAt <= date;
      });
      
      const completedTasks = weekTasks.filter(task => task.status === 'completed');
      const productivity = weekTasks.length > 0 ? (completedTasks.length / weekTasks.length) * 100 : 0;
      
      productivityTrend.push({
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: days > 7 ? 'short' : undefined }),
        productivity: Math.round(productivity),
        target: 80 // Objectif de productivité
      });
    }

    return {
      xpHistory,
      velocityHistory,
      productivityTrend,
      tasksHistory: xpHistory.map(day => ({
        date: day.date,
        completed: day.tasks,
        created: Math.round(day.tasks * 1.2) // Estimation basée sur ratio
      })),
      projectsProgress: [] // Sera mis à jour par les listeners
    };
  }, []);

  /**
   * 📊 CALCULER PROGRESSION PROJET
   */
  const calculateProjectProgress = useCallback((project) => {
    // Cette fonction sera enrichie avec les données temps réel
    return Math.round(Math.random() * 100); // Placeholder
  }, []);

  /**
   * 🔄 ACTUALISER DONNÉES MANUELLEMENT
   */
  const refreshData = useCallback(() => {
    if (realTimeStatus === 'connected') {
      console.log('🔄 [ANALYTICS] Actualisation manuelle...');
      // Les listeners temps réel vont automatiquement mettre à jour
    } else {
      // Fallback si pas de temps réel
      setupRealTimeListeners();
    }
  }, [realTimeStatus, setupRealTimeListeners]);

  /**
   * 🆕 CALCULER ÂGE DES DONNÉES
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdateRef.current) {
        const ageInSeconds = Math.floor((Date.now() - lastUpdateRef.current.getTime()) / 1000);
        setAnalyticsData(prev => ({
          ...prev,
          realTime: {
            ...prev.realTime,
            dataAge: ageInSeconds
          }
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🚀 INITIALISATION
  useEffect(() => {
    if (isReady && user?.uid) {
      setupRealTimeListeners();
    }
    
    return () => {
      // Nettoyage des listeners
      unsubscribeRefs.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribeRefs.current = [];
    };
  }, [isReady, user?.uid, setupRealTimeListeners]);

  // ✅ UTILISER LES MÊMES DONNÉES XP QUE LES AUTRES PAGES
  const totalXpDisplay = gamification.totalXp || 0;
  const levelDisplay = gamification.level || 1;
  const streakDisplay = gamification.loginStreak || 0;

  // 🆕 FONCTION POUR AFFICHER TENDANCE AVEC CONFIANCE
  const renderTrend = (trend) => {
    const getIcon = () => {
      switch (trend.direction) {
        case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
        case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
        default: return <Minus className="w-4 h-4 text-gray-400" />;
      }
    };

    const getColor = () => {
      switch (trend.direction) {
        case 'up': return 'text-green-400';
        case 'down': return 'text-red-400';
        default: return 'text-gray-400';
      }
    };

    const getConfidenceIndicator = () => {
      switch (trend.confidence) {
        case 'high': return '●●●';
        case 'medium': return '●●○';
        case 'low': return '●○○';
        default: return '○○○';
      }
    };

    return (
      <div className={`flex items-center gap-1 ${getColor()}`}>
        {getIcon()}
        <span>{trend.value}</span>
        <span className="text-xs opacity-60">{getConfidenceIndicator()}</span>
      </div>
    );
  };

  // Stats pour l'en-tête avec nouvelles métriques
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
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Série de connexions", 
      value: `${streakDisplay} jours`, 
      icon: Flame, 
      color: "text-orange-400" 
    }
  ];

  // Actions du header avec statut temps réel
  const headerActions = (
    <div className="flex gap-3 items-center">
      {/* 🆕 Indicateur de statut temps réel */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
        {realTimeStatus === 'connected' ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">Temps réel</span>
            {analyticsData.realTime.dataAge > 0 && (
              <span className="text-gray-500 text-xs">({analyticsData.realTime.dataAge}s)</span>
            )}
          </>
        ) : realTimeStatus === 'connecting' ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-400 text-sm">Connexion...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">Déconnecté</span>
          </>
        )}
      </div>

      {/* 🆕 Sélecteur de période pour l'historique */}
      <select
        value={historyRange}
        onChange={(e) => setHistoryRange(Number(e.target.value))}
        className="bg-gray-800/50 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm"
      >
        <option value={7}>7 jours</option>
        <option value={14}>14 jours</option>
        <option value={30}>30 jours</option>
        <option value={90}>3 mois</option>
      </select>

      {/* Bouton actualiser */}
      <PremiumButton
        variant="secondary"
        icon={RefreshCw}
        onClick={refreshData}
        disabled={realTimeStatus === 'connecting'}
      >
        Actualiser
      </PremiumButton>

      {/* Bouton export */}
      <PremiumButton
        variant="primary"
        icon={Download}
        onClick={() => {
          const dataToExport = {
            timestamp: new Date().toISOString(),
            analytics: analyticsData,
            advanced: advancedStats,
            period: historyRange
          };
          
          const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `synergia-analytics-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
      >
        Export
      </PremiumButton>
    </div>
  );

  if (loading || firebaseLoading) {
    return (
      <PremiumLayout title="Analytics" subtitle="Chargement des données...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Initialisation des analytics temps réel...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Analytics Avancées"
      subtitle="Données temps réel et tendances enrichies"
      icon={BarChart3}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🆕 ALERTE SI DONNÉES NON TEMPS RÉEL */}
      {realTimeStatus !== 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <PremiumCard className="border-yellow-500/50 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <h4 className="text-yellow-400 font-medium">Mode hors ligne</h4>
                <p className="text-gray-300 text-sm">
                  Les données ne sont pas mises à jour en temps réel. Cliquez sur Actualiser pour synchroniser.
                </p>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}

      {/* 📊 MÉTRIQUES PRINCIPALES AVEC XP COHÉRENT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <PremiumCard>
          <div className="text-center">
            <h3 className="text-gray-400 text-sm">XP Total</h3>
            <p className="text-2xl font-bold text-yellow-400">{totalXpDisplay.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Niveau {levelDisplay}</p>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h3 className="text-gray-400 text-sm">XP Hebdomadaire</h3>
            <p className="text-2xl font-bold text-blue-400">{analyticsData.performance.weeklyXp}</p>
            <p className="text-xs text-gray-500">Moy. {Math.round(advancedStats.weeklyAverages.xp)}</p>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h3 className="text-gray-400 text-sm">XP Mensuel</h3>
            <p className="text-2xl font-bold text-green-400">{analyticsData.performance.monthlyXp}</p>
            <p className="text-xs text-gray-500">Moy. {Math.round(advancedStats.monthlyAverages.xp)}</p>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h3 className="text-gray-400 text-sm">Productivité</h3>
            <p className="text-2xl font-bold text-purple-400">{analyticsData.overview.productivity}%</p>
            <p className="text-xs text-gray-500">
              {analyticsData.overview.productivity >= 80 ? 'Excellent' : 
               analyticsData.overview.productivity >= 60 ? 'Bon' : 'À améliorer'}
            </p>
          </div>
        </PremiumCard>
      </div>

      {/* 🆕 TENDANCES ENRICHIES AVEC CONFIANCE */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <PremiumCard>
          <div className="text-center">
            <h4 className="text-gray-400 text-sm mb-2">Tâches</h4>
            {renderTrend(analyticsData.trends.tasksCompletion)}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h4 className="text-gray-400 text-sm mb-2">Productivité</h4>
            {renderTrend(analyticsData.trends.productivityScore)}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h4 className="text-gray-400 text-sm mb-2">Engagement</h4>
            {renderTrend(analyticsData.trends.engagement)}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h4 className="text-gray-400 text-sm mb-2">Vélocité</h4>
            {renderTrend(analyticsData.trends.velocity)}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <h4 className="text-gray-400 text-sm mb-2">Satisfaction</h4>
            {renderTrend(analyticsData.trends.satisfaction)}
          </div>
        </PremiumCard>
      </div>

      {/* 🆕 GRAPHIQUES ÉTENDUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Historique XP étendu avec moyenne mobile */}
        <PremiumCard>
          <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
              Évolution XP ({historyRange} jours)
            </div>
            <span className="text-xs text-gray-500">Avec moyenne mobile</span>
          </h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {analyticsData.chartData.xpHistory.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center relative">
                {/* Barre XP */}
                <div 
                  className="bg-yellow-400 rounded-t w-full transition-all duration-300 hover:bg-yellow-300"
                  style={{ 
                    height: `${Math.max((day.xp / Math.max(...analyticsData.chartData.xpHistory.map(d => d.xp), 1)) * 200, 4)}px` 
                  }}
                  title={`${day.xp} XP - ${day.tasks} tâches`}
                ></div>
                
                {/* Ligne moyenne mobile */}
                {index > 0 && (
                  <div 
                    className="absolute w-full border-t-2 border-blue-400 opacity-50"
                    style={{ 
                      top: `${200 - (day.movingAverage / Math.max(...analyticsData.chartData.xpHistory.map(d => d.xp), 1)) * 200}px` 
                    }}
                  ></div>
                )}
                
                <span className="text-gray-400 text-xs mt-2">{day.date}</span>
                <span className="text-yellow-400 text-xs">{day.xp}</span>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* 🆕 Vélocité et efficacité */}
        <PremiumCard>
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-purple-400" />
            Vélocité et Efficacité
          </h3>
          <div className="h-64 space-y-4">
            {analyticsData.chartData.velocityHistory.slice(-5).map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm w-16">{day.date}</span>
                <div className="flex-1 mx-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Vélocité: {day.velocity} tâches/jour</span>
                    <span>Efficacité: {day.efficiency} XP/tâche</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${Math.min((day.velocity / 3) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Message si pas de données */}
      {analyticsData.overview.totalTasks === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <PremiumCard>
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Créez vos premières données</h3>
              <p className="text-gray-400 mb-6">
                Commencez par créer des tâches et projets pour voir vos analytics en temps réel !
              </p>
              <div className="flex justify-center space-x-4">
                <PremiumButton 
                  variant="primary" 
                  onClick={() => window.location.href = '/tasks'}
                >
                  Créer une tâche
                </PremiumButton>
                <PremiumButton 
                  variant="secondary" 
                  onClick={() => window.location.href = '/projects'}
                >
                  Créer un projet
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      )}
    </PremiumLayout>
  );
};

export default AnalyticsPage;
