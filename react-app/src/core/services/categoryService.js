// ==========================================
// 📁 react-app/src/core/services/categoryService.js
// SERVICE RÉCUPÉRATION DES CATÉGORIES FIREBASE
// ==========================================

import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏷️ SERVICE DE GESTION DES CATÉGORIES
 * Récupère les catégories depuis Firebase
 */
class CategoryService {
  constructor() {
    this.COLLECTION_NAME = 'task_categories';
    console.log('🏷️ CategoryService initialisé');
  }

  /**
   * 📂 RÉCUPÉRER TOUTES LES CATÉGORIES ACTIVES
   */
  async getAllCategories() {
    try {
      console.log('🏷️ Récupération des catégories depuis Firebase...');
      
      const categoriesQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );
      
      const snapshot = await getDocs(categoriesQuery);
      const categories = [];
      
      snapshot.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${categories.length} catégories récupérées:`, categories.map(c => c.name));
      return categories;
      
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      
      // 🔧 FALLBACK : Catégories par défaut si Firebase échoue
      return this.getDefaultCategories();
    }
  }

  /**
   * 🔧 CATÉGORIES PAR DÉFAUT EN CAS D'ÉCHEC
   */
  getDefaultCategories() {
    console.log('🔧 Utilisation des catégories par défaut');
    
    return [
      {
        id: 'development',
        name: 'Développement',
        description: 'Tâches de développement et technique',
        icon: '💻',
        color: '#3B82F6',
        defaultXP: 50
      },
      {
        id: 'design',
        name: 'Design',
        description: 'Création graphique et UX/UI',
        icon: '🎨',
        color: '#EC4899',
        defaultXP: 40
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Rédaction et communication',
        icon: '📝',
        color: '#10B981',
        defaultXP: 30
      },
      {
        id: 'management',
        name: 'Gestion',
        description: 'Organisation et management',
        icon: '📊',
        color: '#F59E0B',
        defaultXP: 35
      },
      {
        id: 'research',
        name: 'Recherche',
        description: 'Veille et recherche d\'information',
        icon: '🔍',
        color: '#8B5CF6',
        defaultXP: 25
      },
      {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Maintenance et support technique',
        icon: '🔧',
        color: '#6B7280',
        defaultXP: 30
      }
    ];
  }

  /**
   * 🎯 RÉCUPÉRER UNE CATÉGORIE SPÉCIFIQUE
   */
  async getCategoryById(categoryId) {
    try {
      const categoryRef = doc(db, this.COLLECTION_NAME, categoryId);
      const categorySnap = await getDoc(categoryRef);
      
      if (categorySnap.exists()) {
        return {
          id: categorySnap.id,
          ...categorySnap.data()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erreur récupération catégorie:', error);
      return null;
    }
  }

  /**
   * 📊 FORMATER LES CATÉGORIES POUR LES SELECTS
   */
  formatCategoriesForSelect(categories) {
    return categories.map(category => ({
      value: category.id,
      label: `${category.icon || ''} ${category.name}`,
      color: category.color,
      defaultXP: category.defaultXP || 25
    }));
  }

  /**
   * 🏷️ CRÉER LES CATÉGORIES SI ELLES N'EXISTENT PAS
   */
  async initializeCategories() {
    try {
      console.log('🏷️ Initialisation des catégories...');
      
      // Vérifier si des catégories existent déjà
      const existingCategories = await this.getAllCategories();
      
      if (existingCategories.length > 0) {
        console.log('✅ Catégories déjà présentes, pas d\'initialisation');
        return existingCategories;
      }

      // Si aucune catégorie n'existe, retourner les catégories par défaut
      // L'initialisation réelle se fait via firebaseDataInitializer.js
      console.log('⚠️ Aucune catégorie trouvée, utilisation des catégories par défaut');
      return this.getDefaultCategories();
      
    } catch (error) {
      console.error('❌ Erreur initialisation catégories:', error);
      return this.getDefaultCategories();
    }
  }
}

// Export singleton
export const categoryService = new CategoryService();
export default categoryService;
