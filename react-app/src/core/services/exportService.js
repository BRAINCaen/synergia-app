// ==========================================
// react-app/src/core/services/exportService.js
// SERVICE EXPORT PDF/EXCEL - SYNERGIA v4.0
// Module 17: Export des donnees
// ==========================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

// ==========================================
// CONFIGURATION
// ==========================================
const SYNERGIA_COLORS = {
  primary: [99, 102, 241], // Indigo
  secondary: [139, 92, 246], // Purple
  success: [34, 197, 94], // Green
  warning: [245, 158, 11], // Amber
  danger: [239, 68, 68], // Red
  dark: [30, 41, 59], // Slate 800
  light: [248, 250, 252] // Slate 50
};

// ==========================================
// SERVICE EXPORT
// ==========================================
class ExportService {

  // ==========================================
  // EXPORT PDF
  // ==========================================

  /**
   * Generer un rapport PDF des statistiques personnelles
   */
  async exportStatsToPDF(userData, options = {}) {
    const {
      title = 'Rapport Statistiques',
      subtitle = 'Synergia - Gamification',
      includeCharts = true,
      includeBadges = true,
      includeHistory = true
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header avec gradient simule
    doc.setFillColor(...SYNERGIA_COLORS.dark);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo/Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA', 15, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 15, 35);

    // Date
    doc.setFontSize(10);
    doc.text(`Genere le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 60, 25);

    yPosition = 55;

    // Section Profil
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Profil Joueur', 15, yPosition);
    yPosition += 10;

    // Carte profil
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(15, yPosition, pageWidth - 30, 40, 3, 3, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SYNERGIA_COLORS.primary);
    doc.text(userData.displayName || 'Utilisateur', 25, yPosition + 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Niveau ${userData.level || 1}`, 25, yPosition + 25);
    doc.text(`${(userData.totalXp || 0).toLocaleString()} XP Total`, 25, yPosition + 33);

    // Stats rapides a droite
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.text(`Rang: ${userData.rank || 'Debutant'}`, pageWidth - 70, yPosition + 15);
    doc.text(`Badges: ${userData.badgesCount || 0}`, pageWidth - 70, yPosition + 25);
    doc.text(`Taches: ${userData.tasksCompleted || 0}`, pageWidth - 70, yPosition + 33);

    yPosition += 50;

    // Section Statistiques detaillees
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.text('Statistiques Detaillees', 15, yPosition);
    yPosition += 8;

    // Table des stats
    const statsData = [
      ['Metrique', 'Valeur', 'Progression'],
      ['XP Total', (userData.totalXp || 0).toLocaleString(), this.getProgressBar(userData.xpProgress || 0)],
      ['Niveau', `${userData.level || 1}`, `${userData.levelProgress || 0}% vers niveau suivant`],
      ['Taches Completees', `${userData.tasksCompleted || 0}`, `+${userData.tasksThisWeek || 0} cette semaine`],
      ['Quetes Terminees', `${userData.questsCompleted || 0}`, `${userData.questsActive || 0} en cours`],
      ['Serie Actuelle', `${userData.streak || 0} jours`, userData.streak >= 7 ? 'En feu!' : 'Continuez!'],
      ['Badges Obtenus', `${userData.badgesCount || 0}`, `${userData.badgesTotal || 20} disponibles`],
      ['Contributions Equipe', `${userData.teamContributions || 0}`, `${userData.poolContributions || 0} XP donnes`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'striped',
      headStyles: {
        fillColor: SYNERGIA_COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'center', cellWidth: 40 },
        2: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Section Badges (si inclus)
    if (includeBadges && userData.badges && userData.badges.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SYNERGIA_COLORS.dark);
      doc.text('Badges Obtenus', 15, yPosition);
      yPosition += 8;

      const badgesData = userData.badges.map(badge => [
        badge.emoji || '🏅',
        badge.name || 'Badge',
        badge.description || '',
        new Date(badge.unlockedAt?.toDate?.() || badge.unlockedAt).toLocaleDateString('fr-FR')
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['', 'Badge', 'Description', 'Obtenu le']],
        body: badgesData.slice(0, 10), // Max 10 badges
        theme: 'grid',
        headStyles: {
          fillColor: SYNERGIA_COLORS.secondary,
          textColor: [255, 255, 255]
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 35, fontStyle: 'bold' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 30, halign: 'center' }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Section Historique XP (si inclus)
    if (includeHistory && userData.xpHistory && userData.xpHistory.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SYNERGIA_COLORS.dark);
      doc.text('Historique XP Recent', 15, yPosition);
      yPosition += 8;

      const historyData = userData.xpHistory.slice(0, 15).map(entry => [
        new Date(entry.date?.toDate?.() || entry.date).toLocaleDateString('fr-FR'),
        entry.source || 'Tache',
        `+${entry.amount} XP`,
        entry.description || ''
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Source', 'XP', 'Description']],
        body: historyData,
        theme: 'striped',
        headStyles: {
          fillColor: SYNERGIA_COLORS.success,
          textColor: [255, 255, 255]
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Synergia - Page ${i}/${pageCount} - ${new Date().toLocaleDateString('fr-FR')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Sauvegarder
    const fileName = `synergia-stats-${userData.displayName || 'user'}-${Date.now()}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Helper pour barre de progression textuelle
   */
  getProgressBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percent}%`;
  }

  // ==========================================
  // EXPORT EXCEL
  // ==========================================

  /**
   * Generer un fichier Excel des statistiques
   */
  async exportStatsToExcel(userData, options = {}) {
    const {
      includeDetails = true,
      includeBadges = true,
      includeHistory = true,
      includeTeam = true
    } = options;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Synergia';
    workbook.created = new Date();

    // ==========================================
    // Feuille 1: Resume
    // ==========================================
    const summarySheet = workbook.addWorksheet('Resume', {
      properties: { tabColor: { argb: '6366F1' } }
    });

    // Header
    summarySheet.mergeCells('A1:D1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'SYNERGIA - Rapport Statistiques';
    titleCell.font = { size: 18, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' }
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 40;

    // Info utilisateur
    summarySheet.mergeCells('A2:D2');
    const userCell = summarySheet.getCell('A2');
    userCell.value = `${userData.displayName || 'Utilisateur'} - Niveau ${userData.level || 1}`;
    userCell.font = { size: 14, bold: true, color: { argb: '6366F1' } };
    userCell.alignment = { horizontal: 'center' };

    // Date
    summarySheet.mergeCells('A3:D3');
    summarySheet.getCell('A3').value = `Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`;
    summarySheet.getCell('A3').alignment = { horizontal: 'center' };
    summarySheet.getCell('A3').font = { italic: true, color: { argb: '666666' } };

    // Stats principales
    const statsStart = 5;
    const statsData = [
      ['Metrique', 'Valeur', 'Details', 'Tendance'],
      ['XP Total', userData.totalXp || 0, `Rang: ${userData.rank || 'Debutant'}`, '↑'],
      ['Niveau', userData.level || 1, `${userData.levelProgress || 0}% vers niveau ${(userData.level || 1) + 1}`, '→'],
      ['Taches Completees', userData.tasksCompleted || 0, `+${userData.tasksThisWeek || 0} cette semaine`, '↑'],
      ['Quetes Terminees', userData.questsCompleted || 0, `${userData.questsActive || 0} en cours`, '→'],
      ['Serie Actuelle', userData.streak || 0, `${userData.streak || 0} jours consecutifs`, userData.streak >= 7 ? '🔥' : '→'],
      ['Badges', userData.badgesCount || 0, `Sur ${userData.badgesTotal || 20} disponibles`, '↑'],
      ['Contributions Equipe', userData.teamContributions || 0, `${userData.poolContributions || 0} XP donnes`, '↑'],
      ['Taux Completion', `${userData.completionRate || 0}%`, 'Taches terminees a temps', '→']
    ];

    statsData.forEach((row, index) => {
      const rowNum = statsStart + index;
      const excelRow = summarySheet.getRow(rowNum);

      row.forEach((cell, cellIndex) => {
        excelRow.getCell(cellIndex + 1).value = cell;
      });

      if (index === 0) {
        excelRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '6366F1' }
        };
      } else if (index % 2 === 0) {
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' }
        };
      }
    });

    // Largeur colonnes
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 15;
    summarySheet.getColumn(3).width = 30;
    summarySheet.getColumn(4).width = 12;

    // ==========================================
    // Feuille 2: Badges
    // ==========================================
    if (includeBadges) {
      const badgesSheet = workbook.addWorksheet('Badges', {
        properties: { tabColor: { argb: '8B5CF6' } }
      });

      badgesSheet.getRow(1).values = ['Badge', 'Nom', 'Description', 'Rarete', 'Obtenu le'];
      badgesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      badgesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8B5CF6' }
      };

      const badges = userData.badges || [];
      badges.forEach((badge, index) => {
        const row = badgesSheet.getRow(index + 2);
        row.values = [
          badge.emoji || '🏅',
          badge.name || 'Badge',
          badge.description || '',
          badge.rarity || 'Commun',
          new Date(badge.unlockedAt?.toDate?.() || badge.unlockedAt || Date.now()).toLocaleDateString('fr-FR')
        ];
      });

      badgesSheet.getColumn(1).width = 8;
      badgesSheet.getColumn(2).width = 20;
      badgesSheet.getColumn(3).width = 40;
      badgesSheet.getColumn(4).width = 12;
      badgesSheet.getColumn(5).width = 15;
    }

    // ==========================================
    // Feuille 3: Historique XP
    // ==========================================
    if (includeHistory) {
      const historySheet = workbook.addWorksheet('Historique XP', {
        properties: { tabColor: { argb: '22C55E' } }
      });

      historySheet.getRow(1).values = ['Date', 'Heure', 'Source', 'XP Gagne', 'Description', 'XP Cumule'];
      historySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      historySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '22C55E' }
      };

      const history = userData.xpHistory || [];
      let cumulativeXP = 0;
      history.forEach((entry, index) => {
        cumulativeXP += entry.amount || 0;
        const date = new Date(entry.date?.toDate?.() || entry.date || Date.now());
        const row = historySheet.getRow(index + 2);
        row.values = [
          date.toLocaleDateString('fr-FR'),
          date.toLocaleTimeString('fr-FR'),
          entry.source || 'Tache',
          entry.amount || 0,
          entry.description || '',
          cumulativeXP
        ];

        // Couleur verte pour XP positif
        if (entry.amount > 0) {
          row.getCell(4).font = { color: { argb: '22C55E' }, bold: true };
        }
      });

      historySheet.getColumn(1).width = 12;
      historySheet.getColumn(2).width = 10;
      historySheet.getColumn(3).width = 15;
      historySheet.getColumn(4).width = 12;
      historySheet.getColumn(5).width = 35;
      historySheet.getColumn(6).width = 12;
    }

    // ==========================================
    // Feuille 4: Equipe
    // ==========================================
    if (includeTeam && userData.teamStats) {
      const teamSheet = workbook.addWorksheet('Equipe', {
        properties: { tabColor: { argb: 'F59E0B' } }
      });

      teamSheet.getRow(1).values = ['Statistique', 'Valeur'];
      teamSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      teamSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F59E0B' }
      };

      const teamData = [
        ['XP Cagnotte Equipe', userData.teamStats.poolXP || 0],
        ['Defis Equipe Completes', userData.teamStats.challengesCompleted || 0],
        ['Contributions Totales', userData.teamStats.totalContributions || 0],
        ['Classement Equipe', userData.teamStats.rank || 'N/A'],
        ['Membres Actifs', userData.teamStats.activeMembers || 0]
      ];

      teamData.forEach((row, index) => {
        teamSheet.getRow(index + 2).values = row;
      });

      teamSheet.getColumn(1).width = 30;
      teamSheet.getColumn(2).width = 20;
    }

    // Generer le fichier
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fileName = `synergia-stats-${userData.displayName || 'user'}-${Date.now()}.xlsx`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, fileName };
  }

  // ==========================================
  // EXPORT RAPIDE (DONNEES BRUTES)
  // ==========================================

  /**
   * Export JSON des donnees
   */
  exportToJSON(userData, options = {}) {
    const data = {
      exportDate: new Date().toISOString(),
      user: {
        displayName: userData.displayName,
        email: userData.email,
        level: userData.level,
        totalXp: userData.totalXp,
        rank: userData.rank
      },
      stats: {
        tasksCompleted: userData.tasksCompleted,
        questsCompleted: userData.questsCompleted,
        streak: userData.streak,
        badgesCount: userData.badgesCount,
        completionRate: userData.completionRate,
        teamContributions: userData.teamContributions
      },
      badges: userData.badges || [],
      xpHistory: userData.xpHistory || []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const fileName = `synergia-data-${userData.displayName || 'user'}-${Date.now()}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, fileName };
  }

  /**
   * Export CSV simplifie
   */
  exportToCSV(userData, options = {}) {
    const headers = ['Metrique', 'Valeur'];
    const rows = [
      ['Nom', userData.displayName || 'Utilisateur'],
      ['Email', userData.email || ''],
      ['Niveau', userData.level || 1],
      ['XP Total', userData.totalXp || 0],
      ['Rang', userData.rank || 'Debutant'],
      ['Taches Completees', userData.tasksCompleted || 0],
      ['Quetes Terminees', userData.questsCompleted || 0],
      ['Serie', userData.streak || 0],
      ['Badges', userData.badgesCount || 0],
      ['Taux Completion', `${userData.completionRate || 0}%`],
      ['Contributions Equipe', userData.teamContributions || 0]
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `synergia-stats-${userData.displayName || 'user'}-${Date.now()}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, fileName };
  }

  // ==========================================
  // EXPORT PLANNING PDF
  // ==========================================

  /**
   * Exporter le planning hebdomadaire en PDF
   */
  async exportPlanningToPDF(planningData, options = {}) {
    const {
      title = 'Planning Hebdomadaire',
      weekStart = new Date(),
      employees = [],
      shifts = []
    } = options;

    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(...SYNERGIA_COLORS.dark);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA - Planning', 15, 22);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    doc.text(`Semaine du ${weekStart.toLocaleDateString('fr-FR')} au ${weekEndDate.toLocaleDateString('fr-FR')}`, 15, 30);

    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 60, 22);

    yPosition = 45;

    // Jours de la semaine
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const dayDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dayDates.push(date);
    }

    // Préparer les données du tableau
    const tableHead = ['Employé', ...days.map((day, i) => `${day} ${dayDates[i].getDate()}`)];
    const tableBody = [];

    employees.forEach(emp => {
      const row = [emp.displayName || emp.name || 'Employé'];

      days.forEach((_, dayIndex) => {
        const dayDate = dayDates[dayIndex].toISOString().split('T')[0];
        const dayShifts = shifts.filter(s =>
          s.employeeId === emp.id &&
          (s.date === dayDate || s.startDate === dayDate)
        );

        if (dayShifts.length > 0) {
          const shiftText = dayShifts.map(s => {
            const start = s.startTime || s.start || '';
            const end = s.endTime || s.end || '';
            return `${start}-${end}`;
          }).join('\n');
          row.push(shiftText);
        } else {
          row.push('-');
        }
      });

      tableBody.push(row);
    });

    // Générer le tableau
    doc.autoTable({
      startY: yPosition,
      head: [tableHead],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: SYNERGIA_COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Synergia - Planning - Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-planning-${weekStart.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  // ==========================================
  // RAPPORT MENSUEL ÉQUIPE (PDF)
  // ==========================================

  /**
   * Générer un rapport mensuel d'équipe
   */
  async exportTeamMonthlyReport(teamData, options = {}) {
    const {
      month = new Date().getMonth(),
      year = new Date().getFullYear(),
      teamName = 'Équipe',
      employees = [],
      metrics = {}
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Header
    doc.setFillColor(...SYNERGIA_COLORS.dark);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA', 15, 22);

    doc.setFontSize(14);
    doc.text(`Rapport Mensuel - ${monthNames[month]} ${year}`, 15, 35);

    doc.setFontSize(10);
    doc.text(`Équipe: ${teamName}`, pageWidth - 70, 22);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 70, 32);

    yPosition = 55;

    // Résumé des métriques
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé du Mois', 15, yPosition);
    yPosition += 10;

    // Cartes de métriques
    const metricCards = [
      { label: 'Tâches Complétées', value: metrics.tasksCompleted || 0, color: SYNERGIA_COLORS.success },
      { label: 'XP Total Gagné', value: metrics.totalXP || 0, color: SYNERGIA_COLORS.warning },
      { label: 'Heures Travaillées', value: `${metrics.hoursWorked || 0}h`, color: SYNERGIA_COLORS.primary },
      { label: 'Taux Complétion', value: `${metrics.completionRate || 0}%`, color: SYNERGIA_COLORS.secondary }
    ];

    const cardWidth = (pageWidth - 40) / 4;
    metricCards.forEach((card, index) => {
      const x = 15 + (index * (cardWidth + 5));
      doc.setFillColor(...card.color);
      doc.roundedRect(x, yPosition, cardWidth - 5, 25, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(card.label, x + 5, yPosition + 8);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(String(card.value), x + 5, yPosition + 20);
    });

    yPosition += 35;

    // Performance par employé
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Individuelle', 15, yPosition);
    yPosition += 8;

    const employeeData = employees.map(emp => [
      emp.displayName || emp.name || 'Employé',
      emp.tasksCompleted || 0,
      emp.xpEarned || 0,
      `${emp.completionRate || 0}%`,
      emp.hoursWorked || 0,
      emp.trend || '→'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Employé', 'Tâches', 'XP', 'Complétion', 'Heures', 'Tendance']],
      body: employeeData,
      theme: 'striped',
      headStyles: {
        fillColor: SYNERGIA_COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Top performers
    if (yPosition < 220 && employees.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SYNERGIA_COLORS.dark);
      doc.text('🏆 Top Performers', 15, yPosition);
      yPosition += 8;

      const topPerformers = [...employees]
        .sort((a, b) => (b.xpEarned || 0) - (a.xpEarned || 0))
        .slice(0, 3);

      const medals = ['🥇', '🥈', '🥉'];
      topPerformers.forEach((emp, i) => {
        doc.setFillColor(245, 245, 250);
        doc.roundedRect(15, yPosition, pageWidth - 30, 12, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setTextColor(...SYNERGIA_COLORS.dark);
        doc.text(`${medals[i]} ${emp.displayName || emp.name}`, 20, yPosition + 8);
        doc.text(`${emp.xpEarned || 0} XP`, pageWidth - 50, yPosition + 8);
        yPosition += 15;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Synergia - Rapport Mensuel ${teamName} - Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-rapport-${teamName}-${monthNames[month]}-${year}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  // ==========================================
  // EXPORT POINTAGES (PDF)
  // ==========================================

  /**
   * Exporter les pointages en PDF
   */
  async exportPointagesToPDF(pointagesData, options = {}) {
    const {
      title = 'Rapport de Pointages',
      employeeName = 'Employé',
      period = 'Ce mois',
      pointages = []
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(...SYNERGIA_COLORS.dark);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA - Pointages', 15, 22);

    doc.setFontSize(12);
    doc.text(`${employeeName} - ${period}`, 15, 33);

    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 60, 22);

    yPosition = 50;

    // Résumé
    const totalHours = pointages.reduce((sum, p) => {
      if (p.clockIn && p.clockOut) {
        const hours = (new Date(p.clockOut) - new Date(p.clockIn)) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    const daysWorked = new Set(pointages.map(p => p.date)).size;
    const avgHoursPerDay = daysWorked > 0 ? (totalHours / daysWorked).toFixed(1) : 0;

    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', 15, yPosition);
    yPosition += 8;

    doc.setFillColor(245, 245, 250);
    doc.roundedRect(15, yPosition, pageWidth - 30, 25, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Jours travaillés: ${daysWorked}`, 25, yPosition + 10);
    doc.text(`Heures totales: ${totalHours.toFixed(1)}h`, 80, yPosition + 10);
    doc.text(`Moyenne/jour: ${avgHoursPerDay}h`, 140, yPosition + 10);

    yPosition += 35;

    // Tableau des pointages
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des Pointages', 15, yPosition);
    yPosition += 8;

    const pointagesTableData = pointages.map(p => {
      const clockIn = p.clockIn ? new Date(p.clockIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
      const clockOut = p.clockOut ? new Date(p.clockOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';

      let duration = '-';
      if (p.clockIn && p.clockOut) {
        const hours = (new Date(p.clockOut) - new Date(p.clockIn)) / (1000 * 60 * 60);
        duration = `${hours.toFixed(1)}h`;
      }

      return [
        p.date || '-',
        clockIn,
        clockOut,
        duration,
        p.status || 'Normal'
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['Date', 'Arrivée', 'Départ', 'Durée', 'Statut']],
      body: pointagesTableData,
      theme: 'striped',
      headStyles: {
        fillColor: SYNERGIA_COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left' }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Synergia - Pointages - Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-pointages-${employeeName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  // ==========================================
  // EXPORT QUÊTES (PDF)
  // ==========================================

  /**
   * Exporter l'historique des quêtes en PDF
   */
  async exportQuestsToPDF(questsData, options = {}) {
    const {
      title = 'Historique des Quêtes',
      userName = 'Utilisateur',
      quests = []
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(...SYNERGIA_COLORS.secondary);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('⚔️ SYNERGIA - Quêtes', 15, 22);

    doc.setFontSize(12);
    doc.text(`${userName}`, 15, 33);

    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 60, 22);

    yPosition = 50;

    // Stats résumé
    const completedQuests = quests.filter(q => q.status === 'completed');
    const totalXP = completedQuests.reduce((sum, q) => sum + (q.xpReward || 0), 0);

    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé', 15, yPosition);
    yPosition += 8;

    doc.setFillColor(245, 245, 250);
    doc.roundedRect(15, yPosition, pageWidth - 30, 20, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quêtes complétées: ${completedQuests.length}/${quests.length}`, 25, yPosition + 12);
    doc.text(`XP Total gagné: ${totalXP} XP`, 100, yPosition + 12);

    yPosition += 30;

    // Liste des quêtes
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des Quêtes', 15, yPosition);
    yPosition += 8;

    const questsTableData = quests.map(q => {
      const status = q.status === 'completed' ? '✅ Terminée' :
                    q.status === 'in_progress' ? '🔄 En cours' : '⏳ En attente';
      const date = q.completedAt?.toDate?.()?.toLocaleDateString('fr-FR') ||
                  q.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || '-';

      return [
        q.title || 'Quête',
        q.difficulty || 'Normal',
        `${q.xpReward || 0} XP`,
        status,
        date
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['Quête', 'Difficulté', 'XP', 'Statut', 'Date']],
      body: questsTableData,
      theme: 'striped',
      headStyles: {
        fillColor: SYNERGIA_COLORS.secondary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50 },
        3: { halign: 'center' }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Synergia - Quêtes - Page ${i}/${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-quetes-${userName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }
}

// Export singleton
export const exportService = new ExportService();
export default exportService;
