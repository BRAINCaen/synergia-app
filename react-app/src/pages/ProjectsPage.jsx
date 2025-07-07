// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// VERSION AVEC BOUTON SYNCHRONISATION - Patch rapide
// ==========================================

// Ajouter cette fonction dans ProjectsPage.jsx après loadAllData()

  // ===============================================
  // 🔄 FONCTION DE SYNCHRONISATION MANUELLE
  // ===============================================
  const handleSyncProjects = async () => {
    if (!user?.uid) return;
    
    setSubmitting(true);
    try {
      console.log('🔄 Synchronisation manuelle des projets...');
      
      // Synchroniser tous les projets de l'utilisateur
      const result = await taskProjectIntegration.syncAllUserProjects(user.uid);
      
      if (result.success) {
        console.log(`✅ Synchronisation terminée: ${result.successCount}/${result.totalProjects} projets`);
        
        // Recharger les données
        await loadAllData();
        
        alert(`✅ Synchronisation terminée !\n${result.successCount} projet(s) synchronisé(s) sur ${result.totalProjects}`);
      } else {
        throw new Error(result.error || 'Erreur de synchronisation');
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation manuelle:', error);
      alert(`❌ Erreur de synchronisation: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

// ===============================================
// 🎯 MODIFICATION DU HEADER - Ajouter le bouton
// ===============================================

// Dans le return de ProjectsPage, remplacer la section Header par :

      {/* Header avec bouton de synchronisation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Gestion de Projets
          </h1>
          <p className="text-gray-600 mt-1">
            Organisez, suivez et collaborez sur vos projets
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* NOUVEAU : Bouton de synchronisation */}
          <button
            onClick={handleSyncProjects}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            title="Synchroniser les statistiques des projets"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span>Sync</span>
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Projet
          </button>
        </div>
      </div>
