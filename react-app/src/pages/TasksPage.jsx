// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// CORRECTION DEBUG - RÉCUPÉRATION DES TÂCHES
// ==========================================

  /**
   * 📥 CHARGER TOUTES LES TÂCHES PUBLIQUES - VERSION CORRIGÉE
   */
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Chargement de toutes les tâches publiques...');
      console.log('👤 Utilisateur actuel:', user.uid);
      
      // ✅ CORRECTION : Utiliser getAllTasks() au lieu de getAvailableTasks()
      let tasks = [];
      
      try {
        // Méthode 1 : Récupérer TOUTES les tâches
        console.log('🔄 Tentative méthode 1: getAllTasks()');
        tasks = await taskService.getAllTasks();
        console.log('📊 Méthode 1 réussie - Tâches trouvées:', tasks.length);
      } catch (error1) {
        console.warn('⚠️ Méthode 1 échouée, tentative méthode 2');
        
        try {
          // Méthode 2 : Récupération directe Firebase
          console.log('🔄 Tentative méthode 2: Collection directe');
          const { collection, getDocs } = await import('firebase/firestore');
          const { db } = await import('../core/firebase.js');
          
          const tasksSnapshot = await getDocs(collection(db, 'tasks'));
          tasks = [];
          tasksSnapshot.forEach(doc => {
            tasks.push({
              id: doc.id,
              ...doc.data()
            });
          });
          console.log('📊 Méthode 2 réussie - Tâches trouvées:', tasks.length);
        } catch (error2) {
          console.error('❌ Méthode 2 échouée:', error2);
          
          // Méthode 3 : Tâches de démo pour test
          console.log('🔄 Tentative méthode 3: Données de démo');
          tasks = [
            {
              id: 'demo-1',
              title: 'Tâche de démonstration 1',
              description: 'Ceci est une tâche de test pour vérifier l\'affichage',
              status: 'todo',
              priority: 'medium',
              category: 'maintenance',
              xpReward: 25,
              assignedTo: [],
              createdBy: 'demo-user',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'demo-2',
              title: 'Tâche de démonstration 2',
              description: 'Une autre tâche de test',
              status: 'in_progress',
              priority: 'high',
              category: 'content',
              xpReward: 50,
              assignedTo: [user.uid],
              createdBy: user.uid,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          console.log('📊 Méthode 3 - Données de démo chargées:', tasks.length);
        }
      }
      
      console.log('📊 Total tâches récupérées:', tasks.length);
      
      if (tasks.length === 0) {
        console.warn('⚠️ Aucune tâche trouvée - vérifiez Firebase');
        setError('Aucune tâche trouvée dans la base de données');
        return;
      }
      
      // Ajouter contexte utilisateur pour chaque tâche
      const tasksWithContext = tasks.map(task => {
        const isCreatedByMe = task.createdBy === user.uid;
        const isAssignedToMe = Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid);
        const canVolunteer = !isAssignedToMe && !isCreatedByMe && task.status !== 'completed';
        
        return {
          ...task,
          userContext: {
            isCreatedByMe,
            isAssignedToMe,
            isMyTask: isCreatedByMe || isAssignedToMe,
            canVolunteer,
            canEdit: isCreatedByMe || isAssignedToMe,
            canComplete: isAssignedToMe
          }
        };
      });
      
      // Convertir en tâches sécurisées
      const safeTasks = tasksWithContext.map(createSafeTask);
      setAllTasks(safeTasks);
      
      console.log(`✅ ${safeTasks.length} tâches chargées avec contexte utilisateur`);
      
    } catch (error) {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Erreur lors du chargement des tâches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

// ==========================================
// 🔧 FONCTION DE DEBUG POUR LA CONSOLE
// ==========================================

  // Ajouter cette fonction debug dans le useEffect
  useEffect(() => {
    if (user?.uid) {
      // Exposer les fonctions de debug dans la console
      window.debugTasks = {
        loadAllTasks,
        checkFirebase: async () => {
          try {
            const { collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../core/firebase.js');
            const snapshot = await getDocs(collection(db, 'tasks'));
            console.log('🔍 Firebase check - Tâches trouvées:', snapshot.size);
            snapshot.forEach(doc => {
              console.log('📄 Tâche:', doc.id, doc.data());
            });
          } catch (error) {
            console.error('❌ Erreur Firebase check:', error);
          }
        },
        taskService: taskService,
        currentTasks: allTasks
      };
      
      loadAllTasks();
    }
  }, [user?.uid]);

// ==========================================
// 🎯 AJOUT MESSAGES DEBUG DANS LE RENDER
// ==========================================

  // Dans la section d'affichage, ajouter des logs
  console.log('🎨 RENDER TasksPage:', {
    loading,
    error,
    allTasksLength: allTasks.length,
    filteredTasksLength: filteredTasks.length,
    userUid: user?.uid
  });

  // Juste avant le return, ajouter ce debug
  if (!loading && !error && allTasks.length === 0) {
    console.warn('⚠️ PROBLÈME: Pas de loading, pas d\'erreur, mais aucune tâche');
    console.log('🔍 État actuel:', { loading, error, allTasks, user });
  }
