// BadgesTab - Badge management for GodMod
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, X } from 'lucide-react';
import { SectionHeader, DataCard } from '../common.jsx';
import { BADGE_DEFINITIONS } from '../../../core/services/badgeDefinitions.js';

const BadgesTab = ({ users, searchTerm, onAssignBadge, onRemoveBadge }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const badgeStats = useMemo(() => {
    const stats = {};
    Object.keys(BADGE_DEFINITIONS).forEach(badgeId => {
      stats[badgeId] = users.filter(u => u.gamification?.badges?.includes(badgeId)).length;
    });
    return stats;
  }, [users]);

  const filteredBadges = useMemo(() => {
    return Object.entries(BADGE_DEFINITIONS).filter(([id, badge]) =>
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div>
      <SectionHeader
        icon={Award}
        title="Gestion des Badges"
        count={filteredBadges.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map(([id, badge]) => (
          <DataCard key={id} onClick={() => setSelectedBadge({ id, ...badge })}>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{badge.icon}</span>
              <div className="flex-1">
                <div className="text-white font-semibold">{badge.name}</div>
                <div className="text-sm text-gray-400 line-clamp-2">{badge.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-purple-400">{badgeStats[id]} utilisateur(s)</span>
                  <span className="text-xs text-yellow-500">+{badge.xp || 0} XP</span>
                </div>
              </div>
            </div>
          </DataCard>
        ))}
      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/10 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedBadge.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedBadge.name}</h3>
                    <p className="text-gray-400">{selectedBadge.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBadge(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="text-sm text-gray-400 mb-2">Utilisateurs avec ce badge ({badgeStats[selectedBadge.id]})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {users.filter(u => u.gamification?.badges?.includes(selectedBadge.id)).map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                      <span className="text-white">{u.displayName}</span>
                      <button
                        onClick={() => onRemoveBadge(u.id, selectedBadge.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-2">Assigner à un utilisateur</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {users.filter(u => !u.gamification?.badges?.includes(selectedBadge.id)).slice(0, 20).map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                      <span className="text-white">{u.displayName}</span>
                      <button
                        onClick={() => onAssignBadge(u.id, selectedBadge.id)}
                        className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Assigner
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgesTab;
