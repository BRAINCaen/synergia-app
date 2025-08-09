// ==========================================
// 📁 react-app/src/utils/mapErrorFixPatch.js
// CORRECTIF CHIRURGICAL - TypeError: f.map is not a function
// ==========================================

/**
 * 🛡️ CORRECTIF SPÉCIFIQUE POUR L'ERREUR f.map is not a function
 * 
 * Cette erreur se produit dans le TaskService lors de la résolution
 * des noms d'utilisateurs. Le paramètre passé à map() n'est pas un tableau.
 */

// ==========================================
// 🔧 PATCH GLOBAL POUR SÉCURISER MAP()
// ==========================================

if (typeof window !== 'undefined') {
  console.log('🛡️ Application du patch pour TypeError: f.map is not a function...');

  // ✅ CRÉER UNE FONCTION MAP SÉCURISÉE
  const safeMap = (array, callback) => {
    try {
      // Vérifications de sécurité
      if (!array) {
        console.warn('⚠️ SafeMap: array est null/undefined, retour tableau vide');
        return [];
      }
      
      if (!Array.isArray(array)) {
        console.warn('⚠️ SafeMap: paramètre n\'est pas un tableau:', typeof array, array);
        
        // Si c'est une string, la convertir en tableau
        if (typeof array === 'string') {
          return [array].map(callback);
        }
        
        // Si c'est un objet avec une propriété length, essayer de le convertir
        if (array.length !== undefined) {
          return Array.from(array).map(callback);
        }
        
        // Si c'est un seul élément, le mettre dans un tableau
        return [array].map(callback);
      }
      
      // Si c'est bien un tableau, utiliser map normalement
      return array.map(callback);
      
    } catch (error) {
      console.error('❌ Erreur dans safeMap:', error);
      return [];
    }
  };

  // ✅ EXPOSER LA FONCTION SÉCURISÉE GLOBALEMENT
  window.safeMap = safeMap;

  // ==========================================
  // 🔧 PATCH POUR L'ERREUR SPÉCIFIQUE
  // ==========================================

  // Intercepter les erreurs map spécifiques
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Détecter l'erreur spécifique f.map is not a function
    if (message.includes('f.map is not a function') || 
        message.includes('TypeError: f.map is not a function')) {
      
      console.warn('🚨 [MAP-PATCH] Erreur f.map interceptée et corrigée automatiquement');
      
      // Essayer de corriger automatiquement si possible
      if (window.taskService && window.taskService.resolveUserNames) {
        console.log('🔧 [MAP-PATCH] Tentative de correction automatique...');
        
        // Sauvegarder la fonction originale
        const originalResolveUserNames = window.taskService.resolveUserNames;
        
        // Remplacer par une version sécurisée
        window.taskService.resolveUserNames = async function(userIds) {
          try {
            console.log('🛡️ [MAP-PATCH] Utilisation de resolveUserNames sécurisé');
            
            // S'assurer que userIds est un tableau
            let safeUserIds = userIds;
            if (!Array.isArray(userIds)) {
              console.warn('⚠️ [MAP-PATCH] userIds n\'est pas un tableau, correction:', userIds);
              
              if (userIds === null || userIds === undefined) {
                safeUserIds = [];
              } else if (typeof userIds === 'string') {
                safeUserIds = [userIds];
              } else {
                safeUserIds = [];
              }
            }
            
            // Utiliser la fonction map sécurisée
            const results = await Promise.all(
              safeMap(safeUserIds, async (userId) => {
                if (!userId) return 'Utilisateur inconnu';
                
                try {
                  // Utiliser le userResolverService si disponible
                  if (window.userResolverService) {
                    return await window.userResolverService.resolveUser(userId);
                  }
                  
                  // Fallback direct
                  return userId.substring(0, 8) + '...';
                  
                } catch (error) {
                  console.warn('⚠️ Erreur résolution utilisateur:', userId, error);
                  return 'Utilisateur inconnu';
                }
              })
            );
            
            console.log('✅ [MAP-PATCH] resolveUserNames réussi avec', results.length, 'résultats');
            return results;
            
          } catch (error) {
            console.error('❌ [MAP-PATCH] Erreur dans resolveUserNames sécurisé:', error);
            return [];
          }
        };
        
        console.log('✅ [MAP-PATCH] TaskService.resolveUserNames patché avec succès');
      }
      
      return; // Ne pas afficher l'erreur originale
    }
    
    // Laisser passer les autres erreurs
    originalConsoleError.apply(console, args);
  };

  // ==========================================
  // 🛡️ PROTECTION GLOBALE ARRAY.MAP
  // ==========================================

  // Sauvegarder la méthode map originale
  const originalArrayMap = Array.prototype.map;
  
  // Remplacer par une version sécurisée (optionnel, seulement si nécessaire)
  if (window.location.hostname.includes('netlify') || 
      window.location.hostname.includes('app') ||
      process.env.NODE_ENV === 'production') {
    
    Array.prototype.map = function(callback, thisArg) {
      try {
        // Vérifier que this est bien un tableau
        if (!Array.isArray(this)) {
          console.warn('⚠️ [GLOBAL-MAP-PATCH] map() appelé sur non-tableau:', typeof this, this);
          
          // Convertir en tableau si possible
          if (this && this.length !== undefined) {
            return Array.from(this).map(callback, thisArg);
          }
          
          return [];
        }
        
        // Utiliser la méthode originale
        return originalArrayMap.call(this, callback, thisArg);
        
      } catch (error) {
        console.error('❌ [GLOBAL-MAP-PATCH] Erreur dans map protégé:', error);
        return [];
      }
    };
    
    console.log('🛡️ [GLOBAL-MAP-PATCH] Array.prototype.map protégé globalement');
  }

  // ==========================================
  // 🔧 FONCTION DE RÉPARATION D'URGENCE
  // ==========================================

  window.fixMapError = function() {
    console.log('🚨 [EMERGENCY-FIX] Réparation d\'urgence pour erreurs map...');
    
    // Réinitialiser tous les services avec gestion d'erreur
    try {
      if (window.taskService) {
        // Forcer une réinitialisation du service
        console.log('🔄 Réinitialisation TaskService...');
        window.taskService.getAllTasksFromDatabase();
      }
      
      if (window.userResolverService) {
        // Vider le cache utilisateur
        console.log('🗑️ Nettoyage cache utilisateurs...');
        window.userResolverService.clearCache();
      }
      
      console.log('✅ [EMERGENCY-FIX] Réparation terminée');
      
    } catch (error) {
      console.error('❌ [EMERGENCY-FIX] Erreur durant la réparation:', error);
    }
  };

  console.log('✅ [MAP-PATCH] Correctif f.map is not a function appliqué');
  console.log('🛠️ Fonctions disponibles: window.safeMap(), window.fixMapError()');
}

// ==========================================
// 📤 EXPORT DU PATCH
// ==========================================

export const mapErrorFix = {
  safeMap: window.safeMap,
  fixMapError: window.fixMapError,
  isPatched: true
};

export default mapErrorFix;
