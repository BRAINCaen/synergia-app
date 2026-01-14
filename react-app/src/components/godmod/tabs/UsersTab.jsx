// UsersTab - User management for GodMod
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Award, Edit, X, Plus, Minus } from 'lucide-react';
import { SectionHeader, DataCard, ActionButton } from '../common.jsx';
import { BADGE_DEFINITIONS } from '../../../core/services/badgeDefinitions.js';

const UsersTab = ({ users, searchTerm, onEdit, onModifyXp, onAssignBadge, onRemoveBadge }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [xpModal, setXpModal] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpReason, setXpReason] = useState('');
  const [badgeModal, setBadgeModal] = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleXpSubmit = async () => {
    if (!selectedUser || xpAmount === 0 || !xpReason) return;
    const success = await onModifyXp(selectedUser.id, xpAmount, xpReason);
    if (success) {
      setXpModal(false);
      setXpAmount(0);
      setXpReason('');
      setSelectedUser(null);
    }
  };

  return (
    <div>
      <SectionHeader
        icon={Users}
        title="Gestion des Utilisateurs"
        count={filtered.length}
      />

      <div className="space-y-3">
        {filtered.map(u => (
          <DataCard key={u.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {u.displayName?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{u.displayName || 'Sans nom'}</div>
                  <div className="text-sm text-gray-400">{u.email}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="text-yellow-500">{u.gamification?.totalXp || 0} XP</span>
                    <span className="text-gray-500">Niv. {u.gamification?.level || 1}</span>
                    <span className="text-purple-400">{u.gamification?.badges?.length || 0} badges</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  icon={Zap}
                  onClick={() => { setSelectedUser(u); setXpModal(true); }}
                  color="yellow"
                  title="Modifier XP"
                />
                <ActionButton
                  icon={Award}
                  onClick={() => { setSelectedUser(u); setBadgeModal(true); }}
                  color="purple"
                  title="Badges"
                />
                <ActionButton
                  icon={Edit}
                  onClick={() => onEdit(u)}
                  color="blue"
                  title="Modifier"
                />
              </div>
            </div>
          </DataCard>
        ))}
      </div>

      {/* Modal XP */}
      <AnimatePresence>
        {xpModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setXpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Modifier XP</h3>
                <button onClick={() => setXpModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 mb-4">Utilisateur: {selectedUser.displayName}</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Montant XP (positif ou négatif)</label>
                  <input
                    type="number"
                    value={xpAmount}
                    onChange={e => setXpAmount(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Raison</label>
                  <input
                    type="text"
                    value={xpReason}
                    onChange={e => setXpReason(e.target.value)}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: Correction manuelle, bonus spécial..."
                  />
                </div>
                <button
                  onClick={handleXpSubmit}
                  disabled={xpAmount === 0 || !xpReason}
                  className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-white rounded-lg"
                >
                  {xpAmount >= 0 ? `Ajouter ${xpAmount} XP` : `Retirer ${Math.abs(xpAmount)} XP`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Badges */}
      <AnimatePresence>
        {badgeModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Badges de {selectedUser.displayName}</h3>
                <button onClick={() => setBadgeModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-gray-400 mb-2">Badges actuels</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedUser.gamification?.badges || []).map(badgeId => {
                    const badge = BADGE_DEFINITIONS[badgeId];
                    return badge ? (
                      <div key={badgeId} className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                        <span>{badge.icon}</span>
                        <span className="text-sm text-white">{badge.name}</span>
                        <button
                          onClick={() => onRemoveBadge(selectedUser.id, badgeId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                  {(!selectedUser.gamification?.badges || selectedUser.gamification.badges.length === 0) && (
                    <span className="text-gray-500">Aucun badge</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-2">Assigner un badge</h4>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => {
                    const hasBadge = selectedUser.gamification?.badges?.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => !hasBadge && onAssignBadge(selectedUser.id, id)}
                        disabled={hasBadge}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left ${
                          hasBadge ? 'bg-green-500/20 text-green-400' : 'bg-white/5 hover:bg-white/10 text-white'
                        }`}
                      >
                        <span className="text-xl">{badge.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{badge.name}</div>
                          <div className="text-xs text-gray-400 truncate">{badge.description}</div>
                        </div>
                        {!hasBadge && <Plus className="w-4 h-4 ml-auto text-gray-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersTab;
