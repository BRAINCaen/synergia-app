import React from 'react';
import { Plus, CheckCircle, X, Edit } from 'lucide-react';
import UserAvatar from '../../../common/UserAvatar.jsx';
import GlassCard from '../../GlassCard.jsx';

const BalancesTab = ({
  employees,
  employeeBalances,
  editingBalance,
  setEditingBalance,
  balanceForm,
  setBalanceForm,
  updateEmployeeBalance,
  runMonthlyAccrual,
  accrueForEmployee
}) => {
  return (
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
  );
};

export default BalancesTab;
