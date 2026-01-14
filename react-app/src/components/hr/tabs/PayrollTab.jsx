// ==========================================
// 📁 components/hr/tabs/PayrollTab.jsx
// ONGLET PAIE - EXPORT ET VALIDATION SIGNATURE
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import timesheetExportService, { MONTHS_FR, exportPayrollComplete } from '../../../core/services/timesheetExportService.js';
import {
  ValidationSection,
  ExportSection,
  SignatureModal,
  usePayrollValidation
} from './payroll';

const PayrollTab = ({ employees, timesheets, leaves, companyName, onRefresh, currentUser, isAdmin }) => {
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [exportSuccess, setExportSuccess] = useState(null);

  // Hook de validation
  const {
    showSignatureModal,
    notifying,
    currentValidation,
    currentUserStatus,
    validationStats,
    handleRequestValidation,
    handleSignTimesheet,
    handleSendToPayroll,
    openSignatureModal,
    closeSignatureModal
  } = usePayrollValidation({
    selectedMonth,
    selectedYear,
    employees,
    currentUser
  });

  // Générer la liste des années disponibles
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push(y);
  }

  // Wrapper pour les actions avec gestion du succès/erreur
  const handleValidationRequest = async () => {
    try {
      const message = await handleRequestValidation();
      if (message) {
        setExportSuccess(message);
        setTimeout(() => setExportSuccess(null), 5000);
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleSign = async (signatureData) => {
    try {
      const message = await handleSignTimesheet(signatureData);
      if (message) {
        setExportSuccess(message);
        setTimeout(() => setExportSuccess(null), 5000);
      }
    } catch (error) {
      alert('Erreur lors de la signature: ' + error.message);
    }
  };

  const handlePayrollSend = async () => {
    try {
      setExporting(true);
      const message = await handleSendToPayroll(handleExportPayrollComplete);
      if (message) {
        setExportSuccess(message);
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

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
        showValidationPanel={true}
        setShowValidationPanel={() => {}}
        currentValidation={currentValidation}
        validationStats={validationStats}
        isAdmin={isAdmin}
        employees={employees}
        currentUserStatus={currentUserStatus}
        notifying={notifying}
        exporting={exporting}
        onRequestValidation={handleValidationRequest}
        onSendToPayroll={handlePayrollSend}
        onOpenSignatureModal={openSignatureModal}
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
      <SignatureModal
        show={showSignatureModal}
        onClose={closeSignatureModal}
        onSign={handleSign}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        currentUser={currentUser}
        MONTHS_FR={MONTHS_FR}
      />
    </motion.div>
  );
};

export default PayrollTab;
