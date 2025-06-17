import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuthContext } from '@/context/AuthContext';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  voiceNote?: {
    url: string;
    duration: number;
  };
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchTasks = async () => {
    if (!user || !projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, projectId]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!taskData.projectId) {
      throw new Error('Project ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newTask = {
        ...taskData,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        status: taskData.status || 'todo',
        assignedTo: taskData.assignedTo || user.uid,
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      const createdTask = { id: docRef.id, ...newTask } as Task;
      
      setTasks(prev => [createdTask, ...prev]);
      return createdTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (taskId: string, text: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const newComment: TaskComment = {
        id: Date.now().toString(),
        text,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now
      };

      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedComments = [...(task.comments || []), newComment];
      await updateTask(taskId, { comments: updatedComments });

      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (taskId: string, commentId: string, text: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const comments = task.comments || [];
      const updatedComments = comments.map(comment =>
        comment.id === commentId
          ? { ...comment, text, updatedAt: new Date().toISOString() }
          : comment
      );

      await updateTask(taskId, { comments: updatedComments });
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (taskId: string, commentId: string) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const comments = task.comments || [];
      const updatedComments = comments.filter(comment => comment.id !== commentId);

      await updateTask(taskId, { comments: updatedComments });
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    updateComment,
    deleteComment,
    refreshTasks: fetchTasks
  };
}