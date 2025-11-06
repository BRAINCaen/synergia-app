// ==========================================
// 📁 react-app/src/pages/TimeTrackPage.jsx
// PAGE SUIVI DU TEMPS - CHARTE SYNERGIA AUTHENTIQUE
// ==========================================

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

// IMPORT LAYOUT SYNERGIA AUTHENTIQUE
import Layout from '../components/layout/Layout.jsx';
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
  
  // Sessions simulées
  const mockSessions = [
    {
      id: 1,
      task: 'Développement feature login',
      project: 'Synergia v3.5',
      duration: 7200,
      date: new Date(),
      startTime: '09:00',
      endTime: '11:00',
      completed: true
    },
    {
      id: 2,
      task: 'Révision documentation',
      project: 'Synergia v3.5',
      duration: 3600,
      date: new Date(),
      startTime: '14:00',
      endTime: '15:00',
      completed: true
    },
    {
      id: 3,
      task: 'Réunion équipe',
      project: 'Général',
      duration: 1800,
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
    sessionsCount: sessions.length
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        {/* HEADER AVEC CHARTE SYNERGIA */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                ⏱️ Suivi du temps
              </h1>
              <p className="text-gray-400 text-lg">
                Pointeuse et gestion du temps de travail
              </p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all"
              >
                <Download className="w-4 h-4" />
                Exporter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </motion.button>
            </div>
          </div>

          {/* STATS CARDS - DESIGN SYNERGIA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-white">{formatTime(todayStats.totalTime)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Sessions</p>
                  <p className="text-2xl font-bold text-white">{todayStats.sessionsCount}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tâches</p>
                  <p className="text-2xl font-bold text-white">{todayStats.completedTasks}</p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Statut</p>
                  <p className={`text-2xl font-bold ${isTracking ? 'text-green-400' : 'text-red-400'}`}>
                    {isTracking ? 'En cours' : 'Arrêté'}
                  </p>
                </div>
                {isTracking ? (
                  <Play className="w-8 h-8 text-green-400" />
                ) : (
                  <Pause className="w-8 h-8 text-red-400" />
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* TIMER PRINCIPAL - DESIGN SYNERGIA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50 mb-8"
        >
          <div className="text-center">
            {/* Affichage du temps */}
            <div className="mb-6">
              <div className="text-7xl font-mono font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {formatTime(currentTime)}
              </div>
              <div className="text-xl text-gray-400">
                {isTracking ? '⏳ Suivi en cours...' : 
                 currentTime > 0 ? '⏸️ En pause' : '⏱️ Prêt à démarrer'}
              </div>
            </div>

            {/* Champs de saisie */}
            <div className="max-w-2xl mx-auto space-y-4 mb-6">
              <input
                type="text"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Quelle tâche travaillez-vous ?"
                disabled={isTracking}
                className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none disabled:opacity-50 transition-all"
              />
              <input
                type="text"
                value={currentProject}
                onChange={(e) => setCurrentProject(e.target.value)}
                placeholder="Projet (optionnel)"
                disabled={isTracking}
                className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none disabled:opacity-50 transition-all"
              />
            </div>

            {/* Boutons de contrôle */}
            <div className="flex justify-center gap-4">
              {!isTracking ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-xl hover:shadow-green-500/50 transition-all text-lg font-semibold"
                >
                  <Play className="w-6 h-6" />
                  Démarrer
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseTimer}
                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg shadow-xl hover:shadow-yellow-500/50 transition-all text-lg font-semibold"
                  >
                    <Pause className="w-6 h-6" />
                    Pause
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopTimer}
                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg shadow-xl hover:shadow-red-500/50 transition-all text-lg font-semibold"
                  >
                    <Square className="w-6 h-6" />
                    Terminer
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* HISTORIQUE DES SESSIONS - DESIGN SYNERGIA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-400" />
            Historique du jour
          </h3>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-5 hover:bg-gray-700/50 transition-all border border-gray-700/50 hover:border-purple-500/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      session.completed ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-white text-lg">{session.task}</h4>
                      <p className="text-sm text-gray-400">{session.project}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">{formatTime(session.duration)}</div>
                    <div className="text-sm text-gray-400">
                      {session.startTime} - {session.endTime}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Timer className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Aucune session enregistrée</h3>
              <p className="text-gray-400 text-lg">Démarrez votre premier timer pour commencer le suivi</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default TimeTrackPage;
