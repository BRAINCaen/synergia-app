// ==========================================
// 📁 react-app/src/components/onboarding/InterviewFormWithUsers.jsx
// FORMULAIRE ENTRETIENS AVEC SÉLECTION UTILISATEURS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  RefreshCw, 
  User, 
  Users, 
  Search,
  ChevronDown,
  Check
} from 'lucide-react';

// Firebase
import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 🎯 COMPOSANT SÉLECTEUR D'UTILISATEURS AVEC RECHERCHE
 */
const UserSelector = ({ 
  selectedUsers = [], 
  onSelectionChange, 
  multiSelect = false, 
  placeholder = "Sélectionner un utilisateur...",
  label = "Utilisateur"
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 👥 Charger les utilisateurs depuis Firebase
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 Chargement des utilisateurs...');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('displayName', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const usersList = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersList.push({
          id: doc.id,
          name: userData.displayName || userData.name || userData.email || 'Utilisateur anonyme',
          email: userData.email || '',
          role: userData.role || 'user',
          avatar: userData.photoURL || userData.avatar || null,
          isActive: userData.isActive !== false // Par défaut actif si non spécifié
        });
      });

      console.log(`✅ ${usersList.length} utilisateurs chargés`);
      setUsers(usersList);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
      // Fallback avec données de test
      setUsers([
        { id: 'test1', name: 'Référent Principal', email: 'referent@brain.com', role: 'manager', isActive: true },
        { id: 'test2', name: 'Game Master Senior', email: 'gm@brain.com', role: 'user', isActive: true },
        { id: 'test3', name: 'Nouvel Employé', email: 'nouveau@brain.com', role: 'user', isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🎯 Sélectionner/désélectionner un utilisateur
  const handleUserSelect = (user) => {
    if (multiSelect) {
      const isSelected = selectedUsers.some(u => u.id === user.id);
      if (isSelected) {
        // Retirer de la sélection
        onSelectionChange(selectedUsers.filter(u => u.id !== user.id));
      } else {
        // Ajouter à la sélection
        onSelectionChange([...selectedUsers, user]);
      }
    } else {
      // Sélection unique
      onSelectionChange([user]);
      setIsOpen(false);
    }
  };

  // 🎨 Badge de rôle
  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-500/20 text-red-300', label: 'Admin' },
      manager: { color: 'bg-blue-500/20 text-blue-300', label: 'Manager' },
      gamemaster: { color: 'bg-purple-500/20 text-purple-300', label: 'Game Master' },
      user: { color: 'bg-gray-500/20 text-gray-300', label: 'Utilisateur' }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
        <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
        <span className="text-gray-400">Chargement des utilisateurs...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-white font-medium mb-2">{label}</label>
      
      {/* 📝 Zone de sélection */}
      <div 
        className="bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-gray-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedUsers.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                    <User className="h-3 w-3" />
                    <span>{user.name}</span>
                    {multiSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelect(user);
                        }}
                        className="hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* 📋 Liste déroulante */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden"
        >
          {/* 🔍 Barre de recherche */}
          <div className="p-3 border-b border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* 👥 Liste des utilisateurs */}
          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Aucun utilisateur trouvé
              </div>
            ) : (
              filteredUsers.map(user => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    className={`p-3 hover:bg-gray-700 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-500/20' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        {!user.isActive && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                            Inactif
                          </span>
                        )}
                        {isSelected && (
                          <Check className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 📊 Actions rapides */}
          <div className="p-3 border-t border-gray-600 bg-gray-700/50">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{filteredUsers.length} utilisateur(s)</span>
              {multiSelect && selectedUsers.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectionChange([]);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Tout désélectionner
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/**
 * 📝 MODAL DE PLANIFICATION AMÉLIORÉE AVEC SÉLECTEURS D'UTILISATEURS
 */
const ScheduleInterviewModalWithUsers = ({ 
  template, 
  newInterview, 
  setNewInterview, 
  onSchedule, 
  onClose, 
  submitting 
}) => {
  const [selectedConductor, setSelectedConductor] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // 🔄 Mettre à jour les données du formulaire quand les sélections changent
  useEffect(() => {
    setNewInterview(prev => ({
      ...prev,
      referent: selectedConductor[0]?.name || '',
      referentId: selectedConductor[0]?.id || '',
      referentEmail: selectedConductor[0]?.email || '',
      targetUser: selectedParticipants.map(p => p.name).join(', ') || '',
      participantIds: selectedParticipants.map(p => p.id) || [],
      participantEmails: selectedParticipants.map(p => p.email) || []
    }));
  }, [selectedConductor, selectedParticipants, setNewInterview]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            📅 Planifier: {template.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 📅 Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Date *</label>
              <input
                type="date"
                value={newInterview.date}
                onChange={(e) => setNewInterview(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Heure *</label>
              <input
                type="time"
                value={newInterview.time}
                onChange={(e) => setNewInterview(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>
          </div>

          {/* 👤 Sélection du référent/conducteur */}
          <UserSelector
            selectedUsers={selectedConductor}
            onSelectionChange={setSelectedConductor}
            multiSelect={false}
            placeholder="Choisir le référent/conducteur de l'entretien"
            label="Référent/Conducteur *"
          />

          {/* 👥 Sélection des participants */}
          <UserSelector
            selectedUsers={selectedParticipants}
            onSelectionChange={setSelectedParticipants}
            multiSelect={true}
            placeholder="Choisir le(s) participant(s) à l'entretien"
            label="Participant(s) cible(s)"
          />

          {/* 📍 Lieu et type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Lieu</label>
              <input
                type="text"
                value={newInterview.location}
                onChange={(e) => setNewInterview(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Bureau Brain"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Type</label>
              <select
                value={newInterview.type}
                onChange={(e) => setNewInterview(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="presentiel">📍 Présentiel</option>
                <option value="visio">📹 Visioconférence</option>
                <option value="phone">📞 Téléphone</option>
                <option value="hybride">🔄 Hybride</option>
              </select>
            </div>
          </div>

          {/* 📝 Notes */}
          <div>
            <label className="block text-white font-medium mb-2">Notes et contexte</label>
            <textarea
              value={newInterview.notes}
              onChange={(e) => setNewInterview(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
              placeholder="Notes spécifiques, contexte particulier, objectifs personnalisés..."
            />
          </div>

          {/* 📋 Aperçu du template */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <template.icon className="h-5 w-5" />
              📋 Aperçu de l'entretien
            </h4>
            <p className="text-gray-300 text-sm mb-3">{template.description}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Durée: </span>
                <span className="text-white">{template.duration} minutes</span>
              </div>
              <div>
                <span className="text-gray-400">Questions: </span>
                <span className="text-white">{template.questions?.length || 0} questions</span>
              </div>
              <div>
                <span className="text-gray-400">Catégorie: </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  template.category === 'integration' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {template.category === 'integration' ? '👶 Intégration' : '👑 Game Master'}
                </span>
              </div>
            </div>
          </div>

          {/* 🎯 Résumé de la planification */}
          {(selectedConductor.length > 0 || selectedParticipants.length > 0) && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">📋 Résumé de la planification</h4>
              <div className="space-y-2 text-sm">
                {selectedConductor.length > 0 && (
                  <div>
                    <span className="text-gray-400">Conducteur: </span>
                    <span className="text-white">{selectedConductor[0].name} ({selectedConductor[0].email})</span>
                  </div>
                )}
                {selectedParticipants.length > 0 && (
                  <div>
                    <span className="text-gray-400">Participant(s): </span>
                    <span className="text-white">
                      {selectedParticipants.map(p => `${p.name} (${p.email})`).join(', ')}
                    </span>
                  </div>
                )}
                {newInterview.date && newInterview.time && (
                  <div>
                    <span className="text-gray-400">Date: </span>
                    <span className="text-white">
                      {new Date(`${newInterview.date}T${newInterview.time}`).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} à {newInterview.time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🎯 Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onSchedule}
              disabled={submitting || !newInterview.date || !newInterview.time || selectedConductor.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Planification...
                </div>
              ) : (
                'Planifier l\'entretien'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export { UserSelector, ScheduleInterviewModalWithUsers };
