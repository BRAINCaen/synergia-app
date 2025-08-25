// ==========================================
// 📁 react-app/src/pages/AdminDemoCleanerPage.jsx
// PAGE ADMIN - NETTOYAGE DES DONNÉES DE DÉMONSTRATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Database,
  Users,
  FileText,
  Calendar,
  Award,
  MessageSquare,
  Zap,
  Shield,
  Eye,
  Download,
  Upload,
  Clock,
  BarChart3,
  Filter,
  Search,
  X,
  Play,
  Pause,
  Stop,
  Settings,
  Info,
  ExternalLink
} from 'lucide-react';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

// Layout
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../components/layout/PremiumLayout.jsx';

// Firebase
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase.config.js';

const AdminDemoCleanerPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  
  // États des données
  const [demoData, setDemoData] = useState(null);
  const [cleaningResults, setCleaningResults] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  // ✅ CONFIGURATION DES CATÉGORIES DE DONNÉES DÉMO
  const DEMO_CATEGORIES = {
    testUsers: {
      id: 'testUsers',
      name: 'Utilisateurs de Test',
      icon: Users,
      color: 'text-blue-400',
      description: 'Comptes utilisateurs créés pour les tests',
      collection: 'users',
      identifiers: ['test@', 'demo@', 'exemple@', 'admin@test'],
      dangerous: false
    },
    sampleTasks: {
      id: 'sampleTasks',
      name: 'Tâches d\'Exemple',
      icon: FileText,
      color: 'text-green-400',
      description: 'Tâches créées pour la démonstration',
      collection: 'tasks',
      identifiers: ['Demo:', 'Test:', 'Exemple:', 'Sample:'],
      dangerous: false
    },
    testProjects: {
      id: 'testProjects',
      name: 'Projets de Test',
      icon: Calendar,
      color: 'text-purple-400',
      description: 'Projets créés pour les tests',
      collection: 'projects',
      identifiers: ['Test Project', 'Demo Project', 'Projet Test'],
      dangerous: false
    },
    demoNotifications: {
      id: 'demoNotifications',
      name: 'Notifications de Démo',
      icon: MessageSquare,
      color: 'text-yellow-400',
      description: 'Notifications générées pour la démonstration',
      collection: 'notifications',
      identifiers: ['demo_', 'test_', 'sample_'],
      dangerous: false
    },
    testBadges: {
      id: 'testBadges',
      name: 'Badges de Test',
      icon: Award,
      color: 'text-orange-400',
      description: 'Badges attribués lors des tests',
      collection: 'user_badges',
      identifiers: ['test_badge', 'demo_badge'],
      dangerous: false
    },
    oldLogs: {
      id: 'oldLogs',
      name: 'Anciens Logs',
      icon: BarChart3,
      color: 'text-gray-400',
      description: 'Logs système de plus de 30 jours',
      collection: 'system_logs',
      identifiers: [],
      dangerous: false,
      dateFilter: true
    },
    productionData: {
      id: 'productionData',
      name: '⚠️ Données Production',
      icon: Shield,
      color: 'text-red-400',
      description: 'ATTENTION: Données réelles de production',
      collection: 'users',
      identifiers: [],
      dangerous: true
    }
  };

  // ✅ CHARGEMENT DES DONNÉES AU MONTAGE
  useEffect(() => {
    loadDemoData();
  }, []);

  // 📊 CHARGER LES DONNÉES DE DÉMONSTRATION
  const loadDemoData = async () => {
    try {
      setIsLoading(true);
      
      const data = {};
      
      // Analyser chaque catégorie
      for (const category of Object.values(DEMO_CATEGORIES)) {
        if (category.dangerous) continue; // Skip les données dangereuses pour l'analyse
        
        data[category.id] = await analyzeCategoryData(category);
      }
      
      setDemoData(data);
      console.log('✅ Données démo analysées:', data);
      
    } catch (error) {
      console.error('❌ Erreur chargement données démo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 ANALYSER LES DONNÉES D'UNE CATÉGORIE
  const analyzeCategoryData = async (category) => {
    try {
      const snapshot = await getDocs(collection(db, category.collection));
      
      const items = [];
      let totalSize = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Vérifier si c'est un élément de démo
        const isDemo = category.identifiers.some(identifier => {
          if (data.email && typeof data.email === 'string') {
            return data.email.toLowerCase().includes(identifier.toLowerCase());
          }
          if (data.title && typeof data.title === 'string') {
            return data.title.includes(identifier);
          }
          if (data.name && typeof data.name === 'string') {
            return data.name.includes(identifier);
          }
          if (data.type && typeof data.type === 'string') {
            return data.type.includes(identifier);
          }
          return false;
        });
        
        // Filtre par date pour les anciens logs
        const isOldLog = category.dateFilter && data.createdAt && 
          (new Date() - (data.createdAt.toDate?.() || new Date(data.createdAt))) > (30 * 24 * 60 * 60 * 1000);
        
        if (isDemo || isOldLog) {
          const itemSize = JSON.stringify(data).length;
          totalSize += itemSize;
          
          items.push({
            id: doc.id,
            data,
            size: itemSize,
            type: isDemo ? 'demo' : 'old',
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now())
          });
        }
      });
      
      return {
        total: snapshot.size,
        demoCount: items.length,
        items: items.slice(0, 10), // Garder seulement les 10 premiers pour l'affichage
        allItems: items,
        totalSize,
        averageSize: items.length > 0 ? Math.round(totalSize / items.length) : 0
      };
      
    } catch (error) {
      console.error(`❌ Erreur analyse ${category.name}:`, error);
      return {
        total: 0,
        demoCount: 0,
        items: [],
        allItems: [],
        totalSize: 0,
        averageSize: 0,
        error: error.message
      };
    }
  };

  // 🧹 NETTOYER LES DONNÉES SÉLECTIONNÉES
  const performCleanup = async () => {
    if (selectedCategories.length === 0) {
      alert('Veuillez sélectionner au moins une catégorie à nettoyer');
      return;
    }
    
    if (!confirmCleanup) {
      alert('Veuillez confirmer que vous voulez supprimer ces données');
      return;
    }
    
    try {
      setIsCleaning(true);
      setCleaningProgress(0);
      
      const results = {
        totalDeleted: 0,
        categoriesProcessed: 0,
        errors: [],
        details: {}
      };
      
      const totalCategories = selectedCategories.length;
      
      for (let i = 0; i < selectedCategories.length; i++) {
        const categoryId = selectedCategories[i];
        const category = DEMO_CATEGORIES[categoryId];
        const categoryData = demoData[categoryId];
        
        console.log(`🧹 Nettoyage de ${category.name}...`);
        
        try {
          const deletedCount = await cleanupCategory(category, categoryData);
          
          results.details[categoryId] = {
            name: category.name,
            deleted: deletedCount,
            success: true
          };
          
          results.totalDeleted += deletedCount;
          results.categoriesProcessed++;
          
        } catch (error) {
          console.error(`❌ Erreur nettoyage ${category.name}:`, error);
          
          results.details[categoryId] = {
            name: category.name,
            deleted: 0,
            success: false,
            error: error.message
          };
          
          results.errors.push(`${category.name}: ${error.message}`);
        }
        
        // Mettre à jour la progression
        setCleaningProgress(Math.round(((i + 1) / totalCategories) * 100));
      }
      
      setCleaningResults(results);
      
      // Sauvegarder l'action dans les logs
      await saveCleaningLog(results);
      
      // Recharger les données
      await loadDemoData();
      
      // Réinitialiser les sélections
      setSelectedCategories([]);
      setConfirmCleanup(false);
      
      console.log('✅ Nettoyage terminé:', results);
      
    } catch (error) {
      console.error('❌ Erreur nettoyage global:', error);
      setCleaningResults({ error: error.message });
    } finally {
      setIsCleaning(false);
      setCleaningProgress(0);
    }
  };

  // 🗑️ NETTOYER UNE CATÉGORIE
  const cleanupCategory = async (category, categoryData) => {
    if (!categoryData?.allItems?.length) return 0;
    
    const batch = writeBatch(db);
    let deleteCount = 0;
    
    // Traiter par lots de 500 (limite Firestore)
    const batchSize = 500;
    const items = categoryData.allItems;
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batchItems = items.slice(i, i + batchSize);
      
      batchItems.forEach(item => {
        const docRef = doc(db, category.collection, item.id);
        batch.delete(docRef);
        deleteCount++;
      });
      
      await batch.commit();
    }
    
    return deleteCount;
  };

  // 📝 SAUVEGARDER LE LOG DE NETTOYAGE
  const saveCleaningLog = async (results) => {
    try {
      const logDoc = doc(collection(db, 'admin_logs'));
      await updateDoc(logDoc, {
        type: 'demo_cleanup',
        admin: user.displayName || user.email,
        timestamp: serverTimestamp(),
        results,
        categories: selectedCategories
      });
    } catch (error) {
      console.error('❌ Erreur sauvegarde log:', error);
    }
  };

  // 🎯 BASCULER LA SÉLECTION D'UNE CATÉGORIE
  const toggleCategory = (categoryId) => {
    const category = DEMO_CATEGORIES[categoryId];
    
    // Vérification de sécurité pour les données dangereuses
    if (category.dangerous && !confirm(`⚠️ ATTENTION: Vous êtes sur le point de sélectionner des données de production.\n\nCeci peut supprimer des données réelles et importantes.\n\nÊtes-vous absolument certain de vouloir continuer ?`)) {
      return;
    }
    
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // 📊 CALCULER LES STATISTIQUES GLOBALES
  const getGlobalStats = () => {
    if (!demoData) return { totalDemo: 0, totalSize: 0, categories: 0 };
    
    return Object.values(demoData).reduce(
      (acc, categoryData) => ({
        totalDemo: acc.totalDemo + categoryData.demoCount,
        totalSize: acc.totalSize + categoryData.totalSize,
        categories: acc.categories + (categoryData.demoCount > 0 ? 1 : 0)
      }),
      { totalDemo: 0, totalSize: 0, categories: 0 }
    );
  };

  const globalStats = getGlobalStats();

  // 📊 STATISTIQUES POUR L'EN-TÊTE
  const headerStats = [
    { 
      label: "Données Démo", 
      value: globalStats.totalDemo.toString(), 
      icon: Database, 
      color: globalStats.totalDemo > 50 ? "text-red-400" : globalStats.totalDemo > 20 ? "text-yellow-400" : "text-green-400" 
    },
    { 
      label: "Catégories", 
      value: globalStats.categories.toString(), 
      icon: Filter, 
      color: "text-blue-400" 
    },
    { 
      label: "Taille Totale", 
      value: `${(globalStats.totalSize / 1024).toFixed(1)}KB`, 
      icon: BarChart3, 
      color: "text-purple-400" 
    },
    { 
      label: "Sélectionnées", 
      value: selectedCategories.length.toString(), 
      icon: CheckCircle, 
      color: selectedCategories.length > 0 ? "text-green-400" : "text-gray-400" 
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={loadDemoData}
        disabled={isLoading || isCleaning}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton 
        variant="danger" 
        icon={isCleaning ? RefreshCw : Trash2}
        onClick={performCleanup}
        disabled={isLoading || isCleaning || selectedCategories.length === 0}
        className={isCleaning ? "animate-pulse" : ""}
      >
        {isCleaning ? `Nettoyage... ${cleaningProgress}%` : `Nettoyer (${selectedCategories.length})`}
      </PremiumButton>
    </div>
  );

  // ✅ INTERFACE DE CHARGEMENT
  if (isLoading) {
    return (
      <PremiumLayout
        title="Nettoyage Données Démo"
        subtitle="Chargement..."
        icon={Trash2}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white">Analyse des données de démonstration...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Nettoyage Données Démo"
      subtitle="Suppression des données de test et démonstration"
      icon={Trash2}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Barre de progression du nettoyage */}
      {isCleaning && (
        <div className="mb-6">
          <PremiumCard>
            <div className="text-center py-4">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Nettoyage en cours...</h3>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cleaningProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">{cleaningProgress}% terminé</p>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Onglets de navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
          { id: 'categories', label: 'Catégories', icon: Filter },
          { id: 'results', label: 'Résultats', icon: CheckCircle },
          { id: 'settings', label: 'Paramètres', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'results' && cleaningResults && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && demoData && (
        <div className="space-y-6">
          {/* Résumé global */}
          <PremiumCard>
            <div className="text-center py-8">
              <Trash2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-semibold mb-2">
                {globalStats.totalDemo} éléments de démonstration détectés
              </h3>
              <p className="text-gray-400 mb-6">
                Répartis sur {globalStats.categories} catégories - {(globalStats.totalSize / 1024).toFixed(2)}KB total
              </p>
              
              {globalStats.totalDemo > 0 ? (
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Nettoyage recommandé</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    Des données de démonstration ont été détectées dans votre base de données
                  </p>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Base de données propre</span>
                  </div>
                  <p className="text-green-200 text-sm">
                    Aucune donnée de démonstration détectée
                  </p>
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Aperçu des catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(DEMO_CATEGORIES).map(category => {
              const categoryData = demoData[category.id] || { demoCount: 0, totalSize: 0 };
              const IconComponent = category.icon;
              
              return (
                <PremiumCard key={category.id} className={category.dangerous ? "border-red-500/50" : ""}>
                  <div className="text-center">
                    <div className={`${category.color} mb-3`}>
                      <IconComponent className="w-8 h-8 mx-auto" />
                    </div>
                    
                    <h4 className="text-white font-medium mb-2">{category.name}</h4>
                    <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Éléments démo:</span>
                        <span className={`font-medium ${categoryData.demoCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {categoryData.demoCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Taille:</span>
                        <span className="text-white">{(categoryData.totalSize / 1024).toFixed(2)}KB</span>
                      </div>
                    </div>

                    {category.dangerous && (
                      <div className="mt-3 bg-red-900/20 border border-red-500/50 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 text-red-400 text-xs">
                          <Shield className="w-3 h-3" />
                          DONNÉES CRITIQUES
                        </div>
                      </div>
                    )}
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'categories' && demoData && (
        <div className="space-y-6">
          {/* Sélecteur global */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Sélection des catégories</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategories(
                    Object.values(DEMO_CATEGORIES)
                      .filter(cat => !cat.dangerous && demoData[cat.id]?.demoCount > 0)
                      .map(cat => cat.id)
                  )}
                  className="text-sm px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                >
                  Sélectionner tout (sauf données critiques)
                </button>
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-sm px-3 py-1 bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30 transition-colors"
                >
                  Désélectionner tout
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.values(DEMO_CATEGORIES).map(category => {
                const categoryData = demoData[category.id] || { demoCount: 0, items: [], totalSize: 0 };
                const isSelected = selectedCategories.includes(category.id);
                const IconComponent = category.icon;
                
                return (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      category.dangerous 
                        ? 'border-red-500/50 bg-red-900/10' 
                        : isSelected
                        ? 'border-red-500 bg-red-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    } ${categoryData.demoCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${category.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{category.name}</h4>
                          <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-white font-medium">{categoryData.demoCount}</div>
                          <div className="text-gray-400 text-sm">{(categoryData.totalSize / 1024).toFixed(1)}KB</div>
                        </div>
                        
                        <div className={`w-5 h-5 border-2 rounded ${
                          isSelected ? 'bg-red-500 border-red-500' : 'border-gray-600'
                        } flex items-center justify-center`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>

                    {/* Aperçu des éléments */}
                    {isSelected && categoryData.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h5 className="text-gray-400 text-sm mb-2">Aperçu des éléments à supprimer:</h5>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {categoryData.items.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-500 truncate">
                              • {item.data.email || item.data.title || item.data.name || item.id}
                            </div>
                          ))}
                          {categoryData.items.length > 5 && (
                            <div className="text-xs text-gray-500">
                              ... et {categoryData.items.length - 5} autres
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          {/* Confirmation de suppression */}
          {selectedCategories.length > 0 && (
            <PremiumCard className="border-red-500/50">
              <div className="text-center py-6">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">Confirmation requise</h3>
                <p className="text-gray-400 mb-6">
                  Vous êtes sur le point de supprimer {selectedCategories.reduce((sum, catId) => 
                    sum + (demoData[catId]?.demoCount || 0), 0
                  )} éléments dans {selectedCategories.length} catégorie(s).
                </p>
                
                <div className="flex items-center justify-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="confirmCleanup"
                    checked={confirmCleanup}
                    onChange={(e) => setConfirmCleanup(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="confirmCleanup" className="text-white text-sm">
                    Je confirme vouloir supprimer définitivement ces données
                  </label>
                </div>

                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    ⚠️ Cette action est irréversible. Les données supprimées ne pourront pas être récupérées.
                  </p>
                </div>
              </div>
            </PremiumCard>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">📊 Résultats du Nettoyage</h3>
            
            {!cleaningResults ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Aucun nettoyage effectué récemment</p>
              </div>
            ) : cleaningResults.error ? (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h4 className="text-red-400 font-medium">Erreur de nettoyage</h4>
                </div>
                <p className="text-red-200">{cleaningResults.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Résumé */}
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h4 className="text-green-400 font-medium">Nettoyage terminé avec succès</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{cleaningResults.totalDeleted}</div>
                      <div className="text-sm text-gray-400">Éléments supprimés</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{cleaningResults.categoriesProcessed}</div>
                      <div className="text-sm text-gray-400">Catégories traitées</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{cleaningResults.errors.length}</div>
                      <div className="text-sm text-gray-400">Erreurs</div>
                    </div>
                  </div>
                </div>

                {/* Détail par catégorie */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Détail par catégorie</h4>
                  {Object.entries(cleaningResults.details).map(([categoryId, result]) => (
                    <div
                      key={categoryId}
                      className={`border rounded-lg p-4 ${
                        result.success ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                          <span className="text-white font-medium">{result.name}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {result.deleted} supprimé(s)
                          </div>
                          {result.error && (
                            <div className="text-red-400 text-sm">{result.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Erreurs */}
                {cleaningResults.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h4 className="text-red-400 font-medium mb-2">⚠️ Erreurs rencontrées</h4>
                    <ul className="space-y-1">
                      {cleaningResults.errors.map((error, idx) => (
                        <li key={idx} className="text-red-200 text-sm">• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">⚙️ Paramètres de Nettoyage</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-2">Sécurité</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <span className="text-white">Confirmation requise</span>
                      <p className="text-gray-400 text-sm">Demander confirmation avant suppression</p>
                    </div>
                    <div className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <span className="text-white">Protection données production</span>
                      <p className="text-gray-400 text-sm">Avertir lors de sélection de données critiques</p>
                    </div>
                    <div className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Logs et Historique</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <span className="text-white">Sauvegarder les logs</span>
                      <p className="text-gray-400 text-sm">Enregistrer les actions de nettoyage</p>
                    </div>
                    <div className="w-12 h-6 bg-green-600 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Nettoyage automatique</h4>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">Fonctionnalité à venir</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    Le nettoyage automatique programmé sera disponible dans une prochaine version
                  </p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default AdminDemoCleanerPage;
