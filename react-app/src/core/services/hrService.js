// ==========================================
// 📁 react-app/src/core/services/hrService.js
// SERVICE DE GESTION RH COMPLET
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏢 SERVICE COMPLET DE GESTION RH
 * Gestion des salariés, plannings, pointages, documents et paie
 */
class HRService {
  constructor() {
    console.log('🏢 HRService initialisé');
  }

  // ==========================================
  // 👥 GESTION DES SALARIÉS
  // ==========================================

  /**
   * ➕ CRÉER UN NOUVEAU SALARIÉ
   */
  async createEmployee(employeeData) {
    try {
      console.log('➕ [CREATE] Création salarié:', employeeData);

      const newEmployee = {
        ...employeeData,
        status: employeeData.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Données supplémentaires
        totalHours: 0,
        overtimeHours: 0,
        leaveBalance: 25, // Jours de congés par défaut
        documentsCount: 0,
        schedulesCount: 0
      };

      const docRef = await addDoc(collection(db, 'hr_employees'), newEmployee);
      
      console.log('✅ [CREATE] Salarié créé avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newEmployee
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création salarié:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUS LES SALARIÉS
   */
  async getAllEmployees() {
    try {
      console.log('📋 [GET_ALL] Récupération salariés');

      const employeesQuery = query(
        collection(db, 'hr_employees'),
        orderBy('createdAt', 'desc')
      );
      
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = [];
      
      employeesSnapshot.forEach(doc => {
        employees.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_ALL] Salariés récupérés:', employees.length);
      return employees;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération salariés:', error);
      throw error;
    }
  }

  /**
   * 👤 RÉCUPÉRER UN SALARIÉ PAR ID
   */
  async getEmployee(employeeId) {
    try {
      console.log('👤 [GET] Récupération salarié:', employeeId);

      const employeeRef = doc(db, 'hr_employees', employeeId);
      const employeeDoc = await getDoc(employeeRef);
      
      if (!employeeDoc.exists()) {
        throw new Error('Salarié introuvable');
      }

      console.log('✅ [GET] Salarié récupéré');
      return {
        id: employeeDoc.id,
        ...employeeDoc.data()
      };

    } catch (error) {
      console.error('❌ [GET] Erreur récupération salarié:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UN SALARIÉ
   */
  async updateEmployee(employeeId, updates) {
    try {
      console.log('✏️ [UPDATE] Mise à jour salarié:', employeeId);

      const employeeRef = doc(db, 'hr_employees', employeeId);
      await updateDoc(employeeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [UPDATE] Salarié mis à jour');
      return true;

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour salarié:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN SALARIÉ
   */
  async deleteEmployee(employeeId) {
    try {
      console.log('🗑️ [DELETE] Suppression salarié:', employeeId);

      const employeeRef = doc(db, 'hr_employees', employeeId);
      await deleteDoc(employeeRef);

      console.log('✅ [DELETE] Salarié supprimé');
      return true;

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression salarié:', error);
      throw error;
    }
  }

  // ==========================================
  // 📅 GESTION DES PLANNINGS
  // ==========================================

  /**
   * 📅 CRÉER UN PLANNING
   */
  async createSchedule(scheduleData) {
    try {
      console.log('📅 [CREATE] Création planning:', scheduleData);

      const newSchedule = {
        ...scheduleData,
        status: 'scheduled', // scheduled, completed, cancelled
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'hr_schedules'), newSchedule);
      
      console.log('✅ [CREATE] Planning créé avec ID:', docRef.id);
      
      // Incrémenter le compteur de plannings du salarié
      if (scheduleData.employeeId) {
        const employeeRef = doc(db, 'hr_employees', scheduleData.employeeId);
        await updateDoc(employeeRef, {
          schedulesCount: increment(1)
        });
      }

      return {
        id: docRef.id,
        ...newSchedule
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création planning:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUS LES PLANNINGS
   */
  async getAllSchedules() {
    try {
      console.log('📋 [GET_ALL] Récupération plannings');

      const schedulesQuery = query(
        collection(db, 'hr_schedules'),
        orderBy('date', 'desc')
      );
      
      const schedulesSnapshot = await getDocs(schedulesQuery);
      const schedules = [];
      
      schedulesSnapshot.forEach(doc => {
        schedules.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_ALL] Plannings récupérés:', schedules.length);
      return schedules;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération plannings:', error);
      throw error;
    }
  }

  /**
   * 📅 RÉCUPÉRER PLANNINGS PAR SALARIÉ
   */
  async getSchedulesByEmployee(employeeId) {
    try {
      console.log('📅 [GET_BY_EMPLOYEE] Récupération plannings:', employeeId);

      const schedulesQuery = query(
        collection(db, 'hr_schedules'),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc')
      );
      
      const schedulesSnapshot = await getDocs(schedulesQuery);
      const schedules = [];
      
      schedulesSnapshot.forEach(doc => {
        schedules.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_BY_EMPLOYEE] Plannings récupérés:', schedules.length);
      return schedules;

    } catch (error) {
      console.error('❌ [GET_BY_EMPLOYEE] Erreur récupération plannings:', error);
      throw error;
    }
  }

  /**
   * 📅 RÉCUPÉRER PLANNINGS PAR DATE
   */
  async getSchedulesByDate(startDate, endDate) {
    try {
      console.log('📅 [GET_BY_DATE] Récupération plannings:', { startDate, endDate });

      const schedulesQuery = query(
        collection(db, 'hr_schedules'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      const schedulesSnapshot = await getDocs(schedulesQuery);
      const schedules = [];
      
      schedulesSnapshot.forEach(doc => {
        schedules.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_BY_DATE] Plannings récupérés:', schedules.length);
      return schedules;

    } catch (error) {
      console.error('❌ [GET_BY_DATE] Erreur récupération plannings:', error);
      throw error;
    }
  }

  /**
   * ✏️ METTRE À JOUR UN PLANNING
   */
  async updateSchedule(scheduleId, updates) {
    try {
      console.log('✏️ [UPDATE] Mise à jour planning:', scheduleId);

      const scheduleRef = doc(db, 'hr_schedules', scheduleId);
      await updateDoc(scheduleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [UPDATE] Planning mis à jour');
      return true;

    } catch (error) {
      console.error('❌ [UPDATE] Erreur mise à jour planning:', error);
      throw error;
    }
  }

  /**
   * 🗑️ SUPPRIMER UN PLANNING
   */
  async deleteSchedule(scheduleId, employeeId) {
    try {
      console.log('🗑️ [DELETE] Suppression planning:', scheduleId);

      const scheduleRef = doc(db, 'hr_schedules', scheduleId);
      await deleteDoc(scheduleRef);

      // Décrémenter le compteur de plannings du salarié
      if (employeeId) {
        const employeeRef = doc(db, 'hr_employees', employeeId);
        await updateDoc(employeeRef, {
          schedulesCount: increment(-1)
        });
      }

      console.log('✅ [DELETE] Planning supprimé');
      return true;

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression planning:', error);
      throw error;
    }
  }

  // ==========================================
  // ⏰ GESTION DES POINTAGES
  // ==========================================

  /**
   * ⏰ CRÉER UN POINTAGE
   */
  async createTimesheet(timesheetData) {
    try {
      console.log('⏰ [CREATE] Création pointage:', timesheetData);

      const newTimesheet = {
        ...timesheetData,
        status: 'pending', // pending, validated, rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'hr_timesheets'), newTimesheet);
      
      console.log('✅ [CREATE] Pointage créé avec ID:', docRef.id);
      
      return {
        id: docRef.id,
        ...newTimesheet
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création pointage:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER TOUS LES POINTAGES
   */
  async getAllTimesheets() {
    try {
      console.log('📋 [GET_ALL] Récupération pointages');

      const timesheetsQuery = query(
        collection(db, 'hr_timesheets'),
        orderBy('createdAt', 'desc')
      );
      
      const timesheetsSnapshot = await getDocs(timesheetsQuery);
      const timesheets = [];
      
      timesheetsSnapshot.forEach(doc => {
        timesheets.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_ALL] Pointages récupérés:', timesheets.length);
      return timesheets;

    } catch (error) {
      console.error('❌ [GET_ALL] Erreur récupération pointages:', error);
      throw error;
    }
  }

  /**
   * ⏰ RÉCUPÉRER POINTAGES PAR SALARIÉ
   */
  async getTimesheetsByEmployee(employeeId) {
    try {
      console.log('⏰ [GET_BY_EMPLOYEE] Récupération pointages:', employeeId);

      const timesheetsQuery = query(
        collection(db, 'hr_timesheets'),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
      
      const timesheetsSnapshot = await getDocs(timesheetsQuery);
      const timesheets = [];
      
      timesheetsSnapshot.forEach(doc => {
        timesheets.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('✅ [GET_BY_EMPLOYEE] Pointages récupérés:', timesheets.length);
      return timesheets;

    } catch (error) {
      console.error('❌ [GET_BY_EMPLOYEE] Erreur récupération pointages:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER UN POINTAGE
   */
  async validateTimesheet(timesheetId, validatorId) {
    try {
      console.log('✅ [VALIDATE] Validation pointage:', timesheetId);

      const timesheetRef = doc(db, 'hr_timesheets', timesheetId);
      await updateDoc(timesheetRef, {
        status: 'validated',
        validatedBy: validatorId,
        validatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [VALIDATE] Pointage validé');
      return true;

    } catch (error) {
      console.error('❌ [VALIDATE] Erreur validation pointage:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UN POINTAGE
   */
  async rejectTimesheet(timesheetId, validatorId, reason) {
    try {
      console.log('❌ [REJECT] Rejet pointage:', timesheetId);

      const timesheetRef = doc(db, 'hr_timesheets', timesheetId);
      await updateDoc(timesheetRef, {
        status: 'rejected',
        rejectedBy: validatorId,
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [REJECT] Pointage rejeté');
      return true;

    } catch (error) {
      console.error('❌ [REJECT] Erreur rejet pointage:', error);
      throw error;
    }
  }

  // ==========================================
  // 📄 GESTION DES DOCUMENTS
  // ==========================================

  /**
   * 📄 CRÉER UN DOCUMENT RH
   */
  async createDocument(documentData) {
    try {
      console.log('📄 [CREATE] Création document:', documentData);

      const newDocument = {
        ...documentData,
        status: 'pending_signature', // pending_signature, signed, archived
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'hr_documents'), newDocument);
      
      console.log('✅ [CREATE] Document créé avec ID:', docRef.id);
      
      // Incrémenter le compteur de documents du salarié
      if (documentData.employeeId) {
        const employeeRef = doc(db, 'hr_employees', documentData.employeeId);
        await updateDoc(employeeRef, {
          documentsCount: increment(1)
        });
      }

      return {
        id: docRef.id,
        ...newDocument
      };

    } catch (error) {
      console.error('❌ [CREATE] Erreur création document:', error);
      throw error;
    }
  }

  /**
   * ✍️ SIGNER UN DOCUMENT
   */
  async signDocument(documentId, signatureData) {
    try {
      console.log('✍️ [SIGN] Signature document:', documentId);

      const documentRef = doc(db, 'hr_documents', documentId);
      await updateDoc(documentRef, {
        status: 'signed',
        signature: signatureData,
        signedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [SIGN] Document signé');
      return true;

    } catch (error) {
      console.error('❌ [SIGN] Erreur signature document:', error);
      throw error;
    }
  }

  // ==========================================
  // 💰 EXPORTS PAIE
  // ==========================================

  /**
   * 💰 GÉNÉRER EXPORT PAIE
   */
  async generatePayrollExport(startDate, endDate) {
    try {
      console.log('💰 [EXPORT] Génération export paie:', { startDate, endDate });

      // Récupérer tous les pointages validés pour la période
      const timesheetsQuery = query(
        collection(db, 'hr_timesheets'),
        where('status', '==', 'validated'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      
      const timesheetsSnapshot = await getDocs(timesheetsQuery);
      
      // Grouper par salarié
      const payrollData = {};
      
      for (const doc of timesheetsSnapshot.docs) {
        const timesheet = doc.data();
        const employeeId = timesheet.employeeId;
        
        if (!payrollData[employeeId]) {
          // Récupérer les infos du salarié
          const employeeDoc = await getDoc(doc(db, 'hr_employees', employeeId));
          const employee = employeeDoc.data();
          
          payrollData[employeeId] = {
            employeeId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            totalHours: 0,
            overtimeHours: 0,
            timesheets: []
          };
        }
        
        payrollData[employeeId].totalHours += timesheet.totalHours || 0;
        payrollData[employeeId].overtimeHours += timesheet.overtime || 0;
        payrollData[employeeId].timesheets.push(timesheet);
      }

      console.log('✅ [EXPORT] Export paie généré');
      return Object.values(payrollData);

    } catch (error) {
      console.error('❌ [EXPORT] Erreur génération export:', error);
      throw error;
    }
  }

  // ==========================================
  // 📊 STATISTIQUES RH
  // ==========================================

  /**
   * 📊 CALCULER STATISTIQUES RH
   */
  async calculateHRStats() {
    try {
      console.log('📊 [STATS] Calcul statistiques RH');

      // Total salariés
      const employeesSnapshot = await getDocs(collection(db, 'hr_employees'));
      const totalEmployees = employeesSnapshot.size;
      const activeEmployees = employeesSnapshot.docs.filter(
        doc => doc.data().status === 'active'
      ).length;

      // Pointages en attente
      const pendingTimesheetsQuery = query(
        collection(db, 'hr_timesheets'),
        where('status', '==', 'pending')
      );
      const pendingTimesheetsSnapshot = await getDocs(pendingTimesheetsQuery);
      const pendingTimeSheets = pendingTimesheetsSnapshot.size;

      // Heures du mois en cours
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthTimesheetsQuery = query(
        collection(db, 'hr_timesheets'),
        where('date', '>=', startOfMonth.toISOString()),
        where('date', '<=', endOfMonth.toISOString())
      );
      const monthTimesheetsSnapshot = await getDocs(monthTimesheetsQuery);
      
      let monthlyHours = 0;
      let overtime = 0;
      
      monthTimesheetsSnapshot.forEach(doc => {
        const data = doc.data();
        monthlyHours += data.totalHours || 0;
        overtime += data.overtime || 0;
      });

      const stats = {
        totalEmployees,
        activeEmployees,
        pendingTimeSheets,
        pendingLeaves: 0, // À implémenter
        monthlyHours: Math.round(monthlyHours),
        overtime: Math.round(overtime)
      };

      console.log('✅ [STATS] Statistiques calculées:', stats);
      return stats;

    } catch (error) {
      console.error('❌ [STATS] Erreur calcul statistiques:', error);
      throw error;
    }
  }
}

// Export singleton
const hrService = new HRService();
export { hrService };
export default hrService;
