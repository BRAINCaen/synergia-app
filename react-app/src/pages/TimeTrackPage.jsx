// ==========================================
// 📁 react-app/src/pages/TimeTrackPage.jsx
// PAGE SUIVI DU TEMPS - Timer et historique
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Calendar,
  BarChart3,
  Target,
  Timer,
  Stopwatch,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../shared/stores/authStore.js';

const TimeTrackPage = () => {
  const { user } = useAuthStore();
  
  // États du timer
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  
  // États de l'historique
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // today, week, month
  
  // Sessions simulées pour l'affichage
  const mockSessions = [
    {
      id: 1,
      task: 'Développement feature login',
      project: 'Synergia v3.5',
      duration: 7200, // 2h
      date: new Date(),
      completed: true
    },
    {
      id: 2,
      task: 'Révision documentation',
      project: 'Synergia v3.5',
      duration: 3600, // 1h
      date: new Date(),
      completed: true
    },
    {
      id: 3,
      task: 'Réunion équipe',
      project: 'Général',
      duration: 1800, // 30min
      date: new Date(),
      completed: false
    }
  ];

  // Effet pour le timer
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

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
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (time > 0) {
      // Sauvegarder la session
      const newSession = {
        id: Date.now(),
        task: currentTask,
        project: currentProject || 'Sans projet',
        duration: time,
        date: new Date(),
        completed: true
      };
      setSessions(prev => [newSession, ...prev]);
    }
    
    setIsRunning(false);
    setTime(0);
    setCurrentTask('');
    setCurrentProject('');
  };

  // Statistiques du jour
  const todayStats = {
    totalTime: mockSessions.reduce((acc, session) => acc + session.duration, 0),
    completedTasks: mockSessions.filter(s => s.completed).length,
    sessionsCount: mockSessions.length,
    avgSessionTime: mockSessions.length > 0 ? 
      Math.round(mockSessions.reduce((acc, s) => acc + s.duration, 0) / mockSessions.length) : 0
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600/20 via-blue-600/20 to-green-700/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Clock className="w-8 h-8 text-green-300 mr-3" />
              Suivi du Temps
            </h1>
            <p className="text-xl text-gray-200">
              Mesurez et optimisez votre productivité
            </p>
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatTime(todayStats.totalTime)}
              </div>
              <div className="text-sm text-gray-300">Aujourd'hui</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{todayStats.completedTasks}</div>
              <div className="text-sm text-gray-300">Tâches terminées</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer principal */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Stopwatch className="w-6 h-6 mr-3 text-green-400" />
              Timer
            </h2>

            {/* Affichage du temps */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-4 font-mono">
                {formatTime(time)}
              </div>
              <div className="text-lg text-gray-300">
                {isRunning ? '⏳ En cours...' : time > 0 ? '⏸️ En pause' : '⏹️ Arrêté'}
              </div>
            </div>

            {/* Saisie de la tâche */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tâche actuelle
                </label>
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="Que faites-vous en ce moment ?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Projet (optionnel)
                </label>
                <input
                  type="text"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  placeholder="Associer à un projet"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Contrôles du timer */}
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 shadow-lg font-medium"
                >
                  <Play className="w-5 h-5" />
                  <span>Démarrer</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all duration-200 shadow-lg font-medium"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              )}
              
              <button
                onClick={stopTimer}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-lg font-medium"
                disabled={time === 0}
              >
                <Square className="w-5 h-5" />
                <span>Terminer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques du jour */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Aujourd'hui
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Temps total</span>
                <span className="text-white font-medium">
                  {formatTime(todayStats.totalTime)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Sessions</span>
                <span className="text-white font-medium">{todayStats.sessionsCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Tâches terminées</span>
                <span className="text-white font-medium">{todayStats.completedTasks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Temps moyen/session</span>
                <span className="text-white font-medium">
                  {formatTime(todayStats.avgSessionTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Objectifs */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" />
              Objectifs
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Objectif quotidien</span>
                  <span className="text-white font-medium">6h</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((todayStats.totalTime / 21600) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Math.round((todayStats.totalTime / 21600) * 100)}% atteint
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des sessions */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Activity className="w-6 h-6 mr-3 text-blue-400" />
            Historique des Sessions
          </h2>
          
          <div className="flex items-center space-x-4">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {mockSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${session.completed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <div>
                  <h4 className="font-medium text-white">{session.task}</h4>
                  <p className="text-sm text-gray-400">{session.project}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">{formatTime(session.duration)}</div>
                <div className="text-xs text-gray-400">
                  {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {mockSessions.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune session enregistrée</h3>
            <p className="text-gray-400">Démarrez votre premier timer pour commencer le suivi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTrackPage;
