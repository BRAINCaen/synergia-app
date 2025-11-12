// ==========================================
// 📁 react-app/src/pages/TimeTrackPage.jsx
// PAGE SUIVI DU TEMPS - CHARTE SYNERGIA V3.5 + FIREBASE
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
  RefreshCw,
  X,
  Zap
} from 'lucide-react';

// FIREBASE IMPORTS
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// IMPORT LAYOUT SYNERGIA AUTHENTIQUE
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const TimeTrackPage = () => {
  const { user } = useAuthStore();
  
  // ========================================
  // ÉTATS DU TIMER
  // ========================================
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  
  // ========================================
  // ÉTATS DE L'HISTORIQUE
  // ========================================
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTime: 0,
    completedTasks: 0,
    sessionsCount: 0,
    averageSession: 0
  });

  // ========================================
  // 🔥 CHARGEMENT DES SESSIONS FIREBASE
  // ========================================
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('⏱️ [TIME TRACK] Chargement sessions depuis Firebase pour:', user.uid);

    // Date du début de la journée (minuit)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Query Firebase pour les sessions d'aujourd'hui
    const sessionsQuery = query(
      collection(db, 'timeEntries'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );

    // Listener temps réel
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        sessionsData.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate(),
          createdAt: data.createdAt?.toDate()
        });
      });

      console.log('✅ [TIME TRACK] Sessions chargées:', sessionsData.length);
      setSessions(sessionsData);
      
      // Calculer les stats
      calculateStats(sessionsData);
      
      setLoading(false);
    }, (error) => {
      console.error('❌ [TIME TRACK] Erreur chargement sessions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ========================================
  // 📊 CALCULER LES STATISTIQUES
  // ========================================
  const calculateStats = (sessionsData) => {
    const totalTime = sessionsData.reduce((acc, session) => acc + (session.duration || 0), 0);
    const completedTasks = sessionsData.filter(s => s.status === 'completed').length;
    const sessionsCount = sessionsData.length;
    const averageSession = sessionsCount > 0 ? Math.floor(totalTime / sessionsCount) : 0;

    setStats({
      totalTime,
      completedTasks,
      sessionsCount,
      averageSession
    });
  };

  // ========================================
  // ⏱️ EFFET DU TIMER
  // ========================================
  useEffect(() => {
    let interval;
    if (isTracking && !isPaused && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, startTime]);

  // ========================================
  // 🎨 FORMATAGE DU TEMPS
  // ========================================
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // ========================================
  // ▶️ DÉMARRER LE TIMER
  // ========================================
  const startTimer = async () => {
    if (!currentTask.trim()) {
      alert('⚠️ Veuillez saisir une tâche');
      return;
    }

    if (!user?.uid) {
      alert('⚠️ Vous devez être connecté pour pointer');
      return;
    }

    try {
      const now = new Date();
      const startTimestamp = Timestamp.fromDate(now);
      
      // Créer l'entrée dans Firebase
      const entryRef = await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        task: currentTask.trim(),
        project: currentProject.trim() || 'Sans projet',
        duration: 0,
        startTime: startTimestamp,
        endTime: null,
        date: startTimestamp,
        status: 'in-progress',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [TIME TRACK] Session démarrée:', entryRef.id);

      setIsTracking(true);
      setIsPaused(false);
      setStartTime(now.getTime());
      setCurrentTime(0);
      setCurrentEntryId(entryRef.id);

    } catch (error) {
      console.error('❌ [TIME TRACK] Erreur démarrage:', error);
      alert('❌ Erreur lors du démarrage du timer');
    }
  };

  // ========================================
  // ⏸️ PAUSE DU TIMER
  // ========================================
  const pauseTimer = async () => {
    if (!currentEntryId) return;

    try {
      // Mettre à jour la durée dans Firebase
      const entryRef = doc(db, 'timeEntries', currentEntryId);
      await updateDoc(entryRef, {
        duration: currentTime,
        status: 'paused',
        updatedAt: serverTimestamp()
      });

      console.log('⏸️ [TIME TRACK] Session en pause');

      setIsPaused(true);
      setIsTracking(false);

    } catch (error) {
      console.error('❌ [TIME TRACK] Erreur pause:', error);
    }
  };

  // ========================================
  // ⏹️ ARRÊTER LE TIMER
  // ========================================
  const stopTimer = async () => {
    if (!currentEntryId || currentTime === 0) {
      alert('⚠️ Aucune session en cours');
      return;
    }

    try {
      const now = new Date();
      const entryRef = doc(db, 'timeEntries', currentEntryId);
      
      // Finaliser l'entrée dans Firebase
      await updateDoc(entryRef, {
        duration: currentTime,
        endTime: Timestamp.fromDate(now),
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      console.log('⏹️ [TIME TRACK] Session terminée:', currentEntryId);

      // Reset des états
      setIsTracking(false);
      setIsPaused(false);
      setCurrentTime(0);
      setCurrentTask('');
      setCurrentProject('');
      setStartTime(null);
      setCurrentEntryId(null);

    } catch (error) {
      console.error('❌ [TIME TRACK] Erreur arrêt:', error);
      alert('❌ Erreur lors de l\'arrêt du timer');
    }
  };

  // ========================================
  // 🗑️ SUPPRIMER UNE SESSION
  // ========================================
  const deleteSession = async (sessionId) => {
    if (!confirm('❓ Supprimer cette session ?')) return;

    try {
      const entryRef = doc(db, 'timeEntries', sessionId);
      await updateDoc(entryRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });

      console.log('🗑️ [TIME TRACK] Session supprimée:', sessionId);

    } catch (error) {
      console.error('❌ [TIME TRACK] Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // ========================================
  // 🎨 RENDER
  // ========================================
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ========================================
              HEADER AVEC CHARTE SYNERGIA
          ======================================== */}
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
                  Pointeuse et gestion du temps de travail - Synchronisé Firebase
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </motion.button>
              </div>
            </div>

            {/* ========================================
                STATS CARDS - DESIGN SYNERGIA
            ======================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6" />
                  <h3 className="text-sm font-medium opacity-90">Aujourd'hui</h3>
                </div>
                <div className="text-3xl font-bold mb-1">{formatTime(stats.totalTime)}</div>
                <div className="text-sm opacity-75">Temps total pointé</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6" />
                  <h3 className="text-sm font-medium opacity-90">Sessions</h3>
                </div>
                <div className="text-3xl font-bold mb-1">{stats.sessionsCount}</div>
                <div className="text-sm opacity-75">Sessions enregistrées</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6" />
                  <h3 className="text-sm font-medium opacity-90">Tâches</h3>
                </div>
                <div className="text-3xl font-bold mb-1">{stats.completedTasks}</div>
                <div className="text-sm opacity-75">Tâches terminées</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl p-6 text-white ${
                  isTracking 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : isPaused
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {isTracking ? (
                    <Zap className="w-6 h-6 animate-pulse" />
                  ) : isPaused ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                  <h3 className="text-sm font-medium opacity-90">Statut</h3>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {isTracking ? 'En cours' : isPaused ? 'En pause' : 'Arrêté'}
                </div>
                <div className="text-sm opacity-75">
                  {isTracking || isPaused ? formatTime(currentTime) : 'Prêt à démarrer'}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ========================================
              TIMER PRINCIPAL - DESIGN SYNERGIA
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mb-8"
          >
            <div className="text-center">
              {/* Affichage du temps */}
              <div className="mb-6">
                <div className="text-7xl font-mono font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xl text-gray-400">
                  {isTracking ? '⏳ Pointage en cours...' : 
                   isPaused ? '⏸️ Session en pause' :
                   currentTime > 0 ? '⏸️ Session interrompue' : '⏱️ Prêt à pointer'}
                </div>
              </div>

              {/* Champs de saisie */}
              <div className="max-w-2xl mx-auto space-y-4 mb-6">
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="Quelle tâche travaillez-vous ? *"
                  disabled={isTracking || isPaused}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <input
                  type="text"
                  value={currentProject}
                  onChange={(e) => setCurrentProject(e.target.value)}
                  placeholder="Projet (optionnel)"
                  disabled={isTracking || isPaused}
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* Boutons de contrôle */}
              <div className="flex justify-center gap-4 flex-wrap">
                {!isTracking && !isPaused ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startTimer}
                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-xl hover:shadow-green-500/50 transition-all text-lg font-semibold"
                  >
                    <Play className="w-6 h-6" />
                    Démarrer le pointage
                  </motion.button>
                ) : isTracking ? (
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
                ) : isPaused ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startTimer}
                      className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-xl hover:shadow-green-500/50 transition-all text-lg font-semibold"
                    >
                      <Play className="w-6 h-6" />
                      Reprendre
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
                ) : null}
              </div>

              {/* Info badge Firebase */}
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-400 font-medium">
                    Synchronisé en temps réel avec Firebase
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========================================
              HISTORIQUE DES SESSIONS - DESIGN SYNERGIA
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                Historique du jour
              </h3>
              <span className="text-sm text-gray-400">
                {sessions.length} session{sessions.length > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Chargement des sessions...</p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions
                  .filter(session => session.status !== 'deleted')
                  .map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-800/50 rounded-lg p-5 hover:bg-gray-700/50 transition-all border border-gray-700/50 hover:border-purple-500/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            session.status === 'completed' ? 'bg-green-400' : 
                            session.status === 'in-progress' ? 'bg-blue-400 animate-pulse' :
                            'bg-yellow-400'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-lg truncate">
                              {session.task}
                            </h4>
                            <p className="text-sm text-gray-400">{session.project}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-white font-bold text-xl">
                              {formatTime(session.duration)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {session.startTime && session.startTime.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {session.endTime && ` - ${session.endTime.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}`}
                            </div>
                          </div>

                          {session.status === 'completed' && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteSession(session.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/50 transition-all"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Barre de progression visuelle */}
                      {session.duration > 0 && (
                        <div className="mt-3">
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${
                                session.status === 'completed' 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : session.status === 'in-progress'
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Timer className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Aucune session enregistrée</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Démarrez votre premier pointage pour commencer le suivi
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    document.querySelector('input[placeholder*="tâche"]')?.focus();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <Play className="w-5 h-5" />
                  Commencer maintenant
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Info Firebase */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-500 text-sm">
              💾 Tous les pointages sont automatiquement sauvegardés dans Firebase
              <br />
              📊 Les données seront synchronisées avec la future page Planning
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TimeTrackPage;
