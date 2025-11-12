// ==========================================
// 📁 react-app/src/pages/TimeTrackPage.jsx
// PAGE BADGEUSE - MULTIPLE POINTAGES PAR JOUR
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  LogIn,
  LogOut,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Timer,
  TrendingUp,
  Coffee
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
  // ÉTATS
  // ========================================
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayPointages, setTodayPointages] = useState([]);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentSegmentStart, setCurrentSegmentStart] = useState(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [stats, setStats] = useState({
    totalDays: 0,
    totalHours: 0,
    averageHours: 0,
    thisWeekHours: 0
  });

  // ========================================
  // 🔥 CHARGEMENT DES POINTAGES FIREBASE
  // ========================================
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('⏱️ [BADGEUSE] Chargement pointages depuis Firebase pour:', user.uid);

    // Date du début du mois (pour stats)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Query Firebase pour les pointages du mois
    const pointagesQuery = query(
      collection(db, 'timeEntries'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(startOfMonth)),
      orderBy('date', 'desc'),
      orderBy('timestamp', 'desc')
    );

    // Listener temps réel
    const unsubscribe = onSnapshot(pointagesQuery, (snapshot) => {
      const pointagesData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        pointagesData.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          timestamp: data.timestamp?.toDate(),
          createdAt: data.createdAt?.toDate()
        });
      });

      console.log('✅ [BADGEUSE] Pointages chargés:', pointagesData.length);
      setPointages(pointagesData);
      
      // Identifier les pointages du jour
      identifyTodayPointages(pointagesData);
      
      // Calculer les stats
      calculateStats(pointagesData);
      
      setLoading(false);
    }, (error) => {
      console.error('❌ [BADGEUSE] Erreur chargement pointages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ========================================
  // 📊 IDENTIFIER LES POINTAGES DU JOUR
  // ========================================
  const identifyTodayPointages = (pointagesData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayData = pointagesData.filter(p => {
      const pointageDate = new Date(p.date);
      pointageDate.setHours(0, 0, 0, 0);
      return pointageDate.getTime() === today.getTime() && p.status !== 'deleted';
    }).sort((a, b) => a.timestamp - b.timestamp); // Ordre chronologique

    setTodayPointages(todayData);

    // Vérifier si actuellement au travail
    // = dernier pointage est une arrivée
    if (todayData.length > 0) {
      const lastPointage = todayData[todayData.length - 1];
      const isWorking = lastPointage.type === 'arrival';
      setIsCurrentlyWorking(isWorking);
      
      if (isWorking) {
        setCurrentSegmentStart(lastPointage.timestamp);
      } else {
        setCurrentSegmentStart(null);
      }
    } else {
      setIsCurrentlyWorking(false);
      setCurrentSegmentStart(null);
    }

    // Calculer le temps de travail total du jour
    calculateTodayWorkTime(todayData);
  };

  // ========================================
  // ⏱️ CALCULER LE TEMPS DE TRAVAIL DU JOUR
  // ========================================
  const calculateTodayWorkTime = (todayData) => {
    let totalSeconds = 0;
    
    // Parcourir les pointages par paires (arrivée-départ)
    for (let i = 0; i < todayData.length; i += 2) {
      const arrival = todayData[i];
      const departure = todayData[i + 1];
      
      if (arrival && arrival.type === 'arrival') {
        if (departure && departure.type === 'departure') {
          // Segment complet
          const duration = Math.floor((departure.timestamp - arrival.timestamp) / 1000);
          totalSeconds += duration;
        } else {
          // Segment en cours
          const duration = Math.floor((Date.now() - arrival.timestamp.getTime()) / 1000);
          totalSeconds += duration;
        }
      }
    }
    
    setWorkingTime(totalSeconds);
  };

  // ========================================
  // 📊 CALCULER LES STATISTIQUES
  // ========================================
  const calculateStats = (pointagesData) => {
    // Grouper par jour
    const dayGroups = {};
    pointagesData
      .filter(p => p.status !== 'deleted')
      .forEach(pointage => {
        const dayKey = pointage.date.toDateString();
        if (!dayGroups[dayKey]) {
          dayGroups[dayKey] = [];
        }
        dayGroups[dayKey].push(pointage);
      });

    // Calculer les heures totales
    let totalSeconds = 0;
    let completeDays = 0;
    
    Object.values(dayGroups).forEach(dayPointages => {
      dayPointages.sort((a, b) => a.timestamp - b.timestamp);
      
      let daySeconds = 0;
      let hasCompleteSegment = false;
      
      for (let i = 0; i < dayPointages.length; i += 2) {
        const arrival = dayPointages[i];
        const departure = dayPointages[i + 1];
        
        if (arrival?.type === 'arrival' && departure?.type === 'departure') {
          const duration = Math.floor((departure.timestamp - arrival.timestamp) / 1000);
          daySeconds += duration;
          hasCompleteSegment = true;
        }
      }
      
      if (hasCompleteSegment) {
        totalSeconds += daySeconds;
        completeDays++;
      }
    });

    const totalHours = Math.floor(totalSeconds / 3600);
    const averageHours = completeDays > 0 ? Math.floor(totalHours / completeDays) : 0;

    // Calculer les heures de la semaine
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let weekSeconds = 0;
    Object.entries(dayGroups).forEach(([dayKey, dayPointages]) => {
      const dayDate = new Date(dayKey);
      if (dayDate >= startOfWeek) {
        dayPointages.sort((a, b) => a.timestamp - b.timestamp);
        
        for (let i = 0; i < dayPointages.length; i += 2) {
          const arrival = dayPointages[i];
          const departure = dayPointages[i + 1];
          
          if (arrival?.type === 'arrival' && departure?.type === 'departure') {
            const duration = Math.floor((departure.timestamp - arrival.timestamp) / 1000);
            weekSeconds += duration;
          }
        }
      }
    });

    const thisWeekHours = Math.floor(weekSeconds / 3600);

    setStats({
      totalDays: Object.keys(dayGroups).length,
      totalHours,
      averageHours,
      thisWeekHours
    });
  };

  // ========================================
  // ⏱️ EFFET TEMPS DE TRAVAIL EN DIRECT
  // ========================================
  useEffect(() => {
    if (!isCurrentlyWorking || !currentSegmentStart) return;

    const interval = setInterval(() => {
      calculateTodayWorkTime(todayPointages);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCurrentlyWorking, currentSegmentStart, todayPointages]);

  // ========================================
  // 🎨 FORMATAGE DU TEMPS
  // ========================================
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    }
    return `${minutes} min`;
  };

  const formatHour = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ========================================
  // 🚪 POINTER L'ARRIVÉE
  // ========================================
  const handleArrival = async () => {
    if (!user?.uid) {
      alert('⚠️ Vous devez être connecté pour pointer');
      return;
    }

    if (isCurrentlyWorking) {
      alert('⚠️ Vous êtes déjà au travail. Pointez votre départ avant de repointer une arrivée.');
      return;
    }

    try {
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);
      
      await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        type: 'arrival',
        timestamp: timestamp,
        date: timestamp,
        status: 'active',
        validated: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [BADGEUSE] Arrivée pointée');

    } catch (error) {
      console.error('❌ [BADGEUSE] Erreur pointage arrivée:', error);
      alert('❌ Erreur lors du pointage de l\'arrivée');
    }
  };

  // ========================================
  // 🚪 POINTER LE DÉPART
  // ========================================
  const handleDeparture = async () => {
    if (!user?.uid) {
      alert('⚠️ Vous devez être connecté pour pointer');
      return;
    }

    if (!isCurrentlyWorking) {
      alert('⚠️ Vous devez d\'abord pointer votre arrivée');
      return;
    }

    try {
      const now = new Date();
      const timestamp = Timestamp.fromDate(now);
      
      await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        type: 'departure',
        timestamp: timestamp,
        date: timestamp,
        status: 'active',
        validated: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [BADGEUSE] Départ pointé');

    } catch (error) {
      console.error('❌ [BADGEUSE] Erreur pointage départ:', error);
      alert('❌ Erreur lors du pointage du départ');
    }
  };

  // ========================================
  // 🗑️ SUPPRIMER UN POINTAGE
  // ========================================
  const deletePointage = async (pointageId) => {
    if (!confirm('❓ Supprimer ce pointage ?')) return;

    try {
      const pointageRef = doc(db, 'timeEntries', pointageId);
      await updateDoc(pointageRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });

      console.log('🗑️ [BADGEUSE] Pointage supprimé:', pointageId);

    } catch (error) {
      console.error('❌ [BADGEUSE] Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // ========================================
  // 📊 GROUPER LES POINTAGES DU JOUR PAR SEGMENTS
  // ========================================
  const getTodaySegments = () => {
    const segments = [];
    
    for (let i = 0; i < todayPointages.length; i += 2) {
      const arrival = todayPointages[i];
      const departure = todayPointages[i + 1];
      
      if (arrival && arrival.type === 'arrival') {
        segments.push({
          arrival,
          departure: departure?.type === 'departure' ? departure : null,
          isActive: !departure || departure.type !== 'departure'
        });
      }
    }
    
    return segments;
  };

  // ========================================
  // 🎨 RENDER
  // ========================================
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ========================================
              HEADER
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  🕐 Badgeuse
                </h1>
                <p className="text-gray-400 text-lg">
                  Pointage arrivée et départ - Multiple pointages autorisés
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
                STATS CARDS
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
                <div className="text-3xl font-bold mb-1">{formatTime(workingTime)}</div>
                <div className="text-sm opacity-75">Temps total travaillé</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-sm font-medium opacity-90">Cette semaine</h3>
                </div>
                <div className="text-3xl font-bold mb-1">{stats.thisWeekHours}h</div>
                <div className="text-sm opacity-75">Heures travaillées</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Coffee className="w-6 h-6" />
                  <h3 className="text-sm font-medium opacity-90">Segments</h3>
                </div>
                <div className="text-3xl font-bold mb-1">{getTodaySegments().length}</div>
                <div className="text-sm opacity-75">Pointages aujourd'hui</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl p-6 text-white ${
                  isCurrentlyWorking
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className={`w-6 h-6 ${isCurrentlyWorking ? 'animate-pulse' : ''}`} />
                  <h3 className="text-sm font-medium opacity-90">Statut</h3>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {isCurrentlyWorking ? 'Au travail' : 'Hors travail'}
                </div>
                <div className="text-sm opacity-75">
                  {isCurrentlyWorking 
                    ? `Depuis ${formatHour(currentSegmentStart)}`
                    : 'Disponible pour pointer'
                  }
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ========================================
              BOUTONS DE POINTAGE
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mb-8"
          >
            <div className="text-center">
              {/* Heure actuelle */}
              <div className="mb-8">
                <div className="text-6xl font-mono font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {new Date().toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-xl text-gray-400">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Boutons de pointage */}
              <div className="flex justify-center gap-6 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleArrival}
                  disabled={isCurrentlyWorking}
                  className={`flex items-center gap-3 px-12 py-6 rounded-xl shadow-xl text-xl font-bold transition-all ${
                    isCurrentlyWorking
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/50'
                  }`}
                >
                  <LogIn className="w-8 h-8" />
                  <div className="text-left">
                    <div>Pointer l'arrivée</div>
                    <div className="text-sm font-normal opacity-75">
                      {isCurrentlyWorking ? 'Déjà au travail' : 'Commencer un segment'}
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeparture}
                  disabled={!isCurrentlyWorking}
                  className={`flex items-center gap-3 px-12 py-6 rounded-xl shadow-xl text-xl font-bold transition-all ${
                    !isCurrentlyWorking
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-red-500/50'
                  }`}
                >
                  <LogOut className="w-8 h-8" />
                  <div className="text-left">
                    <div>Pointer le départ</div>
                    <div className="text-sm font-normal opacity-75">
                      {!isCurrentlyWorking ? 'Pas au travail' : 'Terminer le segment'}
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Info multi-pointages */}
              <div className="mt-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-400 font-medium">
                    Synchronisé en temps réel avec Firebase
                  </span>
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg ml-2">
                  <Coffee className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400 font-medium">
                    Multiple pointages autorisés (pause déjeuner, etc.)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========================================
              SEGMENTS DU JOUR
          ======================================== */}
          {todayPointages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 mb-8"
            >
              <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                <Coffee className="w-6 h-6 text-purple-400" />
                Segments de travail aujourd'hui
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTodaySegments().map((segment, index) => {
                  const duration = segment.departure 
                    ? Math.floor((segment.departure.timestamp - segment.arrival.timestamp) / 1000)
                    : Math.floor((Date.now() - segment.arrival.timestamp.getTime()) / 1000);

                  return (
                    <motion.div
                      key={segment.arrival.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gray-800/50 rounded-lg p-5 border ${
                        segment.isActive 
                          ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                          : 'border-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            segment.isActive ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                          }`} />
                          <span className="font-semibold text-white">
                            Segment {index + 1}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-white">
                          {formatTime(duration)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Arrivée</div>
                          <div className="flex items-center gap-2 text-green-400 font-semibold">
                            <LogIn className="w-4 h-4" />
                            {formatHour(segment.arrival.timestamp)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Départ</div>
                          <div className="flex items-center gap-2 text-red-400 font-semibold">
                            <LogOut className="w-4 h-4" />
                            {segment.departure 
                              ? formatHour(segment.departure.timestamp)
                              : 'En cours...'
                            }
                          </div>
                        </div>
                      </div>

                      {segment.isActive && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="text-xs text-green-400 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Segment actif
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ========================================
              HISTORIQUE DES POINTAGES
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                Historique des pointages
              </h3>
              <span className="text-sm text-gray-400">
                {pointages.filter(p => p.status !== 'deleted').length} pointage{pointages.filter(p => p.status !== 'deleted').length > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Chargement des pointages...</p>
              </div>
            ) : pointages.filter(p => p.status !== 'deleted').length > 0 ? (
              <div className="space-y-3">
                {pointages
                  .filter(p => p.status !== 'deleted')
                  .map((pointage, index) => (
                    <motion.div
                      key={pointage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-800/50 rounded-lg p-5 hover:bg-gray-700/50 transition-all border border-gray-700/50 hover:border-purple-500/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-3 rounded-lg ${
                            pointage.type === 'arrival' 
                              ? 'bg-green-500/20' 
                              : 'bg-red-500/20'
                          }`}>
                            {pointage.type === 'arrival' ? (
                              <LogIn className="w-6 h-6 text-green-400" />
                            ) : (
                              <LogOut className="w-6 h-6 text-red-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-lg">
                              {pointage.type === 'arrival' ? 'Arrivée' : 'Départ'}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {pointage.date.toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-white font-bold text-2xl">
                              {formatHour(pointage.timestamp)}
                            </div>
                            <div className={`text-sm ${
                              pointage.validated 
                                ? 'text-green-400' 
                                : 'text-yellow-400'
                            }`}>
                              {pointage.validated ? '✓ Validé' : '⏳ En attente'}
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deletePointage(pointage.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/50 transition-all"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Timer className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Aucun pointage enregistré</h3>
                <p className="text-gray-400 text-lg mb-6">
                  Pointez votre arrivée pour commencer
                </p>
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
              ☕ Vous pouvez pointer et dépointer plusieurs fois par jour (pause déjeuner, etc.)
              <br />
              📊 Les données seront validées par l'admin et synchronisées avec le planning
              <br />
              💰 Elles serviront à générer les éléments de fiche de paie
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TimeTrackPage;
