// ==========================================
// 📁 react-app/src/hooks/useTeamEnhanced.js
// HOOK ÉQUIPE AMÉLIORÉ - RÉCUPÉRATION EXHAUSTIVE
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { teamServiceEnhanced } from '../core/services/teamServiceEnhanced.js';

/**
 * 🚀 HOOK ÉQUIPE AMÉLIORÉ
 * Récupération exhaustive de tous les membres depuis toutes les sources Firebase
 */
export const useTeamEnhanced = () => {
  const { user } = useAuthStore();
  
  // États
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * 🔄 CHARGER TOUS LES MEMBRES
   */
  const loadAllMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Chargement exhaustif des membres...');
      
      const allMembers = await teamServiceEnhanced.getAllTeamMembers();
      
      setTeamMembers(allMembers);
      setFilteredMembers(allMembers);
      setLastUpdated(new Date());
      
      console.log(`✅ ${allMembers.length} membres chargés avec succès`);
      
    } catch (err) {
      console.error('❌ Erreur chargement équipe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 🔍 RECHERCHER ET FILTRER
   */
  const applyFilters = useCallback(() => {
    let filtered = [...teamMembers];
    
    // Appliquer recherche textuelle
    if (searchTerm.trim()) {
      filtered = teamServiceEnhanced.searchMembers(filtered, searchTerm);
    }
    
    // Appliquer filtre de statut
    filtered = teamServiceEnhanced.filterByStatus(filtered, statusFilter);
    
    setFilteredMembers(filtered);
    
    console.log(`🔍 Filtrage: ${filtered.length}/${teamMembers.length} membres`);
    
  }, [teamMembers, searchTerm, statusFilter]);

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const refreshTeam = useCallback(async () => {
    console.log('🔄 Rafraîchissement demandé...');
    await loadAllMembers();
  }, [loadAllMembers]);

  /**
   * 🎯 CHANGER FILTRE DE RECHERCHE
   */
  const handleSearchChange = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  }, []);

  /**
   * 📊 CHANGER FILTRE DE STATUT
   */
  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
  }, []);

  /**
   * 📈 OBTENIR STATISTIQUES
   */
  const getStats = useCallback(() => {
    return {
      total: teamMembers.length,
      active: teamMembers.filter(m => m.isActive).length,
      inactive: teamMembers.filter(m => !m.isActive).length,
      online: teamMembers.filter(m => m.status === 'online').length,
      recent: teamMembers.filter(m => m.status === 'recent').length,
      sources: teamServiceEnhanced.getSourcesStats(teamMembers),
      departments: [...new Set(teamMembers.map(m => m.department))].length,
      avgLevel: teamMembers.length > 0 ? 
        Math.round(teamMembers.reduce((sum, m) => sum + (m.level || 1), 0) / teamMembers.length) : 1,
      totalXp: teamMembers.reduce((sum, m) => sum + (m.xp || 0), 0)
    };
  }, [teamMembers]);

  // Charger au montage
  useEffect(() => {
    if (user) {
      loadAllMembers();
    }
  }, [user, loadAllMembers]);

  // Appliquer filtres quand changement
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Rafraîchissement automatique...');
      refreshTeam();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshTeam]);

  return {
    // Données
    teamMembers,
    filteredMembers,
    loading,
    error,
    lastUpdated,
    searchTerm,
    statusFilter,
    
    // Statistiques
    stats: getStats(),
    
    // Actions
    refreshTeam,
    handleSearchChange,
    handleStatusFilterChange,
    
    // Utilitaires
    totalMembers: teamMembers.length,
    visibleMembers: filteredMembers.length,
    hasMembers: teamMembers.length > 0
  };
};
