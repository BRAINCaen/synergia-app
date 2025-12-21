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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-8">

          {/* ========================================
              HEADER
          ======================================== */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Badgeuse
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg">
                  Pointage arrivée et départ
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </motion.button>
              </div>
            </div>

            {/* ========================================
                STATS CARDS
            ======================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/80 to-cyan-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="text-xs sm:text-sm font-medium opacity-90">Aujourd'hui</h3>
                </div>
                <div className="text-xl sm:text-3xl font-bold mb-1">{formatTime(workingTime)}</div>
                <div className="text-xs sm:text-sm opacity-75">Temps travaillé</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500/80 to-emerald-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="text-xs sm:text-sm font-medium opacity-90">Semaine</h3>
                </div>
                <div className="text-xl sm:text-3xl font-bold mb-1">{stats.thisWeekHours}h</div>
                <div className="text-xs sm:text-sm opacity-75">Heures</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-white border border-white/20"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="text-xs sm:text-sm font-medium opacity-90">Segments</h3>
                </div>
                <div className="text-xl sm:text-3xl font-bold mb-1">{getTodaySegments().length}</div>
                <div className="text-xs sm:text-sm opacity-75">Aujourd'hui</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-2xl p-4 sm:p-6 text-white backdrop-blur-xl border border-white/20 ${
                  isCurrentlyWorking
                    ? 'bg-gradient-to-br from-green-500/80 to-green-600/80'
                    : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <CheckCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${isCurrentlyWorking ? 'animate-pulse' : ''}`} />
                  <h3 className="text-xs sm:text-sm font-medium opacity-90">Statut</h3>
                </div>
                <div className="text-lg sm:text-3xl font-bold mb-1">
                  {isCurrentlyWorking ? 'Au travail' : 'Hors'}
                </div>
                <div className="text-xs sm:text-sm opacity-75">
                  {isCurrentlyWorking
                    ? `Depuis ${formatHour(currentSegmentStart)}`
                    : 'Disponible'
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
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-8 border border-white/10 mb-6 sm:mb-8"
          >
            <div className="text-center">
              {/* Heure actuelle */}
              <div className="mb-6 sm:mb-8">
                <div className="text-4xl sm:text-6xl font-mono font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-sm sm:text-xl text-gray-400">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Boutons de pointage */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleArrival}
                  disabled={isCurrentlyWorking}
                  className={`flex items-center gap-3 px-6 sm:px-12 py-4 sm:py-6 rounded-2xl shadow-xl text-base sm:text-xl font-bold transition-all ${
                    isCurrentlyWorking
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/50'
                  }`}
                >
                  <LogIn className="w-6 h-6 sm:w-8 sm:h-8" />
                  <div className="text-left">
                    <div>Pointer l'arrivée</div>
                    <div className="text-xs sm:text-sm font-normal opacity-75">
                      {isCurrentlyWorking ? 'Déjà au travail' : 'Commencer'}
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeparture}
                  disabled={!isCurrentlyWorking}
                  className={`flex items-center gap-3 px-6 sm:px-12 py-4 sm:py-6 rounded-2xl shadow-xl text-base sm:text-xl font-bold transition-all ${
                    !isCurrentlyWorking
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-red-500/50'
                  }`}
                >
                  <LogOut className="w-6 h-6 sm:w-8 sm:h-8" />
                  <div className="text-left">
                    <div>Pointer le départ</div>
                    <div className="text-xs sm:text-sm font-normal opacity-75">
                      {!isCurrentlyWorking ? 'Pas au travail' : 'Terminer'}
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Info multi-pointages */}
              <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-blue-400 font-medium">
                    Sync temps réel
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <Coffee className="w-4 h-4 text-purple-400" />
                  <span className="text-xs sm:text-sm text-purple-400 font-medium">
                    Multi-pointages
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
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-8 border border-white/10 mb-6 sm:mb-8"
            >
              <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                Segments de travail aujourd'hui
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                      whileHover={{ scale: 1.02 }}
                      className={`bg-white/5 backdrop-blur-xl rounded-xl p-4 sm:p-5 border ${
                        segment.isActive
                          ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                            segment.isActive ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                          }`} />
                          <span className="font-semibold text-white text-sm sm:text-base">
                            Segment {index + 1}
                          </span>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-white">
                          {formatTime(duration)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Arrivée</div>
                          <div className="flex items-center gap-2 text-green-400 font-semibold">
                            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {formatHour(segment.arrival.timestamp)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 mb-1">Départ</div>
                          <div className="flex items-center gap-2 text-red-400 font-semibold">
                            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {segment.departure
                              ? formatHour(segment.departure.timestamp)
                              : 'En cours...'
                            }
                          </div>
                        </div>
                      </div>

                      {segment.isActive && (
                        <div className="mt-3 pt-3 border-t border-white/10">
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
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-8 border border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                Historique des pointages
              </h3>
              <span className="text-xs sm:text-sm text-gray-400">
                {pointages.filter(p => p.status !== 'deleted').length} pointage{pointages.filter(p => p.status !== 'deleted').length > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400 text-sm sm:text-base">Chargement des pointages...</p>
              </div>
            ) : pointages.filter(p => p.status !== 'deleted').length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {pointages
                  .filter(p => p.status !== 'deleted')
                  .map((pointage, index) => (
                    <motion.div
                      key={pointage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white/5 backdrop-blur-xl rounded-xl p-3 sm:p-5 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-500/30"
                    >
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:space-x-4 flex-1 min-w-0">
                          <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${
                            pointage.type === 'arrival'
                              ? 'bg-green-500/20'
                              : 'bg-red-500/20'
                          }`}>
                            {pointage.type === 'arrival' ? (
                              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                            ) : (
                              <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm sm:text-lg">
                              {pointage.type === 'arrival' ? 'Arrivée' : 'Départ'}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">
                              {pointage.date.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-white font-bold text-lg sm:text-2xl">
                              {formatHour(pointage.timestamp)}
                            </div>
                            <div className={`text-xs sm:text-sm ${
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
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/50 transition-all"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <Timer className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Aucun pointage enregistré</h3>
                <p className="text-gray-400 text-sm sm:text-lg mb-6">
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
            className="mt-6 sm:mt-8"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">💾</span>
                  <span>Pointages sauvegardés automatiquement</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">☕</span>
                  <span>Multi-pointages par jour (pause déjeuner, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">📊</span>
                  <span>Validation admin et sync planning</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">💰</span>
                  <span>Génération des fiches de paie</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TimeTrackPage;
