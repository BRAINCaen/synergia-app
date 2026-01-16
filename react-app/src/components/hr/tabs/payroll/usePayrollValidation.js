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

  // Générer et stocker le PDF des pointages signés
  const generateAndStoreSignedTimesheetPDF = useCallback(async (signatureData, signedAt) => {
    try {
      console.log('📄 Génération du PDF des pointages signés...');

      // Importer les services dynamiquement
      const { exportService } = await import('../../../../core/services/exportService.js');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../../../../core/firebase.js');
      const hrDocService = (await import('../../../../core/services/hrDocumentService.js')).default;
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');

      // Récupérer les pointages du mois pour l'utilisateur
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const endYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;

      const pointagesQuery = query(
        collection(db, 'pointages'),
        where('userId', '==', currentUser.uid),
        where('date', '>=', startDate),
        where('date', '<', endDate),
        orderBy('date', 'asc')
      );

      const pointagesSnapshot = await getDocs(pointagesQuery);
      const pointages = [];
      pointagesSnapshot.forEach(doc => {
        const data = doc.data();
        pointages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp)
        });
      });

      // Récupérer les congés approuvés du mois
      const leavesQuery = query(
        collection(db, 'leaveRequests'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'approved')
      );

      const leavesSnapshot = await getDocs(leavesQuery);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const monthEndDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${lastDay}`;
      const leaves = [];

      leavesSnapshot.forEach(doc => {
        const data = doc.data();
        const leaveStart = data.startDate?.split('T')[0] || data.startDate;
        const leaveEnd = data.endDate?.split('T')[0] || data.endDate;

        if (leaveStart <= monthEndDate && leaveEnd >= startDate) {
          leaves.push({
            id: doc.id,
            ...data,
            startDate: leaveStart,
            endDate: leaveEnd
          });
        }
      });

      // Générer le PDF
      const pdfResult = await exportService.exportSignedTimesheetToPDF({
        month: selectedMonth,
        year: selectedYear,
        user: currentUser,
        signatureData,
        signedAt,
        pointages,
        leaves
      });

      if (!pdfResult.success) {
        console.error('❌ Erreur génération PDF');
        return;
      }

      // Uploader le PDF dans Firebase Storage
      const storagePath = `hr_documents/${currentUser.uid}/signed_timesheets/${pdfResult.fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, pdfResult.blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Créer le document RH
      await hrDocService.createDocument({
        employeeId: currentUser.uid,
        employeeName: currentUser.displayName || currentUser.email,
        type: 'signed_timesheet',
        title: `Pointages signés - ${MONTHS_FR[selectedMonth]} ${selectedYear}`,
        description: `Récapitulatif des pointages du mois de ${MONTHS_FR[selectedMonth]} ${selectedYear}, signé électroniquement le ${new Date(signedAt).toLocaleDateString('fr-FR')}`,
        fileUrl: downloadURL,
        fileName: pdfResult.fileName,
        fileSize: pdfResult.blob.size,
        mimeType: 'application/pdf',
        period: `${MONTHS_FR[selectedMonth]} ${selectedYear}`,
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.displayName || currentUser.email
      });

      console.log('✅ PDF des pointages signés généré et stocké');
    } catch (error) {
      console.error('❌ Erreur génération/stockage PDF pointages:', error);
      // Ne pas bloquer la signature si le PDF échoue
    }
  }, [currentUser, selectedMonth, selectedYear]);

  // Signer les pointages
  const handleSignTimesheet = useCallback(async (signatureData) => {
    if (!currentUser?.uid || !selectedValidation) return null;

    try {
      const periodId = selectedValidation.id;
      const validationRef = doc(db, 'timesheetValidations', periodId);
      const signedAt = new Date().toISOString();

      const updatedSignatures = {
        ...selectedValidation.employeeSignatures,
        [currentUser.uid]: {
          status: 'signed',
          signature: signatureData,
          signedAt,
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

      // Générer et stocker le PDF des pointages signés (en arrière-plan)
      generateAndStoreSignedTimesheetPDF(signatureData, signedAt);

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
  }, [currentUser, selectedValidation, selectedMonth, selectedYear, generateAndStoreSignedTimesheetPDF]);

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
