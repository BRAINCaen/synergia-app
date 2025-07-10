// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// FIX DIAGNOSTIC IMMÉDIAT - BYPASS TOUS LES HOOKS CASSÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Award, 
  BarChart3, 
  Settings,
  RefreshCw,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Eye,
  AlertCircle,
  TrendingUp,
  Shield
} from 'lucide-react';

// ✅ IMPORTS FIREBASE DIRECTS - BYPASS LES SERVICES CASSÉS
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🚀 TEAMPAGE - VERSION DIAGNOSTIC IMMÉDIATE
 * Cette version bypasse tous les hooks et services cassés
 * et récupère directement depuis Firebase
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États simples - pas de hooks complexes
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [diagnostic, setDiagnostic] = useState({});

  /**
   * 🔍 DIAGNOSTIC COMPLET DES COLLECTIONS
   */
  const runDiagnostic = async () => {
    console.log('🔍 === DIAGNOSTIC COMPLET DES COLLECTIONS ===');
    
    const results = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    try {
      // 1️⃣ ANALYSER COLLECTION USERS
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersAnalysis = {
        total: usersSnapshot.size,
        withEmail: 0,
        samples: []
      };

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) usersAnalysis.withEmail++;
        
        if (usersAnalysis.samples.length < 3) {
          usersAnalysis.samples.push({
            id: doc.id,
            email: data.email || 'N/A',
            displayName: data.displayName || 'N/A',
            role: data.role || 'N/A'
          });
        }
      });

      results.collections.users = usersAnalysis;
      console.log('📊 Users:', usersAnalysis);

      // 2️⃣ ANALYSER COLLECTION USERSTATS
      const statsSnapshot = await getDocs(collection(db, 'userStats'));
      const statsAnalysis = {
        total: statsSnapshot.size,
        withEmail: 0,
        samples: []
      };

      statsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) statsAnalysis.withEmail++;
        
        if (statsAnalysis.samples.length < 3) {
          statsAnalysis.samples.push({
            id: doc.id,
            email: data.email || 'N/A',
            level: data.level || 1,
            totalXp: data.totalXp || 0
          });
        }
      });

      results.collections.userStats = statsAnalysis;
      console.log('📊 UserStats:', statsAnalysis);

      // 3️⃣ ANALYSER COLLECTION TEAMMEMBERS
      const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
      const teamAnalysis = {
        total: teamSnapshot.size,
        withEmail: 0,
        active: 0,
        samples: []
      };

      teamSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email || data.displayName) teamAnalysis.withEmail++;
        if (data.status !== 'inactive') teamAnalysis.active++;
        
        if (teamAnalysis.samples.length < 3) {
          teamAnalysis.samples.push({
            id: doc.id,
            email: data.email || 'N/A',
            status: data.status || 'N/A',
            synergiaRoles: data.synergiaRoles?.length || 0
          });
        }
      });

      results.collections.teamMembers = teamAnalysis;
      console.log('📊 TeamMembers:', teamAnalysis);

      // 4️⃣ ANALYSER PROJETS
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projectsAnalysis = {
        total: projectsSnapshot.size,
        withTeam: 0,
        totalMembers: 0,
        samples: []
      };

      projectsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.team && Array.isArray(data.team)) {
          projectsAnalysis.withTeam++;
          projectsAnalysis.totalMembers += data.team.length;
          
          if (projectsAnalysis.samples.length < 2) {
            projectsAnalysis.samples.push({
              id: doc.id,
              title: data.title || 'N/A',
              teamSize: data.team.length
            });
          }
        }
      });

      results.collections.projects = projectsAnalysis;
      console.log('📊 Projects:', projectsAnalysis);

      // 5️⃣ RÉSUMÉ ET RECOMMANDATIONS
      const totalPotential = Math.max(
        usersAnalysis.withEmail,
        statsAnalysis.withEmail,
        teamAnalysis.withEmail
      );

      console.log('\n🎯 === RÉSUMÉ ===');
      console.log(`Total potentiel de membres: ${totalPotential}`);
      console.log(`Sources principales: users(${usersAnalysis.withEmail}), stats(${statsAnalysis.withEmail}), team(${teamAnalysis.withEmail})`);
      
      if (teamAnalysis.withEmail === 0 && usersAnalysis.withEmail > 0) {
        console.log('💡 PROBLÈME IDENTIFIÉ: teamMembers vide mais users peuplé');
        console.log('   SOLUTION: Utiliser users comme source principale');
      }

      setDiagnostic(results);
      return results;

    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      setError(`Erreur diagnostic: ${error.message}`);
      return { error: error.message };
    }
  };

  /**
   * 📋 RÉCUPÉRATION INTELLIGENTE DES MEMBRES
   */
  const loadMembersIntelligent = async () => {
    setLoading(true);
    setError(null);
    
    console.log('📋 Récupération intelligente des membres...');
    
    try {
      const membersMap = new Map();
      let totalLoaded = 0;

      // 1️⃣ PRIORISER COLLECTION USERS (source principale)
      try {
        console.log('1️⃣ Chargement depuis USERS...');
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.email) {
            const member = {
              id: doc.id,
              email: data.email,
              displayName: data.displayName || data.email.split('@')[0],
              photoURL: data.photoURL,
              role: data.role || 'Membre',
              department: data.department || 'Non spécifié',
              isActive: data.isActive !== false,
              level: data.level || 1,
              xp: data.totalXp || 0,
              tasksCompleted: 0,
              joinedAt: data.createdAt,
              lastActivity: data.lastActivity || data.createdAt,
              source: 'users',
              sourceColor: 'text-blue-400',
              synergiaRoles: [],
              projects: []
            };
            membersMap.set(doc.id, member);
            totalLoaded++;
          }
        });
        
        console.log(`✅ Users: ${totalLoaded} membres chargés`);
        
      } catch (error) {
        console.warn('⚠️ Erreur users:', error);
      }

      // 2️⃣ ENRICHIR AVEC USERSTATS
      try {
        console.log('2️⃣ Enrichissement avec USERSTATS...');
        const statsSnapshot = await getDocs(collection(db, 'userStats'));
        let enriched = 0;
        
        statsSnapshot.forEach((doc) => {
          const data = doc.data();
          const existingMember = membersMap.get(doc.id);
          
          if (existingMember) {
            // Enrichir membre existant
            existingMember.level = Math.max(existingMember.level, data.level || 1);
            existingMember.xp = Math.max(existingMember.xp, data.totalXp || 0);
            existingMember.tasksCompleted = data.tasksCompleted || 0;
            existingMember.tasksCreated = data.tasksCreated || 0;
            existingMember.projectsCreated = data.projectsCreated || 0;
            existingMember.badges = data.badges || [];
            if (data.lastLoginDate) {
              existingMember.lastActivity = data.lastLoginDate;
            }
            enriched++;
          } else if (data.email) {
            // Créer nouveau membre depuis stats
            const member = {
              id: doc.id,
              email: data.email,
              displayName: data.displayName || data.email.split('@')[0],
              photoURL: null,
              role: 'Membre',
              department: 'Non spécifié',
              isActive: true,
              level: data.level || 1,
              xp: data.totalXp || 0,
              tasksCompleted: data.tasksCompleted || 0,
              tasksCreated: data.tasksCreated || 0,
              joinedAt: data.createdAt,
              lastActivity: data.lastLoginDate,
              source: 'userStats',
              sourceColor: 'text-green-400',
              synergiaRoles: [],
              projects: []
            };
            membersMap.set(doc.id, member);
            totalLoaded++;
          }
        });
        
        console.log(`✅ UserStats: ${enriched} enrichis, total: ${totalLoaded}`);
        
      } catch (error) {
        console.warn('⚠️ Erreur userStats:', error);
      }

      // 3️⃣ ENRICHIR AVEC TEAMMEMBERS
      try {
        console.log('3️⃣ Enrichissement avec TEAMMEMBERS...');
        const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
        let teamEnriched = 0;
        
        teamSnapshot.forEach((doc) => {
          const data = doc.data();
          const existingMember = membersMap.get(doc.id);
          
          if (existingMember) {
            // Enrichir avec données spécifiques équipe
            if (data.synergiaRoles) {
              existingMember.synergiaRoles = data.synergiaRoles;
            }
            if (data.department) {
              existingMember.department = data.department;
            }
            if (data.status) {
              existingMember.isActive = data.status !== 'inactive';
            }
            teamEnriched++;
          } else if (data.email || data.displayName) {
            // Créer depuis teamMembers si pas trouvé ailleurs
            const member = {
              id: doc.id,
              email: data.email || 'email@equipe.com',
              displayName: data.displayName || 'Membre Équipe',
              photoURL: data.photoURL,
              role: data.role || 'Membre',
              department: data.department || 'Non spécifié',
              isActive: data.status !== 'inactive',
              level: data.teamStats?.level || 1,
              xp: data.teamStats?.totalXp || 0,
              tasksCompleted: 0,
              joinedAt: data.createdAt,
              lastActivity: data.updatedAt,
              source: 'teamMembers',
              sourceColor: 'text-purple-400',
              synergiaRoles: data.synergiaRoles || [],
              projects: []
            };
            membersMap.set(doc.id, member);
            totalLoaded++;
          }
        });
        
        console.log(`✅ TeamMembers: ${teamEnriched} enrichis, total: ${totalLoaded}`);
        
      } catch (error) {
        console.warn('⚠️ Erreur teamMembers:', error);
      }

      // 4️⃣ AJOUTER MEMBRES DEPUIS PROJETS
      try {
        console.log('4️⃣ Ajout depuis PROJETS...');
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        let projectMembers = 0;
        
        projectsSnapshot.forEach((doc) => {
          const data = doc.data();
          
          if (data.team && Array.isArray(data.team)) {
            data.team.forEach((teamMember) => {
              const existingMember = membersMap.get(teamMember.userId);
              
              if (existingMember) {
                // Ajouter projet à membre existant
                if (!existingMember.projects) existingMember.projects = [];
                existingMember.projects.push({
                  id: doc.id,
                  title: data.title,
                  role: teamMember.role
                });
              } else if (teamMember.userId) {
                // Créer membre depuis projet
                const member = {
                  id: teamMember.userId,
                  email: teamMember.email || 'email@projet.com',
                  displayName: teamMember.displayName || 'Membre Projet',
                  photoURL: null,
                  role: teamMember.role || 'Contributeur',
                  department: 'Projet',
                  isActive: true,
                  level: 1,
                  xp: 0,
                  tasksCompleted: 0,
                  joinedAt: teamMember.joinedAt,
                  lastActivity: teamMember.joinedAt,
                  source: 'projects',
                  sourceColor: 'text-orange-400',
                  synergiaRoles: [],
                  projects: [{
                    id: doc.id,
                    title: data.title,
                    role: teamMember.role
                  }]
                };
                membersMap.set(teamMember.userId, member);
                projectMembers++;
                totalLoaded++;
              }
            });
          }
        });
        
        console.log(`✅ Projects: ${projectMembers} membres projet, total: ${totalLoaded}`);
        
      } catch (error) {
        console.warn('⚠️ Erreur projects:', error);
      }

      // 5️⃣ FINALISER ET TRIER
      const finalMembers = Array.from(membersMap.values())
        .sort((a, b) => {
          // Prioriser actifs
          if (a.isActive !== b.isActive) {
            return b.isActive ? 1 : -1;
          }
          // Puis par niveau
          return (b.level || 0) - (a.level || 0);
        });

      setMembers(finalMembers);
      
      console.log(`🎉 TOTAL FINAL: ${finalMembers.length} membres uniques chargés`);
      console.log('📊 Répartition sources:', {
        users: finalMembers.filter(m => m.source === 'users').length,
        userStats: finalMembers.filter(m => m.source === 'userStats').length,
        teamMembers: finalMembers.filter(m => m.source === 'teamMembers').length,
        projects: finalMembers.filter(m => m.source === 'projects').length
      });

    } catch (error) {
      console.error('❌ Erreur chargement membres:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    if (user) {
      console.log('🚀 TeamPage initialisée pour:', user.email);
      
      // D'abord faire le diagnostic
      runDiagnostic().then(() => {
        // Puis charger les membres
        loadMembersIntelligent();
      });
    }
  }, [user]);

  // Fonction de rafraîchissement
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      runDiagnostic(),
      loadMembersIntelligent()
    ]);
  };

  // Filtrer les membres
  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (member.displayName || '').toLowerCase().includes(search) ||
      (member.email || '').toLowerCase().includes(search) ||
      (member.role || '').toLowerCase().includes(search) ||
      (member.department || '').toLowerCase().includes(search)
    );
  });

  // Statistiques
  const stats = {
    total: members.length,
    active: members.filter(m => m.isActive).length,
    inactive: members.filter(m => !m.isActive).length,
    avgLevel: members.length > 0 ? 
      Math.round(members.reduce((sum, m) => sum + (m.level || 1), 0) / members.length) : 1,
    totalXp: members.reduce((sum, m) => sum + (m.xp || 0), 0),
    sources: {
      users: members.filter(m => m.source === 'users').length,
      userStats: members.filter(m => m.source === 'userStats').length,
      teamMembers: members.filter(m => m.source === 'teamMembers').length,
      projects: members.filter(m => m.source === 'projects').length
    }
  };

  // Si chargement initial
  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Diagnostic et chargement des membres...</p>
          <p className="text-gray-400 text-sm mt-2">
            Analyse des collections Firebase en cours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Équipe - Diagnostic Firebase
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-green-400">{stats.active}</div>
              <div className="text-xs text-gray-400">Actifs</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-purple-400">{stats.avgLevel}</div>
              <div className="text-xs text-gray-400">Niveau Moy.</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-yellow-400">{stats.totalXp.toLocaleString()}</div>
              <div className="text-xs text-gray-400">XP Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xl font-bold text-orange-400">{Object.keys(stats.sources).length}</div>
              <div className="text-xs text-gray-400">Sources</div>
            </div>
          </div>

          {/* Debug sources */}
          <div className="text-xs text-gray-500 flex items-center justify-center gap-4 flex-wrap">
            <span>Sources Firebase: </span>
            {Object.entries(stats.sources).map(([source, count]) => (
              <span key={source} className="bg-gray-800/30 px-2 py-1 rounded">
                {source}: {count}
              </span>
            ))}
          </div>
        </div>

        {/* Contrôles */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Boutons actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'overview' ? 'diagnostic' : 'overview')}
                className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                {activeTab === 'overview' ? 'Voir Diagnostic' : 'Voir Équipe'}
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-purple-600 border border-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          
          {/* ONGLET VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="p-6">
              
              {/* Messages d'erreur */}
              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Erreur</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              )}

              {/* Grille membres */}
              {filteredMembers.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Membres de l'équipe ({filteredMembers.length})
                    </h3>
                    {searchTerm && (
                      <span className="text-sm text-gray-400">
                        Filtré sur: "{searchTerm}"
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/70 transition-colors"
                      >
                        {/* Header membre */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">
                              {member.displayName || 'Nom inconnu'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400 truncate">
                                {member.email || 'Email non disponible'}
                              </span>
                            </div>
                          </div>

                          {/* Statut */}
                          <div className="flex items-center gap-1">
                            {member.isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>

                        {/* Informations */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Rôle:</span>
                            <span className="text-gray-300">{member.role}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Département:</span>
                            <span className="text-gray-300">{member.department}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Niveau:</span>
                            <span className="text-blue-400 font-medium">
                              Niv. {member.level} ({member.xp} XP)
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Source:</span>
                            <span className={member.sourceColor}>
                              {member.source}
                            </span>
                          </div>

                          {/* Rôles Synergia */}
                          {member.synergiaRoles && member.synergiaRoles.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-400">Rôles Synergia:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.synergiaRoles.slice(0, 2).map((role, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30"
                                  >
                                    {typeof role === 'string' ? role : role.name}
                                  </span>
                                ))}
                                {member.synergiaRoles.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{member.synergiaRoles.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Projets */}
                          {member.projects && member.projects.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-400">Projets:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.projects.slice(0, 2).map((project, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-600/30"
                                  >
                                    {project.title}
                                  </span>
                                ))}
                                {member.projects.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{member.projects.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    {searchTerm ? 'Aucun membre trouvé' : 'Aucun membre chargé'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Essayez de modifier vos critères de recherche' 
                      : 'Vérifiez la console pour le diagnostic des collections'
                    }
                  </p>
                  
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Diagnostiquer et Recharger
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ONGLET DIAGNOSTIC */}
          {activeTab === 'diagnostic' && (
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Diagnostic des Collections Firebase</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Statistiques sources */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Sources de données
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(stats.sources).map(([source, count]) => (
                      <div key={source} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{source}:</span>
                        <span className="text-blue-400 font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistiques générales */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Statistiques générales
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total membres:</span>
                      <span className="text-white font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actifs:</span>
                      <span className="text-green-400 font-medium">{stats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inactifs:</span>
                      <span className="text-red-400 font-medium">{stats.inactive}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Niveau moyen:</span>
                      <span className="text-purple-400 font-medium">{stats.avgLevel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic des collections */}
              {diagnostic.collections && (
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Détail des collections</h4>
                  <div className="space-y-3 text-sm">
                    {Object.entries(diagnostic.collections).map(([collectionName, data]) => (
                      <div key={collectionName} className="border-l-2 border-blue-400 pl-3">
                        <div className="font-medium text-gray-300 capitalize">{collectionName}</div>
                        <div className="text-gray-400">
                          Total: {data.total} | Valides: {data.withEmail || data.active || 'N/A'}
                        </div>
                        {data.samples && data.samples.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Échantillon: {data.samples[0]?.email || data.samples[0]?.title || 'N/A'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions de diagnostic */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={runDiagnostic}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 rounded text-sm transition-colors"
                >
                  Relancer diagnostic
                </button>
                
                <button
                  onClick={() => console.log('📊 Diagnostic complet:', diagnostic)}
                  className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 text-gray-400 rounded text-sm transition-colors"
                >
                  Voir en console
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ EXPORT PAR DÉFAUT OBLIGATOIRE
export default TeamPage;
