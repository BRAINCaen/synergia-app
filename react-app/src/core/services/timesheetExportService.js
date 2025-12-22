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
   * Récupérer les pointages d'un mois pour un ou tous les employés
   */
  async getMonthlyPointages(year, month, employeeId = null) {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endMonth = month === 11 ? 0 : month + 1;
      const endYear = month === 11 ? year + 1 : year;
      const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

      let q;
      if (employeeId) {
        q = query(
          collection(db, 'pointages'),
          where('userId', '==', employeeId),
          where('date', '>=', startDate),
          where('date', '<', endDate),
          orderBy('date', 'asc'),
          orderBy('timestamp', 'asc')
        );
      } else {
        q = query(
          collection(db, 'pointages'),
          where('date', '>=', startDate),
          where('date', '<', endDate),
          orderBy('date', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      const pointages = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        pointages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp)
        });
      });

      return pointages;
    } catch (error) {
      console.error('❌ Erreur récupération pointages:', error);
      return [];
    }
  }

  /**
   * Récupérer les congés approuvés d'un mois
   */
  async getMonthlyLeaves(year, month, employeeId = null) {
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

      let q;
      if (employeeId) {
        q = query(
          collection(db, 'leaveRequests'),
          where('userId', '==', employeeId),
          where('status', '==', 'approved')
        );
      } else {
        q = query(
          collection(db, 'leaveRequests'),
          where('status', '==', 'approved')
        );
      }

      const snapshot = await getDocs(q);
      const leaves = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // Vérifier si le congé intersecte avec le mois
        const leaveStart = data.startDate?.split('T')[0] || data.startDate;
        const leaveEnd = data.endDate?.split('T')[0] || data.endDate;

        if (leaveStart <= endDate && leaveEnd >= startDate) {
          leaves.push({
            id: doc.id,
            ...data,
            startDate: leaveStart,
            endDate: leaveEnd
          });
        }
      });

      return leaves;
    } catch (error) {
      console.error('❌ Erreur récupération congés:', error);
      return [];
    }
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
      employeeId = null, // null = tous les employés
      includeDetails = true,
      includeSummary = true,
      companyName = 'Synergia'
    } = options;

    console.log(`📊 Export pointages ${MONTHS_FR[month]} ${year}...`);

    // Récupérer les données
    const [employees, pointages, leaves] = await Promise.all([
      this.getEmployees(),
      this.getMonthlyPointages(year, month, employeeId),
      this.getMonthlyLeaves(year, month, employeeId)
    ]);

    // Filtrer les employés si nécessaire
    const targetEmployees = employeeId
      ? employees.filter(e => e.id === employeeId)
      : employees;

    if (targetEmployees.length === 0) {
      throw new Error('Aucun employé trouvé');
    }

    // Créer le workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Synergia';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Générer une feuille par employé
    for (const employee of targetEmployees) {
      const employeePointages = pointages.filter(p => p.userId === employee.id);
      const employeeLeaves = leaves.filter(l => l.userId === employee.id);

      await this.createEmployeeSheet(workbook, employee, year, month, employeePointages, employeeLeaves, companyName);
    }

    // Ajouter la feuille récapitulative si demandé
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
  async createEmployeeSheet(workbook, employee, year, month, pointages, leaves, companyName) {
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

    // Données journalières
    let totalHours = 0;
    let totalOvertimeHours = 0;
    let totalDaysWorked = 0;
    let totalLeaveDays = 0;
    const dailyHoursThreshold = 7; // Heures normales par jour

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

      // Récupérer les pointages du jour
      const dayPointages = pointages.filter(p => p.date === dateStr);
      const arrivals = dayPointages.filter(p => p.type === 'arrival').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const departures = dayPointages.filter(p => p.type === 'departure').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Vérifier les congés
      const leave = this.getLeaveForDate(dateStr, leaves, employee.id);

      // Calculer les heures
      let hoursWorked = 0;
      let arrivalTime = '-';
      let departureTime = '-';
      let status = '';
      let remarks = '';
      let rowColor = null;

      if (leave) {
        // Jour de congé
        status = leave.leaveTypeLabel || leave.leaveType || 'Congé';
        remarks = leave.reason || '';
        totalLeaveDays++;

        // Couleur selon type de congé
        if (leave.leaveType?.includes('cp') || leave.leaveType?.includes('conge')) {
          rowColor = COLORS.conge;
        } else if (leave.leaveType?.includes('rtt')) {
          rowColor = COLORS.rtt;
        } else if (leave.leaveType?.includes('maladie') || leave.leaveType?.includes('medical')) {
          rowColor = COLORS.maladie;
        } else {
          rowColor = COLORS.absence;
        }
      } else if (isWeekendDay) {
        status = 'Weekend';
        rowColor = COLORS.weekend;
      } else if (arrivals.length > 0) {
        // Jour travaillé
        const firstArrival = arrivals[0];
        const lastDeparture = departures[departures.length - 1];

        arrivalTime = new Date(firstArrival.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        if (lastDeparture) {
          departureTime = new Date(lastDeparture.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          hoursWorked = this.calculateHoursWorked(firstArrival.timestamp, lastDeparture.timestamp);

          // Déduire pause (30min si > 6h)
          if (hoursWorked > 6) {
            hoursWorked -= 0.5; // 30 min pause
          }

          totalHours += hoursWorked;
          totalDaysWorked++;

          // Calculer heures sup
          if (hoursWorked > dailyHoursThreshold) {
            totalOvertimeHours += hoursWorked - dailyHoursThreshold;
          }
        } else {
          status = 'Départ manquant';
          rowColor = COLORS.warning;
        }
      } else if (!isWeekendDay) {
        // Jour ouvré sans pointage
        status = 'Absence';
        rowColor = COLORS.absence;
      }

      // Ajouter la ligne
      const dataRow = sheet.getRow(rowNum);
      dataRow.getCell(1).value = day;
      dataRow.getCell(2).value = DAYS_FR[dayOfWeek];
      dataRow.getCell(3).value = arrivalTime;
      dataRow.getCell(4).value = departureTime;
      dataRow.getCell(5).value = hoursWorked > 6 ? '0h30' : '-';
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
      ['Jours travaillés', totalDaysWorked, 'jours'],
      ['Jours de congés', totalLeaveDays, 'jours'],
      ['Total heures travaillées', this.formatDuration(totalHours), ''],
      ['Heures supplémentaires', this.formatDuration(totalOvertimeHours), ''],
      ['Moyenne journalière', this.formatDuration(totalDaysWorked > 0 ? totalHours / totalDaysWorked : 0), '']
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
