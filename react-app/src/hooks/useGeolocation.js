// ==========================================
// react-app/src/hooks/useGeolocation.js
// HOOK GEOLOCALISATION - SYNERGIA v4.0
// Module: Gestion geolocalisation React
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../shared/stores/authStore';
import geolocationService from '../core/services/geolocationService';

// ==========================================
// HOOK POSITION
// ==========================================
export function useGeolocation(options = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(false);

  // Obtenir la position une fois
  const getPosition = useCallback(async () => {
    if (!geolocationService.isSupported()) {
      setError({ code: 'NOT_SUPPORTED', message: 'Geolocalisation non supportee' });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const coords = await geolocationService.getCurrentPosition(options);
      setPosition(coords);
      return coords;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  // Commencer a surveiller
  const startWatching = useCallback(() => {
    if (!geolocationService.isSupported()) {
      setError({ code: 'NOT_SUPPORTED', message: 'Geolocalisation non supportee' });
      return;
    }

    setWatching(true);
    geolocationService.watchPosition(
      (coords, err) => {
        if (err) {
          setError(err);
        } else {
          setPosition(coords);
          setError(null);
        }
      },
      options
    );
  }, [options]);

  // Arreter la surveillance
  const stopWatching = useCallback(() => {
    geolocationService.stopWatching();
    setWatching(false);
  }, []);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (watching) {
        geolocationService.stopWatching();
      }
    };
  }, [watching]);

  return {
    position,
    error,
    loading,
    watching,
    getPosition,
    startWatching,
    stopWatching,
    isSupported: geolocationService.isSupported()
  };
}

// ==========================================
// HOOK POINTAGE
// ==========================================
export function useCheckIn() {
  const { user } = useAuthStore();
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nearbyWorkplaces, setNearbyWorkplaces] = useState([]);
  const [autoCheckInEnabled, setAutoCheckInEnabled] = useState(false);
  const unsubscribeRef = useRef(null);

  // Charger les pointages du jour
  const loadTodayCheckIns = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const checkIns = await geolocationService.getTodayCheckIns(user.uid);
      setTodayCheckIns(checkIns);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Charger au montage
  useEffect(() => {
    loadTodayCheckIns();
  }, [loadTodayCheckIns]);

  // Ecouter les evenements
  useEffect(() => {
    unsubscribeRef.current = geolocationService.addListener((event) => {
      if (event.type === 'near_workplace') {
        setNearbyWorkplaces(event.workplaces);
      } else if (event.type === 'check_in_recorded') {
        loadTodayCheckIns();
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [loadTodayCheckIns]);

  // Pointer (arrivee)
  const checkIn = useCallback(async (options = {}) => {
    if (!user?.uid) return null;

    setLoading(true);
    try {
      // Obtenir la position si pas fournie
      let position = options.position;
      if (!position) {
        position = await geolocationService.getCurrentPosition();
      }

      // Verifier les lieux proches
      const nearby = await geolocationService.isAtWorkplace(position);
      const workplace = nearby[0] || null;

      // Enregistrer le pointage
      const result = await geolocationService.recordCheckIn(user.uid, 'arrival', {
        position,
        workplace,
        method: options.method || 'manual'
      });

      await loadTodayCheckIns();
      return result;
    } catch (error) {
      console.error('Erreur check-in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, loadTodayCheckIns]);

  // Pointer (depart)
  const checkOut = useCallback(async (options = {}) => {
    if (!user?.uid) return null;

    setLoading(true);
    try {
      let position = options.position;
      if (!position) {
        position = await geolocationService.getCurrentPosition();
      }

      const nearby = await geolocationService.isAtWorkplace(position);
      const workplace = nearby[0] || null;

      const result = await geolocationService.recordCheckIn(user.uid, 'departure', {
        position,
        workplace,
        method: options.method || 'manual'
      });

      await loadTodayCheckIns();
      return result;
    } catch (error) {
      console.error('Erreur check-out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, loadTodayCheckIns]);

  // Activer/desactiver le pointage auto
  const toggleAutoCheckIn = useCallback((enabled) => {
    setAutoCheckInEnabled(enabled);
    geolocationService.setAutoCheckIn(enabled);
  }, []);

  // Statut du jour
  const hasArrived = todayCheckIns.some(ci => ci.type === 'arrival');
  const hasDeparted = todayCheckIns.some(ci => ci.type === 'departure');
  const lastCheckIn = todayCheckIns[0] || null;

  // Calculer les heures travaillees
  const getWorkedHours = useCallback(() => {
    const arrival = todayCheckIns.find(ci => ci.type === 'arrival');
    const departure = todayCheckIns.find(ci => ci.type === 'departure');

    if (!arrival) return 0;

    const endTime = departure?.timestamp || new Date();
    const startTime = arrival.timestamp || new Date();

    const hours = (endTime - startTime) / (1000 * 60 * 60);
    return Math.max(0, hours);
  }, [todayCheckIns]);

  return {
    todayCheckIns,
    loading,
    nearbyWorkplaces,
    autoCheckInEnabled,
    hasArrived,
    hasDeparted,
    lastCheckIn,
    workedHours: getWorkedHours(),
    checkIn,
    checkOut,
    toggleAutoCheckIn,
    refresh: loadTodayCheckIns
  };
}

// ==========================================
// HOOK LIEUX DE TRAVAIL
// ==========================================
export function useWorkplaces(companyId) {
  const [workplaces, setWorkplaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkplaces = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const places = await geolocationService.loadWorkplaces(companyId);
      setWorkplaces(places);
    } catch (error) {
      console.error('Erreur chargement workplaces:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadWorkplaces();
  }, [loadWorkplaces]);

  const addWorkplace = useCallback(async (workplace) => {
    try {
      const newWorkplace = await geolocationService.addWorkplace({
        ...workplace,
        companyId
      });
      setWorkplaces(prev => [...prev, newWorkplace]);
      return newWorkplace;
    } catch (error) {
      console.error('Erreur ajout workplace:', error);
      throw error;
    }
  }, [companyId]);

  return {
    workplaces,
    loading,
    addWorkplace,
    refresh: loadWorkplaces
  };
}

export default useGeolocation;
