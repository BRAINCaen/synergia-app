// ==========================================
// 📁 react-app/src/core/services/planningService.js
// SERVICE PLANNING - SYNC AUTOMATIQUE AVEC USERS
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
 * 📅 SERVICE DE GESTION DU PLANNING
 * Les employés sont automatiquement synchronisés depuis la collection 'users'
 */
class PlanningService {
  constructor() {
    this.shiftsCollection = 'shifts';
    this.usersCollection = 'users';
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
        position: shiftData.position,
        color: shiftData.color || '#3B82F6',
        notes: shiftData.notes || '',
        status: 'scheduled', // scheduled, completed, cancelled
        createdAt: serverTimestamp(),
        createdBy: shiftData.createdBy
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
      
      // Filtrer par employé
      if (filters.employeeId) {
        q = query(q, where('employeeId', '==', filters.employeeId));
      }
      
      // Filtrer par période
      if (filters.startDate) {
        q = query(q, where('date', '>=', filters.startDate));
      }
      if (filters.endDate) {
        q = query(q, where('date', '<=', filters.endDate));
      }
      
      // Filtrer par statut
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      q = query(q, orderBy('date', 'asc'));
      
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
   * 📋 DUPLIQUER UN SHIFT
   */
  async duplicateShift(shiftId, newDate) {
    try {
      const originalShift = await this.getShiftById(shiftId);
      
      if (!originalShift) {
        throw new Error('Shift introuvable');
      }

      const newShift = {
        employeeId: originalShift.employeeId,
        date: newDate,
        startTime: originalShift.startTime,
        endTime: originalShift.endTime,
        position: originalShift.position,
        color: originalShift.color,
        notes: originalShift.notes,
        createdBy: originalShift.createdBy
      };

      return await this.createShift(newShift);
    } catch (error) {
      console.error('❌ Erreur duplication shift:', error);
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
      const dayDiff = Math.floor((targetDate - sourceDate) / (1000 * 60 * 60 * 24));

      // Créer les nouveaux shifts
      const batch = writeBatch(db);
      let count = 0;

      sourceShifts.forEach((shift) => {
        const originalDate = new Date(shift.date);
        const newDate = new Date(originalDate);
        newDate.setDate(newDate.getDate() + dayDiff);
        const newDateStr = newDate.toISOString().split('T')[0];

        const newShiftRef = doc(collection(db, this.shiftsCollection));
        batch.set(newShiftRef, {
          employeeId: shift.employeeId,
          date: newDateStr,
          startTime: shift.startTime,
          endTime: shift.endTime,
          position: shift.position,
          color: shift.color,
          notes: shift.notes,
          status: 'scheduled',
          createdAt: serverTimestamp(),
          createdBy
        });

        count++;
      });

      await batch.commit();

      console.log(`✅ ${count} shifts dupliqués`);
      return { success: true, count };
    } catch (error) {
      console.error('❌ Erreur duplication semaine:', error);
      throw error;
    }
  }

  // ==========================================
  // 👥 RÉCUPÉRATION DES EMPLOYÉS (USERS)
  // ==========================================

  /**
   * 👥 RÉCUPÉRER TOUS LES UTILISATEURS (= EMPLOYÉS)
   */
  async getAllEmployees() {
    try {
      const usersRef = collection(db, this.usersCollection);
      const q = query(usersRef, orderBy('displayName', 'asc'));
      const snapshot = await getDocs(q);
      
      const employees = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        employees.push({
          id: doc.id,
          name: userData.displayName || userData.email,
          email: userData.email,
          photoURL: userData.photoURL,
          role: userData.synergiaRoles?.[0] || 'employee',
          department: userData.department || 'Non défini',
          status: 'active'
        });
      });

      console.log(`✅ ${employees.length} employés (users) récupérés`);
      return employees;
    } catch (error) {
      console.error('❌ Erreur récupération employés:', error);
      return [];
    }
  }

  /**
   * 🔍 RÉCUPÉRER UN EMPLOYÉ PAR ID
   */
  async getEmployeeById(userId) {
    try {
      const docRef = doc(db, this.usersCollection, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        return {
          id: docSnap.id,
          name: userData.displayName || userData.email,
          email: userData.email,
          photoURL: userData.photoURL,
          role: userData.synergiaRoles?.[0] || 'employee',
          department: userData.department || 'Non défini',
          status: 'active'
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération employé:', error);
      return null;
    }
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
        const start = new Date(`2000-01-01T${shift.startTime}`);
        const end = new Date(`2000-01-01T${shift.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        return acc + hours;
      }, 0);

      // Employés planifiés
      const uniqueEmployees = new Set(shifts.map(s => s.employeeId)).size;

      // Taux de couverture
      const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const maxShifts = employees.length * totalDays;
      const coverage = maxShifts > 0 ? (shifts.length / maxShifts) * 100 : 0;

      return {
        totalHours: Math.round(totalHours),
        shiftsCount: shifts.length,
        employeesScheduled: uniqueEmployees,
        totalEmployees: employees.length,
        coverage: Math.round(coverage),
        avgHoursPerEmployee: uniqueEmployees > 0 ? Math.round(totalHours / uniqueEmployees) : 0
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
        const start = new Date(`2000-01-01T${shift.startTime}`);
        const end = new Date(`2000-01-01T${shift.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        return acc + hours;
      }, 0);

      // Compter les shifts par statut
      const byStatus = shifts.reduce((acc, shift) => {
        acc[shift.status] = (acc[shift.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalShifts: shifts.length,
        totalHours: Math.round(totalHours),
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

      // Vérifier les heures excessives
      const hoursByEmployee = {};
      shifts.forEach(shift => {
        const start = new Date(`2000-01-01T${shift.startTime}`);
        const end = new Date(`2000-01-01T${shift.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        
        hoursByEmployee[shift.employeeId] = (hoursByEmployee[shift.employeeId] || 0) + hours;
      });

      Object.entries(hoursByEmployee).forEach(([empId, hours]) => {
        if (hours > 48) { // Plus de 48h par semaine
          const emp = employees.find(e => e.id === empId);
          alerts.push({
            type: 'error',
            message: `${emp?.name} dépasse les heures légales (${Math.round(hours)}h)`,
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
}

// Export singleton
const planningService = new PlanningService();
export default planningService;
