// ==========================================
// 📁 components/hr/tabs/PayrollTab.jsx
// ONGLET PAIE - EXPORT ET VALIDATION SIGNATURE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, Clock, Calendar, FileText, Users, CheckCircle,
  AlertTriangle, RefreshCw, X, ChevronRight, ChevronDown, Send,
  Printer, Bell, Info, Pen, PenTool, AlertOctagon, CheckSquare, Square,
  FileSpreadsheet, Loader2
} from 'lucide-react';
import { db } from '../../../core/firebase.js';
import {
  doc, getDoc, setDoc, updateDoc, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
import timesheetExportService, { MONTHS_FR, exportPayrollComplete } from '../../../core/services/timesheetExportService.js';
import notificationService from '../../../core/services/notificationService.js';
import UserAvatar from '../../common/UserAvatar.jsx';
import GlassCard from '../GlassCard.jsx';
import SignatureCanvas from '../SignatureCanvas.jsx';

const PayrollTab = ({ employees, timesheets, leaves, companyName, onRefresh, currentUser, isAdmin }) => {
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [exportSuccess, setExportSuccess] = useState(null);

  // États pour la validation par signature
  const [validationPeriods, setValidationPeriods] = useState([]);
  const [loadingValidations, setLoadingValidations] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [showValidationPanel, setShowValidationPanel] = useState(true);
  const [notifying, setNotifying] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Générer la liste des années disponibles
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push(y);
  }

  // Charger les périodes de validation
  useEffect(() => {
    const loadValidationPeriods = async () => {
      try {
        setLoadingValidations(true);
        const periodId = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

        const validationRef = doc(db, 'timesheetValidations', periodId);
        const validationDoc = await getDoc(validationRef);

        if (validationDoc.exists()) {
          setValidationPeriods([{ id: validationDoc.id, ...validationDoc.data() }]);
        } else {
          setValidationPeriods([{
            id: periodId,
            month: selectedMonth,
            year: selectedYear,
            status: 'draft',
            employeeSignatures: {},
            createdAt: new Date()
          }]);
        }
      } catch (error) {
        console.error('Erreur chargement validations:', error);
      } finally {
        setLoadingValidations(false);
      }
    };

    loadValidationPeriods();
  }, [selectedMonth, selectedYear]);

  // Demander validation aux employés
  const handleRequestValidation = async () => {
    const isReminder = validationPeriods.length > 0 && validationPeriods[0].status === 'pending_validation';
    const actionLabel = isReminder ? 'Relancer les non-signés' : 'Demander validation';

    if (!confirm(`${actionLabel} pour ${MONTHS_FR[selectedMonth]} ${selectedYear} ?`)) return;

    try {
      setNotifying(true);
      const periodId = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

      let targetEmployees = employees;
      if (isReminder && validationPeriods[0]?.employeeSignatures) {
        targetEmployees = employees.filter(emp =>
          validationPeriods[0].employeeSignatures[emp.id]?.status !== 'signed'
        );
      }

      const employeeSignatures = {};
      employees.forEach(emp => {
        if (isReminder && validationPeriods[0]?.employeeSignatures?.[emp.id]?.status === 'signed') {
          employeeSignatures[emp.id] = validationPeriods[0].employeeSignatures[emp.id];
        } else {
          employeeSignatures[emp.id] = {
            status: 'pending',
            requestedAt: new Date().toISOString(),
            signature: null,
            signedAt: null
          };
        }
      });

      await setDoc(doc(db, 'timesheetValidations', periodId), {
        month: selectedMonth,
        year: selectedYear,
        status: 'pending_validation',
        employeeSignatures,
        requestedBy: currentUser?.uid,
        requestedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });

      const requesterName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Le gestionnaire';
      await notificationService.notifyTimesheetValidationRequired({
        periodId,
        month: selectedMonth,
        year: selectedYear,
        monthLabel: MONTHS_FR[selectedMonth],
        employees: targetEmployees,
        requestedByName: requesterName,
        isReminder
      });

      const successMsg = isReminder
        ? `🚨 RAPPEL envoyé à ${targetEmployees.length} employé(s) !`
        : `✅ Demande de validation envoyée à ${targetEmployees.length} employé(s) !`;
      setExportSuccess(successMsg);
      setTimeout(() => setExportSuccess(null), 5000);

      setValidationPeriods([{
        id: periodId,
        month: selectedMonth,
        year: selectedYear,
        status: 'pending_validation',
        employeeSignatures,
        requestedAt: new Date()
      }]);
    } catch (error) {
      console.error('Erreur notification:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setNotifying(false);
    }
  };

  // Signer les pointages
  const handleSignTimesheet = async (signatureData) => {
    if (!currentUser?.uid || !selectedValidation) return;

    try {
      const periodId = selectedValidation.id;
      const validationRef = doc(db, 'timesheetValidations', periodId);

      const updatedSignatures = {
        ...selectedValidation.employeeSignatures,
        [currentUser.uid]: {
          status: 'signed',
          signature: signatureData,
          signedAt: new Date().toISOString(),
          signedByName: currentUser.displayName || currentUser.email
        }
      };

      const allSigned = Object.values(updatedSignatures).every(s => s.status === 'signed');
      const newStatus = allSigned ? 'ready_for_payroll' : 'pending_validation';

      await updateDoc(validationRef, {
        employeeSignatures: updatedSignatures,
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      setShowSignatureModal(false);
      setSelectedValidation(null);
      setExportSuccess('✅ Vos pointages ont été signés avec succès !');
      setTimeout(() => setExportSuccess(null), 5000);

      setValidationPeriods([{
        ...selectedValidation,
        employeeSignatures: updatedSignatures,
        status: newStatus
      }]);

      const managerId = selectedValidation.requestedBy;
      const employeeName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Un employé';
      const totalEmployees = Object.keys(updatedSignatures).length;

      if (allSigned) {
        await notificationService.notifyAllTimesheetsSigned({
          month: selectedMonth,
          year: selectedYear,
          monthLabel: MONTHS_FR[selectedMonth],
          managerId,
          totalEmployees
        });
      } else if (managerId) {
        await notificationService.notifyTimesheetSigned({
          employeeId: currentUser.uid,
          employeeName,
          month: selectedMonth,
          year: selectedYear,
          monthLabel: MONTHS_FR[selectedMonth],
          managerId
        });
      }
    } catch (error) {
      console.error('Erreur signature:', error);
      alert('Erreur lors de la signature: ' + error.message);
    }
  };

  // Envoyer à la paie
  const handleSendToPayroll = async () => {
    const validation = validationPeriods[0];
    if (!validation || validation.status !== 'ready_for_payroll') {
      alert('Tous les employés doivent avoir signé avant l\'envoi à la paie.');
      return;
    }

    if (!confirm('Confirmer l\'envoi à la paie ? Les pointages seront verrouillés.')) return;

    try {
      setExporting(true);
      const periodId = validation.id;

      await updateDoc(doc(db, 'timesheetValidations', periodId), {
        status: 'sent_to_payroll',
        sentToPayrollAt: serverTimestamp(),
        sentBy: currentUser?.uid
      });

      await handleExportPayrollComplete();

      setValidationPeriods([{
        ...validation,
        status: 'sent_to_payroll',
        sentToPayrollAt: new Date()
      }]);

      setExportSuccess('✅ Pointages envoyés à la paie avec succès !');
    } catch (error) {
      console.error('Erreur envoi paie:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Modifier un pointage
  const handleEditTimeEntry = async (entry, newData) => {
    try {
      const entryRef = doc(db, 'timeEntries', entry.id);
      await updateDoc(entryRef, {
        ...newData,
        modifiedBy: currentUser?.uid,
        modifiedAt: serverTimestamp(),
        originalData: entry
      });

      setShowEditModal(false);
      setEditingEntry(null);
      setExportSuccess('✅ Pointage modifié avec succès !');
      setTimeout(() => setExportSuccess(null), 3000);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur modification:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // Ajouter un pointage manquant
  const handleAddMissingEntry = async (employeeId, date, startTime, endTime) => {
    try {
      await addDoc(collection(db, 'timeEntries'), {
        userId: employeeId,
        date: new Date(date),
        timestamp: new Date(`${date}T${startTime}`),
        type: 'arrival',
        status: 'active',
        addedManually: true,
        addedBy: currentUser?.uid,
        createdAt: serverTimestamp()
      });

      if (endTime) {
        await addDoc(collection(db, 'timeEntries'), {
          userId: employeeId,
          date: new Date(date),
          timestamp: new Date(`${date}T${endTime}`),
          type: 'departure',
          status: 'active',
          addedManually: true,
          addedBy: currentUser?.uid,
          createdAt: serverTimestamp()
        });
      }

      setExportSuccess('✅ Pointage ajouté avec succès !');
      setTimeout(() => setExportSuccess(null), 3000);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur ajout:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // Obtenir le statut de validation pour l'utilisateur courant
  const getCurrentUserValidationStatus = () => {
    if (!validationPeriods.length || !currentUser?.uid) return null;
    const validation = validationPeriods[0];
    return validation.employeeSignatures?.[currentUser.uid];
  };

  // Calculer les stats de validation
  const getValidationStats = () => {
    if (!validationPeriods.length) return { total: 0, signed: 0, pending: 0 };
    const validation = validationPeriods[0];
    const signatures = Object.values(validation.employeeSignatures || {});
    return {
      total: signatures.length,
      signed: signatures.filter(s => s.status === 'signed').length,
      pending: signatures.filter(s => s.status === 'pending').length
    };
  };

  const validationStats = getValidationStats();
  const currentUserStatus = getCurrentUserValidationStatus();
  const currentValidation = validationPeriods[0];

  // Exporter en Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      setExportSuccess(null);

      const options = {
        employeeId: selectedEmployee === 'all' ? null : selectedEmployee,
        companyName: companyName || 'Entreprise'
      };

      const result = await timesheetExportService.exportMonthlyTimesheet(
        selectedYear,
        selectedMonth,
        options
      );

      if (result.success) {
        setExportSuccess(`Export généré: ${result.fileName}`);
        setTimeout(() => setExportSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Export Paie Complet
  const handleExportPayrollComplete = async () => {
    try {
      setExporting(true);
      setExportSuccess(null);

      const result = await exportPayrollComplete(
        selectedYear,
        selectedMonth,
        { companyName: companyName || 'Synergia' }
      );

      if (result.success) {
        setExportSuccess(`Export Paie Complet généré: ${result.fileName}`);
        setTimeout(() => setExportSuccess(null), 5000);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Erreur export paie complet:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Exporter en CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);

      const monthStart = new Date(selectedYear, selectedMonth, 1);
      const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Employé;Date;Heure Début;Heure Fin;Heures Travaillées;Type\n";

      const employeesToExport = selectedEmployee === 'all'
        ? employees
        : employees.filter(e => e.id === selectedEmployee);

      for (const emp of employeesToExport) {
        const empTimesheets = timesheets.filter(t =>
          t.userId === emp.id &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
        );

        for (const ts of empTimesheets) {
          const hours = ts.endTime && ts.startTime
            ? ((new Date(`2000-01-01T${ts.endTime}`) - new Date(`2000-01-01T${ts.startTime}`)) / 3600000).toFixed(2)
            : '0';
          csvContent += `${emp.firstName} ${emp.lastName};${ts.date};${ts.startTime || ''};${ts.endTime || ''};${hours};Pointage\n`;
        }

        const empLeaves = leaves?.filter(l =>
          l.userId === emp.id &&
          l.status === 'approved' &&
          new Date(l.startDate) <= monthEnd &&
          new Date(l.endDate) >= monthStart
        ) || [];

        for (const leave of empLeaves) {
          csvContent += `${emp.firstName} ${emp.lastName};${leave.startDate};-;-;${leave.days || 1};${leave.type}\n`;
        }
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `export_paie_${MONTHS_FR[selectedMonth]}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess('Export CSV téléchargé !');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Imprimer
  const handlePrint = () => {
    const monthName = MONTHS_FR[selectedMonth];
    const printContent = `
      <html>
        <head>
          <title>Export Paie - ${monthName} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a5568; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .total { font-weight: bold; background-color: #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Récapitulatif Paie - ${monthName} ${selectedYear}</h1>
            <p>${companyName || 'Entreprise'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Jours travaillés</th>
                <th>Heures totales</th>
                <th>Congés pris</th>
                <th>RTT pris</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => {
                const empTimesheets = timesheets.filter(t => t.userId === emp.id);
                const totalHours = empTimesheets.reduce((sum, t) => {
                  if (t.startTime && t.endTime) {
                    const diff = (new Date(`2000-01-01T${t.endTime}`) - new Date(`2000-01-01T${t.startTime}`)) / 3600000;
                    return sum + diff;
                  }
                  return sum;
                }, 0);
                const cpLeaves = leaves?.filter(l => l.userId === emp.id && l.type === 'cp' && l.status === 'approved').length || 0;
                const rttLeaves = leaves?.filter(l => l.userId === emp.id && l.type === 'rtt' && l.status === 'approved').length || 0;
                return `
                  <tr>
                    <td>${emp.firstName} ${emp.lastName}</td>
                    <td>${empTimesheets.length}</td>
                    <td>${totalHours.toFixed(1)}h</td>
                    <td>${cpLeaves}j</td>
                    <td>${rttLeaves}j</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <motion.div
      key="payroll"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Section Validation */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <PenTool className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Validation des Pointages</h2>
              <p className="text-gray-400 text-sm">Signature électronique pour {MONTHS_FR[selectedMonth]} {selectedYear}</p>
            </div>
          </div>
          <button
            onClick={() => setShowValidationPanel(!showValidationPanel)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showValidationPanel ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </button>
        </div>

        <AnimatePresence>
          {showValidationPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Statut de validation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  currentValidation?.status === 'draft' ? 'bg-gray-500/20 border-gray-500/30' :
                  currentValidation?.status === 'pending_validation' ? 'bg-orange-500/20 border-orange-500/30' :
                  currentValidation?.status === 'ready_for_payroll' ? 'bg-green-500/20 border-green-500/30' :
                  currentValidation?.status === 'sent_to_payroll' ? 'bg-blue-500/20 border-blue-500/30' :
                  'bg-gray-500/20 border-gray-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {currentValidation?.status === 'draft' && <FileText className="w-5 h-5 text-gray-400" />}
                    {currentValidation?.status === 'pending_validation' && <Clock className="w-5 h-5 text-orange-400" />}
                    {currentValidation?.status === 'ready_for_payroll' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {currentValidation?.status === 'sent_to_payroll' && <Send className="w-5 h-5 text-blue-400" />}
                    <span className="text-sm font-medium text-white">Statut</span>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {currentValidation?.status === 'draft' && 'Brouillon'}
                    {currentValidation?.status === 'pending_validation' && 'En attente'}
                    {currentValidation?.status === 'ready_for_payroll' && 'Prêt'}
                    {currentValidation?.status === 'sent_to_payroll' && 'Envoyé'}
                    {!currentValidation?.status && 'Non initié'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Employés</span>
                  </div>
                  <p className="text-lg font-bold text-white">{validationStats.total}</p>
                </div>

                <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-white">Signés</span>
                  </div>
                  <p className="text-lg font-bold text-white">{validationStats.signed}</p>
                </div>

                <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Square className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-medium text-white">En attente</span>
                  </div>
                  <p className="text-lg font-bold text-white">{validationStats.pending}</p>
                </div>
              </div>

              {/* Actions selon le rôle */}
              {isAdmin ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {currentValidation?.status === 'draft' || !currentValidation?.status ? (
                      <button
                        onClick={handleRequestValidation}
                        disabled={notifying}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium"
                      >
                        {notifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4" />
                            Demander validation aux employés
                          </>
                        )}
                      </button>
                    ) : currentValidation?.status === 'ready_for_payroll' ? (
                      <button
                        onClick={handleSendToPayroll}
                        disabled={exporting}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium"
                      >
                        {exporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Envoyer à la paie
                          </>
                        )}
                      </button>
                    ) : currentValidation?.status === 'sent_to_payroll' ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 font-medium">Envoyé à la paie le {new Date(currentValidation.sentToPayrollAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ) : null}

                    {currentValidation?.status === 'pending_validation' && (
                      <button
                        onClick={handleRequestValidation}
                        disabled={notifying}
                        className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Relancer les non-signés
                      </button>
                    )}
                  </div>

                  {/* Liste des employés et leur statut de signature */}
                  {currentValidation?.employeeSignatures && (
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        Statut des signatures
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {employees.map(emp => {
                          const sig = currentValidation.employeeSignatures[emp.id];
                          return (
                            <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  user={{
                                    ...emp,
                                    displayName: `${emp.firstName} ${emp.lastName}`
                                  }}
                                  size="sm"
                                  showBorder={true}
                                />
                                <span className="text-white">{emp.firstName} {emp.lastName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {sig?.status === 'signed' ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 text-sm">Signé le {new Date(sig.signedAt).toLocaleDateString('fr-FR')}</span>
                                  </>
                                ) : sig?.status === 'pending' ? (
                                  <>
                                    <Clock className="w-5 h-5 text-orange-400" />
                                    <span className="text-orange-400 text-sm">En attente</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-500 text-sm">Non demandé</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Signature personnelle de l'admin */}
                  {currentUserStatus && currentValidation?.status === 'pending_validation' && (
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Pen className="w-5 h-5 text-purple-400" />
                        Ma signature personnelle
                      </h3>
                      {currentUserStatus?.status === 'pending' ? (
                        <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertOctagon className="w-8 h-8 text-orange-400" />
                              <div>
                                <p className="text-white font-medium">Vous devez aussi signer vos pointages</p>
                                <p className="text-gray-400 text-sm">Cliquez pour valider vos propres pointages de {MONTHS_FR[selectedMonth]} {selectedYear}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedValidation(currentValidation);
                                setShowSignatureModal(true);
                              }}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-medium"
                            >
                              <Pen className="w-4 h-4" />
                              Signer mes pointages
                            </button>
                          </div>
                        </div>
                      ) : currentUserStatus?.status === 'signed' ? (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <div>
                              <p className="text-white font-medium">Vos pointages sont validés</p>
                              <p className="text-gray-400 text-sm">Signé le {new Date(currentUserStatus.signedAt).toLocaleDateString('fr-FR')} à {new Date(currentUserStatus.signedAt).toLocaleTimeString('fr-FR')}</p>
                            </div>
                            {currentUserStatus.signature && (
                              <img src={currentUserStatus.signature} alt="Ma signature" className="h-10 ml-auto rounded border border-white/10" />
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                // Vue Employé
                <div>
                  {currentUserStatus?.status === 'pending' ? (
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-6 text-center">
                      <AlertOctagon className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Validation requise</h3>
                      <p className="text-gray-300 mb-4">
                        Vos pointages de {MONTHS_FR[selectedMonth]} {selectedYear} doivent être validés par signature électronique.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedValidation(currentValidation);
                          setShowSignatureModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto font-medium"
                      >
                        <Pen className="w-5 h-5" />
                        Signer mes pointages
                      </button>
                    </div>
                  ) : currentUserStatus?.status === 'signed' ? (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Pointages validés</h3>
                      <p className="text-gray-300">
                        Vous avez signé vos pointages le {new Date(currentUserStatus.signedAt).toLocaleDateString('fr-FR')} à {new Date(currentUserStatus.signedAt).toLocaleTimeString('fr-FR')}
                      </p>
                      {currentUserStatus.signature && (
                        <div className="mt-4">
                          <p className="text-gray-400 text-sm mb-2">Votre signature :</p>
                          <img src={currentUserStatus.signature} alt="Signature" className="max-h-20 mx-auto rounded-lg border border-white/10" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">En attente</h3>
                      <p className="text-gray-300">
                        La validation des pointages pour cette période n'a pas encore été demandée.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Section Exports Paie */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Exports Paie</h2>
            <p className="text-gray-400">Génération des fichiers de paie</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>

        {/* Sélecteurs de période */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
            >
              {MONTHS_FR.map((month, idx) => (
                <option key={idx} value={idx} className="bg-gray-800">{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
            >
              {years.map(year => (
                <option key={year} value={year} className="bg-gray-800">{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Employé</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
            >
              <option value="all" className="bg-gray-800">Tous les employés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-gray-800">
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message de succès */}
        {exportSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{exportSuccess}</span>
          </div>
        )}

        {/* Boutons d'export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center py-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
            <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <p className="text-white text-lg font-semibold mb-1">Export Paie Complet</p>
            <p className="text-gray-400 text-xs mb-4 px-4">
              Contrats • Détails employés • Pointages • Absences • Compteurs • Solde congés
            </p>
            <button
              onClick={handleExportPayrollComplete}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Paie ({MONTHS_FR[selectedMonth]} {selectedYear})
                </>
              )}
            </button>
          </div>

          <div className="text-center py-6 bg-white/5 rounded-xl">
            <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-white text-lg font-semibold mb-1">Export Pointages</p>
            <p className="text-gray-400 text-xs mb-4 px-4">
              Feuille par employé + récapitulatif mensuel
            </p>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Pointages
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{employees.length}</p>
            <p className="text-gray-400 text-sm">Employés</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{timesheets.length}</p>
            <p className="text-gray-400 text-sm">Pointages</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{leaves?.filter(l => l.status === 'approved').length || 0}</p>
            <p className="text-gray-400 text-sm">Congés validés</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <FileText className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{MONTHS_FR[selectedMonth]}</p>
            <p className="text-gray-400 text-sm">{selectedYear}</p>
          </div>
        </div>
      </GlassCard>

      {/* Modal Signature */}
      <AnimatePresence>
        {showSignatureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSignatureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-purple-400" />
                  Signature électronique
                </h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Période : {MONTHS_FR[selectedMonth]} {selectedYear}</p>
                    <p className="text-gray-400">
                      En signant, vous certifiez que les pointages affichés sont corrects.
                    </p>
                  </div>
                </div>
              </div>

              <SignatureCanvas
                onSave={handleSignTimesheet}
                onCancel={() => setShowSignatureModal(false)}
                employeeName={currentUser?.displayName || currentUser?.email || 'Employé'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PayrollTab;
