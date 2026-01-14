// ==========================================
// 📁 components/hr/tabs/PayrollTab.jsx
// ONGLET PAIE - EXPORT ET VALIDATION SIGNATURE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, PenTool } from 'lucide-react';
import { db } from '../../../core/firebase.js';
import {
  doc, getDoc, setDoc, updateDoc, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
import timesheetExportService, { MONTHS_FR, exportPayrollComplete } from '../../../core/services/timesheetExportService.js';
import notificationService from '../../../core/services/notificationService.js';
import SignatureCanvas from '../SignatureCanvas.jsx';
import { ValidationSection, ExportSection } from './payroll';

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
        ? `Rappel envoyé à ${targetEmployees.length} employé(s) !`
        : `Demande de validation envoyée à ${targetEmployees.length} employé(s) !`;
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
      setExportSuccess('Vos pointages ont été signés avec succès !');
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

      setExportSuccess('Pointages envoyés à la paie avec succès !');
    } catch (error) {
      console.error('Erreur envoi paie:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setExporting(false);
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

      await timesheetExportService.exportToExcel(
        selectedMonth,
        selectedYear,
        employees,
        options
      );

      setExportSuccess('Export Excel généré avec succès !');
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      console.error('Erreur export Excel:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Exporter en CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      setExportSuccess(null);

      const options = {
        employeeId: selectedEmployee === 'all' ? null : selectedEmployee,
        companyName: companyName || 'Entreprise'
      };

      await timesheetExportService.exportToCSV(
        selectedMonth,
        selectedYear,
        employees,
        options
      );

      setExportSuccess('Export CSV généré avec succès !');
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Export paie complet
  const handleExportPayrollComplete = async () => {
    try {
      setExporting(true);
      setExportSuccess(null);

      await exportPayrollComplete(
        selectedMonth,
        selectedYear,
        employees,
        { companyName: companyName || 'Entreprise' }
      );

      setExportSuccess('Export paie complet généré avec succès !');
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      console.error('Erreur export paie complet:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Imprimer
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Rapport de Paie - ${MONTHS_FR[selectedMonth]} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a5568; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Rapport de Paie - ${MONTHS_FR[selectedMonth]} ${selectedYear}</h1>
          <p>Entreprise: ${companyName || 'Non définie'}</p>
          <p>Nombre d'employés: ${employees.length}</p>
          <p>Nombre de pointages: ${timesheets.length}</p>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Poste</th>
                <th>Département</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => `
                <tr>
                  <td>${emp.lastName}</td>
                  <td>${emp.firstName}</td>
                  <td>${emp.position}</td>
                  <td>${emp.department}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Ouvrir modal signature
  const handleOpenSignatureModal = () => {
    setSelectedValidation(currentValidation);
    setShowSignatureModal(true);
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
      <ValidationSection
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        showValidationPanel={showValidationPanel}
        setShowValidationPanel={setShowValidationPanel}
        currentValidation={currentValidation}
        validationStats={validationStats}
        isAdmin={isAdmin}
        employees={employees}
        currentUserStatus={currentUserStatus}
        notifying={notifying}
        exporting={exporting}
        onRequestValidation={handleRequestValidation}
        onSendToPayroll={handleSendToPayroll}
        onOpenSignatureModal={handleOpenSignatureModal}
        MONTHS_FR={MONTHS_FR}
      />

      {/* Section Exports */}
      <ExportSection
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employees={employees}
        timesheets={timesheets}
        leaves={leaves}
        years={years}
        exporting={exporting}
        exportSuccess={exportSuccess}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
        onExportPayrollComplete={handleExportPayrollComplete}
        onPrint={handlePrint}
        MONTHS_FR={MONTHS_FR}
      />

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
