// ==========================================
// 📁 components/hr/tabs/LeavesTab.jsx
// ONGLET GESTION DES CONGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase.js';
import leaveAccrualService from '../../../core/services/leaveAccrualService.js';

// Sous-composants
import { LeaveStats, BalancesTab, RequestsTab } from './leaves';

const LeavesTab = ({ employees, onRefresh, user }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [subTab, setSubTab] = useState('requests');
  const [employeeBalances, setEmployeeBalances] = useState({});
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({ paidLeaveDays: 25, bonusOffDays: 0, rttDays: 0 });

  useEffect(() => {
    loadLeaveRequests();
    loadEmployeeBalances();
  }, [employees]);

  const loadEmployeeBalances = async () => {
    try {
      const balances = {};
      for (const emp of employees) {
        const userDoc = await getDoc(doc(db, 'users', emp.id));
        if (userDoc.exists()) {
          balances[emp.id] = userDoc.data().leaveBalance || {
            paidLeaveDays: 25,
            bonusOffDays: 0,
            rttDays: 0,
            usedPaidLeaveDays: 0,
            usedBonusDays: 0,
            usedRttDays: 0
          };
        }
      }
      setEmployeeBalances(balances);
    } catch (error) {
      console.error('Erreur chargement soldes:', error);
    }
  };

  const updateEmployeeBalance = async (employeeId) => {
    try {
      await leaveAccrualService.adjustBalance(
        employeeId,
        {
          paidLeaveDays: balanceForm.paidLeaveDays,
          bonusOffDays: balanceForm.bonusOffDays,
          rttDays: balanceForm.rttDays
        },
        'Modification manuelle par admin',
        user?.uid
      );
      setEditingBalance(null);
      loadEmployeeBalances();
    } catch (error) {
      console.error('Erreur mise à jour solde:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const runMonthlyAccrual = async () => {
    if (!confirm('Lancer l\'accumulation mensuelle de CP pour tous les employés ? (+2.08 jours/employé)')) {
      return;
    }
    try {
      const results = await leaveAccrualService.runMonthlyAccrual();
      alert(`Accumulation terminée !\n${results.updated} employés mis à jour sur ${results.processed}`);
      loadEmployeeBalances();
    } catch (error) {
      console.error('Erreur accumulation:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const accrueForEmployee = async (employeeId, employeeName) => {
    const amount = prompt(`Nombre de jours CP à ajouter pour ${employeeName} :`, '2.08');
    if (!amount) return;
    const days = parseFloat(amount);
    if (isNaN(days) || days <= 0) {
      alert('Veuillez entrer un nombre valide');
      return;
    }
    try {
      await leaveAccrualService.accrueForEmployee(employeeId, days, 'Accumulation manuelle');
      alert(`${days} jours CP ajoutés pour ${employeeName}`);
      loadEmployeeBalances();
    } catch (error) {
      console.error('Erreur accumulation:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const loadLeaveRequests = async () => {
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
  };

  const handleApprove = async (requestId) => {
    try {
      const request = leaveRequests.find(r => r.id === requestId);
      if (!request) return;

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

      loadLeaveRequests();
      loadEmployeeBalances();
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const request = leaveRequests.find(r => r.id === requestId);
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
      loadLeaveRequests();
      loadEmployeeBalances();
    } catch (error) {
      console.error('Erreur rejet:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <motion.div
      key="leaves"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <LeaveStats leaveRequests={leaveRequests} />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subTab === 'requests'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          📋 Demandes
        </button>
        <button
          onClick={() => setSubTab('balances')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subTab === 'balances'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          🏖️ Compteurs CP
        </button>
      </div>

      {subTab === 'balances' && (
        <BalancesTab
          employees={employees}
          employeeBalances={employeeBalances}
          editingBalance={editingBalance}
          setEditingBalance={setEditingBalance}
          balanceForm={balanceForm}
          setBalanceForm={setBalanceForm}
          updateEmployeeBalance={updateEmployeeBalance}
          runMonthlyAccrual={runMonthlyAccrual}
          accrueForEmployee={accrueForEmployee}
        />
      )}

      {subTab === 'requests' && (
        <RequestsTab
          filteredRequests={filteredRequests}
          employees={employees}
          filter={filter}
          setFilter={setFilter}
          loading={loading}
          handleApprove={handleApprove}
          handleReject={handleReject}
        />
      )}
    </motion.div>
  );
};

export default LeavesTab;
