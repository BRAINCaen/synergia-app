// ==========================================
// react-app/src/core/services/geolocationService.js
// SERVICE GEOLOCALISATION - SYNERGIA v4.0
// Module: Pointage automatique par geolocalisation
// ==========================================

import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION
// ==========================================
const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000
};

// Distance en metres pour considerer "sur place"
const DEFAULT_RADIUS = 100;

// ==========================================
// CALCUL DE DISTANCE (HAVERSINE)
// ==========================================
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la Terre en metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en metres
}

// ==========================================
// SERVICE PRINCIPAL
// ==========================================
class GeolocationService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.listeners = new Set();
    this.workplaces = [];
    this.autoCheckInEnabled = false;
  }

  // ==========================================
  // VERIFICATION SUPPORT
  // ==========================================
  isSupported() {
    return 'geolocation' in navigator;
  }

  // ==========================================
  // OBTENIR LA POSITION
  // ==========================================

  /**
   * Obtenir la position actuelle
   */
  async getCurrentPosition(options = {}) {
    if (!this.isSupported()) {
      throw new Error('Geolocalisation non supportee');
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          this.currentPosition = coords;
          resolve(coords);
        },
        (error) => {
          reject(this.parseError(error));
        },
        opts
      );
    });
  }

  /**
   * Surveiller la position en continu
   */
  watchPosition(callback, options = {}) {
    if (!this.isSupported()) {
      throw new Error('Geolocalisation non supportee');
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.currentPosition = coords;
        callback(coords);

        // Verifier les lieux de travail
        if (this.autoCheckInEnabled) {
          this.checkWorkplaceProximity(coords);
        }
      },
      (error) => {
        callback(null, this.parseError(error));
      },
      opts
    );

    return this.watchId;
  }

  /**
   * Arreter la surveillance
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Parser les erreurs de geolocalisation
   */
  parseError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return { code: 'PERMISSION_DENIED', message: 'Permission refusee' };
      case error.POSITION_UNAVAILABLE:
        return { code: 'POSITION_UNAVAILABLE', message: 'Position non disponible' };
      case error.TIMEOUT:
        return { code: 'TIMEOUT', message: 'Delai depasse' };
      default:
        return { code: 'UNKNOWN', message: error.message || 'Erreur inconnue' };
    }
  }

  // ==========================================
  // GESTION DES LIEUX DE TRAVAIL
  // ==========================================

  /**
   * Ajouter un lieu de travail
   */
  async addWorkplace(workplace) {
    try {
      const workplaceData = {
        name: workplace.name,
        address: workplace.address || '',
        latitude: workplace.latitude,
        longitude: workplace.longitude,
        radius: workplace.radius || DEFAULT_RADIUS,
        companyId: workplace.companyId,
        createdBy: workplace.createdBy,
        createdAt: serverTimestamp(),
        active: true
      };

      const docRef = await addDoc(collection(db, 'workplaces'), workplaceData);
      return { id: docRef.id, ...workplaceData };
    } catch (error) {
      console.error('Erreur ajout lieu:', error);
      throw error;
    }
  }

  /**
   * Charger les lieux de travail
   */
  async loadWorkplaces(companyId) {
    try {
      const q = query(
        collection(db, 'workplaces'),
        where('companyId', '==', companyId),
        where('active', '==', true)
      );

      const snapshot = await getDocs(q);
      this.workplaces = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.workplaces;
    } catch (error) {
      console.error('Erreur chargement lieux:', error);
      return [];
    }
  }

  /**
   * Verifier la proximite avec les lieux de travail
   */
  async checkWorkplaceProximity(position) {
    const nearbyWorkplaces = [];

    for (const workplace of this.workplaces) {
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        workplace.latitude,
        workplace.longitude
      );

      if (distance <= workplace.radius) {
        nearbyWorkplaces.push({
          ...workplace,
          distance: Math.round(distance)
        });
      }
    }

    if (nearbyWorkplaces.length > 0) {
      this.notifyListeners({
        type: 'near_workplace',
        workplaces: nearbyWorkplaces,
        position
      });
    }

    return nearbyWorkplaces;
  }

  /**
   * Verifier si l'utilisateur est sur un lieu de travail
   */
  async isAtWorkplace(position = null) {
    const pos = position || this.currentPosition;
    if (!pos) {
      try {
        const newPos = await this.getCurrentPosition();
        return this.checkWorkplaceProximity(newPos);
      } catch {
        return [];
      }
    }
    return this.checkWorkplaceProximity(pos);
  }

  // ==========================================
  // POINTAGE AUTOMATIQUE
  // ==========================================

  /**
   * Activer/desactiver le pointage auto
   */
  setAutoCheckIn(enabled, options = {}) {
    this.autoCheckInEnabled = enabled;

    if (enabled) {
      this.watchPosition((coords) => {
        // Le callback de watchPosition gere la verification
      }, options);
    } else {
      this.stopWatching();
    }
  }

  /**
   * Enregistrer un pointage
   */
  async recordCheckIn(userId, type = 'arrival', options = {}) {
    try {
      const position = options.position || this.currentPosition;
      const workplace = options.workplace || null;

      const pointageData = {
        userId,
        type, // 'arrival' ou 'departure'
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
        location: position ? {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        } : null,
        workplaceId: workplace?.id || null,
        workplaceName: workplace?.name || null,
        method: options.method || 'geolocation', // 'manual', 'geolocation', 'auto'
        verified: workplace !== null,
        metadata: options.metadata || {}
      };

      const docRef = await addDoc(collection(db, 'pointages'), pointageData);
      console.log('[GEO] Pointage enregistre:', type);

      this.notifyListeners({
        type: 'check_in_recorded',
        pointage: { id: docRef.id, ...pointageData }
      });

      return { id: docRef.id, ...pointageData };
    } catch (error) {
      console.error('Erreur pointage:', error);
      throw error;
    }
  }

  /**
   * Obtenir le dernier pointage du jour
   */
  async getTodayCheckIns(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      const q = query(
        collection(db, 'pointages'),
        where('userId', '==', userId),
        where('date', '==', today),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || null
      }));
    } catch (error) {
      console.error('Erreur get pointages:', error);
      return [];
    }
  }

  /**
   * Verifier si l'utilisateur a deja pointe aujourd'hui
   */
  async hasCheckedInToday(userId, type = 'arrival') {
    const checkIns = await this.getTodayCheckIns(userId);
    return checkIns.some(ci => ci.type === type);
  }

  // ==========================================
  // LISTENERS
  // ==========================================
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => cb(event));
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Calculer la distance entre deux points
   */
  getDistance(lat1, lon1, lat2, lon2) {
    return calculateDistance(lat1, lon1, lat2, lon2);
  }

  /**
   * Formater la distance pour affichage
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Obtenir l'adresse depuis les coordonnees (reverse geocoding)
   * Note: Necessite une API externe (Google, Nominatim, etc.)
   */
  async reverseGeocode(latitude, longitude) {
    try {
      // Utilisation de Nominatim (gratuit, open source)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Synergia-App/4.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur geocoding');
      }

      const data = await response.json();
      return {
        address: data.display_name,
        street: data.address?.road || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        country: data.address?.country || ''
      };
    } catch (error) {
      console.error('Erreur reverse geocoding:', error);
      return null;
    }
  }
}

// Export singleton
export const geolocationService = new GeolocationService();
export default geolocationService;
