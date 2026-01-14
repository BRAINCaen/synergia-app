// ==========================================
// BadgeuseSection - Time tracking with geofencing
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, LogIn, LogOut, TrendingUp, Coffee, X, MapPin,
  AlertTriangle, Navigation, Shield
} from 'lucide-react';
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, Timestamp, updateDoc, doc, getDoc
} from 'firebase/firestore';
import { db } from '../../../core/firebase.js';
import ClockOutMoodModal from '../../wellbeing/ClockOutMoodModal.jsx';
import wellbeingService from '../../../core/services/wellbeingService.js';

const BadgeuseSection = ({ user }) => {
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayPointages, setTodayPointages] = useState([]);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [currentSegmentStart, setCurrentSegmentStart] = useState(null);
  const [workingTime, setWorkingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({ thisWeekHours: 0 });

  // Wellbeing states
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [pendingDepartureData, setPendingDepartureData] = useState(null);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  // Geofencing states
  const [geofenceSettings, setGeofenceSettings] = useState({
    enabled: false,
    latitude: 49.1829,
    longitude: -0.3707,
    radius: 100,
    workplaceName: 'Lieu de travail'
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState(null);
  const [distanceFromWork, setDistanceFromWork] = useState(null);

  // Load geofence settings
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
            workplaceName: data.workplaceName ?? 'Lieu de travail',
            remoteAuthorizedUsers: data.remoteAuthorizedUsers ?? [],
            remoteAuthorizationReason: data.remoteAuthorizationReason ?? {}
          });
        }
      } catch (error) {
        console.error('Error loading geofencing:', error);
      }
    };
    loadGeofenceSettings();
  }, []);

  // Calculate distance (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Check current location
  const checkCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      setLocationStatus('loading');
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setCurrentLocation({ latitude, longitude, accuracy });

          const distance = calculateDistance(
            latitude, longitude,
            geofenceSettings.latitude, geofenceSettings.longitude
          );
          setDistanceFromWork(Math.round(distance));

          const isWithinZone = distance <= geofenceSettings.radius;
          setLocationStatus(isWithinZone ? 'success' : 'outside');

          resolve({ latitude, longitude, accuracy, distance, isWithinZone });
        },
        (error) => {
          let errorMessage = 'Erreur de géolocalisation';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Accès à la localisation refusé';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position indisponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai dépassé';
              break;
          }
          setLocationError(errorMessage);
          setLocationStatus('error');
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }, [geofenceSettings]);

  useEffect(() => {
    if (geofenceSettings.enabled) {
      checkCurrentLocation().catch(() => {});
    }
  }, [geofenceSettings.enabled, checkCurrentLocation]);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load pointages
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
      console.error('Error loading pointages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

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
      setCurrentSegmentStart(isWorking ? lastPointage.timestamp : null);
    } else {
      setIsCurrentlyWorking(false);
      setCurrentSegmentStart(null);
    }

    calculateTodayWorkTime(todayData);
  };

  const calculateTodayWorkTime = (todayData) => {
    let totalSeconds = 0;

    for (let i = 0; i < todayData.length; i += 2) {
      const arrival = todayData[i];
      const departure = todayData[i + 1];

      if (arrival && arrival.type === 'arrival') {
        if (departure && departure.type === 'departure') {
          totalSeconds += Math.floor((departure.timestamp - arrival.timestamp) / 1000);
        } else {
          totalSeconds += Math.floor((Date.now() - arrival.timestamp.getTime()) / 1000);
        }
      }
    }

    setWorkingTime(totalSeconds);
  };

  const calculateStats = (pointagesData) => {
    const dayGroups = {};
    pointagesData
      .filter(p => p.status !== 'deleted')
      .forEach(pointage => {
        const dayKey = pointage.date.toDateString();
        if (!dayGroups[dayKey]) dayGroups[dayKey] = [];
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
            weekSeconds += Math.floor((departure.timestamp - arrival.timestamp) / 1000);
          }
        }
      }
    });

    setStats({ thisWeekHours: Math.floor(weekSeconds / 3600) });
  };

  useEffect(() => {
    if (!isCurrentlyWorking || !currentSegmentStart) return;
    const interval = setInterval(() => calculateTodayWorkTime(todayPointages), 1000);
    return () => clearInterval(interval);
  }, [isCurrentlyWorking, currentSegmentStart, todayPointages]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${minutes}min`;
  };

  const formatHour = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const isAuthorizedForRemote = user?.uid && (geofenceSettings.remoteAuthorizedUsers || []).includes(user.uid);
  const remoteAuthReason = isAuthorizedForRemote ? (geofenceSettings.remoteAuthorizationReason || {})[user.uid] : null;

  const handleArrival = async () => {
    if (!user?.uid || isCurrentlyWorking) return;

    try {
      let locationData = null;

      if (geofenceSettings.enabled && !isAuthorizedForRemote) {
        setLocationStatus('loading');
        try {
          const location = await checkCurrentLocation();
          if (!location.isWithinZone) {
            alert(`⚠️ Pointage impossible !\n\nVous êtes à ${Math.round(location.distance)}m du lieu de travail.\nZone autorisée : ${geofenceSettings.radius}m.`);
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
          alert(`⚠️ Impossible de vérifier votre position.\n\n${geoError.message}`);
          return;
        }
      } else if (geofenceSettings.enabled && isAuthorizedForRemote) {
        try {
          const location = await checkCurrentLocation();
          locationData = {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            distanceFromWork: Math.round(location.distance),
            withinGeofence: location.isWithinZone,
            remoteAuthorized: true,
            remoteReason: remoteAuthReason || 'Déplacement autorisé'
          };
        } catch {
          locationData = {
            remoteAuthorized: true,
            remoteReason: remoteAuthReason || 'Déplacement autorisé',
            positionUnavailable: true
          };
        }
      }

      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        type: 'arrival',
        timestamp,
        date: timestamp,
        status: 'active',
        validated: false,
        ...(locationData && { location: locationData }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error arrival:', error);
      alert('Erreur lors du pointage');
    }
  };

  const handleDeparture = async () => {
    if (!user?.uid || !isCurrentlyWorking) return;

    try {
      let locationData = null;

      if (geofenceSettings.enabled && !isAuthorizedForRemote) {
        setLocationStatus('loading');
        try {
          const location = await checkCurrentLocation();
          if (!location.isWithinZone) {
            alert(`⚠️ Pointage impossible !\n\nVous êtes à ${Math.round(location.distance)}m du lieu de travail.`);
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
          alert(`⚠️ Impossible de vérifier votre position.\n\n${geoError.message}`);
          return;
        }
      } else if (geofenceSettings.enabled && isAuthorizedForRemote) {
        try {
          const location = await checkCurrentLocation();
          locationData = {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            distanceFromWork: Math.round(location.distance),
            withinGeofence: location.isWithinZone,
            remoteAuthorized: true,
            remoteReason: remoteAuthReason || 'Déplacement autorisé'
          };
        } catch {
          locationData = {
            remoteAuthorized: true,
            remoteReason: remoteAuthReason || 'Déplacement autorisé',
            positionUnavailable: true
          };
        }
      }

      setPendingDepartureData({ locationData });
      setShowMoodModal(true);
    } catch (error) {
      console.error('Error departure:', error);
      alert('Erreur lors du pointage');
    }
  };

  const handleMoodSubmit = async (moodData) => {
    setIsSubmittingMood(true);

    try {
      if (moodData) {
        await wellbeingService.recordExitMood(user.uid, moodData);
      }

      const now = new Date();
      const timestamp = Timestamp.fromDate(now);

      await addDoc(collection(db, 'timeEntries'), {
        userId: user.uid,
        type: 'departure',
        timestamp,
        date: timestamp,
        status: 'active',
        validated: false,
        ...(pendingDepartureData?.locationData && { location: pendingDepartureData.locationData }),
        ...(moodData && { exitMood: moodData.mood }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error departure:', error);
      alert('Erreur lors du pointage');
    } finally {
      setIsSubmittingMood(false);
      setShowMoodModal(false);
      setPendingDepartureData(null);
    }
  };

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
      {/* Clock and buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-sm text-gray-400">
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>

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

        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCurrentlyWorking ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className={`text-sm ${isCurrentlyWorking ? 'text-green-400' : 'text-gray-400'}`}>
            {isCurrentlyWorking ? `Au travail depuis ${formatHour(currentSegmentStart)}` : 'Hors travail'}
          </span>
        </div>

        {/* Geofencing status */}
        {geofenceSettings.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-xl border ${
              isAuthorizedForRemote
                ? 'bg-teal-500/10 border-teal-500/30'
                : locationStatus === 'success'
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
                {isAuthorizedForRemote ? (
                  <>
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <div className="text-left">
                      <span className="text-teal-300 text-sm font-medium block">Pointage à distance autorisé</span>
                      {remoteAuthReason && <span className="text-teal-400/70 text-xs">{remoteAuthReason}</span>}
                    </div>
                  </>
                ) : locationStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                    <span className="text-blue-300 text-sm">Vérification position...</span>
                  </>
                ) : locationStatus === 'success' ? (
                  <>
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">Zone autorisée ({distanceFromWork}m)</span>
                  </>
                ) : locationStatus === 'outside' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-sm">Hors zone ! ({distanceFromWork}m - max {geofenceSettings.radius}m)</span>
                  </>
                ) : locationStatus === 'error' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-300 text-sm">{locationError || 'Erreur'}</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">Géofencing actif</span>
                  </>
                )}
              </div>
              {!isAuthorizedForRemote && (
                <button
                  onClick={() => checkCurrentLocation().catch(() => {})}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Navigation className={`w-4 h-4 ${locationStatus === 'loading' ? 'animate-spin text-blue-400' : 'text-gray-400 hover:text-white'}`} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Day stats */}
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

      {/* Day segments */}
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
            {getTodaySegments().map((segment) => {
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

      {/* Mood modal */}
      <ClockOutMoodModal
        isOpen={showMoodModal}
        onClose={() => {
          setShowMoodModal(false);
          setPendingDepartureData(null);
        }}
        onSubmit={handleMoodSubmit}
        isLoading={isSubmittingMood}
        userName={user?.displayName?.split(' ')[0] || ''}
      />
    </div>
  );
};

export default BadgeuseSection;
