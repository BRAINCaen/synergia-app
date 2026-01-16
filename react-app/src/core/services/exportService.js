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

  // ==========================================
  // 📊 EXPORT ANALYTICS ADMIN (PDF STYLISÉ)
  // ==========================================

  /**
   * Exporter les analytics complètes en PDF stylisé pour impression
   */
  async exportAnalyticsToPDF(analyticsData, options = {}) {
    const {
      title = 'Rapport Analytics Complet',
      timeframe = 'Tout le temps'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // ==========================================
    // PAGE 1: HEADER ET MÉTRIQUES CLÉS
    // ==========================================

    // Header avec dégradé simulé (bandes de couleur)
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 48, pageWidth, 4, 'F');

    // Logo et titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA', 15, 28);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Analytics Administration', 15, 40);

    // Date et période
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth - 75, 25);
    doc.text(`Période: ${this.formatTimeframe(timeframe)}`, pageWidth - 75, 35);

    yPosition = 65;

    // Section titre
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Vue d\'ensemble', 15, yPosition);
    yPosition += 15;

    // Cartes métriques principales (4 cartes en ligne)
    const metrics = [
      {
        label: 'Utilisateurs',
        value: analyticsData.users?.total || 0,
        subtext: `+${analyticsData.users?.newThisWeek || 0} cette semaine`,
        color: [59, 130, 246] // Blue
      },
      {
        label: 'Taux Complétion',
        value: `${analyticsData.tasks?.completionRate || 0}%`,
        subtext: `${analyticsData.tasks?.completed || 0} quêtes`,
        color: [34, 197, 94] // Green
      },
      {
        label: 'Badges Attribués',
        value: analyticsData.badges?.awarded || 0,
        subtext: `${analyticsData.badges?.total || 0} disponibles`,
        color: [245, 158, 11] // Amber
      },
      {
        label: 'XP Total Système',
        value: this.formatNumber(analyticsData.gamification?.totalXpSystem || 0),
        subtext: `Niv. moyen: ${analyticsData.gamification?.averageLevel || 1}`,
        color: [139, 92, 246] // Purple
      }
    ];

    const cardWidth = (pageWidth - 40) / 4;
    const cardHeight = 35;

    metrics.forEach((metric, index) => {
      const x = 15 + (index * (cardWidth + 5));

      // Fond de carte
      doc.setFillColor(...metric.color);
      doc.roundedRect(x, yPosition, cardWidth - 3, cardHeight, 3, 3, 'F');

      // Texte
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.label, x + 5, yPosition + 10);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(String(metric.value), x + 5, yPosition + 22);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(metric.subtext, x + 5, yPosition + 30);
    });

    yPosition += cardHeight + 20;

    // ==========================================
    // SECTION UTILISATEURS
    // ==========================================
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('👥 Analyse des Utilisateurs', 15, yPosition);
    yPosition += 10;

    // Stats utilisateurs en grille
    const userStats = [
      ['Total', analyticsData.users?.total || 0],
      ['Actifs', analyticsData.users?.active || 0],
      ['Nouveaux aujourd\'hui', analyticsData.users?.newToday || 0],
      ['Nouveaux semaine', analyticsData.users?.newThisWeek || 0],
      ['Taux rétention', `${analyticsData.users?.retention || 0}%`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: userStats,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'center' }
      },
      tableWidth: 85,
      margin: { left: 15 }
    });

    // Top 10 utilisateurs
    yPosition = doc.lastAutoTable.finalY + 15;

    if (analyticsData.users?.list?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🏆 Top 10 Utilisateurs', 15, yPosition);
      yPosition += 8;

      const topUsers = (analyticsData.users?.list || []).slice(0, 10).map((user, index) => [
        `${index + 1}`,
        user.name || 'Sans nom',
        `Niv. ${user.level || 1}`,
        this.formatNumber(user.xp || 0),
        user.tasksCompleted || 0,
        user.badges || 0
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Utilisateur', 'Niveau', 'XP', 'Quêtes', 'Badges']],
        body: topUsers,
        theme: 'striped',
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 45 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' }
        }
      });
    }

    // ==========================================
    // PAGE 2: QUÊTES ET PROJETS
    // ==========================================
    doc.addPage();
    yPosition = 20;

    // Header page 2
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA - Analytics (suite)', 15, 17);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page 2`, pageWidth - 30, 17);

    yPosition = 35;

    // Section Quêtes
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('⚔️ Analyse des Quêtes', 15, yPosition);
    yPosition += 10;

    const taskStats = [
      ['Total', analyticsData.tasks?.total || 0],
      ['Accomplies', analyticsData.tasks?.completed || 0],
      ['En cours', analyticsData.tasks?.inProgress || 0],
      ['En attente', analyticsData.tasks?.pending || 0],
      ['Taux complétion', `${analyticsData.tasks?.completionRate || 0}%`],
      ['XP moyen/quête', analyticsData.tasks?.averageXp || 0],
      ['XP total distribué', this.formatNumber(analyticsData.tasks?.totalXpAwarded || 0)]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: taskStats,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'center' }
      },
      tableWidth: 90,
      margin: { left: 15 }
    });

    // Top contributeurs quêtes
    yPosition = doc.lastAutoTable.finalY + 15;

    if (analyticsData.tasks?.byUser?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🎯 Top Contributeurs', 15, yPosition);
      yPosition += 8;

      const topContributors = (analyticsData.tasks?.byUser || []).slice(0, 10).map((user) => {
        const rate = user.total > 0 ? Math.round((user.completed / user.total) * 100) : 0;
        return [
          user.userName || 'Inconnu',
          user.total || 0,
          user.completed || 0,
          `${rate}%`,
          this.formatNumber(user.xp || 0)
        ];
      });

      doc.autoTable({
        startY: yPosition,
        head: [['Utilisateur', 'Total', 'Complétées', 'Taux', 'XP']],
        body: topContributors,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' }
        }
      });
    }

    // Section Projets
    yPosition = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📁 Analyse des Projets', 15, yPosition);
    yPosition += 10;

    const projectStats = [
      ['Total projets', analyticsData.projects?.total || 0],
      ['Actifs', analyticsData.projects?.active || 0],
      ['Terminés', analyticsData.projects?.completed || 0],
      ['En pause', analyticsData.projects?.paused || 0],
      ['Taux complétion', `${analyticsData.projects?.completionRate || 0}%`]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: projectStats,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'center' }
      },
      tableWidth: 85,
      margin: { left: 15 }
    });

    // ==========================================
    // PAGE 3: GAMIFICATION & BADGES
    // ==========================================
    doc.addPage();
    yPosition = 20;

    // Header page 3
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNERGIA - Gamification & Badges', 15, 17);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page 3`, pageWidth - 30, 17);

    yPosition = 35;

    // Section Gamification
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🎮 Statistiques Gamification', 15, yPosition);
    yPosition += 10;

    const gamificationStats = [
      ['XP Total Système', this.formatNumber(analyticsData.gamification?.totalXpSystem || 0)],
      ['Niveau Moyen', analyticsData.gamification?.averageLevel || 1],
      ['XP Moyen par Quête', analyticsData.tasks?.averageXp || 0]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: gamificationStats,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'center' }
      },
      tableWidth: 90,
      margin: { left: 15 }
    });

    // Distribution des niveaux
    yPosition = doc.lastAutoTable.finalY + 15;

    if (analyticsData.gamification?.levelDistribution) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('📈 Distribution des Niveaux', 15, yPosition);
      yPosition += 8;

      const levelData = Object.entries(analyticsData.gamification.levelDistribution)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([level, count]) => {
          const percentage = analyticsData.users?.total > 0
            ? Math.round((count / analyticsData.users.total) * 100)
            : 0;
          return [`Niveau ${level}`, count, `${percentage}%`];
        });

      doc.autoTable({
        startY: yPosition,
        head: [['Niveau', 'Utilisateurs', '%']],
        body: levelData,
        theme: 'striped',
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' }
        },
        tableWidth: 90,
        margin: { left: 15 }
      });
    }

    // Section Badges
    yPosition = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🏆 Analyse des Badges', 15, yPosition);
    yPosition += 10;

    const badgeStats = [
      ['Badges disponibles', analyticsData.badges?.total || 0],
      ['Badges attribués', analyticsData.badges?.awarded || 0],
      ['Moyenne par utilisateur', analyticsData.users?.total > 0
        ? Math.round(analyticsData.badges?.awarded / analyticsData.users.total)
        : 0]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: badgeStats,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'center' }
      },
      tableWidth: 85,
      margin: { left: 15 }
    });

    // Top badges
    yPosition = doc.lastAutoTable.finalY + 15;

    if (analyticsData.badges?.popular?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('⭐ Badges les Plus Attribués', 15, yPosition);
      yPosition += 8;

      const topBadges = (analyticsData.badges?.popular || []).slice(0, 10).map((badge) => [
        badge.icon || '🏅',
        badge.name || 'Badge',
        badge.rarity || 'common',
        badge.earnedCount || 0
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['', 'Badge', 'Rareté', 'Attribués']],
        body: topBadges,
        theme: 'striped',
        headStyles: {
          fillColor: [245, 158, 11],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 45, fontStyle: 'bold' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' }
        }
      });
    }

    // ==========================================
    // FOOTER SUR TOUTES LES PAGES
    // ==========================================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Ligne de séparation footer
      doc.setDrawColor(200, 200, 200);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `SYNERGIA - Rapport Analytics Complet - Page ${i}/${pageCount}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: 'center' }
      );
    }

    // Sauvegarder
    const fileName = `synergia-analytics-complete-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Exporter les données de la cagnotte d'équipe en PDF
   */
  async exportTeamPoolToPDF(poolData, options = {}) {
    const {
      stats = {},
      contributions = [],
      withdrawals = [],
      challenges = []
    } = poolData;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(245, 158, 11); // Amber
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 43, pageWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 SYNERGIA', 15, 25);

    doc.setFontSize(12);
    doc.text('Rapport Cagnotte d\'Équipe', 15, 37);

    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 60, 25);

    yPosition = 60;

    // Métriques principales
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Vue d\'ensemble', 15, yPosition);
    yPosition += 12;

    const poolStats = [
      ['XP Total Cagnotte', this.formatNumber(stats.totalXP || 0)],
      ['Contributions', stats.contributionsCount || 0],
      ['Retraits', stats.withdrawalsCount || 0],
      ['Défis Complétés', stats.challengesCompleted || 0],
      ['Contributeurs Actifs', stats.activeContributors || 0]
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: poolStats,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'center' }
      },
      tableWidth: 105,
      margin: { left: 15 }
    });

    // Contributions récentes
    yPosition = doc.lastAutoTable.finalY + 20;

    if (contributions.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('📥 Dernières Contributions', 15, yPosition);
      yPosition += 8;

      const contribData = contributions.slice(0, 15).map(c => [
        c.userName || 'Anonyme',
        `+${c.amount || 0} XP`,
        c.reason || '-',
        new Date(c.date?.toDate?.() || c.date || Date.now()).toLocaleDateString('fr-FR')
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Contributeur', 'Montant', 'Raison', 'Date']],
        body: contribData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `SYNERGIA - Cagnotte Équipe - Page ${i}/${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-cagnotte-equipe-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Exporter les paramètres de configuration en PDF
   */
  async exportSettingsToPDF(configData, options = {}) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('⚙️ SYNERGIA', 15, 25);

    doc.setFontSize(12);
    doc.text('Configuration Système', 15, 35);

    doc.setFontSize(10);
    doc.text(`Export: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 55, 25);

    yPosition = 55;

    // Sections de configuration
    const sections = Object.entries(configData);

    sections.forEach(([sectionName, sectionData]) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`📋 ${sectionName}`, 15, yPosition);
      yPosition += 8;

      if (typeof sectionData === 'object' && sectionData !== null) {
        const configRows = Object.entries(sectionData).map(([key, value]) => {
          let displayValue = value;
          if (typeof value === 'boolean') displayValue = value ? 'Oui' : 'Non';
          else if (typeof value === 'object') displayValue = JSON.stringify(value);
          return [key, String(displayValue)];
        });

        if (configRows.length > 0) {
          doc.autoTable({
            startY: yPosition,
            head: [['Paramètre', 'Valeur']],
            body: configRows,
            theme: 'striped',
            headStyles: {
              fillColor: [99, 102, 241],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 8
            },
            styles: {
              fontSize: 8,
              cellPadding: 3
            },
            columnStyles: {
              0: { cellWidth: 60, fontStyle: 'bold' },
              1: { cellWidth: 'auto' }
            }
          });

          yPosition = doc.lastAutoTable.finalY + 15;
        }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `SYNERGIA - Configuration - Page ${i}/${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-config-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  // ==========================================
  // EXPORT DONNÉES GÉNÉRIQUES (PDF)
  // ==========================================

  /**
   * Exporter des données génériques en PDF (backup, sync, etc.)
   */
  async exportGenericDataToPDF(data, options = {}) {
    const {
      title = 'Export Données',
      subtitle = 'Synergia',
      fileName = 'synergia-export'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 SYNERGIA', 15, 25);

    doc.setFontSize(12);
    doc.text(title, 15, 35);

    doc.setFontSize(10);
    doc.text(`Export: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 55, 25);

    yPosition = 55;

    // Parcourir les données
    const processData = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Section header
          doc.setTextColor(99, 102, 241);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`📋 ${key}`, 15, yPosition);
          yPosition += 8;

          const entries = Object.entries(value);
          if (entries.length > 0) {
            const tableData = entries.map(([k, v]) => {
              let displayValue = v;
              if (typeof v === 'boolean') displayValue = v ? 'Oui' : 'Non';
              else if (typeof v === 'object') displayValue = JSON.stringify(v).substring(0, 50) + '...';
              else if (v === null || v === undefined) displayValue = '-';
              return [k, String(displayValue)];
            });

            doc.autoTable({
              startY: yPosition,
              head: [['Paramètre', 'Valeur']],
              body: tableData,
              theme: 'striped',
              headStyles: {
                fillColor: [99, 102, 241],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8
              },
              styles: {
                fontSize: 8,
                cellPadding: 2
              },
              columnStyles: {
                0: { cellWidth: 50, fontStyle: 'bold' },
                1: { cellWidth: 'auto' }
              }
            });

            yPosition = doc.lastAutoTable.finalY + 10;
          }
        } else if (Array.isArray(value) && value.length > 0) {
          doc.setTextColor(34, 197, 94);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`📋 ${key} (${value.length} éléments)`, 15, yPosition);
          yPosition += 8;

          // Si c'est un tableau d'objets, créer un tableau
          if (typeof value[0] === 'object') {
            const headers = Object.keys(value[0]).slice(0, 5);
            const tableData = value.slice(0, 20).map(item =>
              headers.map(h => {
                let val = item[h];
                if (typeof val === 'object') val = JSON.stringify(val).substring(0, 20);
                return String(val || '-').substring(0, 30);
              })
            );

            doc.autoTable({
              startY: yPosition,
              head: [headers],
              body: tableData,
              theme: 'striped',
              headStyles: {
                fillColor: [34, 197, 94],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7
              },
              styles: {
                fontSize: 7,
                cellPadding: 2
              }
            });

            yPosition = doc.lastAutoTable.finalY + 10;
          }
        }
      });
    };

    processData(data);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `SYNERGIA - ${title} - Page ${i}/${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const finalFileName = `${fileName}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(finalFileName);

    return { success: true, fileName: finalFileName };
  }

  /**
   * Exporter l'historique XP en PDF
   */
  async exportHistoryToPDF(historyData, options = {}) {
    const {
      title = 'Historique Complet',
      userName = 'Admin'
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(139, 92, 246); // Purple
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('🔮 SYNERGIA', 15, 25);

    doc.setFontSize(12);
    doc.text('Historique des Actions', 15, 37);

    doc.setFontSize(10);
    doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 60, 25);
    doc.text(`Total: ${historyData.length} événements`, pageWidth - 60, 35);

    yPosition = 60;

    // Résumé
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Résumé', 15, yPosition);
    yPosition += 10;

    // Compter par type
    const typeCounts = historyData.reduce((acc, item) => {
      const type = item.type || 'autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const summaryData = Object.entries(typeCounts).map(([type, count]) => [type, count]);

    doc.autoTable({
      startY: yPosition,
      head: [['Type', 'Nombre']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'center' }
      },
      tableWidth: 85,
      margin: { left: 15 }
    });

    // Détails
    yPosition = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 Détails des Événements', 15, yPosition);
    yPosition += 8;

    const eventData = historyData.slice(0, 50).map((item) => {
      const date = item.timestamp?.toDate?.()?.toLocaleDateString('fr-FR') ||
                  item.date?.toDate?.()?.toLocaleDateString('fr-FR') ||
                  new Date(item.timestamp || item.date).toLocaleDateString('fr-FR') || '-';
      return [
        date,
        item.type || 'action',
        item.userName || item.user || '-',
        item.description || item.details || '-'
      ];
    });

    doc.autoTable({
      startY: yPosition,
      head: [['Date', 'Type', 'Utilisateur', 'Détails']],
      body: eventData,
      theme: 'striped',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 'auto' }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `SYNERGIA - Historique - Page ${i}/${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const fileName = `synergia-historique-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  }

  // ==========================================
  // EXPORT FEEDBACK 360° PDF
  // ==========================================

  /**
   * Générer un rapport PDF de feedback 360°
   * @param {Object} interview - Données de l'entretien 360°
   * @param {Object} subjectUser - Utilisateur concerné par le feedback
   * @returns {Object} - { success, blob, fileName }
   */
  async exportFeedback360ToPDF(interview, subjectUser) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // ==========================================
    // HEADER
    // ==========================================
    doc.setFillColor(...SYNERGIA_COLORS.dark);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FEEDBACK 360°', 15, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rapport d'évaluation - ${interview.title || 'Entretien'}`, 15, 38);

    // Date et logo
    doc.setFontSize(10);
    doc.text('SYNERGIA', pageWidth - 40, 20);
    const completedDate = interview.completedAt?.toDate?.() || new Date();
    doc.text(`Complété le ${completedDate.toLocaleDateString('fr-FR')}`, pageWidth - 65, 35);

    yPosition = 60;

    // ==========================================
    // INFORMATIONS COLLABORATEUR
    // ==========================================
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPosition, pageWidth - 30, 35, 3, 3, 'F');

    doc.setTextColor(...SYNERGIA_COLORS.primary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(subjectUser?.displayName || interview.subjectName || 'Collaborateur', 25, yPosition + 15);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${subjectUser?.email || 'N/A'}`, 25, yPosition + 25);

    // Stats résumé à droite
    const responses = interview.feedbackResponses || [];
    const avgScore = responses.length > 0
      ? (responses.reduce((acc, r) => {
          const scores = Object.values(r.ratings || {});
          return acc + (scores.reduce((a, b) => a + b, 0) / scores.length);
        }, 0) / responses.length).toFixed(1)
      : 'N/A';

    doc.setTextColor(...SYNERGIA_COLORS.success);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${avgScore}/5`, pageWidth - 45, yPosition + 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Score moyen', pageWidth - 50, yPosition + 28);

    yPosition += 45;

    // ==========================================
    // SYNTHÈSE DES FORCES ET AXES D'AMÉLIORATION
    // ==========================================
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('💪 Forces identifiées', 15, yPosition);
    yPosition += 8;

    // Calculer les forces (scores >= 4) et axes d'amélioration (scores <= 2)
    const criteriaScores = {};
    responses.forEach(response => {
      Object.entries(response.ratings || {}).forEach(([criterion, score]) => {
        if (!criteriaScores[criterion]) {
          criteriaScores[criterion] = { total: 0, count: 0 };
        }
        criteriaScores[criterion].total += score;
        criteriaScores[criterion].count += 1;
      });
    });

    const criteriaAverages = Object.entries(criteriaScores).map(([criterion, data]) => ({
      criterion,
      average: data.total / data.count
    })).sort((a, b) => b.average - a.average);

    const strengths = criteriaAverages.filter(c => c.average >= 4);
    const improvements = criteriaAverages.filter(c => c.average < 3);

    // Afficher les forces
    doc.setFillColor(220, 252, 231); // Green light
    doc.roundedRect(15, yPosition, pageWidth - 30, Math.max(25, strengths.length * 8 + 10), 3, 3, 'F');
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 101, 52); // Green dark

    if (strengths.length > 0) {
      strengths.forEach(s => {
        doc.text(`✓ ${this.formatCriterionLabel(s.criterion)} (${s.average.toFixed(1)}/5)`, 25, yPosition);
        yPosition += 7;
      });
    } else {
      doc.text('Pas de force particulière identifiée (scores < 4)', 25, yPosition);
      yPosition += 7;
    }

    yPosition += 10;

    // Axes d'amélioration
    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📈 Axes d\'amélioration', 15, yPosition);
    yPosition += 8;

    doc.setFillColor(254, 243, 199); // Amber light
    doc.roundedRect(15, yPosition, pageWidth - 30, Math.max(25, improvements.length * 8 + 10), 3, 3, 'F');
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(146, 64, 14); // Amber dark

    if (improvements.length > 0) {
      improvements.forEach(i => {
        doc.text(`→ ${this.formatCriterionLabel(i.criterion)} (${i.average.toFixed(1)}/5)`, 25, yPosition);
        yPosition += 7;
      });
    } else {
      doc.text('Aucun axe critique identifié (tous scores >= 3)', 25, yPosition);
      yPosition += 7;
    }

    yPosition += 15;

    // ==========================================
    // DÉTAIL DES SCORES PAR CRITÈRE
    // ==========================================
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Détail des scores par critère', 15, yPosition);
    yPosition += 10;

    const tableData = criteriaAverages.map(c => [
      this.formatCriterionLabel(c.criterion),
      c.average.toFixed(1) + '/5',
      this.getProgressBar(c.average * 20),
      c.average >= 4 ? '★ Force' : c.average < 3 ? '⚠ À améliorer' : 'Correct'
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [['Critère', 'Score', 'Progression', 'Évaluation']],
      body: tableData,
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
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 60 },
        3: { cellWidth: 35, halign: 'center' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // ==========================================
    // COMMENTAIRES DES ÉVALUATEURS
    // ==========================================
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(...SYNERGIA_COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('💬 Commentaires des évaluateurs', 15, yPosition);
    yPosition += 10;

    responses.forEach((response, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Cadre commentaire
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, yPosition, pageWidth - 30, 30, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...SYNERGIA_COLORS.primary);
      doc.text(`Évaluateur ${index + 1}`, 20, yPosition + 8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const comment = response.generalComment || response.comments || 'Pas de commentaire';
      const truncatedComment = comment.length > 150 ? comment.substring(0, 150) + '...' : comment;
      doc.text(truncatedComment, 20, yPosition + 18, { maxWidth: pageWidth - 50 });

      yPosition += 35;
    });

    // ==========================================
    // FOOTER
    // ==========================================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `SYNERGIA - Feedback 360° - Confidentiel - Page ${i}/${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Générer le blob pour stockage
    const pdfBlob = doc.output('blob');
    const fileName = `feedback360-${subjectUser?.displayName || 'user'}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      success: true,
      blob: pdfBlob,
      fileName,
      doc // Pour permettre le téléchargement direct si besoin
    };
  }

  /**
   * Formater le label d'un critère
   */
  formatCriterionLabel(criterion) {
    const labels = {
      communication: 'Communication',
      collaboration: 'Collaboration',
      performance: 'Performance',
      initiative: 'Initiative',
      adaptability: 'Adaptabilité',
      leadership: 'Leadership',
      technical: 'Compétences techniques',
      organization: 'Organisation',
      creativity: 'Créativité',
      reliability: 'Fiabilité'
    };
    return labels[criterion] || criterion.charAt(0).toUpperCase() + criterion.slice(1);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Formater un nombre avec séparateurs
   */
  formatNumber(num) {
    return num?.toLocaleString('fr-FR') || '0';
  }

  /**
   * Formater la période temporelle
   */
  formatTimeframe(timeframe) {
    const labels = {
      'today': 'Aujourd\'hui',
      'week': '7 derniers jours',
      'month': '30 derniers jours',
      'all': 'Tout le temps'
    };
    return labels[timeframe] || timeframe;
  }
}

// Export singleton
export const exportService = new ExportService();
export default exportService;
