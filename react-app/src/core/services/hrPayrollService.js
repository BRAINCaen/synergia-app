// ==========================================
// 📁 react-app/src/core/services/hrPayrollService.js
// SERVICE COMPLET GESTION PAIE - GÉNÉRATION EXCEL MENSUEL
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
 * 💰 SERVICE DE GESTION DE LA PAIE COMPLET
 * Gère toutes les données nécessaires à la génération du fichier Excel mensuel
 */
class HRPayrollService {
  constructor() {
    this.shiftsCollection = 'shifts';
    this.usersCollection = 'users';
    this.contractsCollection = 'employee_contracts';
    this.leavesCollection = 'employee_leaves';
    this.primes Collection = 'employee_primes';
    this.advancesCollection = 'employee_advances';
    this.countersCollection = 'employee_counters';
  }

  // ==========================================
  // 📋 CONTRATS EMPLOYÉS
  // ==========================================

  /**
   * ➕ CRÉER/METTRE À JOUR UN CONTRAT EMPLOYÉ
   */
  async upsertEmployeeContract(employeeId, contractData) {
    try {
      console.log('📋 Mise à jour contrat:', employeeId);

      const contractRef = doc(db, this.contractsCollection, employeeId);
      const contractSnap = await getDoc(contractRef);

      const data = {
        employeeId,
        // Données contractuelles
        matriculePaie: contractData.matriculePaie || '',
        typeContrat: contractData.typeContrat || 'CDI', // CDI, CDD, Apprenti, etc.
        intitulePoste: contractData.intitulePoste || 'Game Master',
        dateDebutContrat: contractData.dateDebutContrat || null,
        dateFinContrat: contractData.dateFinContrat || null,
        volumeHoraireHebdo: contractData.volumeHoraireHebdo || 35,
        volumeHoraireMensuel: contractData.volumeHoraireMensuel || 151.67,
        
        // Données salariales
        tauxHoraireBrut: contractData.tauxHoraireBrut || 0,
        salaireMensuelBrut: contractData.salaireMensuelBrut || 0,
        
        // Autres éléments
        mutuelle: contractData.mutuelle || 'mutuelle',
        coutTransportEmployeur: contractData.coutTransportEmployeur || 0,
        noteArchivage: contractData.noteArchivage || '',
        
        // Métadonnées
        updatedAt: serverTimestamp(),
        createdAt: contractSnap.exists() ? contractSnap.data().createdAt : serverTimestamp()
      };

      await updateDoc(contractRef, data).catch(async () => {
        await addDoc(collection(db, this.contractsCollection), data);
      });

      console.log('✅ Contrat mis à jour');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour contrat:', error);
      throw error;
    }
  }

  /**
   * 📋 RÉCUPÉRER LE CONTRAT D'UN EMPLOYÉ
   */
  async getEmployeeContract(employeeId) {
    try {
      const contractRef = doc(db, this.contractsCollection, employeeId);
      const contractSnap = await getDoc(contractRef);

      if (contractSnap.exists()) {
        return {
          id: contractSnap.id,
          ...contractSnap.data()
        };
      }

      // Retourner un contrat par défaut si non trouvé
      return {
        employeeId,
        typeContrat: 'CDI',
        volumeHoraireHebdo: 35,
        volumeHoraireMensuel: 151.67,
        tauxHoraireBrut: 0,
        salaireMensuelBrut: 0
      };
    } catch (error) {
      console.error('❌ Erreur récupération contrat:', error);
      return null;
    }
  }

  // ==========================================
  // 📊 CALCUL HEURES ET COMPTEURS
  // ==========================================

  /**
   * 📊 CALCULER LES HEURES MENSUELLES D'UN EMPLOYÉ
   */
  async calculateMonthlyHours(employeeId, month, year) {
    try {
      console.log(`📊 Calcul heures mensuelles: ${employeeId} - ${month}/${year}`);

      // Dates du mois
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Récupérer tous les shifts du mois
      const shiftsQuery = query(
        collection(db, this.shiftsCollection),
        where('employeeId', '==', employeeId),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'asc')
      );

      const shiftsSnap = await getDocs(shiftsQuery);
      const shifts = [];
      shiftsSnap.forEach(doc => shifts.push({ id: doc.id, ...doc.data() }));

      // Récupérer les absences du mois
      const absences = await this.getMonthlyLeaves(employeeId, month, year);

      // Calculer par semaine
      const weeklyData = this.groupByWeek(shifts, absences, startDate, endDate);

      // Calculer les heures majorées
      const majoredHours = this.calculateMajoredHours(shifts);

      // Compteur mensuel
      const contract = await this.getEmployeeContract(employeeId);
      const expectedHours = contract.volumeHoraireMensuel || 151.67;
      const workedHours = shifts.reduce((sum, s) => sum + (s.duration || 0), 0);
      const absenceHours = absences.filter(a => a.includedInCounter).reduce((sum, a) => sum + a.nbHeures, 0);
      const totalHours = workedHours + absenceHours;
      const counterDifference = totalHours - expectedHours;

      return {
        employeeId,
        month,
        year,
        joursTravaill es: shifts.length,
        heuresTravaillees: parseFloat(workedHours.toFixed(2)),
        totalPauses: 0, // À calculer depuis les shifts si pause enregistrée
        heuresTravailleesHorsPauses: parseFloat(workedHours.toFixed(2)),
        weeklyData,
        majoredHours,
        compteur: {
          debut: 0, // À récupérer du mois précédent
          expectedHours,
          workedHours: parseFloat(totalHours.toFixed(2)),
          difference: parseFloat(counterDifference.toFixed(2)),
          fin: parseFloat(counterDifference.toFixed(2))
        },
        absences: absences.length
      };
    } catch (error) {
      console.error('❌ Erreur calcul heures mensuelles:', error);
      return null;
    }
  }

  /**
   * 📅 GROUPER LES SHIFTS PAR SEMAINE
   */
  groupByWeek(shifts, absences, startDate, endDate) {
    const weeks = {};
    
    // Obtenir toutes les semaines du mois
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekNumber = this.getWeekNumber(currentDate);
      if (!weeks[weekNumber]) {
        weeks[weekNumber] = {
          weekNumber,
          shifts: [],
          absences: [],
          totalHours: 0,
          difference: 0
        };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ajouter les shifts
    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date);
      const weekNumber = this.getWeekNumber(shiftDate);
      if (weeks[weekNumber]) {
        weeks[weekNumber].shifts.push(shift);
        weeks[weekNumber].totalHours += shift.duration || 0;
      }
    });

    // Ajouter les absences
    absences.forEach(absence => {
      const absenceStart = new Date(absence.dateDebut);
      const weekNumber = this.getWeekNumber(absenceStart);
      if (weeks[weekNumber]) {
        weeks[weekNumber].absences.push(absence);
      }
    });

    // Calculer les différences (objectif 35h/semaine)
    Object.keys(weeks).forEach(weekNum => {
      const week = weeks[weekNum];
      week.difference = week.totalHours - 35;
    });

    return Object.values(weeks);
  }

  /**
   * 🔢 OBTENIR LE NUMÉRO DE SEMAINE
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * ⏰ CALCULER LES HEURES MAJORÉES
   */
  calculateMajoredHours(shifts) {
    const majored = {
      joursFeries: 0,
      heuresNuit: 0,
      heuresDimanche: 0,
      heuresSupStructurelles: 0,
      heureSup25: 0,
      heuresSup50: 0
    };

    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date);
      const startTime = shift.startTime;
      const endTime = shift.endTime;
      const duration = shift.duration || 0;

      // Dimanche (code jour = 0)
      if (shiftDate.getDay() === 0) {
        majored.heuresDimanche += duration;
      }

      // Heures de nuit (22h-6h)
      const nightHours = this.calculateNightHours(startTime, endTime);
      majored.heuresNuit += nightHours;

      // Jours fériés (à définir dans une liste)
      if (this.isBankHoliday(shiftDate)) {
        majored.joursFeries += duration;
      }
    });

    return majored;
  }

  /**
   * 🌙 CALCULER LES HEURES DE NUIT
   */
  calculateNightHours(startTime, endTime) {
    // Heures de nuit = 22h00 - 06h00
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const nightStart = 22 * 60; // 22h00 en minutes
    const nightEnd = 6 * 60; // 06h00 en minutes

    let nightMinutes = 0;

    // Si le shift traverse minuit
    if (end < start) {
      // Avant minuit (22h-00h)
      if (start < 24 * 60) {
        nightMinutes += Math.min(24 * 60, 24 * 60) - Math.max(start, nightStart);
      }
      // Après minuit (00h-06h)
      if (end > 0) {
        nightMinutes += Math.min(end, nightEnd);
      }
    } else {
      // Même jour
      if (start >= nightStart || end <= nightEnd) {
        nightMinutes = Math.min(end, nightEnd) - Math.max(start, nightStart);
        nightMinutes = Math.max(0, nightMinutes);
      }
    }

    return parseFloat((nightMinutes / 60).toFixed(2));
  }

  /**
   * ⏱️ CONVERTIR HEURE EN MINUTES
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 📅 VÉRIFIER SI JOUR FÉRIÉ
   */
  isBankHoliday(date) {
    // Liste des jours fériés français 2025
    const bankHolidays2025 = [
      '2025-01-01', // Jour de l'an
      '2025-04-21', // Lundi de Pâques
      '2025-05-01', // Fête du travail
      '2025-05-08', // Victoire 1945
      '2025-05-29', // Ascension
      '2025-06-09', // Lundi de Pentecôte
      '2025-07-14', // Fête nationale
      '2025-08-15', // Assomption
      '2025-11-01', // Toussaint
      '2025-11-11', // Armistice 1918
      '2025-12-25'  // Noël
    ];

    const dateStr = date.toISOString().split('T')[0];
    return bankHolidays2025.includes(dateStr);
  }

  // ==========================================
  // 🏖️ GESTION DES ABSENCES ET CONGÉS
  // ==========================================

  /**
   * 🏖️ RÉCUPÉRER LES ABSENCES DU MOIS
   */
  async getMonthlyLeaves(employeeId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const leavesQuery = query(
        collection(db, this.leavesCollection),
        where('employeeId', '==', employeeId),
        where('dateDebut', '>=', startDateStr),
        where('dateDebut', '<=', endDateStr),
        orderBy('dateDebut', 'asc')
      );

      const leavesSnap = await getDocs(leavesQuery);
      const leaves = [];

      leavesSnap.forEach(doc => {
        const data = doc.data();
        leaves.push({
          id: doc.id,
          ...data,
          includedInCounter: ['École - CFA', 'Formation'].includes(data.typeAbsence)
        });
      });

      return leaves;
    } catch (error) {
      console.error('❌ Erreur récupération absences:', error);
      return [];
    }
  }

  /**
   * ➕ AJOUTER UNE ABSENCE
   */
  async addLeave(leaveData) {
    try {
      console.log('➕ Ajout absence:', leaveData);

      const leave = {
        employeeId: leaveData.employeeId,
        typeAbsence: leaveData.typeAbsence, // CP, Maladie, École CFA, Repos hebdo, etc.
        dateDebut: leaveData.dateDebut,
        dateFin: leaveData.dateFin,
        nbHeures: leaveData.nbHeures || 0,
        nbJours: leaveData.nbJours || 1,
        justificatif: leaveData.justificatif || false,
        note: leaveData.note || '',
        createdAt: serverTimestamp(),
        createdBy: leaveData.createdBy
      };

      const leaveRef = await addDoc(collection(db, this.leavesCollection), leave);

      console.log('✅ Absence ajoutée:', leaveRef.id);
      return { success: true, id: leaveRef.id };
    } catch (error) {
      console.error('❌ Erreur ajout absence:', error);
      throw error;
    }
  }

  // ==========================================
  // 💰 GESTION PRIMES ET AVANCES
  // ==========================================

  /**
   * 💰 AJOUTER UNE PRIME
   */
  async addPrime(primeData) {
    try {
      const prime = {
        employeeId: primeData.employeeId,
        montant: primeData.montant || 0,
        description: primeData.description || 'Aucune prime',
        month: primeData.month,
        year: primeData.year,
        createdAt: serverTimestamp(),
        createdBy: primeData.createdBy
      };

      const primeRef = await addDoc(collection(db, this.primesCollection), prime);
      console.log('✅ Prime ajoutée:', primeRef.id);
      return { success: true, id: primeRef.id };
    } catch (error) {
      console.error('❌ Erreur ajout prime:', error);
      throw error;
    }
  }

  /**
   * 💳 AJOUTER UNE AVANCE
   */
  async addAdvance(advanceData) {
    try {
      const advance = {
        employeeId: advanceData.employeeId,
        montant: advanceData.montant || 0,
        description: advanceData.description || 'Aucune avance',
        month: advanceData.month,
        year: advanceData.year,
        createdAt: serverTimestamp(),
        createdBy: advanceData.createdBy
      };

      const advanceRef = await addDoc(collection(db, this.advancesCollection), advance);
      console.log('✅ Avance ajoutée:', advanceRef.id);
      return { success: true, id: advanceRef.id };
    } catch (error) {
      console.error('❌ Erreur ajout avance:', error);
      throw error;
    }
  }

  /**
   * 💰 RÉCUPÉRER PRIMES ET AVANCES DU MOIS
   */
  async getMonthlyPrimesAndAdvances(employeeId, month, year) {
    try {
      // Primes
      const primesQuery = query(
        collection(db, this.primesCollection),
        where('employeeId', '==', employeeId),
        where('month', '==', month),
        where('year', '==', year)
      );
      const primesSnap = await getDocs(primesQuery);
      const primes = [];
      primesSnap.forEach(doc => primes.push({ id: doc.id, ...doc.data() }));

      // Avances
      const advancesQuery = query(
        collection(db, this.advancesCollection),
        where('employeeId', '==', employeeId),
        where('month', '==', month),
        where('year', '==', year)
      );
      const advancesSnap = await getDocs(advancesQuery);
      const advances = [];
      advancesSnap.forEach(doc => advances.push({ id: doc.id, ...doc.data() }));

      const totalPrimes = primes.reduce((sum, p) => sum + p.montant, 0);
      const totalAdvances = advances.reduce((sum, a) => sum + a.montant, 0);

      return {
        primes,
        advances,
        totalPrimes: parseFloat(totalPrimes.toFixed(2)),
        totalAdvances: parseFloat(totalAdvances.toFixed(2)),
        primesDescription: primes.map(p => p.description).join(', ') || 'Aucune prime',
        advancesDescription: advances.map(a => a.description).join(', ') || 'Aucune avance'
      };
    } catch (error) {
      console.error('❌ Erreur récupération primes/avances:', error);
      return {
        primes: [],
        advances: [],
        totalPrimes: 0,
        totalAdvances: 0,
        primesDescription: 'Aucune prime',
        advancesDescription: 'Aucune avance'
      };
    }
  }

  // ==========================================
  // 📊 GÉNÉRATION DONNÉES COMPLÈTES POUR EXPORT
  // ==========================================

  /**
   * 📊 GÉNÉRER TOUTES LES DONNÉES POUR L'EXPORT EXCEL MENSUEL
   */
  async generateMonthlyPayrollData(month, year) {
    try {
      console.log(`📊 Génération données paie: ${month}/${year}`);

      // Récupérer tous les employés
      const usersQuery = query(collection(db, this.usersCollection), orderBy('displayName', 'asc'));
      const usersSnap = await getDocs(usersQuery);
      
      const employeesData = [];

      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Récupérer le contrat
        const contract = await this.getEmployeeContract(userId);

        // Calculer les heures mensuelles
        const monthlyHours = await this.calculateMonthlyHours(userId, month, year);

        // Récupérer primes et avances
        const primesAdvances = await this.getMonthlyPrimesAndAdvances(userId, month, year);

        // Récupérer les absences
        const absences = await this.getMonthlyLeaves(userId, month, year);

        employeesData.push({
          id: userId,
          nom: userData.displayName?.split(' ').slice(-1)[0] || '',
          prenom: userData.displayName?.split(' ')[0] || '',
          email: userData.email || '',
          contract,
          monthlyHours,
          primesAdvances,
          absences
        });
      }

      console.log(`✅ Données générées pour ${employeesData.length} employés`);

      return {
        month,
        year,
        employees: employeesData,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur génération données paie:', error);
      throw error;
    }
  }
}

// Export singleton
const hrPayrollService = new HRPayrollService();
export default hrPayrollService;
