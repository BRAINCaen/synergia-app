import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../shared/config/firebase';

// Collections Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  USERS: 'users'
};
