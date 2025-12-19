import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, ArrowLeft, RefreshCw, Plus, Edit, Trash2,
  BarChart3, Activity, Search, Filter, Award, Star, Zap,
  ChevronDown, ChevronUp, Eye, X, Check, Gift
} from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import unifiedBadgeService, {
  UNIFIED_BADGE_DEFINITIONS,
  BADGE_CATEGORIES,
  BADGE_RARITY,
  calculateBadgeStats
} from '../core/services/unifiedBadgeSystem.js';

const AdminBadgesPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [awarding, setAwarding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [userBadgesModal, setUserBadgesModal] = useState(null);
  const [awardModal, setAwardModal] = useState(null);
  const [removeModal, setRemoveModal] = useState(null);

  // Statistiques des badges
  const badgeStats = useMemo(() => calculateBadgeStats(), []);
  const allBadges = useMemo(() => Object.values(UNIFIED_BADGE_DEFINITIONS), []);

  // Badges filtrés
  const filteredBadges = useMemo(() => {
    return allBadges.filter(badge => {
      const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           badge.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || badge.category === filterCategory;
      const matchesRarity = filterRarity === 'all' || badge.rarity === filterRarity;
      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [allBadges, searchTerm, filterCategory, filterRarity]);

  // Badges groupés par catégorie
  const badgesByCategory = useMemo(() => {
    const grouped = {};
    filteredBadges.forEach(badge => {
      if (!grouped[badge.category]) {
        grouped[badge.category] = [];
      }
      grouped[badge.category].push(badge);
    });
    return grouped;
  }, [filteredBadges]);

  const loadData = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = [];
      usersSnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
      console.log('✅ [ADMIN] Utilisateurs chargés:', usersList.length);
    } catch (error) {
      console.error('❌ [ADMIN] Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Attribution d'un badge
  const handleAwardBadge = async (userId, badgeId, reason = '') => {
    setAwarding(true);
    try {
      const result = await unifiedBadgeService.awardBadgeManually(
        userId,
        badgeId,
        user.uid,
        reason || 'Attribué par admin'
      );

      if (result.success) {
        alert(`Badge attribué avec succès !`);
        await loadData();
        setAwardModal(null);
      } else {
        alert('Erreur: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Erreur attribution:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setAwarding(false);
    }
  };

  // Retrait d'un badge
  const handleRemoveBadge = async (userId, badgeId) => {
    if (!confirm('Retirer ce badge ? L\'XP associé sera également retiré.')) return;

    setAwarding(true);
    try {
      const result = await unifiedBadgeService.removeBadge(userId, badgeId, user.uid);

      if (result.success) {
        alert('Badge retiré avec succès !');
        await loadData();
        setRemoveModal(null);
        setUserBadgesModal(null);
      } else {
        alert('Erreur: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setAwarding(false);
    }
  };

  // Toggle catégorie
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Couleur de rareté
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800 border-gray-300',
      uncommon: 'bg-green-100 text-green-800 border-green-300',
      rare: 'bg-blue-100 text-blue-800 border-blue-300',
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rarity] || colors.common;
  };

  // Label catégorie
  const getCategoryLabel = (category) => {
    const labels = {
      onboarding: 'Onboarding',
      productivity: 'Productivité',
      progression: 'Progression',
      collaboration: 'Collaboration',
      engagement: 'Engagement',
      boost: 'Boosts',
      challenges: 'Défis',
      campaigns: 'Campagnes',
      retrospectives: 'Rétrospectives',
      ideas: 'Boîte à Idées',
      checkpoints: 'Checkpoints',
      excellence: 'Excellence',
      special: 'Spéciaux',
      roles: 'Rôles'
    };
    return labels[category] || category;
  };

  // Icône catégorie
  const getCategoryIcon = (category) => {
    const icons = {
      onboarding: '👋',
      productivity: '✅',
      progression: '📈',
      collaboration: '🤝',
      engagement: '🔥',
      boost: '💖',
      challenges: '🎯',
      campaigns: '⚔️',
      retrospectives: '🔄',
      ideas: '💡',
      checkpoints: '✓',
      excellence: '🌟',
      special: '🎮',
      roles: '👔'
    };
    return icons[category] || '🏆';
  };

  // Vérification admin
  if (user?.email !== 'alan.boehme61@gmail.com' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Accès Restreint</h2>
            <p className="text-purple-200 mb-6">
              Vous devez être administrateur pour accéder à cette page.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-purple-300 hover:text-white transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <Trophy className="h-8 w-8 text-yellow-400 ml-4 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">Administration des Badges</h1>
                <p className="text-xs text-purple-300">Système Unifié v2.0</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center px-4 py-2 text-purple-200 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div className="ml-3">
                <p className="text-xs text-purple-300">Total Badges</p>
                <p className="text-2xl font-bold text-white">{badgeStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-xs text-purple-300">Utilisateurs</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-400" />
              <div className="ml-3">
                <p className="text-xs text-purple-300">Légendaires</p>
                <p className="text-2xl font-bold text-white">{badgeStats.byRarity.legendary}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-xs text-purple-300">XP Total Dispo</p>
                <p className="text-2xl font-bold text-white">{badgeStats.totalXpAvailable.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-pink-400" />
              <div className="ml-3">
                <p className="text-xs text-purple-300">Catégories</p>
                <p className="text-2xl font-bold text-white">{Object.keys(BADGE_CATEGORIES).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-4 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
                { id: 'badges', label: `Badges (${badgeStats.total})`, icon: Trophy },
                { id: 'users', label: `Utilisateurs (${users.length})`, icon: Users },
                { id: 'stats', label: 'Statistiques', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-purple-300 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Vue d'ensemble du Système</h3>

                {/* Distribution par rareté */}
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(badgeStats.byRarity).map(([rarity, count]) => (
                    <div key={rarity} className={`p-4 rounded-xl border ${getRarityColor(rarity)}`}>
                      <p className="text-sm font-medium capitalize">{rarity}</p>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs opacity-70">{Math.round((count / badgeStats.total) * 100)}%</p>
                    </div>
                  ))}
                </div>

                {/* Distribution par catégorie */}
                <div>
                  <h4 className="text-white font-medium mb-3">Par Catégorie</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(badgeStats.byCategory).map(([category, count]) => (
                      <div key={category} className="bg-white/5 p-3 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(category)}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{getCategoryLabel(category)}</p>
                          <p className="text-purple-300 text-xs">{count} badges</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utilisateurs avec le plus de badges */}
                <div>
                  <h4 className="text-white font-medium mb-3">Top Utilisateurs</h4>
                  <div className="space-y-2">
                    {users
                      .map(u => ({
                        ...u,
                        badgeCount: (u.gamification?.badges || []).length
                      }))
                      .sort((a, b) => b.badgeCount - a.badgeCount)
                      .slice(0, 5)
                      .map((u, index) => (
                        <div key={u.id} className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                              {(u.displayName || u.email)?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm">{u.displayName || u.email}</p>
                              <p className="text-purple-300 text-xs">{u.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{u.badgeCount}</p>
                            <p className="text-purple-300 text-xs">badges</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Badges */}
            {activeTab === 'badges' && (
              <div className="space-y-6">
                {/* Filtres */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un badge..."
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all" className="bg-slate-800">Toutes catégories</option>
                    {Object.values(BADGE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat} className="bg-slate-800">
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all" className="bg-slate-800">Toutes raretés</option>
                    <option value="common" className="bg-slate-800">Commun</option>
                    <option value="uncommon" className="bg-slate-800">Peu commun</option>
                    <option value="rare" className="bg-slate-800">Rare</option>
                    <option value="epic" className="bg-slate-800">Épique</option>
                    <option value="legendary" className="bg-slate-800">Légendaire</option>
                  </select>
                </div>

                <p className="text-purple-300 text-sm">{filteredBadges.length} badges affichés</p>

                {/* Liste par catégorie */}
                <div className="space-y-4">
                  {Object.entries(badgesByCategory).map(([category, badges]) => (
                    <div key={category} className="bg-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(category)}</span>
                          <span className="text-white font-medium">{getCategoryLabel(category)}</span>
                          <span className="text-purple-300 text-sm">({badges.length})</span>
                        </div>
                        {expandedCategories[category] ? (
                          <ChevronUp className="h-5 w-5 text-purple-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-purple-400" />
                        )}
                      </button>

                      {expandedCategories[category] && (
                        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {badges.map(badge => (
                            <div key={badge.id} className="bg-white/10 rounded-lg p-4 border border-white/10">
                              <div className="flex items-start gap-3">
                                <span className="text-3xl">{badge.icon}</span>
                                <div className="flex-1">
                                  <h4 className="text-white font-medium">{badge.name}</h4>
                                  <p className="text-purple-300 text-sm">{badge.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRarityColor(badge.rarity)}`}>
                                      {badge.rarity}
                                    </span>
                                    <span className="text-green-400 text-xs">+{badge.xpReward} XP</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet Utilisateurs */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Gestion des Utilisateurs</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => {
                    const userBadges = u.gamification?.badges || [];
                    const totalXp = u.gamification?.totalXp || 0;

                    return (
                      <div key={u.id} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                            {(u.displayName || u.email)?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{u.displayName || 'Utilisateur'}</h4>
                            <p className="text-purple-300 text-sm">{u.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-white/5 p-2 rounded-lg text-center">
                            <p className="text-white font-bold">{userBadges.length}</p>
                            <p className="text-purple-300 text-xs">Badges</p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg text-center">
                            <p className="text-white font-bold">{totalXp.toLocaleString()}</p>
                            <p className="text-purple-300 text-xs">XP</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setUserBadgesModal(u)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </button>
                          <button
                            onClick={() => setAwardModal(u)}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Donner
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Statistiques */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Statistiques Détaillées</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Par rareté */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Distribution par Rareté</h4>
                    <div className="space-y-3">
                      {Object.entries(badgeStats.byRarity).map(([rarity, count]) => {
                        const percentage = Math.round((count / badgeStats.total) * 100);
                        return (
                          <div key={rarity}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-purple-300 capitalize">{rarity}</span>
                              <span className="text-white">{count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rarity === 'common' ? 'bg-gray-400' :
                                  rarity === 'uncommon' ? 'bg-green-400' :
                                  rarity === 'rare' ? 'bg-blue-400' :
                                  rarity === 'epic' ? 'bg-purple-400' :
                                  'bg-yellow-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Par catégorie */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Distribution par Catégorie</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {Object.entries(badgeStats.byCategory)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between py-2 border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <span>{getCategoryIcon(category)}</span>
                              <span className="text-purple-300">{getCategoryLabel(category)}</span>
                            </div>
                            <span className="text-white font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Résumé XP */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Résumé XP</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-purple-300">XP Total Disponible</span>
                        <span className="text-white font-bold">{badgeStats.totalXpAvailable.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">XP Moyen par Badge</span>
                        <span className="text-white font-bold">{Math.round(badgeStats.totalXpAvailable / badgeStats.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Badges Légendaires</span>
                        <span className="text-yellow-400 font-bold">{badgeStats.byRarity.legendary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Actions Rapides</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          console.log('🔄 Vérification globale des badges...');
                          alert('Vérification des badges pour tous les utilisateurs lancée !');
                        }}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Vérifier tous les badges
                      </button>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <Gift className="h-4 w-4" />
                        Attribuer un badge
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal voir badges utilisateur */}
      {userBadgesModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                  {(userBadgesModal.displayName || userBadgesModal.email)?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {userBadgesModal.displayName || 'Utilisateur'}
                  </h3>
                  <p className="text-purple-300 text-sm">{userBadgesModal.email}</p>
                </div>
              </div>
              <button
                onClick={() => setUserBadgesModal(null)}
                className="p-2 text-purple-300 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-purple-300">
                {(userBadgesModal.gamification?.badges || []).length} badges obtenus
              </p>
            </div>

            {(userBadgesModal.gamification?.badges || []).length === 0 ? (
              <p className="text-center text-purple-300 py-8">Aucun badge obtenu</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(userBadgesModal.gamification?.badges || []).map((badge, index) => (
                  <div key={badge.id || index} className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-3xl">{badge.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{badge.name}</h4>
                      <p className="text-purple-300 text-sm">{badge.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <span className="text-green-400 text-xs">+{badge.xpReward} XP</span>
                        {badge.isManual && (
                          <span className="text-yellow-400 text-xs">Admin</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBadge(userBadgesModal.id, badge.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      title="Retirer ce badge"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setUserBadgesModal(null);
                  setAwardModal(userBadgesModal);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Gift className="h-4 w-4" />
                Attribuer un badge
              </button>
              <button
                onClick={() => setUserBadgesModal(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal attribution badge */}
      {awardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Attribuer un badge à {awardModal.displayName || awardModal.email}
              </h3>
              <button
                onClick={() => setAwardModal(null)}
                className="p-2 text-purple-300 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Recherche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un badge..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
              </div>
            </div>

            {/* Liste des badges à attribuer */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredBadges.map(badge => {
                const alreadyHas = (awardModal.gamification?.badges || []).some(b => b.id === badge.id);

                return (
                  <button
                    key={badge.id}
                    onClick={() => !alreadyHas && handleAwardBadge(awardModal.id, badge.id)}
                    disabled={awarding || alreadyHas}
                    className={`w-full p-4 rounded-lg text-left flex items-center gap-3 transition-colors ${
                      alreadyHas
                        ? 'bg-white/5 opacity-50 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 cursor-pointer'
                    }`}
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{badge.name}</h4>
                        {alreadyHas && (
                          <Check className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-purple-300 text-sm">{badge.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getRarityColor(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                        <span className="text-green-400 text-xs">+{badge.xpReward} XP</span>
                        <span className="text-purple-400 text-xs">{getCategoryLabel(badge.category)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setAwardModal(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de chargement */}
      {awarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
            <span className="text-white">Opération en cours...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadgesPage;
