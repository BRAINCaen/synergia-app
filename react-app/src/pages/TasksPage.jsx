// ==========================================
// 🔧 CORRECTION REFERROR allTasks + IMPORTS MANQUANTS
// Fichier: react-app/src/pages/TasksPage.jsx
// Problème: ReferenceError: allTasks is not defined + getDoc manquant
// ==========================================

// ✅ CORRECTION 1: AJOUTER L'IMPORT MANQUANT getDoc
// Chercher la ligne d'import Firebase (vers le début du fichier) et ajouter getDoc :

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc  // ✅ AJOUTER CETTE LIGNE
} from 'firebase/firestore';

// ✅ CORRECTION 2: VÉRIFIER LES RÉFÉRENCES À allTasks EN DEHORS DE loadAllTasks()
// La variable allTasks ne doit être utilisée QUE dans la fonction loadAllTasks()
// Si elle est utilisée ailleurs, il faut utiliser les états myTasks, availableTasks, otherTasks

// ❌ INCORRECT (si ça existe quelque part) :
// const someFunction = () => {
//   console.log(allTasks.length); // ReferenceError !
// }

// ✅ CORRECT :
// const someFunction = () => {
//   console.log(myTasks.length + availableTasks.length + otherTasks.length);
// }

// ✅ CORRECTION 3: SI IL Y A UNE DUPLICATION DE VARIABLE allTasks
// Chercher s'il y a une déclaration de allTasks en dehors de loadAllTasks()
// Et la SUPPRIMER ou la RENOMMER pour éviter les conflits

// ==========================================
// 📋 CHECKLIST DE VÉRIFICATION:
// ==========================================

// ✅ 1. Ajouter getDoc dans les imports Firebase
// ✅ 2. Vérifier qu'aucune fonction n'utilise allTasks en dehors de loadAllTasks()
// ✅ 3. Supprimer toute déclaration de allTasks en dehors de loadAllTasks()
// ✅ 4. Utiliser myTasks, availableTasks, otherTasks pour accéder aux données
// ✅ 5. S'assurer que loadAllTasks() est appelée correctement dans useEffect

// ==========================================
// 🔧 TEMPLATE DE CORRECTION COMPLET
// ==========================================

// EN HAUT DU FICHIER (imports) :
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc  // ← AJOUTER CETTE LIGNE
} from 'firebase/firestore';

// DANS LE COMPOSANT (useEffect pour charger les données) :
useEffect(() => {
  if (user) {
    loadAllTasks(); // ← Fonction qui contient allTasks en local
  }
}, [user]);

// UTILISATION DES DONNÉES (utiliser les states, pas allTasks) :
// ✅ CORRECT :
const totalTasks = myTasks.length + availableTasks.length + otherTasks.length;

// ❌ INCORRECT :
// const totalTasks = allTasks.length; // ReferenceError !

// ==========================================
