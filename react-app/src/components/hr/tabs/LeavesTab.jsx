// ==========================================
// 📁 components/hr/tabs/LeavesTab.jsx
// ONGLET GESTION DES CONGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Plus,
  Edit,
  X
} from 'lucide-react';
import { collection, getDocs, query, orderBy, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../core/firebase.js';
import leaveAccrualService from '../../../core/services/leaveAccrualService.js';
import UserAvatar from '../../common/UserAvatar.jsx';
import GlassCard from '../GlassCard.jsx';
import StatCard from '../StatCard.jsx';

const LeavesTab = ({ employees, onRefresh, user }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [subTab, setSubTab] = useState('requests');
  const [employeeBalances, setEmployeeBalances] = useState({});
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({ paidLeaveDays: 25, bonusOffDays: 0, rttDays: 0 });

  const leaveTypes = [
    { id: 'paid', label: 'Congés payés', color: 'green', icon: '🏖️' },
    { id: 'unpaid', label: 'Sans solde', color: 'orange', icon: '📅' },
    { id: 'sick', label: 'Maladie', color: 'red', icon: '🏥' },
    { id: 'rtt', label: 'RTT', color: 'blue', icon: '⏰' },
    { id: 'family', label: 'Événement familial', color: 'purple', icon: '👨‍👩‍👧' },
    { id: 'training', label: 'Formation', color: 'indigo', icon: '📚' }
  ];

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

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En attente' },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approuvé' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Refusé' }
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const stats = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    thisMonth: leaveRequests.filter(r => {
      const date = r.startDate?.toDate?.() || new Date(r.startDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <motion.div
      key="leaves"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="En attente" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard title="Approuvés" value={stats.approved} icon={CheckCircle} color="green" />
        <StatCard title="Ce mois" value={stats.thisMonth} icon={Calendar} color="blue" />
        <StatCard title="Total demandes" value={leaveRequests.length} icon={FileText} color="purple" />
      </div>

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
        <GlassCard>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Gestion des Compteurs</h2>
              <p className="text-gray-400 text-sm">Gérez les soldes de congés de chaque employé</p>
            </div>
            <button
              onClick={runMonthlyAccrual}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Accumulation mensuelle (+2.08j)
            </button>
          </div>

          <div className="space-y-3">
            {employees.map((emp) => {
              const balance = employeeBalances[emp.id] || {};
              const isEditing = editingBalance === emp.id;

              return (
                <div key={emp.id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={emp} size="md" showBorder={true} />
                      <div>
                        <p className="text-white font-medium">{emp.displayName || emp.email}</p>
                        <p className="text-gray-400 text-sm">{emp.email}</p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm">🏖️ CP:</span>
                          <input
                            type="number"
                            step="0.01"
                            value={balanceForm.paidLeaveDays}
                            onChange={(e) => setBalanceForm({ ...balanceForm, paidLeaveDays: parseFloat(e.target.value) || 0 })}
                            className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-center text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 text-sm">🎁 Bonus:</span>
                          <input
                            type="number"
                            step="0.01"
                            value={balanceForm.bonusOffDays}
                            onChange={(e) => setBalanceForm({ ...balanceForm, bonusOffDays: parseFloat(e.target.value) || 0 })}
                            className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-center text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm">⏰ RTT:</span>
                          <input
                            type="number"
                            step="0.01"
                            value={balanceForm.rttDays}
                            onChange={(e) => setBalanceForm({ ...balanceForm, rttDays: parseFloat(e.target.value) || 0 })}
                            className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-center text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateEmployeeBalance(emp.id)}
                            className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => setEditingBalance(null)}
                            className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-amber-300 text-sm">
                            🏖️ CP: <strong>{(balance.paidLeaveDays || 25) - (balance.usedPaidLeaveDays || 0)}</strong>/{balance.paidLeaveDays || 25}
                          </span>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-purple-300 text-sm">
                            🎁 Bonus: <strong>{(balance.bonusOffDays || 0) - (balance.usedBonusDays || 0)}</strong>/{balance.bonusOffDays || 0}
                          </span>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-green-300 text-sm">
                            ⏰ RTT: <strong>{(balance.rttDays || 0) - (balance.usedRttDays || 0)}</strong>/{balance.rttDays || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => accrueForEmployee(emp.id, emp.displayName || emp.email)}
                          className="p-2 bg-green-600/30 hover:bg-green-600/50 rounded-lg transition-colors border border-green-500/30"
                          title="Ajouter des CP"
                        >
                          <Plus className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBalance(emp.id);
                            setBalanceForm({
                              paidLeaveDays: balance.paidLeaveDays || 25,
                              bonusOffDays: balance.bonusOffDays || 0,
                              rttDays: balance.rttDays || 0
                            });
                          }}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                          title="Modifier les compteurs"
                        >
                          <Edit className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {subTab === 'requests' && (
        <GlassCard>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Demandes de Congés</h2>
              <p className="text-gray-400 text-sm">Demandes de congés et absences</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Refusés'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Aucune demande de congé</p>
              <p className="text-gray-500 text-sm">Les demandes de congés apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const employee = employees.find(e => e.id === request.employeeId);
                const leaveType = leaveTypes.find(t => t.id === request.type) || leaveTypes[0];
                const startDate = request.startDate?.toDate?.() || new Date(request.startDate);
                const endDate = request.endDate?.toDate?.() || new Date(request.endDate);

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                          {leaveType.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {employee?.firstName} {employee?.lastName}
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {leaveType.label} • {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approuver
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>

                    {request.reason && (
                      <div className="mt-3 p-3 bg-gray-900/30 rounded-lg">
                        <p className="text-gray-400 text-sm">{request.reason}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      )}
    </motion.div>
  );
};

export default LeavesTab;
