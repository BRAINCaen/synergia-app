// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// DÉBUT DU FICHIER CORRIGÉ - Lignes 1-50
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Briefcase,
  Link,
  Unlink,
  X
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { projectService } from '../core/services/projectService.js';
import { taskProjectIntegration } from '../core/services/taskProjectIntegration.js';
import TaskForm from '../modules/tasks/TaskForm.jsx';

/**
 * ✅ PAGE TÂCHES AVEC GESTION DE PROJETS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // États UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectAssignModal, setShowProjectAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // États intégration
  const [integrationStats, setIntegrationStats] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Charger toutes les données
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
      loadIntegrationStats();
    }
  }, [user?.uid]);

  // ... reste de votre code existant ...
