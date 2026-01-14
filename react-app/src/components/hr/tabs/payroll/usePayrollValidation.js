// ==========================================
// 📁 components/hr/tabs/payroll/usePayrollValidation.js
// HOOK - LOGIQUE DE VALIDATION DES POINTAGES
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../../core/firebase.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { MONTHS_FR } from '../../../../core/services/timesheetExportService.js';
import notificationService from '../../../../core/services/notificationService.js';

const usePayrollValidation = ({
  selectedMonth,
  selectedYear,
  employees,
  currentUser
}) => {
  const [validationPeriods, setValidationPeriods] = useState([]);
  const [loadingValidations, setLoadingValidations] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [notifying, setNotifying] = useState(false);

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
  const handleRequestValidation = useCallback(async () => {
    const isReminder = validationPeriods.length > 0 && validationPeriods[0].status === 'pending_validation';
    const actionLabel = isReminder ? 'Relancer les non-signés' : 'Demander validation';

    if (!confirm(`${actionLabel} pour ${MONTHS_FR[selectedMonth]} ${selectedYear} ?`)) return null;

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

      setValidationPeriods([{
        id: periodId,
        month: selectedMonth,
        year: selectedYear,
        status: 'pending_validation',
        employeeSignatures,
        requestedAt: new Date()
      }]);

      return successMsg;
    } catch (error) {
      console.error('Erreur notification:', error);
      throw error;
    } finally {
      setNotifying(false);
    }
  }, [validationPeriods, selectedMonth, selectedYear, employees, currentUser]);

  // Signer les pointages
  const handleSignTimesheet = useCallback(async (signatureData) => {
    if (!currentUser?.uid || !selectedValidation) return null;

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

      setValidationPeriods([{
        ...selectedValidation,
        employeeSignatures: updatedSignatures,
        status: newStatus
      }]);

      // Notifications
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

      return 'Vos pointages ont été signés avec succès !';
    } catch (error) {
      console.error('Erreur signature:', error);
      throw error;
    }
  }, [currentUser, selectedValidation, selectedMonth, selectedYear]);

  // Envoyer à la paie
  const handleSendToPayroll = useCallback(async (onExportPayroll) => {
    const validation = validationPeriods[0];
    if (!validation || validation.status !== 'ready_for_payroll') {
      alert('Tous les employés doivent avoir signé avant l\'envoi à la paie.');
      return null;
    }

    if (!confirm('Confirmer l\'envoi à la paie ? Les pointages seront verrouillés.')) return null;

    try {
      const periodId = validation.id;

      await updateDoc(doc(db, 'timesheetValidations', periodId), {
        status: 'sent_to_payroll',
        sentToPayrollAt: serverTimestamp(),
        sentBy: currentUser?.uid
      });

      if (onExportPayroll) {
        await onExportPayroll();
      }

      setValidationPeriods([{
        ...validation,
        status: 'sent_to_payroll',
        sentToPayrollAt: new Date()
      }]);

      return 'Pointages envoyés à la paie avec succès !';
    } catch (error) {
      console.error('Erreur envoi paie:', error);
      throw error;
    }
  }, [validationPeriods, currentUser]);

  // Obtenir le statut de validation pour l'utilisateur courant
  const getCurrentUserValidationStatus = useCallback(() => {
    if (!validationPeriods.length || !currentUser?.uid) return null;
    const validation = validationPeriods[0];
    return validation.employeeSignatures?.[currentUser.uid];
  }, [validationPeriods, currentUser]);

  // Calculer les stats de validation
  const getValidationStats = useCallback(() => {
    if (!validationPeriods.length) return { total: 0, signed: 0, pending: 0 };
    const validation = validationPeriods[0];
    const signatures = Object.values(validation.employeeSignatures || {});
    return {
      total: signatures.length,
      signed: signatures.filter(s => s.status === 'signed').length,
      pending: signatures.filter(s => s.status === 'pending').length
    };
  }, [validationPeriods]);

  // Ouvrir modal signature
  const openSignatureModal = useCallback(() => {
    setSelectedValidation(validationPeriods[0]);
    setShowSignatureModal(true);
  }, [validationPeriods]);

  const closeSignatureModal = useCallback(() => {
    setShowSignatureModal(false);
    setSelectedValidation(null);
  }, []);

  return {
    // État
    validationPeriods,
    loadingValidations,
    showSignatureModal,
    selectedValidation,
    notifying,
    currentValidation: validationPeriods[0],
    currentUserStatus: getCurrentUserValidationStatus(),
    validationStats: getValidationStats(),

    // Actions
    handleRequestValidation,
    handleSignTimesheet,
    handleSendToPayroll,
    openSignatureModal,
    closeSignatureModal
  };
};

export default usePayrollValidation;
