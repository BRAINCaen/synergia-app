// ==========================================
// 📁 react-app/src/components/team/RoleAssignmentModal.jsx
// MODAL D'ASSIGNATION DE RÔLES - VERSION SIMPLIFIÉE
// ==========================================

import React, { useState } from 'react';
import { SYNERGIA_ROLES } from '../../core/services/synergiaRolesService.js';
import { 
  X, 
  Plus, 
  Minus, 
  CheckCircle,
  Info
} from 'lucide-react';

const RoleAssignmentModal = ({ 
  isOpen, 
  onClose, 
  selectedMember, 
  onRoleUpdated 
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !selectedMember) return null;

  // Vérifier si un rôle est assigné
  const isRoleAssigned = (roleId) => {
    return selectedMember?.synergiaRoles?.some(r => r.roleId === roleId);
  };

  // Simuler l'assignation/suppression de rôle
  const handleRoleToggle = async (roleId, action) => {
    setLoading(true);
    
    // Simulation d'une action
    setTimeout(() => {
      setLoading(false);
      if (onRoleUpdated) onRoleUpdated();
      alert(`Rôle ${action === 'assign' ? 'assigné' : 'retiré'} avec succès !`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedMember.photoURL ? (
                <img
                  src={selectedMember.photoURL}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {selectedMember.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Gestion des rôles
                </h2>
                <p className="text-gray-300">{selectedMember.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Stats actuelles */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>{selectedMember.synergiaRoles?.length || 0} rôles assignés</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <span>Niveau {selectedMember.level}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <span>{selectedMember.totalXp} XP total</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Rôles actuels */}
          {selectedMember.synergiaRoles && selectedMember.synergiaRoles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Rôles actuels</h3>
              <div className="grid gap-3">
                {selectedMember.synergiaRoles.map((userRole) => {
                  const roleInfo = Object.values(SYNERGIA_ROLES).find(r => r.id === userRole.roleId);
                  if (!roleInfo) return null;
                  
                  return (
                    <div
                      key={userRole.roleId}
                      className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${roleInfo.color} flex items-center justify-center text-xl`}>
                            {roleInfo.icon}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{roleInfo.name}</h4>
                            <p className="text-gray-400 text-sm">
                              Niveau {userRole.level} • {userRole.xpInRole} XP • {userRole.tasksCompleted} tâches
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRoleToggle(userRole.roleId, 'remove')}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rôles disponibles */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Rôles disponibles</h3>
            
            <div className="grid gap-3">
              {Object.values(SYNERGIA_ROLES).map((role) => {
                const isAssigned = isRoleAssigned(role.id);
                
                if (isAssigned) return null; // Ne pas afficher les rôles déjà assignés
                
                return (
                  <div
                    key={role.id}
                    className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center text-2xl`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{role.name}</h4>
                          <p className="text-gray-400 text-sm mb-2">{role.description}</p>
                          
                          {/* Permissions */}
                          <div className="flex flex-wrap gap-1">
                            {role.permissions?.slice(0, 2).map((permission) => (
                              <span
                                key={permission}
                                className="text-xs bg-white/20 text-gray-300 px-2 py-1 rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRoleToggle(role.id, 'assign')}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 ml-4"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Assigner
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Les changements prendront effet immédiatement
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
