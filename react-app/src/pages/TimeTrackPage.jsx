import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Timer,
  Calendar,
  BarChart3,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const TimeTrackPage = () => {
  const { user } = useAuthStore();
  
  // États du timer
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  const [startTime, setStartTime] = useState(null);
  
  // États de l'historique
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today');
  
  // Sessions simulées
  const mockSessions = [
    {
      id: 1,
      task: 'Développement feature login',
      project: 'Synergia v3.5',
      duration: 7200, // 2h
      date: new Date(),
      startTime: '09:00',
      endTime: '11:00',
      completed: true
    },
    {
      id: 2,
      task: 'Révision documentation',
      project: 'Synergia v3.5',
      duration: 3600, // 1h
      date: new Date(),
      startTime: '14:00',
      endTime: '15:00',
      completed: true
    },
    {
      id: 3,
      task: 'Réunion équipe',
      project: 'Général',
      duration: 1800, // 30min
      date: new Date(),
      startTime: '16:00',
      endTime: '16:30',
      completed: false
    }
  ];

  useEffect(() => {
    setSessions(mockSessions);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  // Formatage du temps
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Contrôles du timer
  const startTimer = () => {
    if (!currentTask.trim()) {
      alert('Veuillez saisir une tâche');
      return;
    }
    setIsTracking(true);
    setStartTime(Date.now());
    setCurrentTime(0);
  };

  const pauseTimer = () => {
    setIsTracking(false);
  };

  const stopTimer = () => {
    if (currentTime > 0) {
      const newSession = {
        id: Date.now(),
        task: currentTask,
        project: currentProject || 'Sans projet',
        duration: currentTime,
        date: new Date(),
        startTime: new Date(startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        completed: true
      };
      setSessions(prev => [newSession, ...prev]);
    }
    
    setIsTracking(false);
    setCurrentTime(0);
    setCurrentTask('');
    setCurrentProject('');
    setStartTime(null);
  };

  // Statistiques du jour
  const todayStats = {
    totalTime: sessions.reduce((acc, session) => acc + session.duration, 0),
    completedTasks: sessions.filter(s => s.completed).length,
    sessionsCount: sessions.length,
    avgSessionTime: sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length) : 0
  };

  const headerStats = [
    { 
      label: "Aujourd'hui", 
      value: formatTime(todayStats.totalTime), 
      icon: Clock, 
      color: "text-blue-400" 
    },
    { 
      label: "Sessions", 
      value: todayStats.sessionsCount.toString(), 
      icon: Activity, 
      color: "text-green-400" 
    },
    { 
      label: "Tâches", 
      value: todayStats.completedTasks.toString(), 
      icon: Target, 
      color: "text-purple-400" 
    },
    { 
      label: "Statut", 
      value: isTracking ? "En cours" : "Arrêté", 
      icon: isTracking ? Play : Pause, 
      color: isTracking ? "text-green-400" : "text-red-400" 
    }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={Download}>
        Exporter
      </PremiumButton>
      <PremiumButton variant="secondary" icon={RefreshCw}>
        Actualiser
      </PremiumButton>
    </div>
  );

  return (
    <PremiumLayout
      title="Suivi du temps"
      subtitle="Pointeuse et gestion du temps de travail"
      icon={Clock}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Timer principal */}
      <div className="mb-6">
        <PremiumCard>
          <div className="text-center">
            {/* Affichage du temps */}
            <div className="mb-6">
              <div className="text-6xl font-mono font-bold text-white mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-lg text-gray-300">
                {isTracking ? '⏳ Suivi en cours...' : 
                 currentTime > 0 ? '⏸️ En pause' : 
                 '⏹️ Prêt à démarrer'}
              </div>
            </div>

            {/* Saisie de la tâche */}
            <div className="max-w-md mx-auto mb-6 space-y-4">
              <div>
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="Que faites-vous en ce moment ?"
                  disabled={isTracking}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  placeholder="Projet (optionnel)"
                  disabled={isTracking}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Contrôles du timer */}
            <div className="flex justify-center space-x-4">
              {!isTracking ? (
                <PremiumButton
                  variant="primary"
                  icon={Play}
                  onClick={startTimer}
                  className="px-8 py-3"
                >
                  Démarrer
                </PremiumButton>
              ) : (
                <>
                  <PremiumButton
                    variant="secondary"
                    icon={Pause}
                    onClick={pauseTimer}
                    className="px-6 py-3"
                  >
                    Pause
                  </PremiumButton>
                  <PremiumButton
                    variant="danger"
                    icon={Square}
                    onClick={stopTimer}
                    className="px-6 py-3"
                  >
                    Arrêter
                  </PremiumButton>
                </>
              )}
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Statistiques quotidiennes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <PremiumCard>
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatTime(todayStats.totalTime)}</div>
            <div className="text-gray-400 text-sm">Temps total</div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <Activity className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{todayStats.sessionsCount}</div>
            <div className="text-gray-400 text-sm">Sessions</div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{todayStats.completedTasks}</div>
            <div className="text-gray-400 text-sm">Tâches terminées</div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{formatTime(todayStats.avgSessionTime)}</div>
            <div className="text-gray-400 text-sm">Durée moyenne</div>
          </div>
        </PremiumCard>
      </div>

      {/* Historique des sessions */}
      <PremiumCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-semibold flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
            Historique du jour
          </h3>
          <div className="flex space-x-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    session.completed ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-white">{session.task}</h4>
                    <p className="text-sm text-gray-400">{session.project}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">{formatTime(session.duration)}</div>
                  <div className="text-xs text-gray-400">
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune session enregistrée</h3>
            <p className="text-gray-400">Démarrez votre premier timer pour commencer le suivi</p>
          </div>
        )}
      </PremiumCard>
    </PremiumLayout>
  );
};

export default TimeTrackPage;
