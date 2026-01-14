// ==========================================
// 📁 hooks/useLeaves.js
// HOOK - GESTION DES CONGÉS ET SOLDES
// ==========================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, query, orderBy, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import leaveAccrualService from '../core/services/leaveAccrualService.js';

const DEFAULT_BALANCE = {
  paidLeaveDays: 25,
  bonusOffDays: 0,
  rttDays: 0,
  usedPaidLeaveDays: 0,
  usedBonusDays: 0,
  usedRttDays: 0
};

const useLeaves = ({ employees, userId }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeBalances, setEmployeeBalances] = useState({});
  const [filter, setFilter] = useState('all');

  // Charger les demandes de congés
  const loadLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const leavesRef = collection(db, 'leave_requests');
      const snapshot = await getDocs(query(leavesRef, orderBy('createdAt', 'desc')));
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaveRequests(requests);
    } catch (error) {
      console.error('Erreur chargement congés:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les soldes des employés
  const loadEmployeeBalances = useCallback(async () => {
    if (!employees?.length) return;

    try {
      const balances = {};
      for (const emp of employees) {
        const userDoc = await getDoc(doc(db, 'users', emp.id));
        if (userDoc.exists()) {
          balances[emp.id] = userDoc.data().leaveBalance || DEFAULT_BALANCE;
        }
      }
      setEmployeeBalances(balances);
    } catch (error) {
      console.error('Erreur chargement soldes:', error);
    }
  }, [employees]);

  // Charger les données au montage
  useEffect(() => {
    loadLeaveRequests();
    loadEmployeeBalances();
  }, [loadLeaveRequests, loadEmployeeBalances]);

  // Mettre à jour le solde d'un employé
  const updateEmployeeBalance = useCallback(async (employeeId, balanceData) => {
    try {
      await leaveAccrualService.adjustBalance(
        employeeId,
        balanceData,
        'Modification manuelle par admin',
        userId
      );
      await loadEmployeeBalances();
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour solde:', error);
      return { success: false, error: error.message };
    }
  }, [userId, loadEmployeeBalances]);

  // Lancer l'accumulation mensuelle
  const runMonthlyAccrual = useCallback(async () => {
    try {
      const results = await leaveAccrualService.runMonthlyAccrual();
      await loadEmployeeBalances();
      return {
        success: true,
        message: `Accumulation terminée !\n${results.updated} employés mis à jour sur ${results.processed}`
      };
    } catch (error) {
      console.error('Erreur accumulation:', error);
      return { success: false, error: error.message };
    }
  }, [loadEmployeeBalances]);

  // Accumuler pour un employé spécifique
  const accrueForEmployee = useCallback(async (employeeId, days, reason = 'Accumulation manuelle') => {
    try {
      await leaveAccrualService.accrueForEmployee(employeeId, days, reason);
      await loadEmployeeBalances();
      return { success: true };
    } catch (error) {
      console.error('Erreur accumulation:', error);
      return { success: false, error: error.message };
    }
  }, [loadEmployeeBalances]);

  // Approuver une demande
  const approveRequest = useCallback(async (requestId) => {
    try {
      const request = leaveRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Demande non trouvée');

      const startDate = request.startDate?.toDate?.() || new Date(request.startDate);
      const endDate = request.endDate?.toDate?.() || new Date(request.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      await leaveAccrualService.deductLeaveOnApproval(
        request.userId,
        request.leaveType || request.type || 'paid_leave',
        days,
        requestId
      );

      await updateDoc(doc(db, 'leave_requests', requestId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        daysDeducted: days
      });

      await Promise.all([loadLeaveRequests(), loadEmployeeBalances()]);
      return { success: true };
    } catch (error) {
      console.error('Erreur approbation:', error);
      return { success: false, error: error.message };
    }
  }, [leaveRequests, loadLeaveRequests, loadEmployeeBalances]);

  // Rejeter une demande
  const rejectRequest = useCallback(async (requestId) => {
    try {
      const request = leaveRequests.find(r => r.id === requestId);

      // Restaurer les jours si déjà approuvé
      if (request?.status === 'approved' && request.daysDeducted) {
        await leaveAccrualService.restoreLeaveOnCancellation(
          request.userId,
          request.leaveType || request.type || 'paid_leave',
          request.daysDeducted,
          requestId
        );
      }

      await updateDoc(doc(db, 'leave_requests', requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });

      await Promise.all([loadLeaveRequests(), loadEmployeeBalances()]);
      return { success: true };
    } catch (error) {
      console.error('Erreur rejet:', error);
      return { success: false, error: error.message };
    }
  }, [leaveRequests, loadLeaveRequests, loadEmployeeBalances]);

  // Demandes filtrées
  const filteredRequests = useMemo(() => {
    if (filter === 'all') return leaveRequests;
    return leaveRequests.filter(req => req.status === filter);
  }, [leaveRequests, filter]);

  // Statistiques
  const stats = useMemo(() => ({
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    total: leaveRequests.length
  }), [leaveRequests]);

  return {
    // État
    leaveRequests,
    filteredRequests,
    loading,
    employeeBalances,
    filter,
    stats,

    // Setters
    setFilter,

    // Actions
    loadLeaveRequests,
    loadEmployeeBalances,
    updateEmployeeBalance,
    runMonthlyAccrual,
    accrueForEmployee,
    approveRequest,
    rejectRequest,
    refresh: () => Promise.all([loadLeaveRequests(), loadEmployeeBalances()])
  };
};

export default useLeaves;
