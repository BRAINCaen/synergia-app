// ==========================================
// react-app/src/core/services/timesheetExportService.js
// SERVICE EXPORT POINTAGES EXCEL - SYNERGIA v4.0
// Export des feuilles de temps au format Excel modifiable
// ==========================================

import ExcelJS from 'exceljs';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// ==========================================
// CONFIGURATION
// ==========================================
const COLORS = {
  header: 'FF1E293B',      // Slate 800
  subHeader: 'FF6366F1',   // Indigo
  success: 'FF22C55E',     // Green
  warning: 'FFF59E0B',     // Amber
  danger: 'FFEF4444',      // Red
  info: 'FF3B82F6',        // Blue
  light: 'FFF8FAFC',       // Slate 50
  weekend: 'FFFEF3C7',     // Amber 100
  absence: 'FFFECACA',     // Red 100
  conge: 'FFBBF7D0',       // Green 200
  rtt: 'FFBFDBFE',         // Blue 200
  maladie: 'FFFECDD3'      // Rose 200
};

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

// ==========================================
// SERVICE D'EXPORT
// ==========================================
class TimesheetExportService {
  constructor() {
    console.log('📊 TimesheetExportService initialisé');
  }

  // ==========================================
  // RÉCUPÉRATION DES DONNÉES
  // ==========================================

  /**
   * Recuperer les pointages d'un mois pour un ou tous les employes
   * Lit depuis la collection 'timeEntries' (badgeuse)
   */
  async getMonthlyPointages(year, month, employeeId = null) {
    try {
      // Creer des objets Date pour la comparaison (timeEntries stocke date comme Timestamp)
      const startDate = new Date(year, month, 1, 0, 0, 0);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59); // Dernier jour du mois

      console.log(`📊 Recherche pointages du ${startDate.toLocaleDateString()} au ${endDate.toLocaleDateString()}`);

      let q;
      if (employeeId) {
        q = query(
          collection(db, 'timeEntries'),
          where('userId', '==', employeeId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
      } else {
        q = query(
          collection(db, 'timeEntries'),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      const pointages = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // Ignorer les entrees supprimees
        if (data.status === 'deleted') return;

        const dateValue = data.date?.toDate?.() || new Date(data.date);
        const dateStr = dateValue.toISOString().split('T')[0];

        pointages.push({
          id: doc.id,
          ...data,
          date: dateStr, // Convertir en string pour compatibilite
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp)
        });
      });

      console.log(`✅ ${pointages.length} pointages trouves dans timeEntries`);
      return pointages;
    } catch (error) {
      console.error('❌ Erreur recuperation pointages:', error);
      return [];
    }
  }

  /**
   * Recuperer les conges approuves d'un mois
   * Lit depuis les deux collections: leaveRequests ET leave_requests
   */
  async getMonthlyLeaves(year, month, employeeId = null) {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

      const leaves = [];

      // 1. Collection leaveRequests
      try {
        let q1;
        if (employeeId) {
          q1 = query(
            collection(db, 'leaveRequests'),
            where('userId', '==', employeeId),
            where('status', '==', 'approved')
          );
        } else {
          q1 = query(
            collection(db, 'leaveRequests'),
            where('status', '==', 'approved')
          );
        }

        const snapshot1 = await getDocs(q1);
        snapshot1.forEach(doc => {
          const data = doc.data();
          const leaveStart = data.startDate?.split?.('T')?.[0] || data.startDate;
          const leaveEnd = data.endDate?.split?.('T')?.[0] || data.endDate;

          if (leaveStart <= endDate && leaveEnd >= startDate) {
            leaves.push({
              id: doc.id,
              ...data,
              startDate: leaveStart,
              endDate: leaveEnd,
              source: 'leaveRequests'
            });
          }
        });
      } catch (e) {
        console.warn('Erreur collection leaveRequests:', e.message);
      }

      // 2. Collection leave_requests
      try {
        let q2;
        if (employeeId) {
          q2 = query(
            collection(db, 'leave_requests'),
            where('userId', '==', employeeId),
            where('status', '==', 'approved')
          );
        } else {
          q2 = query(
            collection(db, 'leave_requests'),
            where('status', '==', 'approved')
          );
        }

        const snapshot2 = await getDocs(q2);
        snapshot2.forEach(doc => {
          const data = doc.data();
          const leaveStart = data.startDate?.split?.('T')?.[0] || data.startDate;
          const leaveEnd = data.endDate?.split?.('T')?.[0] || data.endDate;

          // Eviter les doublons
          const exists = leaves.some(l => l.id === doc.id);
          if (!exists && leaveStart <= endDate && leaveEnd >= startDate) {
            leaves.push({
              id: doc.id,
              ...data,
              startDate: leaveStart,
              endDate: leaveEnd,
              source: 'leave_requests'
            });
          }
        });
      } catch (e) {
        console.warn('Erreur collection leave_requests:', e.message);
      }

      console.log(`✅ ${leaves.length} conges/absences trouves`);
      return leaves;
    } catch (error) {
      console.error('Erreur recuperation conges:', error);
      return [];
    }
  }

  /**
   * Recuperer les shifts du planning pour un mois
   * Pour detecter les jours de formation, repos, etc.
   */
  async getMonthlyShifts(year, month, employeeId = null) {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

      let q;
      if (employeeId) {
        q = query(
          collection(db, 'shifts'),
          where('employeeId', '==', employeeId),
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
      } else {
        q = query(
          collection(db, 'shifts'),
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
      }

      const snapshot = await getDocs(q);
      const shifts = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        shifts.push({
          id: doc.id,
          ...data
        });
      });

      console.log(`✅ ${shifts.length} shifts trouves dans le planning`);
      return shifts;
    } catch (error) {
      console.error('Erreur recuperation shifts:', error);
      return [];
    }
  }

  /**
   * Determiner le type special d'un shift (formation, repos, etc.)
   */
  getShiftSpecialType(shift) {
    if (!shift?.position) return null;

    const position = shift.position.toLowerCase();

    // Formation / CFA / Ecole
    if (position.includes('formation') || position.includes('cfa') ||
        position.includes('ecole') || position.includes('école') ||
        position.includes('cours') || position.includes('alternance')) {
      return { type: 'formation', label: 'Formation', color: 'FFDBEAFE' }; // Blue 100
    }

    // Repos / OFF / RTT
    if (position.includes('repos') || position === 'off' || position === 'rtt' ||
        position.includes('jour off') || position.includes('recup')) {
      return { type: 'repos', label: 'Repos', color: 'FFE0E7FF' }; // Indigo 100
    }

    // Maladie
    if (position.includes('maladie') || position.includes('arret') ||
        position.includes('medical')) {
      return { type: 'maladie', label: 'Arret maladie', color: 'FFFECACA' }; // Red 100
    }

    // Conges
    if (position.includes('conge') || position.includes('cp') ||
        position.includes('vacances')) {
      return { type: 'conges', label: 'Conges', color: 'FFBBF7D0' }; // Green 200
    }

    return null;
  }

  /**
   * Récupérer les employés
   */
  async getEmployees() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const employees = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          position: data.position || data.poste || 'Employé',
          department: data.department || data.service || ''
        });
      });

      return employees;
    } catch (error) {
      console.error('❌ Erreur récupération employés:', error);
      return [];
    }
  }

  // ==========================================
  // CALCULS
  // ==========================================

  /**
   * Calculer les heures travaillées entre deux timestamps
   */
  calculateHoursWorked(arrival, departure) {
    if (!arrival || !departure) return 0;

    const arrivalTime = new Date(arrival);
    const departureTime = new Date(departure);
    const diff = (departureTime - arrivalTime) / (1000 * 60 * 60); // En heures

    return Math.max(0, diff);
  }

  /**
   * Formater une durée en heures:minutes
   */
  formatDuration(hours) {
    if (!hours || hours <= 0) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
  }

  /**
   * Vérifier si un jour est un weekend
   */
  isWeekend(date) {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }

  /**
   * Obtenir le type de congé pour un jour donné
   */
  getLeaveForDate(date, leaves, employeeId) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    for (const leave of leaves) {
      if (leave.userId === employeeId && dateStr >= leave.startDate && dateStr <= leave.endDate) {
        return leave;
      }
    }
    return null;
  }

  // ==========================================
  // GÉNÉRATION EXCEL - FEUILLE MENSUELLE
  // ==========================================

  /**
   * Générer l'export Excel mensuel complet
   */
  async exportMonthlyTimesheet(year, month, options = {}) {
    const {
      employeeId = null, // null = tous les employes
      includeDetails = true,
      includeSummary = true,
      companyName = 'Synergia',
      deductPause = false // NE PAS deduire la pause par defaut (deja incluse dans les heures)
    } = options;

    console.log(`📊 Export pointages ${MONTHS_FR[month]} ${year}...`);

    // Recuperer les donnees (incluant maintenant les shifts du planning)
    const [employees, pointages, leaves, shifts] = await Promise.all([
      this.getEmployees(),
      this.getMonthlyPointages(year, month, employeeId),
      this.getMonthlyLeaves(year, month, employeeId),
      this.getMonthlyShifts(year, month, employeeId)
    ]);

    // Filtrer les employes si necessaire
    const targetEmployees = employeeId
      ? employees.filter(e => e.id === employeeId)
      : employees;

    if (targetEmployees.length === 0) {
      throw new Error('Aucun employe trouve');
    }

    // Creer le workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Synergia';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Generer une feuille par employe
    for (const employee of targetEmployees) {
      const employeePointages = pointages.filter(p => p.userId === employee.id);
      const employeeLeaves = leaves.filter(l => l.userId === employee.id);
      const employeeShifts = shifts.filter(s => s.employeeId === employee.id);

      await this.createEmployeeSheet(workbook, employee, year, month, employeePointages, employeeLeaves, employeeShifts, companyName, deductPause);
    }

    // Ajouter la feuille recapitulative si demande
    if (includeSummary && targetEmployees.length > 1) {
      await this.createSummarySheet(workbook, targetEmployees, year, month, pointages, leaves, companyName);
    }

    // Générer le fichier
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Télécharger
    const fileName = employeeId
      ? `Pointages-${targetEmployees[0]?.displayName?.replace(/\s+/g, '-')}-${MONTHS_FR[month]}-${year}.xlsx`
      : `Pointages-${MONTHS_FR[month]}-${year}.xlsx`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`✅ Export terminé: ${fileName}`);
    return { success: true, fileName };
  }

  /**
   * Créer la feuille d'un employé
   */
  async createEmployeeSheet(workbook, employee, year, month, pointages, leaves, shifts, companyName, deductPause = false) {
    const sheetName = (employee.displayName || 'Employé').substring(0, 31); // Max 31 chars
    const sheet = workbook.addWorksheet(sheetName, {
      properties: { tabColor: { argb: '6366F1' } }
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let rowNum = 1;

    // ==========================================
    // EN-TÊTE
    // ==========================================

    // Titre principal
    sheet.mergeCells(`A${rowNum}:I${rowNum}`);
    const titleCell = sheet.getCell(`A${rowNum}`);
    titleCell.value = `FEUILLE DE TEMPS - ${MONTHS_FR[month].toUpperCase()} ${year}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.header } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(rowNum).height = 35;
    rowNum++;

    // Sous-titre entreprise
    sheet.mergeCells(`A${rowNum}:I${rowNum}`);
    const companyCell = sheet.getCell(`A${rowNum}`);
    companyCell.value = companyName;
    companyCell.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
    companyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subHeader } };
    companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(rowNum).height = 25;
    rowNum++;

    // Ligne vide
    rowNum++;

    // Informations employé
    sheet.getCell(`A${rowNum}`).value = 'Employé:';
    sheet.getCell(`A${rowNum}`).font = { bold: true };
    sheet.getCell(`B${rowNum}`).value = employee.displayName;
    sheet.getCell(`D${rowNum}`).value = 'Poste:';
    sheet.getCell(`D${rowNum}`).font = { bold: true };
    sheet.getCell(`E${rowNum}`).value = employee.position;
    sheet.getCell(`G${rowNum}`).value = 'Période:';
    sheet.getCell(`G${rowNum}`).font = { bold: true };
    sheet.getCell(`H${rowNum}`).value = `${MONTHS_FR[month]} ${year}`;
    rowNum++;

    sheet.getCell(`A${rowNum}`).value = 'Email:';
    sheet.getCell(`A${rowNum}`).font = { bold: true };
    sheet.getCell(`B${rowNum}`).value = employee.email;
    sheet.getCell(`D${rowNum}`).value = 'Service:';
    sheet.getCell(`D${rowNum}`).font = { bold: true };
    sheet.getCell(`E${rowNum}`).value = employee.department || '-';
    sheet.getCell(`G${rowNum}`).value = 'Export:';
    sheet.getCell(`G${rowNum}`).font = { bold: true };
    sheet.getCell(`H${rowNum}`).value = new Date().toLocaleDateString('fr-FR');
    rowNum++;

    // Ligne vide
    rowNum++;
    rowNum++;

    // ==========================================
    // TABLEAU DES POINTAGES
    // ==========================================

    // En-têtes du tableau
    const headers = ['Date', 'Jour', 'Arrivée', 'Départ', 'Pause', 'Heures Trav.', 'Heures Supp.', 'Statut', 'Remarques'];
    const headerRow = sheet.getRow(rowNum);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.info } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    sheet.getRow(rowNum).height = 25;
    rowNum++;

    // Donnees journalieres
    let totalHours = 0;
    let totalOvertimeHours = 0;
    let totalDaysWorked = 0;
    let totalLeaveDays = 0;
    let totalFormationDays = 0;
    let totalReposDays = 0;
    const dailyHoursThreshold = 7; // Heures normales par jour

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

      // Recuperer les pointages du jour
      const dayPointages = pointages.filter(p => p.date === dateStr);
      const arrivals = dayPointages.filter(p => p.type === 'arrival').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const departures = dayPointages.filter(p => p.type === 'departure').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Verifier les conges
      const leave = this.getLeaveForDate(dateStr, leaves, employee.id);

      // Verifier les shifts du planning pour ce jour
      const dayShifts = shifts.filter(s => s.date === dateStr);
      const specialShift = dayShifts.length > 0 ? this.getShiftSpecialType(dayShifts[0]) : null;

      // Calculer les heures
      let hoursWorked = 0;
      let arrivalTime = '-';
      let departureTime = '-';
      let pauseTime = '-';
      let status = '';
      let remarks = '';
      let rowColor = null;

      if (leave) {
        // Jour de conge
        status = leave.leaveTypeLabel || leave.leaveType || 'Conge';
        remarks = leave.reason || '';
        totalLeaveDays++;

        // Couleur selon type de conge
        const leaveTypeLower = (leave.leaveType || '').toLowerCase();
        if (leaveTypeLower.includes('paid') || leaveTypeLower.includes('cp') || leaveTypeLower.includes('conge')) {
          rowColor = COLORS.conge;
        } else if (leaveTypeLower.includes('rtt')) {
          rowColor = COLORS.rtt;
        } else if (leaveTypeLower.includes('sick') || leaveTypeLower.includes('maladie') || leaveTypeLower.includes('medical')) {
          rowColor = COLORS.maladie;
          status = 'Arret maladie';
        } else if (leaveTypeLower.includes('family') || leaveTypeLower.includes('familial')) {
          rowColor = COLORS.absence;
          status = leave.leaveTypeLabel || 'Evenement familial';
        } else {
          rowColor = COLORS.absence;
        }
      } else if (specialShift) {
        // Jour special du planning (formation, repos planifie, etc.)
        status = specialShift.label;
        rowColor = specialShift.color;
        remarks = dayShifts[0]?.position || '';

        if (specialShift.type === 'formation') {
          totalFormationDays++;
        } else if (specialShift.type === 'repos') {
          totalReposDays++;
        } else if (specialShift.type === 'maladie') {
          totalLeaveDays++;
        } else if (specialShift.type === 'conges') {
          totalLeaveDays++;
        }
      } else if (isWeekendDay) {
        status = 'Weekend';
        rowColor = COLORS.weekend;
      } else if (arrivals.length > 0) {
        // Jour travaille
        const firstArrival = arrivals[0];
        const lastDeparture = departures[departures.length - 1];

        arrivalTime = new Date(firstArrival.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        if (lastDeparture) {
          departureTime = new Date(lastDeparture.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          hoursWorked = this.calculateHoursWorked(firstArrival.timestamp, lastDeparture.timestamp);

          // NE PAS deduire pause automatiquement (pause incluse dans les heures de travail)
          // Sauf si explicitement demande via options
          if (deductPause && hoursWorked > 6) {
            hoursWorked -= 0.5; // 30 min pause
            pauseTime = '0h30';
          }

          totalHours += hoursWorked;
          totalDaysWorked++;

          // Calculer heures sup
          if (hoursWorked > dailyHoursThreshold) {
            totalOvertimeHours += hoursWorked - dailyHoursThreshold;
          }
        } else {
          status = 'Depart manquant';
          rowColor = COLORS.warning;
        }
      } else if (!isWeekendDay) {
        // Jour ouvre sans pointage - Verifier s'il y a un shift planifie normal
        if (dayShifts.length > 0 && !specialShift) {
          // Il y avait un shift planifie mais pas de pointage
          status = 'Non pointe';
          remarks = `Prevu: ${dayShifts[0]?.startTime || ''}-${dayShifts[0]?.endTime || ''}`;
          rowColor = COLORS.warning;
        } else if (dayShifts.length === 0) {
          // Pas de shift planifie = jour de repos naturel
          status = 'Repos';
          rowColor = 'FFE0E7FF'; // Indigo 100
          totalReposDays++;
        } else {
          status = 'Absence';
          rowColor = COLORS.absence;
        }
      }

      // Ajouter la ligne
      const dataRow = sheet.getRow(rowNum);
      dataRow.getCell(1).value = day;
      dataRow.getCell(2).value = DAYS_FR[dayOfWeek];
      dataRow.getCell(3).value = arrivalTime;
      dataRow.getCell(4).value = departureTime;
      dataRow.getCell(5).value = pauseTime;
      dataRow.getCell(6).value = hoursWorked > 0 ? this.formatDuration(hoursWorked) : '-';
      dataRow.getCell(7).value = hoursWorked > dailyHoursThreshold ? this.formatDuration(hoursWorked - dailyHoursThreshold) : '-';
      dataRow.getCell(8).value = status;
      dataRow.getCell(9).value = remarks;

      // Style de la ligne
      for (let col = 1; col <= 9; col++) {
        const cell = dataRow.getCell(col);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };

        if (rowColor) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } };
        }
      }

      rowNum++;
    }

    // Ligne vide
    rowNum++;

    // ==========================================
    // RÉCAPITULATIF
    // ==========================================

    sheet.mergeCells(`A${rowNum}:I${rowNum}`);
    const summaryTitleCell = sheet.getCell(`A${rowNum}`);
    summaryTitleCell.value = 'RÉCAPITULATIF DU MOIS';
    summaryTitleCell.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
    summaryTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.header } };
    summaryTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(rowNum).height = 25;
    rowNum++;

    // Statistiques
    const stats = [
      ['Jours travailles', totalDaysWorked, 'jours'],
      ['Jours de conges/absences', totalLeaveDays, 'jours'],
      ['Jours de formation', totalFormationDays, 'jours'],
      ['Jours de repos', totalReposDays, 'jours'],
      ['Total heures travaillees', this.formatDuration(totalHours), ''],
      ['Heures supplementaires', this.formatDuration(totalOvertimeHours), ''],
      ['Moyenne journaliere', this.formatDuration(totalDaysWorked > 0 ? totalHours / totalDaysWorked : 0), '']
    ];

    stats.forEach(([label, value, unit]) => {
      sheet.getCell(`A${rowNum}`).value = label;
      sheet.getCell(`A${rowNum}`).font = { bold: true };
      sheet.getCell(`B${rowNum}`).value = value;
      sheet.getCell(`C${rowNum}`).value = unit;

      for (let col = 1; col <= 3; col++) {
        const cell = sheet.getRow(rowNum).getCell(col);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      }

      rowNum++;
    });

    // Ligne vide
    rowNum++;
    rowNum++;

    // ==========================================
    // SIGNATURES
    // ==========================================

    sheet.getCell(`A${rowNum}`).value = 'Signature employé:';
    sheet.getCell(`A${rowNum}`).font = { bold: true };
    sheet.getCell(`E${rowNum}`).value = 'Signature responsable:';
    sheet.getCell(`E${rowNum}`).font = { bold: true };
    rowNum++;

    sheet.getCell(`A${rowNum}`).value = '_________________________';
    sheet.getCell(`E${rowNum}`).value = '_________________________';
    rowNum++;

    sheet.getCell(`A${rowNum}`).value = `Date: ___/___/${year}`;
    sheet.getCell(`E${rowNum}`).value = `Date: ___/___/${year}`;

    // ==========================================
    // LARGEUR DES COLONNES
    // ==========================================
    sheet.getColumn(1).width = 8;  // Date
    sheet.getColumn(2).width = 8;  // Jour
    sheet.getColumn(3).width = 10; // Arrivée
    sheet.getColumn(4).width = 10; // Départ
    sheet.getColumn(5).width = 8;  // Pause
    sheet.getColumn(6).width = 12; // Heures Trav.
    sheet.getColumn(7).width = 12; // Heures Supp.
    sheet.getColumn(8).width = 18; // Statut
    sheet.getColumn(9).width = 25; // Remarques
  }

  /**
   * Créer la feuille récapitulative globale
   */
  async createSummarySheet(workbook, employees, year, month, pointages, leaves, companyName) {
    const sheet = workbook.addWorksheet('Récapitulatif', {
      properties: { tabColor: { argb: 'F59E0B' } }
    });

    let rowNum = 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // ==========================================
    // EN-TÊTE
    // ==========================================

    sheet.mergeCells(`A${rowNum}:H${rowNum}`);
    const titleCell = sheet.getCell(`A${rowNum}`);
    titleCell.value = `RÉCAPITULATIF MENSUEL - ${MONTHS_FR[month].toUpperCase()} ${year}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.header } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(rowNum).height = 35;
    rowNum++;

    sheet.mergeCells(`A${rowNum}:H${rowNum}`);
    const companyCell = sheet.getCell(`A${rowNum}`);
    companyCell.value = companyName;
    companyCell.font = { size: 12, color: { argb: 'FFFFFF' } };
    companyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subHeader } };
    companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(rowNum).height = 25;
    rowNum++;

    rowNum++;

    // ==========================================
    // TABLEAU RÉCAPITULATIF
    // ==========================================

    const headers = ['Employé', 'Poste', 'Jours Travaillés', 'Jours Congés', 'Total Heures', 'Heures Supp.', 'Moyenne/Jour', 'Statut'];
    const headerRow = sheet.getRow(rowNum);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.info } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    sheet.getRow(rowNum).height = 25;
    rowNum++;

    // Calculer les stats pour chaque employé
    let grandTotalHours = 0;
    let grandTotalDays = 0;

    for (const employee of employees) {
      const employeePointages = pointages.filter(p => p.userId === employee.id);
      const employeeLeaves = leaves.filter(l => l.userId === employee.id);

      let totalHours = 0;
      let totalDaysWorked = 0;
      let totalLeaveDays = 0;
      let totalOvertimeHours = 0;

      // Calculer par jour
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(year, month, day);
        const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;

        const dayPointages = employeePointages.filter(p => p.date === dateStr);
        const arrivals = dayPointages.filter(p => p.type === 'arrival').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const departures = dayPointages.filter(p => p.type === 'departure').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const leave = this.getLeaveForDate(dateStr, employeeLeaves, employee.id);

        if (leave) {
          totalLeaveDays++;
        } else if (!isWeekendDay && arrivals.length > 0 && departures.length > 0) {
          const firstArrival = arrivals[0];
          const lastDeparture = departures[departures.length - 1];
          let hoursWorked = this.calculateHoursWorked(firstArrival.timestamp, lastDeparture.timestamp);

          if (hoursWorked > 6) hoursWorked -= 0.5;

          totalHours += hoursWorked;
          totalDaysWorked++;

          if (hoursWorked > 7) {
            totalOvertimeHours += hoursWorked - 7;
          }
        }
      }

      grandTotalHours += totalHours;
      grandTotalDays += totalDaysWorked;

      // Ajouter la ligne
      const dataRow = sheet.getRow(rowNum);
      dataRow.getCell(1).value = employee.displayName;
      dataRow.getCell(2).value = employee.position;
      dataRow.getCell(3).value = totalDaysWorked;
      dataRow.getCell(4).value = totalLeaveDays;
      dataRow.getCell(5).value = this.formatDuration(totalHours);
      dataRow.getCell(6).value = this.formatDuration(totalOvertimeHours);
      dataRow.getCell(7).value = this.formatDuration(totalDaysWorked > 0 ? totalHours / totalDaysWorked : 0);
      dataRow.getCell(8).value = totalDaysWorked > 0 ? 'Actif' : 'Inactif';

      // Style
      for (let col = 1; col <= 8; col++) {
        const cell = dataRow.getCell(col);
        cell.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      }

      // Couleur pour inactif
      if (totalDaysWorked === 0) {
        dataRow.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.warning } };
      }

      rowNum++;
    }

    // Ligne totaux
    rowNum++;
    const totalRow = sheet.getRow(rowNum);
    totalRow.getCell(1).value = 'TOTAUX';
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(3).value = grandTotalDays;
    totalRow.getCell(5).value = this.formatDuration(grandTotalHours);

    for (let col = 1; col <= 8; col++) {
      const cell = totalRow.getCell(col);
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } };
      cell.border = {
        top: { style: 'medium' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    }

    // Largeur colonnes
    sheet.getColumn(1).width = 25; // Employé
    sheet.getColumn(2).width = 20; // Poste
    sheet.getColumn(3).width = 15; // Jours Travaillés
    sheet.getColumn(4).width = 12; // Jours Congés
    sheet.getColumn(5).width = 12; // Total Heures
    sheet.getColumn(6).width = 12; // Heures Supp.
    sheet.getColumn(7).width = 12; // Moyenne/Jour
    sheet.getColumn(8).width = 12; // Statut
  }

  // ==========================================
  // EXPORT RAPIDE
  // ==========================================

  /**
   * Export rapide du mois en cours
   */
  async exportCurrentMonth(employeeId = null) {
    const now = new Date();
    return this.exportMonthlyTimesheet(now.getFullYear(), now.getMonth(), { employeeId });
  }

  /**
   * Export du mois précédent
   */
  async exportPreviousMonth(employeeId = null) {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return this.exportMonthlyTimesheet(year, prevMonth, { employeeId });
  }
}

// Export singleton
const timesheetExportService = new TimesheetExportService();
export default timesheetExportService;
export { timesheetExportService, MONTHS_FR };

// ==========================================
// 💰 SERVICE EXPORT PAIE COMPLET
// ==========================================

/**
 * Export paie complet avec toutes les feuilles demandées
 */
export async function exportPayrollComplete(year, month, options = {}) {
  const {
    companyName = 'Synergia',
    includeContractSheet = true,
    includePointagesSheet = true,
    includeAbsencesSheet = true,
    includeRecapSheet = true,
    includeLeaveBalanceSheet = true
  } = options;

  console.log(`💰 Export Paie Complet ${MONTHS_FR[month]} ${year}...`);

  // Récupérer les données
  const [employees, pointages, leaves, leaveBalances] = await Promise.all([
    getEmployeesWithContracts(),
    getMonthlyPointagesDetailed(year, month),
    getAllLeavesForMonth(year, month),
    getLeaveBalances()
  ]);

  if (employees.length === 0) {
    throw new Error('Aucun employé trouvé');
  }

  // Créer le workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Synergia';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Calculer les semaines du mois
  const weeksInMonth = getWeeksInMonth(year, month);

  // Séparer les cadres des non-cadres
  const cadres = employees.filter(e => e.isCadre);
  const nonCadres = employees.filter(e => !e.isCadre);

  console.log(`👔 ${cadres.length} cadres, 👷 ${nonCadres.length} non-cadres`);

  // 1. CONTRATS STANDARDS - Feuille pour non-cadres (compteur horaire)
  if (includeContractSheet && nonCadres.length > 0) {
    await createContractsStandardSheet(workbook, nonCadres, pointages, leaves, weeksInMonth, year, month, companyName);
  }

  // 1b. CADRES FORFAIT JOUR - Feuille pour cadres (compteur jours)
  if (includeContractSheet && cadres.length > 0) {
    await createCadresForfaitJourSheet(workbook, cadres, pointages, leaves, weeksInMonth, year, month, companyName);
  }

  // 2. Feuilles détaillées par employé
  for (const employee of employees) {
    const employeePointages = pointages.filter(p => p.userId === employee.id);
    const employeeLeaves = leaves.filter(l => l.userId === employee.id);
    if (employee.isCadre) {
      await createCadreDetailSheet(workbook, employee, employeePointages, employeeLeaves, weeksInMonth, year, month);
    } else {
      await createEmployeeDetailSheet(workbook, employee, employeePointages, employeeLeaves, weeksInMonth, year, month);
    }
  }

  // 3. POINTAGES - Tous les pointages détaillés
  if (includePointagesSheet) {
    await createPointagesSheet(workbook, employees, pointages, year, month);
  }

  // 4. ABSENCES - Toutes les absences
  if (includeAbsencesSheet) {
    await createAbsencesSheet(workbook, employees, leaves, year, month);
  }

  // 5. RECAP COMPTEURS
  if (includeRecapSheet) {
    await createRecapCompteurSheet(workbook, employees, pointages, leaves, weeksInMonth, year, month);
  }

  // 6. SOLDE CONGES
  if (includeLeaveBalanceSheet) {
    await createLeaveBalanceSheet(workbook, employees, leaveBalances, leaves, year, month);
  }

  // Générer le fichier
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  // Télécharger
  const fileName = `Export-Paie-${MONTHS_FR[month]}-${year}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  console.log(`✅ Export Paie terminé: ${fileName}`);
  return { success: true, fileName };
}

// ==========================================
// FONCTIONS HELPER POUR L'EXPORT PAIE
// ==========================================

/**
 * Récupérer les employés avec données contractuelles
 */
async function getEmployeesWithContracts() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const employees = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Priorité aux données du profil pour les documents officiels de paie
      // Puis aux champs directs firstName/lastName
      const firstName = data.profile?.firstName || data.firstName || data.displayName?.split(' ')[0] || '';
      const lastName = data.profile?.lastName || data.lastName || data.displayName?.split(' ').slice(1).join(' ') || '';

      // Déterminer si c'est un cadre au forfait jour
      const statutContrat = data.contractData?.status || '';
      const isCadre = statutContrat.toLowerCase().includes('cadre');

      employees.push({
        id: doc.id,
        nom: lastName || 'Nom',
        prenom: firstName || 'Prénom',
        displayName: data.displayName || `${firstName} ${lastName}`.trim() || data.email,
        email: data.email || '',
        // Matricule depuis contractData.registrationNumber
        matricule: data.contractData?.registrationNumber || data.matricule || '',
        // Données contractuelles - utiliser les bons noms de champs
        typeContrat: data.contractData?.contractType || data.contractData?.type || 'CDI',
        poste: data.contractData?.jobTitle || data.profile?.role || data.position || data.poste || 'Employé',
        dateDebut: data.contractData?.contractStartDate || data.contractData?.startDate || data.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || '',
        dateFin: data.contractData?.contractEndDate || data.contractData?.endDate || '',
        // Données salariales - lire depuis salaryData
        volumeHoraireHebdo: data.salaryData?.weeklyHours || data.contractData?.weeklyHours || 35,
        tauxHoraireBrut: data.salaryData?.hourlyGrossRate || data.salaryData?.hourlyRate || 0,
        etablissement: data.contractData?.establishment || data.profile?.department || 'Principal',
        statut: data.isActive !== false ? 'Actif' : 'Inactif',
        // Cadre au forfait jour
        isCadre: isCadre,
        statutContrat: statutContrat,
        forfaitJours: data.contractData?.forfaitJours || 218, // Forfait jours annuel (défaut 218)
        // Compteurs
        compteurHeures: data.compteurHeures || 0,
        // Congés
        congesAcquis: data.leaveBalance?.acquired || 25,
        congesPris: data.leaveBalance?.taken || 0,
        congesRestants: data.leaveBalance?.remaining || 25,
        congesN1: data.leaveBalance?.n1 || 0
      });
    });

    return employees.sort((a, b) => a.nom.localeCompare(b.nom));
  } catch (error) {
    console.error('❌ Erreur récupération employés:', error);
    return [];
  }
}

/**
 * Récupérer tous les pointages détaillés du mois
 * Fusionne les données des collections 'pointages' (badgeuse) et 'timeEntries' (ajouts manuels RH)
 */
async function getMonthlyPointagesDetailed(year, month) {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    const startDateObj = new Date(year, month, 1);
    const endDateObj = new Date(year, month + 1, 0, 23, 59, 59);

    const pointages = [];

    // 1. Récupérer depuis 'pointages' (badgeuse géolocalisée)
    try {
      const pointagesQuery = query(
        collection(db, 'pointages'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      const pointagesSnapshot = await getDocs(pointagesQuery);

      pointagesSnapshot.forEach(doc => {
        const data = doc.data();
        pointages.push({
          id: doc.id,
          source: 'badgeuse',
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp)
        });
      });
      console.log(`📍 ${pointagesSnapshot.size} pointages badgeuse trouvés`);
    } catch (e) {
      console.warn('⚠️ Erreur collection pointages:', e.message);
    }

    // 2. Récupérer depuis 'timeEntries' (ajouts manuels RH)
    try {
      const timeEntriesQuery = query(
        collection(db, 'timeEntries'),
        where('date', '>=', startDateObj),
        where('date', '<=', endDateObj),
        orderBy('date', 'asc')
      );
      const timeEntriesSnapshot = await getDocs(timeEntriesQuery);

      timeEntriesSnapshot.forEach(doc => {
        const data = doc.data();
        // Ignorer les entrées supprimées
        if (data.status === 'deleted') return;

        const dateValue = data.date?.toDate?.() || new Date(data.date);
        const dateStr = dateValue.toISOString().split('T')[0];

        pointages.push({
          id: doc.id,
          source: 'manual',
          userId: data.userId,
          type: data.type,
          date: dateStr,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
          isManualEntry: true,
          addedBy: data.addedBy
        });
      });
      console.log(`✏️ ${timeEntriesSnapshot.size} entrées manuelles trouvées`);
    } catch (e) {
      console.warn('⚠️ Erreur collection timeEntries:', e.message);
    }

    // Trier tous les pointages par date puis timestamp
    pointages.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    console.log(`📊 Total pointages fusionnés: ${pointages.length}`);
    return pointages;
  } catch (error) {
    console.error('❌ Erreur récupération pointages:', error);
    return [];
  }
}

/**
 * Récupérer toutes les absences du mois
 */
async function getAllLeavesForMonth(year, month) {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

    // Récupérer les congés approuvés
    const leavesQuery = query(
      collection(db, 'leave_requests'),
      where('status', '==', 'approved')
    );
    const leavesSnapshot = await getDocs(leavesQuery);

    // Récupérer aussi depuis leaveRequests pour compatibilité
    const leaveRequestsQuery = query(
      collection(db, 'leaveRequests'),
      where('status', '==', 'approved')
    );
    const leaveRequestsSnapshot = await getDocs(leaveRequestsQuery);

    const leaves = [];

    const processLeave = (doc) => {
      const data = doc.data();
      const leaveStart = data.startDate?.split('T')[0] || data.startDate;
      const leaveEnd = data.endDate?.split('T')[0] || data.endDate;

      // Vérifier si le congé intersecte avec le mois
      if (leaveStart <= endDate && leaveEnd >= startDate) {
        leaves.push({
          id: doc.id,
          ...data,
          startDate: leaveStart,
          endDate: leaveEnd,
          type: data.leaveType || data.type || 'conge',
          typeLabel: data.leaveTypeLabel || getLeaveTypeLabel(data.leaveType || data.type),
          nbJours: calculateDaysBetween(leaveStart, leaveEnd),
          nbHeures: (calculateDaysBetween(leaveStart, leaveEnd) * 7) // Approximation
        });
      }
    };

    leavesSnapshot.forEach(processLeave);
    leaveRequestsSnapshot.forEach(processLeave);

    return leaves;
  } catch (error) {
    console.error('❌ Erreur récupération congés:', error);
    return [];
  }
}

/**
 * Récupérer les soldes de congés depuis la collection users
 */
async function getLeaveBalances() {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const balances = {};

    snapshot.forEach(doc => {
      const userData = doc.data();
      // Les soldes sont stockés dans users.leaveBalance
      if (userData.leaveBalance) {
        balances[doc.id] = userData.leaveBalance;
      }
    });

    return balances;
  } catch (error) {
    console.error('❌ Erreur récupération soldes congés:', error);
    return {};
  }
}

/**
 * Calculer les semaines du mois
 */
function getWeeksInMonth(year, month) {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let currentDate = new Date(firstDay);
  // Aller au lundi de la première semaine
  const dayOfWeek = currentDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + diff);

  while (currentDate <= lastDay || weeks.length < 5) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekNum = getWeekNumber(weekStart);
    weeks.push({
      weekNum,
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      label: `S${weekNum}`
    });

    currentDate.setDate(currentDate.getDate() + 7);
    if (weeks.length >= 6) break;
  }

  return weeks;
}

/**
 * Obtenir le numéro de semaine
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Calculer le nombre de jours entre deux dates
 */
function calculateDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Obtenir le label du type d'absence
 */
function getLeaveTypeLabel(type) {
  const labels = {
    'cp': 'Congé payé',
    'conge': 'Congé payé',
    'conge_paye': 'Congé payé',
    'rtt': 'RTT',
    'maladie': 'Arrêt maladie',
    'arret_maladie': 'Arrêt maladie',
    'formation': 'Formation',
    'ecole': 'École - CFA',
    'cfa': 'École - CFA',
    'sans_solde': 'Sans solde',
    'retard': 'Retard',
    'autre': 'Autre'
  };
  return labels[type?.toLowerCase()] || type || 'Absence';
}

/**
 * Calculer les heures travaillées pour un employé sur une période
 */
function calculateEmployeeHours(employeeId, pointages, startDate, endDate) {
  const employeePointages = pointages.filter(p =>
    p.userId === employeeId &&
    p.date >= startDate &&
    p.date <= endDate
  );

  let totalHours = 0;
  const dailyHours = {};

  // Grouper par date
  employeePointages.forEach(p => {
    if (!dailyHours[p.date]) {
      dailyHours[p.date] = { arrivals: [], departures: [] };
    }
    if (p.type === 'arrival') {
      dailyHours[p.date].arrivals.push(p);
    } else {
      dailyHours[p.date].departures.push(p);
    }
  });

  // Calculer par jour
  Object.keys(dailyHours).forEach(date => {
    const day = dailyHours[date];
    if (day.arrivals.length > 0 && day.departures.length > 0) {
      const firstArrival = day.arrivals.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
      const lastDeparture = day.departures.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      const hours = (new Date(lastDeparture.timestamp) - new Date(firstArrival.timestamp)) / (1000 * 60 * 60);
      // Déduire pause si > 6h
      const netHours = hours > 6 ? hours - 0.5 : hours;
      totalHours += Math.max(0, netHours);
    }
  });

  return totalHours;
}

// ==========================================
// CRÉATION DES FEUILLES EXCEL
// ==========================================

/**
 * 1. CONTRATS STANDARDS - Feuille principale récapitulative
 */
async function createContractsStandardSheet(workbook, employees, pointages, leaves, weeks, year, month, companyName) {
  const sheet = workbook.addWorksheet('CONTRATS STANDARDS', {
    properties: { tabColor: { argb: '1E3A5F' } }
  });

  let row = 1;

  // Titre
  sheet.mergeCells(`A${row}:AQ${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `CONTRATS STANDARDS - ${MONTHS_FR[month].toUpperCase()} ${year}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A5F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(row).height = 30;
  row++;

  // En-têtes groupés (ligne 1)
  const headerGroups = [
    { label: '', cols: 3 }, // Nom, Prénom, Volume
    { label: 'Données Contractuelles', cols: 6, color: '3B82F6' },
    { label: 'Données Salariales', cols: 4, color: '8B5CF6' },
    { label: 'Heures Planning Période', cols: weeks.length + 2, color: 'F59E0B' },
    { label: 'Détail Heures Sup/Comp Majorées Période', cols: 4, color: 'EF4444' },
    { label: 'Heures Majorées', cols: 2, color: '14B8A6' },
    { label: 'Éléments de Rémunération', cols: 6, color: '22C55E' }
  ];

  let col = 1;
  headerGroups.forEach(group => {
    if (group.label) {
      const startCol = col;
      const endCol = col + group.cols - 1;
      sheet.mergeCells(row, startCol, row, endCol);
      const cell = sheet.getCell(row, startCol);
      cell.value = group.label;
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: group.color || '6B7280' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    }
    col += group.cols;
  });
  row++;

  // En-têtes détaillés (ligne 2)
  const headers = [
    'Nom', 'Prénom', 'Vol. Horaire Hebdo (h)',
    'Période Contrat', 'Type Contrat', 'Intitulé Poste', 'Date début', 'Date fin', 'Note',
    'Vol. Horaire Mensuel (h)', 'Taux Horaire Brut (€)', 'Jours Travaillés (j)', 'Compteur Début',
    ...weeks.map(w => w.label),
    'Compteur Fin', 'Heures Sup totales',
    'HS 25%', 'HS 50%', 'Heures Nuit', 'Heures Dimanche',
    'Primes (€)', 'Avances (€)', 'Desc. Primes', 'Desc. Avances', 'Coût Transport', 'Commentaires'
  ];

  headers.forEach((header, index) => {
    const cell = sheet.getCell(row, index + 1);
    cell.value = header;
    cell.font = { bold: true, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  sheet.getRow(row).height = 40;
  row++;

  // Données des employés
  for (const emp of employees) {
    const empPointages = pointages.filter(p => p.userId === emp.id);
    const empLeaves = leaves.filter(l => l.userId === emp.id);

    // Calculer les heures par semaine
    const weeklyHours = weeks.map(week => {
      return calculateEmployeeHours(emp.id, pointages, week.start, week.end);
    });

    const totalPlanningHours = weeklyHours.reduce((sum, h) => sum + h, 0);
    const volumeMensuel = emp.volumeHoraireHebdo * 4.33; // Approximation mensuelle
    const compteurFin = emp.compteurHeures + totalPlanningHours - volumeMensuel;

    // Calculer les heures sup (> 35h/semaine ou > 7h/jour)
    const heuresSup = Math.max(0, totalPlanningHours - volumeMensuel);
    const heuresSup25 = Math.min(heuresSup, 8 * 4); // 8 premières heures sup par semaine
    const heuresSup50 = Math.max(0, heuresSup - heuresSup25);

    const rowData = [
      emp.nom,
      emp.prenom,
      emp.volumeHoraireHebdo,
      `${MONTHS_FR[month]} ${year}`,
      emp.typeContrat,
      emp.poste,
      emp.dateDebut ? new Date(emp.dateDebut).toLocaleDateString('fr-FR') : '-',
      emp.dateFin ? new Date(emp.dateFin).toLocaleDateString('fr-FR') : '-',
      '', // Note
      Math.round(volumeMensuel * 100) / 100,
      emp.tauxHoraireBrut || '-',
      Math.round(totalPlanningHours / 7 * 10) / 10, // Jours travaillés approximatifs
      emp.compteurHeures || 0,
      ...weeklyHours.map(h => Math.round(h * 100) / 100),
      Math.round(compteurFin * 100) / 100,
      Math.round(heuresSup * 100) / 100,
      Math.round(heuresSup25 * 100) / 100,
      Math.round(heuresSup50 * 100) / 100,
      0, // Heures nuit (à calculer si données dispo)
      0, // Heures dimanche (à calculer si données dispo)
      '', // Primes
      '', // Avances
      '', // Desc primes
      '', // Desc avances
      '', // Transport
      '' // Commentaires
    ];

    rowData.forEach((value, index) => {
      const cell = sheet.getCell(row, index + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      // Coloriser les compteurs
      if (headers[index] === 'Compteur Fin' || headers[index] === 'Heures Sup totales') {
        if (typeof value === 'number') {
          cell.font = { color: { argb: value >= 0 ? '22C55E' : 'EF4444' } };
        }
      }
    });

    row++;
  }

  // Ajuster largeurs
  sheet.getColumn(1).width = 15;
  sheet.getColumn(2).width = 12;
  sheet.getColumn(3).width = 8;
  for (let i = 4; i <= headers.length; i++) {
    sheet.getColumn(i).width = 12;
  }
}

/**
 * 2. Feuille détaillée par employé
 */
async function createEmployeeDetailSheet(workbook, employee, pointages, leaves, weeks, year, month) {
  const sheetName = `${employee.nom.substring(0, 10)} ${employee.prenom.substring(0, 10)}`.trim().substring(0, 31);
  const sheet = workbook.addWorksheet(sheetName, {
    properties: { tabColor: { argb: '6366F1' } }
  });

  let row = 1;

  // Titre
  sheet.mergeCells(`A${row}:P${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `${employee.nom.toUpperCase()} ${employee.prenom}`;
  titleCell.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A5F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;

  // Infos employé
  const infos = [
    ['Poste:', employee.poste, 'Type contrat:', employee.typeContrat],
    ['Vol. Hebdo:', `${employee.volumeHoraireHebdo}h`, 'Établissement:', employee.etablissement],
    ['Statut:', employee.statut, 'Matricule:', employee.matricule || '-']
  ];

  infos.forEach(infoRow => {
    for (let i = 0; i < infoRow.length; i += 2) {
      sheet.getCell(row, i + 1).value = infoRow[i];
      sheet.getCell(row, i + 1).font = { bold: true };
      sheet.getCell(row, i + 2).value = infoRow[i + 1];
    }
    row++;
  });

  row++;

  // Tableau détaillé par semaine
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (const week of weeks) {
    // En-tête semaine
    sheet.mergeCells(`A${row}:P${row}`);
    const weekHeader = sheet.getCell(`A${row}`);
    weekHeader.value = `Semaine ${week.weekNum} (${new Date(week.start).toLocaleDateString('fr-FR')} - ${new Date(week.end).toLocaleDateString('fr-FR')})`;
    weekHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    weekHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
    row++;

    // En-têtes jours
    const dayHeaders = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim', 'Total'];
    dayHeaders.forEach((day, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = day;
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };
      cell.alignment = { horizontal: 'center' };
    });
    row++;

    // Calculer les heures par jour de la semaine
    const weekStart = new Date(week.start);
    let weekTotal = 0;
    const dailyHours = [];

    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + d);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Vérifier si dans le mois
      if (currentDate.getMonth() !== month) {
        dailyHours.push('-');
        continue;
      }

      // Calculer les heures
      const dayPointages = pointages.filter(p => p.date === dateStr);
      const arrivals = dayPointages.filter(p => p.type === 'arrival').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const departures = dayPointages.filter(p => p.type === 'departure').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Vérifier congé
      const leave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);

      if (leave) {
        dailyHours.push(leave.typeLabel?.substring(0, 8) || 'Congé');
      } else if (arrivals.length > 0 && departures.length > 0) {
        let hours = (new Date(departures[0].timestamp) - new Date(arrivals[0].timestamp)) / (1000 * 60 * 60);
        if (hours > 6) hours -= 0.5;
        hours = Math.round(hours * 100) / 100;
        dailyHours.push(hours);
        weekTotal += hours;
      } else {
        dailyHours.push('-');
      }
    }

    // Ligne des heures
    sheet.getCell(row, 1).value = 'Heures';
    dailyHours.forEach((hours, idx) => {
      const cell = sheet.getCell(row, idx + 2);
      cell.value = hours;
      cell.alignment = { horizontal: 'center' };
      if (typeof hours === 'string' && hours !== '-') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
      }
    });
    sheet.getCell(row, 9).value = Math.round(weekTotal * 100) / 100;
    sheet.getCell(row, 9).font = { bold: true };
    row++;

    row++; // Espace entre semaines
  }

  // Ajuster largeurs
  sheet.getColumn(1).width = 15;
  for (let i = 2; i <= 9; i++) {
    sheet.getColumn(i).width = 10;
  }
}

/**
 * CADRES FORFAIT JOUR - Feuille récapitulative pour les cadres
 * Les cadres sont au forfait jour: 1 pointage = 1 journée travaillée
 */
async function createCadresForfaitJourSheet(workbook, cadres, pointages, leaves, weeks, year, month, companyName) {
  const sheet = workbook.addWorksheet('CADRES FORFAIT JOUR', {
    properties: { tabColor: { argb: '7C3AED' } }
  });

  let row = 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Titre
  sheet.mergeCells(`A${row}:P${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `CADRES AU FORFAIT JOUR - ${MONTHS_FR[month].toUpperCase()} ${year}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(row).height = 30;
  row++;

  // Sous-titre
  sheet.mergeCells(`A${row}:P${row}`);
  const subtitleCell = sheet.getCell(`A${row}`);
  subtitleCell.value = `${companyName} - Suivi des jours travaillés (pas de compteur horaire)`;
  subtitleCell.font = { size: 11, color: { argb: 'FFFFFF' } };
  subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;
  row++;

  // En-têtes
  const headers = [
    'Nom', 'Prénom', 'Statut', 'Poste', 'Type Contrat',
    'Forfait Annuel (j)', 'Date début', 'Date fin',
    ...weeks.map(w => w.label),
    'Total Jours Mois', 'Jours Congés', 'Jours Travaillés Net'
  ];

  headers.forEach((header, idx) => {
    const cell = sheet.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6366F1' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  sheet.getRow(row).height = 35;
  row++;

  // Données des cadres
  for (const cadre of cadres) {
    const cadrePointages = pointages.filter(p => p.userId === cadre.id);
    const cadreLeaves = leaves.filter(l => l.userId === cadre.id);

    // Calculer les jours par semaine (1 pointage = 1 jour)
    const weeklyDays = weeks.map(week => {
      return countDaysWorked(cadre.id, cadrePointages, week.start, week.end);
    });

    const totalDaysMonth = weeklyDays.reduce((sum, d) => sum + d, 0);

    // Calculer les jours de congés
    let leaveDays = 0;
    cadreLeaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      // Intersection avec le mois
      const effectiveStart = start < monthStart ? monthStart : start;
      const effectiveEnd = end > monthEnd ? monthEnd : end;

      if (effectiveStart <= effectiveEnd) {
        leaveDays += Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;
      }
    });

    const netDays = totalDaysMonth;

    const rowData = [
      cadre.nom,
      cadre.prenom,
      cadre.statutContrat || 'Cadre',
      cadre.poste,
      cadre.typeContrat,
      cadre.forfaitJours,
      cadre.dateDebut ? new Date(cadre.dateDebut).toLocaleDateString('fr-FR') : '-',
      cadre.dateFin ? new Date(cadre.dateFin).toLocaleDateString('fr-FR') : '-',
      ...weeklyDays,
      totalDaysMonth,
      leaveDays,
      netDays
    ];

    rowData.forEach((value, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      // Colorer les totaux
      if (idx >= headers.length - 3) {
        cell.font = { bold: true };
        if (idx === headers.length - 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
        }
      }
    });

    row++;
  }

  // Ajuster largeurs
  sheet.getColumn(1).width = 15;
  sheet.getColumn(2).width = 12;
  sheet.getColumn(3).width = 10;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 10;
  for (let i = 6; i <= headers.length; i++) {
    sheet.getColumn(i).width = 10;
  }
}

/**
 * Compter les jours travaillés pour un cadre (1 pointage = 1 jour)
 */
function countDaysWorked(userId, pointages, startDate, endDate) {
  const userPointages = pointages.filter(p =>
    p.userId === userId &&
    p.date >= startDate &&
    p.date <= endDate
  );

  // Compter les jours uniques avec au moins 1 pointage
  const uniqueDays = new Set();
  userPointages.forEach(p => {
    uniqueDays.add(p.date);
  });

  return uniqueDays.size;
}

/**
 * Feuille détaillée pour un cadre (par jour, pas par heure)
 */
async function createCadreDetailSheet(workbook, cadre, pointages, leaves, weeks, year, month) {
  const sheetName = `${cadre.nom.substring(0, 8)} ${cadre.prenom.substring(0, 8)} (Cadre)`.trim().substring(0, 31);
  const sheet = workbook.addWorksheet(sheetName, {
    properties: { tabColor: { argb: '7C3AED' } }
  });

  let row = 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Titre
  sheet.mergeCells(`A${row}:H${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `${cadre.nom.toUpperCase()} ${cadre.prenom} - CADRE FORFAIT JOUR`;
  titleCell.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;

  // Infos cadre
  const infos = [
    ['Statut:', cadre.statutContrat || 'Cadre', 'Poste:', cadre.poste],
    ['Forfait annuel:', `${cadre.forfaitJours} jours`, 'Type contrat:', cadre.typeContrat]
  ];

  infos.forEach(infoRow => {
    for (let i = 0; i < infoRow.length; i += 2) {
      sheet.getCell(row, i + 1).value = infoRow[i];
      sheet.getCell(row, i + 1).font = { bold: true };
      sheet.getCell(row, i + 2).value = infoRow[i + 1];
    }
    row++;
  });
  row++;

  // Tableau par semaine
  for (const week of weeks) {
    // En-tête semaine
    sheet.mergeCells(`A${row}:H${row}`);
    const weekHeader = sheet.getCell(`A${row}`);
    weekHeader.value = `Semaine ${week.weekNum} (${new Date(week.start).toLocaleDateString('fr-FR')} - ${new Date(week.end).toLocaleDateString('fr-FR')})`;
    weekHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    weekHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
    row++;

    // En-têtes jours
    const dayHeaders = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim', 'Total'];
    dayHeaders.forEach((day, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = day;
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E5E7EB' } };
      cell.alignment = { horizontal: 'center' };
    });
    row++;

    // Calculer présence par jour (1 = présent, 0 = absent, "CP" = congé)
    const weekStart = new Date(week.start);
    let weekTotal = 0;
    const dailyPresence = [];

    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + d);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Vérifier si dans le mois
      if (currentDate.getMonth() !== month) {
        dailyPresence.push('-');
        continue;
      }

      // Vérifier congé
      const leave = leaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
      if (leave) {
        dailyPresence.push('CP');
        continue;
      }

      // Vérifier pointage (1 pointage = 1 jour)
      const hasPointage = pointages.some(p => p.date === dateStr);
      if (hasPointage) {
        dailyPresence.push(1);
        weekTotal += 1;
      } else {
        // Weekend = vide, jour ouvré sans pointage = 0
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dailyPresence.push('-');
        } else {
          dailyPresence.push(0);
        }
      }
    }

    // Ligne présence
    sheet.getCell(row, 1).value = 'Présence';
    dailyPresence.forEach((presence, idx) => {
      const cell = sheet.getCell(row, idx + 2);
      cell.value = presence;
      cell.alignment = { horizontal: 'center' };
      if (presence === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
        cell.font = { bold: true, color: { argb: '059669' } };
      } else if (presence === 'CP') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
      } else if (presence === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FECACA' } };
      }
    });
    sheet.getCell(row, 9).value = `${weekTotal}j`;
    sheet.getCell(row, 9).font = { bold: true };
    row++;

    row++; // Espace entre semaines
  }

  // Récap
  row++;
  sheet.mergeCells(`A${row}:H${row}`);
  const recapHeader = sheet.getCell(`A${row}`);
  recapHeader.value = 'RÉCAPITULATIF DU MOIS';
  recapHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
  recapHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A5F' } };
  row++;

  const totalDays = countDaysWorked(cadre.id, pointages,
    `${year}-${String(month + 1).padStart(2, '0')}-01`,
    `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
  );

  const stats = [
    ['Total jours travaillés:', `${totalDays} jours`],
    ['Forfait annuel:', `${cadre.forfaitJours} jours`],
    ['Mode:', 'Forfait jour (pas de compteur horaire)']
  ];

  stats.forEach(([label, value]) => {
    sheet.getCell(row, 1).value = label;
    sheet.getCell(row, 1).font = { bold: true };
    sheet.getCell(row, 2).value = value;
    row++;
  });

  // Ajuster largeurs
  sheet.getColumn(1).width = 20;
  for (let i = 2; i <= 9; i++) {
    sheet.getColumn(i).width = 10;
  }
}

/**
 * 3. POINTAGES - Tous les pointages détaillés
 */
async function createPointagesSheet(workbook, employees, pointages, year, month) {
  const sheet = workbook.addWorksheet('POINTAGES', {
    properties: { tabColor: { argb: '8B5CF6' } }
  });

  let row = 1;

  // Titre
  sheet.mergeCells(`A${row}:N${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `POINTAGES - ${MONTHS_FR[month].toUpperCase()} ${year}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B5CF6' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;

  // En-têtes
  const headers = ['Prénom', 'Nom', 'Matric.', 'Type contrat', 'Temps contractuel', 'Heures réelles', 'N° compteur', 'Date', 'Type', 'Heure début', 'Heure fin', 'Place', 'Note'];

  headers.forEach((header, idx) => {
    const cell = sheet.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  row++;

  // Grouper pointages par employé et date
  const empMap = {};
  employees.forEach(e => empMap[e.id] = e);

  // Trier pointages
  const sortedPointages = [...pointages].sort((a, b) => {
    if (a.userId !== b.userId) return a.userId.localeCompare(b.userId);
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  // Grouper par employé+date pour avoir arrivée/départ sur même ligne
  const grouped = {};
  sortedPointages.forEach(p => {
    const key = `${p.userId}_${p.date}`;
    if (!grouped[key]) {
      grouped[key] = { userId: p.userId, date: p.date, arrival: null, departure: null };
    }
    if (p.type === 'arrival' && !grouped[key].arrival) {
      grouped[key].arrival = p;
    } else if (p.type === 'departure') {
      grouped[key].departure = p;
    }
  });

  Object.values(grouped).forEach(record => {
    const emp = empMap[record.userId];
    if (!emp) return;

    let hoursWorked = 0;
    if (record.arrival && record.departure) {
      hoursWorked = (new Date(record.departure.timestamp) - new Date(record.arrival.timestamp)) / (1000 * 60 * 60);
      if (hoursWorked > 6) hoursWorked -= 0.5;
    }

    const rowData = [
      emp.prenom,
      emp.nom,
      emp.matricule || '-',
      emp.typeContrat,
      emp.volumeHoraireHebdo,
      Math.round(hoursWorked * 100) / 100,
      '', // N° compteur
      new Date(record.date).toLocaleDateString('fr-FR'),
      record.arrival ? 'Travail' : 'Absence',
      record.arrival ? new Date(record.arrival.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-',
      record.departure ? new Date(record.departure.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-',
      record.arrival?.location || '-',
      ''
    ];

    rowData.forEach((value, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });

    row++;
  });

  // Ajuster largeurs
  const widths = [12, 15, 10, 12, 8, 8, 10, 12, 10, 10, 10, 15, 20];
  widths.forEach((w, i) => sheet.getColumn(i + 1).width = w);
}

/**
 * 4. ABSENCES - Toutes les absences
 */
async function createAbsencesSheet(workbook, employees, leaves, year, month) {
  const sheet = workbook.addWorksheet('ABSENCES', {
    properties: { tabColor: { argb: 'EF4444' } }
  });

  let row = 1;

  // Titre
  sheet.mergeCells(`A${row}:H${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `ABSENCES - ${MONTHS_FR[month].toUpperCase()} ${year}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EF4444' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;

  // En-têtes
  const headers = ['Nom', 'Prénom', 'Matricule de paie', 'Type absence', 'Date de début', 'Date de fin', 'Nb heures', 'Nb jours'];

  headers.forEach((header, idx) => {
    const cell = sheet.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6B7280' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  row++;

  // Mapper employés
  const empMap = {};
  employees.forEach(e => empMap[e.id] = e);

  // Trier par nom puis date
  const sortedLeaves = [...leaves].sort((a, b) => {
    const empA = empMap[a.userId];
    const empB = empMap[b.userId];
    if (!empA || !empB) return 0;
    if (empA.nom !== empB.nom) return empA.nom.localeCompare(empB.nom);
    return a.startDate.localeCompare(b.startDate);
  });

  sortedLeaves.forEach(leave => {
    const emp = empMap[leave.userId];
    if (!emp) return;

    // Couleur selon type
    let rowColor = 'FFFFFF';
    const type = (leave.type || '').toLowerCase();
    if (type.includes('maladie')) rowColor = 'FECACA';
    else if (type.includes('conge') || type.includes('cp')) rowColor = 'BBF7D0';
    else if (type.includes('ecole') || type.includes('cfa')) rowColor = 'BFDBFE';
    else if (type.includes('retard')) rowColor = 'FEF3C7';

    const rowData = [
      emp.nom,
      emp.prenom,
      emp.matricule || '-',
      leave.typeLabel || leave.type,
      new Date(leave.startDate).toLocaleDateString('fr-FR'),
      new Date(leave.endDate).toLocaleDateString('fr-FR'),
      leave.nbHeures || '-',
      leave.nbJours || calculateDaysBetween(leave.startDate, leave.endDate)
    ];

    rowData.forEach((value, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowColor } };
    });

    row++;
  });

  // Ajuster largeurs
  const widths = [15, 12, 15, 20, 12, 12, 10, 10];
  widths.forEach((w, i) => sheet.getColumn(i + 1).width = w);
}

/**
 * 5. RECAP COMPTEURS
 */
async function createRecapCompteurSheet(workbook, employees, pointages, leaves, weeks, year, month) {
  const sheet = workbook.addWorksheet('RECAP COMPTEURS', {
    properties: { tabColor: { argb: '14B8A6' } }
  });

  let row = 1;

  // Titre
  sheet.mergeCells(`A${row}:J${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `RÉCAPITULATIF COMPTEURS - ${MONTHS_FR[month].toUpperCase()} ${year}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '14B8A6' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;
  row++;

  // En-têtes
  const headers = [
    'Nom', 'Prénom', 'Matricule de paie',
    'Compteur Début de Période', 'Total Heures Planning',
    'Absences non incluses', 'Volume Horaire Hebdo * Nbre Semaines',
    'Compteur Fin de Période avant Modif', 'Heures Sorties du Compteur',
    'Compteur fin de Période après Modif'
  ];

  headers.forEach((header, idx) => {
    const cell = sheet.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6B7280' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  sheet.getRow(row).height = 40;
  row++;

  // Données
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

  employees.forEach(emp => {
    const totalHours = calculateEmployeeHours(emp.id, pointages, monthStart, monthEnd);
    const volumeAttendu = emp.volumeHoraireHebdo * 4.33;
    const compteurDebut = emp.compteurHeures || 0;
    const compteurFin = compteurDebut + totalHours - volumeAttendu;

    const rowData = [
      emp.nom,
      emp.prenom,
      emp.matricule || '-',
      compteurDebut,
      Math.round(totalHours * 100) / 100,
      0, // Absences non incluses
      Math.round(volumeAttendu * 100) / 100,
      Math.round(compteurFin * 100) / 100,
      0, // Heures sorties
      Math.round(compteurFin * 100) / 100
    ];

    rowData.forEach((value, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      // Coloriser compteurs positifs/négatifs
      if (idx >= 3 && typeof value === 'number') {
        if (value > 0) cell.font = { color: { argb: '22C55E' } };
        else if (value < 0) cell.font = { color: { argb: 'EF4444' } };
      }
    });

    row++;
  });

  // Ajuster largeurs
  const widths = [15, 12, 12, 12, 12, 12, 15, 15, 12, 15];
  widths.forEach((w, i) => sheet.getColumn(i + 1).width = w);
}

/**
 * 6. SOLDE CONGÉS
 */
async function createLeaveBalanceSheet(workbook, employees, leaveBalances, leaves, year, month) {
  const sheet = workbook.addWorksheet('SOLDE CONGES', {
    properties: { tabColor: { argb: '22C55E' } }
  });

  let row = 1;

  // Titre
  sheet.mergeCells(`A${row}:I${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = `SOLDE CONGÉS - ${MONTHS_FR[month].toUpperCase()} ${year}`;
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '22C55E' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  row++;
  row++;

  // En-têtes
  const headers = [
    'Nom', 'Prénom', 'Matricule',
    'CP Acquis', 'CP Pris', 'CP Restants',
    'CP N-1', 'RTT Acquis', 'RTT Restants'
  ];

  headers.forEach((header, idx) => {
    const cell = sheet.getCell(row, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6B7280' } };
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });
  row++;

  // Calculer les congés pris ce mois
  employees.forEach(emp => {
    const empLeaves = leaves.filter(l => l.userId === emp.id);
    const cpPrisCeMois = empLeaves
      .filter(l => l.type?.toLowerCase().includes('cp') || l.type?.toLowerCase().includes('conge'))
      .reduce((sum, l) => sum + (l.nbJours || 0), 0);

    const balance = leaveBalances[emp.id] || {};

    // Lire les bons champs: paidLeaveDays, usedPaidLeaveDays, rttDays, usedRttDays
    const cpAcquis = balance.paidLeaveDays ?? emp.congesAcquis ?? 25;
    const cpPris = (balance.usedPaidLeaveDays ?? emp.congesPris ?? 0) + cpPrisCeMois;
    const cpRestants = cpAcquis - cpPris;
    const cpN1 = balance.carryoverDays ?? balance.n1 ?? emp.congesN1 ?? 0;
    const rttAcquis = balance.rttDays ?? 0;
    const rttRestants = (balance.rttDays ?? 0) - (balance.usedRttDays ?? 0);

    const rowData = [
      emp.nom,
      emp.prenom,
      emp.matricule || '-',
      cpAcquis,
      cpPris,
      cpRestants,
      cpN1,
      rttAcquis,
      rttRestants
    ];

    rowData.forEach((value, idx) => {
      const cell = sheet.getCell(row, idx + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      // Coloriser le solde restant
      if (idx === 5 && typeof value === 'number') {
        if (value <= 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FECACA' } };
          cell.font = { color: { argb: 'EF4444' }, bold: true };
        } else if (value <= 5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        } else {
          cell.font = { color: { argb: '22C55E' } };
        }
      }
    });

    row++;
  });

  // Ajuster largeurs
  const widths = [15, 12, 12, 10, 10, 12, 10, 10, 12];
  widths.forEach((w, i) => sheet.getColumn(i + 1).width = w);
}
