// ==========================================
// 📁 react-app/src/components/projects/ProjectVisualization.jsx
// COMPOSANT VISUALISATION ET RAPPORTS PROJETS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, Area, AreaChart, ComposedChart
} from 'recharts';
import { 
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Maximize2,
  Eye,
  Settings
} from 'lucide-react';

/**
 * 📊 COMPOSANT DE VISUALISATION AVANCÉE POUR PROJETS
 */
const ProjectVisualization = ({ 
  projectData, 
  timeRange = '30d',
  chartType = 'overview',
  interactive = true,
  fullscreen = false,
  onExport
}) => {
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [dataFilter, setDataFilter] = useState('all');

  // Couleurs pour les graphiques
  const colors = {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#A855F7',
    pink: '#EC4899'
  };

  const chartOptions = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'progress', label: 'Progression', icon: TrendingUp },
    { id: 'team', label: 'Performance équipe', icon: Users },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'distribution', label: 'Répartition', icon: PieChartIcon },
    { id: 'performance', label: 'Performance', icon: Activity }
  ];

  // Données formatées pour les graphiques
  const formatDataForCharts = () => {
    if (!projectData) return {};

    const { taskMetrics, teamMetrics, milestoneMetrics, timeline, performance } = projectData;

    return {
      // Données de progression globale
      progressData: [
        { name: 'Terminées', value: taskMetrics.completed, color: colors.success },
        { name: 'En cours', value: taskMetrics.inProgress, color: colors.warning },
        { name: 'En attente', value: taskMetrics.pending, color: colors.info },
        { name: 'Validation', value: taskMetrics.validationPending, color: colors.purple }
      ],

      // Performance de l'équipe
      teamPerformanceData: teamMetrics.memberProductivity?.map(member => ({
        name: member.displayName,
        tâches: member.tasksAssigned,
        terminées: member.tasksCompleted,
        taux: member.completionRate,
        xp: member.xpEarned,
        role: member.role
      })) || [],

      // Répartition par priorité
      priorityData: [
        { name: 'Faible', value: taskMetrics.priorityDistribution?.low || 0, fill: colors.info },
        { name: 'Normale', value: taskMetrics.priorityDistribution?.normal || 0, fill: colors.secondary },
        { name: 'Haute', value: taskMetrics.priorityDistribution?.high || 0, fill: colors.warning },
        { name: 'Urgente', value: taskMetrics.priorityDistribution?.urgent || 0, fill: colors.danger }
      ],

      // Données temporelles (simulation)
      timelineData: Array.from({ length: 10 }, (_, i) => ({
        semaine: `S${i + 1}`,
        planifié: Math.max(0, 100 - (i * 10)),
        réel: Math.max(0, 100 - (i * 8) - Math.random() * 20),
        jalons: i % 3 === 0 ? 1 : 0
      })),

      // Métriques de qualité
      qualityData: [
        { metric: 'Taux de completion', value: taskMetrics.completionRate, max: 100 },
        { metric: 'Qualité', value: performance?.qualityScore || 85, max: 100 },
        { metric: 'Respect délais', value: 75, max: 100 },
        { metric: 'Satisfaction équipe', value: 90, max: 100 },
        { metric: 'Innovation', value: 70, max: 100 },
        { metric: 'Collaboration', value: teamMetrics.averageCompletionRate || 80, max: 100 }
      ],

      // Burndown chart
      burndownData: performance?.burndownData ? 
        performance.burndownData.planned.map((planned, index) => ({
          jour: index + 1,
          planifié: planned,
          réel: performance.burndownData.actual[index],
          idéal: 100 - (index * 100 / 9)
        }
