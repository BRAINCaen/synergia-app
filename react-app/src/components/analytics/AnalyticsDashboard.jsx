// js/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import analyticsService from '../../core/services/analyticsService.js';
import { useAuthStore } from '../../stores/authStore.js';

const AnalyticsDashboard = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [projectsProgress, setProjectsProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    if (!user?.uid) return;

    loadAnalyticsData();

    // S'abonner aux changements temps réel
    const unsubscribe = analyticsService.subscribeToMetrics(user.uid, (newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => unsubscribe();
  }, [user?.uid, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [metricsData, progressOverTime, velocity, projects] = await Promise.all([
        analyticsService.getGlobalMetrics(user.uid),
        analyticsService.getProgressOverTime(user.uid, timeRange),
        analyticsService.getVelocityData(user.uid),
        analyticsService.getProjectsProgress(user.uid)
      ]);

      setMetrics(metricsData);
      setProgressData(progressOverTime);
      setVelocityData(velocity);
      setProjectsProgress(projects);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (completion) => {
    if (completion >= 80) return '#10b981';
    if (completion >= 60) return '#f59e0b';
    if (completion >= 40) return '#3b82f6';
    return '#ef4444';
  };

  const MetricCard = ({ icon, value, label, color, trend }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ background: color }}>
          {icon}
        </div>
        {trend && (
          <div className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="analytics-error">
        <p>Erreur lors du chargement des données analytics</p>
        <button onClick={loadAnalyticsData} className="retry-btn">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header avec contrôles */}
      <div className="analytics-header">
        <div>
          <h1>📊 Analytics Dashboard</h1>
          <p>Vue d'ensemble temps réel de votre productivité</p>
        </div>
        <div className="time-controls">
          <label htmlFor="timeRange">Période :</label>
          <select 
            id="timeRange"
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>3 derniers mois</option>
          </select>
          <button onClick={loadAnalyticsData} className="refresh-btn">
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="metrics-grid">
        <MetricCard
          icon="🎯"
          value={metrics.totalProjects}
          label="Projets Total"
          color="linear-gradient(135deg, #667eea, #764ba2)"
          trend={5}
        />
        <MetricCard
          icon="⚡"
          value={metrics.activeProjects}
          label="Projets Actifs"
          color="linear-gradient(135deg, #f093fb, #f5576c)"
        />
        <MetricCard
          icon="✅"
          value={`${metrics.completedTasks}/${metrics.totalTasks}`}
          label="Tâches Complétées"
          color="linear-gradient(135deg, #4facfe, #00f2fe)"
          trend={12}
        />
        <MetricCard
          icon="⏰"
          value={metrics.overdueTasks}
          label="Tâches En Retard"
          color="linear-gradient(135deg, #ff9a9e, #fecfef)"
          trend={-3}
        />
        <MetricCard
          icon="👥"
          value={metrics.teamMembers}
          label="Membres Équipe"
          color="linear-gradient(135deg, #43e97b, #38f9d7)"
        />
        <MetricCard
          icon="📈"
          value={`${metrics.avgCompletion}%`}
          label="Completion Moyenne"
          color="linear-gradient(135deg, #fa709a, #fee140)"
          trend={8}
        />
        <MetricCard
          icon="🔥"
          value={metrics.productivity}
          label="Tâches Aujourd'hui"
          color="linear-gradient(135deg, #a8edea, #fed6e3)"
        />
        <MetricCard
          icon="⚡"
          value={`${metrics.velocity}x`}
          label="Vélocité Hebdo"
          color="linear-gradient(135deg, #d299c2, #fef9d7)"
        />
      </div>

      {/* Graphiques */}
      <div className="charts-section">
        <div className="charts-grid">
          {/* Progression dans le temps */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>📈 Progression des Tâches</h3>
              <span className="chart-subtitle">Évolution sur {timeRange} jours</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 35, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Complétées"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Créées"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vélocité par équipe */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>⚡ Vélocité par Équipe</h3>
              <span className="chart-subtitle">Comparaison hebdomadaire</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="team" 
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 35, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Bar 
                    dataKey="thisWeek" 
                    fill="#667eea" 
                    name="Cette semaine"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="lastWeek" 
                    fill="#f093fb" 
                    name="Semaine dernière"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Répartition des tâches */}
        <div className="chart-container full-width">
          <div className="chart-header">
            <h3>📊 Répartition des Tâches</h3>
            <span className="chart-subtitle">État actuel</span>
          </div>
          <div className="chart-wrapper" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Complétées', value: metrics.completedTasks, color: '#10b981' },
                    { name: 'En cours', value: metrics.pendingTasks, color: '#3b82f6' },
                    { name: 'En retard', value: metrics.overdueTasks, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Complétées', value: metrics.completedTasks, color: '#10b981' },
                    { name: 'En cours', value: metrics.pendingTasks, color: '#3b82f6' },
                    { name: 'En retard', value: metrics.overdueTasks, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progression des projets */}
      <div className="projects-progress-section">
        <div className="section-header">
          <h3>🎯 Progression des Projets</h3>
          <span>{projectsProgress.length} projets actifs</span>
        </div>
        <div className="progress-grid">
          {projectsProgress.map((project, index) => (
            <div key={index} className="project-progress-card">
              <div className="project-info">
                <div className="project-name">{project.name}</div>
                <div className="project-meta">
                  {project.tasks} • 
                  <span className={`priority priority-${project.priority}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              <div className="progress-section">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{
                      width: `${project.completion}%`,
                      backgroundColor: getProgressColor(project.completion)
                    }}
                  ></div>
                </div>
                <div className="progress-percentage">
                  {project.completion}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        <button 
          onClick={() => analyticsService.exportAnalytics(user.uid)}
          className="action-btn export-btn"
        >
          📊 Exporter Rapport
        </button>
        <button 
          onClick={loadAnalyticsData}
          className="action-btn refresh-btn"
        >
          🔄 Actualiser Données
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
