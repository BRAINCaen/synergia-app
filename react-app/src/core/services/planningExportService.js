// ==========================================
// react-app/src/core/services/planningExportService.js
// SERVICE EXPORT PLANNING (PDF, EXCEL, IMPRESSION)
// Version améliorée avec pointages, corrections et noms officiels
// ==========================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * SERVICE D'EXPORT DU PLANNING
 * Génère des PDF et Excel du planning avec rendu visuel
 * Inclut les pointages, corrections et noms officiels
 */
class PlanningExportService {
  constructor() {
    this.companyName = 'Synergia';
    this.colors = {
      primary: '#8B5CF6',
      secondary: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      gray: '#6B7280',
      lightGray: '#F3F4F6'
    };
  }

  // ==========================================
  // EXPORT PDF HEBDOMADAIRE COMPLET
  // ==========================================

  /**
   * GÉNÉRER UN PDF HEBDOMADAIRE COMPLET
   * Inclut: shifts, pointages, corrections, noms officiels
   */
  async generateWeeklyPDF(weekData) {
    try {
      const {
        employees,
        shifts,
        weekStart,
        weekEnd,
        stats,
        pointages = {},      // Pointages par employé/jour
        anomalies = {},      // Anomalies par shiftId
        useOfficialNames = true  // Utiliser les noms officiels
      } = weekData;

      // Créer le document PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Ajouter l'en-tête officiel
      this.addOfficialHeader(doc, 'Planning Hebdomadaire - Document Officiel', weekStart, weekEnd);

      // Ajouter les statistiques
      this.addWeeklyStats(doc, stats, 22);

      // Générer le tableau du planning avec pointages et corrections
      const tableEndY = this.addWeeklyTableComplete(doc, employees, shifts, pointages, anomalies, weekStart, 42, useOfficialNames);

      // Ajouter la légende
      this.addLegend(doc, tableEndY + 10);

      // Ajouter le pied de page officiel
      this.addOfficialFooter(doc);

      // Sauvegarder le PDF
      const fileName = `planning_semaine_${weekStart}_${weekEnd}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF hebdomadaire officiel généré:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Erreur génération PDF hebdomadaire:', error);
      throw error;
    }
  }

  /**
   * AJOUTER LES STATISTIQUES HEBDOMADAIRES
   */
  addWeeklyStats(doc, stats, y) {
    const statsData = [
      ['Total Heures', `${stats?.totalHours || 0}h`, 'Shifts Planifiés', stats?.shiftsCount || 0],
      ['Employés Planifiés', stats?.employeesScheduled || 0, 'Taux de Couverture', `${stats?.coverage || 0}%`]
    ];

    doc.autoTable({
      startY: y,
      head: [],
      body: statsData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [139, 92, 246], textColor: [255, 255, 255] },
        2: { fontStyle: 'bold', fillColor: [139, 92, 246], textColor: [255, 255, 255] }
      },
      margin: { left: 14, right: 14 }
    });
  }

  /**
   * GÉNÉRER LE TABLEAU HEBDOMADAIRE COMPLET
   * Avec pointages, corrections et noms officiels
   */
  addWeeklyTableComplete(doc, employees, shifts, pointages, anomalies, weekStart, startY, useOfficialNames) {
    // Générer les dates de la semaine
    const weekDates = this.generateWeekDates(weekStart);
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // En-têtes du tableau
    const headers = ['Employé', ...dayNames];

    // Corps du tableau
    const body = employees.map(employee => {
      // Utiliser le nom officiel (NOM Prénom) ou le displayName
      const displayName = useOfficialNames && employee.officialName
        ? employee.officialName
        : employee.name || 'Sans nom';

      const row = [displayName];

      weekDates.forEach(date => {
        // Trouver les shifts de l'employé pour ce jour
        const dayShifts = shifts.filter(s =>
          s.employeeId === employee.id && s.date === date
        );

        // Récupérer les pointages du jour
        const dayKey = new Date(date).toDateString();
        const userPointages = pointages[employee.id];
        const dayPointageData = userPointages?.[dayKey] || [];

        // Construire le texte de la cellule
        let cellContent = '';

        if (dayShifts.length > 0) {
          // Afficher les shifts planifiés
          dayShifts.forEach((shift, idx) => {
            if (idx > 0) cellContent += '\n---\n';

            // Shift planifié
            cellContent += `📅 ${shift.startTime}-${shift.endTime}`;
            if (shift.position) {
              cellContent += `\n${shift.position}`;
            }

            // Vérifier s'il y a des anomalies
            const shiftAnomaly = anomalies[shift.id];
            if (shiftAnomaly) {
              if (shiftAnomaly.type === 'late') {
                cellContent += `\n⚠️ Retard: ${shiftAnomaly.lateMinutes}min`;
              } else if (shiftAnomaly.type === 'early_departure') {
                cellContent += `\n⚠️ Départ anticipé`;
              } else if (shiftAnomaly.type === 'missing') {
                cellContent += `\n❌ Absent`;
              } else if (shiftAnomaly.type === 'overtime') {
                cellContent += `\n⏰ Heures sup`;
              }
            }
          });

          // Ajouter les pointages réels si disponibles
          if (dayPointageData.length > 0) {
            const arrivals = dayPointageData.filter(p => p.type === 'arrival');
            const departures = dayPointageData.filter(p => p.type === 'departure');

            if (arrivals.length > 0 || departures.length > 0) {
              cellContent += '\n──────────';
              cellContent += '\n⏱️ Pointages:';

              if (arrivals[0]?.timestamp) {
                const arrTime = this.formatTime(arrivals[0].timestamp);
                cellContent += `\n→ ${arrTime}`;
              }
              if (departures[departures.length - 1]?.timestamp) {
                const depTime = this.formatTime(departures[departures.length - 1].timestamp);
                cellContent += `\n← ${depTime}`;
              }
            }
          }
        } else if (dayPointageData.length > 0) {
          // Pointages sans shift planifié (hors planning)
          cellContent = '⚡ Hors planning';
          const arrivals = dayPointageData.filter(p => p.type === 'arrival');
          const departures = dayPointageData.filter(p => p.type === 'departure');

          if (arrivals[0]?.timestamp) {
            const arrTime = this.formatTime(arrivals[0].timestamp);
            cellContent += `\n→ ${arrTime}`;
          }
          if (departures[departures.length - 1]?.timestamp) {
            const depTime = this.formatTime(departures[departures.length - 1].timestamp);
            cellContent += `\n← ${depTime}`;
          }
        } else {
          cellContent = '-';
        }

        row.push(cellContent);
      });

      return row;
    });

    // Générer le tableau
    doc.autoTable({
      startY,
      head: [headers],
      body,
      theme: 'striped',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35, halign: 'left' },
        1: { cellWidth: 32, halign: 'center' },
        2: { cellWidth: 32, halign: 'center' },
        3: { cellWidth: 32, halign: 'center' },
        4: { cellWidth: 32, halign: 'center' },
        5: { cellWidth: 32, halign: 'center' },
        6: { cellWidth: 32, halign: 'center' },
        7: { cellWidth: 32, halign: 'center' }
      },
      didParseCell: (data) => {
        // Colorer les cellules selon le contenu
        if (data.section === 'body' && data.column.index > 0) {
          const text = data.cell.text.join(' ');
          if (text.includes('❌')) {
            data.cell.styles.fillColor = [254, 226, 226]; // Rouge clair
          } else if (text.includes('⚠️')) {
            data.cell.styles.fillColor = [254, 243, 199]; // Jaune clair
          } else if (text.includes('⚡')) {
            data.cell.styles.fillColor = [219, 234, 254]; // Bleu clair
          }
        }
      },
      margin: { left: 14, right: 14 }
    });

    return doc.lastAutoTable.finalY;
  }

  /**
   * AJOUTER LA LÉGENDE
   */
  addLegend(doc, y) {
    // Vérifier s'il y a assez de place, sinon nouvelle page
    if (y > doc.internal.pageSize.height - 40) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'bold');
    doc.text('Légende:', 14, y);

    doc.setFont('helvetica', 'normal');
    const legendItems = [
      '📅 Shift planifié',
      '⏱️ Pointages réels',
      '→ Arrivée',
      '← Départ',
      '⚠️ Anomalie (retard/départ anticipé)',
      '❌ Absence',
      '⚡ Hors planning',
      '⏰ Heures supplémentaires'
    ];

    let xPos = 14;
    legendItems.forEach((item, idx) => {
      if (xPos > doc.internal.pageSize.width - 50) {
        xPos = 14;
        y += 4;
      }
      doc.text(item, xPos, y + 5 + Math.floor(idx / 4) * 4);
      xPos += 50;
      if (idx % 4 === 3) xPos = 14;
    });
  }

  // ==========================================
  // EXPORT PDF MENSUEL
  // ==========================================

  /**
   * GÉNÉRER UN PDF MENSUEL
   */
  async generateMonthlyPDF(monthData) {
    try {
      const { employees, shifts, monthStart, monthEnd, stats } = monthData;

      // Créer le document PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Ajouter l'en-tête
      const monthName = new Date(monthStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      this.addOfficialHeader(doc, `Planning Mensuel - ${monthName}`, monthStart, monthEnd);

      // Ajouter les statistiques mensuelles
      this.addMonthlyStats(doc, stats, 22);

      // Générer le calendrier mensuel
      this.addMonthlyCalendar(doc, employees, shifts, monthStart, 42);

      // Ajouter le pied de page
      this.addOfficialFooter(doc);

      // Sauvegarder le PDF
      const fileName = `planning_mensuel_${monthStart}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF mensuel généré:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Erreur génération PDF mensuel:', error);
      throw error;
    }
  }

  /**
   * AJOUTER LES STATISTIQUES MENSUELLES
   */
  addMonthlyStats(doc, stats, y) {
    const statsData = [
      ['Total Heures Mois', `${stats?.totalHours || 0}h`, 'Shifts Mensuels', stats?.shiftsCount || 0],
      ['Moyenne/Jour', `${stats?.avgDailyHours || 0}h`, 'Employés Actifs', stats?.activeEmployees || 0]
    ];

    doc.autoTable({
      startY: y,
      head: [],
      body: statsData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        2: { fontStyle: 'bold', fillColor: [59, 130, 246], textColor: [255, 255, 255] }
      },
      margin: { left: 14, right: 14 }
    });
  }

  /**
   * GÉNÉRER LE CALENDRIER MENSUEL
   */
  addMonthlyCalendar(doc, employees, shifts, monthStart, startY) {
    // Obtenir tous les jours du mois
    const monthDates = this.generateMonthDates(monthStart);

    // Créer un résumé par jour
    const headers = ['Date', 'Jour', 'Employés Planifiés', 'Total Heures', 'Shifts'];

    const body = monthDates.map(date => {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dateFormatted = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

      // Compter les shifts du jour
      const dayShifts = shifts.filter(s => s.date === date);
      const uniqueEmployees = new Set(dayShifts.map(s => s.employeeId)).size;
      const totalHours = dayShifts.reduce((sum, s) => sum + (s.duration || 0), 0);

      return [
        dateFormatted,
        dayName,
        uniqueEmployees,
        `${totalHours.toFixed(1)}h`,
        dayShifts.length
      ];
    });

    // Générer le tableau
    doc.autoTable({
      startY,
      head: [headers],
      body,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // ==========================================
  // EXPORT COMPARAISON PLANNING/BADGES
  // ==========================================

  /**
   * GÉNÉRER UN PDF DE COMPARAISON PLANNING/BADGES
   */
  async generateComparisonPDF(comparisonData) {
    try {
      const { employee, startDate, endDate, days, summary } = comparisonData;

      // Créer le document PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Utiliser le nom officiel si disponible
      const employeeName = employee.officialName || employee.name;

      // Ajouter l'en-tête
      this.addOfficialHeader(
        doc,
        `Comparaison Planning / Pointages - ${employeeName}`,
        startDate,
        endDate
      );

      // Ajouter le résumé
      this.addComparisonSummary(doc, summary, 22);

      // Ajouter le tableau détaillé
      this.addComparisonTable(doc, days, 52);

      // Ajouter le pied de page
      this.addOfficialFooter(doc);

      // Sauvegarder le PDF
      const fileName = `comparaison_${employeeName.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF comparaison généré:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Erreur génération PDF comparaison:', error);
      throw error;
    }
  }

  /**
   * AJOUTER LE RÉSUMÉ DE COMPARAISON
   */
  addComparisonSummary(doc, summary, y) {
    const summaryData = [
      ['Heures Planifiées', `${summary?.totalPlanned || 0}h`, 'Heures Travaillées', `${summary?.totalWorked || 0}h`],
      ['Différence', `${(summary?.totalDifference || 0) >= 0 ? '+' : ''}${summary?.totalDifference || 0}h`, 'Jours Comparés', summary?.daysCompared || 0]
    ];

    doc.autoTable({
      startY: y,
      head: [],
      body: summaryData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [139, 92, 246], textColor: [255, 255, 255] },
        2: { fontStyle: 'bold', fillColor: [139, 92, 246], textColor: [255, 255, 255] }
      },
      margin: { left: 14, right: 14 }
    });
  }

  /**
   * AJOUTER LE TABLEAU DE COMPARAISON DÉTAILLÉ
   */
  addComparisonTable(doc, days, startY) {
    const headers = ['Date', 'Heures Planifiées', 'Heures Travaillées', 'Différence', 'Statut'];

    const body = (days || []).map(day => {
      const dateFormatted = new Date(day.date).toLocaleDateString('fr-FR');
      const difference = (day.difference || 0) >= 0 ? `+${day.difference || 0}h` : `${day.difference || 0}h`;

      const statusText = {
        'ok': 'OK ✓',
        'overtime': 'Heures Sup',
        'undertime': 'Sous-temps',
        'absent': 'Absent',
        'not-scheduled': 'Non planifié',
        'no-data': 'Pas de données'
      }[day.status] || day.status;

      return [
        dateFormatted,
        `${day.plannedHours || 0}h`,
        `${day.workedHours || 0}h`,
        difference,
        statusText
      ];
    });

    doc.autoTable({
      startY,
      head: [headers],
      body,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' }
      },
      didParseCell: (data) => {
        // Colorer les lignes selon le statut
        if (data.section === 'body' && data.column.index === 4 && days && days[data.row.index]) {
          const status = days[data.row.index].status;
          if (status === 'ok') {
            data.cell.styles.textColor = [16, 185, 129]; // Vert
          } else if (status === 'overtime' || status === 'undertime') {
            data.cell.styles.textColor = [245, 158, 11]; // Orange
          } else if (status === 'absent') {
            data.cell.styles.textColor = [239, 68, 68]; // Rouge
          }
        }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // ==========================================
  // ÉLÉMENTS COMMUNS
  // ==========================================

  /**
   * AJOUTER L'EN-TÊTE OFFICIEL
   */
  addOfficialHeader(doc, title, startDate, endDate) {
    // Logo / Titre entreprise
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(this.companyName, 14, 12);

    // Titre du document
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 20);

    // Période
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const periodText = `Période: du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
    doc.text(periodText, 14, 26);

    // Date de génération (à droite)
    const genDate = `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    doc.setFontSize(8);
    doc.text(genDate, doc.internal.pageSize.width - 14, 12, { align: 'right' });

    // Mention document officiel
    doc.setFontSize(7);
    doc.setTextColor(139, 92, 246);
    doc.text('Document officiel - À conserver', doc.internal.pageSize.width - 14, 17, { align: 'right' });

    // Ligne de séparation
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.line(14, 30, doc.internal.pageSize.width - 14, 30);
  }

  /**
   * AJOUTER LE PIED DE PAGE OFFICIEL
   */
  addOfficialFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Ligne de séparation
      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(0.5);
      doc.line(14, doc.internal.pageSize.height - 15, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 15);

      // Texte du pied de page
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${this.companyName} - Planning Officiel`,
        14,
        doc.internal.pageSize.height - 10
      );

      // Mention confidentiel
      doc.setFontSize(7);
      doc.text(
        'Document confidentiel - Usage interne uniquement',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      doc.setFontSize(8);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * FORMATER UNE HEURE
   */
  formatTime(timestamp) {
    if (!timestamp) return '--:--';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * GÉNÉRER LES DATES D'UNE SEMAINE
   */
  generateWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  /**
   * GÉNÉRER LES DATES D'UN MOIS
   */
  generateMonthDates(monthStart) {
    const dates = [];
    const start = new Date(monthStart);
    const year = start.getFullYear();
    const month = start.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  // ==========================================
  // EXPORT EXCEL (À IMPLÉMENTER AVEC XLSX)
  // ==========================================

  /**
   * GÉNÉRER UN FICHIER EXCEL
   * Note: Nécessite la bibliothèque xlsx
   */
  async generateExcel(data) {
    console.warn('⚠️ Export Excel à implémenter avec la bibliothèque xlsx');
    // TODO: Implémenter avec xlsx si nécessaire
    return { success: false, message: 'Export Excel non implémenté' };
  }
}

// Export singleton
const planningExportService = new PlanningExportService();
export default planningExportService;
