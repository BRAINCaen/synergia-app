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

// Layout - CHEMIN CORRIGÉ
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

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
import { db } from '../core/firebase.js';

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
      demoFilter: (doc) => doc.data()?.email?.includes('test') || doc.data()?.displayName?.includes('Test'),
      dangerous: false
    },
    demoTasks: {
      id: 'demoTasks',
      name: 'Tâches de Démonstration',
      icon: FileText,
      color: 'text-green-400',
      description: 'Tâches créées pour la démonstration',
      collection: 'tasks',
      demoFilter: (doc) => doc.data()?.title?.includes('[DEMO]') || doc.data()?.isDemo === true,
      dangerous: false
    },
    sampleProjects: {
      id: 'sampleProjects',
      name: 'Projets Échantillons',
      icon: Database,
      color: 'text-purple-400',
      description: 'Projets créés comme exemples',
      collection: 'projects',
      demoFilter: (doc) => doc.data()?.name?.includes('Sample') || doc.data()?.isTemplate === true,
      dangerous: false
    },
    testRewards: {
      id: 'testRewards',
      name: 'Récompenses de Test',
      icon: Award,
      color: 'text-yellow-400',
      description: 'Badges et récompenses de démonstration',
      collection: 'userRewards',
      demoFilter: (doc) => doc.data()?.source === 'demo' || doc.data()?.isTest === true,
      dangerous: false
    },
    demoComments: {
      id: 'demoComments',
      name: 'Commentaires Démo',
      icon: MessageSquare,
      color: 'text-pink-400',
      description: 'Commentaires créés pour la démo',
      collection: 'comments',
      demoFilter: (doc) => doc.data()?.content?.includes('[TEST]') || doc.data()?.isDemo === true,
      dangerous: false
    },
    analyticsDemo: {
      id: 'analyticsDemo',
      name: 'Données Analytics Test',
      icon: BarChart3,
      color: 'text-cyan-400',
      description: 'Données analytiques générées pour les tests',
      collection: 'analytics',
      demoFilter: (doc) => doc.data()?.source === 'demo' || doc.data()?.synthetic === true,
      dangerous: true // ⚠️ Données potentiellement importantes
    }
  };

  // ✅ CHARGEMENT DES DONNÉES AU MONTAGE
  useEffect(() => {
    loadDemoData();
  }, []);

  // 📊 CHARGER LES DONNÉES DE DÉMONSTRATION
  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 [DEMO-CLEANER] Analyse des données de démonstration...');
      
      const analysisResults = {};
      let totalDemoItems = 0;
      let totalSize = 0;

      // Analyser chaque catégorie
      for (const [categoryId, category] of Object.entries(DEMO_CATEGORIES)) {
        try {
          const collectionRef = collection(db, category.collection);
          const snapshot = await getDocs(collectionRef);
          
          let demoItems = [];
          let categorySize = 0;

          snapshot.docs.forEach(doc => {
            if (category.demoFilter(doc)) {
              const data = doc.data();
              const itemSize = JSON.stringify(data).length;
              demoItems.push({
                id: doc.id,
                data: data,
                size: itemSize
              });
              categorySize += itemSize;
            }
          });

          analysisResults[categoryId] = {
            demoCount: demoItems.length,
            totalSize: categorySize,
            items: demoItems,
            lastAnalysis: new Date().toISOString()
          };

          totalDemoItems += demoItems.length;
          totalSize += categorySize;

          console.log(`📋 [${category.name}] ${demoItems.length} éléments démo trouvés (${(categorySize/1024).toFixed(2)}KB)`);
        } catch (error) {
          console.error(`❌ [DEMO-CLEANER] Erreur analyse ${categoryId}:`, error);
          analysisResults[categoryId] = {
            demoCount: 0,
            totalSize: 0,
            items: [],
            error: error.message
          };
        }
      }

      setDemoData(analysisResults);
      console.log(`✅ [DEMO-CLEANER] Analyse terminée: ${totalDemoItems} éléments démo trouvés`);
      
    } catch (error) {
      console.error('❌ [DEMO-CLEANER] Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🗑️ EFFECTUER LE NETTOYAGE
  const performCleanup = async () => {
    if (selectedCategories.length === 0) {
      alert('Veuillez sélectionner au moins une catégorie à nettoyer');
      return;
    }

    if (!confirmCleanup) {
      setConfirmCleanup(true);
      return;
    }

    setIsCleaning(true);
    setCleaningProgress(0);

    try {
      console.log('🧹 [DEMO-CLEANER] Début du nettoyage...');
      
      const results = {
        deleted: {},
        errors: {},
        totalDeleted: 0,
        startTime: new Date().toISOString()
      };

      const totalItems = selectedCategories.reduce((sum, catId) => 
        sum + (demoData[catId]?.demoCount || 0), 0
      );
      let processedItems = 0;

      // Nettoyer chaque catégorie sélectionnée
      for (const categoryId of selectedCategories) {
        const category = DEMO_CATEGORIES[categoryId];
        const categoryData = demoData[categoryId];

        if (!categoryData || categoryData.demoCount === 0) continue;

        try {
          console.log(`🗑️ Nettoyage de ${category.name}...`);
          
          // Supprimer par lots pour éviter les timeouts
          const batch = writeBatch(db);
          let batchCount = 0;
          let deletedCount = 0;

          for (const item of categoryData.items) {
            const docRef = doc(db, category.collection, item.id);
            batch.delete(docRef);
            batchCount++;
            deletedCount++;

            // Executer le batch tous les 500 documents
            if (batchCount >= 500) {
              await batch.commit();
              batchCount = 0;
              console.log(`📦 Lot de 500 documents supprimé pour ${category.name}`);
            }

            processedItems++;
            setCleaningProgress(Math.round((processedItems / totalItems) * 100));
          }

          // Executer le batch restant
          if (batchCount > 0) {
            await batch.commit();
          }

          results.deleted[categoryId] = deletedCount;
          results.totalDeleted += deletedCount;
          
          console.log(`✅ ${category.name}: ${deletedCount} éléments supprimés`);

        } catch (error) {
          console.error(`❌ Erreur nettoyage ${categoryId}:`, error);
          results.errors[categoryId] = error.message;
        }
      }

      results.endTime = new Date().toISOString();
      results.duration = (new Date(results.endTime) - new Date(results.startTime)) / 1000;

      setCleaningResults(results);
      setConfirmCleanup(false);
      setSelectedCategories([]);
      
      // Recharger les données pour voir les changements
      setTimeout(loadDemoData, 1000);

      console.log('🎉 [DEMO-CLEANER] Nettoyage terminé:', results);
      
    } catch (error) {
      console.error('❌ [DEMO-CLEANER] Erreur lors du nettoyage:', error);
    } finally {
      setIsCleaning(false);
      setCleaningProgress(0);
    }
  };

  // 🔄 RÉINITIALISER LA CONFIRMATION
  const resetConfirmation = () => {
    setConfirmCleanup(false);
  };

  // 📊 STATISTIQUES DE L'HEADER
  const globalStats = demoData ? {
    totalDemo: Object.values(demoData).reduce((sum, cat) => sum + (cat.demoCount || 0), 0),
    categories: Object.keys(DEMO_CATEGORIES).length,
    totalSize: Object.values(demoData).reduce((sum, cat) => sum + (cat.totalSize || 0), 0)
  } : { totalDemo: 0, categories: 0, totalSize: 0 };

  const headerStats = [
    {
      title: "Éléments Démo",
      value: globalStats.totalDemo,
      icon: Database,
      color: globalStats.totalDemo > 0 ? "red" : "green"
    },
    {
      title: "Catégories",
      value: globalStats.categories,
      icon: Filter,
      color: "blue"
    },
    {
      title: "Taille Totale",
      value: `${(globalStats.totalSize / 1024).toFixed(1)}KB`,
      icon: HardDrive,
      color: "purple"
    }
  ];

  // 🔘 GESTION DE LA SÉLECTION DES CATÉGORIES
  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setConfirmCleanup(false); // Reset confirmation à chaque changement
  };

  // 🎨 COULEUR DU TAB SELON L'ÉTAT
  const getTabColor = (tabId) => {
    return activeTab === tabId 
      ? 'bg-red-600 text-white shadow-lg'
      : 'text-gray-400 hover:text-white hover:bg-gray-700/50';
  };

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
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${getTabColor(tab.id)}`}
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
                <PremiumCard key={category.id} className={category.dangerous ? 'border-l-4 border-l-red-500' : ''}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-6 h-6 ${category.color}`} />
                      <h4 className="text-white font-medium">{category.name}</h4>
                    </div>
                    {category.dangerous && (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Éléments trouvés</span>
                      <span className={`font-medium ${categoryData.demoCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {categoryData.demoCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Taille</span>
                      <span className="text-gray-300">
                        {(categoryData.totalSize / 1024).toFixed(2)}KB
                      </span>
                    </div>
                  </div>

                  {category.dangerous && categoryData.demoCount > 0 && (
                    <div className="mt-3 p-2 bg-red-900/20 border border-red-500/50 rounded">
                      <p className="text-red-200 text-xs">
                        ⚠️ Catégorie sensible - Vérifiez avant suppression
                      </p>
                    </div>
                  )}
                </PremiumCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Onglet Catégories */}
      {activeTab === 'categories' && demoData && (
        <div className="space-y-6">
          {/* Sélection multiple */}
          <PremiumCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Sélection des catégories à nettoyer</h3>
              <div className="flex gap-2">
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const allCategories = Object.keys(DEMO_CATEGORIES).filter(id => 
                      demoData[id] && demoData[id].demoCount > 0
                    );
                    setSelectedCategories(allCategories);
                    setConfirmCleanup(false);
                  }}
                >
                  Tout sélectionner
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedCategories([]);
                    setConfirmCleanup(false);
                  }}
                >
                  Tout déselectionner
                </PremiumButton>
              </div>
            </div>

            {confirmCleanup && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Confirmation de suppression</span>
                </div>
                <p className="text-red-200 text-sm mb-4">
                  Vous êtes sur le point de supprimer définitivement {selectedCategories.reduce((sum, catId) => sum + (demoData[catId]?.demoCount || 0), 0)} éléments.
                  Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <PremiumButton
                    variant="danger"
                    size="sm"
                    onClick={performCleanup}
                    disabled={isCleaning}
                  >
                    Confirmer la suppression
                  </PremiumButton>
                  <PremiumButton
                    variant="secondary"
                    size="sm"
                    onClick={resetConfirmation}
                  >
                    Annuler
                  </PremiumButton>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {Object.entries(DEMO_CATEGORIES).map(([categoryId, category]) => {
                const categoryData = demoData[categoryId] || { demoCount: 0, totalSize: 0 };
                const isSelected = selectedCategories.includes(categoryId);
                const IconComponent = category.icon;
                
                return (
                  <div
                    key={categoryId}
                    onClick={() => categoryData.demoCount > 0 && toggleCategorySelection(categoryId)}
                    className={`
                      flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer
                      ${categoryData.demoCount === 0 
                        ? 'bg-gray-800/30 border-gray-600/50 opacity-50 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-red-900/20 border-red-500/50 shadow-lg'
                          : 'bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50'
                      }
                      ${category.dangerous ? 'border-l-4 border-l-red-500' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-400'}
                        ${categoryData.demoCount === 0 ? 'opacity-50' : ''}
                      `}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${category.color} ${categoryData.demoCount === 0 ? 'opacity-50' : ''}`} />
                        <div>
                          <h4 className={`font-medium ${categoryData.demoCount === 0 ? 'text-gray-500' : 'text-white'}`}>
                            {category.name}
                            {category.dangerous && <AlertTriangle className="inline w-4 h-4 text-red-400 ml-2" />}
                          </h4>
                          <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-semibold ${categoryData.demoCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {categoryData.demoCount} éléments
                      </div>
                      <div className="text-gray-400 text-sm">
                        {(categoryData.totalSize / 1024).toFixed(2)}KB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Onglet Résultats */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {cleaningResults ? (
            <>
              {/* Résumé des résultats */}
              <PremiumCard>
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white text-2xl font-semibold mb-2">
                    Nettoyage terminé avec succès
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {cleaningResults.totalDeleted} éléments supprimés en {cleaningResults.duration?.toFixed(1)}s
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{cleaningResults.totalDeleted}</div>
                      <div className="text-gray-400 text-sm">Supprimés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{Object.keys(cleaningResults.errors).length}</div>
                      <div className="text-gray-400 text-sm">Erreurs</div>
                    </div>
                  </div>
                </div>
              </PremiumCard>

              {/* Détails par catégorie */}
              <PremiumCard>
                <h4 className="text-white font-medium mb-4">Détail par catégorie</h4>
                <div className="space-y-3">
                  {Object.entries(cleaningResults.deleted).map(([categoryId, count]) => {
                    const category = DEMO_CATEGORIES[categoryId];
                    const IconComponent = category?.icon || Database;
                    
                    return (
                      <div key={categoryId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-5 h-5 ${category?.color || 'text-gray-400'}`} />
                          <span className="text-white">{category?.name || categoryId}</span>
                        </div>
                        <span className="text-green-400 font-medium">{count} supprimés</span>
                      </div>
                    );
                  })}
                  
                  {Object.entries(cleaningResults.errors).map(([categoryId, error]) => {
                    const category = DEMO_CATEGORIES[categoryId];
                    const IconComponent = category?.icon || Database;
                    
                    return (
                      <div key={categoryId} className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className={`w-5 h-5 text-red-400`} />
                          <div>
                            <span className="text-white">{category?.name || categoryId}</span>
                            <p className="text-red-200 text-sm">{error}</p>
                          </div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                    );
                  })}
                </div>
              </PremiumCard>

              {/* Informations de débogage */}
              <PremiumCard>
                <h4 className="text-white font-medium mb-4">Informations de débogage</h4>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <pre className="text-gray-400 text-sm overflow-x-auto">
{JSON.stringify({
  startTime: cleaningResults.startTime,
  endTime: cleaningResults.endTime,
  duration: `${cleaningResults.duration?.toFixed(1)}s`,
  totalDeleted: cleaningResults.totalDeleted,
  errors: Object.keys(cleaningResults.errors).length
}, null, 2)}
                  </pre>
                </div>
              </PremiumCard>
            </>
          ) : (
            <PremiumCard>
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Aucun résultat disponible</h3>
                <p className="text-gray-400">
                  Effectuez un nettoyage pour voir les résultats ici
                </p>
              </div>
            </PremiumCard>
          )}
        </div>
      )}

      {/* Onglet Paramètres */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white text-lg font-semibold mb-6">Paramètres de nettoyage</h3>
            
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
