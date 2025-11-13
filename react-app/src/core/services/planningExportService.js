// ==========================================
// 📁 react-app/src/core/services/planningExportService.js
// SERVICE EXPORT PLANNING (PDF, EXCEL, IMPRESSION)
// ==========================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * 📄 SERVICE D'EXPORT DU PLANNING
 * Génère des PDF et Excel du planning avec rendu visuel
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
  // 📄 EXPORT PDF HEBDOMADAIRE
  // ==========================================

  /**
   * 📄 GÉNÉRER UN PDF HEBDOMADAIRE
   */
  async generateWeeklyPDF(weekData) {
    try {
      const { employees, shifts, weekStart, weekEnd, stats } = weekData;

      // Créer le document PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Ajouter l'en-tête
      this.addHeader(doc, 'Planning Hebdomadaire', weekStart, weekEnd);

      // Ajouter les statistiques
      this.addWeeklyStats(doc, stats, 20);

      // Générer le tableau du planning
      this.addWeeklyTable(doc, employees, shifts, weekStart, 40);

      // Ajouter le pied de page
      this.addFooter(doc);

      // Sauvegarder le PDF
      const fileName = `planning_semaine_${weekStart}_${weekEnd}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF hebdomadaire généré:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Erreur génération PDF hebdomadaire:', error);
      throw error;
    }
  }

  /**
   * 📊 AJOUTER LES STATISTIQUES HEBDOMADAIRES
   */
  addWeeklyStats(doc, stats, y) {
    const statsData = [
      ['Total Heures', `${stats.totalHours}h`, 'Shifts Planifiés', stats.shiftsCount],
      ['Employés Planifiés', stats.employeesScheduled, 'Taux de Couverture', `${stats.coverage}%`]
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
   * 📅 GÉNÉRER LE TABLEAU HEBDOMADAIRE
   */
  addWeeklyTable(doc, employees, shifts, weekStart, startY) {
    // Générer les dates de la semaine
    const weekDates = this.generateWeekDates(weekStart);
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // En-têtes du tableau
    const headers = ['Employé', ...dayNames];

    // Corps du tableau
    const body = employees.map(employee => {
      const row = [employee.name];

      weekDates.forEach(date => {
        // Trouver les shifts de l'employé pour ce jour
        const dayShifts = shifts.filter(s => 
          s.employeeId === employee.id && s.date === date
        );

        if (dayShifts.length > 0) {
          const shiftText = dayShifts.map(s => 
            `${s.startTime}-${s.endTime}\n${s.position || ''}`
          ).join('\n');
          row.push(shiftText);
        } else {
          row.push('-');
        }
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
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // ==========================================
  // 📄 EXPORT PDF MENSUEL
  // ==========================================

  /**
   * 📄 GÉNÉRER UN PDF MENSUEL
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
      this.addHeader(doc, `Planning Mensuel - ${monthName}`, monthStart, monthEnd);

      // Ajouter les statistiques mensuelles
      this.addMonthlyStats(doc, stats, 20);

      // Générer le calendrier mensuel
      this.addMonthlyCalendar(doc, employees, shifts, monthStart, 40);

      // Ajouter le pied de page
      this.addFooter(doc);

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
   * 📊 AJOUTER LES STATISTIQUES MENSUELLES
   */
  addMonthlyStats(doc, stats, y) {
    const statsData = [
      ['Total Heures Mois', `${stats.totalHours}h`, 'Shifts Mensuels', stats.shiftsCount],
      ['Moyenne/Jour', `${stats.avgDailyHours}h`, 'Employés Actifs', stats.activeEmployees]
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
   * 📅 GÉNÉRER LE CALENDRIER MENSUEL
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
  // 📄 EXPORT COMPARAISON PLANNING/BADGES
  // ==========================================

  /**
   * 📄 GÉNÉRER UN PDF DE COMPARAISON PLANNING/BADGES
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

      // Ajouter l'en-tête
      this.addHeader(
        doc, 
        `Comparaison Planning / Badges - ${employee.name}`, 
        startDate, 
        endDate
      );

      // Ajouter le résumé
      this.addComparisonSummary(doc, summary, 20);

      // Ajouter le tableau détaillé
      this.addComparisonTable(doc, days, 50);

      // Ajouter le pied de page
      this.addFooter(doc);

      // Sauvegarder le PDF
      const fileName = `comparaison_${employee.name}_${startDate}_${endDate}.pdf`;
      doc.save(fileName);

      console.log('✅ PDF comparaison généré:', fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('❌ Erreur génération PDF comparaison:', error);
      throw error;
    }
  }

  /**
   * 📊 AJOUTER LE RÉSUMÉ DE COMPARAISON
   */
  addComparisonSummary(doc, summary, y) {
    const summaryData = [
      ['Heures Planifiées', `${summary.totalPlanned}h`, 'Heures Travaillées', `${summary.totalWorked}h`],
      ['Différence', `${summary.totalDifference >= 0 ? '+' : ''}${summary.totalDifference}h`, 'Jours Comparés', summary.daysCompared]
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
   * 📅 AJOUTER LE TABLEAU DE COMPARAISON DÉTAILLÉ
   */
  addComparisonTable(doc, days, startY) {
    const headers = ['Date', 'Heures Planifiées', 'Heures Travaillées', 'Différence', 'Statut'];

    const body = days.map(day => {
      const dateFormatted = new Date(day.date).toLocaleDateString('fr-FR');
      const difference = day.difference >= 0 ? `+${day.difference}h` : `${day.difference}h`;
      
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
        `${day.plannedHours}h`,
        `${day.workedHours}h`,
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
        if (data.section === 'body' && data.column.index === 4) {
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
  // 🎨 ÉLÉMENTS COMMUNS
  // ==========================================

  /**
   * 📋 AJOUTER L'EN-TÊTE
   */
  addHeader(doc, title, startDate, endDate) {
    // Logo / Titre entreprise
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(this.companyName, 14, 15);

    // Titre du document
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 25);

    // Période
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const periodText = `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
    doc.text(periodText, 14, 31);

    // Date de génération
    const genDate = `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;
    doc.setFontSize(8);
    doc.text(genDate, doc.internal.pageSize.width - 14, 15, { align: 'right' });

    // Ligne de séparation
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.5);
    doc.line(14, 35, doc.internal.pageSize.width - 14, 35);
  }

  /**
   * 📋 AJOUTER LE PIED DE PAGE
   */
  addFooter(doc) {
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
        `${this.companyName} - Planning`, 
        14, 
        doc.internal.pageSize.height - 10
      );
      
      doc.text(
        `Page ${i} sur ${pageCount}`, 
        doc.internal.pageSize.width - 14, 
        doc.internal.pageSize.height - 10, 
        { align: 'right' }
      );
    }
  }

  // ==========================================
  // 🛠️ UTILITAIRES
  // ==========================================

  /**
   * 📅 GÉNÉRER LES DATES D'UNE SEMAINE
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
   * 📅 GÉNÉRER LES DATES D'UN MOIS
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
  // 📊 EXPORT EXCEL (À IMPLÉMENTER AVEC XLSX)
  // ==========================================

  /**
   * 📊 GÉNÉRER UN FICHIER EXCEL
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
