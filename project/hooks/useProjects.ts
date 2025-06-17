import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  Timestamp,
  DocumentData,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthContext } from '@/context/AuthContext';

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  client?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: 'active' | 'completed' | 'on-hold';
  progress?: number;
  team: string[];
  tasks?: Task[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  attachments?: string[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIndexBuilding, setIsIndexBuilding] = useState(false);
  const { user } = useAuthContext();

  // Set up real-time listener for projects
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsIndexBuilding(false);

    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('team', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const projectsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];
          setProjects(projectsList);
          setLoading(false);
        },
        (err) => {
          console.error('Error in projects listener:', err);
          if (err.code === 'failed-precondition' && err.message.includes('index')) {
            setIsIndexBuilding(true);
            setError('Database index is being built. This may take a few minutes. Please refresh the page shortly.');
          } else {
            setError('Failed to fetch projects');
          }
          setLoading(false);
        }
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up projects listener:', err);
      setError('Failed to set up projects listener');
      setLoading(false);
    }
  }, [user]);

  // Create new project
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newProject = {
        ...projectData,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        team: [user.uid, ...(projectData.team || [])]
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      return {
        id: docRef.id,
        ...newProject
      };
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update project
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, 'projects', projectId);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(projectRef, updateData);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add task to project
  const addTask = async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newTask = {
        ...taskData,
        createdAt: now,
        updatedAt: now
      };

      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDocs(query(collection(db, 'projects'), where('id', '==', projectId)));
      
      if (projectDoc.empty) {
        throw new Error('Project not found');
      }

      const currentTasks = projectDoc.docs[0].data().tasks || [];
      const updatedTasks = [...currentTasks, { id: Date.now().toString(), ...newTask }];

      await updateDoc(projectRef, {
        tasks: updatedTasks,
        updatedAt: now
      });

      return { id: Date.now().toString(), ...newTask };
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDocs(query(collection(db, 'projects'), where('id', '==', projectId)));
      
      if (projectDoc.empty) {
        throw new Error('Project not found');
      }

      const currentTasks = projectDoc.docs[0].data().tasks || [];
      const updatedTasks = currentTasks.map((task: Task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      );

      await updateDoc(projectRef, {
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (projectId: string, taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDocs(query(collection(db, 'projects'), where('id', '==', projectId)));
      
      if (projectDoc.empty) {
        throw new Error('Project not found');
      }

      const currentTasks = projectDoc.docs[0].data().tasks || [];
      const updatedTasks = currentTasks.filter((task: Task) => task.id !== taskId);

      await updateDoc(projectRef, {
        tasks: updatedTasks,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    isIndexBuilding,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask
  };
}