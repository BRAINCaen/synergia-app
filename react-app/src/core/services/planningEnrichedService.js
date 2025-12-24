// ==========================================
// 📁 react-app/src/core/services/planningEnrichedService.js
// SERVICE PLANNING SYNERGIA
// ==========================================

import { 
  collection, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📅 SERVICE DE GESTION DU PLANNING SYNERGIA
 * Fonctionnalités : heures contrat, badges, exports
 */
class PlanningEnrichedService {
  constructor() {
    this.shiftsCollection = 'shifts';
    this.usersCollection = 'users';
    this.badgesCollection = 'pointages'; // Collection badges/pointages
    this.contractsCollection = 'contracts'; // Heures de contrat
  }

  // ==========================================
  // 📅 GESTION DES SHIFTS
  // ==========================================

  /**
   * ➕ CRÉER UN SHIFT
   */
  async createShift(shiftData) {
    try {
      console.log('🔄 Création shift:', shiftData);

      const shiftRef = await addDoc(collection(db, this.shiftsCollection), {
        employeeId: shiftData.employeeId,
        date: shiftData.date,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        position: shiftData.position || 'Non défini',
        color: shiftData.color || '#8B5CF6',
        notes: shiftData.notes || '',
        status: 'scheduled', // scheduled, completed, cancelled
        duration: this.calculateDuration(shiftData.startTime, shiftData.endTime),
        createdAt: serverTimestamp(),
        createdBy: shiftData.createdBy,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Shift créé:', shiftRef.id);
      return { success: true, id: shiftRef.id };
    } catch (error) {
      console.error('❌ Erreur création shift:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LES SHIFTS
   */
  async getShifts(filters = {}) {
    try {
      let q = collection(db, this.shiftsCollection);
      const conditions = [];
      
      // Filtrer par employé
      if (filters.employeeId) {
        conditions.push(where('employeeId', '==', filters.employeeId));
      }
      
      // Filtrer par période
      if (filters.startDate) {
        conditions.push(where('date', '>=', filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(where('date', '<=', filters.endDate));
      }
      
      // Filtrer par statut
      if (filters.status) {
        conditions.push(where('status', '==', filters.status));
      }
      
      if (conditions.length > 0) {
        q = query(q, ...conditions, orderBy('date', 'asc'));
      } else {
        q = query(q, orderBy('date', 'asc'));
      }
      
      const snapshot = await getDocs(q);
      
      const shifts = [];
      snapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${shifts.length} shifts récupérés`);
      return shifts;
    } catch (error) {
      console.error('❌ Erreur récupération shifts:', error);
      return [];
    }
  }

  /**
   * 🔍 RÉCUPÉRER UN SHIFT PAR ID
   */
  async getShiftById(shiftId) {
    try {
      const docRef = doc(db, this.shiftsCollection, shiftId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération shift:', error);
      return null;
    }
  }

  /**
   * ✏️ METTRE À JOUR UN SHIFT
   */
  async updateShift(shiftId, updateData) {
    try {
      const shiftRef = doc(db, this.shiftsCollection, shiftId);
      
      // Recalculer la durée si les heures changent
      if (updateData.startTime && updateData.endTime) {
        updateData.duration = this.calculateDuration(updateData.startTime, updateData.endTime);
      }
      
      await updateDoc(shiftRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Shift mis à jour:', shiftId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour shift:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN SHIFT
   */
  async deleteShift(shiftId) {
    try {
      const shiftRef = doc(db, this.shiftsCollection, shiftId);
      await deleteDoc(shiftRef);

      console.log('✅ Shift supprimé:', shiftId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression shift:', error);
      throw error;
    }
  }

  /**
   * 🔄 DÉPLACER UN SHIFT (DRAG & DROP)
   */
  async moveShift(shiftId, newEmployeeId, newDate) {
    try {
      console.log('🔄 Déplacement shift:', { shiftId, newEmployeeId, newDate });
      
      const updateData = {
        employeeId: newEmployeeId,
        date: newDate,
        updatedAt: serverTimestamp()
      };
      
      return await this.updateShift(shiftId, updateData);
    } catch (error) {
      console.error('❌ Erreur déplacement shift:', error);
      throw error;
    }
  }

  /**
   * 📋 COPIER UN SHIFT
   */
  async copyShift(shiftId, targetEmployeeId, targetDate) {
    try {
      const originalShift = await this.getShiftById(shiftId);
      
      if (!originalShift) {
        throw new Error('Shift introuvable');
      }

      const newShift = {
        employeeId: targetEmployeeId,
        date: targetDate,
        startTime: originalShift.startTime,
        endTime: originalShift.endTime,
        position: originalShift.position,
        color: originalShift.color,
        notes: originalShift.notes,
        createdBy: originalShift.createdBy
      };

      return await this.createShift(newShift);
    } catch (error) {
      console.error('❌ Erreur copie shift:', error);
      throw error;
    }
  }

  /**
   * 📅 DUPLIQUER UNE SEMAINE COMPLÈTE
   */
  async duplicateWeek(startDate, targetStartDate, createdBy) {
    try {
      console.log('🔄 Duplication semaine:', { startDate, targetStartDate });

      // Calculer la fin de semaine (7 jours)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Récupérer tous les shifts de la semaine source
      const sourceShifts = await this.getShifts({
        startDate,
        endDate: endDateStr
      });

      if (sourceShifts.length === 0) {
        return { success: false, message: 'Aucun shift à dupliquer' };
      }

      // Calculer le décalage de jours
      const sourceDate = new Date(startDate);
      const targetDate = new Date(targetStartDate);
      const daysDiff = Math.round((targetDate - sourceDate) / (1000 * 60 * 60 * 24));

      // Créer les nouveaux shifts
      const batch = writeBatch(db);
      const createdShifts = [];

      for (const shift of sourceShifts) {
        const shiftDate = new Date(shift.date);
        shiftDate.setDate(shiftDate.getDate() + daysDiff);
        const newDate = shiftDate.toISOString().split('T')[0];

        const newShiftRef = doc(collection(db, this.shiftsCollection));
        const newShiftData = {
          employeeId: shift.employeeId,
          date: newDate,
          startTime: shift.startTime,
          endTime: shift.endTime,
          position: shift.position,
          color: shift.color,
          notes: shift.notes,
          duration: shift.duration,
          status: 'scheduled',
          createdAt: serverTimestamp(),
          createdBy,
          updatedAt: serverTimestamp()
        };

        batch.set(newShiftRef, newShiftData);
        createdShifts.push(newShiftData);
      }

      await batch.commit();

      console.log(`✅ ${createdShifts.length} shifts dupliqués`);
      return { success: true, count: createdShifts.length };
    } catch (error) {
      console.error('❌ Erreur duplication semaine:', error);
      throw error;
    }
  }

  // ==========================================
  // 👥 GESTION DES EMPLOYÉS
  // ==========================================

  /**
   * 👥 RÉCUPÉRER TOUS LES EMPLOYÉS (depuis users)
   */
  async getAllEmployees() {
    try {
      const usersQuery = query(collection(db, this.usersCollection), orderBy('displayName', 'asc'));
      const snapshot = await getDocs(usersQuery);
      
      const employees = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        employees.push({
          id: doc.id,
          name: userData.displayName || 'Sans nom',
          email: userData.email || '',
          photoURL: userData.photoURL || null,
          position: userData.profile?.role || 'Employé',
          department: userData.profile?.department || 'Non défini',
          status: 'active',
          // Heures de contrat (par défaut 35h/semaine)
          contractHours: userData.contractHours || 35
        });
      });

      console.log(`✅ ${employees.length} employés récupérés`);
      return employees;
    } catch (error) {
      console.error('❌ Erreur récupération employés:', error);
      return [];
    }
  }

  /**
   * 👤 RÉCUPÉRER UN EMPLOYÉ PAR ID
   */
  async getEmployeeById(employeeId) {
    try {
      const userDoc = await getDoc(doc(db, this.usersCollection, employeeId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userDoc.id,
          name: userData.displayName || 'Sans nom',
          email: userData.email || '',
          photoURL: userData.photoURL || null,
          position: userData.profile?.role || 'Employé',
          department: userData.profile?.department || 'Non défini',
          status: 'active',
          contractHours: userData.contractHours || 35
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération employé:', error);
      return null;
    }
  }

  // ==========================================
  // 📊 COMPTEUR HEURES CONTRAT
  // ==========================================

  /**
   * 📊 CALCULER LES HEURES PLANIFIÉES VS CONTRAT (PAR SEMAINE)
   */
  async getWeeklyHoursComparison(employeeId, weekStartDate) {
    try {
      // Calculer la fin de semaine
      const weekStart = new Date(weekStartDate);
      const weekEnd = new Date(weekStartDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Récupérer les shifts de la semaine
      const shifts = await this.getShifts({
        employeeId,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      });

      // Calculer les heures planifiées
      const plannedHours = shifts.reduce((total, shift) => {
        return total + (shift.duration || 0);
      }, 0);

      // Récupérer les heures de contrat
      const employee = await this.getEmployeeById(employeeId);
      const contractHours = employee?.contractHours || 35;

      // Calculer la différence
      const difference = plannedHours - contractHours;
      const percentage = contractHours > 0 ? (plannedHours / contractHours) * 100 : 0;

      return {
        plannedHours: parseFloat(plannedHours.toFixed(2)),
        contractHours,
        difference: parseFloat(difference.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        isOvertime: difference > 0,
        isUndertime: difference < 0,
        shiftsCount: shifts.length
      };
    } catch (error) {
      console.error('❌ Erreur calcul heures contrat:', error);
      return {
        plannedHours: 0,
        contractHours: 35,
        difference: -35,
        percentage: 0,
        isOvertime: false,
        isUndertime: true,
        shiftsCount: 0
      };
    }
  }

  /**
   * 📊 OBTENIR LE COMPTEUR POUR TOUS LES EMPLOYÉS
   */
  async getAllEmployeesWeeklyHours(weekStartDate) {
    try {
      const employees = await this.getAllEmployees();
      const comparisons = [];

      for (const employee of employees) {
        const comparison = await this.getWeeklyHoursComparison(employee.id, weekStartDate);
        comparisons.push({
          employeeId: employee.id,
          employeeName: employee.name,
          ...comparison
        });
      }

      return comparisons;
    } catch (error) {
      console.error('❌ Erreur calcul heures tous employés:', error);
      return [];
    }
  }

  // ==========================================
  // 🎫 COMPARAISON PLANNING / BADGES
  // ==========================================

  /**
   * 🎫 RÉCUPÉRER LES BADGES D'UN EMPLOYÉ POUR UNE PÉRIODE
   */
  async getBadges(employeeId, startDate, endDate) {
    try {
      const badgesQuery = query(
        collection(db, this.badgesCollection),
        where('userId', '==', employeeId),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(badgesQuery);
      const badges = [];

      snapshot.forEach((doc) => {
        const badgeData = doc.data();
        const badgeDate = badgeData.date?.toDate?.() || badgeData.timestamp?.toDate?.() || new Date(badgeData.date);
        const dateStr = badgeDate.toISOString().split('T')[0];

        // Filtrer par période
        if (dateStr >= startDate && dateStr <= endDate) {
          badges.push({
            id: doc.id,
            ...badgeData,
            date: dateStr,
            timestamp: badgeDate,
            type: badgeData.type || 'arrival' // arrival, departure
          });
        }
      });

      console.log(`✅ ${badges.length} badges récupérés pour ${employeeId}`);
      return badges;
    } catch (error) {
      console.error('❌ Erreur récupération badges:', error);
      return [];
    }
  }

  /**
   * 🎫 CALCULER LES HEURES RÉELLES DEPUIS LES BADGES (PAR JOUR)
   */
  calculateRealHoursFromBadges(badges) {
    const dailyHours = {};

    // Grouper par jour
    badges.forEach(badge => {
      if (!dailyHours[badge.date]) {
        dailyHours[badge.date] = {
          arrivals: [],
          departures: [],
          totalHours: 0
        };
      }

      if (badge.type === 'arrival') {
        dailyHours[badge.date].arrivals.push(badge.timestamp);
      } else if (badge.type === 'departure') {
        dailyHours[badge.date].departures.push(badge.timestamp);
      }
    });

    // Calculer les heures pour chaque jour
    Object.keys(dailyHours).forEach(date => {
      const day = dailyHours[date];
      day.arrivals.sort((a, b) => a - b);
      day.departures.sort((a, b) => a - b);

      let totalSeconds = 0;

      // Calculer les segments (arrivée-départ)
      for (let i = 0; i < day.arrivals.length; i++) {
        const arrival = day.arrivals[i];
        const departure = day.departures[i];

        if (arrival && departure) {
          const duration = (departure - arrival) / 1000; // en secondes
          totalSeconds += duration;
        }
      }

      day.totalHours = parseFloat((totalSeconds / 3600).toFixed(2));
    });

    return dailyHours;
  }

  /**
   * 🎫 COMPARER PLANNING VS BADGES (POUR LA PAIE)
   */
  async compareScheduleWithBadges(employeeId, startDate, endDate) {
    try {
      console.log('📊 Comparaison planning/badges:', { employeeId, startDate, endDate });

      // Récupérer les shifts planifiés
      const shifts = await this.getShifts({
        employeeId,
        startDate,
        endDate
      });

      // Récupérer les badges
      const badges = await this.getBadges(employeeId, startDate, endDate);

      // Calculer les heures réelles
      const realHours = this.calculateRealHoursFromBadges(badges);

      // Comparer jour par jour
      const comparison = [];
      const allDates = new Set([
        ...shifts.map(s => s.date),
        ...Object.keys(realHours)
      ]);

      allDates.forEach(date => {
        const shift = shifts.find(s => s.date === date);
        const real = realHours[date];

        const plannedHours = shift ? shift.duration : 0;
        const workedHours = real ? real.totalHours : 0;
        const difference = workedHours - plannedHours;

        comparison.push({
          date,
          plannedHours: parseFloat(plannedHours.toFixed(2)),
          workedHours,
          difference: parseFloat(difference.toFixed(2)),
          hasShift: !!shift,
          hasBadges: !!real,
          status: this.getComparisonStatus(plannedHours, workedHours),
          shift: shift || null,
          badges: real || null
        });
      });

      // Trier par date
      comparison.sort((a, b) => a.date.localeCompare(b.date));

      // Calculer les totaux
      const totalPlanned = comparison.reduce((sum, day) => sum + day.plannedHours, 0);
      const totalWorked = comparison.reduce((sum, day) => sum + day.workedHours, 0);
      const totalDifference = totalWorked - totalPlanned;

      console.log('✅ Comparaison terminée:', {
        totalPlanned,
        totalWorked,
        totalDifference,
        days: comparison.length
      });

      return {
        days: comparison,
        summary: {
          totalPlanned: parseFloat(totalPlanned.toFixed(2)),
          totalWorked: parseFloat(totalWorked.toFixed(2)),
          totalDifference: parseFloat(totalDifference.toFixed(2)),
          daysCompared: comparison.length,
          daysWithShifts: comparison.filter(d => d.hasShift).length,
          daysWithBadges: comparison.filter(d => d.hasBadges).length
        }
      };
    } catch (error) {
      console.error('❌ Erreur comparaison planning/badges:', error);
      return {
        days: [],
        summary: {
          totalPlanned: 0,
          totalWorked: 0,
          totalDifference: 0,
          daysCompared: 0,
          daysWithShifts: 0,
          daysWithBadges: 0
        }
      };
    }
  }

  /**
   * 📊 DÉTERMINER LE STATUT DE LA COMPARAISON
   */
  getComparisonStatus(planned, worked) {
    if (!planned && !worked) return 'no-data';
    if (!planned && worked) return 'not-scheduled';
    if (planned && !worked) return 'absent';
    
    const difference = Math.abs(worked - planned);
    
    if (difference < 0.25) return 'ok'; // Différence < 15 minutes
    if (worked > planned) return 'overtime';
    if (worked < planned) return 'undertime';
    
    return 'ok';
  }

  // ==========================================
  // 📊 STATISTIQUES
  // ==========================================

  /**
   * 📊 CALCULER LES STATISTIQUES D'UNE PÉRIODE
   */
  async getStats(startDate, endDate) {
    try {
      const shifts = await this.getShifts({ startDate, endDate });
      const employees = await this.getAllEmployees();

      // Calculer les heures totales
      const totalHours = shifts.reduce((acc, shift) => {
        return acc + (shift.duration || 0);
      }, 0);

      // Employés planifiés
      const uniqueEmployees = new Set(shifts.map(s => s.employeeId)).size;

      // Taux de couverture
      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const maxShifts = employees.length * totalDays;
      const coverage = maxShifts > 0 ? (shifts.length / maxShifts) * 100 : 0;

      return {
        totalHours: parseFloat(totalHours.toFixed(2)),
        shiftsCount: shifts.length,
        employeesScheduled: uniqueEmployees,
        totalEmployees: employees.length,
        coverage: parseFloat(coverage.toFixed(1)),
        avgHoursPerEmployee: uniqueEmployees > 0 ? parseFloat((totalHours / uniqueEmployees).toFixed(2)) : 0
      };
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
      return {
        totalHours: 0,
        shiftsCount: 0,
        employeesScheduled: 0,
        totalEmployees: 0,
        coverage: 0,
        avgHoursPerEmployee: 0
      };
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES PAR EMPLOYÉ
   */
  async getEmployeeStats(employeeId, startDate, endDate) {
    try {
      const shifts = await this.getShifts({
        employeeId,
        startDate,
        endDate
      });

      // Calculer les heures travaillées
      const totalHours = shifts.reduce((acc, shift) => {
        return acc + (shift.duration || 0);
      }, 0);

      // Compter les shifts par statut
      const byStatus = shifts.reduce((acc, shift) => {
        acc[shift.status] = (acc[shift.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalShifts: shifts.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        scheduled: byStatus.scheduled || 0,
        completed: byStatus.completed || 0,
        cancelled: byStatus.cancelled || 0
      };
    } catch (error) {
      console.error('❌ Erreur stats employé:', error);
      return {
        totalShifts: 0,
        totalHours: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0
      };
    }
  }

  // ==========================================
  // 🔔 ALERTES ET CONFLITS
  // ==========================================

  /**
   * ⚠️ DÉTECTER LES CONFLITS D'HORAIRES
   */
  async detectConflicts(employeeId, date, startTime, endTime, excludeShiftId = null) {
    try {
      const shifts = await this.getShifts({
        employeeId,
        startDate: date,
        endDate: date
      });

      const conflicts = shifts.filter(shift => {
        // Exclure le shift en cours d'édition
        if (excludeShiftId && shift.id === excludeShiftId) {
          return false;
        }

        // Vérifier les chevauchements
        const existingStart = shift.startTime;
        const existingEnd = shift.endTime;

        return (
          (startTime >= existingStart && startTime < existingEnd) ||
          (endTime > existingStart && endTime <= existingEnd) ||
          (startTime <= existingStart && endTime >= existingEnd)
        );
      });

      return conflicts;
    } catch (error) {
      console.error('❌ Erreur détection conflits:', error);
      return [];
    }
  }

  /**
   * 🔔 OBTENIR LES ALERTES
   */
  async getAlerts(startDate, endDate) {
    try {
      const shifts = await this.getShifts({ startDate, endDate });
      const employees = await this.getAllEmployees();
      const alerts = [];

      // Vérifier les employés sans shifts
      const employeesWithShifts = new Set(shifts.map(s => s.employeeId));
      employees.forEach(emp => {
        if (!employeesWithShifts.has(emp.id)) {
          alerts.push({
            type: 'warning',
            message: `${emp.name} n'a aucun shift planifié`,
            employeeId: emp.id
          });
        }
      });

      // Vérifier les heures excessives (> 48h par semaine)
      const hoursByEmployee = {};
      shifts.forEach(shift => {
        hoursByEmployee[shift.employeeId] = (hoursByEmployee[shift.employeeId] || 0) + (shift.duration || 0);
      });

      Object.entries(hoursByEmployee).forEach(([empId, hours]) => {
        if (hours > 48) {
          const emp = employees.find(e => e.id === empId);
          alerts.push({
            type: 'error',
            message: `${emp?.name} dépasse les heures légales (${hours.toFixed(1)}h)`,
            employeeId: empId
          });
        }
      });

      return alerts;
    } catch (error) {
      console.error('❌ Erreur récupération alertes:', error);
      return [];
    }
  }

  // ==========================================
  // 🛠️ UTILITAIRES
  // ==========================================

  /**
   * ⏱️ CALCULER LA DURÉE D'UN SHIFT (EN HEURES)
   */
  calculateDuration(startTime, endTime) {
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return parseFloat(hours.toFixed(2));
    } catch (error) {
      console.error('❌ Erreur calcul durée:', error);
      return 0;
    }
  }

  /**
   * 📅 OBTENIR LE DÉBUT DE SEMAINE (LUNDI)
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    return new Date(d.setDate(diff));
  }

  /**
   * 📅 GÉNÉRER LES DATES D'UNE SEMAINE
   */
  getWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }
}

// Export singleton
const planningEnrichedService = new PlanningEnrichedService();
export default planningEnrichedService;
