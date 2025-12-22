// ==========================================
// react-app/src/components/geolocation/GeoCheckIn.jsx
// POINTAGE GEOLOCALISE - SYNERGIA v4.0
// Module: UI de pointage avec geolocalisation
// ==========================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeolocation, useCheckIn } from '../../hooks/useGeolocation';

export default function GeoCheckIn({ className = '' }) {
  const {
    position,
    error: geoError,
    loading: geoLoading,
    getPosition,
    isSupported
  } = useGeolocation();

  const {
    todayCheckIns,
    loading: checkInLoading,
    nearbyWorkplaces,
    hasArrived,
    hasDeparted,
    workedHours,
    checkIn,
    checkOut,
    autoCheckInEnabled,
    toggleAutoCheckIn
  } = useCheckIn();

  const [showDetails, setShowDetails] = useState(false);
  const [actionError, setActionError] = useState(null);

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = useCallback(async () => {
    setActionError(null);
    try {
      await checkIn({ method: 'manual' });
    } catch (err) {
      setActionError('Erreur lors du pointage');
    }
  }, [checkIn]);

  const handleCheckOut = useCallback(async () => {
    setActionError(null);
    try {
      await checkOut({ method: 'manual' });
    } catch (err) {
      setActionError('Erreur lors du pointage');
    }
  }, [checkOut]);

  const handleGetLocation = useCallback(async () => {
    setActionError(null);
    try {
      await getPosition();
    } catch (err) {
      setActionError('Impossible d\'obtenir la position');
    }
  }, [getPosition]);

  if (!isSupported) {
    return (
      <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <span className="text-4xl block mb-3">📍</span>
          <h3 className="text-lg font-semibold text-white mb-2">Geolocalisation non disponible</h3>
          <p className="text-white/60 text-sm">
            Votre navigateur ne supporte pas la geolocalisation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500
                        rounded-xl flex items-center justify-center text-xl sm:text-2xl">
            📍
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Pointage</h2>
            <p className="text-xs sm:text-sm text-white/60">
              {hasArrived && !hasDeparted ? 'En service' : hasDeparted ? 'Journee terminee' : 'Non pointe'}
            </p>
          </div>
        </div>

        {/* Toggle auto check-in */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 hidden sm:inline">Auto</span>
          <button
            onClick={() => toggleAutoCheckIn(!autoCheckInEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              autoCheckInEnabled ? 'bg-emerald-500' : 'bg-white/10'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              autoCheckInEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Statut du jour */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-white/50 text-xs mb-1">Arrivee</p>
          <p className="text-white font-semibold">
            {hasArrived ? formatTime(todayCheckIns.find(ci => ci.type === 'arrival')?.timestamp) : '--:--'}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-white/50 text-xs mb-1">Depart</p>
          <p className="text-white font-semibold">
            {hasDeparted ? formatTime(todayCheckIns.find(ci => ci.type === 'departure')?.timestamp) : '--:--'}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-white/50 text-xs mb-1">Duree</p>
          <p className="text-white font-semibold">{formatHours(workedHours)}</p>
        </div>
      </div>

      {/* Lieu de travail proche */}
      {nearbyWorkplaces.length > 0 && (
        <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-emerald-400 font-medium text-sm">
                {nearbyWorkplaces[0].name}
              </p>
              <p className="text-white/50 text-xs">
                a {nearbyWorkplaces[0].distance}m
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Position actuelle */}
      {position && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <p className="text-white/70 text-sm">
                {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
              </p>
            </div>
            <span className="text-xs text-white/40">
              ±{Math.round(position.accuracy)}m
            </span>
          </div>
        </div>
      )}

      {/* Erreurs */}
      <AnimatePresence>
        {(geoError || actionError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl"
          >
            <p className="text-red-400 text-sm">
              {actionError || geoError?.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boutons d'action */}
      <div className="grid grid-cols-2 gap-3">
        {!hasArrived ? (
          <>
            <motion.button
              onClick={handleGetLocation}
              disabled={geoLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl
                       text-white font-medium hover:bg-white/10 transition-colors
                       flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {geoLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <span>📍</span>
                  <span>Localiser</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleCheckIn}
              disabled={checkInLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl
                       text-white font-semibold flex items-center justify-center gap-2
                       disabled:opacity-50"
            >
              {checkInLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <span>✅</span>
                  <span>Pointer</span>
                </>
              )}
            </motion.button>
          </>
        ) : !hasDeparted ? (
          <>
            <div className="py-3 px-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl
                          text-emerald-400 font-medium flex items-center justify-center gap-2">
              <span>✅</span>
              <span>En service</span>
            </div>

            <motion.button
              onClick={handleCheckOut}
              disabled={checkInLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl
                       text-white font-semibold flex items-center justify-center gap-2
                       disabled:opacity-50"
            >
              {checkInLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <span>👋</span>
                  <span>Partir</span>
                </>
              )}
            </motion.button>
          </>
        ) : (
          <div className="col-span-2 py-4 bg-white/5 rounded-xl text-center">
            <p className="text-white/60 text-sm">Journee terminee</p>
            <p className="text-white font-semibold mt-1">
              Vous avez travaille {formatHours(workedHours)}
            </p>
          </div>
        )}
      </div>

      {/* Historique du jour */}
      {todayCheckIns.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            {showDetails ? 'Masquer' : 'Voir'} l&apos;historique ({todayCheckIns.length})
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {todayCheckIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="p-2 bg-white/5 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span>{ci.type === 'arrival' ? '✅' : '👋'}</span>
                      <span className="text-white/70 text-sm">
                        {ci.type === 'arrival' ? 'Arrivee' : 'Depart'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">
                        {formatTime(ci.timestamp)}
                      </p>
                      {ci.workplaceName && (
                        <p className="text-white/40 text-xs">{ci.workplaceName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
