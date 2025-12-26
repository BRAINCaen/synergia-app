// ==========================================
// react-app/src/pages/PulsePage.jsx
// PAGE PULSE + BADGEUSE - SYNERGIA v4.1
// Module Pulse: Check-in quotidien + Pointage avec Géofencing
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  Award,
  Flame,
  Check,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  BarChart3,
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  Coffee,
  Timer,
  X,
  MapPin,
  AlertTriangle,
  Navigation,
  Shield
} from 'lucide-react';

// Firebase imports
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
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

import Layout from '../components/layout/Layout.jsx';
import { usePulse } from '../shared/hooks/usePulse.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// COMPOSANT CHECK-IN PULSE
// ==========================================
const PulseCheckIn = ({ onSubmit, submitting, MOOD_LEVELS, ENERGY_LEVELS }) => {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [note, setNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!mood || !energy) return;

    onSubmit({
      mood,
      energy,
      note,
      isAnonymous
    });
  };

  const moodOptions = Object.values(MOOD_LEVELS);
  const energyOptions = Object.values(ENERGY_LEVELS);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
    >
      <div className="text-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-3"
        >
          <Heart className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-1">Comment allez-vous ?</h2>
        <p className="text-gray-400 text-sm">Votre check-in quotidien</p>
      </div>

      {/* Etape 1: Humeur */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              1. Comment est votre humeur ?
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {moodOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setMood(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                    ${mood === option.id
                      ? `bg-gradient-to-br ${option.color} border-white/50 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-[10px] font-medium ${mood === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => mood && setStep(2)}
              disabled={!mood}
              className={`
                w-full py-2.5 rounded-xl font-semibold transition-all text-sm
                ${mood
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Continuer
            </button>
          </motion.div>
        )}

        {/* Etape 2: Energie */}
        {step === 2 && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              2. Quel est votre niveau d'energie ?
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {energyOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setEnergy(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                    ${energy === option.id
                      ? `bg-gradient-to-br ${option.color} border-white/50 shadow-lg`
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className={`text-[10px] font-medium ${energy === option.id ? 'text-white' : 'text-gray-400'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
              >
                Retour
              </button>
              <button
                onClick={() => energy && setStep(3)}
                disabled={!energy}
                className={`
                  flex-1 py-2.5 rounded-xl font-semibold transition-all text-sm
                  ${energy
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Etape 3: Note optionnelle */}
        {step === 3 && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-sm font-semibold text-white mb-3 text-center">
              3. Un commentaire ? (optionnel)
            </h3>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Partagez ce qui vous preoccupe ou vous motive..."
              className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-3 text-sm"
            />

            {/* Option anonyme */}
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`
                w-full flex items-center justify-center gap-2 p-2.5 rounded-xl mb-4 transition-all text-sm
                ${isAnonymous
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }
              `}
            >
              {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>
                {isAnonymous ? 'Reponse anonyme' : 'Rendre anonyme'}
              </span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur d'etapes */}
      <div className="flex justify-center gap-2 mt-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 w-4' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT PULSE FAIT AUJOURD'HUI
// ==========================================
const TodayPulseCard = ({ pulse, MOOD_LEVELS, ENERGY_LEVELS }) => {
  const moodInfo = MOOD_LEVELS[pulse.mood];
  const energyInfo = ENERGY_LEVELS[pulse.energy];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/30 rounded-xl">
          <Check className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Pulse enregistre !</h3>
          <p className="text-green-300/70 text-xs">+10 XP gagnes</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Humeur */}
        <div className={`p-3 rounded-xl ${moodInfo?.bgColor || 'bg-gray-500/20'}`}>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{moodInfo?.emoji || '😐'}</span>
            <div>
              <p className="text-[10px] text-gray-400">Humeur</p>
              <p className={`font-bold text-sm ${moodInfo?.textColor || 'text-white'}`}>
                {moodInfo?.label || 'Correct'}
              </p>
            </div>
          </div>
        </div>

        {/* Energie */}
        <div className="p-3 rounded-xl bg-yellow-500/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{energyInfo?.emoji || '🔌'}</span>
            <div>
              <p className="text-[10px] text-gray-400">Energie</p>
              <p className="font-bold text-sm text-yellow-400">
                {energyInfo?.label || 'Moyenne'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pulse.note && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
            <p className="text-gray-300 text-xs">{pulse.note}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT STATS EQUIPE
// ==========================================
const TeamPulseStats = ({ teamPulse, MOOD_LEVELS }) => {
  if (!teamPulse || teamPulse.totalResponses === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <Users className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Pas encore de donnees d'equipe</p>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (teamPulse.trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (teamPulse.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getMoodColor = (value) => {
    if (value >= 4) return 'text-green-400';
    if (value >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Pulse Equipe
        </h3>
        <div className="flex items-center gap-1 text-xs">
          {getTrendIcon()}
          <span className={
            teamPulse.trend === 'up' ? 'text-green-400' :
            teamPulse.trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }>
            {teamPulse.trend === 'up' ? 'Hausse' :
             teamPulse.trend === 'down' ? 'Baisse' : 'Stable'}
          </span>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className={`text-2xl font-bold ${getMoodColor(parseFloat(teamPulse.averageMood))}`}>
            {teamPulse.averageMood}
          </p>
          <p className="text-[10px] text-gray-400">Humeur</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-yellow-400">{teamPulse.averageEnergy}</p>
          <p className="text-[10px] text-gray-400">Energie</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-2xl font-bold text-purple-400">{teamPulse.totalResponses}</p>
          <p className="text-[10px] text-gray-400">Reponses</p>
        </div>
      </div>

      {/* Distribution des humeurs */}
      <div className="space-y-1.5">
        {Object.entries(teamPulse.moodDistribution || {}).map(([moodId, count]) => {
          const moodInfo = MOOD_LEVELS[moodId];
          const percent = (count / teamPulse.totalResponses) * 100;

          return (
            <div key={moodId} className="flex items-center gap-2">
              <span className="text-lg w-6">{moodInfo?.emoji || '😐'}</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${moodInfo?.color || 'from-gray-500 to-gray-600'}`}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT STATS PERSONNELLES PULSE
// ==========================================
const UserPulseStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5"
    >
      <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Award className="w-4 h-4 text-yellow-400" />
        Vos Stats Pulse
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Serie */}
        <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className={`w-4 h-4 ${stats.streak >= 7 ? 'text-orange-400' : 'text-gray-400'}`} />
            <span className="text-xs text-gray-400">Serie</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.streak} <span className="text-xs text-gray-400">j</span>
          </p>
        </div>

        {/* Total */}
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.totalPulses}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT BADGEUSE (POINTAGE) AVEC GÉOFENCING
// ==========================================
const BadgeuseSection = ({ user }) => {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayPointages, setTodayPointages] = useState([]);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentSegmentStart, setCurrentSegmentStart] = useState(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    thisWeekHours: 0
  });

  // 📍 GÉOFENCING - États
  const [geofenceSettings, setGeofenceSettings] = useState({
    enabled: false,
    latitude: 49.1829, // Coordonnées par défaut (Caen)
    longitude: -0.3707,
    radius: 100, // Rayon en mètres
    workplaceName: 'Lieu de travail'
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error, outside
  const [locationError, setLocationError] = useState(null);
  const [distanceFromWork, setDistanceFromWork] = useState(null);

  // 📍 Charger les paramètres de géofencing
  useEffect(() => {
    const loadGeofenceSettings = async () => {
      try {
        const settingsRef = doc(db, 'systemSettings', 'geofencing');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setGeofenceSettings({
            enabled: data.enabled ?? false,
            latitude: data.latitude ?? 49.1829,
            longitude: data.longitude ?? -0.3707,
            radius: data.radius ?? 100,
            workplaceName: data.workplaceName ?? 'Lieu de travail'
          });
          console.log('📍 Géofencing chargé:', data.enabled ? 'ACTIF' : 'INACTIF');
        }
      } catch (error) {
        console.error('❌ Erreur chargement géofencing:', error);
      }
    };

    loadGeofenceSettings();
  }, []);

  // 📍 Calculer la distance entre deux points (formule Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  };

  // 📍 Vérifier la position actuelle
  const checkCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée par ce navigateur'));
        return;
      }

      setLocationStatus('loading');
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCurrentLocation({ latitude, longitude, accuracy });

          // Calculer la distance depuis le lieu de travail
          const distance = calculateDistance(
            latitude, longitude,
            geofenceSettings.latitude, geofenceSettings.longitude
          );
          setDistanceFromWork(Math.round(distance));

          // Vérifier si dans la zone autorisée
          const isWithinZone = distance <= geofenceSettings.radius;
          setLocationStatus(isWithinZone ? 'success' : 'outside');

          console.log(`📍 Position: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | Distance: ${Math.round(distance)}m | Zone: ${isWithinZone ? '✅' : '❌'}`);

          resolve({ latitude, longitude, accuracy, distance, isWithinZone });
        },
        (error) => {
          let errorMessage = 'Erreur de géolocalisation';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Accès à la localisation refusé. Autorisez l\'accès dans les paramètres.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position indisponible. Vérifiez votre GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai dépassé pour obtenir la position.';
              break;
          }
          setLocationError(errorMessage);
          setLocationStatus('error');
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }, [geofenceSettings]);

  // 📍 Vérifier la position au chargement si géofencing actif
  useEffect(() => {
    if (geofenceSettings.enabled) {
      checkCurrentLocation().catch(() => {});
    }
  }, [geofenceSettings.enabled, checkCurrentLocation]);

  // Mise a jour de l'heure
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Chargement des pointages Firebase
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const pointagesQuery = query(
      collection(db, 'timeEntries'),
      where('userId', '==', user.uid),
      where('date', '>=', Timestamp.fromDate(startOfMonth)),
      orderBy('date', 'desc'),
      orderBy('timestamp', 'desc')
    );

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

      setPointages(pointagesData);
      identifyTodayPointages(pointagesData);
      calculateStats(pointagesData);
      setLoading(false);
    }, (error) => {
      console.error('Erreur chargement pointages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Identifier les pointages du jour
  const identifyTodayPointages = (pointagesData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayData = pointagesData.filter(p => {
      const pointageDate = new Date(p.date);
      pointageDate.setHours(0, 0, 0, 0);
      return pointageDate.getTime() === today.getTime() && p.status !== 'deleted';
    }).sort((a, b) => a.timestamp - b.timestamp);

    setTodayPointages(todayData);

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

    calculateTodayWorkTime(todayData);
  };

  // Calculer le temps de travail du jour
  const calculateTodayWorkTime = (todayData) => {
    let totalSeconds = 0;

    for (let i = 0; i < todayData.length; i += 2) {
      const arrival = todayData[i];
      const departure = todayData[i + 1];

      if (arrival && arrival.type === 'arrival') {
        if (departure && departure.type === 'departure') {
          const duration = Math.floor((departure.timestamp - arrival.timestamp) / 1000);
          totalSeconds += duration;
        } else {
          const duration = Math.floor((Date.now() - arrival.timestamp.getTime()) / 1000);
          totalSeconds += duration;
        }
      }
    }

    setWorkingTime(totalSeconds);
  };

  // Calculer les stats
  const calculateStats = (pointagesData) => {
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

    setStats({ thisWeekHours: Math.floor(weekSeconds / 3600) });
  };

  // Mise a jour temps reel du compteur
  useEffect(() => {
    if (!isCurrentlyWorking || !currentSegmentStart) return;

    const interval = setInterval(() => {
      calculateTodayWorkTime(todayPointages);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCurrentlyWorking, currentSegmentStart, todayPointages]);

  // Formatage
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}min`;
  };

  const formatHour = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // 📍 Pointer l'arrivée (avec vérification géofencing)
  const handleArrival = async () => {
    if (!user?.uid || isCurrentlyWorking) return;

    try {
      let locationData = null;

      // Si géofencing activé, vérifier la position
      if (geofenceSettings.enabled) {
        setLocationStatus('loading');
        try {
          const location = await checkCurrentLocation();

          if (!location.isWithinZone) {
            alert(`⚠️ Pointage impossible !\n\nVous êtes à ${Math.round(location.distance)}m du lieu de travail.\nZone autorisée : ${geofenceSettings.radius}m autour de "${geofenceSettings.workplaceName}".`);
            return;
          }

          locationData = {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            distanceFromWork: Math.round(location.distance),
            withinGeofence: true
          };
        } catch (geoError) {
          alert(`⚠️ Impossible de vérifier votre position.\n\n${geoError.message}\n\nActivez la géolocalisation pour pointer.`);
          return;
        }
      }

      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        type: 'arrival',
        timestamp: timestamp,
        date: timestamp,
        status: 'active',
        validated: false,
        ...(locationData && { location: locationData }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Pointage arrivée enregistré', locationData ? `(${locationData.distanceFromWork}m du travail)` : '');
    } catch (error) {
      console.error('Erreur pointage arrivee:', error);
      alert('Erreur lors du pointage');
    }
  };

  // 📍 Pointer le départ (avec vérification géofencing)
  const handleDeparture = async () => {
    if (!user?.uid || !isCurrentlyWorking) return;

    try {
      let locationData = null;

      // Si géofencing activé, vérifier la position
      if (geofenceSettings.enabled) {
        setLocationStatus('loading');
        try {
          const location = await checkCurrentLocation();

          if (!location.isWithinZone) {
            alert(`⚠️ Pointage impossible !\n\nVous êtes à ${Math.round(location.distance)}m du lieu de travail.\nZone autorisée : ${geofenceSettings.radius}m autour de "${geofenceSettings.workplaceName}".`);
            return;
          }

          locationData = {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            distanceFromWork: Math.round(location.distance),
            withinGeofence: true
          };
        } catch (geoError) {
          alert(`⚠️ Impossible de vérifier votre position.\n\n${geoError.message}\n\nActivez la géolocalisation pour pointer.`);
          return;
        }
      }

      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        type: 'departure',
        timestamp: timestamp,
        date: timestamp,
        status: 'active',
        validated: false,
        ...(locationData && { location: locationData }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Pointage départ enregistré', locationData ? `(${locationData.distanceFromWork}m du travail)` : '');
    } catch (error) {
      console.error('Erreur pointage depart:', error);
      alert('Erreur lors du pointage');
    }
  };

  // Supprimer un pointage
  const deletePointage = async (pointageId) => {
    if (!confirm('Supprimer ce pointage ?')) return;

    try {
      const pointageRef = doc(db, 'timeEntries', pointageId);
      await updateDoc(pointageRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // Obtenir les segments du jour
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

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Horloge et boutons de pointage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        {/* Heure actuelle */}
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Boutons de pointage */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleArrival}
            disabled={isCurrentlyWorking}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
              isCurrentlyWorking
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30'
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span>Arrivee</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeparture}
            disabled={!isCurrentlyWorking}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
              !isCurrentlyWorking
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg hover:shadow-red-500/30'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>Depart</span>
          </motion.button>
        </div>

        {/* Statut travail */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCurrentlyWorking ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className={`text-sm ${isCurrentlyWorking ? 'text-green-400' : 'text-gray-400'}`}>
            {isCurrentlyWorking ? `Au travail depuis ${formatHour(currentSegmentStart)}` : 'Hors travail'}
          </span>
        </div>

        {/* 📍 Statut Géofencing */}
        {geofenceSettings.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-xl border ${
              locationStatus === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : locationStatus === 'outside'
                ? 'bg-red-500/10 border-red-500/30'
                : locationStatus === 'error'
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {locationStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                    <span className="text-blue-300 text-sm">Vérification position...</span>
                  </>
                ) : locationStatus === 'success' ? (
                  <>
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">
                      Zone autorisée ({distanceFromWork}m de {geofenceSettings.workplaceName})
                    </span>
                  </>
                ) : locationStatus === 'outside' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-sm">
                      Hors zone ! ({distanceFromWork}m - max {geofenceSettings.radius}m)
                    </span>
                  </>
                ) : locationStatus === 'error' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-300 text-sm text-left">
                      {locationError || 'Erreur de localisation'}
                    </span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">Géofencing actif</span>
                  </>
                )}
              </div>
              <button
                onClick={() => checkCurrentLocation().catch(() => {})}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Actualiser ma position"
              >
                <Navigation className={`w-4 h-4 ${locationStatus === 'loading' ? 'animate-spin text-blue-400' : 'text-gray-400 hover:text-white'}`} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats du jour */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs opacity-80">Aujourd'hui</span>
          </div>
          <div className="text-2xl font-bold">{formatTime(workingTime)}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs opacity-80">Semaine</span>
          </div>
          <div className="text-2xl font-bold">{stats.thisWeekHours}h</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-2 mb-1">
            <Coffee className="w-4 h-4" />
            <span className="text-xs opacity-80">Segments</span>
          </div>
          <div className="text-2xl font-bold">{getTodaySegments().length}</div>
        </motion.div>
      </div>

      {/* Segments du jour */}
      {todayPointages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Coffee className="w-4 h-4 text-purple-400" />
            Segments du jour
          </h3>

          <div className="space-y-2">
            {getTodaySegments().map((segment, index) => {
              const duration = segment.departure
                ? Math.floor((segment.departure.timestamp - segment.arrival.timestamp) / 1000)
                : Math.floor((Date.now() - segment.arrival.timestamp.getTime()) / 1000);

              return (
                <div
                  key={segment.arrival.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    segment.isActive
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${segment.isActive ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                    <span className="text-sm text-white">
                      {formatHour(segment.arrival.timestamp)} - {segment.departure ? formatHour(segment.departure.timestamp) : 'En cours'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">{formatTime(duration)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================
const PulsePage = () => {
  const { user } = useAuthStore();
  const {
    loading,
    submitting,
    hasPulseToday,
    todayPulse,
    userStats,
    teamPulse,
    submitPulse,
    refresh,
    MOOD_LEVELS,
    ENERGY_LEVELS
  } = usePulse({ realTimeTeam: true });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500/30 to-rose-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400" />
            </motion.div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-slate-500/30 to-blue-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <span className="text-2xl sm:text-3xl">🛡️</span>
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    Poste de Garde
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                    Pointez votre arrivée et indiquez votre état
                  </p>
                </div>
              </div>

              <motion.button
                onClick={refresh}
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 sm:p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </motion.button>
            </div>

            {/* XP Bonus Banner */}
            {!hasPulseToday && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-yellow-300 font-medium text-sm">Bonus disponible !</p>
                  <p className="text-yellow-200/70 text-xs">Completez votre pulse pour gagner +10 XP</p>
                </div>
                <div className="text-xl font-bold text-yellow-400">+10 XP</div>
              </motion.div>
            )}
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Colonne 1 - Badgeuse */}
            <div className="lg:col-span-1">
              <BadgeuseSection user={user} />
            </div>

            {/* Colonne 2 - Pulse Check-in */}
            <div className="lg:col-span-1 space-y-4">
              {hasPulseToday && todayPulse ? (
                <TodayPulseCard
                  pulse={todayPulse}
                  MOOD_LEVELS={MOOD_LEVELS}
                  ENERGY_LEVELS={ENERGY_LEVELS}
                />
              ) : (
                <PulseCheckIn
                  onSubmit={submitPulse}
                  submitting={submitting}
                  MOOD_LEVELS={MOOD_LEVELS}
                  ENERGY_LEVELS={ENERGY_LEVELS}
                />
              )}

              {/* Stats personnelles */}
              <UserPulseStats stats={userStats} />
            </div>

            {/* Colonne 3 - Stats Equipe */}
            <div className="lg:col-span-1 space-y-4">
              <TeamPulseStats
                teamPulse={teamPulse}
                MOOD_LEVELS={MOOD_LEVELS}
              />

              {/* Info */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4" />
                  Pourquoi le Pulse ?
                </h4>
                <ul className="space-y-1.5 text-xs text-purple-200/70">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Suivez votre bien-etre au fil du temps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Aidez l'equipe a detecter les periodes difficiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Gagnez des XP chaque jour (+10 XP)</span>
                  </li>
                </ul>
              </div>

              {/* Info Badgeuse */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  Badgeuse
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-200/70 mb-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Pointez vos arrivees et departs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Multiple pointages (pause dejeuner)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Synchronise en temps reel avec Firebase</span>
                  </li>
                </ul>
                <a
                  href="/hr"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-medium transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Voir historique complet (RH)
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PulsePage;
